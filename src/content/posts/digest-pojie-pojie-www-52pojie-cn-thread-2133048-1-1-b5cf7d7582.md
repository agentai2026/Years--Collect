---
title: "为了一瓶醋，又包了顿饺子。"
published: 2026-10-18
description: "为了一瓶醋，包了一次饺子！ 这段时间有点忙职称晋升的事，立个flag,等职称晋升后，增加个功能： 把MAC分组，可能按组唤醒并机，主要是针对办公室里有多台电脑，同事下班后，都不关机就走了，电脑上还有工作界面，不安 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "hellovirus"
sourceLink: "https://www.52pojie.cn/thread-2133048-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2133048-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

为了一瓶醋，包了一次饺子！

这段时间有点忙职称晋升的事，立个flag,等职称晋升后，增加个功能：

把MAC分组，可能按组唤醒并机，主要是针对办公室里有多台电脑，同事下班后，都不关机就走了，电脑上还有工作界面，不安全，所以想把办公室中所有的电脑MAC汇总一下，到时候运行的电脑可以选择其余的全部关机，或者有选择性的关机，注意保留当做打印机主机的电脑。

这条是给自己做的便签，以后来完成。

先把事情的起因说一下：

我们科室有两个办公室，

距离相对来说比较远。其中另外一台电脑上有打印机，我所在的办公室没有打印机，

这两台电脑在一个局域网中。我把打印机做了一个网络共享，这样的话我的电脑上也可以使用打印机正常打印。

但是出现了两个问题：

第1个问题：是连接打印机的电脑长时间不动，会进入休眠模式。这时候我要想打印，就要先过去那个办公室，然后晃晃鼠标，再回来，才能正常使用。

第2个问题：是打完以后，我把打印的东西拿过来，可能会在我电脑上看看有没有再次需要打印的，如果没有，再回到那边关电脑，经常出现这种没有意义的来回跑动。

为了解决这个来回跑动唤醒和关机的问题，我就想能不能写一个软件，能实现远程唤醒和关机，所以我就让AI帮我写一个小程序，

写的过程中，我突然想到有一个飞鸽传书，又叫IPMSG的程序，我就能不能实现ip message的正常功能，

在这个基础上，额外加一个**远程关机和唤醒功能**，让它实现可以**聊天**，可以**自动传文件**（我可以把文件传过去，到那边打印也可以，为了麻烦，这个可以直接自动接收，不用再点确定接收），还可以远程唤醒关机，于是就有了我现在的这个小程序。

![](https://static.52pojie.cn/static/image/common/none.gif)

**ScreenShot_2026-10-18_121412_606.png** *(26.32 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4NjgwOHwzNDYyYWM3NXwxNzkyMzcxNDM5fDB8MjEzMzA0OA%3D%3D&nothumb=yes)

2026-10-18 12:15 上传

**PyMsg Pro**

>

基于 Python 实现的局域网飞鸽传书增强版，兼容 IPMsg 协议，局域网内聊天、文件传输、远程关机、网络唤醒工具。

**&#10024; 功能简介**

PyMsg Pro 是局域网即时通讯工具，对标经典飞鸽传书 (IPMsg)，在原版协议基础上做大量增强，无需服务器，依靠 UDP 广播在局域网工作。

**&#128232; 聊天功能**

    局域网点对点私聊，支持广播全员消息    聊天消息本地持久化保存，消息交替背景色，字体大小可调    新消息弹窗提醒；支持离开模式（在线但标记离开状态）    用户列表自动维护，显示 用户名@主机名、IP、MAC、在线状态    双击列表项复制名称 / IP / MAC，支持列表搜索过滤

**&#128193; 文件传输**

    点对点发送文件 / 文件夹（文件夹自动 zip 压缩传输）    断点续传，支持最大重试次数配置，多线程并发传输    传输面板展示上传下载进度，支持打开文件目录、复制路径    可设置自动接收文件到指定下载目录

**&#128736;&#65039; 远程控制**

[color=var(--md-box-color-fg)]    远程关机：向在线客户端发送关机指令，对方弹窗倒计时，支持取消关机

[color=var(--md-box-color-fg)]    WOL 网络唤醒：输入 MAC 地址发送魔术包，唤醒局域网内已关机主机

**&#129513; 增强特性（对比原版 IPMsg）**

    心跳保活机制：60 秒无活动自动探测，解决客户端异常下线后列表残留僵尸节点    MAC 地址查询协议，自动获取对端 MAC 地址，用于 WOL 唤醒    IP 变更自动识别迁移用户条目，IP 变化不会丢失用户信息    Windows 开机自启动（注册表优先，快捷方式降级兜底）    日志轮转记录，聊天历史、传输记录本地持久化    托盘后台运行，最小化到托盘，不占用任务栏

程序如下：[Asm] *纯文本查看* *复制代码*
#!/usr/bin/env python3# -*- coding: utf-8 -*-
"""
PyMsg Pro - 飞鸽传书增强版 (完整修复版)
修复：
  1. 关机指令失效问题（移除有害的UDP去重逻辑）
  2. 本机也显示 用户名@主机名
  3. 新增 MAC 查询/回复协议，解决后上线客户端获取不到前面客户端 MAC 的问题
  4. 双击"用户名@主机名"列自动复制
  5. 去掉标题轮播，固定显示 PyMsg Pro - IP:端口
  6. ★ 新增 Peer 超时淘汰机制（60秒无活动自动移除），修复下线后仍显示在线的问题
  7. ★ 自启动改用 注册表优先+Startup快捷方式降级 双模式，彻底解决路径/权限/CLIXML问题
特性：
  - 相邻消息背景色交替 (米白/浅黄) + 前景色 5 色柔和循环
"""

import socket, threading, time, os, sys, platform, json, io, zipfile, uuid, subprocess, logging, random
from collections import deque
from logging.handlers import TimedRotatingFileHandler
import tkinter as tk
from tkinter import ttk, scrolledtext, filedialog, messagebox, simpledialog
from datetime import datetime
from PIL import Image, ImageDraw
import pystray

# ============================================================
# IPMsg 协议常量与工具函数
# ============================================================
IPMSG_VERSION, IPMSG_DEFAULT_PORT = 1, 2425
IPMSG_BR_ENTRY, IPMSG_BR_EXIT, IPMSG_ANSENTRY = 0x01, 0x02, 0x03
IPMSG_BR_ABSENCE = 0x04                 # ★新增：离开模式/昵称变更（IPMSG 标准命令）
IPMSG_SENDMSG, IPMSG_RECVMSG = 0x20, 0x21
IPMSG_GETFILEDATA = 0x60
IPMSG_GETDIRFILES = 0x62                 # ★修正：标准值 0x62（原 0x63 与官方客户端不通）
IPMSG_GETDIRFILES_LEGACY = 0x63          # 兼容旧版 PyMsg
IPMSG_SENDCHECKOPT, IPMSG_ABSENCEOPT = 0x100, 0x100
IPMSG_FILEATTACHOPT, IPMSG_CAPUTF8OPT = 0x200000, 0x1000000
IPMSG_DIALUPOPT = 0x10000                # 收不到广播的成员，需单独单播通知
IPMSG_FILE_REGULAR = 0x01
IPMSG_CUSTOM_SHUTDOWN, IPMSG_SHUTDOWN_CANCEL = 0x80, 0x81
IPMSG_PING, IPMSG_PONG, IPMSG_FILE_RECV_OK = 0x82, 0x83, 0x84
IPMSG_MAC_QUERY, IPMSG_MAC_REPLY = 0x85, 0x86
IPMSG_PYMSG_FLAG = 0x20000
IPMSG_HEARTBEAT_OPT = 0x40000            # ★新增：该 BR_ENTRY 只是心跳，收到无需回 ANSENTRY

# ============================================================
# ★ 在线用户（Peer）管理参数 —— 针对原版 IPMSG 硬伤的增强
#   硬伤：①无心跳->僵尸列表 ②无状态机->只有"在/不在" ③无离开态
#        ④UDP 丢包导致漏人/漏删 ⑤应答广播风暴
# ============================================================
HEARTBEAT_INTERVAL = 15      # 心跳周期(秒)：周期广播 BR_ENTRY 当心跳
PEER_TIMEOUT = 45            # 超过该时长未收到任何报文 -> 转入"探测中"
PROBE_INTERVAL = 4           # 探测中时 PING 的间隔(秒)
PROBE_MAX_MISS = 3           # 连续探测无应答次数 -> 判定离线并移除
ANS_DELAY_MAX = 4.0          # ANSENTRY 随机延迟上限(秒)，IPMSG 原版 0~4 秒，抑制风暴
PRESENCE_DEDUPE_WIN = 2.0    # BR_ENTRY/ANSENTRY 去重窗口(秒)，防止重发包被重复处理
ENTRY_RETRY = 3              # 上线广播重发次数
ENTRY_RETRY_GAP = 0.4
EXIT_RETRY = 3               # 下线广播重发次数（最关键的报文，宁可多发）
EXIT_RETRY_GAP = 0.25
MAC_QUERY_MIN_GAP = 15       # 同一 peer 的 MAC 查询最小间隔(秒)

def get_command(cmd): return cmd & 0xFF

def get_flags(cmd): return cmd & 0xFFFFFF00

CLIENT_TYPE_UNKNOWN, CLIENT_TYPE_PYMSG, CLIENT_TYPE_IPMSG = "unknown", "pymsg", "ipmsg"

def get_data_dir():
    base = os.path.join(os.environ.get('APPDATA', os.path.expanduser('~')),
                        'PyMsgPro') if platform.system() == "Windows" else os.path.join(os.path.expanduser('~'),
                                                                                        '.pymsgpro')
    for d in ['', 'history', 'logs', 'temp']: os.makedirs(os.path.join(base, d), exist_ok=True)
    return base

DATA_DIR = get_data_dir()
CONFIG_FILE = os.path.join(DATA_DIR, 'config.json')
GLOBAL_HISTORY_FILE = os.path.join(DATA_DIR, 'global_chat.json')
TRANSFER_HISTORY_FILE = os.path.join(DATA_DIR, 'transfer_history.json')
LOG_DIR = os.path.join(DATA_DIR, 'logs')

class FileLogger:
    def __init__(self):
        os.makedirs(LOG_DIR, exist_ok=True)
        self.logger = logging.getLogger('PyMsgPro')
        self.logger.setLevel(logging.DEBUG)
        if not self.logger.handlers:
            handler = TimedRotatingFileHandler(os.path.join(LOG_DIR, 'pymsg.log'), when='midnight', interval=1,
                                               backupCount=30, encoding='utf-8')
            handler.setFormatter(logging.Formatter('[%(asctime)s] %(message)s', datefmt='%H:%M:%S'))
            self.logger.addHandler(handler)

    def info(self, msg): self.logger.info(msg)

    def debug(self, msg): self.logger.debug(msg)

    def warning(self, msg): self.logger.warning(msg)

class Config:
    def __init__(self):
        self.data = {
            'username': '', 'hostname': '', 'port': 9999,
            'download_dir': os.path.join(os.path.expanduser('~'), 'PyMsgDownloads'),
            'aliases': {}, 'mac_addresses': {}, 'auto_start': False, 'auto_download': False, 'accept_shutdown': True,
            'max_retry': 3, 'max_threads': 4,
            # ★ 在线用户管理相关配置
            'heartbeat_interval': HEARTBEAT_INTERVAL,   # 心跳周期(秒)
            'peer_timeout': PEER_TIMEOUT,               # 多久没消息就转"探测中"(秒)
            'absence_mode': False,                      # 离开模式
            'absence_msg': '暂时离开，稍后回复',
        }
        self.load()

    def load(self):
        try:
            if os.path.exists(CONFIG_FILE):
                with open(CONFIG_FILE, 'r', encoding='utf-8') as f: self.data.update(json.load(f))
        except:
            pass

    def save(self):
        try:
            with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
                json.dump(self.data, f, ensure_ascii=False, indent=2)
        except:
            pass

    def get(self, k, d=None):
        return self.data.get(k, d)

    def set(self, k, v):
        self.data[k] = v; self.save()

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM);
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0];
        s.close();
        return ip
    except:
        return "127.0.0.1"

def get_hostname():
    try:
        return socket.gethostname()
    except:
        return "Unknown"

def get_username():
    try:
        return os.getlogin()
    except:
        return os.environ.get('USERNAME', os.environ.get('USER', 'User'))

def format_size(size):
    if size  10000: self.messages = self.messages[-8000:]
            self._save()
            return len(self.messages) - 1

    def get_all(self):
        with self.lock: return list(self.messages)

    def clear(self):
        with self.lock: self.messages = []; self._save()

class IPMsgPacket:
    def __init__(self, ver=1, pno=0, sender="", host="", cmd=0, add=""):
        self.ver = ver;
        self.pno = pno;
        self.sender = sender;
        self.host = host;
        self.cmd = cmd;
        self.add = add

    def encode(self):
        return f"{self.ver}:{self.pno}:{self.sender}:{self.host}:{self.cmd}:{self.add}"

    def bytes(self):
        return self.encode().encode('utf-8', errors='replace')

    @staticmethod
    def decode(data):
        try:
            t = data.decode('utf-8') if isinstance(data, bytes) else data
            if not t: t = data.decode('gbk', errors='ignore')
            p = t.split(':', 5)
            if len(p)  5 else ""
            return pkt
        except:
            return None

class FileInfo:
    def __init__(self, no=0, name="", size=0, mtime=0, type=1, content=""):
        self.no = no;
        self.name = name;
        self.size = size;
        self.mtime = mtime;
        self.type = type;
        self.content = content

    def encode(self):
        return f"{self.no:x}:{self.name}:{self.size:x}:{self.mtime:x}:{self.type:x}:{self.content}"

    @staticmethod
    def parse(add):
        files = []
        if not add: return files
        for part in add.split('\0'):
            if not part.strip(): continue
            try:
                f = part.split(':')
                if len(f) >= 5:
                    fi = FileInfo()
                    fi.no = int(f[0], 16);
                    fi.name = f[1]
                    fi.size = int(f[2], 16) if f[2] else 0
                    fi.mtime = int(f[3], 16) if f[3] else 0
                    fi.type = int(f[4], 16) if f[4] else 1
                    if len(f) > 5: fi.content = f[5]
                    files.append(fi)
            except:
                continue
        return files

class PeerInfo:
    """★ 在线用户条目：带状态机，而不是简单的"在/不在"

    状态流转：
        online ──(超时未收到报文)──&#9654; probing ──(PING 连续无应答)──&#9654; 移除(offline)
          ▲                            │
          └────────(收到任何报文/PONG)──┘
        online &#8644; absence（IPMSG_BR_ABSENCE：离开模式，仍在线）
    """
    ST_ONLINE, ST_ABSENCE, ST_PROBING = "online", "absence", "probing"
    STATE_TEXT = {ST_ONLINE: "在线", ST_ABSENCE: "离开", ST_PROBING: "掉线?"}

    def __init__(self, ip="", user="", host="", port=2425):
        self.ip = ip
        self.user = user
        self.host = host
        self.port = port
        self.alias = ""
        self.mac = ""
        self.is_local = False
        self.ctype = CLIENT_TYPE_UNKNOWN
        # ---- 状态 ----
        self.status = self.ST_ONLINE
        self.absence_msg = ""
        self.last_seen = time.time()      # 最后一次收到该 peer 的任何报文
        self.last_probe = 0.0             # 最后一次主动探测(PING)时间
        self.probe_missed = 0             # 连续探测未应答次数
        self.last_mac_query = 0.0         # MAC 查询节流
        self.first_seen = time.time()

    @property
    def uid(self):
        """身份键：用户名@主机名（IP 会变，这个不会）"""
        return f"{self.user}@{self.host}"

    def is_pymsg(self): return self.ctype == CLIENT_TYPE_PYMSG

    def touch(self):
        """收到该 peer 的任何报文 -> 刷新存活时间"""
        return self.mark_alive()

    def mark_alive(self):
        """刷新存活时间；若此前处于"掉线?"则恢复。返回状态是否发生变化"""
        self.last_seen = time.time()
        recovered = False
        if self.status == self.ST_PROBING:
            self.status = self.ST_ABSENCE if self.absence_msg else self.ST_ONLINE
            recovered = True
        self.probe_missed = 0
        return recovered

    def set_absence(self, on, msg=""):
        self.status = self.ST_ABSENCE if on else self.ST_ONLINE
        self.absence_msg = msg if on else ""
        self.last_seen = time.time()
        self.probe_missed = 0

    def state_text(self):
        if self.is_local: return "本机"
        return self.STATE_TEXT.get(self.status, "在线")

    def display_name(self):
        prefix = "&#127968;" if self.is_local else (
            "★" if self.ctype == CLIENT_TYPE_PYMSG else ("●" if self.ctype == CLIENT_TYPE_IPMSG else "○"))
        name = self.alias if self.alias else self.user
        base = f"{prefix} {name}@{self.host}" if self.host else f"{prefix} {name}"
        if self.is_local: return base
        if self.status == self.ST_ABSENCE:
            return base + " &#128164;"
        if self.status == self.ST_PROBING:
            return base + " &#9203;"
        return base

class TransferTask:
    PENDING, RUNNING, WAIT_ACK, DONE, DONE_UNCONFIRMED, FAILED, RETRYING = "等待中", "传输中", "等待确认", "完成", "完成 (未确认)", "失败", "重试中"

    def __init__(self, tid, ip, port, fi, path="", dir="receive"):
        self.tid = tid;
        self.ip = ip;
        self.port = port;
        self.fi = fi;
        self.path = path;
        self.dir = dir
        self.status = self.PENDING;
        self.prog = 0.0;
        self.recv = 0;
        self.speed = 0.0;
        self.retry = 0
        self.cancelled = False;
        self.start_time = 0;
        self.data_done = False;
        self.max_retry = 3
        self.error = ""

    def to_dict(self):
        return {'tid': self.tid, 'ip': self.ip, 'port': self.port, 'fi_no': self.fi.no, 'fi_name': self.fi.name,
                'fi_size': self.fi.size, 'path': self.path, 'dir': self.dir, 'status': self.status, 'prog': self.prog,
                'time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

    @staticmethod
    def from_dict(d):
        fi = FileInfo(no=d.get('fi_no', 0), name=d.get('fi_name', ''), size=d.get('fi_size', 0))
        t = TransferTask(d['tid'], d['ip'], d.get('port', 2425), fi, d.get('path', ''), d.get('dir', 'receive'))
        t.status = d.get('status', TransferTask.DONE);
        t.prog = d.get('prog', 100.0)
        return t

class TransferQueue:
    def __init__(self, engine, config, app):
        self.engine = engine;
        self.config = config;
        self.app = app
        self.tasks = [];
        self.lock = threading.Lock();
        self.tid = 0
        self.running = True;
        self._load_history()
        threading.Thread(target=self._loop, daemon=True).start()
        threading.Thread(target=self._ack_loop, daemon=True).start()

    def _load_history(self):
        try:
            if os.path.exists(TRANSFER_HISTORY_FILE):
                with open(TRANSFER_HISTORY_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                for d in data:
                    t = TransferTask.from_dict(d);
                    self.tasks.append(t)
                    if t.tid > self.tid: self.tid = t.tid
        except:
            pass

    def _save_history(self):
        tmp = TRANSFER_HISTORY_FILE + ".tmp"
        try:
            with self.lock:
                data = [t.to_dict() for t in self.tasks]
            with open(tmp, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=1)
            os.replace(tmp, TRANSFER_HISTORY_FILE)
        except:
            pass

    def add_recv(self, ip, port, fi, path):
        with self.lock:
            self.tid += 1;
            t = TransferTask(self.tid, ip, port, fi, path, "receive")
            t.max_retry = self.config.get('max_retry', 3);
            self.tasks.append(t)
            self.app.root.after_idle(lambda t=t: self.app.ui_add_task(t))
        self._save_history();
        return t

    def add_send(self, ip, port, fi):
        with self.lock:
            self.tid += 1;
            t = TransferTask(self.tid, ip, port, fi, dir="send")
            self.tasks.append(t);
            self.app.root.after_idle(lambda t=t: self.app.ui_add_task(t))
        self._save_history();
        return t

    def get_send(self, fno):
        with self.lock:
            for t in self.tasks:
                if t.dir == "send" and t.fi.no == fno: return t
        return None

    def has_active(self):
        with self.lock: return any(
            t.status in (TransferTask.PENDING, TransferTask.RUNNING, TransferTask.RETRYING, TransferTask.WAIT_ACK) for t
            in self.tasks)

    def cancel_all(self):
        with self.lock:
            for t in self.tasks:
                if t.status in (TransferTask.PENDING, TransferTask.RUNNING, TransferTask.RETRYING,
                                TransferTask.WAIT_ACK):
                    t.cancelled = True;
                    t.status = TransferTask.FAILED
        self._save_history()

    def _loop(self):
        while self.running:
            t = self._next_recv()
            if t:
                self._do_recv(t)
            else:
                time.sleep(0.5)

    def _ack_loop(self):
        while self.running:
            time.sleep(5);
            now = time.time();
            changed = False
            with self.lock:
                for t in self.tasks:
                    if t.dir == "send" and t.status == TransferTask.WAIT_ACK and t.data_done and (
                            now - t.start_time) > 60:
                        t.status = TransferTask.DONE_UNCONFIRMED
                        self.app.root.after_idle(lambda t=t: self.app.ui_upd_task(t));
                        changed = True
            if changed: self._save_history()

    def _next_recv(self):
        with self.lock:
            if sum(1 for t in self.tasks if t.status == TransferTask.RUNNING and t.dir == "receive") >= self.config.get(
                'max_threads', 4): return None
            for t in self.tasks:
                if t.status == TransferTask.PENDING and t.dir == "receive": return t
        return None

    def _do_recv(self, t):
        t.status = TransferTask.RUNNING;
        t.start_time = time.time();
        self._notify(t)
        ok = False
        try:
            ok = self._download(t)
        except Exception as e:
            t.error = str(e)
        if t.cancelled: return
        if ok:
            t.status = TransferTask.DONE;
            t.prog = 100.0
            try:
                if os.path.exists(t.path + ".part"):
                    if os.path.exists(t.path): os.remove(t.path)
                    os.rename(t.path + ".part", t.path)
                if os.path.exists(t.path + ".meta"): os.remove(t.path + ".meta")
            except Exception as e:
                t.status = TransferTask.FAILED; ok = False
            if ok and self.engine:
                try:
                    self.engine.send_pkt(
                        IPMsgPacket(pno=self.engine.next_pno(), sender=self.engine.user, host=self.engine.host,
                                    cmd=IPMSG_FILE_RECV_OK | IPMSG_CAPUTF8OPT, add=str(t.fi.no)), t.ip, t.port)
                except:
                    pass
        else:
            if not t.cancelled:
                t.retry += 1
                if t.retry  0 else 0
        if t.start_time == 0: t.start_time = time.time(); t.status = TransferTask.RUNNING
        t.speed = sent / (time.time() - t.start_time) if time.time() - t.start_time > 0 else 0
        self._notify(t)

    def mark_send_done(self, t):
        t.data_done = True; t.status = TransferTask.WAIT_ACK; t.prog = 100.0; self._notify(t); self._save_history()

    def confirm_send(self, fno):
        t = self.get_send(fno)
        if t and t.status in (TransferTask.WAIT_ACK, TransferTask.RUNNING):
            t.status = TransferTask.DONE;
            t.prog = 100.0;
            self._notify(t);
            self._save_history();
            return True
        return False

    def fail_send(self, t, err=""):
        if t.status not in (TransferTask.DONE, TransferTask.WAIT_ACK, TransferTask.DONE_UNCONFIRMED):
            t.status = TransferTask.FAILED;
            t.error = err
            self._notify(t);
            self._save_history()

    def _download(self, t):
        total = t.fi.size;
        offset = 0
        if os.path.exists(t.path + ".part") and os.path.exists(t.path + ".meta"):
            try:
                with open(t.path + ".meta") as f:
                    m = json.load(f)
                if m.get('no') == t.fi.no: offset = m.get('recv', 0)
            except:
                pass
        if offset >= total: return True
        try:
            if offset == 0:
                with open(t.path + ".part", 'wb') as f:
                    if total > 0: f.seek(total - 1); f.write(b'\0')
        except:
            return False
        return self._dl_single(t, offset, total)

    def _dl_single(self, t, offset, total):
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM);
            s.settimeout(60);
            s.connect((t.ip, t.port))
            s.sendall(IPMsgPacket(pno=self.engine.next_pno(), sender=self.engine.user, host=self.engine.host,
                                  cmd=IPMSG_GETFILEDATA, add=f"{t.fi.no:x}:{offset:x}").bytes())
            recv = offset;
            st = time.time()
            with open(t.path + ".part", 'r+b') as f:
                if offset > 0: f.seek(offset)
                while recv  0 else 0
                    self._notify(t)
            s.close();
            return recv >= total
        except:
            return False

    def cleanup(self):
        with self.lock:
            before = len(self.tasks)
            self.tasks = [t for t in self.tasks if
                          t.status not in (TransferTask.DONE, TransferTask.FAILED, TransferTask.DONE_UNCONFIRMED)]
            removed = before - len(self.tasks)
        if removed > 0: self._save_history(); self.app.root.after_idle(lambda: self.app._refresh_trans_ui())
        return removed

class Engine:
    PEER_TIMEOUT = PEER_TIMEOUT          # 兼容旧引用

    def __init__(self, app, cfg, file_logger):
        self.app = app
        self.cfg = cfg
        self.flog = file_logger
        self.user = cfg.get('username') or get_username()
        self.host = cfg.get('hostname') or get_hostname()
        self.port = cfg.get('port', 9999)
        self.ip = get_local_ip()
        self.bcasts = get_subnet_broadcasts()
        self.udp = None
        self.tcp = None
        self.running = False
        self.pno = int(time.time()) & 0xFFFFFFFF
        self.lock = threading.Lock()          # 保护 pno / pending
        self.peers_lock = threading.RLock()   # ★ 保护 peers 及其索引
        self.peers = {}
        self.uid_index = {}                   # ★ "user@host" -> ip（身份键，IP 变了也能认出来）
        self.mac_index = {}                   # ★ MAC -> ip
        self.pending = {}
        self.fcnt = 1
        self.mac = get_local_mac(self.ip)
        self.offline = False
        self.absence = bool(cfg.get('absence_mode', False))   # ★ 离开模式
        self.absence_msg = cfg.get('absence_msg', '暂时离开，稍后回复')
        # ★ presence 辅助结构
        self._my_pnos = deque(maxlen=256)     # 自己发出去的包编号（回环/多实例防护）
        self._recent = {}                     # (ip, cmd) -> 时间，presence 去重
        self._ans_pending = {}                # ip -> Timer，ANSENTRY 随机延迟队列
        self._last_heartbeat = 0.0
        self.hb_interval = float(cfg.get('heartbeat_interval', HEARTBEAT_INTERVAL) or HEARTBEAT_INTERVAL)
        self.peer_timeout = float(cfg.get('peer_timeout', PEER_TIMEOUT) or PEER_TIMEOUT)
        if self.mac:
            m = self.cfg.get('mac_addresses', {})
            m[self.ip] = self.mac
            self.cfg.set('mac_addresses', m)

    def next_pno(self):
        with self.lock: self.pno = (self.pno + 1) & 0xFFFFFFFF; return self.pno

    def send_pkt(self, pkt, addr, port=None):
        if not self.udp: return False
        # ★ 离线时仍允许发出 BR_EXIT（否则"下线"按钮广播不出去，别人只能等超时）
        if self.offline and get_command(pkt.cmd) != IPMSG_BR_EXIT: return False
        try:
            self._my_pnos.append(pkt.pno)
            self.udp.sendto(pkt.bytes(), (addr, port or self.port))
            return True
        except:
            return False

    def start(self):
        self.running = True;
        self.offline = False
        self.udp = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.udp.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        try:
            self.udp.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEPORT, 1)
        except:
            pass
        self.udp.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
        self.udp.bind(('0.0.0.0', self.port));
        self.udp.settimeout(1.0)
        self.tcp = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.tcp.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.tcp.bind(('0.0.0.0', self.port));
        self.tcp.listen(20);
        self.tcp.settimeout(1.0)
        threading.Thread(target=self._udp_loop, daemon=True).start()
        threading.Thread(target=self._tcp_loop, daemon=True).start()
        threading.Thread(target=self._presence_loop, daemon=True).start()   # ★ 心跳+状态机
        lp = PeerInfo(self.ip, self.user, self.host, self.port)
        lp.mac = self.mac
        lp.is_local = True
        lp.ctype = CLIENT_TYPE_PYMSG
        lp.status = PeerInfo.ST_ABSENCE if self.absence else PeerInfo.ST_ONLINE
        with self.peers_lock:
            self.peers[self.ip] = lp
            self.uid_index[lp.uid] = self.ip
        self.app.root.after(0, lambda: self.app.ui_add_peer(lp))
        self.app.root.after(300, self.send_entry)
        self.app.root.after(1500, self._startup_resend)

    def _startup_resend(self):
        if self.running and not self.offline:
            self.send_entry()
            self.flog.info("已自动补发上线广播（UDP 不可靠，冗余重发）")

    def stop(self):
        """退出：先广播下线（重发多次），再停线程"""
        was_offline = self.offline
        self.offline = False            # ★ 允许把 BR_EXIT 发出去
        self.send_exit()
        self.running = False
        self.offline = was_offline

    def go_offline(self):
        """真·离线：不再参与网络"""
        self.send_exit(); self.offline = True
        with self.peers_lock:
            for ip, p in list(self.peers.items()):
                if not p.is_local:
                    self.peers.pop(ip, None)
                    self.uid_index.pop(p.uid, None)
                    self.app.root.after(0, lambda i=ip: self.app.ui_rem_peer(i))
        self.flog.info("已暂时下线（已广播 BR_EXIT 并清空列表）")

    def go_online(self):
        self.offline = False
        self.send_entry()
        self.flog.info("已重新上线（已广播 BR_ENTRY）")

    # ---------------------------------------------------------------
    # ★ 成员识别命令：上线 / 下线 / 应答 / 离开 / 心跳
    # ---------------------------------------------------------------
    def _bcast_repeat(self, pkt, times=1, gap=0.4, sync=False):
        """广播并冗余重发，弥补 UDP 无确认的丢包"""
        def _go():
            for i in range(max(1, times)):
                if not self.running and get_command(pkt.cmd) != IPMSG_BR_EXIT: break
                for b in self.bcasts: self.send_pkt(pkt, b)
                if i  {ip}，条目已迁移")
            if p is None:
                p = PeerInfo(ip, user, host, port)
                p.alias = self.cfg.get('aliases', {}).get(ip, '')
                p.mac = self.cfg.get('mac_addresses', {}).get(ip, '')
                self.peers[ip] = p
                self.flog.info(f"新增在线用户 {uid} ({ip}:{port})")
            else:
                p.user = user
                p.host = host
            p.port = port or p.port
            if ctype is not None: p.ctype = ctype
            recovered = p.mark_alive()
            if absence is not None:
                p.set_absence(absence, absence_msg or "")
            elif p.status not in (PeerInfo.ST_ABSENCE, PeerInfo.ST_PROBING):
                p.status = PeerInfo.ST_ONLINE
            self.uid_index[uid] = ip
            if p.mac: self.mac_index[p.mac.upper()] = ip
            return p, recovered

    def del_peer(self, ip, reason=""):
        with self.peers_lock:
            p = self.peers.pop(ip, None)
            if p:
                self.uid_index.pop(p.uid, None)
                if p.mac and self.mac_index.get(p.mac.upper()) == ip:
                    self.mac_index.pop(p.mac.upper(), None)
        if p and not p.is_local:
            self.app.root.after(0, lambda: self.app.ui_rem_peer(ip))
            self.flog.info(f"移除 {p.uid}({ip})：{reason}")
        return p

    def _is_dup(self, ip, cmd):
        """★ presence 命令短窗口去重：重发的同命令不重复处理（消息类命令不参与）"""
        if cmd not in (IPMSG_BR_ENTRY, IPMSG_ANSENTRY, IPMSG_BR_ABSENCE): return False
        now = time.time()
        key = (ip, cmd)
        if now - self._recent.get(key, 0)  探测中(PING) --连续无应答--> 移除
    # ---------------------------------------------------------------
    def _presence_loop(self):
        while self.running:
            try:
                time.sleep(1)
                if self.running and not self.offline:
                    self._tick()
            except Exception:
                continue

    def _tick(self):
        now = time.time()
        # 1) 周期心跳：广播 BR_ENTRY（带 HEARTBEAT 标记，对方不回 ANS，成本 O(N)）
        if now - self._last_heartbeat >= self.hb_interval:
            self._last_heartbeat = now
            self.send_entry(heartbeat=True)
        # 2) IP 变化自动重播（IPMSG 的 /IPCHANGE_REFRESH 思路）
        self._check_ip_changed()
        # 3) 状态机巡检
        self.sweep_peers()

    def _check_ip_changed(self):
        cur = get_local_ip()
        if not cur or cur == self.ip: return
        old = self.ip
        with self.peers_lock:
            lp = self.peers.pop(old, None)
        if lp and lp.is_local: self.app.root.after(0, lambda: self.app.ui_rem_peer(old))
        self.ip = cur
        self.bcasts = get_subnet_broadcasts()
        self.mac = get_local_mac(cur) or self.mac
        if self.mac:
            m = self.cfg.get('mac_addresses', {})
            m[cur] = self.mac
            self.cfg.set('mac_addresses', m)
        lp = PeerInfo(cur, self.user, self.host, self.port)
        lp.mac = self.mac
        lp.is_local = True
        lp.ctype = CLIENT_TYPE_PYMSG
        with self.peers_lock:
            self.peers[cur] = lp
            self.uid_index[lp.uid] = cur
        self.app.root.after(0, lambda: self.app.ui_add_peer(lp))
        self.app.root.after(0, self.app._update_title)
        self.send_entry(repeat=ENTRY_RETRY)
        self.flog.info(f"检测到本机 IP 变更 {old} -> {cur}，已重新广播上线")

    def sweep_peers(self):
        """巡检所有 peer：超时转探测，连续探测无应答才移除（避免误杀静默节点）"""
        now = time.time()
        with self.peers_lock:
            snapshot = [(p.ip, p) for p in self.peers.values() if not p.is_local]
        for ip, p in snapshot:
            idle = now - p.last_seen
            if idle  进入探测态（UI 显示 &#9203;，不立即删除）
            if p.status != PeerInfo.ST_PROBING:
                p.status = PeerInfo.ST_PROBING
                p.probe_missed = 0
                p.last_probe = 0.0
                self.flog.info(f"{p.uid}({ip}) 已 {int(idle)}s 无报文，转入探测")
                self.app.root.after(0, lambda pp=p: self.app.ui_add_peer(pp))
            if now - p.last_probe >= PROBE_INTERVAL:
                p.last_probe = now
                p.probe_missed += 1
                self.send_ping(ip, p.port)
                if p.probe_missed >= PROBE_MAX_MISS:
                    self.del_peer(ip, f"连续 {p.probe_missed} 次探测无应答（{int(idle)}s 无活动）")
                    try:
                        ts = datetime.now().strftime('%H:%M:%S')
                        self.app.root.after(0, lambda pp=p: self.app._append_to_chat(
                            {'type': 'sys', 'msg': f"○ {pp.user}({pp.ip}) 已离线", 'time': ts}))
                    except Exception:
                        pass

    def _udp_loop(self):
        while self.running:
            try:
                d, a = self.udp.recvfrom(65535)
                if d:
                    p = IPMsgPacket.decode(d)
                    if p: threading.Thread(target=self._handle, args=(p, a), daemon=True).start()
            except:
                continue

    def _handle(self, p, a):
        if self.offline: return
        cmd = get_command(p.cmd)
        flags = get_flags(p.cmd)
        ip, port = a
        if ip == self.ip: return
        if p.pno and p.pno in self._my_pnos: return   # ★ 自己发出去的包（回环/多实例）
        if self._is_dup(ip, cmd): return              # ★ presence 重发包去重

        # ★ 任何来自该 peer 的报文都算"还活着"
        with self.peers_lock:
            exist = self.peers.get(ip)
        if exist and exist.mark_alive():
            self.app.root.after(0, lambda: self.app.ui_add_peer(exist))

        if cmd == IPMSG_BR_ENTRY:
            ct = CLIENT_TYPE_PYMSG if flags & IPMSG_PYMSG_FLAG else CLIENT_TYPE_IPMSG
            absence = bool(flags & IPMSG_ABSENCEOPT)
            peer, _ = self.upsert_peer(ip, port, p.sender, p.host, ct, absence, p.add if absence else "")
            # ★ 心跳包不回 ANSENTRY：否则 N 台机器 × 每 15 秒 = 广播风暴
            if not (flags & IPMSG_HEARTBEAT_OPT):
                self.send_ans(ip, port)
            self._maybe_query_mac(peer)
            self.app.root.after(0, lambda: self.app.ui_add_peer(peer))
        elif cmd == IPMSG_BR_EXIT:
            self.del_peer(ip, "收到下线通知 BR_EXIT")
        elif cmd == IPMSG_ANSENTRY:
            ct = CLIENT_TYPE_PYMSG if flags & IPMSG_PYMSG_FLAG else CLIENT_TYPE_IPMSG
            absence = bool(flags & IPMSG_ABSENCEOPT)
            peer, _ = self.upsert_peer(ip, port, p.sender, p.host, ct, absence, p.add if absence else "")
            self._maybe_query_mac(peer)
            self.app.root.after(0, lambda: self.app.ui_add_peer(peer))
        elif cmd == IPMSG_BR_ABSENCE:
            # ★ 离开模式/昵称变更：只更新状态，不回 ANS（与 IPMSG 规范一致）
            ct = CLIENT_TYPE_PYMSG if flags & IPMSG_PYMSG_FLAG else CLIENT_TYPE_IPMSG
            absence = bool(flags & IPMSG_ABSENCEOPT)
            peer, _ = self.upsert_peer(ip, port, p.sender, p.host, ct, absence, p.add)
            self.app.root.after(0, lambda: self.app.ui_add_peer(peer))
            self.flog.info(f"{peer.uid}({ip}) 状态变更为：{peer.state_text()}")
        elif cmd == IPMSG_MAC_QUERY:
            self.send_mac_reply(ip, port)
        elif cmd == IPMSG_MAC_REPLY:
            mac = p.add.strip().upper().replace('-', ':')
            if mac and len(mac.replace(':', '')) == 12:
                macs = self.cfg.get('mac_addresses', {})
                macs[ip] = mac
                self.cfg.set('mac_addresses', macs)
                with self.peers_lock:
                    peer = self.peers.get(ip)
                if peer:
                    peer.mac = mac
                    self.mac_index[mac] = ip
                    self.app.root.after(0, lambda: self.app.ui_add_peer(peer))
                self.flog.info(f"已获取 {ip} 的 MAC: {mac}")
        elif cmd == IPMSG_SENDMSG:
            # ★ 陌生人发消息：先确认对方身份再加进列表（NOADDLISTOPT 时只回执不入库）
            with self.peers_lock:
                known = ip in self.peers
            if not known:
                ct = CLIENT_TYPE_PYMSG if flags & IPMSG_PYMSG_FLAG else CLIENT_TYPE_UNKNOWN
                peer, _ = self.upsert_peer(ip, port, p.sender, p.host, ct)
                self._maybe_query_mac(peer)
                self.app.root.after(0, lambda: self.app.ui_add_peer(peer))
            if flags & IPMSG_SENDCHECKOPT: self.send_recv(ip, port, p.pno)
            if get_flags(p.cmd) & IPMSG_SENDCHECKOPT: self.send_recv(ip, port, p.pno)
            if get_flags(p.cmd) & IPMSG_FILEATTACHOPT:
                parts = p.add.split('\0', 1)
                msg = parts[0]
                fis = FileInfo.parse(parts[1] if len(parts) > 1 else "")
                if msg: self.app.root.after(0, lambda: self.app.recv_msg(ip, p.sender, msg))
                if fis: self.app.root.after(0,
                                            lambda fi=fis, s=p.sender, i=ip, pt=port: self.app.recv_files(i, s, fi, pt))
            else:
                if p.add: self.app.root.after(0, lambda: self.app.recv_msg(ip, p.sender, p.add))
        elif cmd == IPMSG_RECVMSG:
            self.flog.info(f"消息已送达 (#{p.add}) -> {ip}")
        elif cmd in (IPMSG_GETFILEDATA, IPMSG_GETDIRFILES, IPMSG_GETDIRFILES_LEGACY):
            parts = p.add.split(':')
            try:
                fno = int(parts[0], 16); off = int(parts[1], 16) if len(parts) > 1 else 0
            except:
                return
            threading.Thread(target=self._serve_tcp, args=(ip, port, fno, off), daemon=True).start()
        elif cmd == IPMSG_CUSTOM_SHUTDOWN:
            self.flog.info(f"收到关机指令 from {p.sender}({ip})")
            if self.cfg.get('accept_shutdown', True):
                self.app.root.after(0, lambda: self.app.show_shutdown(p.sender, ip))
        elif cmd == IPMSG_PING:
            self.send_pong(ip, port, p.add)
        elif cmd == IPMSG_PONG:
            # ★ 探测应答：peer 复活
            with self.peers_lock:
                peer = self.peers.get(ip)
            if peer and peer.mark_alive():
                self.app.root.after(0, lambda: self.app.ui_add_peer(peer))
            self.app.root.after(0, lambda p=p, i=ip: self.app.handle_pong(p, i))
        elif cmd == IPMSG_FILE_RECV_OK:
            try:
                fno = int(p.add.strip()); self.app.tq.confirm_send(fno)
            except:
                pass

    def _maybe_query_mac(self, peer):
        """MAC 补齐，带节流，避免每次心跳都问一遍"""
        if peer.is_local or peer.mac: return
        now = time.time()
        if now - peer.last_mac_query  1 else 0
                except:
                    s.close(); return
                self._send_file(s, fno, off)
            else:
                s.close()
        except:
            try:
                s.close()
            except:
                pass

    def _send_file(self, s, fno, off=0):
        t = None
        try:
            if self.app.tq: t = self.app.tq.get_send(fno)
            with self.lock:
                if fno not in self.pending: s.close(); return
                path, is_dir, zdata = self.pending[fno]
            total = len(zdata) if (is_dir and zdata) else os.path.getsize(path)
            if is_dir and zdata:
                s.sendall(zdata[off:] if off > 0 else zdata)
            elif os.path.isfile(path):
                sent = off
                with open(path, 'rb') as f:
                    if off > 0: f.seek(off)
                    while True:
                        c = f.read(1048576)
                        if not c: break
                        s.sendall(c);
                        sent += len(c)
                        if t: self.app.tq.upd_send(t, sent, total)
            try:
                s.shutdown(socket.SHUT_WR)
            except:
                pass
            s.close()
            if t: self.app.tq.mark_send_done(t)
        except Exception as e:
            if t: self.app.tq.fail_send(t, str(e))
            try:
                s.close()
            except:
                pass

    def _serve_tcp(self, ip, port, fno, off):
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM);
            s.settimeout(30);
            s.connect((ip, port))
            self._send_file(s, fno, off)
        except:
            pass

# ============================================================
# GUI 主程序
# ============================================================
FIXED_WIDTH = 400
FIXED_HEIGHT = 550
RIGHT_PANEL_WIDTH = 75

CHAT_BG_ALTERNATE = ["#FAFAF5", "#FDF6E3"]
CHAT_COLOR_PALETTE = [
    "#3E5C76",
    "#5A7A5A",
    "#8B6F47",
    "#8B5A6B",
    "#6B5B95",
]
NUM_COLORS = len(CHAT_COLOR_PALETTE)

class App:
    def __init__(self):
        self.cfg = Config()
        self.hist = GlobalChatHistory()
        self.flog = FileLogger()
        self.engine = None;
        self.tq = None
        self.root = tk.Tk();
        self.root.withdraw()
        self.root.title("PyMsg Pro");
        self.root.resizable(False, False)
        self.root.geometry(f"{FIXED_WIDTH}x{FIXED_HEIGHT}")
        self.current_peer = None;
        self.is_topmost = False;
        self.is_offline = False
        self.chat_font_size = 10;
        self.shutdown_win = None;
        self.shutdown_timer = None

        self._color_index = 0

        self._build_ui();
        self._setup_tray();
        self._start_engine()

    def _create_icon(self):
        size = 64;
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img);
        margin = int(size * 0.15)
        draw.ellipse([margin, margin, size - margin, size - margin], fill=(160, 160, 160, 255))
        return img

    def _setup_tray(self):
        menu = pystray.Menu(pystray.MenuItem("显示主界面", self._show_window, default=True),
                            pystray.MenuItem("退出程序", self._quit_app))
        self.tray = pystray.Icon("PyMsgPro", self._create_icon(), "PyMsg Pro", menu)
        threading.Thread(target=self.tray.run, daemon=True).start()

    def _show_window(self, icon=None, item=None):
        self.root.after(0, self.root.deiconify); self.root.after(10, self.root.lift)

    def _hide_window(self):
        self.root.withdraw()

    def _quit_app(self, icon=None, item=None):
        if self.tray: self.tray.stop()
        self.root.after(0, self._on_close)

    def _start_engine(self):
        self.engine = Engine(self, self.cfg, self.flog)
        self.tq = TransferQueue(self.engine, self.cfg, self)
        self.engine.start()
        self.btn_absence.config(text="&#9728;在线" if self.engine.absence else "&#128164;离开")
        self._update_title()
        self._render_global_history()
        self._refresh_trans_ui()

    def _update_title(self):
        if self.engine:
            self.root.title(f"★ {self.engine.ip}:{self.engine.port} - PyMsg Pro")
        else:
            self.root.title("PyMsg Pro")

    def _apply_chat_tags(self):
        fs = self.chat_font_size
        fs_small = max(8, fs - 1)
        for i, fg in enumerate(CHAT_COLOR_PALETTE):
            bg = CHAT_BG_ALTERNATE[i % 2]
            self.chat.tag_config(f"sys_{i}", foreground=fg, background=bg,
                                 font=("Consolas", fs_small, "italic"))
            self.chat.tag_config(f"sent_{i}", foreground=fg, background=bg,
                                 font=("Consolas", fs, "bold"))
            self.chat.tag_config(f"recv_{i}", foreground=fg, background=bg,
                                 font=("Consolas", fs, "bold"))
            self.chat.tag_config(f"file_{i}", foreground=fg, background=bg,
                                 font=("Consolas", fs, "bold"))

    def _build_ui(self):
        self.root.protocol("WM_DELETE_WINDOW", self._hide_window)
        pad = {'padx': 4, 'pady': 2}

        r1 = ttk.Frame(self.root)
        r1.pack(fill=tk.X, **pad)
        ttk.Button(r1, text="&#9881;设置", command=self._show_settings, width=6).pack(side=tk.LEFT, padx=1)
        ttk.Button(r1, text="&#128260;刷新", command=self._refresh, width=6).pack(side=tk.LEFT, padx=1)
        self.btn_absence = ttk.Button(r1, text="&#128164;离开", command=self._toggle_absence, width=6)
        self.btn_absence.pack(side=tk.LEFT, padx=1)
        self.btn_offline = ttk.Button(r1, text="&#9208;下线", command=self._toggle_offline, width=6)
        self.btn_offline.pack(side=tk.LEFT, padx=1)
        self.btn_top = ttk.Button(r1, text="&#128204;置顶", command=self._toggle_top, width=6)
        self.btn_top.pack(side=tk.LEFT, padx=1)
        self.search_var = tk.StringVar()
        self.search_var.trace('w', lambda *a: self._filter())
        ttk.Entry(r1, textvariable=self.search_var, width=10).pack(side=tk.RIGHT, padx=(1, 1))
        ttk.Label(r1, text="&#128269;").pack(side=tk.RIGHT)

        r2 = ttk.Frame(self.root)
        r2.pack(fill=tk.BOTH, expand=True, **pad)
        cols = ("name", "ip", "mac", "status")
        self.tree = ttk.Treeview(r2, columns=cols, show="headings", height=3)
        self.tree.heading("name", text="用户名@主机名")
        self.tree.heading("ip", text="IP")
        self.tree.heading("mac", text="MAC")
        self.tree.heading("status", text="状态")
        self.tree.column("name", width=140)
        self.tree.column("ip", width=92)
        self.tree.column("mac", width=105)
        self.tree.column("status", width=42, anchor=tk.CENTER)
        sb = ttk.Scrollbar(r2, command=self.tree.yview)
        self.tree.configure(yscrollcommand=sb.set)
        self.tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        sb.pack(side=tk.RIGHT, fill=tk.Y)
        self.tree.bind('>', self._on_select)
        self.tree.bind('', self._on_tree_double_click)

        r3 = ttk.Frame(self.root)
        r3.pack(fill=tk.X, **pad)
        ttk.Button(r3, text="发送文件", command=self._send_file, width=8).pack(side=tk.LEFT, padx=2, expand=True,
                                                                               fill=tk.X)
        ttk.Button(r3, text="&#128421;关机指令", command=self._send_shut, width=8).pack(side=tk.LEFT, padx=2, expand=True,
                                                                                fill=tk.X)
        ttk.Button(r3, text="&#128268;网络唤醒", command=self._send_wol, width=8).pack(side=tk.LEFT, padx=2, expand=True,
                                                                               fill=tk.X)

        nb = ttk.Notebook(self.root)
        nb.pack(fill=tk.BOTH, expand=True, **pad)
        chat_tab = ttk.Frame(nb)
        nb.add(chat_tab, text=" 聊天")
        chat_tab.grid_rowconfigure(0, weight=1)
        chat_tab.grid_rowconfigure(1, weight=0)
        chat_tab.grid_columnconfigure(0, weight=1)

        self.chat = scrolledtext.ScrolledText(chat_tab, font=("Consolas", self.chat_font_size), wrap=tk.WORD,
                                              state=tk.DISABLED, bg=CHAT_BG_ALTERNATE[0])
        self.chat.grid(row=0, column=0, sticky="nsew", padx=2, pady=2)
        self._apply_chat_tags()

        bottom_frame = ttk.Frame(chat_tab)
        bottom_frame.grid(row=1, column=0, sticky="ew", padx=2, pady=(2, 4))
        bottom_frame.grid_columnconfigure(0, weight=1, minsize=0)
        bottom_frame.grid_columnconfigure(1, weight=0, minsize=RIGHT_PANEL_WIDTH)
        bottom_frame.grid_rowconfigure(0, weight=1)
        self.inp = tk.Text(bottom_frame, height=3, font=("Microsoft YaHei", 9), wrap=tk.WORD)
        self.inp.grid(row=0, column=0, sticky="nsew", padx=(0, 4))
        self.inp.bind('', lambda e: (self._send_msg(), "break"))
        right_panel = ttk.Frame(bottom_frame)
        right_panel.grid(row=0, column=1, sticky="nsew")
        ttk.Button(right_panel, text="发送", command=self._send_msg).pack(fill=tk.X, pady=(0, 3))
        tools_row = ttk.Frame(right_panel)
        tools_row.pack(fill=tk.X, side=tk.BOTTOM)
        ttk.Button(tools_row, text="&#10010;", command=lambda: self._change_font(1), width=2).pack(side=tk.LEFT, expand=True,
                                                                                            fill=tk.X)
        ttk.Button(tools_row, text="━", command=lambda: self._change_font(-1), width=2).pack(side=tk.LEFT, expand=True,
                                                                                             fill=tk.X)
        ttk.Button(tools_row, text="&#10008;", command=self._clear_chat, width=2).pack(side=tk.LEFT, expand=True, fill=tk.X)

        trans_tab = ttk.Frame(nb)
        nb.add(trans_tab, text="&#128202; 传输")
        tt = ttk.Frame(trans_tab)
        tt.pack(fill=tk.X)
        ttk.Button(tt, text="&#128465;清除已完成", command=self._clear_trans, width=12).pack(side=tk.LEFT, padx=2)
        tcols = ("dir", "file", "peer", "status", "prog")
        self.tr_tree = ttk.Treeview(trans_tab, columns=tcols, show="headings", height=6)
        self.tr_tree.heading("dir", text="方向")
        self.tr_tree.heading("file", text="文件")
        self.tr_tree.heading("peer", text="IP")
        self.tr_tree.heading("status", text="状态")
        self.tr_tree.heading("prog", text="进度")
        self.tr_tree.column("dir", width=35)
        self.tr_tree.column("file", width=110)
        self.tr_tree.column("peer", width=100)
        self.tr_tree.column("status", width=55)
        self.tr_tree.column("prog", width=50)
        self.tr_tree.pack(fill=tk.BOTH, expand=True)
        self.tr_tree.bind('', self._on_trans_right_click)
        self.nb = nb

    def _get_next_tag(self, msg_type):
        idx = self._color_index
        self._color_index = (self._color_index + 1) % NUM_COLORS
        return f"{msg_type}_{idx}"

    def _insert_single_msg(self, rec):
        ts = rec.get('time', '')
        msg_type = rec.get('type', 'sys')
        tag = self._get_next_tag(msg_type)

        if msg_type == 'sys':
            line = f"[{ts}] &#128226; {rec['msg']}"
        elif msg_type == 'file':
            line = f"[{ts}]  {rec['msg']}"
        elif msg_type == 'sent':
            line = f"[{ts}] 我 → {rec['msg']}"
        elif msg_type == 'recv':
            line = f"[{ts}] {rec.get('sender', '')} → {rec['msg']}"
        else:
            line = f"[{ts}] {rec['msg']}"

        self.chat.insert(tk.END, line + "\n", (tag,))

    def _on_trans_right_click(self, event):
        item = self.tr_tree.identify_row(event.y)
        if not item: return
        self.tr_tree.selection_set(item)
        task = None
        if self.tq:
            with self.tq.lock:
                for t in self.tq.tasks:
                    if str(t.tid) == str(item): task = t; break
        menu = tk.Menu(self.root, tearoff=0)
        if task and task.path:
            menu.add_command(label="&#128194; 打开文件所在目录", command=lambda: self._open_file_location(task.path))
            menu.add_command(label="&#128203; 复制文件路径", command=lambda: self._copy_to_clipboard(task.path))
            menu.add_separator()
        menu.add_command(label="&#8505;&#65039; 详情", command=lambda: self._show_task_detail(task))
        try:
            menu.tk_popup(event.x_root, event.y_root)
        finally:
            menu.grab_release()

    def _open_file_location(self, filepath):
        if not filepath: messagebox.showinfo("提示", "该记录无文件路径信息"); return
        if not os.path.exists(filepath):
            dl_dir = self.cfg.get('download_dir', os.path.join(os.path.expanduser('~'), 'PyMsgDownloads'))
            alt_path = os.path.join(dl_dir, os.path.basename(filepath))
            if os.path.exists(alt_path):
                filepath = alt_path
            else:
                messagebox.showwarning("提示", f"文件不存在:\n{filepath}\n\n可能已被移动或删除"); return
        try:
            system = platform.system()
            if system == "Windows":
                subprocess.Popen(['explorer', '/select,', os.path.normpath(filepath)])
            elif system == "Darwin":
                subprocess.Popen(['open', '-R', filepath])
            else:
                subprocess.Popen(['xdg-open', os.path.dirname(filepath)])
            self.flog.info(f"打开文件位置：{filepath}")
        except Exception as e:
            messagebox.showerror("错误", f"无法打开文件位置:\n{e}")

    def _copy_to_clipboard(self, text):
        self.root.clipboard_clear()
        self.root.clipboard_append(text)
        self.root.update()
        self.flog.info(f"已复制路径：{text}")

    def _show_task_detail(self, task):
        if not task: return
        info = (f"任务 ID: {task.tid}\n方向：{'发送' if task.dir == 'send' else '接收'}\n"
                f"文件名：{task.fi.name}\n大小：{format_size(task.fi.size)}\n"
                f"对方 IP: {task.ip}:{task.port}\n状态：{task.status}\n"
                f"进度：{task.prog:.1f}%\n文件路径：{task.path or '(发送任务无本地路径)'}")
        messagebox.showinfo("传输任务详情", info)

    def _refresh_trans_ui(self):
        for i in self.tr_tree.get_children(): self.tr_tree.delete(i)
        if self.tq:
            with self.tq.lock:
                for t in self.tq.tasks: self.ui_add_task(t)

    def _render_global_history(self):
        self.chat.config(state=tk.NORMAL)
        self.chat.delete('1.0', tk.END)
        self._color_index = 0
        msgs = self.hist.get_all()
        for rec in msgs:
            self._insert_single_msg(rec)
        self.chat.config(state=tk.DISABLED)
        self.chat.see(tk.END)

    def _on_tree_double_click(self, event):
        sel = self.tree.selection()
        if not sel: return
        ip = sel[0]
        peer = self.engine.peers.get(ip) if self.engine else None
        col_id = self.tree.identify_column(event.x)
        copy_text = ""
        label = ""

        if col_id == "#1":
            if peer:
                copy_text = peer.display_name()
            else:
                vals = self.tree.item(ip, "values")
                copy_text = vals[0] if vals else ""
            label = "名称"
        elif col_id == "#2":
            copy_text = ip
            label = "IP"
        elif col_id == "#3":
            if peer and peer.mac:
                copy_text = peer.mac
            else:
                copy_text = self.cfg.get('mac_addresses', {}).get(ip, "")
            if not copy_text:
                messagebox.showinfo("提示", f"该客户端 ({ip}) 暂无 MAC 地址信息")
                return
            label = "MAC"
            saved_macs = self.cfg.get('mac_addresses', {})
            if saved_macs.get(ip) != copy_text:
                saved_macs[ip] = copy_text
                self.cfg.set('mac_addresses', saved_macs)
            if peer:
                peer.mac = copy_text
                if self.tree.exists(ip):
                    self.tree.item(ip, values=(
                        peer.display_name(), peer.ip, copy_text, peer.state_text()))
        else:
            return

        if not copy_text:
            messagebox.showinfo("提示", "该项内容为空")
            return

        self.root.clipboard_clear()
        self.root.clipboard_append(copy_text)
        self.root.update()
        self.flog.info(f"已复制 {label}: {copy_text}")

    def _change_font(self, delta):
        self.chat_font_size = max(8, min(20, self.chat_font_size + delta))
        self.chat.config(font=("Consolas", self.chat_font_size))
        self._apply_chat_tags()

    def _toggle_top(self):
        self.is_topmost = not self.is_topmost
        self.root.attributes('-topmost', self.is_topmost)
        self.btn_top.config(text="&#128204;取消" if self.is_topmost else "&#128204;置顶")

    def _toggle_offline(self):
        self.is_offline = not self.is_offline
        if self.is_offline:
            self.engine.go_offline(); self.btn_offline.config(text="&#9654;上线")
            self.btn_absence.config(state=tk.DISABLED)
        else:
            self.engine.go_online(); self.btn_offline.config(text="&#9208;下线")
            self.btn_absence.config(state=tk.NORMAL)

    def _refresh(self):
        if self.engine:
            self.engine.refresh_now()
            self.flog.info("手动刷新：已重新报到并向所有已知节点探测")

    def _toggle_absence(self):
        """★ 离开模式（仍在线，只是状态变更）——与"下线"是两回事"""
        if not self.engine: return
        on = not self.engine.absence
        if on:
            msg = simpledialog.askstring("离开模式", "离开时的自动回复语：",
                                         initialvalue=self.cfg.get('absence_msg', '暂时离开，稍后回复'),
                                         parent=self.root)
            if msg is None: return
        else:
            msg = ""
        self.engine.set_absence(on, msg or "")
        self.btn_absence.config(text="&#9728;在线" if on else "&#128164;离开")
        ts = datetime.now().strftime('%H:%M:%S')
        self._append_to_chat({'type': 'sys', 'msg': f"状态切换：{'离开' if on else '在线'}", 'time': ts})

    def _filter(self):
        kw = self.search_var.get().strip().lower()
        self.tree.delete(*self.tree.get_children())
        if self.engine:
            with self.engine.peers_lock:
                peers = list(self.engine.peers.values())
            for p in peers:
                if kw and kw not in f"{p.display_name()} {p.ip} {p.mac}".lower(): continue
                self.tree.insert("", tk.END, iid=p.ip,
                                 values=(p.display_name(), p.ip, p.mac or "获取中...", p.state_text()))

    def _on_select(self, e):
        sel = self.tree.selection()
        if sel and self.engine and sel[0] in self.engine.peers:
            self.current_peer = self.engine.peers[sel[0]]
            self.flog.info(f"当前发送目标切换：{self.current_peer.user}({self.current_peer.ip})")

    def _get_peer(self):
        sel = self.tree.selection()
        if sel and self.engine and sel[0] in self.engine.peers: return self.engine.peers[sel[0]]
        return None

    def _append_to_chat(self, rec):
        self.hist.add(rec)
        self.chat.config(state=tk.NORMAL)
        self._insert_single_msg(rec)
        self.chat.update_idletasks()
        self.chat.config(state=tk.DISABLED)
        self.chat.see(tk.END)

    def _send_msg(self):
        if not self.engine: return
        msg = self.inp.get('1.0', tk.END).strip()
        if not msg: return
        self.inp.delete('1.0', tk.END)
        peer = self._get_peer()
        ts = datetime.now().strftime('%H:%M:%S')
        if peer and not peer.is_local:
            self.engine.send_msg(peer.ip, peer.port, msg)
            rec = {'type': 'sent', 'msg': f"→ {peer.user}({peer.ip}): {msg}", 'time': ts}
        else:
            self.engine.broadcast_msg(msg)
            rec = {'type': 'sent', 'msg': f"[广播] → 所有人：{msg}", 'time': ts}
        self._append_to_chat(rec)

    def _send_file(self):
        if not self.engine: return
        peer = self._get_peer()
        if not peer or peer.is_local: messagebox.showinfo("提示", "请选择一个远程客户端发送文件"); return
        if not peer.is_pymsg(): messagebox.showwarning("提示", "对方不是 PyMsg 客户端，不支持文件传输"); return
        paths = filedialog.askopenfilenames(title="选择文件")
        if not paths: return
        msg = simpledialog.askstring("附带消息", "附带消息 (可留空):", parent=self.root) or ""
        fis = self.engine.send_files(peer.ip, peer.port, msg, list(paths))
        if fis:
            for f in fis: self.tq.add_send(peer.ip, peer.port, f)
            ts = datetime.now().strftime('%H:%M:%S')
            file_names = ", ".join(f.name for f in fis)
            rec = {'type': 'file', 'msg': f"发送 {file_names} → {peer.user}({peer.ip})", 'time': ts}
            self._append_to_chat(rec)
            self.flog.info(f"发送 {len(fis)} 个文件给 {peer.user}({peer.ip}): {file_names}")
            self.nb.select(1)

    def _send_shut(self):
        peer = self._get_peer()
        if not peer or peer.is_local: messagebox.showinfo("提示", "请选择远程客户端"); return
        if messagebox.askyesno("确认", f"向 {peer.user}({peer.ip}) 发送关机指令？"):
            self.engine.send_shutdown(peer.ip, peer.port)
            ts = datetime.now().strftime('%H:%M:%S')
            rec = {'type': 'sys', 'msg': f"已向 {peer.user}({peer.ip}) 发送关机指令", 'time': ts}
            self._append_to_chat(rec)
            self.flog.info(f"已发送关机指令给 {peer.user}({peer.ip})")

    def _send_wol(self):
        self._show_wol_dialog()

    def _show_wol_dialog(self):
        win = tk.Toplevel(self.root)
        win.title(" WOL 远程唤醒")
        win.geometry("300x250")
        win.resizable(False, False)
        win.transient(self.root)
        win.grab_set()
        frame = ttk.Frame(win, padding=15)
        frame.pack(fill=tk.BOTH, expand=True)
        ttk.Label(frame, text=" WOL 远程唤醒", font=("Microsoft YaHei", 12, "bold")).pack(pady=5)
        ttk.Label(frame, text="MAC 地址:").pack(anchor=tk.W, pady=3)
        mac_var = tk.StringVar()
        ttk.Entry(frame, textvariable=mac_var, width=30, font=("Consolas", 11)).pack(fill=tk.X, pady=2)
        macs = self.cfg.get('mac_addresses', {})
        if macs:
            ttk.Label(frame, text="已保存的 MAC:").pack(anchor=tk.W, pady=(8, 2))
            display_list = [f"{ip} ({m})" for ip, m in macs.items()]
            mac_combo = ttk.Combobox(frame, values=display_list, width=35, state="readonly")
            mac_combo.pack(fill=tk.X)

            def on_mac_selected(event):
                selected = mac_combo.get()
                ip_part = selected.split(' ')[0] if selected else ""
                mac_var.set(macs.get(ip_part, ''))

            mac_combo.bind('>', on_mac_selected)
        peer = self._get_peer()
        if peer and peer.ip in macs: mac_var.set(macs[peer.ip])

        def do_wol():
            mac = mac_var.get().strip().upper()
            if not mac: messagebox.showerror("错误", "请输入 MAC 地址", parent=win); return
            clean_mac = mac.replace(':', '').replace('-', '')
            if len(clean_mac) != 12 or not all(c in '0123456789ABCDEF' for c in clean_mac):
                messagebox.showerror("格式错误", f"MAC 地址格式无效:\n{mac}", parent=win)
                return
            normalized_mac = ':'.join(clean_mac[i:i + 2] for i in range(0, 12, 2))
            saved_macs = self.cfg.get('mac_addresses', {})
            target_ip = peer.ip if peer else None
            if target_ip:
                saved_macs[target_ip] = normalized_mac
                self.cfg.set('mac_addresses', saved_macs)
                peer.mac = normalized_mac
            if peer and self.tree.exists(peer.ip):
                self.tree.item(peer.ip, values=(
                    peer.display_name(), peer.ip, normalized_mac, peer.state_text()))
            try:
                for bcast in get_subnet_broadcasts(): send_wol(normalized_mac, bcast)
                ts = datetime.now().strftime('%H:%M:%S')
                rec = {'type': 'sys', 'msg': f"WOL 唤醒包已发送：{normalized_mac}", 'time': ts}
                self._append_to_chat(rec)
                self.flog.info(f"WOL 唤醒包已发送：{normalized_mac}")
                messagebox.showinfo("成功", "WOL 魔术包已发送!", parent=win)
                win.destroy()
            except Exception as e:
                messagebox.showerror("WOL 错误", str(e), parent=win)

        ttk.Button(frame, text="&#128268; 发送唤醒包", command=do_wol, width=18).pack(pady=25)

    def log(self, tag, msg):
        self.flog.info(f"[{tag}] {msg}")

    def _clear_chat(self):
        if messagebox.askyesno("确认", "确定要清空所有聊天记录吗？此操作不可恢复！"):
            self.hist.clear()
            self.chat.config(state=tk.NORMAL)
            self.chat.delete('1.0', tk.END)
            self.chat.config(state=tk.DISABLED)
            self._color_index = 0

    def _clear_trans(self):
        if self.tq:
            removed = self.tq.cleanup()
            if removed > 0:
                self.flog.info(f"已清除 {removed} 条已完成/失败的传输记录")
            else:
                messagebox.showinfo("提示", "没有可清除的记录")

    def recv_msg(self, ip, sender, msg):
        ts = datetime.now().strftime('%H:%M:%S')
        rec = {'type': 'recv', 'sender': sender, 'msg': f"← {sender}({ip}): {msg}", 'time': ts}
        self._append_to_chat(rec)
        self.root.after(0, lambda: self._notify(sender, msg, ip))

    def _notify(self, sender, msg, ip):
        n = tk.Toplevel(self.root)
        n.title(f"新消息 - {sender}")
        n.geometry("300x100")
        n.attributes('-topmost', True)
        ttk.Label(n, text=f"{sender}: {msg[:50]}", wraplength=280).pack(pady=10)
        ttk.Button(n, text="查看", command=lambda: [n.destroy(), self._show_window()]).pack()
        n.after(5000, n.destroy)

    def recv_files(self, ip, sender, fis, port):
        auto = self.cfg.get('auto_download', False)
        if auto:
            dl = self.cfg.get('download_dir', os.path.join(os.path.expanduser('~'), 'PyMsgDownloads'))
            os.makedirs(dl, exist_ok=True)
            for f in fis: self.tq.add_recv(ip, port, f, os.path.join(dl, f.name))
            ts = datetime.now().strftime('%H:%M:%S')
            file_names = ", ".join(f.name for f in fis)
            rec = {'type': 'file', 'msg': f"收到 {sender}({ip}) 的文件：{file_names}", 'time': ts}
            self._append_to_chat(rec)
            self.flog.info(f"自动接收 {len(fis)} 个文件来自 {sender}({ip}): {file_names}")
            self.nb.select(1)
        else:
            total = sum(f.size for f in fis)
            msg = f"来自 {sender} 的文件:\n" + "\n".join(
                [f"&#128196; {f.name} ({format_size(f.size)})" for f in fis]) + f"\n总计：{format_size(total)}\n\n是否接收？"
            if messagebox.askyesno("接收文件", msg):
                dl = self.cfg.get('download_dir', os.path.join(os.path.expanduser('~'), 'PyMsgDownloads'))
                os.makedirs(dl, exist_ok=True)
                for f in fis: self.tq.add_recv(ip, port, f, os.path.join(dl, f.name))
                ts = datetime.now().strftime('%H:%M:%S')
                file_names = ", ".join(f.name for f in fis)
                rec = {'type': 'file', 'msg': f"收到 {sender}({ip}) 的文件：{file_names}", 'time': ts}
                self._append_to_chat(rec)
                self.nb.select(1)

    def ui_add_peer(self, p):
        vals = (p.display_name(), p.ip, p.mac or "获取中...", p.state_text())
        if self.tree.exists(p.ip):
            self.tree.item(p.ip, values=vals)
        else:
            self.tree.insert("", tk.END, iid=p.ip, values=vals)
        # 搜索过滤生效时，新增条目需符合当前关键字
        kw = self.search_var.get().strip().lower()
        if kw and kw not in f"{p.display_name()} {p.ip} {p.mac} {p.state_text()}".lower():
            self.tree.detach(p.ip)

    def ui_rem_peer(self, ip):
        if self.tree.exists(ip): self.tree.delete(ip)

    def ui_add_task(self, t):
        d = "&#11014;发" if t.dir == "send" else "&#11015;收"
        if not self.tr_tree.exists(str(t.tid)):
            self.tr_tree.insert("", tk.END, iid=str(t.tid), values=(d, t.fi.name, t.ip, t.status, f"{t.prog:.1f}%"))

    def ui_upd_task(self, t):
        d = "&#11014;发" if t.dir == "send" else "&#11015;收"
        if self.tr_tree.exists(str(t.tid)):
            self.tr_tree.item(str(t.tid), values=(d, t.fi.name, t.ip, t.status, f"{t.prog:.1f}%"))
        else:
            self.ui_add_task(t)

    def handle_pong(self, p, ip):
        try:
            rtt = int(time.time() * 1000) - int(p.add); self.flog.info(f"Ping {ip} 延迟：{rtt}ms")
        except:
            self.flog.info(f"Ping {ip} 已响应")

    def show_shutdown(self, sender, ip):
        try:
            self.root.deiconify()
            self.root.lift()
        except:
            pass
        if self.shutdown_win and self.shutdown_win.winfo_exists(): return
        sw = tk.Toplevel(self.root)
        sw.title("&#9888; 远程关机")
        sw.geometry("300x150")
        sw.attributes('-topmost', True)
        self.shutdown_win = sw
        ttk.Label(sw, text=f"&#9888; {sender} 请求关机", font=("", 12, "bold"), foreground="red").pack(pady=10)
        cd_var = tk.StringVar(value="30 秒后关机")
        ttk.Label(sw, textvariable=cd_var).pack()
        rem = [30]

        def upd():
            rem[0] -= 1
            if rem[0]

---

[查看原文](https://www.52pojie.cn/thread-2133048-1-1.html)
