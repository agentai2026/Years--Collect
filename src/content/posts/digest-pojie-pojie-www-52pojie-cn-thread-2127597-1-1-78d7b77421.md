---
title: "Python 最简易版 m3u8 跨平台下载实现"
published: 2026-09-12
description: "带简易图形界面，之前有需求写的，几个月前就在github上开源，仓库名：“and-simple-downloader” 喜欢的希望点点小星星 功能特性 [*]图形用户界面: 操作直观，无需命令行知识。 [*]多线程下载: 同时下载多个视频分片，显著提升下载速度。 [*]支持主播放列表: 能 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "13250020098"
sourceLink: "https://www.52pojie.cn/thread-2127597-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2127597-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

带简易图形界面，之前有需求写的，几个月前就在github上开源，仓库名：“and-simple-downloader” 喜欢的希望点点小星星

**功能特性**
图形用户界面: 操作直观，无需命令行知识。多线程下载: 同时下载多个视频分片，显著提升下载速度。支持主播放列表: 能自动检测包含多种清晰度的 M3U8 主列表，并选择最高码率的流进行下载。AES-128 解密: 支持下载经过 AES-128 加密的视频流。跨平台: 基于 Python 和 tkinter，可在 Windows, macOS 和 Linux 上运行。

[Python] *纯文本查看* *复制代码*
import os
import requests
import m3u8
from Crypto.Cipher import AES
import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed

# --- Core Downloader Logic ---

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}
MAX_RETRIES = 3
MAX_WORKERS = 20  # 并发下载线程数

class Downloader:
    def __init__(self, m3u8_url, output_filename, progress_callback, status_callback):
        self.m3u8_url = m3u8_url
        self.output_filename = output_filename
        self.progress_callback = progress_callback
        self.status_callback = status_callback
        self.session = requests.Session()

    def run(self):
        try:
            self.status_callback("正在解析 M3U8...")
            playlist = self._get_playlist(self.m3u8_url)
            if not playlist:
                raise Exception("无法获取或解析 M3U8 文件。")

            if playlist.is_variant:
                self.status_callback("检测到主播放列表，选择最高码率...")
                stream_info = sorted(playlist.playlists, key=lambda p: p.stream_info.bandwidth, reverse=True)[0]
                playlist_url = stream_info.absolute_uri
                playlist = self._get_playlist(playlist_url)
                if not playlist:
                    raise Exception("获取子播放列表失败。")

            key = self._get_key(playlist)

            self._download_and_merge(playlist, key)

            self.status_callback(f"下载完成！文件保存在: {self.output_filename}")
        except Exception as e:
            self.status_callback(f"错误: {e}")
            messagebox.showerror("错误", str(e))

    def _get_playlist(self, url):
        try:
            response = self.session.get(url, headers=HEADERS, timeout=10)
            response.raise_for_status()
            return m3u8.loads(response.text, uri=url)
        except requests.exceptions.RequestException as e:
            print(f"获取 M3U8 文件失败: {e}")
            return None

    def _get_key(self, playlist):
        if playlist.keys and playlist.keys[0]:
            key_uri = playlist.keys[0].absolute_uri
            self.status_callback(f"正在获取密钥: {key_uri}")
            try:
                response = self.session.get(key_uri, headers=HEADERS, timeout=10)
                response.raise_for_status()
                self.status_callback("密钥获取成功。")
                return response.content
            except requests.exceptions.RequestException as e:
                raise Exception(f"获取密钥失败: {e}")
        return None

    def _download_segment(self, segment_info):
        index, segment = segment_info
        ts_url = segment.absolute_uri
        for _ in range(MAX_RETRIES):
            try:
                response = self.session.get(ts_url, timeout=15)
                response.raise_for_status()
                return index, response.content
            except requests.exceptions.RequestException:
                continue
        print(f"分片 {index} 下载失败: {ts_url}")
        return index, None

    def _download_and_merge(self, playlist, key):
        segments = list(enumerate(playlist.segments))
        total_segments = len(segments)
        self.status_callback(f"开始下载 {total_segments} 个分片...")

        # 使用字典来保证分片顺序
        ts_contents = {}

        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            futures = {executor.submit(self._download_segment, s): s for s in segments}

            for i, future in enumerate(as_completed(futures)):
                index, content = future.result()
                if content:
                    ts_contents[index] = content

                progress = (i + 1) / total_segments * 100
                self.progress_callback(progress)

        if len(ts_contents) != total_segments:
            print("警告：部分分片下载失败。")

        self.status_callback("下载完成，开始合并文件...")
        with open(self.output_filename, 'wb') as f:
            for i in range(total_segments):
                content = ts_contents.get(i)
                if not content:
                    continue

                if key:
                    iv = (playlist.media_sequence + i).to_bytes(16, 'big')
                    cipher = AES.new(key, AES.MODE_CBC, iv)
                    try:
                        decrypted_content = cipher.decrypt(content)
                        # 简单的 unpad，可能不适用于所有情况
                        unpad = lambda s: s[:-ord(s[len(s)-1:])]
                        f.write(unpad(decrypted_content))
                    except Exception:
                         f.write(content) # 解密失败则直接写入
                else:
                    f.write(content)

# --- GUI Application ---

class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("M3U8 下载器")
        self.geometry("500x200")

        self.url_label = ttk.Label(self, text="M3U8 链接:")
        self.url_label.pack(pady=5)

        self.url_entry = ttk.Entry(self, width=60)
        self.url_entry.pack(pady=5, padx=10)

        self.download_button = ttk.Button(self, text="下载", command=self.start_download)
        self.download_button.pack(pady=10)

        self.progress = ttk.Progressbar(self, orient="horizontal", length=400, mode="determinate")
        self.progress.pack(pady=10)

        self.status_label = ttk.Label(self, text="等待下载...")
        self.status_label.pack(pady=5)

    def start_download(self):
        m3u8_url = self.url_entry.get()
        if not m3u8_url:
            messagebox.showwarning("警告", "请输入 M3U8 链接！")
            return

        output_filename = filedialog.asksaveasfilename(
            title="保存视频文件",
            defaultextension=".mp4",
            filetypes=[("MPEG-4", "*.mp4"), ("All Files", "*.*")]
        )
        if not output_filename:
            return

        self.download_button.config(state=tk.DISABLED)
        self.progress["value"] = 0

        downloader = Downloader(
            m3u8_url,
            output_filename,
            self.update_progress,
            self.update_status
        )

        # 在新线程中运行下载
        threading.Thread(target=downloader.run, daemon=True).start()

    def update_progress(self, value):
        self.progress["value"] = value
        self.update_idletasks()

    def update_status(self, text):
        self.status_label.config(text=text)
        if "完成" in text or "错误" in text:
            self.download_button.config(state=tk.NORMAL)
        self.update_idletasks()

if __name__ == "__main__":
    app = App()
    app.mainloop()

---

[查看原文](https://www.52pojie.cn/thread-2127597-1-1.html)
