---
title: "歌曲音频频谱图查看小工具"
published: 2026-10-15
description: "手里一堆歌曲，品质良莠不齐，手搓一个小工具，快速生成高清可交互的音频频谱图，日常审听、找爆音、鉴别无损都特别顺手。 核心功能亮点 高清频谱生成：默认输出2560×1080的彩虹色对数频谱图，用Hann窗函数，全频段能量分布展示清晰，细节拉满 智能信息栏：自动 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "psqladm"
sourceLink: "https://www.52pojie.cn/thread-2132699-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2132699-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

手里一堆歌曲，品质良莠不齐，手搓一个小工具，快速生成高清可交互的音频频谱图，日常审听、找爆音、鉴别无损都特别顺手。

 核心功能亮点

高清频谱生成：默认输出2560×1080的彩虹色对数频谱图，用Hann窗函数，全频段能量分布展示清晰，细节拉满

智能信息栏：自动提取音频的文件名、时长、编码格式、采样率、声道、比特率，直接绘制在频谱图顶部，不用手动查参数

丝滑交互操作：支持滚轮以鼠标位置为中心缩放、左键拖拽平移，双击一键重置视图，找音频里的异常尖峰、隐藏频段超方便

跨平台兼容：自动适配Windows/Linux的ffmpeg路径，不用手动改配置，临时文件自动清理，不会留下冗余垃圾

格式支持：兼容mp3/wav/flac/ogg等主流音频格式，生成的频谱图可一键导出为无损PNG保存

安装运行步骤

先安装依赖：

pip install pyqt6 pillow

安装ffmpeg：

Windows用户可以把ffmpeg解压到C:\ffmpeg目录，程序会自动识别路径

Linux用户直接执行sudo apt install ffmpeg即可

把我贴的完整Python代码保存成spectrum_viewer.py，直接运行就能打开主界面，选择音频文件就能一键生成频谱图。

可自定义调整项

代码里的配置区可以直接改参数：

调整SPECTRUM_WIDTH和SPECTRUM_HEIGHT自定义输出频谱图分辨率

修改SPEK_FILTER里的color参数，就能切换频谱配色（比如改成fire、viridis风格）

调整ZOOM_FACTOR修改滚轮缩放的步长，适配自己的操作习惯

通过网盘分享的文件：音频频谱图查看小工具

链接: https://pan.baidu.com/s/1ZVfrZKjxxXWHePwyitlaDA?pwd=52pj 提取码: 52pj

[Python] *纯文本查看* *复制代码*
# !/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from PyQt6.QtCore import Qt, QThread, pyqtSignal
from PyQt6.QtGui import QPixmap, QWheelEvent, QMouseEvent, QPainter
from PyQt6.QtWidgets import (
    QApplication,
    QMainWindow,
    QWidget,
    QVBoxLayout,
    QHBoxLayout,
    QPushButton,
    QLabel,
    QFileDialog,
    QMessageBox,
    QGraphicsView,
    QGraphicsScene,
    QGraphicsPixmapItem,
)

os.environ["PYTHONIOENCODING"] = "utf-8"

# ================= 配置区 =================
def find_ff_tool(tool_name: str):
    """查找 ffmpeg/ffprobe 路径"""
    win_paths = [
        rf"c:\ffmpeg\bin\{tool_name}.exe",
        rf"c:\Program Files\ffmpeg\bin\{tool_name}.exe",
    ]
    for p in win_paths:
        if os.path.isfile(p):
            return p
    try:
        result = subprocess.run(
            ["which", tool_name], capture_output=True, text=True, timeout=5
        )
        if result.returncode == 0 and result.stdout.strip():
            return result.stdout.strip()
    except Exception:
        pass
    linux_paths = [f"/usr/bin/{tool_name}", f"/usr/local/bin/{tool_name}"]
    for p in linux_paths:
        if os.path.isfile(p):
            return p
    return tool_name

FFMPEG_PATH = find_ff_tool("ffmpeg")
FFPROBE_PATH = find_ff_tool("ffprobe")

SPECTRUM_WIDTH = 2560
SPECTRUM_HEIGHT = 1080
INFO_BAR_HEIGHT = 80
ZOOM_FACTOR = 1.15
MIN_SCALE = 0.1
MAX_SCALE = 10.0

SPEK_FILTER = (
    f"showspectrumpic=s={SPECTRUM_WIDTH}x{SPECTRUM_HEIGHT}"
    f":mode=combined:scale=log:win_func=hann"
    f":saturation=2:color=rainbow"
)

# ================= 自定义可缩放视图 =================
class SpectrumGraphicsView(QGraphicsView):
    """支持滚轮缩放、拖拽平移的图形视图"""

    def __init__(self, parent=None):
        super().__init__(parent)
        self.scene = QGraphicsScene(self)
        self.setScene(self.scene)

        self.setRenderHint(QPainter.RenderHint.Antialiasing)
        self.setRenderHint(QPainter.RenderHint.SmoothPixmapTransform)

        self.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        self.setVerticalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)

        self.setBackgroundBrush(Qt.GlobalColor.black)
        self.setDragMode(QGraphicsView.DragMode.ScrollHandDrag)

        self.pixmap_item: QGraphicsPixmapItem | None = None
        self.current_scale = 1.0

    def load_spectrum_image(self, img_path: str):
        """加载图片并自适应窗口"""
        self.scene.clear()
        self.current_scale = 1.0

        pix = QPixmap(img_path)
        if pix.isNull():
            return False

        self.pixmap_item = QGraphicsPixmapItem(pix)
        self.scene.addItem(self.pixmap_item)
        self.scene.setSceneRect(self.pixmap_item.boundingRect())

        self.fitInView(self.pixmap_item, Qt.AspectRatioMode.KeepAspectRatio)
        self.current_scale = self.transform().m11()
        return True

    def wheelEvent(self, event: QWheelEvent):
        """处理滚轮缩放，以鼠标位置为中心"""
        if not self.pixmap_item:
            return super().wheelEvent(event)

        mouse_scene_pos = self.mapToScene(event.position().toPoint())

        if event.angleDelta().y() > 0:
            zoom = ZOOM_FACTOR
        else:
            zoom = 1 / ZOOM_FACTOR

        new_scale = self.current_scale * zoom
        if new_scale  MAX_SCALE:
            return

        self.current_scale = new_scale

        self.setTransformationAnchor(QGraphicsView.ViewportAnchor.AnchorUnderMouse)
        self.scale(zoom, zoom)

        self.setTransformationAnchor(QGraphicsView.ViewportAnchor.AnchorViewCenter)

    def mouseDoubleClickEvent(self, event: QMouseEvent):
        """双击重置视图"""
        if self.pixmap_item:
            self.resetTransform()
            self.fitInView(self.pixmap_item, Qt.AspectRatioMode.KeepAspectRatio)
            self.current_scale = self.transform().m11()
        super().mouseDoubleClickEvent(event)

# ================= 辅助功能函数 =================
def extract_audio_info(audio_path: str) -> dict:
    """提取音频元数据"""
    if not os.path.exists(audio_path):
        return {}
    cmd = [
        FFPROBE_PATH,
        "-v",
        "quiet",
        "-print_format",
        "json",
        "-show_streams",
        "-select_streams",
        "a:0",
        "-show_format",
        audio_path,
    ]
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=30,
            encoding="utf-8",
            errors="replace",
        )
        if result.returncode != 0:
            return {}
        data = json.loads(result.stdout)
        if not data.get("streams"):
            return {}

        audio_stream = data["streams"][0]
        format_info = data.get("format", {})

        duration_sec = float(format_info.get("duration", 0))
        h, m, s = (
            int(duration_sec // 3600),
            int((duration_sec % 3600) // 60),
            int(duration_sec % 60),
        )

        bit_rate = int(audio_stream.get("bit_rate", 0)) // 1000

        return {
            "filename": Path(audio_path).name,
            "codec": audio_stream.get("codec_name", "未知"),
            "sample_rate": f"{audio_stream.get('sample_rate', '0')} Hz",
            "channels": "立体声"
            if int(audio_stream.get("channels", 2)) == 2
            else "单声道",
            "bit_rate": f"{bit_rate} kb/s" if bit_rate > 0 else "未知",
            "duration": f"{h:02d}:{m:02d}:{s:02d}",
        }
    except Exception:
        return {}

def draw_info_bar_on_image(spectrum_img_path: str, audio_info: dict, output_path: str):
    """绘制带信息栏的频谱图"""
    if not os.path.exists(spectrum_img_path) or not audio_info:
        return False

    spectrum_img = Image.open(spectrum_img_path).convert("RGBA")
    w, h = spectrum_img.size
    new_img = Image.new("RGBA", (w, h + INFO_BAR_HEIGHT), (0, 0, 0, 255))
    new_img.paste(spectrum_img, (0, INFO_BAR_HEIGHT))

    draw = ImageDraw.Draw(new_img)
    draw.rectangle([0, 0, w, INFO_BAR_HEIGHT], fill=(20, 20, 20, 230))

    try:
        font = ImageFont.truetype("msyh.ttc", 28)
    except:
        try:
            font = ImageFont.truetype("PingFang.ttc", 28)
        except:
            font = ImageFont.load_default(size=28)

    info_text = (
        f"文件: {audio_info['filename']}  |  "
        f"时长: {audio_info['duration']}  |  "
        f"编码: {audio_info['codec']}  |  "
        f"采样率: {audio_info['sample_rate']}  |  "
        f"声道: {audio_info['channels']}  |  "
        f"比特率: {audio_info['bit_rate']}"
    )

    text_bbox = draw.textbbox((0, 0), info_text, font=font)
    text_w = text_bbox[2] - text_bbox[0]
    text_h = text_bbox[3] - text_bbox[1]
    draw.text(
        ((w - text_w) // 2, (INFO_BAR_HEIGHT - text_h) // 2),
        info_text,
        font=font,
        fill=(255, 255, 255, 255),
    )

    new_img.convert("RGB").save(output_path, "PNG", quality=100)
    return True

def safe_copy_file(src: str, dst: str):
    """安全复制文件"""
    if os.path.isdir(dst):
        dst = os.path.join(dst, os.path.basename(src))
    os.makedirs(os.path.dirname(os.path.abspath(dst)), exist_ok=True)
    shutil.copy2(src, dst)

# ================= 工作线程 =================
class SpectrumWorker(QThread):
    finished = pyqtSignal(str, str)

    def __init__(self, audio_path: str, cache_dir: str):
        super().__init__()
        self.audio_path = audio_path
        self.cache_dir = cache_dir
        self.tmp_dir = None

    def run(self):
        try:
            audio_info = extract_audio_info(self.audio_path)
            if not audio_info:
                self.finished.emit("", "ffprobe 提取信息失败")
                return

            raw_path = self._generate_raw_spectrum()
            if not raw_path:
                self.finished.emit("", "频谱图生成失败")
                return

            stem = (
                "".join(
                    c
                    for c in Path(self.audio_path).stem
                    if c.isascii() and c not in r'<>:"/\|?*'
                ).strip()
                or "audio"
            )
            final_path = os.path.join(self.cache_dir, f"{stem}_full.png")

            if draw_info_bar_on_image(raw_path, audio_info, final_path):
                self.finished.emit(final_path, "")
            else:
                self.finished.emit("", "信息栏绘制失败")
        except Exception as e:
            self.finished.emit("", f"异常: {str(e)}")
        finally:
            self._cleanup()

    def _generate_raw_spectrum(self):
        self.tmp_dir = tempfile.mkdtemp(prefix="spectrum_")
        stem = Path(self.audio_path).stem
        safe_stem = (
            "".join(c for c in stem if c.isascii() and c not in r'<>:"/\|?*').strip()
            or "audio"
        )
        img_out = os.path.join(self.tmp_dir, f"{safe_stem}_raw.png")

        cmd = [
            FFMPEG_PATH,
            "-y",
            "-i",
            self.audio_path,
            "-filter_complex",
            SPEK_FILTER,
            "-frames:v",
            "1",
            img_out,
        ]
        try:
            r = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=600,
                encoding="utf-8",
                errors="replace",
            )
            if (
                r.returncode == 0
                and os.path.exists(img_out)
                and os.path.getsize(img_out) > 10000
            ):
                return img_out
        except Exception:
            pass
        return None

    def _cleanup(self):
        if self.tmp_dir and os.path.exists(self.tmp_dir):
            try:
                shutil.rmtree(self.tmp_dir)
            except Exception:
                pass

# ================= 主窗口 =================
class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("音频频谱图查看器")
        self.resize(1800, 1100)

        self._current_image_path = None
        self._current_song_name = None
        self._worker = None
        self._cache_dir = os.path.join(tempfile.gettempdir(), "spectrum_cache")
        os.makedirs(self._cache_dir, exist_ok=True)

        central = QWidget()
        self.setCentralWidget(central)
        layout = QVBoxLayout(central)
        layout.setContentsMargins(10, 10, 10, 10)

        # 按钮栏
        btn_layout = QHBoxLayout()
        self.btn_open = QPushButton("打开音频文件")
        self.btn_save = QPushButton("保存频谱图")
        self.btn_save.setEnabled(False)

        style = (
            "QPushButton { padding: 10px 20px; background: #2d2d2d; color: white; border-radius: 4px; } "
            "QPushButton:hover { background: #3d3d3d; } "
            "QPushButton:disabled { background: #1a1a1a; color: #666; }"
        )
        self.btn_open.setStyleSheet(style)
        self.btn_save.setStyleSheet(style)

        self.lbl_status = QLabel("就绪")
        self.lbl_status.setAlignment(Qt.AlignmentFlag.AlignCenter)

        btn_layout.addWidget(self.btn_open)
        btn_layout.addWidget(self.btn_save)
        btn_layout.addStretch()
        btn_layout.addWidget(self.lbl_status)
        layout.addLayout(btn_layout)

        # 使用自定义视图替代 QLabel
        self.view_spectrum = SpectrumGraphicsView()
        self.view_spectrum.setMinimumSize(1280, 640)
        layout.addWidget(self.view_spectrum, stretch=1)

        self.btn_open.clicked.connect(self.open_file)
        self.btn_save.clicked.connect(self.save_spectrum)

    def closeEvent(self, event):
        if os.path.exists(self._cache_dir):
            try:
                shutil.rmtree(self._cache_dir)
            except Exception:
                pass
        super().closeEvent(event)

    def open_file(self):
        if self._worker and self._worker.isRunning():
            self._worker.terminate()
            self._worker.wait()

        file_path, _ = QFileDialog.getOpenFileName(
            self, "选择音频文件", "", "Audio Files (*.mp3 *.wav *.flac *.ogg)"
        )
        if not file_path:
            return

        self.btn_open.setEnabled(False)
        self.btn_save.setEnabled(False)
        self.view_spectrum.scene.clear()
        self.lbl_status.setText("处理中...")

        self._current_song_name = Path(file_path).stem
        self._worker = SpectrumWorker(file_path, self._cache_dir)
        self._worker.finished.connect(self.on_spectrum_ready)
        self._worker.start()

    def on_spectrum_ready(self, image_path: str, error: str):
        self.btn_open.setEnabled(True)
        if error:
            QMessageBox.critical(self, "错误", error)
            self.lbl_status.setText("失败")
            return

        self._current_image_path = image_path
        if self.view_spectrum.load_spectrum_image(image_path):
            self.btn_save.setEnabled(True)
            self.lbl_status.setText("已完成")
        else:
            QMessageBox.critical(self, "错误", "图片加载失败")

    def save_spectrum(self):
        if not self._current_image_path:
            return
        default_name = f"{self._current_song_name}_spectrum.png"
        save_path, _ = QFileDialog.getSaveFileName(
            self, "保存", default_name, "PNG (*.png)"
        )
        if save_path:
            try:
                safe_copy_file(self._current_image_path, save_path)
                QMessageBox.information(self, "成功", f"已保存至:\n{save_path}")
            except Exception as e:
                QMessageBox.critical(self, "错误", str(e))

def main():
    app = QApplication(sys.argv)
    win = MainWindow()
    win.show()
    sys.exit(app.exec())

if __name__ == "__main__":
    main()

---

[查看原文](https://www.52pojie.cn/thread-2132699-1-1.html)
