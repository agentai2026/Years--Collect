---
title: "爱听音乐播放器可下载 - 桌面版（含完整源码）"
published: 2026-10-10
description: "【软件名称】2t58爱听音乐播放器【运行环境】Windows + Python3 【依赖安装】pip install requests pycryptodome PyQt6 pillow PyQt6-WebEngine 【启动方式】python player_2t58.py，或双击\\\"启动播放器.vbs\\\"（无黑 .."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "By：伟"
sourceLink: "https://www.52pojie.cn/thread-2131820-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2131820-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(48.61 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4NDY5MHxkZmVkZjc3MnwxNzkxNjk2MDA0fDB8MjEzMTgyMA%3D%3D&nothumb=yes)

2026-10-10 17:13 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(114.29 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4NDY4OXw2NTYxMzE3NnwxNzkxNjk2MDA0fDB8MjEzMTgyMA%3D%3D&nothumb=yes)

2026-10-10 17:13 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(113.21 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4NDY4OHxlMGZhMzU3NHwxNzkxNjk2MDA0fDB8MjEzMTgyMA%3D%3D&nothumb=yes)

2026-10-10 17:13 上传

![](https://static.52pojie.cn/static/image/filetype/rar.gif)

[播放器.rar](forum.php?mod=attachment&aid=Mjg4NDczN3w1NWUzNWIzNXwxNzkxNjk2MDA0fDB8MjEzMTgyMA%3D%3D)

*(8.47 KB, 下载次数: 11)*

2026-10-10 18:47 上传

点击文件名下载附件

下载积分: 吾爱币 -1 CB

【软件名称】2t58爱听音乐播放器【运行环境】Windows + Python3

【依赖安装】pip install requests pycryptodome PyQt6 pillow PyQt6-WebEngine

【启动方式】python player_2t58.py，或双击"启动播放器.vbs"（无黑窗口）

═══════════════════════════════

【功能介绍】1. 内置20个榜单：热门/新歌/TOP/DJ/抖音/网络红歌/粤语/欧美/古风/影视/ACG/说唱/80后/网红/电音/酷我飙升/车载/KTV/睡前/跑步

2. 搜索歌曲，回车即搜

3. 双击播放，暂停/上下首/进度条/音量

4. 自动显示封面、滚动歌词高亮

5. 播放完自动连播，坏歌自动跳过

6. 右键下载m4a

7. 暗色界面，黄色圆形播放按钮

8. 首次打开自动弹浏览器过人机验证，cookie自动保存到本地，下次打开不用再验证

9. 软件放哪个目录，cookie就存哪个目录，免安装绿色版【使用说明】1. 安装依赖后运行2. 首次打开如果弹出验证窗口，勾选"我不是人机"，等首页出来后点"验证完成，继续"3. 之后正常使用，cookie自动记忆，1小时内不用再验证4. 歌曲列表双击播放，**右键下载**

**【免责声明】本工具仅作技术学习交流，音频版权归原网站及唱片公司所有，请勿商用，下载后24小时内删除。**

完整源码

[Python] *纯文本查看* *复制代码*
# -*- coding: utf-8 -*-
"""
 爱听音乐播放器
基于 https://www.2t58.com 接口
依赖: pip install requests pycryptodome PyQt6 pillow PyQt6-WebEngine
"""
import sys, os, requests, binascii, re, tempfile, json
os.chdir(os.path.dirname(os.path.abspath(__file__)))
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad

from PyQt6.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout,
                             QHBoxLayout, QLineEdit, QPushButton, QListWidget,
                             QListWidgetItem, QLabel, QSlider, QTextEdit,
                             QSplitter, QMessageBox, QScrollArea, QFrame,
                             QFileDialog, QMenu, QDialog)
from PyQt6.QtCore import Qt, QThread, pyqtSignal, QUrl, QTimer
from PyQt6.QtMultimedia import QMediaPlayer, QAudioOutput
from PyQt6.QtGui import QPixmap, QTextCursor
from PyQt6.QtWebEngineWidgets import QWebEngineView

# ============ 接口配置 ============
BASE = "https://www.2t58.com"
PLAY_API = BASE + "/js/play.php"
LRC_API = "https://js.eev3.com/lrc.php"
AES_KEY = binascii.unhexlify("8a5a0271acadce264fbd5492e999a25f19abd19258fbc8252e1d9fcd69adb7bf")

COOKIE_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cookies.json")

session = requests.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    "Referer": BASE + "/",
})

def _load_cookies():
    try:
        if os.path.exists(COOKIE_FILE):
            with open(COOKIE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            for k, v in data.items():
                session.cookies.set(k, v, domain=".2t58.com")
    except:
        pass
_load_cookies()

def _save_cookies():
    try:
        data = {}
        for c in session.cookies:
            data[c.name] = c.value
        with open(COOKIE_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except:
        pass

# 榜单配置
CHARTS = [
    ("热门", "/"),
    ("新歌", "/list/new.html"),
    ("TOP榜", "/list/top.html"),
    ("DJ舞曲", "/list/djwuqu.html"),
    ("抖音热歌", "/list/douyin.html"),
    ("网络红歌", "/list/hot.html"),
    ("粤语金曲", "/list/yytop.html"),
    ("欧美金曲", "/list/ustop.html"),
    ("古风", "/list/gfhot.html"),
    ("影视金曲", "/list/ystop.html"),
    ("ACG", "/list/newacg.html"),
    ("说唱", "/list/sctop.html"),
    ("80后", "/list/blhot.html"),
    ("网红", "/list/wlhot.html"),
    ("电音", "/list/dytop.html"),
    ("酷我飙升", "/list/kuwo.html"),
    ("车载", "/list/cztop.html"),
    ("KTV", "/list/ktvtop.html"),
    ("睡前", "/list/sqtop.html"),
    ("跑步", "/list/jstop.html"),
]

# ============ 核心接口 ============
def decrypt_url(enc_hex):
    ct = binascii.unhexlify(enc_hex)
    pt = unpad(AES.new(AES_KEY, AES.MODE_ECB).decrypt(ct), AES.block_size)
    return pt.decode("utf-8")

def get_song_info(song_id):
    r = session.post(PLAY_API, data={"id": song_id, "type": "music"},
                     headers={"X-Requested-With": "XMLHttpRequest"}, timeout=10)
    j = r.json()
    if j.get("msg") != 1:
        raise Exception(j.get("error", "获取播放地址失败"))
    return {"url": decrypt_url(j["url"]), "pic": j["pic"], "lkid": j["lkid"]}

def get_lyrics(lkid):
    try:
        r = session.get(LRC_API, params={"cid": lkid}, timeout=10)
        return r.json().get("lrc", "")
    except:
        return ""

def parse_lrc(lrc_text):
    result = []
    for line in lrc_text.split("\n"):
        m = re.match(r"^\s*\[(\d+):(\d+(?:\.\d+)?)\](.*)$", line)
        if m:
            t = int(m.group(1)) * 60 + float(m.group(2))
            result.append((t, m.group(3).strip()))
    result.sort(key=lambda x: x[0])
    return result

def _extract_songs(html):
    songs, seen = [], set()
    pat = re.compile(r'href="/song/([^"]+)\.html"[^>]*>([^')
    for m in pat.finditer(html):
        sid, name = m.group(1), m.group(2).strip()
        if sid not in seen and name:
            seen.add(sid)
            songs.append({"id": sid, "title": name})
    return songs

def _get_with_retry(url, **kw):
    kw.setdefault("timeout", 30)
    last = None
    for i in range(3):
        try:
            return session.get(url, **kw)
        except Exception as e:
            last = e
    raise last

def fetch_url_songs(path):
    r = _get_with_retry(BASE + path)
    r.encoding = r.apparent_encoding or "utf-8"
    if "安全验证" in r.text and len(r.text)  500:
                    pic_data = pr.content
            except:
                pass
            self.done.emit({"song": self.song, "info": info, "path": tmp.name,
                            "lrc": lrc, "pic": pic_data})
        except Exception as e:
            self.fail.emit(str(e))

class DownloadThread(QThread):
    done = pyqtSignal(str)
    fail = pyqtSignal(str)
    def __init__(self, song, save_path):
        super().__init__()
        self.song = song
        self.save_path = save_path
    def run(self):
        try:
            info = get_song_info(self.song["id"])
            ar = session.get(info["url"], headers={"Referer": "https://www.kuwo.cn/"},
                             timeout=60, stream=True)
            total = 0
            with open(self.save_path, "wb") as f:
                for chunk in ar.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        total += len(chunk)
            if total = len(self.playlist):
            return
        song = self.playlist[idx]
        safe_name = re.sub(r'[\\/:*?"<>|]', '_', song["title"])
        path, _ = QFileDialog.getSaveFileName(self, "保存歌曲", f"{safe_name}.m4a", "音频文件 (*.m4a)")
        if not path:
            return
        self.song_label.setText(f"下载中: {song['title']}...")
        self._dth = DownloadThread(song, path)
        self._dth.done.connect(lambda p: self.song_label.setText(f"已下载: {p}"))
        self._dth.fail.connect(lambda e: self.song_label.setText(f"下载失败: {e}"))
        self._dth.start()

    def _play_at(self, idx):
        if idx = len(self.playlist):
            return
        self.current_idx = idx
        song = self.playlist[idx]
        self.song_label.setText(f"加载: {song['title']}")
        self.list_widget.setCurrentRow(idx)
        self._pth = PlayThread(song)
        self._pth.done.connect(self._start_play)
        self._pth.fail.connect(lambda e: self.song_label.setText(f"播放失败: {e}"))
        self._pth.start()

    def _start_play(self, data):
        if self.temp_path and os.path.exists(self.temp_path):
            try: os.unlink(self.temp_path)
            except: pass
        self.temp_path = data["path"]
        self.lrc_lines = parse_lrc(data["lrc"])
        self.lrc_idx = 0
        self.lrc_view.clear()
        if data["pic"]:
            pix = QPixmap()
            pix.loadFromData(data["pic"])
            if not pix.isNull():
                pix = pix.scaled(200, 200, Qt.AspectRatioMode.KeepAspectRatio,
                                 Qt.TransformationMode.SmoothTransformation)
                self.cover_label.setPixmap(pix)
            else:
                self.cover_label.setText("封面")
        else:
            self.cover_label.setText("封面")
        self.song_label.setText(data["song"]["title"])
        self.player.setSource(QUrl.fromLocalFile(self.temp_path))
        self.player.play()
        self.timer.start()

    def _toggle_play(self):
        if self.current_idx  0:
            self._play_index(self.current_idx - 1)

    def _next(self):
        if self.current_idx  0:
            self.player.setPosition(int(self.progress.value() / 100 * dur))

    def _on_state_changed(self, state):
        self.is_playing = (state == QMediaPlayer.PlaybackState.PlayingState)
        self.btn_play.setText("&#9208;" if self.is_playing else "&#9654;")

    def _on_media_status(self, status):
        if status == QMediaPlayer.MediaStatus.EndOfMedia and self.current_idx >= 0:
            if self.current_idx = 0:
            if self.current_idx  0:
            self.progress.setValue(int(pos / dur * 100))
            self.time_label.setText(f"{self._fmt(pos/1000)} / {self._fmt(dur/1000)}")
            self._show_lrc(pos / 1000)

    def _show_lrc(self, cur):
        if not self.lrc_lines:
            return
        idx = 0
        for i, (t, _) in enumerate(self.lrc_lines):
            if t

VBS 启动脚本

[Python] *纯文本查看* *复制代码*
Set ws = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
' 改成你自己电脑的pythonw路径
pyw = "C:\Python312\pythonw.exe"
ws.Run """" & pyw & """ """ & scriptDir & "\player_2t58.py""", 1, False

---

[查看原文](https://www.52pojie.cn/thread-2131820-1-1.html)
