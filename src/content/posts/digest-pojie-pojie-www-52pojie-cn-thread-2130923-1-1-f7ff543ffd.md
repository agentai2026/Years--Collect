---
title: "xhs网页搜索接口"
published: 2026-10-04
description: "程序执行逻辑 1，Python主程序构造搜索POST请求体 + 接口URI(/api/sns/web/v2/search/notes) 2，Signer类 → 发送uri+body给Node子进程（stdin管道） 3，Node沙箱内调用原生mnsv2函数计算xs、xsc， ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "wabc666"
sourceLink: "https://www.52pojie.cn/thread-2130923-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2130923-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

程序执行逻辑

1，Python主程序构造搜索POST请求体 + 接口URI(/api/sns/web/v2/search/notes)

2，Signer类 → 发送uri+body给Node子进程（stdin管道）

3，Node沙箱内调用原生mnsv2函数计算xs、xsc，生成xt时间戳

4，Node通过stdout把签名结果返回Python

5，Python组装HTTP请求头：x-s、x-t、x-s-common + cookie、UA

6，urllib.request POST请求小红书搜索接口

7，拿到接口返回JSON → extract提取笔记数据

搜索主控部分

[Asm] *纯文本查看* *复制代码*
#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import csv
import json
import os
import random
import re
import subprocess
import sys
import time
import traceback
import urllib.error
import urllib.request
import uuid
from pathlib import Path

COOKIE = """

""".strip()

KEYWORDS = ["咖啡"]
PAGES = 1
SORT = "general"       # general综合 / time_descending最新 / popularity_descending最热
NOTE_TYPE = 0          # 0不限 1视频 2图文
OUT_DIR = "out"
SHOW_TOP = 10
DELAY = 1.5
PAGE_SIZE = 20

HERE = Path(__file__).resolve().parent
SDK_DIR = HERE / "xhs_sdk"
SIGNER = HERE / "xhs_sign.mjs"
SEARCH_HOST = "https://so.xiaohongshu.com"
SEARCH_URI = "/api/sns/web/v2/search/notes"
ME_HOST = "https://edith.xiaohongshu.com"
ME_URI = "/api/sns/web/v2/user/me"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
CSV_COLS = ["keyword", "page", "note_id", "type", "title", "author", "author_id",
            "liked", "collected", "commented", "shared", "publish_time", "url"]

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

def _http_raw(url, data=None, timeout=60, html=False):
    headers = {"user-agent": UA, "accept-language": "zh-CN,zh;q=0.9", "referer": "https://www.xiaohongshu.com/"}
    if html:
        headers["accept"] = "text/html,*/*;q=0.8"
        headers["upgrade-insecure-requests"] = "1"
    else:
        headers["accept"] = "*/*"
        headers["origin"] = "https://www.xiaohongshu.com"
    req = urllib.request.Request(url, data=data, headers=headers)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()

def _http_retry(url, data=None, tries=3, timeout=60, html=False):
    last_err = None
    for i in range(tries):
        try:
            return _http_raw(url, data=data, timeout=timeout, html=html)
        except Exception as e:
            last_err = e
            if i ]+src=["\']([^"\']+)["\']', html_text):
            u = u.replace("&","&")
            if not u.startswith("http"): continue
            if re.search(r"vendor-dynamic\.[0-9a-f]+\.js",u): vendor_url=u
            elif _is_sec_script(u): sec_urls.append(u)
        if not vendor_url:
            m = re.search(r"https://fe-static\.xhscdn\.com/formula-static/xhs-pc-web/public/resource/js/vendor-dynamic\.[0-9a-f]+\.js", html_text)
            if m: vendor_url = m.group(0)
    ds_main = "https://as.xiaohongshu.com/api/sec/v1/ds?appId=xhs-pc-web"
    if ds_main not in sec_urls: sec_urls.insert(0, ds_main)
    for u in _sbtsource_extras():
        if u not in sec_urls: sec_urls.append(u)
    seen, ordered = set(), []
    for u in sec_urls:
        if u not in seen: seen.add(u); ordered.append(u)
    manifest = {"fetchedAt":time.strftime("%Y-%m-%dT%H:%M:%S"),"scripts":[]}
    ok = 0
    for i,u in enumerate(ordered,1):
        name = "sec_ds.js" if "sec/v1/ds" in u else _safe_name(u,i)
        try:
            code = _http_retry(u)
            (SDK_DIR/name).write_bytes(code)
            manifest["scripts"].append({"file":name,"from":u,"bytes":len(code)})
            ok +=1
            print(f"  [OK] {name: {SDK_DIR}\n")

class Signer:
    def __init__(self, cookie):
        if not SIGNER.exists(): raise RuntimeError(f"找不到 {SIGNER.name}，放在py同目录！")
        try:
            self.proc = subprocess.Popen(["node",str(SIGNER),cookie,str(SDK_DIR)],
                stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.DEVNULL,
                text=True,encoding="utf-8",bufsize=1)
        except FileNotFoundError: raise RuntimeError("未安装Node.js，请安装node并加入环境变量")
        line = self.proc.stdout.readline()
        if not line: raise RuntimeError("签名进程无响应")
        msg = json.loads(line)
        if not msg.get("ready"): raise RuntimeError(f"签名进程启动失败: {msg.get('error')}")
        self._seq =0
    def sign(self, uri, body):
        body_str = json.dumps(body,ensure_ascii=False,separators=(",",":"))
        self._seq +=1
        self.proc.stdin.write(json.dumps({"uri":uri,"body":body_str,"id":self._seq},ensure_ascii=False)+"\n")
        self.proc.stdin.flush()
        line = self.proc.stdout.readline()
        res = json.loads(line)
        if "error" in res: raise RuntimeError(f"签名失败:{res['error']}")
        return {"x-s":res["xs"],"x-t":res["xt"],"x-s-common":res["xsc"]}, body_str
    def close(self):
        try:
            self.proc.stdin.write('{"bye":true}\n')
            self.proc.stdin.flush()
            self.proc.wait(timeout=3)
        except Exception:
            try: self.proc.kill()
            except Exception:pass

class Xhs:
    def __init__(self, cookie, delay):
        self.cookie = " ".join(cookie.split())
        if "a1=" not in self.cookie: raise RuntimeError("Cookie缺少a1字段，无法签名")
        self.delay = delay
        self.session_id = str(uuid.uuid4())
        self.signer = Signer(self.cookie)
    def _headers(self, uri, body):
        sig, body_str = self.signer.sign(uri, body)
        headers = {
            "content-type":"application/json;charset=UTF-8",
            "user-agent":UA,
            "x-s":sig["x-s"], "x-t":sig["x-t"], "x-s-common":sig["x-s-common"],
            "x-b3-traceid":uuid.uuid4().hex[:16],
            "x-xray-traceid":uuid.uuid4().hex,
            "origin":"https://www.xiaohongshu.com",
            "referer":"https://www.xiaohongshu.com/",
            "accept-language":"zh-CN,zh;q=0.9",
            "cookie":self.cookie
        }
        return headers, body_str
    def _call(self, method, host, uri, body=None):
        headers, body_str = self._headers(uri, body)
        data = body_str.encode("utf-8") if body_str else None
        req = urllib.request.Request(host+uri, data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req,timeout=30) as r:
                raw, status = r.read().decode("utf-8","replace"), r.status
        except urllib.error.HTTPError as e:
            raw, status = e.read().decode("utf-8","replace"), e.code
        except Exception as e:
            return 0, {"code":-1,"msg":f"网络错误:{e}"}
        try: return status, json.loads(raw)
        except Exception: return status, {"code":-1,"msg":f"非JSON响应:{raw[:160]}"}
    def check_login(self):
        st, data = self._call("GET", ME_HOST, ME_URI)
        d = data.get("data") or {}
        return {"http":st,"code":data.get("code"),"msg":data.get("msg"),
                "guest":d.get("guest"),"user_id":d.get("user_id"),
                "nickname":d.get("nickname") or d.get("user_nickname")}
    def search(self, keyword, page=1, page_size=20, sort="general", note_type=0, search_id=None):
        body = {
            "keyword":keyword,"page":page,"page_size":page_size,
            "search_id":search_id or "".join(random.choice("abcdefghijklmnopqrstuvwxyz0123456789") for _ in range(21)),
            "sort":sort,"note_type":note_type,"ext_flags":[],"geo":"",
            "image_formats":["jpg","webp","avif"],"session_id":self.session_id
        }
        return self._call("POST", SEARCH_HOST, SEARCH_URI, body)
    def sleep(self):
        time.sleep(self.delay + random.random()*0.5)
    def close(self):
        self.signer.close()

def to_num(v):
    if v is None: return 0
    m = re.match(r"^([\d.]+)\s*([万亿wW]?)", str(v).strip())
    if not m: return 0
    try: n = float(m.group(1))
    except ValueError: return 0
    unit = m.group(2)
    if unit and unit in "万wW": n *=10000
    if unit == "亿": n *=100000000
    return int(round(n))

def extract(keyword, page, data):
    rows = []
    d = data.get("data") or {}
    for it in d.get("items") or []:
        c = it.get("note_card")
        if not c: continue
        nid = it.get("id") or ""
        token = it.get("xsec_token") or c.get("xsec_token") or ""
        tag = next((x.get("text") for x in (c.get("corner_tag_info") or []) if x.get("type")=="publish_time"),"")
        u = c.get("user") or {}
        it_info = c.get("interact_info") or {}
        rows.append({
            "keyword":keyword,"page":page,"note_id":nid,"type":c.get("type","normal"),
            "title":" ".join(str(c.get("display_title") or c.get("title") or "").split()),
            "author":u.get("nickname") or u.get("nick_name") or "",
            "author_id":u.get("user_id") or "",
            "liked":to_num(it_info.get("liked_count")),
            "collected":to_num(it_info.get("collected_count")),
            "commented":to_num(it_info.get("comment_count")),
            "shared":to_num(it_info.get("shared_count")),
            "publish_time":tag,
            "url":f"https://www.xiaohongshu.com/explore/{nid}?xsec_token={token}&xsec_source=pc_search" if token else f"https://www.xiaohongshu.com/explore/{nid}"
        })
    return rows, bool(d.get("has_more")), d.get("search_id")

def explain(status, data):
    if status ==461: return False,True,"签名校验失败(461)"
    if status ==406: return True,False,"请求被拒(406)接口变更"
    code = data.get("code")
    if code ==0: return False,False,None
    if code ==-101: return True,False,"Cookie失效，请重新导出cookie"
    if code ==-104: return True,False,"游客会话，请登录"
    if code ==300011: return True,False,"账号风控拦截，降低频率"
    return False,False,f"code={code} msg={data.get('msg','')}"

def main():
    ensure_sdk()
    xhs = Xhs(COOKIE, DELAY)
    try:
        me = xhs.check_login()
        if me["code"] !=0: raise RuntimeError(f"登录失败: {me.get('msg')}, code={me.get('code')}")
        print(f"[OK] 登录成功：{me.get('nickname') or '?'} ({me.get('user_id')})\n")
        outdir = HERE / OUT_DIR
        outdir.mkdir(parents=True, exist_ok=True)
        csv_path = outdir / f"notes-{time.strftime('%Y-%m-%d')}.csv"
        if not csv_path.exists():
            with csv_path.open("w",newline="",encoding="utf-8-sig") as f:
                csv.writer(f).writerow(CSV_COLS)
        seen = set()
        try:
            with csv_path.open("r",newline="",encoding="utf-8-sig") as f:
                for row in csv.DictReader(f):
                    if row.get("keyword") and row.get("note_id"):
                        seen.add((row["keyword"],row["note_id"]))
        except Exception: pass
        if seen: print(f"[i] 已有 {len(seen)} 条历史记录，自动去重\n")
        blocked = {"v":False}

        def flush(rows):
            fresh = [r for r in rows if r["note_id"] and (r["keyword"],r["note_id"]) not in seen]
            for r in fresh: seen.add((r["keyword"],r["note_id"]))
            if fresh:
                with csv_path.open("a",newline="",encoding="utf-8-sig") as f:
                    csv.writer(f).writerows([[r[c] for c in CSV_COLS] for r in fresh])
            return len(fresh)

        def run_keyword(kw):
            search_id, total, shown = None,0,0
            if SHOW_TOP>0:
                print(f"  标题{' '*30}作者{' '*10}点赞")
                print("  "+"-"*74)
            for page in range(1, PAGES+1):
                attempt=0
                while True:
                    status, data = xhs.search(kw, page=page, page_size=PAGE_SIZE, sort=SORT, note_type=NOTE_TYPE, search_id=search_id)
                    stop, retry, msg = explain(status, data)
                    if not msg: break
                    if stop:
                        print(f"  [X] {msg}")
                        blocked["v"]=True
                        return total
                    if retry and attempt0:
                    for r in rows:
                        if shown >= SHOW_TOP:break
                        title = (" ".join(r["title"].split()))[:34].ljust(34)
                        author = r["author"][:12].ljust(12)
                        print(f"  {title} @{author} {r['liked']}")
                        shown +=1
                print(f"  -> p{page} 共{len(rows)}条，新增{added}，累计{total}", flush=True)
                if not has_more or not rows or page >= PAGES: break
                xhs.sleep()
            return total

        for kw in KEYWORDS:
            if blocked["v"]:break
            print(f"\n>> 搜索关键词：{kw}")
            run_keyword(kw)
            if not blocked["v"]: xhs.sleep()

        print("\n"+"="*76)
        print(f"完成，总记录数：{len(seen)}")
        print(f"结果文件：{csv_path}")
        if blocked["v"]:
            print("\n[!] 风控拦截，任务中止！")
            return 4
        return 0
    finally:
        xhs.close()

if __name__ == "__main__":
    try:
        ret = main()
    except KeyboardInterrupt:
        print("\n已手动终止")
        ret = 130
    except RuntimeError as e:
        print("\n"+"!"*64)
        print(e)
        print("!"*64)
        ret=1
    except Exception as e:
        print("\n"+"!"*64)
        print(f"[异常] {type(e).__name__}: {e}")
        traceback.print_exc()
        print("!"*64)
        ret=1
    # 右键运行暂停窗口
    try:
        input("\n按回车键关闭窗口…")
    except:
        pass
    sys.exit(ret)

*Node 版 **VM **沙箱，执行小红书js

*[Asm] *纯文本查看* *复制代码*
/**
在 Node 的 VM 沙箱里模拟浏览器环境，加载小红书官网混淆 JS
拿到原生 mnsv2 签名函数；然后作为守护进程
接收 Python 发来的接口请求信息
调用原生 mnsv2 计算小红书请求头签名 xs、xsc，返回给 Python
 */

import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const SDK = process.argv[3] || join(HERE, 'sec_sdk');

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36';

const CUSTOM_B64 = 'ZmserbBoHQtNP+wOcza/LpngG8yJq42KWYj0DSfdikx3VT16IlUAFM97hECvuRX5';
const STD_B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

const md5 = (s) => createHash('md5').update(s, 'utf8').digest('hex');

function customBase64(str) {
  const std = Buffer.from(str, 'utf8').toString('base64');
  let out = '';
  for (const ch of std) {
    const i = STD_B64.indexOf(ch);
    out += i === -1 ? ch : CUSTOM_B64[i];
  }
  return out;
}

// ---------------------------------------------------------------------------
// 浏览器环境 shim
// 关键：绝不把宿主 realm 的 Object/Function/Error/Reflect 注入 vm 沙箱。
// vm.createContext 会创建属于上下文自己的那一套；用外部的覆盖掉，
// 混淆 VM 的环境探测会误判，于是静默地不生成 mnsv2。
// ---------------------------------------------------------------------------
function makeSandbox(cookie) {
  const s = {};
  const noop = () => {};
  const el = (tag) => {
    if (tag === 'canvas') {
      const c = { width: 300, height: 150, style: {}, toDataURL: () => 'data:image/png;base64,iVBORw0KGgo=' };
      c.getContext = () => ({
        fillRect: noop, clearRect: noop, fillText: noop, measureText: () => ({ width: 10 }),
        beginPath: noop, closePath: noop, arc: noop, fill: noop, stroke: noop, save: noop, restore: noop,
        translate: noop, rotate: noop, scale: noop, drawImage: noop, rect: noop, moveTo: noop, lineTo: noop,
        clip: noop, putImageData: noop, getExtension: () => null, getParameter: () => 'WebKit',
        getSupportedExtensions: () => [], canvas: c,
        createLinearGradient: () => ({ addColorStop: noop }),
        getImageData: (x, y, w, h) => ({ data: new Uint8ClampedArray(Math.max(4, (w | 0) * (h | 0) * 4)) }),
      });
      c.setAttribute = noop; c.getAttribute = () => null; c.addEventListener = noop;
      return c;
    }
    const e = { tagName: String(tag).toUpperCase(), style: {}, children: [], dataset: {}, classList: { add: noop, remove: noop, contains: () => false } };
    e.setAttribute = noop; e.getAttribute = () => null; e.removeAttribute = noop;
    e.appendChild = (c) => (e.children.push(c), c); e.removeChild = noop; e.insertBefore = noop;
    e.addEventListener = noop; e.removeEventListener = noop; e.getContext = () => null;
    e.querySelector = () => null; e.querySelectorAll = () => []; e.focus = noop; e.click = noop;
    return e;
  };
  const store = {};
  const storage = {
    getItem: (k) => (Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { for (const k of Object.keys(store)) delete store[k]; },
    key: (i) => Object.keys(store)[i] ?? null,
    get length() { return Object.keys(store).length; },
  };
  const Obs = function () { this.observe = noop; this.disconnect = noop; this.unobserve = noop; this.takeRecords = () => []; };

  s.window = s; s.self = s; s.globalThis = s; s.top = s; s.parent = s; s.frames = s;
  s.navigator = {
    userAgent: UA, platform: 'Win32', language: 'zh-CN', languages: ['zh-CN', 'zh'], webdriver: false,
    hardwareConcurrency: 8, deviceMemory: 8, maxTouchPoints: 0,
    plugins: { length: 5 }, mimeTypes: { length: 4 },
    userAgentData: { brands: [{ brand: 'Chromium', version: '142' }], mobile: false, platform: 'Windows' },
  };
  s.location = {
    href: 'https://www.xiaohongshu.com/explore', protocol: 'https:', host: 'www.xiaohongshu.com',
    hostname: 'www.xiaohongshu.com', pathname: '/explore', search: '', hash: '',
    origin: 'https://www.xiaohongshu.com', port: '',
    replace: noop, assign: noop, reload: noop, toString: () => 'https://www.xiaohongshu.com/explore',
  };
  s.screen = { width: 1920, height: 1080, availWidth: 1920, availHeight: 1040, colorDepth: 24, pixelDepth: 24, availLeft: 0, availTop: 0 };
  s.localStorage = storage; s.sessionStorage = storage;
  s.document = {
    cookie, referrer: '', title: 'xhs', readyState: 'complete', visibilityState: 'visible', hidden: false,
    documentElement: el('html'), head: el('head'), body: el('body'),
    createElement: el, createElementNS: (_n, t) => el(t), createTextNode: (t) => ({ textContent: t }),
    createDocumentFragment: () => el('fragment'),
    getElementById: () => null, getElementsByTagName: () => [el('head')], getElementsByClassName: () => [],
    querySelector: () => null, querySelectorAll: () => [],
    addEventListener: noop, removeEventListener: noop, dispatchEvent: () => true,
    write: noop, writeln: noop, open: noop, close: noop, hasFocus: () => true,
  };
  s.crypto = {
    getRandomValues: (a) => { for (let i = 0; i  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0; return (c === 'x' ? r : (r & 3) | 8).toString(16);
    }),
  };
  s.performance = { now: () => Date.now(), timeOrigin: Date.now(), getEntriesByType: () => [], mark: noop, measure: noop };
  s.addEventListener = noop; s.removeEventListener = noop; s.dispatchEvent = () => true;
  s.matchMedia = () => ({ matches: false, addListener: noop, removeListener: noop, addEventListener: noop });
  s.requestAnimationFrame = () => 0; s.cancelAnimationFrame = noop;
  s.XMLHttpRequest = function () {};
  s.XMLHttpRequest.prototype.open = noop; s.XMLHttpRequest.prototype.setRequestHeader = noop;
  s.XMLHttpRequest.prototype.send = noop; s.XMLHttpRequest.prototype.abort = noop;
  s.XMLHttpRequest.prototype.addEventListener = noop;
  s.fetch = () => Promise.reject(new Error('sandbox: no network'));
  s.WebSocket = function () {}; s.MessageChannel = function () { this.port1 = {}; this.port2 = {}; };
  s.Worker = function () {}; s.Blob = function () {};
  s.URL = URL; s.URL.createObjectURL = () => 'blob:mock'; s.URL.revokeObjectURL = noop;
  s.Image = function () { this.width = 0; this.height = 0; }; s.Image.prototype.addEventListener = noop;
  s.OffscreenCanvas = function (w, h) { this.width = w; this.height = h; };
  s.OffscreenCanvas.prototype.getContext = () => el('canvas').getContext();
  s.MutationObserver = Obs; s.IntersectionObserver = Obs; s.ResizeObserver = Obs; s.PerformanceObserver = Obs;
  s.EventTarget = function () {}; s.EventTarget.prototype.addEventListener = noop;
  s.EventTarget.prototype.removeEventListener = noop; s.EventTarget.prototype.dispatchEvent = () => true;
  s.Event = function (t) { this.type = t; };
  s.CustomEvent = function (t, o) { this.type = t; this.detail = o && o.detail; };
  // 官方内联脚本会把 chrome 注入 VM，缺了会让环境判定走偏
  s.chrome = { runtime: {}, loadTimes: () => ({}), csi: () => ({}), app: { isInstalled: false, InstallState: {}, RunningState: {} } };
  s.setTimeout = () => 0; s.setInterval = () => 0; s.clearTimeout = noop; s.clearInterval = noop;
  return s;
}

// ---------------------------------------------------------------------------
// 加载官方脚本 → signV2Init → mnsv2
// ---------------------------------------------------------------------------
function buildSigner(cookie) {
  const sandbox = makeSandbox(cookie);
  const ctx = vm.createContext(sandbox);

  // createContext 之后只补宿主能力，绝不覆盖标准内建
  for (const k of ['console', 'Buffer', 'TextEncoder', 'TextDecoder', 'atob', 'btoa', 'URLSearchParams',
    'structuredClone', 'queueMicrotask', 'setImmediate', 'Intl']) {
    if (!(k in sandbox)) sandbox[k] = k === 'console'
      ? { log() {}, error() {}, warn() {}, info() {}, debug() {} }
      : globalThis[k];
  }
  sandbox.window = sandbox; sandbox.self = sandbox;

  // 脚本清单：优先用 manifest.json（下载器生成的顺序），否则用内置顺序
  let SEC = ['sec_ds.js', 's_pub_04b.js', 's_ds_v2.js', 's_pub_bf7.js', 's_sign_f218.js'];
  const manifestPath = join(SDK, 'manifest.json');
  if (existsSync(manifestPath)) {
    try {
      const list = (JSON.parse(readFileSync(manifestPath, 'utf8')).scripts || [])
        .map((s) => (typeof s === 'string' ? s : s.file))
        .filter((f) => f && f !== 'vendor-dynamic.js');
      if (list.length) SEC = list;
    } catch { /* 用内置顺序 */ }
  }

  for (const f of SEC) {
    const p = join(SDK, f);
    if (!existsSync(p)) continue;
    try { vm.runInContext(readFileSync(p, 'utf8'), ctx, { filename: f, timeout: 30000 }); } catch { /* 官方脚本自身噪音 */ }
  }

  const vendorPath = join(SDK, 'vendor-dynamic.js');
  if (!existsSync(vendorPath)) throw new Error('缺少 vendor-dynamic.js（mnsv2 的唯一来源）');

  const chunks = [];
  sandbox.webpackChunkxhs_pc_web = { push: (a) => chunks.push(a) };
  const stub = new Proxy(function () {}, {
    get: (t, k) => (k === 'default' ? stub : k === '__esModule' ? true : stub),
    apply: () => stub, construct: () => ({}),
  });
  try { vm.runInContext(readFileSync(vendorPath, 'utf8'), ctx, { filename: 'vendor-dynamic.js', timeout: 60000 }); } catch { /* ignore */ }

  const modules = {};
  for (const c of chunks) {
    const m = Array.isArray(c) ? c[1] : c?.modules;
    if (m && typeof m === 'object') Object.assign(modules, m);
  }

  const cache = {};
  const req = (id) => {
    if (cache[id]) return cache[id].exports;
    const m = { exports: {}, id };
    cache[id] = m;
    const fn = modules[id];
    if (typeof fn !== 'function') return stub;
    try { fn(m, m.exports, req); } catch { /* 依赖环境，忽略 */ }
    return m.exports;
  };
  req.d = (e, d) => { for (const k in d) Object.defineProperty(e, k, { enumerable: true, get: d[k] }); };
  req.n = (m) => { const g = m && m.__esModule ? () => m.default : () => m; g.a = g; return g; };
  req.r = () => {}; req.o = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

  const signV2Init = req(4455)?.a;
  if (typeof signV2Init !== 'function') throw new Error('未取到 signV2Init，官方脚本可能已过期');
  try { signV2Init(); } catch { /* ignore */ }

  const mnsv2 = sandbox.mnsv2;
  if (typeof mnsv2 !== 'function') throw new Error('官方 mnsv2 未生成，官方脚本可能已过期');

  return mnsv2;
}

// ---------------------------------------------------------------------------
// 复刻应用里的 seccore_signv2
// ---------------------------------------------------------------------------
function makeSigners(cookie, mnsv2) {
  const a1 = /(?:^|;\s*)a1=([^;]+)/.exec(cookie)?.[1] ?? '';
  const signXS = (uri, bodyStr) => {
    const content = uri + bodyStr;
    const u = md5(content);
    const p = md5(uri);
    const S = {
      x0: '4.4.3', x1: 'xhs-pc-web', x2: 'Windows',
      x3: mnsv2(content, u, p), x4: 'object', x5: u,
    };
    return 'XYS_' + customBase64(JSON.stringify(S));
  };
  // x-s-common 实测不校验内容，只要头存在即可
  const signXSCommon = () => customBase64(JSON.stringify({
    s0: 0, s1: '', x0: '1', x1: '4.4.3', x2: 'Windows', x3: 'xhs-pc-web', x4: '6.56.3',
    x5: a1, x6: '', x7: '', x8: '', x9: 0, x10: 1, x11: 'normal', x12: '1;1',
  }));
  return { signXS, signXSCommon };
}

// ---------------------------------------------------------------------------
// 守护进程
// ---------------------------------------------------------------------------
const cookie = process.argv[2] ?? '';
let signers;
try {
  signers = makeSigners(cookie, buildSigner(cookie));
} catch (e) {
  process.stdout.write(JSON.stringify({ ready: false, error: e.message }) + '\n');
  process.exit(1);
}

const out = (o) => process.stdout.write(JSON.stringify(o) + '\n');
out({ ready: true });

let buf = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (d) => {
  buf += d;
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i).trim();
    buf = buf.slice(i + 1);
    if (!line) continue;
    try {
      const msg = JSON.parse(line);
      if (msg.bye) { process.exit(0); }
      out({
        xs: signers.signXS(msg.uri, msg.body ?? ''),
        xt: String(Date.now()),
        xsc: signers.signXSCommon(),
        id: msg.id,
      });
    } catch (e) {
      out({ error: String(e.message).slice(0, 200), id: null });
    }
  }
});
process.stdin.on('end', () => process.exit(0));

执行结果

---

[查看原文](https://www.52pojie.cn/thread-2130923-1-1.html)
