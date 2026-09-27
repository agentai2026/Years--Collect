---
title: "dy网页直播间弹幕实时获取逻辑分析"
published: 2026-09-27
description: "目标：模拟浏览器访问抖音网页直播间，调用抖音内部 IM 长轮询接口，抓取直播间弹幕、礼物、用户进房消息。 操作过程： 先打开直播间并开启抓包工具，发现直播间消息并非 WebSocket（wss://ws.）形式 直接请求 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "wabc666"
sourceLink: "https://www.52pojie.cn/thread-2129998-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2129998-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

目标：模拟浏览器访问抖音网页直播间，调用抖音内部 IM 长轮询接口，抓取直播间弹幕、礼物、用户进房消息。

操作过程：

先打开直播间并开启抓包工具，发现直播间消息并非 WebSocket（wss://ws.）形式

直接请求弹幕接口地址：GET [https://live.douyin.com/webcast/im/fetch/?resp_content_type=protobuf&did_rule=3&device_id=&app_name=douyin_web&endpoint=live_pc&support_wrds=1&user_unique_id=&identity=audience&need_persist_msg_count=15&insert_task_id=&live_reason=&room_id=7689948289948519210&version_code=180800&last_rtt=0&live_id=1&aid=6383&fetch_rule=1&cursor=&internal_ext=&device_platform=web&cookie_enabled=true&screen_width=1920&screen_height=1080&browser_language=zh-CN&browser_platform=Win32&browser_name=Mozilla&browser_version=Mozilla%2F5.0+%28Windows+NT+10.0%3B+Win64%3B+x64%29+AppleWebKit%2F537.36+%28KHTML%2C+like+Gecko%29+Chrome%2F153.0.0.0+Safari%2F537.36&browser_online=true&tz_name=Asia%2FShanghai](https://live.douyin.com/webcast/im/fetch/?resp_content_type=protobuf)

返回结果，判断为Protobuf序列化

![](https://static.52pojie.cn/static/image/common/none.gif)

**387c4dbc-c3dc-472f-b849-55d14ac41ed5.png** *(375.3 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4MTkwN3xkYjdjYzllYXwxNzkwNDc2OTMwfDB8MjEyOTk5OA%3D%3D&nothumb=yes)

2026-9-27 05:30 上传

抖音直播接口返回的不是 JSON，是二进制 protobuf 协议数据，编写通用解析器，把任意 protobuf 拆成 [(字段号, 类型, 值)] 的列表

该接口可返回完整消息类型，解析后包括：ChatMessage（评论弹幕）、MemberMessage（用户进场）、LikeMessage（点赞）

分析实时流量，判断抖音网页直播间的评论消息不使用 WebSocket 推送，而是采用 HTTP 轮询机制

通过直播间短 ID（web_rid）获取房间真实 room_id，循环调用 /webcast/im/fetch/ 接口，依靠 cursor 游标增量拉取消息，再自行解析 protobuf 二进制数据，从中提取弹幕、礼物、用户进场等各类消息

要如何本地模拟这个过程？

创建 http 会话，访问直播间页面获取 cookie 鉴权信息 ttwid调用直播间 enter 接口，把 web_rid 转换成接口需要的 room_id用 room_id + cursor 游标请求 im/fetch 接口，拿到 protobuf 二进制手写 protobuf 解析器解析二进制，解压 gzip 消息体，提取弹幕、礼物、进房消息消息 ID 去重，识别评论消息，控制台打印，可选写入 jsonl更新 cursor 游标，sleep 一段时间，继续下一轮拉取

实测代码效果

![](https://static.52pojie.cn/static/image/common/none.gif)

**972485cc-e825-48a6-b06d-04a8e51bfed3.png** *(1.69 MB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4MTkwNXw1OGU5MDljOHwxNzkwNDc2OTMwfDB8MjEyOTk5OA%3D%3D&nothumb=yes)

2026-9-27 04:55 上传

[Asm] *纯文本查看* *复制代码*
C:\Users\admin\PyCharmMiscProject\.venv\Scripts\python.exe C:\Users\admin\PyCharmMiscProject\ceshi2222222\test03.py  直播间 821428769544 | ttwid=1%7CmNlhIm5w2vs2Cu-Xmu3v... room_id = 7689900503156722473
[04:55:14] 评论  A九夜（绝味龙虾坊，椒麻鸡）: 1000000000000000
[04:55:14] 评论  嘿嘿: 1
[04:55:14] 评论  JD: 你这个技能为什么能原地就
[04:55:14] 评论  长书省: 1
[04:55:14] 评论  @: 111111
[04:55:14] 评论  小碴粥子: 1
[04:55:14] 评论  理智&#185;&#8311;&#8304;&#185;成为农村拓哉（蓄发版）: 我是假人
[04:55:14] 评论  &#127752;低调王小李: 我是人机一号
[04:55:19] 评论  居士: 2
[04:55:20] 评论  棷椰拿铁: 2
[04:55:22] 评论  知行合一: 我是家人
[04:55:26] 评论  花海: 这个点都不想发弹幕很正常，大家都累
[04:55:27] 评论  80岁老头爱飘柔: 3 结束：共收到 64 条消息，其中评论 13 条，耗时 16 秒

进程已结束，退出代码为 0

**[Asm] *纯文本查看* *复制代码*
代码整体流程:
1，初始化模拟浏览器（带 Cookie 容器、UA）
2，访问直播间页面，拿到 Cookie（ttwid 关键 Cookie）
3，通过 web_rid（直播间网页 ID）调用 /webcast/room/web/enter/，拿到真实房间 ID room_id
4，循环调用 /webcast/im/fetch/ 拉取直播间消息（轮询）
5，接口返回 protobuf 二进制数据，脚本自己实现 protobuf 解析，拆出消息列表
6，区分消息类型：弹幕WebcastChatMessage、礼物WebcastGiftMessage、进场消息WebcastMemberMessage
7，去重（msg_id），控制台打印弹幕，可选保存到 jsonl 文件
8，持续采集指定秒数后停止
**

[Asm] *纯文本查看* *复制代码*
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
""" 抖音直播间评论（弹幕）采集器
"""

import sys
import json
import gzip
import time
import urllib.request
import urllib.parse
import http.cookiejar

CONFIG = {
    "web_rid": "837735444638",   # 直播间网页rid
    "collect_seconds": 15,       # 采集持续多少秒
    "out_path": None             # 输出文件，None=不保存；填 "out.jsonl" 就写入文件
}
# =================================================================

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36")
BASE = "https://live.douyin.com"

# ---------------------------------------------------------------- protobuf 极简解析
def _varint(buf, i):
    r = 0
    s = 0
    while True:
        x = buf[i]
        i += 1
        r |= (x & 0x7F) > 3, key & 7
        if wt == 0:  # varint
            v, i = _varint(buf, i)
        elif wt == 2:  # length-delimited
            ln, i = _varint(buf, i)
            v = buf[i:i + ln]
            i += ln
        elif wt == 5:  # 32-bit
            v = buf[i:i + 4]
            i += 4
        elif wt == 1:  # 64-bit
            v = buf[i:i + 8]
            i += 8
        else:
            raise ValueError("unsupported wire type %d" % wt)
        out.append((fn, wt, v))
    return out

def pb_get(fields, fn, wt=2):
    return [v for f, w, v in fields if f == fn and w == wt]

def _dec(v):
    try:
        return v.decode("utf-8")
    except Exception:
        return None

def parse_im_response(raw):
    """解析 /webcast/im/fetch/ 的响应体"""
    res = {"cursor": "", "internal_ext": "", "fetch_interval": 0,
           "now": 0, "live_cursor": "", "messages": []}
    for fn, wt, v in pb_parse(raw):
        if fn == 1 and wt == 2:  # messagesList
            f = pb_parse(v)
            method = _dec(pb_get(f, 1)[0]) if pb_get(f, 1) else "?"
            msg_id = pb_get(f, 3, 0)[0] if pb_get(f, 3, 0) else 0
            payload = pb_get(f, 2)[0] if pb_get(f, 2) else b""
            if payload[:2] == b"\x1f\x8b":
                payload = gzip.decompress(payload)
            item = {"method": method, "msg_id": msg_id}
            try:
                pf = pb_parse(payload)
                if method == "WebcastChatMessage":
                    u = pb_parse(pb_get(pf, 2)[0]) if pb_get(pf, 2) else []
                    item["nickname"] = _dec(pb_get(u, 3)[0]) if pb_get(u, 3) else "?"
                    item["user_id"] = pb_get(u, 1, 0)[0] if pb_get(u, 1, 0) else 0
                    item["content"] = _dec(pb_get(pf, 3)[0]) if pb_get(pf, 3) else "?"
                elif method == "WebcastGiftMessage":
                    item["gift_id"] = pb_get(pf, 2, 0)[0] if pb_get(pf, 2, 0) else 0
                elif method == "WebcastMemberMessage":
                    u = pb_parse(pb_get(pf, 2)[0]) if pb_get(pf, 2) else []
                    item["nickname"] = _dec(pb_get(u, 3)[0]) if pb_get(u, 3) else "?"
            except Exception as e:
                item["parse_error"] = str(e)
            res["messages"].append(item)
        elif fn == 2 and wt == 2:
            res["cursor"] = _dec(v) or ""
        elif fn == 3 and wt == 0:
            res["fetch_interval"] = v
        elif fn == 4 and wt == 0:
            res["now"] = v
        elif fn == 5 and wt == 2:
            res["internal_ext"] = _dec(v) or ""
        elif fn == 11 and wt == 2:
            res["live_cursor"] = _dec(v) or ""
    return res

# ---------------------------------------------------------------- HTTP
def build_session():
    cj = http.cookiejar.CookieJar()
    op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
    op.addheaders = [("User-Agent", UA)]
    return op, cj

def get_room_id(op, web_rid):
    """由直播间号(web_rid)取内部 room_id"""
    params = {
        "aid": "6383", "app_name": "douyin_web", "live_id": "1",
        "device_platform": "web", "language": "zh-CN", "enter_from": "web_live",
        "cookie_enabled": "true", "screen_width": "1920", "screen_height": "1080",
        "browser_language": "zh-CN", "browser_platform": "Win32",
        "browser_name": "Chrome", "browser_version": "153.0.0.0",
        "web_rid": web_rid,
    }
    url = BASE + "/webcast/room/web/enter/?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"Referer": "%s/%s" % (BASE, web_rid)})
    j = json.loads(op.open(req, timeout=20).read().decode("utf-8", "ignore"))
    rooms = (j.get("data") or {}).get("data") or []
    if not rooms:
        raise RuntimeError("enter 接口未返回房间信息: %s" % json.dumps(j, ensure_ascii=False)[:300])
    return rooms[0]["id_str"]

def fetch_im(op, room_id, cursor="", internal_ext="", user_unique_id=""):
    params = {
        "resp_content_type": "protobuf", "did_rule": "3", "device_id": "",
        "app_name": "douyin_web", "endpoint": "live_pc", "support_wrds": "1",
        "user_unique_id": user_unique_id, "identity": "audience",
        "need_persist_msg_count": "15", "insert_task_id": "", "live_reason": "",
        "room_id": room_id, "version_code": "180800", "last_rtt": "0",
        "live_id": "1", "aid": "6383", "fetch_rule": "1",
        "cursor": cursor, "internal_ext": internal_ext,
        "device_platform": "web", "cookie_enabled": "true",
        "screen_width": "1920", "screen_height": "1080",
        "browser_language": "zh-CN", "browser_platform": "Win32",
        "browser_name": "Mozilla", "browser_version": UA,
        "browser_online": "true", "tz_name": "Asia/Shanghai",
    }
    url = BASE + "/webcast/im/fetch/?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={
        "Referer": BASE + "/", "Accept": "*/*", "User-Agent": UA})
    return op.open(req, timeout=20).read()

# ---------------------------------------------------------------- 主流程
def main(web_rid, seconds, out_path=None):
    op, cj = build_session()
    op.open("%s/%s" % (BASE, web_rid), timeout=20).read()
    # 先领 ttwid
    ttwid = next((c.value for c in cj if c.name == "ttwid"), "")
    print(" 直播间 %s | ttwid=%s..." % (web_rid, ttwid[:24]))
    room_id = get_room_id(op, web_rid)
    print(" room_id = %s" % room_id)

    cursor, internal_ext = "", ""
    t0 = time.time()
    seen, chat_count, total = set(), 0, 0
    fout = open(out_path, "w", encoding="utf-8") if out_path else None
    try:
        while time.time() - t0

---

[查看原文](https://www.52pojie.cn/thread-2129998-1-1.html)
