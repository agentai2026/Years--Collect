---
title: "xhs app 利用Unidbg调用libxyass计算shield实现搜索接口"
published: 2026-10-05
description: "版本号，9.14.0 [mw_shl_code=asm,true]import argparse import json import os import re import shlex import sys import time import urllib.parse HERE = os.path.dirname("
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "wabc666"
sourceLink: "https://www.52pojie.cn/thread-2131046-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2131046-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

版本号，9.14.0

[Asm] *纯文本查看* *复制代码*
import argparse
import json
import os
import re
import shlex
import sys
import time
import urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
if HERE not in sys.path:
    sys.path.insert(0, HERE)

from oracle_search import brief, save_json  # noqa: E402  —— 复用既有原语
from route_d import RouteD, RouteDError, http_signed  # noqa: E402  —— 复用路线 D 会话

DEFAULT_TEMPLATE = os.path.join(ROOT, "examples", "search_notes.request.json")
DEFAULT_OUT_DIR = os.path.join(ROOT, "out")
SIGNER_DIR = os.path.join(HERE, "signer")            # --signer local 的实现目录
# native 自己会加/覆盖的头（离线签名器 local_signer.NATIVE_OWNED 的同源副本，仅用于打印）
NATIVE_OWNED_HINT = ("shield", "xy-platform-info")

# --------------------------------------------------------------------------- #
# 组装：URL / 请求头 / 可复制 curl
# --------------------------------------------------------------------------- #
def load_template(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def _slug(text):
    return (re.sub(r"[^\w-]+", "_", (text or "").strip()) or "req")[:32]

def load_signed_artifact(path):
    """读取之前落盘的签名产物 → (url, headers, artifact)。

    兼容本脚本/`xhs_client.py search --save` 的 {"request":{...}} 包装格式。
    用于 `--reuse`：在 `--max-age` 窗口内复用旧签名，**完全不碰设备**。
    """
    with open(path, "r", encoding="utf-8") as f:
        art = json.load(f)
    art = art.get("request", art) if "url" not in art else art
    url = art.get("url")
    hd = {k: v for k, v in (art.get("headers") or {}).items() if not k.startswith("_")}
    if not url or not hd.get("shield"):
        raise SystemExit("! 产物里没有可用的 url/shield：%s" % path)
    return url, hd, art

def artifact_age_minutes(art):
    """产物签名时间距今多少分钟（无 `_signed_at` 则返回 None）。"""
    ts = art.get("_signed_at")
    if not ts:
        return None
    try:
        return (time.time() - time.mktime(time.strptime(ts, "%Y-%m-%d %H:%M:%S"))) / 60.0
    except Exception:
        return None

def build_pairs(tpl, keyword=None, page=None, page_size=None, sets=(), raw_url=None):
    """返回 [(k, v), ...]：模板顺序 + 覆盖项（新参数追加在末尾）。"""
    if raw_url:
        sp = urllib.parse.urlsplit(raw_url)
        base = "%s://%s%s" % (sp.scheme, sp.netloc, sp.path)
        pairs = urllib.parse.parse_qsl(sp.query, keep_blank_values=True)
    else:
        base = (tpl.get("scheme_host") or "") + (tpl.get("path_no_query") or "")
        order = tpl.get("query_order") or list(tpl.get("query") or {})
        q = dict(tpl.get("query") or {})
        pairs = [(k, q.get(k, "")) for k in order]

    over = {}
    if keyword:
        over["keyword"] = keyword
    if page:
        over["page"] = str(page)
    if page_size:
        over["page_size"] = str(page_size)
    for kv in sets or ():
        if "=" not in kv:
            raise SystemExit("!--set 需要 k=v 形式：%s" % kv)
        k, v = kv.split("=", 1)
        over[k] = urllib.parse.unquote(v)        # 允许直接写 %XX

    out, used = [], set()
    for k, v in pairs:
        if k in over:
            out.append((k, over[k]))
            used.add(k)
        else:
            out.append((k, v))
    for k, v in over.items():                    # 模板里没有的键 → 追加
        if k not in used:
            out.append((k, v))
    return base, out

def build_url(tpl, keyword=None, page=None, page_size=None, sets=(), raw_url=None):
    base, pairs = build_pairs(tpl, keyword, page, page_size, sets, raw_url)
    return base + "?" + urllib.parse.urlencode(pairs, quote_via=urllib.parse.quote)

def build_headers(tpl, snapshot):
    """模板业务头打底 + App 本次真实头覆盖（含新 shield），返回 (headers, 补齐的键)。"""
    hd = {k: v for k, v in (tpl.get("headers") or {}).items() if k.lower() != "shield"}
    filled = sorted(k for k in hd if k not in (snapshot or {}))
    hd.update(snapshot or {})
    return hd, filled

def as_curl(method, url, headers):
    """可直接粘贴执行的 curl（单引号安全转义）。"""
    parts = ["curl -sS -X %s %s" % (method, shlex.quote(url))]
    for k, v in headers.items():
        parts.append("-H %s" % shlex.quote("%s: %s" % (k, v)))
    return " \\\n  ".join(parts)

def build_artifact(method, url, headers, keyword=None, signed_by=None):
    """与 examples/search_notes.request.json 同构，可被 xhs_client.py replay 直接吃。"""
    pairs = urllib.parse.parse_qsl(urllib.parse.urlsplit(url).query, keep_blank_values=True)
    return {
        "method": method,
        "url": url,
        "headers": headers,
        "query": dict(pairs),
        "query_order": [k for k, _ in pairs],
        "scheme_host": "%s://%s" % (urllib.parse.urlsplit(url).scheme,
                                    urllib.parse.urlsplit(url).netloc),
        "path_no_query": urllib.parse.urlsplit(url).path,
        "_note": ("由 tools/xhs_request.py 组装：URL 按模板参数顺序构造，"
                  "headers 含本次新签的 shield"),
        "_keyword": keyword,
        "_signed_by": signed_by or "com.xingin.xhs native shield（frida RPC / 真机）",
        "_signed_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "_shield_len": len(headers.get("shield") or ""),
        "_ttl_hint": ("shield 与整条 URL + xy-direction/xy-scene/xy-common-params 绑定；"
                      "blob 无时间成分（跨 3.5 小时逐字节一致），无需赶时间"),
    }

# --------------------------------------------------------------------------- #
# 打印
# --------------------------------------------------------------------------- #
def print_request(method, url, headers, filled, signed_url, show_headers=False,
                  filled_label="模板补齐", align_note=None, curl_text=None):
    print("\n[1] 目标 URL（完整，可直接复制）")
    print("    %s" % url)
    print("\n[2] native 签名")
    print("    shield : %s…（len=%d）" % ((headers.get("shield") or "")[:40],
                                          len(headers.get("shield") or "")))
    print("    头数量 : %d 个%s" % (len(headers),
                                   ("；%s %d 个（%s）" % (filled_label, len(filled),
                                                        ", ".join(filled)))
                                   if filled else ""))
    if align_note:
        print("    对齐   : %s" % align_note)
    elif signed_url and signed_url != url:
        print("    ! 注意 : App 快照 URL 与目标不完全一致，签名可能不可复用：%s"
              % brief(signed_url, 90))
    else:
        print("    对齐   : App 快照 URL 与目标 URL 一致（签名可用）")
    if show_headers:
        print("\n[3] 完整请求头")
        for k in sorted(headers):
            print("    %-22s: %s" % (k, headers[k]))
    else:
        print("    （要打印全部键值加 --show-headers）")
    if curl_text:
        print("\n[3'] 可直接粘贴的 curl（发不发由你决定）")
        print(curl_text)
    print("\n[4] 请求行")
    print("    %s %s" % (method, urllib.parse.urlsplit(url).path))
    print("    Host: %s" % urllib.parse.urlsplit(url).netloc)

def print_exits(save_path):
    if save_path:
        print("\n[5] 已组装并落盘（发不发由你决定）")
        print("    产物      : %s" % save_path)
        print("    发送方式 A: python3 tools/xhs_request.py '' --send")
        print("    发送方式 B: python3 xhs_client.py replay %s --send" % save_path)
        print("    发送方式 C: python3 tools/xhs_request.py '' --curl  # 再粘贴 curl")
    else:
        print("\n[5] 已组装（--no-save，未落盘；发不发由你决定）")

def print_result(res, resp_path=None):
    print("\n[6] 宿主发送结果（urllib + native 签名头）")
    print("    HTTP   : %s" % res.get("http"))
    print("    业务码 : code=%s success=%s 笔记数=%s"
          % (res.get("code"), res.get("success"), res.get("note_count")))
    for i, t in enumerate(res.get("titles") or [], 1):
        print("    %2d. %s" % (i, t))
    if not res.get("titles"):
        print("    body 前 300 字: %s"
              % (res.get("body") or res.get("error") or "")[:300].replace("\n", " "))
    if resp_path:
        save_json(resp_path, {"url": res.get("url"), "http": res.get("http"),
                              "body": res.get("body")})
        print("    响应已存 : %s" % resp_path)

def emit_and_send(a, url, hd, kw, filled, send_fn, signed_url=None, signed_by=None,
                  filled_label="模板补齐", align_note=None):
    """组装完成后的统一尾巴：打印 → curl → 落盘 → （默认不发送 / --send 才发）。

    send_fn() 返回 RouteD.http()/http_signed() 那样结构的 dict。
    """
    print_request("GET", url, hd, filled, signed_url or url, show_headers=a.show_headers,
                  filled_label=filled_label, align_note=align_note,
                  curl_text=as_curl("GET", url, hd) if a.curl else None)

    save_path = None
    if not a.no_save:
        save_path = a.save or os.path.join(
            DEFAULT_OUT_DIR, "request_%s.json" % _slug(kw or "req"))
        save_json(save_path, build_artifact("GET", url, hd, keyword=kw, signed_by=signed_by))
    print_exits(save_path)

    if not a.send:
        print("\n[6] 发送结果（本次未发送：默认只组装；要发就加 --send）")
        return 0

    print("\n --send：由宿主发出（native 签名头，不经过 App 网络栈）…")
    res = send_fn()
    print_result(res, a.save_response)
    if res.get("ok"):
        print("\n结论：请求发出且成功（HTTP 200 / code=0）。")
        return 0
    if res.get("http") is None:
        print("\n结论：宿主请求本身失败（网络/超时）：%s" % res.get("error"))
        return 3
    if res.get("http") == 200 and res.get("code") == -100:
        print("\n结论：HTTP=200 —— **签名已被服务端接受**（WAF 放行，不是 406）。")
        print("      code=-100「登录已过期」是账号会话问题，与签名无关："
              "原样重放旧抓包也会得到同样结果。")
        print("      要拿业务数据需要有效登录态（App 里重新登录 / 刷新设备侧会话头）。")
        return 4
    if res.get("http") == 406:
        print("\n结论：HTTP=406 —— WAF 判定 shield 无效（签名/头不对）。")
        print("      排查：main_hmac 是否与设备一致（tools/signer/pull_main_hmac.sh）；"
              "喂给签名器的请求头是否与最终发出的那份一致。")
        return 4
    print("\n结论：HTTP=%s code=%s —— 拿到签名但被拒，多为风控限频，"
          "冷却 ≥10 分钟再试（见 REPORT §11）。" % (res.get("http"), res.get("code")))
    return 4

def run_local_signer(a, tpl, url, kw):
    """路径 1b：--signer local —— 本机 unidbg 离线签名（libxyass.so），不碰设备。

    与 device 路径的区别：签名由本机常驻 JVM 里的 native 直接算出（不需要 App
    真的发一次请求），所以没有 deep link 跳页、没有风控副作用、也不依赖 frida。
    """
    if SIGNER_DIR not in sys.path:
        sys.path.insert(0, SIGNER_DIR)
    try:
        from local_signer import LocalShieldSigner, LocalSignerError
    except Exception as e:                                   # 依赖缺失/路径不对
        print("! 载入本地签名器失败（%s）：%s" % (SIGNER_DIR, e))
        return 1

    base = dict(tpl.get("headers") or {})
    print("签名后端   : local（unidbg + libxyass.so，本机算子，不需要设备/frida/root）")
    if a.pid or a.no_trigger:
        print("提示       : --pid/--no-trigger 只对 --signer device 有效，本次忽略")
    print("喂入请求头 : %d 个（native 只会把 xy-direction/xy-scene/xy-common-params 纳入签名）"
          % len(base))

    kwargs = {"token": a.token, "verbose": a.verbose}
    if a.so:
        kwargs["so"] = a.so
    if a.dex:
        kwargs["dex"] = a.dex
    try:
        with LocalShieldSigner(**kwargs) as s:
            native = s.sign(url, base)
    except LocalSignerError as e:
        print("\n! 本地签名失败：%s" % e)
        print("  排查：libxyass.so 路径（XHS_SO / --so）对不对？Java 是 21 吗？"
              "加 -v 看模拟器日志；main_hmac 用 tools/signer/pull_main_hmac.sh 拉。")
        return 1

    hd = dict(base)                     # 模板业务头打底（顺序保持抓包样式）
    hd.update(native)                   # native 产出覆盖（含新 shield / xy-platform-info）
    if not hd.get("shield"):
        print("\n! 本地签名没产出 shield，未组装任何请求")
        return 5

    owned = sorted(k for k in native if k.lower() in NATIVE_OWNED_HINT)
    return emit_and_send(a, url, hd, kw, owned,
                         lambda: http_signed({"url": url, "headers": hd},
                                             timeout=a.http_timeout),
                         signed_url=url,
                         signed_by="unidbg 离线签名（tools/signer，libxyass.so）",
                         filled_label="本地重签",
                         align_note="本机算法直接产出（无 App 快照，天然对齐）")

# --------------------------------------------------------------------------- #
# 命令行
# --------------------------------------------------------------------------- #
def parse_args(argv):
    p = argparse.ArgumentParser(
        description="一个关键词 → 一条组装好的、已 native 签名的请求（默认不发送）")
    p.add_argument("keyword", nargs="?", help="搜索关键词（会被写进 URL 的 keyword= 参数）")
    p.add_argument("--from-url", dest="from_url", default=None,
                   help="跳过模板，直接对这条完整 URL 求签（此时 keyword 位置参数可省）")
    p.add_argument("--template", default=DEFAULT_TEMPLATE,
                   help="请求模板（默认 examples/search_notes.request.json，提供 40 参顺序 + 业务头）")
    p.add_argument("--signer", choices=("device", "local"), default="device",
                   help="签名后端：device=真机 App native（frida，默认）；"
                        "local=本机 unidbg 离线签名（libxyass.so，不需要设备）")
    p.add_argument("--so", default=None,
                   help="--signer local：libxyass.so 路径（默认 $XHS_SO 或 /tmp/xhs_so/libxyass.so）")
    p.add_argument("--dex", default=None,
                   help="--signer local：classes.dex 路径（默认 tools/signer/work/classes10.dex）")
    p.add_argument("--token", default="main",
                   help="--signer local：initialize 用的 token（默认 main）")
    p.add_argument("--page", type=int, default=None, help="替换 page=")
    p.add_argument("--page-size", dest="page_size", type=int, default=None,
                   help="替换 page_size=")
    p.add_argument("--set", action="append", default=None,
                   help="覆盖/追加任意 query 参数（k=v，可重复；值里可写 %%XX）")
    p.add_argument("--url-only", dest="url_only", action="store_true",
                   help="只计算并打印 URL（不连设备、不签名、不发送）")
    p.add_argument("--curl", action="store_true", help="额外打印可直接粘贴的 curl 命令")
    p.add_argument("--show-headers", dest="show_headers", action="store_true",
                   help="打印全部请求头键值（默认只给摘要）")
    p.add_argument("--send", action="store_true",
                   help="组装后立刻由宿主发出（默认不发送！）")
    p.add_argument("--save", default=None, help="产物路径（默认 out/request_.json）")
    p.add_argument("--no-save", dest="no_save", action="store_true", help="不落盘")
    p.add_argument("--save-response", dest="save_response", default=None,
                   help="把 --send 的响应体存成 JSON")
    p.add_argument("--pid", default=None, help="attach 已运行进程（默认 spawn 冷启动）")
    p.add_argument("--no-trigger", dest="no_trigger", action="store_true",
                   help="不自动 deep link 触发（自己动手在 App 里搜一下；配合 --pid 更自然，"
                        "手机不会突然跳页）")
    p.add_argument("--reuse", default=None,
                   help="复用之前落盘的签名产物（在 --max-age 窗口内）：完全不碰设备、不连 frida，"
                        "只组装/发送这一条")
    p.add_argument("--max-age", dest="max_age", type=float, default=10.0,
                   help="--reuse 的最大可接受年龄（分钟，默认 10；0=不限）")
    p.add_argument("--force", action="store_true",
                   help="--reuse 产物超龄时也照用（默认拒绝，避免白发一条必 406 的请求）")
    p.add_argument("--wait", type=int, default=60, help="等 oracle 就绪秒数（默认 60）")
    p.add_argument("--timeout", type=int, default=30, help="等签名快照秒数（默认 30）")
    p.add_argument("--http-timeout", dest="http_timeout", type=int, default=20,
                   help="--send 的 HTTP 超时秒数（默认 20）")
    p.add_argument("--quiet", action="store_true", help="不打印 agent/进度日志")
    p.add_argument("-v", "--verbose", action="store_true",
                   help="额外打印 unidbg 模拟器日志（--signer local 排查用；很吵）")
    return p.parse_args(argv)

def trigger_keyword(a):
    """触发搜索用的关键词（只为让 App 发起请求并签名）。"""
    if a.keyword:
        return a.keyword
    if a.from_url:
        q = urllib.parse.parse_qs(urllib.parse.urlsplit(a.from_url).query)
        return (q.get("keyword") or [""])[0]
    return ""                                   # RouteD 会退化为 "test"

def main(argv=None):
    a = parse_args(argv)

    # ---- 路径 1：--reuse —— 只复用已落盘的签名，完全不碰设备 --------------- #
    if a.reuse:
        url, hd, art = load_signed_artifact(a.reuse)
        kw = art.get("_keyword") or trigger_keyword(a)
        age = artifact_age_minutes(art)
        if a.save is None:
            a.no_save = True            # 复用时不覆盖源产物（除非显式 --save）
        print("=== xhs_request：复用已签名产物（不碰设备、不触发任何 App 搜索）===")
        print("产物       : %s" % a.reuse)
        print("关键词     : %s" % (kw or "(未知)"))
        print("URL 长度   : %d 字符" % len(url))
        if age is None:
            print("产物年龄   : 未知（产物无 _signed_at）")
        else:
            print("产物年龄   : %.1f 分钟（shield 与 URL + 少数环境头绑定；"
                  "blob 无时间成分，跨小时仍逐字节一致）" % age)
            if a.max_age and age > a.max_age:
                if a.send and not a.force:
                    print("\n! 产物已 %.1f 分钟（> --max-age %s）：按防呆规则未组装、未发送。"
                          % (age, a.max_age))
                    print("  注：shield 本身不过期（blob 无时间成分），这里防的是"
                          "会话/风控等**服务端侧**变化。要强行使用加 --force。")
                    return 5
                if not a.force:
                    print("  ! 已超 --max-age %s 分钟：本次只组装不发送，照常打印；"
                          "真发前请自行确认（要强制加 --force）。" % a.max_age)
        return emit_and_send(a, url, hd, kw, [],
                             lambda: http_signed({"url": url, "headers": hd},
                                                 timeout=a.http_timeout),
                             signed_url=url)

    # ---- 路径 2：正常取签名（需要设备）------------------------------------ #
    try:
        tpl = {} if a.from_url else load_template(a.template)
    except OSError as e:
        print("! 读不到请求模板：%s\n  （%s；也可用 --from-url '' 跳过模板）"
              % (a.template, e))
        return 1
    url = build_url(tpl, keyword=(None if a.from_url else a.keyword),
                    page=a.page, page_size=a.page_size, sets=a.set or (),
                    raw_url=a.from_url)
    kw = trigger_keyword(a)

    print("=== xhs_request：关键词 → 组装好的已签名请求（默认不发送）===")
    print("关键词     : %s" % (kw or "(未指定，触发时用 test)"))
    print("模板       : %s" % (a.from_url or a.template))
    print("URL 长度   : %d 字符" % len(url))
    if a.url_only:
        _, pairs = build_pairs(tpl, keyword=(None if a.from_url else a.keyword),
                              page=a.page, page_size=a.page_size,
                              sets=a.set or (), raw_url=a.from_url)
        print("\n[1] 目标 URL（--url-only，仅计算，未连设备、未签名）")
        print(url)
        print("\nquery 参数（%d 个，保持顺序）:" % len(pairs))
        for k, v in pairs:
            print("    %-24s = %s" % (k, v))
        return 0

    # ---- 路径 1b：--signer local —— 本机离线签名（不需要设备/frida）-------- #
    if a.signer == "local":
        return run_local_signer(a, tpl, url, kw)

    log = None if a.quiet else (lambda *x: print(*x))
    rd = RouteD(pid=a.pid, wait=a.wait, keyword=kw or "test", log=log)
    try:
        if a.no_trigger:
            print("\n --no-trigger：不自动跳页。请在手机上让 App 自己发一次搜索请求"
                  "（前台打开搜索页/手动搜一下），我会把那条请求整条换成目标 URL 再签名…")
        else:
            print("\n 让 App 为这条 URL 产出 native 签名"
                  "（deep link 触发：手机端会真的跳一次搜索页，这是取签名的代价）…")
        signed = rd.sign(url=url, keyword=kw, trigger=not a.no_trigger, timeout=a.timeout)
        if not signed:
            print("\n! 没抓到签名（App 未发起请求 / shield 头名变了）→ 未组装任何请求")
            print("  提示：--pid  附着已开着的 App，或去掉 --no-trigger 由脚本触发。")
            return 5

        hd, filled = build_headers(tpl, signed.get("headers"))
        if not hd.get("shield"):
            print("\n! 签名快照里没有 shield，未组装任何请求")
            return 5
        return emit_and_send(a, url, hd, kw, filled,
                             lambda: rd.http({"url": url, "headers": hd},
                                             timeout=a.http_timeout),
                             signed_url=signed.get("url"))
    except RouteDError as e:
        print("\n! %s" % e)
        return 1
    finally:
        rd.close()

if __name__ == "__main__":
    sys.exit(main())

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(496.33 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4MzYwMHwxOWY1Y2QwMXwxNzkxMjU1ODIxfDB8MjEzMTA0Ng%3D%3D&nothumb=yes)

2026-10-5 19:52 上传

---

[查看原文](https://www.52pojie.cn/thread-2131046-1-1.html)
