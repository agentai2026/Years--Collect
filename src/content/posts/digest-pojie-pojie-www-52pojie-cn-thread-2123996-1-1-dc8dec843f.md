---
title: "公网IP变更邮箱提醒工具"
published: 2026-08-20
description: "找人写要450元,AI手搓了个公网IP变更邮箱提醒,设置完要点保存配置,可以最小化到托盘,软件同目录要有app.ico图标,才能最小化到系统托盘. https://wwbmj.lanzouu.com/iYhTX43peyyf 用的过程中出现了些问题,现在更新 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "再贱就再见"
sourceLink: "https://www.52pojie.cn/thread-2123996-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2123996-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

找人写要450元,AI手搓了个公网IP变更邮箱提醒,设置完要点保存配置,可以最小化到托盘,软件同目录要有app.ico图标,才能最小化到系统托盘.

https://wwbmj.lanzouu.com/iYhTX43peyyf

![](https://static.52pojie.cn/static/image/common/none.gif)

**1.png** *(41.07 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3MzU1NnwzMmVmZjJhN3wxNzg3MjY2NDczfDB8MjEyMzk5Ng%3D%3D&nothumb=yes)

2026-8-20 19:31 上传

用的过程中出现了些问题,现在更新到最新版了,应该不会出啥问题了...

![](https://static.52pojie.cn/static/image/common/none.gif)

**111111.png** *(44.82 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3MzYwNHw2NWQ5NzNlOHwxNzg3MjY2NDczfDB8MjEyMzk5Ng%3D%3D&nothumb=yes)

2026-8-21 01:23 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**2.png** *(32.46 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3MzU1N3w5YWVmNGNlMHwxNzg3MjY2NDczfDB8MjEyMzk5Ng%3D%3D&nothumb=yes)

2026-8-20 19:32 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**3.png** *(28.54 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3MzU1OHwxYTFkMWM4MHwxNzg3MjY2NDczfDB8MjEyMzk5Ng%3D%3D&nothumb=yes)

2026-8-20 19:32 上传

[Python] *纯文本查看* *复制代码*
import requests
import smtplib
import time
import logging
import json
import os
import threading
import queue
import sys
import ctypes
from email.mime.text import MIMEText
from email.header import Header
import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox
import winreg
import ipaddress

try:
    from pystray import Icon, MenuItem, Menu
    from PIL import Image, ImageDraw
    HAS_TRAY = True
except ModuleNotFoundError:
    HAS_TRAY = False
    print("警告：未安装pystray pillow，托盘功能不可用，请执行 pip install requests pystray pillow")

# Windows互斥锁
MUTEX_NAME = "IPMonitor_Tool_20260820_UniqueMutex"
h_mutex = None
if sys.platform == "win32":
    kernel32 = ctypes.windll.kernel32
    h_mutex = kernel32.CreateMutexW(None, False, MUTEX_NAME)
    last_err = kernel32.GetLastError()
    if last_err == 183:
        messagebox.showinfo("提示", "软件已经在运行中，请勿重复启动！")
        sys.exit(0)

CONFIG_FILE = "config.json"
IPV4_SAVE_FILE = "last_ipv4.txt"
IPV6_SAVE_FILE = "last_ipv6.txt"
LOG_FILE = "ip_log.txt"

def get_app_dir():
    """获取exe/脚本所在目录（同目录）"""
    if getattr(sys, 'frozen', False):
        return os.path.dirname(sys.executable)
    else:
        return os.path.dirname(os.path.abspath(sys.argv[0]))

def get_exe_fullpath():
    if getattr(sys, 'frozen', False):
        return sys.executable
    else:
        return os.path.abspath(sys.argv[0])

# 日志
logger = logging.getLogger("IPMonitor")
logger.setLevel(logging.INFO)
if not logger.handlers:
    log_path = os.path.join(get_app_dir(), LOG_FILE)
    fh = logging.FileHandler(log_path, encoding="utf-8")
    fmt = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
    fh.setFormatter(fmt)
    logger.addHandler(fh)

def make_fallback_icon():
    """生成兜底托盘图标，内存绘制，不需要外部文件"""
    img = Image.new("RGB", (64, 64), color=(20, 90, 180))
    draw = ImageDraw.Draw(img)
    draw.ellipse((12, 12, 52, 52), fill=(255, 255, 255))
    return img

def is_valid_ipv4(ip_str: str) -> bool:
    try:
        ipaddress.IPv4Address(ip_str.strip())
        return True
    except (ipaddress.AddressValueError, ValueError):
        return False

def is_valid_ipv6(ip_str: str) -> bool:
    try:
        ipaddress.IPv6Address(ip_str.strip())
        return True
    except (ipaddress.AddressValueError, ValueError):
        return False

class IPMonitorGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("公网IP变更邮件提醒工具")
        self.root.geometry("720x620")
        self.running = False
        self.monitor_thread = None
        self.tray_icon = None
        self.tray_thread = None
        self.autostart_key_name = "IPMonitorTool"
        self.log_queue = queue.Queue()
        self.http_session = requests.Session()
        self.http_session.trust_env = False

        # 待发送告警缓存：保存未发送成功的IP变更邮件任务
        self.pending_alert = None  # {"subject":"xxx","body":"xxx"}

        self.app_dir = get_app_dir()
        self.CONFIG_FILE = os.path.join(self.app_dir, CONFIG_FILE)
        self.IPV4_SAVE_FILE = os.path.join(self.app_dir, IPV4_SAVE_FILE)
        self.IPV6_SAVE_FILE = os.path.join(self.app_dir, IPV6_SAVE_FILE)
        self.LOG_FILE = os.path.join(self.app_dir, LOG_FILE)

        self._poll_log_queue()

        frame_cfg = ttk.LabelFrame(root, text="邮箱配置")
        frame_cfg.pack(fill="x", padx=10, pady=5)
        ttk.Label(frame_cfg, text="SMTP服务器:").grid(row=0, column=0, padx=5, pady=3, sticky="w")
        self.var_smtp = tk.StringVar(value="smtp.qq.com")
        ttk.Entry(frame_cfg, textvariable=self.var_smtp, width=32).grid(row=0, column=1, padx=5, pady=3)
        ttk.Label(frame_cfg, text="端口:").grid(row=0, column=2, padx=5, pady=3, sticky="w")
        self.var_port = tk.StringVar(value="465")
        ttk.Entry(frame_cfg, textvariable=self.var_port, width=10).grid(row=0, column=3, padx=5, pady=3)

        ttk.Label(frame_cfg, text="发件邮箱:").grid(row=1, column=0, padx=5, pady=3, sticky="w")
        self.var_sender = tk.StringVar()
        ttk.Entry(frame_cfg, textvariable=self.var_sender, width=32).grid(row=1, column=1, padx=5, pady=3)
        ttk.Label(frame_cfg, text="授权码:").grid(row=1, column=2, padx=5, pady=3, sticky="w")
        self.var_pwd = tk.StringVar()
        ttk.Entry(frame_cfg, textvariable=self.var_pwd, width=18, show="*").grid(row=1, column=3, padx=5, pady=3)

        ttk.Label(frame_cfg, text="接收邮箱:").grid(row=2, column=0, padx=5, pady=3, sticky="w")
        self.var_receiver = tk.StringVar()
        ttk.Entry(frame_cfg, textvariable=self.var_receiver, width=32).grid(row=2, column=1, padx=5, pady=3)
        ttk.Label(frame_cfg, text="检测间隔(秒):").grid(row=2, column=2, padx=5, pady=3, sticky="w")
        self.var_interval = tk.StringVar(value="300")
        ttk.Entry(frame_cfg, textvariable=self.var_interval, width=10).grid(row=2, column=3, padx=5, pady=3)

        frame_adv = ttk.LabelFrame(root, text="高级设置")
        frame_adv.pack(fill="x", padx=10, pady=5)

        ttk.Label(frame_adv, text="日志保留天数:").grid(row=0, column=0, padx=5, pady=3, sticky="w")
        self.var_log_days = tk.StringVar(value="30")
        ttk.Entry(frame_adv, textvariable=self.var_log_days, width=3).grid(row=0, column=1, padx=5, pady=3)
        ttk.Label(frame_adv, text="(到期自动清理旧日志)").grid(row=0, column=2, padx=2, pady=3, sticky="w")

        self.var_monitor_ipv6 = tk.BooleanVar(value=False)
        ttk.Checkbutton(frame_adv, text="同时监控IPv6", variable=self.var_monitor_ipv6).grid(row=0, column=3, padx=8, pady=3)

        frame_boot = ttk.Frame(frame_adv)
        frame_boot.grid(row=1, column=0, columnspan=5, padx=5, pady=5)

        self.btn_clean_log = ttk.Button(frame_boot, text="手动清理日志", command=self.manual_clean_log)
        self.btn_clean_log.grid(row=0, column=0, padx=3)
        self.btn_toggle_monitor = ttk.Button(frame_boot, text="开始监控", command=self.toggle_monitor)
        self.btn_toggle_monitor.grid(row=0, column=1, padx=3)
        self.btn_autostart = ttk.Button(frame_boot, text="开启开机自启", command=self.toggle_auto_start)
        self.btn_autostart.grid(row=0, column=2, padx=3)
        self.btn_save = ttk.Button(frame_boot, text="保存配置", command=self.save_config)
        self.btn_save.grid(row=0, column=3, padx=3)

        frame_log = ttk.LabelFrame(root, text="运行日志")
        frame_log.pack(fill="both", expand=True, padx=10, pady=5)
        self.log_text = scrolledtext.ScrolledText(frame_log, height=14)
        self.log_text.pack(fill="both", expand=True, padx=5, pady=5)

        self.update_autostart_btn_text()
        self.update_monitor_button_text()
        self.init_tray()
        self.root.protocol("WM_DELETE_WINDOW", self.on_window_close)
        self.load_config()

        cfg = self.read_raw_config()
        if cfg.get("monitor_running", False):
            self.log("检测到上次监控为开启状态，自动启动监控")
            self.root.after(300, self.start_monitor_inner)

    def update_monitor_button_text(self):
        if self.running:
            self.btn_toggle_monitor.config(text="停止监控")
        else:
            self.btn_toggle_monitor.config(text="开始监控")

    def read_raw_config(self):
        if os.path.exists(self.CONFIG_FILE):
            try:
                with open(self.CONFIG_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                return {}
        return {}

    def is_autostart_enabled(self):
        try:
            key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Software\Microsoft\Windows\CurrentVersion\Run", 0, winreg.KEY_READ)
            val, _ = winreg.QueryValueEx(key, self.autostart_key_name)
            winreg.CloseKey(key)
            return True
        except FileNotFoundError:
            return False

    def update_autostart_btn_text(self):
        if self.is_autostart_enabled():
            self.btn_autostart.config(text="关闭开机自启")
        else:
            self.btn_autostart.config(text="开启开机自启")

    def toggle_auto_start(self):
        exe_full = get_exe_fullpath()
        exe_dir = get_app_dir()
        is_exe = getattr(sys, 'frozen', False)

        if not os.path.exists(exe_full):
            messagebox.showerror("错误", "程序路径不存在，无法设置自启！")
            return

        try:
            if self.is_autostart_enabled():
                key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Software\Microsoft\Windows\CurrentVersion\Run", 0, winreg.KEY_WRITE)
                winreg.DeleteValue(key, self.autostart_key_name)
                winreg.CloseKey(key)
                messagebox.showinfo("提示", "已关闭开机自启")
                self.log("&#9989;已关闭Windows开机自启")
            else:
                if not is_exe:
                    messagebox.showwarning("警告", "当前直接运行py源码，开机自启不会正常工作！\n请打包为exe程序后再开启自启。")
                cmd_str = f'cmd /c "cd /d "{exe_dir}" && start "" "{exe_full}" "'
                key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Software\Microsoft\Windows\CurrentVersion\Run", 0, winreg.KEY_WRITE)
                winreg.SetValueEx(key, self.autostart_key_name, 0, winreg.REG_SZ, cmd_str)
                winreg.CloseKey(key)
                messagebox.showinfo("提示", f"已开启开机自启")
                self.log(f"&#9989;已开启Windows开机自启，exe路径：{exe_full}")
            self.update_autostart_btn_text()
        except Exception as e:
            messagebox.showerror("错误", f"操作开机自启失败：{e}")
            self.log(f"开机自启操作异常：{e}")

    def toggle_monitor(self):
        if self.running:
            self.stop_monitor_inner()
        else:
            self.start_monitor_inner()

    def start_monitor_inner(self):
        if self.running:
            messagebox.showwarning("提示", "监控已经在运行！")
            return
        try:
            port = int(self.var_port.get())
            interval = int(self.var_interval.get())
            log_days = int(self.var_log_days.get())
            if interval  max_byte:
                self.log(f"&#9888;&#65039;日志文件超过{max_size_mb}MB，执行截断")
                with open(self.LOG_FILE, "r", encoding="utf-8") as f:
                    lines = f.readlines()
                new_lines = lines[len(lines) // 2:]
                with open(self.LOG_FILE, "w", encoding="utf-8") as f:
                    f.writelines(new_lines)

            now_ts = time.time()
            keep_sec = keep_days * 86400
            new_lines = []
            with open(self.LOG_FILE, "r", encoding="utf-8") as f:
                lines = f.readlines()
            for line in lines:
                keep_line = True
                try:
                    time_str = line.split(" - ", 1)[0]
                    log_time = time.strptime(time_str, "%Y-%m-%d %H:%M:%S")
                    log_ts = time.mktime(log_time)
                    if now_ts - log_ts > keep_sec:
                        keep_line = False
                except Exception:
                    pass
                if keep_line:
                    new_lines.append(line)
            with open(self.LOG_FILE, "w", encoding="utf-8") as f:
                f.writelines(new_lines)
            return True
        except Exception as e:
            self.log(f"&#9888;&#65039;日志清理异常：{e}")
            return False

    def manual_clean_log(self):
        try:
            days = int(self.var_log_days.get().strip())
            if days

---

[查看原文](https://www.52pojie.cn/thread-2123996-1-1.html)
