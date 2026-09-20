---
title: "vx小游戏，圈了个地 - 院长模拟器，获取无限金币"
published: 2026-09-19
description: "[mw_shl_code=python,true]import ctypes import ctypes.wintypes import sys import pymem import base64 import json import time import urllib.parse import urllib.re"
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "wabc666"
sourceLink: "https://www.52pojie.cn/thread-2128952-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2128952-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(437.8 KB, 下载次数: 2)*

[下载附件](forum.php?mod=attachment&aid=Mjg4MDQyMXwxNmU4YmM5MnwxNzg5ODczNTI1fDB8MjEyODk1Mg%3D%3D&nothumb=yes)

2026-9-19 23:57 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**751e5e43-f350-4b0c-a644-4151997acda9.png** *(37.34 KB, 下载次数: 2)*

[下载附件](forum.php?mod=attachment&aid=Mjg4MDQyM3wyMzZkZjBhYnwxNzg5ODczNTI1fDB8MjEyODk1Mg%3D%3D&nothumb=yes)

2026-9-19 23:58 上传

[Python] *纯文本查看* *复制代码*
import ctypes
import ctypes.wintypes
import sys

import pymem
import base64
import json
import time
import urllib.parse
import urllib.request
import zlib
import random
from urllib.parse import parse_qs

##### #读取游戏登录参数 #####
kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)
user32 = ctypes.WinDLL("user32", use_last_error=True)

PROCESS_VM_READ = 0x0010
MEM_COMMIT = 0x1000
PAGE_NOACCESS = 0x01

class MEMORY_BASIC_INFORMATION(ctypes.Structure):
    _fields_ = [
        ("BaseAddress", ctypes.c_void_p),
        ("AllocationBase", ctypes.c_void_p),
        ("AllocationProtect", ctypes.wintypes.DWORD),
        ("RegionSize", ctypes.c_size_t),
        ("State", ctypes.wintypes.DWORD),
        ("Protect", ctypes.wintypes.DWORD),
        ("Type", ctypes.wintypes.DWORD),
    ]

# 存储窗口信息
window_list = []
def enum_windows_callback(hwnd, lparam):
    title_buf = ctypes.create_unicode_buffer(256)
    user32.GetWindowTextW(hwnd, title_buf, 256)
    wnd_title = title_buf.value
    pid = ctypes.wintypes.DWORD()
    user32.GetWindowThreadProcessId(hwnd, ctypes.byref(pid))
    hwnd_val = int(ctypes.c_void_p(hwnd).value)
    window_list.append({"hwnd":hwnd_val, "title":wnd_title, "pid":pid.value})
    return True

def get_all_windows():
    global window_list
    window_list = []
    WND_ENUM = ctypes.WINFUNCTYPE(ctypes.c_bool, ctypes.c_void_p, ctypes.c_void_p)
    user32.EnumWindows(WND_ENUM(enum_windows_callback), 0)
    return window_list

def search_memory(pid: int, target_bytes: bytes, offset_left=100, offset_right=100):
    h_process = kernel32.OpenProcess(PROCESS_VM_READ, False, pid)
    if not h_process:
        err = ctypes.get_last_error()
        print(f"OpenProcess失败 PID={pid}, error={err}，跳过")
        return []

    mbi = MEMORY_BASIC_INFORMATION()
    address = 0
    found_results = []

    while True:
        ret = kernel32.VirtualQueryEx(h_process, ctypes.c_void_p(address), ctypes.byref(mbi), ctypes.sizeof(mbi))
        if ret == 0:
            break
        address = ctypes.cast(mbi.BaseAddress, ctypes.c_void_p).value + mbi.RegionSize

        if mbi.State != MEM_COMMIT or (mbi.Protect & PAGE_NOACCESS):
            continue

        buffer = ctypes.create_string_buffer(mbi.RegionSize)
        bytes_read = ctypes.c_size_t()
        success = kernel32.ReadProcessMemory(
            h_process, mbi.BaseAddress, buffer, mbi.RegionSize, ctypes.byref(bytes_read)
        )
        if not success or bytes_read.value == 0:
            continue

        data = buffer.raw[:bytes_read.value]
        pos = 0
        while True:
            idx = data.find(target_bytes, pos)
            if idx == -1:
                break
            absolute_addr = ctypes.cast(mbi.BaseAddress, ctypes.c_void_p).value + idx
            start = max(0, idx - offset_left)
            end = min(len(data), idx + len(target_bytes) + offset_right)
            context_data = data[start:end]
            found_results.append({
                "pid": pid,
                "absolute_address": hex(absolute_addr),
                "match_offset_in_region": idx,
                "context_raw": context_data
            })
            pos = idx + len(target_bytes)

    kernel32.CloseHandle(h_process)
    return found_results

def search_string_by_pymem(pid: int, target_bytes: bytes):
    pm = pymem.Pymem()
    pm.open_process_from_id(pid)
    result = pm.pattern_scan_all(target_bytes, return_multiple=True)
    print(f"&#9989;找到 {len(result)} 个地址：")
    for addr in result:
        print(f"0x{addr:X}")
    return pm, result

def read_memory(pm, address, pre=100, post=100):
    start_addr = address - pre
    total_len = pre + post
    data = pm.read_bytes(start_addr, total_len)
    return data, pre

# ===================== 刷金币相关代码 =====================
API = "https://apps-gz-vpc2.uufuns.com/bslwxapi/api.php"

def yypack_encode(obj, level=6):
    data = json.dumps(obj, separators=(",", ":"), ensure_ascii=False).encode("utf-8") + b"\x00"
    co = zlib.compressobj(level, zlib.DEFLATED, -15)
    body = co.compress(data) + co.flush()
    raw = bytearray((5 + len(body)).to_bytes(4, "big") + bytes([2]) + body)
    if len(raw) >= 16:
        a = len(raw) % 10 + 1
        raw[5], raw[5 + a] = raw[5 + a], raw[5]
    return base64.b64encode(bytes(raw)).decode()

def yypack_decode(b64):
    raw = bytearray(base64.b64decode(b64))
    if len(raw) = 16:
        a = len(raw) % 10 + 1
        raw[5], raw[5 + a] = raw[5 + a], raw[5]
    out = zlib.decompress(bytes(raw[5:]), -15)
    if out.endswith(b"\x00"):
        out = out[:-1]
    return json.loads(out.decode("utf-8"))

def send(sess, cmds, timeout=20):
    q = dict(sess)
    q["req"] = yypack_encode(cmds)
    data = urllib.parse.urlencode(q).encode()
    req = urllib.request.Request(API, data=data, headers={
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Opera/9.47.(Windows NT 6.0; ig-NG) Presto/2.9.183 Version/10.00",
    })
    txt = urllib.request.urlopen(req, timeout=timeout).read().decode("utf-8", "replace")
    outer = json.loads(txt)
    inner = outer.get("body")
    if isinstance(inner, str):
        try:
            inner = yypack_decode(inner)
        except Exception as e:
            inner = f""
    return outer.get("ret"), inner

def snapshot(sess):
    try:
        _, inner = send(sess, [{"cmd": "userLogin"}])
        b = inner[0].get("body") or {}
        return {k: b.get(k) for k in ("cash", "coins", "exp", "egy", "star", "vipscore", "lcoins")}
    except Exception as e:
        return {"__error__": str(e)}

GAME_DATA = {"step": 20, "lastRecoverStamp": 0, "cashAddTime": 0, "getRwTime": 0,
             "score": 0, "free_time": 0, "exp": 0,
             "last": {"allCellsLvInfo": [], "fillRate": 0, "score": 0, "currRwNum": 0}}

DEFAULT_LIMIT = 500

def coins(sess):
    return snapshot(sess).get("coins")

def _cmd(score):
    return {"cmd": "mini_game", "method": "mergeGameResult", "score": score,
            "exp": 0, "drop_prop": {}, "game_data": GAME_DATA}

def merge_once(sess, score):
    _, inner = send(sess, [_cmd(score)])
    i0 = inner[0] if isinstance(inner, list) and inner else {}
    body = i0.get("body")
    au = None
    if isinstance(body, dict):
        tg = body.get("the_good") or {}
        if isinstance(tg, dict):
            au = tg.get("add_uattr")
    return i0.get("ret"), au

def merge_batch(sess, score, n):
    _, inner = send(sess, [_cmd(score) for _ in range(n)])
    return inner if isinstance(inner, list) else []

def _coins_got(item):
    if not isinstance(item, dict) or item.get("ret") != 0:
        return 0
    body = item.get("body")
    if not isinstance(body, dict):
        return 0
    tg = body.get("the_good")
    if not isinstance(tg, dict):
        return 0
    au = tg.get("add_uattr")
    if not isinstance(au, dict):
        return 0
    return au.get("coins", 0) or 0

# 改动：增加 times 参数
def run_coin_task(session_params, TIMES):
    num = random.randint(500, 1000)
    SCORE = num
    DELAY = 0
    BATCH = 50
    LIMIT = 100
    I_UNDERSTAND_RISK = True

    MANUAL_SESSION = {
        "ver": "2.1",
        "svrid": "3",
    }
    MANUAL_SESSION = MANUAL_SESSION | session_params

    if TIMES > LIMIT and not I_UNDERSTAND_RISK:
        print(f"[x] 请求次数 {TIMES} 超过安全上限 {LIMIT}。请修改 I_UNDERSTAND_RISK=True")
        return

    sess = MANUAL_SESSION.copy()
    print(f" uid = {sess['uid']}")
    start_coins = coins(sess)
    print(f" 起始 coins = {start_coins}")

    ret, au = merge_once(sess, SCORE)
    probe_coins = coins(sess)
    if not au:
        print("[!] 探针未返回奖励 —— 通道可能失效，中止。")
        return
    per = (au or {}).get("coins", 0)

    remaining = TIMES - 1
    if remaining = remaining:
            now = coins(sess)
            print(f"    已结算 {done}/{remaining} 请求={reqs} coins={now} (本段 {(now or 0)-(prev or 0)}) 成功={ok} 失败={fail}")
            prev = now
    cost = time.time() - t0
    end_coins = coins(sess)
    print(f" 结束 coins = {end_coins}")
    print(f" 实际净增 = {(end_coins or 0)-(start_coins or 0)}   理论累计 = {total}")
    print("[!] 任务执行完毕")

login_params_cache = None

def get_login_params():
    global login_params_cache
    print("===== 开始枚举窗口，寻找【圈了个地】 =====")
    windows = get_all_windows()
    target_pid = None
    for w in windows:
        print(f"HWND:{hex(w['hwnd'])} PID:{w['pid']} Title:{w['title']}")
        if "圈了个地" in w["title"]:
            target_pid = w["pid"]
    if target_pid is None:
        print("&#10060;没有找到标题包含【圈了个地】的窗口，请先打开游戏")
        return
    print(f"&#9989;找到【圈了个地】窗口，PID = {target_pid}")
    TARGET_PID = target_pid
    target = b"gd_session"
    try:
        pm, addr_list = search_string_by_pymem(TARGET_PID, target)
    except Exception as e:
        print(f"&#10060;打开进程失败：{e}，请以管理员运行程序")
        return
    login_params_cache = None
    for addr in addr_list:
        print(f"\n===== 读取地址 0x{addr:X}，前后各100字节 =====")
        data, offset = read_memory(pm, addr, pre=100, post=100)
        try:
            text = data.decode('utf-8', errors='replace')
            params = parse_qs(text)
            login_params_cache = {
                "openid": params["openid"][0],
                "uid": params["uid"][0],
                "gd_session": params["gd_session"][0],
                "openkey": params["openkey"][0]
            }
            print(f"&#9989;成功读取登录参数：{login_params_cache}")
            break
        except Exception as e:
            print(f"解码失败:{e}")
            continue
    pm.close_process()
    if login_params_cache is None:
        print("&#10060;未能从内存解析出登录参数")
    else:
        print("&#9989;登录参数获取完成，可以执行刷金币！")

if __name__ == "__main__":
    while True:
        print("\n===== 主菜单 =====")
        print("1. 获取游戏登录参数")
        print("2. 执行刷金币任务(加1万)")
        print("3. 执行刷金币任务(加10万)")
        print("4. 执行刷金币任务(加100万)")
        print("0. 退出程序")
        choice = input("请输入选项：").strip()
        if choice == "1":
            get_login_params()
        elif choice == "2":
            if login_params_cache is None:
                print("&#9888;&#65039;请先执行【1 获取游戏登录参数】！")
            else:
                print("========== 开始执行刷金币任务 ==========")
                try:
                    run_coin_task(login_params_cache, TIMES=1000)
                except Exception as e:
                    print(f"任务异常：{e}")
        elif choice == "3":
            if login_params_cache is None:
                print("&#9888;&#65039;请先执行【1 获取游戏登录参数】！")
            else:
                print("========== 开始执行刷金币任务 ==========")
                try:
                    run_coin_task(login_params_cache, TIMES=10000)
                except Exception as e:
                    print(f"任务异常：{e}")
        elif choice == "4":
            if login_params_cache is None:
                print("&#9888;&#65039;请先执行【1 获取游戏登录参数】！")
            else:
                print("========== 开始执行刷金币任务 ==========")
                try:
                    run_coin_task(login_params_cache, TIMES=100000)
                except Exception as e:
                    print(f"任务异常：{e}")
        elif choice == "0":
            print("程序退出")
            break
        else:
            print("输入无效，请重新选择")

---

[查看原文](https://www.52pojie.cn/thread-2128952-1-1.html)
