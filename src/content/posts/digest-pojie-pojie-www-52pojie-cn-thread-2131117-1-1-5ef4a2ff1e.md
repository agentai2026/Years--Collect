---
title: "dy app rpc调用加密函数生成六神实现搜索"
published: 2026-10-06
description: "版本号，32.8.0 [mw_shl_code=asm,true]import argparse import base64 import hashlib import json import os import re import subprocess import sys import time from urll"
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "wabc666"
sourceLink: "https://www.52pojie.cn/thread-2131117-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2131117-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

版本号，32.8.0

[Asm] *纯文本查看* *复制代码*
import argparse
import base64
import hashlib
import json
import os
import re
import subprocess
import sys
import time
from urllib.parse import quote, urlsplit, urlunsplit

import dy_client

# 关键词参数候选名（按优先级）：联想词接口用 query，通用搜索用 keyword
KEY_PARAMS = ("query", "keyword", "word", "search_query", "q")
# 每个请求都会变的"时间型"字段：刷新了必然要求重签
TIME_PARAMS = ("_rticket", "ts")
TIME_HEADERS = ("x-ss-req-ticket", "activity_now_client")
# 服务端风控签名头（由设备端 provider 出；宿主机只负责注入）
SIG_HEADERS = ("x-gorgon", "x-argus", "x-ladon", "x-khronos", "x-soter", "x-helios", "x-medusa")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SIGNRPC = os.path.join(ROOT, "scripts", "rpc_signrpc.py")

def log(args, *a):
    if args.verbose:
        print(*a, flush=True)

def parse_query(url):
    u = urlsplit(url)
    pairs = []
    for item in (u.query or "").split("&"):
        if not item:
            continue
        k, _, v = item.partition("=")
        pairs.append([k, v])
    return u, pairs

def set_param(pairs, name, value, append=False):
    """把 name 的值换成 value（percent-encode）。
    append=True 时找不到就追加（--set 用）；探测关键词参数时必须 append=False，
    否则每次探测都会往 URL 里塞一个空参数。"""
    enc = quote(str(value), safe="")
    hit = 0
    for p in pairs:
        if p[0] == name:
            p[1] = enc
            hit += 1
    if not hit and append:
        pairs.append([name, enc])
    return hit

def has_param(pairs, name):
    for p in pairs:
        if p[0] == name:
            return True
    return False

def parse_form(body):
    """表单明文按 '&' 拆成 [[k, '='|'', v], ...]；保留原始顺序与原始编码，原样回写"""
    try:
        text = body.decode("utf-8")
    except UnicodeDecodeError:
        return None
    parts = []
    for item in text.split("&"):
        k, sep, v = item.partition("=")
        parts.append([k, sep, v])
    return parts

def form_has(pairs, name):
    return any(p[0] == name for p in pairs)

def form_set(pairs, name, value, append=False, encode=True):
    """改表单参数；encode=True 时对值做 percent-encode（值已是编码串就传 False）"""
    enc = quote(str(value), safe="") if encode else str(value)
    hit = 0
    for p in pairs:
        if p[0] == name:
            p[1], p[2] = "=", enc
            hit += 1
    if not hit and append:
        pairs.append([name, "=", enc])
        hit = 1
    return hit

def rebuild_form(pairs):
    return "&".join(p[0] + p[1] + p[2] for p in pairs).encode("utf-8")

def set_header(hdrs, name, value):
    """覆盖/新增一个请求头，返回 True=覆盖 False=新增"""
    for h in hdrs:
        if h[0].lower() == name.lower():
            h[1] = value
            return True
    hdrs.append([name, value])
    return False

def rewrite(url, args, allow_missing_keyword=False):
    """返回 (新 URL, 改动说明 list, 关键词是否落在 URL 上)

    allow_missing_keyword=True：URL 里没有关键词参数时不报错也不追加，
    交给 rewrite_body() 去请求体里改（搜索接口的关键词在 POST 体里）。
    """
    u, pairs = parse_query(url)
    notes = []
    in_url = False

    if args.keyword is not None:
        cand = [args.param] if args.param else list(KEY_PARAMS)
        done = None
        for name in cand:
            if name and has_param(pairs, name):
                set_param(pairs, name, args.keyword)
                done = name
                break
        if done is None and args.param and not allow_missing_keyword:
            set_param(pairs, args.param, args.keyword, append=True)   # 显式指定就追加
            done = args.param
        if done is not None:
            in_url = True
            notes.append("URL 关键词参数 %s=%s" % (done, quote(args.keyword, safe="")))
        elif not allow_missing_keyword:
            sys.exit("URL 里找不到关键词参数（试过 %s），请用 --param 指定" % ",".join(cand))

    for kv in (args.set or []):
        k, _, v = kv.partition("=")
        n = set_param(pairs, k, v, append=True)
        notes.append("%s=%s（命中 %d 处）" % (k, v, n))

    if args.bump_time:
        import time
        ms = int(time.time() * 1000)
        sec = ms // 1000
        for k in TIME_PARAMS:
            set_param(pairs, k, str(ms if k == "_rticket" else sec))
        notes.append("已刷新 %s=%d/%d（会破坏签名，仅做对照）" % (",".join(TIME_PARAMS), ms, sec))

    new_q = "&".join("%s=%s" % (k, v) for k, v in pairs)
    return urlunsplit((u.scheme, u.netloc, u.path, new_q, u.fragment)), notes, in_url

def rewrite_body(sel, args, keyword_in_url):
    """
    """
    raw_orig = sel.get("body_raw") or b""
    plain = sel.get("body") or b""
    orig_enc = sel.get("body_encoding") or "identity"
    if not plain:
        return (None if args.keyword else b""), "", b"", []

    pairs = parse_form(plain)
    if pairs is None:                                     # 不是表单文本（二进制/JSON），只能原样
        if args.keyword or args.set_body:
            print("  ! 体不是可解析的表单文本（%d 字节，前 32 字节 %r）" % (len(plain), plain[:32]))
            return None, "", b"", []
        return raw_orig, orig_enc, plain, []

    notes = []
    if args.keyword is not None and not keyword_in_url:
        cand = [args.param] if args.param else list(KEY_PARAMS)
        done = None
        for name in cand:
            if name and form_has(pairs, name):
                form_set(pairs, name, args.keyword)
                done = name
                break
        if done is None:
            print("  &#10007; 体里也找不到关键词参数（试过 %s）；体字段前 30 个：%s"
                  % (",".join(cand), [p[0] for p in pairs[:30]]))
            return None, "", b"", notes
        notes.append("体关键词参数 %s=%s" % (done, quote(args.keyword, safe="")))

    for kv in (args.set_body or []):
        k, _, v = kv.partition("=")
        n = form_set(pairs, k, v, append=True, encode=not args.raw_value)
        notes.append("体参数 %s=%s（%s，命中 %d 处）"
                     % (k, v, "原样写入(raw)" if args.raw_value else "percent-encode", n))

    new_plain = plain if not notes else rebuild_form(pairs)
    mode = args.body_mode
    if mode == "auto":
        mode = "asis" if not notes else "plain"
    if mode == "asis":
        return raw_orig, orig_enc, new_plain, notes
    if mode == "zstd":
        import zstandard
        comp = zstandard.ZstdCompressor().compress(new_plain)
        notes.append("体 zstd 压缩：%d → %d 字节" % (len(new_plain), len(comp)))
        return comp, "zstd", new_plain, notes
    return new_plain, "identity", new_plain, notes

def rewrite_headers(hdrs, args):
    """返回新的 hdrs 列表（[[k,v],...]）；--sign-json 覆盖签名头，--bump-time 刷新时间头，
    --set-header 覆盖/新增任意头（如 Accept-Encoding: identity 让服务端别用 ttzip）"""
    out = [[k, v] for k, v in hdrs]
    notes = []

    if args.set_header:
        for kv in args.set_header:
            k, _, v = kv.partition(":")
            k, v = k.strip(), v.strip()
            hit = 0
            for i, (hk, _hv) in enumerate(out):
                if hk.lower() == k.lower():
                    out[i][1] = v
                    hit = 1
            if not hit:
                out.append([k, v])
            notes.append("头 %s: %s（%s）" % (k, v, "覆盖" if hit else "新增"))

    if args.sign_json:
        with open(args.sign_json, "r", encoding="utf-8") as fh:
            sig = json.load(fh)
        low = {str(k).lower(): v for k, v in sig.items()}
        for i, (k, _v) in enumerate(out):
            if k.lower() in low:
                out[i][1] = str(low[k.lower()])
                notes.append("签名头 %s 已由 --sign-json 覆盖" % k)
        have = [x[0].lower() for x in out]
        for k, v in low.items():
            if k not in have:
                out.append([k, str(v)])
                notes.append("签名头 %s 新增" % k)

    if args.bump_time:
        import time
        t = time.time()
        ms, sec = int(t * 1000), int(t)
        for i, (k, _v) in enumerate(out):
            kl = k.lower()
            if kl in ("x-ss-req-ticket", "activity_now_client"):
                out[i][1] = str(ms)
            elif kl == "x-khronos":
                out[i][1] = str(sec)
        notes.append("时间头已刷新 x-ss-req-ticket/activity_now_client/x-khronos")
    return out, notes

def dump_signreq(path, url, hdrs, plain_body):
    """把「待签请求」写成 rpc_signrpc.py --signreq 能吃的样子：
    签名字头与 x-ss-stub 先剔掉（签名器会自己算/自己填）。"""
    hd = {}
    for k, v in hdrs:
        if k.lower() in SIG_HEADERS or k.lower() in ("x-ss-stub", "content-length"):
            continue
        hd[k] = v
    spec = {"url": url, "headers": hd}
    if plain_body:
        try:
            spec["body"] = plain_body.decode("utf-8")
        except UnicodeDecodeError:
            spec["body_b64"] = base64.b64encode(plain_body).decode()
        spec["body_len"] = len(plain_body)
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(spec, fh, ensure_ascii=False, indent=2)
    return spec

def rpc_sign(spec_path, out_path, scan=None, provider_id=None, verbose=False, timeout=180.0):
    """跑设备端签名 RPC（scripts/rpc_signrpc.py --signreq）→ 返回签名头 dict"""
    cmd = [sys.executable, SIGNRPC, "--signreq", spec_path, "--out", out_path]
    if scan:
        cmd += ["--scan", scan]
    if provider_id:
        cmd += ["--provider-id", provider_id]
    if verbose:
        print("  [i] 签名 RPC: %s" % " ".join(cmd), flush=True)
    p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                       timeout=timeout, cwd=ROOT)
    txt = p.stdout.decode("utf-8", "replace")
    if verbose:
        for line in txt.splitlines():
            if "★" in line or "      x-" in line or "[!]" in line:
                print("  | " + line, flush=True)
    if not os.path.exists(out_path):
        return None, txt
    with open(out_path, "r", encoding="utf-8") as fh:
        return json.load(fh), txt

def apply_sig(hdrs, sig):
    """把签名头合并进 hdrs（原地返回新表），返回 notes"""
    out = [[k, v] for k, v in hdrs]
    low = {str(k).lower(): v for k, v in sig.items()}
    notes = []
    for i, (k, _v) in enumerate(out):
        if k.lower() in low:
            out[i][1] = str(low[k.lower()])
            notes.append("签名头 %s ← RPC" % k)
    have = [x[0].lower() for x in out]
    for k, v in low.items():
        if k not in have:
            out.append([k, str(v)])
            notes.append("签名头 %s 新增 ← RPC" % k)
    return out, notes

def dechunk(body):
    """HTTP/1.1 chunked 解码；不是 chunked 就原样返回"""
    out, rest = b"", body
    try:
        while True:
            line, _, rest = rest.partition(b"\r\n")
            size = int(line.split(b";")[0].strip() or b"0", 16)
            if size == 0:
                return out
            out += rest[:size]
            rest = rest[size + 2:]
    except Exception:
        return body

def try_dechunk(body):
    """严格 chunked 解码：完整成功才返回结果，否则 None（用于头里漏了 transfer-encoding 的情况）"""
    out, rest = b"", body
    try:
        while True:
            line, _, rest = rest.partition(b"\r\n")
            if not line:
                return None
            size = int(line.split(b";")[0].strip() or b"0", 16)
            if size == 0:
                return out if out else None
            if len(rest)  8:
        return out
    if isinstance(node, dict):
        for k, v in node.items():
            walk_lists(v, "%s.%s" % (path, k), out, depth + 1)
    elif isinstance(node, list) and node and isinstance(node[0], dict):
        out.append((path, node))
    return out

def find_text_list(j):
    """找"联想词/热词"这类 [{content/word/sug_word: ...}] 列表，返回 (路径, 文本列表)"""
    for path, lst in walk_lists(j):
        keys = set()
        for it in lst[:3]:
            keys |= set(it.keys())
        if keys & {"content", "word", "sug_word", "hot_word"}:
            txt = []
            for it in lst:
                txt.append(str(it.get("content") or it.get("word")
                               or it.get("sug_word") or it.get("hot_word"))[:30])
            return path, txt
    return None, []

def parse_json_stream(txt):
    """抖音 stream 接口会把多个 JSON 对象**串接**返回（{"a":1}{"ack":-1}{"business_data":…}）。
    逐个 raw_decode 抽出所有对象；返回 [] 表示一个都解不出来。"""
    dec = json.JSONDecoder()
    out, i, n = [], 0, len(txt)
    while i "
    dec, enc = decode_body(head, body)
    print("  encoding=%s 解压后=%d 字节" % (enc or "无", len(dec)))
    if dec[:1] not in (b"{", b"["):
        _alt = try_dechunk(dec)              # 解压后还残留分块框（头里漏了 chunked）时兜底
        if _alt is not None:
            dec = _alt
            print("  (chunked 兜底解码 → %d 字节)" % len(dec))

    verdict = "无法判定（非 JSON）"
    txt = dec.decode("utf-8", "replace")
    objs = []
    try:
        j = json.loads(txt)
        objs = [j] if isinstance(j, dict) else []
    except Exception:
        objs = parse_json_stream(txt)            # 串接多文档（stream 接口的常态）
    if not objs:
        print("  body 前 300 字节: %r" % dec[:300])
        return status, verdict
    if len(objs) > 1:
        print("  响应是 %d 个串接 JSON 文档（stream 分片），取最长/带结果的解析" % len(objs))
    # 优先拿带 business_data / aweme_list 的那个文档，否则拿字段最多的
    j = max(objs, key=lambda o: (("business_data" in o) * 1e6 + ("aweme_list" in o) * 1e6
                                 + len(o)))
    for k in ("search_id", "log_id", "impr_id"):
        if j.get(k) is None:
            for o in reversed(objs):
                if o.get(k) is not None:
                    j[k] = o[k]
                    break

    errno = j.get("errno", j.get("status_code"))
    msg = (j.get("errmsg") or j.get("message") or j.get("msg")
           or j.get("status_msg") or j.get("data"))
    print("  errno/status=%s msg=%s log_id=%s" % (
        errno, str(msg)[:60], j.get("log_id") or j.get("search_id")))
    # 服务端回显的查询串：能直接证明「它把哪个关键词当真了」
    for k in ("query", "keyword", "src_query", "search_keyword", "words", "sug"):
        v = j.get(k)
        if v:
            print("  服务端回显 %s=%r" % (k, str(v)[:70]))
    if errno not in (0, "0", None):
        if str(errno) in ("2483", "8", "1009", "1011"):
            return status, ("&#10007; 风控/登录闸门：status_code=%s %s（服务端认为会话/签名与请求不符）"
                            % (errno, msg))
        return status, "&#10007; 失败：服务端返回错误码（签名/参数被拒）：%s" % msg

    # ① 通用搜索流：aweme_list
    aw = j.get("aweme_list")
    if isinstance(aw, list):
        print("  aweme_list %d 条 has_more=%s cursor=%s" % (
            len(aw), j.get("has_more"), j.get("cursor")))
        for it in aw[:3]:
            au = (it.get("author") or {}).get("nickname") if isinstance(it.get("author"), dict) else ""
            print("    · %s | %s" % (str(it.get("desc"))[:60], au))
        lp = j.get("log_pb") or {}
        print("  search_id/impr_id=%s" % (lp.get("impr_id")))
        if aw:
            return status, "★ 成功：返回了 %d 条搜索结果" % len(aw)
        return status, "△ 可疑：200 且 errno=0，但结果为空（结果集为 0）"

    # ①b v2 综合搜索流（/search/general/stream）：business_data[].data.aweme_info
    bd = j.get("business_data")
    if isinstance(bd, list):
        hits, kws = [], []
        for it in bd:
            d = it.get("data") if isinstance(it.get("data"), dict) else {}
            info = d.get("aweme_info") if isinstance(d.get("aweme_info"), dict) else None
            if info:
                kw = info.get("keyword") or d.get("keyword")
                if kw:
                    kws.append(str(kw))
                hits.append((str(info.get("desc"))[:52],
                             ((info.get("author") or {}).get("nickname") or "")[:20]))
        print("  business_data %d 条（含视频 %d）has_more=%s cursor=%s" % (
            len(bd), len(hits), j.get("has_more"), j.get("cursor")))
        for ds, au in hits[:3]:
            print("    · %s | %s" % (ds, au))
        if kws:
            print("  服务端命中关键词（item.keyword）= %s" % sorted(set(kws))[:5])
        lp = j.get("log_pb") or {}
        print("  search_id/impr_id=%s" % lp.get("impr_id"))
        if hits:
            return status, "★ 成功：返回 %d 条视频（business_data 流，关键词生效）" % len(hits)
        return status, "△ 可疑：200 且 errno=0，business_data 非空但无视频实体"

    # ② 联想词
    path, words = find_text_list(j)
    if words:
        print("  文本列表(%s) %d 条：%s" % (path, len(words), " | ".join(words[:12])))
        return status, "★ 成功：服务端返回了 %d 条文本结果" % len(words)

    # ③ 其它结构：打印顶层字段 + empty_reason
    print("  顶层字段: %s" % sorted(j.keys())[:12])
    for path, lst in walk_lists(j):
        keys = set()
        for it in lst[:2]:
            keys |= set(it.keys())
        if keys:
            print("    列表 %s len=%d keys=%s" % (path, len(lst), sorted(keys)[:12]))
            break
    blob = dec.decode("utf-8", "replace")
    if "empty_reason" in blob:
        import re
        m = re.search(r'"empty_reason":\s*"([^"]*)"', blob)
        print("  empty_reason=%s" % (m.group(1) if m else "?"))
    if '"src_query":"' in blob or '"src_query": "' in blob:
        import re
        m = re.search(r'"src_query":\s*"([^"]*)"', blob)
        print("  服务端 src_query=%r（说明请求里的关键词已被服务端解析）" % (m.group(1) if m else "?"))
    return status, "△ 可疑：200 且 errno=0，但未发现结果集（可能引擎为空/被降级）"

def main():
    ap = argparse.ArgumentParser(description="抓包模板 + 任意关键词 → 宿主机直发（可外部重签）")
    ap.add_argument("json", help="decode 产出的 reqs_*.json")
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--id", type=int)
    ap.add_argument("--match", help="URL 子串筛选（suggest / search / page/loadmore）")
    ap.add_argument("--keyword", help="新关键词")
    ap.add_argument("--param", help="关键词参数名（默认自动试 %s）" % ",".join(KEY_PARAMS))
    ap.add_argument("--set", action="append", help="额外覆盖 URL 参数 k=v（可重复）")
    ap.add_argument("--set-body", action="append", metavar="K=V",
                    help="覆盖/新增 POST 体里的表单参数（可重复；如 'keyword=显卡'），"
                         "值默认做 percent-encode，已是编码值请加 --raw-value")
    ap.add_argument("--body-mode", choices=("auto", "plain", "zstd", "asis"), default="auto",
                    help="发体方式：auto 有改动即发明文 / plain 发明文 / zstd 压缩后发 / asis 原样")
    ap.add_argument("--raw-value", action="store_true", help="--set-body 的值不再 percent-encode")
    ap.add_argument("--keep-stub", action="store_true",
                    help="改动后故意保留抓包里的旧 x-ss-stub（反向对照，服务端应拒绝）")
    ap.add_argument("--show-body", action="store_true", help="打印改动后的表单明文")
    ap.add_argument("--set-header", action="append", metavar="K:V",
                    help="覆盖/新增请求头（可重复；如 'Accept-Encoding: identity'）")
    ap.add_argument("--bump-time", action="store_true", help="刷新时间戳头/参数（会破坏签名）")
    ap.add_argument("--sign-json", help="外部签名器结果 JSON，覆盖 x-gorgon/x-khronos/...")
    ap.add_argument("--dump-req", metavar="FILE",
                    help="把改好关键词的待签请求写成 JSON（{url,body,headers}），交 rpc_signrpc.py --signreq")
    ap.add_argument("--rpc-sign", nargs="?", const="", default=None, metavar="类名|上限|等待秒",
                    help="★一步到位：先把待签请求交给设备端签名 RPC，再把结果注入本请求后发送")
    ap.add_argument("--sign-out", default="/tmp/dy_sig.json", help="--rpc-sign 的签名头落盘路径")
    ap.add_argument("--drop", action="append", help="发送时丢弃某头（可重复）")
    ap.add_argument("--insecure", action="store_true")
    ap.add_argument("--timeout", type=float, default=15.0)
    ap.add_argument("--max-bytes", type=int, default=1

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(474.43 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4MzcwOXw2OGZmNDVjZHwxNzkxNDIxMjk4fDB8MjEzMTExNw%3D%3D&nothumb=yes)

2026-10-6 14:35 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(503.43 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4MzcxMHxiNDFjYTQyMnwxNzkxNDIxMjk4fDB8MjEzMTExNw%3D%3D&nothumb=yes)

2026-10-6 14:35 上传

---

[查看原文](https://www.52pojie.cn/thread-2131117-1-1.html)
