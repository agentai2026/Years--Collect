---
title: "dy网页直播间视频推流地址获取逻辑分析"
published: 2026-09-27
description: "随便打开一个页面，https://live.douyin.com/725465121905 抓包拿到直播推流链接 https://pull-flv-h13.douyincdn.com/third/stream-408385255877903196_ld5.flv?expire=1791054811&sign=61829"
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "wabc666"
sourceLink: "https://www.52pojie.cn/thread-2129996-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2129996-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

随便打开一个页面，[https://live.douyin.com/725465121905](https://live.douyin.com/725465121905)

![](https://static.52pojie.cn/static/image/common/none.gif)

**8e0c6349-2f93-47ae-938f-6c3350977fa7.png** *(889.18 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4MTkwMXw4OTJiNjdmMXwxNzkwNDczODE3fDB8MjEyOTk5Ng%3D%3D&nothumb=yes)

2026-9-27 03:25 上传

抓包拿到直播推流链接

https://pull-flv-h13.douyincdn.com/third/stream-408385255877903196_ld5.flv?expire=1791054811&sign=61829f90d4c86ce43183fcec574aa29e&arch_hrchy=h1&exp_hrchy=h1&major_anchor_level=common&unique_id=stream-408385255877903196_860_flv_ld5&t_id=037-20260927031330348C786A963A43EA65B9-cE6fc7&biz_quality=ld&biz_protocol=flv&biz_vcodec=h265&biz_vbitrate=1000000&biz_resolution=480x853&biz_gop=2&biz_fps=25

先用potplayer测试下能否正常播放，看到是可以正常播放的

![](https://static.52pojie.cn/static/image/common/none.gif)

**ce9e93db-9f15-416f-9a5c-900b7b88cef1.png** *(420.78 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4MTkwMnxhMDlmMGQ0YnwxNzkwNDczODE3fDB8MjEyOTk5Ng%3D%3D&nothumb=yes)

2026-9-27 03:32 上传

推流链接参数分析

https://pull&#8209;flv&#8209;h13.douyincdn.com/third/stream&#8209;408385255877903196_ld5.flv?expire: 1791054811sign: 61829f90d4c86ce43183fcec574aa29earch_hrchy: h1exp_hrchy: h1major_anchor_level: commonunique_id: stream&#8209;408385255877903196_860_flv_ld5t_id: 037&#8209;20260927031330348C786A963A43EA65B9&#8209;cE6fc7biz_quality: ldbiz_protocol: flvbiz_vcodec: h265biz_vbitrate: 1000000biz_resolution: 480x853biz_gop: 2biz_fps: 25

核心加密参数

**expire**：Unix 时间戳，URL 过期截止时间，明文，但参与签名计算。

**sign**：**核心加密签名（MD5 32 位小写哈希）**，这是最重要加密参数。由服务端密钥、请求路径、expire、部分 query 字段等按规则哈希算出；**没有公开密钥无法逆向[破解](https://www.52pojie.cn)出 sign，只能由抖音服务端生成**火山引擎

**t_id**：链路追踪 + 鉴权附属串，包含时间、随机哈希串，参与签名上下文，属于服务端生成的防爬参数，不能手动伪造

第一种方式:在不逆向分析加密参数的情况下直接获取到视频推流地址？

js全局扫描window里面的变量，发现页面加载后会把真实推流地址存入window.__inline_player_url__ / window.__INLINE_PLAYER_URL__

由于抖音网页端有**大量前端反爬、浏览器环境校验、播放器 JS 解密逻辑**轻量级无头浏览器很容易被识别拦截

因此在代码内启动真实 Chrome 浏览器访问抖音直播间网页，等网页加载直播播放器后，读取网页 JS 里暴露出来的 m3u8 直播流链接

[Asm] *纯文本查看* *复制代码*
# -*- coding: utf-8 -*-

from __future__ import annotations
import json
import os
import re
import subprocess
import sys
import time
import urllib.request

# ============================================
ROOM_TARGET = "821428769544"   # 直播间地址/房间号，可以填链接 "https://live.douyin.com/725465121905"
OUTPUT_JSON = False             # True输出json，False输出文本
SKIP_VERIFY = False             # 是否跳过流可用性校验
# =====================================================================

REFERER = "https://live.douyin.com/"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
)
DEFAULT_PORT = 9222
DEFAULT_PROFILE = os.path.join(os.path.expanduser("~"), ".douyin_recorder", "chrome-profile")
CHROME_CANDIDATES = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"),
]

def find_chrome() -> str:
    for p in CHROME_CANDIDATES:
        if p and os.path.isfile(p):
            return p
    raise RuntimeError("未找到 Chrome，请手动修改 CHROME_CANDIDATES 里面的chrome路径")

def normalize_room(target: str):
    """把 URL 或纯房间号统一成 (页面URL, 房间号)"""
    s = target.strip()
    if re.fullmatch(r"\d+", s):
        return f"https://live.douyin.com/{s}", s
    m = re.search(r"live\.douyin\.com/(\d+)", s)
    return s, (m.group(1) if m else s)

def cdp_ready(port: int) -> bool:
    try:
        with urllib.request.urlopen(f"http://127.0.0.1:{port}/json/version", timeout=1) as r:
            return r.status == 200
    except Exception:
        return False

def ensure_chrome(port: int, profile: str, chrome: str) -> None:
    """确保一个带调试端口的 Chrome 在跑（独立 profile，不影响日常浏览器）"""
    if cdp_ready(port):
        return
    os.makedirs(profile, exist_ok=True)
    subprocess.Popen(
        [
            chrome,
            f"--remote-debugging-port={port}",
            f"--user-data-dir={profile}",
            "--no-first-run",
            "--no-default-browser-check",
            "--disable-blink-features=AutomationControlled",
            "--window-size=1280,900",
            "about:blank",
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    for _ in range(40):
        if cdp_ready(port):
            return
        time.sleep(0.5)
    raise RuntimeError("Chrome 调试端口启动超时")

def parse_quality(stream_url: str) -> dict:
    q = {}
    for key in ("biz_quality", "biz_resolution", "biz_vcodec", "biz_fps", "biz_vbitrate"):
        m = re.search(rf"[?&]{key}=([^&]+)", stream_url or "")
        if m:
            q[key] = m.group(1)
    return q

def fetch_stream(target: str, port: int = DEFAULT_PORT, profile: str = DEFAULT_PROFILE,
                 timeout: int = 45000, keep_open: bool = False) -> dict:
    """打开直播间页面，返回流信息字典"""
    from playwright.sync_api import sync_playwright
    room_url, rid = normalize_room(target)
    ensure_chrome(port, profile, find_chrome())
    with sync_playwright() as p:
        browser = p.chromium.connect_over_cdp(f"http://127.0.0.1:{port}")
        ctx = browser.contexts[0]
        page = ctx.new_page()
        try:
            page.goto(room_url, wait_until="domcontentloaded", timeout=timeout)
            try:
                page.wait_for_function(
                    "() => !!(window.__inline_player_url__ || window.__INLINE_PLAYER_URL__)",
                    timeout=timeout,
                )
            except Exception:
                raise RuntimeError(
                    "未取到流地址：页面可能要求登录/验证码，或该直播间未开播。"
                    f"当前页面标题：{page.title()}"
                )
            stream_url = page.evaluate(
                "() => window.__inline_player_url__ || window.__INLINE_PLAYER_URL__"
            )
            title = page.title()
        finally:
            if not keep_open:
                page.close()
        if not keep_open:
            browser.close()
    return {
        "room_url": room_url,
        "room_id": rid,
        "title": title,
        "stream_url": stream_url,
        "referer": REFERER,
        "user_agent": USER_AGENT,
        "quality": parse_quality(stream_url),
        "fetched_at": int(time.time()),
    }

def verify(stream_url: str, seconds: int = 3):
    """带 Referer 试拉一小段，确认地址真实可用"""
    req = urllib.request.Request(
        stream_url, headers={"Referer": REFERER, "User-Agent": USER_AGENT}
    )
    total, t0, ctype = 0, time.time(), ""
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            ctype = r.headers.get("Content-Type", "")
            while time.time() - t0  int:
    # 直接使用代码里写死的配置，不再读取命令行参数
    info = fetch_stream(ROOM_TARGET, port=DEFAULT_PORT, profile=DEFAULT_PROFILE, timeout=45000)
    if not SKIP_VERIFY and info.get("stream_url"):
        info["verify_ok"], info["verify_msg"] = verify(info["stream_url"])

    if OUTPUT_JSON:
        print(json.dumps(info, ensure_ascii=False, indent=2))
    else:
        print(f"房间：{info['title']}  ({info['room_id']})")
        q = info.get("quality") or {}
        if q:
            print("清晰度：{res} {codec} {fps}fps {br}bps".format(
                res=q.get("biz_resolution", "?"), codec=q.get("biz_vcodec", "?"),
                fps=q.get("biz_fps", "?"), br=q.get("biz_vbitrate", "?")))
        print(f"拉流地址：\n{info['stream_url']}")
        print(f"拉流请求头：Referer: {REFERER}")
        if "verify_ok" in info:
            print(f"可用性校验：{'通过' if info['verify_ok'] else '失败'} - {info['verify_msg']}")
    return 0

if __name__ == "__main__":
    sys.exit(main())

执行结果如下

![](https://static.52pojie.cn/static/image/common/none.gif)

**a190a793-2b25-4677-95cc-373df4f1077d.png** *(87.43 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4MTkwM3wxOTQ5MDBiYXwxNzkwNDczODE3fDB8MjEyOTk5Ng%3D%3D&nothumb=yes)

2026-9-27 04:08 上传

那么假如我不想通过启动chrome这种笨重的流程，就想自己生成一个推流地址，如何实现？

通过测试，绕过浏览器，直接访问对应的接口，发现流地址里的 sign / expire 是抖音服务端签发的，本地无需计算

那么怎么不靠浏览器把这个请求发出去，靠纯 HTTP 方式获取抖音直播间 FLV 直播流地址?

分三步：

1，获取 Cookie：访问抖音直播首页，拿到ttwid等必须的 Cookie，模拟浏览器网页环境。

2，调用直播间 Web 接口：解析输入的直播间链接 / 房间号，请求接口/webcast/room/web/enter/，拿到直播间元信息 + 直播拉流地址。

3，修复地址 + 校验可用性：抖音接口返回的是http://地址，直接访问会 0 字节，脚本替换成https://

[Asm] *纯文本查看* *复制代码*
三步流程：
 ① GET [url=https://live.douyin.com/]https://live.douyin.com/[/url]            → 拿到 ttwid 等基础 cookie
 ② GET /webcast/room/web/enter/?web_rid=xx → JSON 中 stream_url.flv_pull_url
 ③ 把地址的 http:// 换成 https://          → 直接拉流

[Asm] *纯文本查看* *复制代码*
# -*- coding: utf-8 -*-
""" 抖音直播间取流器 —— 纯 HTTP 版（不启动浏览器、不做签名逆向）
==============================================================
实测结论（未登录状态）：
  1. 普通 GET 请求即可拿到完整推流地址，服务端未强制校验 a_bogus/X-Bogus；
  2. 地址中的 sign / expire 由抖音服务端签发，本地无需也无法计算；

【修改说明】
直播间ID直接写在下面 FIXED_WEB_RID
"""

from __future__ import annotations

import json
import re
import sys
import time
import urllib.parse
import urllib.request
import http.cookiejar

REFERER = "https://live.douyin.com/"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
)
# 清晰度优先级（由高到低）
QUALITY_ORDER = ["FULL_HD1", "HD1", "SD1", "SD2"]

# ===================== 在这里填入你的直播间ID =====================
FIXED_WEB_RID = "355655334081"
# ===================================================================

def build_session():
    """建立带 cookie 的会话：先访问首页拿 ttwid"""
    cj = http.cookiejar.CookieJar()
    op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
    op.addheaders = [
        ("User-Agent", USER_AGENT),
        ("Accept-Language", "zh-CN,zh;q=0.9"),
        ("Accept", "text/html,application/xhtml+xml,*/*;q=0.8"),
    ]
    op.open(REFERER, timeout=15).read()
    return op, cj

def normalize_rid(target: str) -> str:
    s = target.strip()
    if re.fullmatch(r"\d+", s):
        return s
    m = re.search(r"live\.douyin\.com/(\d+)", s)
    return m.group(1) if m else s

def get_streams(web_rid: str, op=None):
    """调 enter 接口，返回 (房间信息, {清晰度: https 流地址})"""
    if op is None:
        op, _ = build_session()

    params = {
        "aid": "6383", "app_name": "douyin_web", "live_id": "1",
        "device_platform": "web", "language": "zh-CN", "enter_from": "web_live",
        "cookie_enabled": "true", "screen_width": "1920", "screen_height": "1080",
        "browser_language": "zh-CN", "browser_platform": "Win32",
        "browser_name": "Chrome", "browser_version": "140.0.0.0",
        "web_rid": web_rid,
    }
    url = "https://live.douyin.com/webcast/room/web/enter/?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={
        "Referer": f"{REFERER}{web_rid}",
        "Accept": "application/json, text/plain, */*",
    })
    body = op.open(req, timeout=20).read().decode("utf-8", "ignore")
    j = json.loads(body)

    if j.get("status_code") != 0:
        raise RuntimeError(f"接口返回异常 status_code={j.get('status_code')}")

    rooms = (j.get("data") or {}).get("data") or []
    if not rooms:
        raise RuntimeError("未取到房间数据：可能房间号错误或未开播")

    r0 = rooms[0]
    su = r0.get("stream_url") or {}
    flv = su.get("flv_pull_url") or {}
    # 关键：http -> https
    flv = {k: v.replace("http://", "https://", 1) for k, v in flv.items()}

    info = {
        "room_id": web_rid,
        "title": r0.get("title", ""),
        "status": r0.get("status_str", ""),   # "2" = 直播中
        "user_count": r0.get("user_count_str", ""),
        "nickname": ((r0.get("owner") or {}).get("nickname") or ""),
        "hls": su.get("hls_pull_url_map") or {},
    }
    return info, flv

def probe(url: str, seconds: int = 3):
    """带 Referer 试拉一小段，确认地址真实可用"""
    req = urllib.request.Request(url, headers={"Referer": REFERER, "User-Agent": USER_AGENT})
    t0, total, ctype = time.time(), 0, ""
    try:
        with urllib.request.urlopen(req, timeout=12) as r:
            ctype = r.headers.get("Content-Type", "")
            while time.time() - t0  int:
    # 直接使用代码内写死的直播间ID
    target = FIXED_WEB_RID
    rid = normalize_rid(target)
    op, cj = build_session()
    info, flv = get_streams(rid, op)

    # ========= 这里你可以自行开关两个选项 =========
    OUTPUT_JSON = False       # True=输出json，False=普通文本输出
    NO_VERIFY = False         # True=跳过流地址校验
    SELECT_QUALITY = "FULL_HD1"
    # ==============================================

    if not OUTPUT_JSON:
        print(f"房间：{info['title']}")
        print(f"主播：{info['nickname']}  在線：{info['user_count']}  狀態：{'直播中' if info['status'] == '2' else info['status']}")
        print(f"cookie：{[c.name for c in cj]}")
        print(f"\n可用清晰度：{list(flv.keys())}")

    result = {"info": info, "streams": flv, "verify": {}}
    for q in QUALITY_ORDER:
        if q not in flv:
            continue
        if OUTPUT_JSON:
            result["verify"][q] = probe(flv[q]) if not NO_VERIFY else None
            continue
        ok, msg = (True, "已跳过校验") if NO_VERIFY else probe(flv[q])
        print(f"\n[{q}] {'OK ' if ok else 'ERR'} {msg}")
        print(f"  {flv[q]}")

    if OUTPUT_JSON:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0

if __name__ == "__main__":
    sys.exit(main())

执行后返回结果

[Asm] *纯文本查看* *复制代码*
C:\Users\admin\PyCharmMiscProject\.venv\Scripts\python.exe C:\Users\admin\PyCharmMiscProject\ceshi2222222\test02.py
房间：我会在这里一直等你！
主播：久晴&#127908;  在線：48  狀態：直播中
cookie：['ttwid', 'UIFID_TEMP', 'UIFID']

可用清晰度：['FULL_HD1', 'HD1', 'SD1', 'SD2']

[FULL_HD1] OK  video/x-flv | 3s 1984 KB (≈5.42 Mbps)
  [flash]https://pull-flv-l26.douyincdn.com/third/stream-696615673770803686_uhd.flv[/flash]?expire=6ac167ee&sign=427cbc2e70cba28eac180a1a49c48e90&arch_hrchy=w1&exp_hrchy=w1&major_anchor_level=common&unique_id=stream-696615673770803686_486_flv_uhd&t_id=037-20260927043910738975FC794DCDEE8A79-WD43LP

[HD1] OK  video/x-flv | 3s 1856 KB (≈5.07 Mbps)
  [flash]https://pull-flv-l26.douyincdn.com/third/stream-696615673770803686_hd.flv[/flash]?expire=6ac167ee&sign=c75e3b2448d83ff7ce7ba2a1c07afd17&major_anchor_level=common&exp_hrchy=w1&arch_hrchy=w1&unique_id=stream-696615673770803686_486_flv_hd&t_id=037-20260927043910738975FC794DCDEE8A79-WD43LP

[SD1] OK  video/x-flv | 3s 128 KB (≈0.35 Mbps)
  [flash]https://pull-flv-l26.douyincdn.com/third/stream-696615673770803686_ld.flv[/flash]?expire=6ac167ee&sign=47fc1e1e4e24ae3db797ee63934bc6ce&arch_hrchy=w1&major_anchor_level=common&exp_hrchy=w1&unique_id=stream-696615673770803686_486_flv_ld&t_id=037-20260927043910738975FC794DCDEE8A79-WD43LP

[SD2] OK  video/x-flv | 3s 1472 KB (≈4.02 Mbps)
  [flash]https://pull-flv-l26.douyincdn.com/third/stream-696615673770803686_sd.flv[/flash]?expire=6ac167ee&sign=a72b07d649dff428375c20ab9fe372cd&arch_hrchy=w1&exp_hrchy=w1&major_anchor_level=common&unique_id=stream-696615673770803686_486_flv_sd&t_id=037-20260927043910738975FC794DCDEE8A79-WD43LP

进程已结束，退出代码为 0

---

[查看原文](https://www.52pojie.cn/thread-2129996-1-1.html)
