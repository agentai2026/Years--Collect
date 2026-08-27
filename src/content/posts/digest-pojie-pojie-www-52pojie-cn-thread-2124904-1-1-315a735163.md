---
title: "视频增强小工具 - 基于AI模型"
published: 2026-08-26
description: "视频增强小工具 - 基于AI模型"
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "psqladm"
sourceLink: "https://www.52pojie.cn/thread-2124904-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2124904-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

视频增强小工具 - 基于AI模型

运行界面如图：

一、运行依赖：

1、FFMPEG.exe， FFPROBE.exe;

2、realesrgan-ncnn-vulkan开源模型。

     https://github.com/xinntao/Real-ESRGAN

二、工作流程：

ffmpeg拆分成单帧 ---->预处理（去噪、去伪影）---->AI模型增强----> 精调（色彩、锐化）---->合成视频（无音频）---->抽取原输入文件音频---->合成完整视频

工作量比较大，尤其是AI模型增强部分，虽然采取了多进程，比较耗时，做好心理准备。

提醒：

1、三个模型，使用缺省模型，适应大多数情况。其他模型，精度提高的同时，耗时成倍增长。

2、参数调节部分，使用缺省值，适应大多数情况，谨慎调整，除非明白调整后的效果。

3、AI增强使用CPU还是GPU，由模型自行选择，参数为"-g", "auto"，方便只有集成显卡的，也可以跑通程序。有独立显卡的， 也可以自己指定如"-g", "0"。

4、视频文件最好放在固态硬盘上，因为I/O吞吐量实在太大，放在机械硬盘上，严重限制速度。

5、应坛友要求，加入音量调节功能，但是音量超过1.5X，有可能会爆音或失真。

感谢那些提供思路和意见，以及帮助的坛友！

成品软件、模型文件及ffmpeg见一下链接，模型文夹件及ffmpeg文件夹，请放在C盘根目录下。

通过网盘分享的文件：视频增强工具

链接: https://pan.baidu.com/s/18s6j-BU2CEqfJWJimW74eA?pwd=52pj 提取码: 52pj

[Python] *纯文本查看* *复制代码*

# -*- coding=utf-8 -*-

import json
import math
import os
import shutil
import signal
import subprocess
import sys
import threading
import time
from collections import deque
from queue import Queue, Empty

from PyQt5.QtCore import Qt, QThread, pyqtSignal, QTimer
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, QGridLayout,
    QPushButton, QListWidget, QFileDialog, QGroupBox, QCheckBox, QLabel,
    QProgressBar, QPlainTextEdit, QLineEdit, QMessageBox, QComboBox,
    QSlider, QFormLayout,
)

# ==================== 路径 ====================
REALESRGAN_PATH = r"c:\realesrgan-ncnn-vulkan\realesrgan-ncnn-vulkan.exe"
FFMPEG_PATH = r"C:\ffmpeg\bin\ffmpeg"
FFPROBE_PATH = r"C:\ffmpeg\bin\ffprobe"
DEFAULT_OUTPUT_DIR = r"C:\Restored_Videos"

# ==================== 模型 ====================
MODELS = [
    ("realesr-animevideov3", "RealESRGAN AnimeVideoV3"),
    ("realesrgan-x4plus", "RealESRGAN x4+"),
    ("realesrgan-x4plus-anime", "RealESRGAN x4+ Anime"),
]

# ==================== 后处理缺省参数 ====================
DEFAULT_POST_PARAMS = {
    "dn_spatial":    4,      # hqdn3d 空间降噪   范围 0-10
    "dn_temporal":   3,      # hqdn3d 时间降噪   范围 0-8
    "deblock_mode":  "strong",  # deblock 模式    weak / strong
    "deblock_block": 8,      # deblock 块大小     范围 4-16
    "contrast":      1.08,   # eq 对比度          范围 0.50-2.00
    "saturation":    1.15,   # eq 饱和度          范围 0.50-2.50
    "brightness":    0.02,   # eq 亮度            范围 -0.50~0.50
    "sharp_luma":    1.5,    # unsharp 亮度锐化   范围 0.0-3.0
    "sharp_chroma":  1.0,    # unsharp 色度锐化   范围 0.0-3.0
    "volume":        1.0,    # 音频音量倍数   范围 0.0-3.0 (1.0=原始音量, &#9888;&#65039; 音量 > 1.5x 可能导致爆音、音频失真)
}

def _resolve_tool(path):
    if not path:
        return ""
    for p in (path, path + ".exe"):
        if os.path.exists(p):
            return p
    return shutil.which(os.path.basename(path)) or path

FFMPEG_PATH = _resolve_tool(FFMPEG_PATH)
FFPROBE_PATH = _resolve_tool(FFPROBE_PATH)
REALESRGAN_PATH = _resolve_tool(REALESRGAN_PATH)

N_WORKERS = max(1, (os.cpu_count() or 4) // 4)

def startupinfo():
    if os.name == "nt":
        si = subprocess.STARTUPINFO()
        si.dwFlags |= subprocess.STARTF_USESHOWWINDOW
        si.wShowWindow = 0
        return si
    return None

# ==================== Worker ====================
class UtilityWorker(QThread):
    log_signal = pyqtSignal(str)
    finished_signal = pyqtSignal(bool, str)

    def __init__(self, func, parent=None):
        super().__init__(parent)
        self.func = func

    def run(self):
        try:
            msg = self.func() or "完成"
            self.log_signal.emit(str(msg))
            self.finished_signal.emit(True, str(msg))
        except Exception as e:
            self.log_signal.emit(f"&#10060; {e}")
            self.finished_signal.emit(False, str(e))

class WorkerThread(QThread):
    progress_signal = pyqtSignal(int, str)
    log_signal = pyqtSignal(str)
    finished_signal = pyqtSignal(bool, str)

    def __init__(self, file_list, output_dir, scale, model, options, post_params=None):
        super().__init__()
        self.file_list = list(file_list)
        self.output_dir = output_dir
        self.scale = max(1, int(scale))
        self.model = model or ""
        self.options = options or {}
        self.post_params = post_params or dict(DEFAULT_POST_PARAMS)

        self._stop = threading.Event()
        self._procs = []
        self._lock = threading.Lock()
        self._finished_emitted = False

    # ---------------- 基础控制 ----------------

    def _emit_finished(self, ok, msg):
        if self._finished_emitted:
            return
        self._finished_emitted = True
        self.finished_signal.emit(ok, msg)

    def stop(self):
        if self._stop.is_set():
            return
        self._stop.set()
        self.log_signal.emit("&#9888;&#65039; 正在终止所有子进程...")
        self._kill_all(wait=True)

    def _launch(self, cmd, capture=False):
        kwargs = {}

        if os.name == "nt":
            si = startupinfo()
            if si is not None:
                kwargs["startupinfo"] = si
        else:
            kwargs["preexec_fn"] = os.setsid

        if capture:
            proc = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                encoding="utf-8",
                errors="ignore",
                **kwargs
            )
        else:
            proc = subprocess.Popen(
                cmd,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                **kwargs
            )

        with self._lock:
            self._procs.append(proc)

        return proc

    def _untrack(self, proc):
        with self._lock:
            if proc in self._procs:
                self._procs.remove(proc)

    def _kill_proc(self, proc, wait=True):
        if proc is None:
            return

        if proc.poll() is not None:
            return

        if os.name == "nt":
            try:
                subprocess.Popen(
                    ["taskkill", "/PID", str(proc.pid), "/T", "/F"],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL
                )
            except Exception:
                try:
                    proc.terminate()
                except Exception:
                    pass
        else:
            try:
                pgid = os.getpgid(proc.pid)
                os.killpg(pgid, signal.SIGTERM)
            except Exception:
                try:
                    proc.terminate()
                except Exception:
                    pass

        if not wait:
            return

        try:
            proc.wait(timeout=2)
        except subprocess.TimeoutExpired:
            if os.name != "nt":
                try:
                    pgid = os.getpgid(proc.pid)
                    os.killpg(pgid, signal.SIGKILL)
                except Exception:
                    pass
            try:
                proc.kill()
                proc.wait(timeout=2)
            except Exception:
                pass

    def _kill_all(self, wait=True):
        """一次性把所有子进程（包括 AI、ffmpeg）杀掉并清空列表。"""
        with self._lock:
            procs = list(self._procs)

        # 先发送 SIGTERM / taskkill，随后统一等待/强杀
        for p in procs:
            self._kill_proc(p, wait=False)

        if wait:
            for p in procs:
                try:
                    p.wait(timeout=3)
                except subprocess.TimeoutExpired:
                    self._kill_proc(p, wait=True)

        with self._lock:
            self._procs.clear()

    # ---------------- 文件统计 ----------------

    @staticmethod
    def _list_png(directory):
        if not os.path.isdir(directory):
            return []
        try:
            return sorted(
                f for f in os.listdir(directory)
                if f.lower().endswith(".png")
            )
        except OSError:
            return []

    @staticmethod
    def _count_png(directory):
        if not os.path.isdir(directory):
            return 0
        try:
            return sum(
                1 for entry in os.scandir(directory)
                if entry.name.lower().endswith(".png")
            )
        except OSError:
            return 0

    @staticmethod
    def _free_disk(path):
        try:
            return shutil.disk_usage(path).free
        except Exception:
            return 0

    @staticmethod
    def _estimate_disk(w, h, scale, frames):
        if frames  0 else 0

        except subprocess.TimeoutExpired:
            self.log_signal.emit("&#9888;&#65039; ffprobe 超时，使用默认 30fps")
        except Exception as e:
            self.log_signal.emit(f"&#9888;&#65039; 获取视频信息失败: {e}")

        return fps, w, h, nf

    def _has_audio(self, path):
        try:
            out = subprocess.check_output(
                [
                    FFPROBE_PATH,
                    "-v", "error",
                    "-select_streams", "a",
                    "-show_entries", "stream=index",
                    "-of", "csv=p=0",
                    path
                ],
                stderr=subprocess.DEVNULL,
                text=True,
                encoding="utf-8",
                errors="ignore",
                timeout=30
            )
            return bool(out.strip())
        except Exception:
            return False

    # ---------------- FFmpeg 滤镜 ----------------

    def _build_ffmpeg_filters(self):
        p = self.post_params
        vf_parts = []

        if self.options.get("denoise"):
            s = float(p.get("dn_spatial", 4))
            t = float(p.get("dn_temporal", 3))
            vf_parts.append(f"hqdn3d={s:g}:{s:g}:{t:g}:{t:g}")

        if self.options.get("artifact"):
            mode = str(p.get("deblock_mode", "strong")).lower()
            if mode not in ("weak", "medium", "strong"):
                mode = "strong"

            block = int(p.get("deblock_block", 8))
            allowed = (4, 8, 16)
            block = min(allowed, key=lambda x: abs(x - block))

            vf_parts.append(f"deblock=filter={mode}:block={block}")

        if self.options.get("color"):
            contrast = float(p.get("contrast", 1.08))
            saturation = float(p.get("saturation", 1.15))
            brightness = float(p.get("brightness", 0.02))
            vf_parts.append(
                f"eq=contrast={contrast:.2f}"
                f":saturation={saturation:.2f}"
                f":brightness={brightness:.2f}"
            )

        if self.options.get("sharpen"):
            sharp_luma = float(p.get("sharp_luma", 1.5))
            sharp_chroma = float(p.get("sharp_chroma", 1.0))
            vf_parts.append(
                f"unsharp=5:5:{sharp_luma:.1f}"
                f":5:5:{sharp_chroma:.1f}"
            )

        return ",".join(vf_parts) if vf_parts else ""

    # ---------------- 命令执行 ----------------

    def _run_cmd(self, cmd, silent=False, out_dir=None, total=0, label=""):
        proc = self._launch(cmd, capture=True)
        q = Queue(maxsize=2048)

        def reader():
            try:
                for line in proc.stdout:
                    q.put(line)
            except Exception:
                pass
            finally:
                q.put(None)

        reader_thread = threading.Thread(target=reader, daemon=True)
        reader_thread.start()

        lines = deque(maxlen=100)
        last_progress_time = 0.0

        try:
            while True:
                if self._stop.is_set():
                    raise InterruptedError("用户停止")

                if out_dir and total > 0 and time.time() - last_progress_time >= 0.5:
                    cnt = self._count_png(out_dir)
                    pct = int(cnt / max(total, 1) * 100)
                    self.progress_signal.emit(
                        pct,
                        f"{label}: {cnt}/{total} ({pct}%)"
                    )
                    last_progress_time = time.time()

                try:
                    line = q.get(timeout=0.2)
                except Empty:
                    if proc.poll() is not None:
                        break
                    continue

                if line is None:
                    break

                txt = line.strip()
                if txt and not silent:
                    lines.append(txt)

            reader_thread.join(timeout=2)
            rc = proc.wait()

            if self._stop.is_set():
                raise InterruptedError("用户停止")

            return rc, "\n".join(lines)

        except InterruptedError:
            self._kill_proc(proc, wait=True)
            raise
        except Exception:
            self._kill_proc(proc, wait=True)
            raise
        finally:
            self._untrack(proc)

    # ---------------- 帧序列工具 ----------------

    def _move_to_sequential(self, src_dir, dst_dir):
        files = self._list_png(src_dir)
        os.makedirs(dst_dir, exist_ok=True)

        for idx, f in enumerate(files, 1):
            src = os.path.join(src_dir, f)
            dst = os.path.join(dst_dir, f"frame_{idx:08d}.png")
            try:
                os.replace(src, dst)  # atomic on most platforms
            except OSError:
                shutil.move(src, dst)
        return len(files)

    # ---------------- AI 阶段 ----------------

    def _run_ai(self, work_dir, src_dir, frames, dst_dir, orig_w, orig_h, out_w, out_h, tile):
        actual = len(frames)
        if actual == 0:
            raise RuntimeError("AI输入帧为空")

        chunks = []
        procs = []
        t0 = time.time()

        try:
            if not self.model:
                raise RuntimeError("未选择AI模型")

            n_workers = min(N_WORKERS, actual)
            chunk_size = max(1, math.ceil(actual / max(1, n_workers)))

            for i in range(n_workers):
                s = i * chunk_size
                e = min((i + 1) * chunk_size, actual)
                if s >= actual:
                    break

                cin = os.path.join(work_dir, f"cin_{i}")
                cout = os.path.join(work_dir, f"cout_{i}")
                os.makedirs(cin, exist_ok=True)
                os.makedirs(cout, exist_ok=True)

                for f in frames[s:e]:
                    src = os.path.join(src_dir, f)
                    dst = os.path.join(cin, f)
                    try:
                        os.link(src, dst)
                    except OSError:
                        shutil.copy2(src, dst)

                chunks.append((i, cin, cout, e - s))

            self.log_signal.emit(
                f"&#128640; AI修复: {len(chunks)}进程 × CPU | 模型: {self.model} | "
                f"Tile={tile} | 输出约{out_w}x{out_h}"
            )

            for idx, cin, cout, cnt in chunks:
                if self._stop.is_set():
                    raise InterruptedError("用户停止")

                cmd = [
                    REALESRGAN_PATH,
                    "-i", cin,
                    "-o", cout,
                    "-n", self.model,
                    "-t", str(tile),
                    "-j", "1:1:1",
                    "-f", "png",
                    "-g", "auto"
                ]

                if self.scale > 1:
                    cmd += ["-s", str(self.scale)]

                proc = self._launch(cmd, capture=False)
                procs.append((idx, proc, cout, cnt))
                self.log_signal.emit(
                    f"   &#9654; Chunk {idx + 1}/{len(chunks)} "
                    f"PID:{proc.pid} ({cnt}帧)"
                )

            while procs and not self._stop.is_set():
                time.sleep(0.5)

                done_total = 0
                still = []
                fail_msg = None

                for idx, proc, cout, cnt in procs:
                    if proc.poll() is not None:
                        rc = proc.returncode
                        out_n = self._count_png(cout)
                        done_total += out_n
                        self._untrack(proc)

                        if rc != 0:
                            fail_msg = f"Chunk {idx + 1} 失败(退出码{rc})"
                            break

                        self.log_signal.emit(
                            f"   &#9989; Chunk {idx + 1}/{len(chunks)} 完成 | {out_n}帧"
                        )
                    else:
                        done_total += self._count_png(cout)
                        still.append((idx, proc, cout, cnt))

                if fail_msg:
                    raise RuntimeError(fail_msg)

                procs = still

                elapsed = time.time() - t0
                speed = done_total / max(elapsed, 0.01)
                eta = (actual - done_total) / max(speed, 0.001) if speed > 0 else 0
                pct = int(done_total / max(actual, 1) * 100)

                self.progress_signal.emit(
                    pct,
                    f"AI增强: {done_total}/{actual}帧 ({pct}%) | "
                    f"{speed:.1f}帧/s | ETA {eta:.0f}s"
                )

            if self._stop.is_set():
                for _, p, _, _ in procs:
                    self._kill_proc(p, wait=True)
                raise InterruptedError("用户停止")

            ai_out = os.path.join(work_dir, "ai_out")
            os.makedirs(ai_out, exist_ok=True)

            for _, _, cout, _ in chunks:
                for f in self._list_png(cout):
                    shutil.move(
                        os.path.join(cout, f),
                        os.path.join(ai_out, f)
                    )

            total_ai = self._move_to_sequential(ai_out, dst_dir)

            if total_ai != actual:
                raise RuntimeError(
                    f"AI输出帧数不完整: {total_ai}/{actual}"
                )

            cost = time.time() - t0
            self.log_signal.emit(
                f"&#9989; AI完成: {total_ai}帧 | {cost:.1f}s | "
                f"{total_ai / max(cost, 0.01):.1f}帧/s"
            )
            self.progress_signal.emit(100, f"AI完成: {total_ai}帧")

        except Exception:
            for _, p, _, _ in procs:
                self._kill_proc(p, wait=True)
            raise

        finally:
            for _, cin, cout, _ in chunks:
                shutil.rmtree(cin, ignore_errors=True)
                shutil.rmtree(cout, ignore_errors=True)

            # 清理 AI 汇总临时目录
            shutil.rmtree(os.path.join(work_dir, "ai_out"), ignore_errors=True)

    # ---------------- 主流程 ----------------

    def run(self):
        total_videos = len(self.file_list)
        need_ai = bool(self.options.get("ai"))
        need_ffmpeg_filter = bool(
            self.options.get("denoise")
            or self.options.get("artifact")
            or self.options.get("color")
            or self.options.get("sharpen")
        )

        if need_ai:
            ai_scale = self.scale if self.scale > 1 else 2
        else:
            ai_scale = 1

        eff_scale = ai_scale

        steps = ["提取帧"]
        if need_ai:
            steps.append("AI修复")
        if need_ffmpeg_filter:
            steps.append("FFmpeg后处理")
        steps.append("合并视频")

        try:
            os.makedirs(self.output_dir, exist_ok=True)
        except Exception as e:
            self.log_signal.emit(f"&#10060; 输出目录不可写: {e}")
            self._emit_finished(False, "输出目录不可写")
            return

        for vid_idx, path in enumerate(self.file_list):
            if self._stop.is_set():
                break

            base = os.path.basename(path)
            self.log_signal.emit(f"&#127916; [{vid_idx + 1}/{total_videos}] {base}")

            if not os.path.exists(path):
                self.log_signal.emit(f"&#9888;&#65039; 文件不存在: {path}")
                self._emit_finished(False, f"{base} 不存在")
                return

            work_dir = os.path.join(
                self.output_dir,
                f"_work_{vid_idx}_{os.getpid()}_{int(time.time())}"
            )

            try:
                fps, w, h, total_frames = self.get_video_info(path)

                if w  1:
                        active_features.append(f"AI({self.model}) {self.scale}x超分")
                    else:
                        active_features.append(f"AI({self.model}) 默认2x")

                feat_str = " + ".join(active_features) if active_features else "仅重编码"

                self.log_signal.emit(
                    f"&#128208; {w}x{h}@{fps}fps | ~{total_frames}帧 | "
                    f"输出{out_w}x{out_h} | Tile={tile} | &#128295; {feat_str}"
                )

                free = self._free_disk(self.output_dir)
                est = self._estimate_disk(w, h, eff_scale, total_frames or 1)
                if free and est > free:
                    self.log_signal.emit(
                        f"&#9888;&#65039; 空间可能不足: 估算约{est / (1024 ** 3):.1f}GB, "
                        f"可用{free / (1024 ** 3):.1f}GB"
                    )

                # ---------------- Step 1: 提取帧 ----------------
                step_idx = 1
                self.progress_signal.emit(
                    0,
                    f"Step {step_idx}/{len(steps)}: 提取帧..."
                )

                safe_dir = os.path.join(work_dir, "safe")
                os.makedirs(safe_dir, exist_ok=True)

                cmd_extract = [
                    FFMPEG_PATH,
                    "-y",
                    "-i", path,
                    "-pix_fmt", "rgb24",
                    "-compression_level", "1",
                    os.path.join(safe_dir, "frame_%08d.png")
                ]

                ret, _ = self._run_cmd(
                    cmd_extract,
                    out_dir=safe_dir,
                    total=total_frames,
                    label="提取帧"
                )

                if ret != 0:
                    raise RuntimeError("帧提取失败")

                frames = self._list_png(safe_dir)
                actual = len(frames)

                if actual == 0:
                    raise RuntimeError("未提取到帧")

                self.log_signal.emit(f"&#9989; 提取: {actual}帧")
                current_dir = safe_dir

                # ---------------- Step 2: AI增强 ----------------
                if need_ai:
                    step_idx += 1
                    self.progress_signal.emit(
                        0,
                        f"Step {step_idx}/{len(steps)}: AI修复..."
                    )

                    ai_seq_dir = os.path.join(work_dir, "ai_seq")
                    self._run_ai(
                        work_dir=work_dir,
                        src_dir=safe_dir,
                        frames=frames,
                        dst_dir=ai_seq_dir,
                        orig_w=w,
                        orig_h=h,
                        out_w=out_w,
                        out_h=out_h,
                        tile=tile
                    )

                    # AI 完成后，原始帧不再需要，及时释放磁盘
                    shutil.rmtree(safe_dir, ignore_errors=True)
                    current_dir = ai_seq_dir

                # ---------------- Step 3: FFmpeg 后处理 ----------------
                if need_ffmpeg_filter:
                    step_idx += 1
                    vf = self._build_ffmpeg_filters()

                    self.log_signal.emit(f"&#127912; FFmpeg后处理: {vf}")
                    self.progress_signal.emit(
                        0,
                        f"Step {step_idx}/{len(steps)}: FFmpeg后处理..."
                    )

                    filtered_dir = os.path.join(work_dir, "filtered_seq")
                    os.makedirs(filtered_dir, exist_ok=True)

                    src_count = len(self._list_png(current_dir))
                    if src_count == 0:
                        raise RuntimeError("后处理输入帧为空")

                    # hqdn3d 时间降噪
                    cmd_filter = [
                        FFMPEG_PATH,
                        "-y",
                        "-framerate", str(fps),
                        "-i", os.path.join(current_dir, "frame_%08d.png"),
                        "-vf", vf,
                        "-pix_fmt", "rgb24",
                        "-compression_level", "1",
                        os.path.join(filtered_dir, "frame_%08d.png")
                    ]

                    ret, filter_output = self._run_cmd(
                        cmd_filter,
                        out_dir=filtered_dir,
                        total=src_count,
                        label="FFmpeg后处理"
                    )

                    if ret != 0:
                        self.log_signal.emit(
                            f"&#10060; FFmpeg后处理错误:\n{filter_output[-800:]}"
                        )
                        raise RuntimeError("FFmpeg后处理失败")

                    filtered_count = len(self._list_png(filtered_dir))
                    if filtered_count != src_count:
                        raise RuntimeError(
                            f"FFmpeg后处理帧数不完整: {filtered_count}/{src_count}"
                        )

                    self.log_signal.emit(
                        f"&#9989; FFmpeg后处理: {filtered_count}帧"
                    )

                    # 后处理完成后，源帧不再需要，及时释放磁盘
                    if os.path.isdir(current_dir):
                        shutil.rmtree(current_dir, ignore_errors=True)

                    current_dir = filtered_dir

                # ---------------- Step 4: 合并视频 ----------------
                step_idx += 1
                self.progress_signal.emit(
                    0,
                    f"Step {step_idx}/{len(steps)}: 合并视频..."
                )

                merge_dir = os.path.join(work_dir, "merge_seq")
                final_count = self._move_to_sequential(current_dir, merge_dir)

                if final_count == 0:
                    raise RuntimeError("输出目录为空，无帧可合并")

                self.log_signal.emit(f"&#128203; 待合并: {final_count}帧")

                out_mp4 = os.path.join(
                    self.output_dir,
                    os.path.splitext(base)[0] + "_restored.mp4"
                )

                has_audio = self._has_audio(path)

                cmd_merge = [
                    FFMPEG_PATH,
                    "-y",
                    "-framerate", str(fps),
                    "-i", os.path.join(merge_dir, "frame_%08d.png"),
                ]

                if has_audio:
                    cmd_merge += ["-i", path]

                    # ★ 音量调节：仅当音量 ≠ 1.0 时添加滤镜
                    vol = float(self.post_params.get("volume", 1.0))
                    vol = max(0.0, min(3.0, vol))  # 钳制到安全范围

                    if abs(vol - 1.0) > 0.01:
                        # volume 滤镜放在音频流上
                        cmd_merge += [
                            "-filter_complex",
                            f"[1:a]volume={vol:.2f}[aout]",
                            "-map", "0:v:0",
                            "-map", "[aout]",
                        ]
                    else:
                        cmd_merge += [
                            "-map", "0:v:0",
                            "-map", "1:a:0",
                        ]
                else:
                    cmd_merge += ["-map", "0:v:0"]

                cmd_merge += [
                    "-c:v", "libx264",
                    "-crf", "10",
                    "-preset", "fast",
                    "-pix_fmt", "yuv420p",
                    "-movflags", "+faststart",
                ]

                if has_audio:
                    cmd_merge += ["-c:a", "aac", "-b:a", "192k"]

                cmd_merge += ["-shortest", out_mp4]

                ret, merge_output = self._run_cmd(cmd_merge)

                if ret != 0:
                    self.log_signal.emit(
                        f"&#10060; ffmpeg合并错误:\n{merge_output[-800:]}"
                    )
                    raise RuntimeError("视频合并失败")

                if not os.path.exists(out_mp4):
                    raise RuntimeError("输出文件不存在")

                sz = os.path.getsize(out_mp4) / (1024 * 1024)
                if sz = 0:
            self.progress_bar.setValue(value)
        if text:
            self.lbl_status.setText(f"状态: {text}")

    def append_log(self, text):
        ts = time.strftime("%H:%M:%S")
        self.log_text.appendPlainText(f"[{ts}] {text}")
        self.log_text.ensureCursorVisible()

    def process_finished(self, success, msg):
        is_user_stop = "用户停止" in msg

        self._set_controls_enabled(True)

        if is_user_stop:
            self.btn_stop.setEnabled(False)
            self.lbl_status.setText("状态: 已停止 &#128721;")
            self.append_log("\n--- 处理已停止 ---")
        elif success:
            self.btn_start.setEnabled(True)
            self.btn_stop.setEnabled(False)
            self.lbl_status.setText("状态: 全部完成 &#9989;")
            self.progress_bar.setValue(100)
            self.append_log(f"\n&#127881; {msg}")
        else:
            self.btn_start.setEnabled(True)
            self.btn_stop.setEnabled(False)
            self.lbl_status.setText(f"状态: {msg}")
            self.append_log(f"\n--- 处理结束: {msg} ---")

        def _cleanup_and_notify():
            # 安全删除：先 disconnect 所有信号，再删除引用
            if self.worker is not None:
                try:
                    self.worker.blockSignals(True)
                    self.worker.quit()
                    self.worker.wait(3000)
                except RuntimeError:
                    pass
                self.worker.deleteLater()
                self.worker = None

            # 弹窗放在最后，且仅在成功时弹出
            if success and not is_user_stop:
                QMessageBox.information(self, "处理完成", msg)

        QTimer.singleShot(0, _cleanup_and_notify)

    def run_utility(self, func, title):
        if self.util_worker and self.util_worker.isRunning():
            return

        self.append_log(f"&#128270; {title}...")
        self.util_worker = UtilityWorker(func, self)
        self.util_worker.log_signal.connect(self.append_log, Qt.QueuedConnection)
        self.util_worker.finished_signal.connect(self._util_finished, Qt.QueuedConnection)
        self.util_worker.start()

    def _util_finished(self, ok, msg):
        self.util_worker = None

    def check_ffmpeg_status(self):
        if not FFMPEG_PATH or not os.path.exists(FFMPEG_PATH):
            return f"&#10060; 未找到: {FFMPEG_PATH}"

        try:
            r = subprocess.run(
                [FFMPEG_PATH, "-version"],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                encoding="utf-8",
                errors="ignore",
                timeout=10
            )
            first = (r.stdout or "").strip().splitlines()[0] if r.stdout else "?"
            return f"&#9989; FFmpeg: {first}"
        except subprocess.TimeoutExpired:
            return "&#10060; FFmpeg 版本查询超时"
        except Exception as e:
            return f"&#10060; FFmpeg 检查失败: {e}"

    def closeEvent(self, event):
        if self.worker and self.worker.isRunning():
            self.worker.stop()
            self.worker.wait(5000)
            if self.worker.isRunning():
                self.worker.terminate()
                self.worker.wait(2000)

        if self.worker is not None:
            self.worker.blockSignals(True)
            self.worker.deleteLater()
            self.worker = None

        if self.util_worker and self.util_worker.isRunning():
            self.util_worker.wait(1000)
            self.util_worker.deleteLater()
            self.util_worker = None

        event.accept()

def main():
    QApplication.setAttribute(Qt.AA_EnableHighDpiScaling, True)
    app = QApplication(sys.argv)
    win = VideoRepairTool()
    win.show()
    sys.exit(app.exec_())

if __name__ == '__main__':
    main()

---

[查看原文](https://www.52pojie.cn/thread-2124904-1-1.html)
