---
title: "利用sdenv执行极验js，获取加密结果实现登陆"
published: 2026-10-03
description: "测试站点，https://demos.geetest.com/slide-float.html 使用sdenv补环境框架执行极验js，初始化验证码，过滑块，拦截加密结果 sdenv项目地址，https://github.com/pysunday/sdenv python控制器，控制n ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "wabc666"
sourceLink: "https://www.52pojie.cn/thread-2130859-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2130859-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

测试站点，[https://demos.geetest.com/slide-float.html](https://demos.geetest.com/slide-float.html)

使用sdenv补环境框架执行极验js，初始化验证码，过滑块，拦截加密结果

sdenv项目地址，[https://github.com/pysunday/sdenv](https://github.com/pysunday/sdenv)

python控制器，控制nodejs执行极验的js脚本

① 请求极验demo接口拿到 gt、challenge

② 启动Node桥接进程，jsdom环境初始化极验captchaObj

③ 虚拟DOM挂载验证码组件

④ 模拟点击雷达按钮，加载滑块图片（bg/fullbg/slice）

⑤ 识别滑块缺口，计算拖动像素距离

⑥ 发送drag指令，模拟2秒鼠标拖拽

⑦ 捕获极验ajax返回结果，判断success

⑧ 提取challenge / validate / seccode 三个凭证

⑨ POST提交凭证到demo登录接口，判断登录是否成功

[Asm] *纯文本查看* *复制代码*
#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import io
import json
import os
import re
import shutil
import subprocess
import sys
import threading
import time
import urllib.request
import http.cookiejar

# 要安装依赖
# jsdom
# @napi-rs/canvas

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

#缓存目录位置，./gt_hybrid_cache,用于下载验证码图片，js
HERE = os.path.dirname(os.path.abspath(__file__))
BRIDGE_DIR = os.path.join(HERE, "gt_hybrid_cache")

#定位node位置，需要启动 Node.js 跑 bridge.js
def _find_node():
    for c in (os.environ.get("NODE_BIN"), "node",
              r"C:\Program Files\nodejs\node.exe",
              r"C:\Program Files (x86)\nodejs\node.exe"):
        if not c:
            continue
        p = shutil.which(c)
        if p:
            return p
        if os.path.isfile(c):
            return c
    return "node"

NODE = _find_node()

#当前目录下创建缓存文件夹，把项目里的bridge.js复制到缓存目录，自动新建package.json，写好需要安装的 node 依赖
def materialize_bridge(verbose=False):
    src = "./bridge.js"
    os.makedirs(BRIDGE_DIR, exist_ok=True)
    dst = os.path.join(BRIDGE_DIR, "bridge.js")
    if os.path.abspath(src) != os.path.abspath(dst):
        txt = io.open(src, encoding="utf-8").read()
        old = io.open(dst, encoding="utf-8").read() if os.path.exists(dst) else None
        if old != txt:
            with io.open(dst, "w", encoding="utf-8", newline="") as fh:
                fh.write(txt)
            if verbose:
                log(f"已同步 bridge.js -> {dst}")

    return dst

ORIGIN = "https://demos.geetest.com"
API = "https://api.geevisit.com"

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

#创建一个能带 Cookie 的网页请求工具
_CJ = http.cookiejar.CookieJar()
_OPENER = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(_CJ))

def log(msg):
    print(f" {msg}", flush=True)

def good(msg):
    print(f"[+] {msg}", flush=True)

def bad(msg):
    print(f"[!] {msg}", flush=True)

#调用_OPENER访问网络
def http_get(url: str, referer: str = ORIGIN + "/") -> str:
    req = urllib.request.Request(url)
    req.add_header("User-Agent", UA)
    req.add_header("Referer", referer)
    req.add_header("Accept-Language", "zh-CN,zh;q=0.9")
    with _OPENER.open(req, timeout=20) as r:
        return r.read().decode("utf-8", "replace")

def http_post(url: str, data: dict) -> str:
    import urllib.parse
    body = urllib.parse.urlencode(data).encode()
    req = urllib.request.Request(url, data=body, method="POST")
    req.add_header("User-Agent", UA)
    req.add_header("Referer", ORIGIN + "/")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")
    with _OPENER.open(req, timeout=20) as r:
        return r.read().decode("utf-8", "replace")

def http_download(url: str, dest: str) -> str:
    req = urllib.request.Request(url)
    req.add_header("User-Agent", UA)
    req.add_header("Referer", ORIGIN + "/")
    with _OPENER.open(req, timeout=20) as r:
        data = r.read()
    with open(dest, "wb") as fh:
        fh.write(data)
    return dest

# gt.js：启动验证码的入口
# slide.js：滑块核心，记录拖动并生成验证加密数据
# fullpage.js：验证码弹窗界面（显示用）
# gct.js：收集环境、鼠标行为，判断是不是真人

#gt.js 启动 → 加载 slide.js（滑块逻辑） + fullpage.js（弹窗 UI） + gct.js（风控采集）

STATIC_JS = {
    "gct.js": "https://static.geetest.com/static/js/gct.b71a9027509bc6bcfef9fc6a196424f5.js",
    "fullpage.js": "https://static.geetest.com/static/js/fullpage.9.2.0-guwyxh.js",
    "slide.js": "https://static.geetest.com/static/js/slide.7.9.3.js",
    "gt.js": "https://demos.geetest.com/libs/gt.js",
}

#下载js
def ensure_static(verbose=False):
    os.makedirs(BRIDGE_DIR, exist_ok=True)
    for name, url in STATIC_JS.items():
        p = os.path.join(BRIDGE_DIR, name)
        if os.path.exists(p) and os.path.getsize(p) > 1000:
            continue
        body = http_get(url)
        with open(p, "w", encoding="utf-8") as fh:
            fh.write(body)
        if verbose:
            log(f"下载 {name} ({len(body)} bytes)")

#在 Python 脚本里启动一个 Node.js 子进程，让 Python 直接调用本地的 Node.js 环境去跑 JS 代码
class Bridge:
    def __init__(self, on_log=None):
        self.p = subprocess.Popen(
            [NODE, os.path.join(BRIDGE_DIR, "bridge.js")],
            stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
            cwd=BRIDGE_DIR, text=True, encoding="utf-8", bufsize=1)
        self.on_log = on_log or (lambda m: None)
        self.handler_ok = threading.Event()
        self.ajax_bodies = []
        self.payloads = []
        self.images = []
        self.w_list = []
        self.cfg = {}
        self.canvas_gap = None
        self.validate = None
        self.last_eval = None
        self.stderr_tail = []
        threading.Thread(target=self._reader, daemon=True).start()
        threading.Thread(target=self._drain_stderr, daemon=True).start()

    def _drain_stderr(self):

        try:
            for line in self.p.stderr:
                self.stderr_tail.append(line.rstrip())
                if len(self.stderr_tail) > 200:
                    del self.stderr_tail[:100]
        except Exception:
            pass

    def _reader(self):
        for line in self.p.stdout:
            line = line.strip()
            if not line:
                continue
            try:
                self._on(json.loads(line))
            except Exception:
                pass

    def send(self, obj):
        try:
            self.p.stdin.write(json.dumps(obj, ensure_ascii=False) + "\n")
            self.p.stdin.flush()
        except Exception:
            pass

    def _on(self, m):
        op = m.get("op")
        if op == "log":
            self.on_log(m["msg"])
        elif op == "http":
            url = m["url"]
            try:
                body = http_get(url)
                status = 200
            except Exception as e:                       # noqa: BLE001
                status, body = 0, ""
                self.on_log(f"HTTP 失败 {url[:80]}: {e}")
            if "ajax.php" in url:
                self.ajax_bodies.append(body)
            if "get.php" in url and "is_next" in url:
                mm = re.search(r"\((\{.*\})\)\s*;?\s*$", body.strip(), re.S)
                if mm:
                    try:
                        self.cfg = json.loads(mm.group(1))
                    except Exception:
                        pass
            self.send({"op": "httpResult", "reqId": m["reqId"], "status": status, "body": body})
        elif op == "image":
            url = m["url"]
            self.images.append(url)
            try:
                http_download(url, os.path.join(BRIDGE_DIR, "img_" + os.path.basename(url.split("?")[0])))
            except Exception as e:                       # noqa: BLE001
                self.on_log(f"图片下载失败: {e}")
        elif op == "payload":
            self.payloads.append(m)
        elif op == "w":
            self.w_list.append(m)
        elif op == "result" and m.get("for") == "handler":
            self.handler_ok.set()
        elif op == "result" and m.get("for") == "canvasDiff":
            self.canvas_gap = m.get("value")
        elif op == "result" and m.get("for") == "validate":
            self.validate = (m.get("value") or {}).get("validate")
        elif op == "result" and m.get("for") == "eval":
            self.last_eval = (m.get("value") or {}).get("ret")
        elif op == "error":
            self.on_log("bridge error: " + str(m.get("msg"))[:200])

    def kill(self):
        try:
            self.send({"op": "exit"})
        except Exception:
            pass
        time.sleep(0.4)
        try:
            self.p.kill()
        except Exception:
            pass

#拼图缝隙定位函数，自动找到拼图缺口的位置，计算缺口和拼图块之间的距离

# 输入：3张图：空白背景图 bg、带拼图的场景图 fullbg、透明拼图素材 slice
# 输出：缺口位置、拼图左边界、两者像素距离
def locate_gap(cfg: dict, bridge_dir: str) -> dict:
    from PIL import Image
    bg_p = os.path.join(bridge_dir, "img_" + os.path.basename(cfg.get("bg", "")))
    fb_p = os.path.join(bridge_dir, "img_" + os.path.basename(cfg.get("fullbg", "")))
    sl_p = os.path.join(bridge_dir, "img_" + os.path.basename(cfg.get("slice", "")))

    im_bg = Image.open(bg_p).convert("RGB")
    im_fb = Image.open(fb_p).convert("RGB")
    if im_bg.size != im_fb.size:
        im_fb = im_fb.resize(im_bg.size)
    W, H = im_bg.size
    pb, pf = im_bg.load(), im_fb.load()

    prof = [0] * W
    for x in range(W):
        c = 0
        for y in range(H):
            br, bgc, bb = pb[x, y]
            fr, fg, fb2 = pf[x, y]
            lb = 0.299 * br + 0.587 * bgc + 0.114 * bb
            lf = 0.299 * fr + 0.587 * fg + 0.114 * fb2
            if lf - lb > 25:
                c += 1
        prof[x] = c
    peak = max(prof)
    peak_x = prof.index(peak)
    th = max(12, peak * 0.6)
    hole_a = peak_x
    while hole_a > 0 and prof[hole_a - 1] >= th:
        hole_a -= 1

    im_s = Image.open(sl_p).convert("RGBA")
    sp = im_s.load()
    SW, SH = im_s.size
    piece = next((x for x in range(SW) if any(sp[x, y][3] > 200 for y in range(SH))), 1)
    piece_mx = next((x for x in range(SW - 1, -1, -1) if any(sp[x, y][3] > 200 for y in range(SH))), piece)

    tpl = []
    ymax = min(SH, H)
    for y in range(0, ymax, 2):
        for x in range(piece, min(piece_mx + 1, SW)):
            if sp[x, y][3] > 200:
                tpl.append((x, y, sp[x, y][0], sp[x, y][1], sp[x, y][2]))
    hole_b = -1
    if len(tpl) > 80:
        span = piece_mx - piece
        best, best_x = None, -1
        for X in range(0, max(1, W - span)):
            s = 0
            for (x, y, r, g, bl) in tpl:
                tx = x - piece + X
                if tx = W or y >= H:
                    s = 1 = 0 and abs(hole_b - hole_a) = 0:
        hole, method = hole_b, f"取模板匹配(剖面={hole_a})"
    else:
        hole, method = hole_a, "仅剖面"

    return {"W": W, "H": H, "peak": peak, "threshold": round(th, 1),
            "hole_profile": hole_a, "hole_template": hole_b,
            "hole": hole, "piece": piece, "method": method,
            "distance": hole - piece}

def attempt_once(args):

    #下载js
    ensure_static(args.verbose)

    #获取gt / challenge
    log("① register-slide")
    reg = json.loads(http_get(f"{ORIGIN}/gt/register-slide?t={int(time.time() * 1000)}"))
    log(f"   gt={reg['gt']}  challenge={reg['challenge']}")

    #启动 Node 桥接进程
    log("启动 Node 桥接（jsdom 里跑极验自己的 JS）…")
    b = Bridge(on_log=lambda m: log("   [node] " + m) if args.verbose else None)
    time.sleep(2.0)

    #initGeetest 初始化验证码对象，相当于网页执行 initGeetest(...)，创建 captchaObj 验证码实例
    log("② initGeetest —— 复刻 demo 页面初始化路径")
    b.send({"op": "initGeetest", "config": {
        "gt": reg["gt"], "challenge": reg["challenge"], "offline": False,
        "new_captcha": reg.get("new_captcha", True), "product": "float",
        "width": "300px", "https": True, "api_server": "apiv6.geetest.com"}})
    if not b.handler_ok.wait(10):
        bad("captchaObj 回调未触发")
        b.kill()
        return 1
    time.sleep(0.8)

    #appendTo，把验证码渲染到 DOM
    log("③ appendTo('#captcha') —— 在 jsdom 中渲染组件")
    b.send({"op": "call", "on": "instance", "name": "appendTo", "args": ["#captcha"]})
    time.sleep(2.5)

    #模拟鼠标点击雷达按钮，弹出滑块图片
    log("④ 点击雷达按钮，展开滑块（此步会带出 is_next 题面与图片）")
    for sel in [".geetest_radar_tip", ".geetest_radar_btn"]:
        for ty in ["mousedown", "mouseup", "click"]:
            b.send({"op": "fire", "selector": sel, "type": ty, "ev": {
                "clientX": 616.9, "clientY": 379.0, "button": 0,
                "buttons": 1 if ty != "mouseup" else 0, "detail": 1}})
        time.sleep(0.3)

    #等待图片加载 + Node 端像素算法识别缺口
    log("⑤ 缺口定位")
    b.canvas_gap = None
    for _ in range(40):
        b.send({"op": "canvasDiff"})
        time.sleep(0.35)
        if b.canvas_gap and b.canvas_gap.get("ok") and b.canvas_gap.get("ready"):
            break

    if not b.cfg.get("bg"):
        bad("未取到 slide3 题面")
        b.kill()
        return 1

    if b.canvas_gap and b.canvas_gap.get("ok"):
        g = b.canvas_gap
        dist = g["distance"] + args.dist_offset
        log(f"   [Node canvas] {g['W']}x{g['H']} 峰值 {g['peak']}@{g['peakX']} 阈值 {g['threshold']}")
        log(f"   缺口左边缘 {g['hole']}  拼图块左边缘 {g['pieceLeft']}  →  拖动距离 = {dist} (偏移 {args.dist_offset:+d})")
        log(f"   像素抽样(bg) {g.get('sample')}")
    else:
        why = (b.canvas_gap or {}).get("error", "无响应")
        log(f"   Node canvas 不可用（{why}），退回 Python/Pillow 方案")
        gap = locate_gap(b.cfg, BRIDGE_DIR)
        dist = gap["distance"] + args.dist_offset
        log(f"   图 {gap['W']}x{gap['H']}  剖面峰值 {gap['peak']} @阈值 {gap['threshold']}")
        log(f"   缺口剖面={gap['hole_profile']} 模板={gap['hole_template']} → 采用 {gap['hole']} ({gap['method']})")
        log(f"   拼图块左边缘 {gap['piece']}   →  拖动距离 = {dist} (偏移 {args.dist_offset:+d})")

    #模拟鼠标拖拽动作
    log("⑥ 模拟拖动（pointer + mouse 双通道）")
    n_before = len(b.ajax_bodies)
    b.send({"op": "drag", "distance": dist, "x0": 616.9, "y0": 379.0, "duration": 2000})
    for _ in range(50):
        time.sleep(0.2)
        if len(b.ajax_bodies) > n_before:
            break
    time.sleep(0.4)

    #读取极验返回结果，判断滑块是否验证通过
    log("⑦ 服务端裁决")
    if args.verbose:
        for p in b.payloads:
            log(f"   载荷({p['len']}): {p['head'][:700]}")
    resp = b.ajax_bodies[-1] if b.ajax_bodies else ""
    log(f"   {resp[:200]}")

    validate = None
    b.send({"op": "validate"})
    time.sleep(0.8)

    if args.keep_w:
        for w in b.w_list:
            log(f"   w({len(w['w'])}) challenge={w.get('challenge')}")

    ok = '"success": 1' in resp or '"success":1' in resp

    if not ok:
        b.kill()
        bad("验证未通过（见上面的服务端应答）")
        return 1

    good("滑块验证通过")

    #取出 geetest 三个凭证，提交登录接口
    log("⑧ 取回 validate 并提交登录")
    b.send({"op": "validate"})
    time.sleep(1.5)
    val = b.validate
    b.kill()
    if not val or not val.get("geetest_validate"):
        bad(f"未能取回 validate: {val}")
        return 1
    log(f"   challenge={val['geetest_challenge']}")
    log(f"   validate ={val['geetest_validate']}")
    log(f"   seccode  ={val['geetest_seccode']}")

    body = http_post(f"{ORIGIN}/gt/validate-slide", {
        "username": "tester", "password": "123456",
        "geetest_challenge": val["geetest_challenge"],
        "geetest_validate": val["geetest_validate"],
        "geetest_seccode": val["geetest_seccode"],
    })
    log(f"   服务端: {body[:200]}")
    if '"status":"success"' in body or '"status": "success"' in body:
        good("登录成功 &#127881;")
        return 0
    bad("登录失败")
    return 1

#重试机制
def run(args):
    if not materialize_bridge(args.verbose):
        return 2

    for i in range(1, args.attempts + 1):
        if args.attempts > 1:
            log(f"===== 第 {i}/{args.attempts} 次尝试 =====")

        try:
            _CJ.clear()
        except Exception:
            pass
        rc = attempt_once(args)
        if rc == 0:
            return 0
        if i

纯js浏览器模拟器

Node.js 编写的极验滑块验证码无头模拟器，基于 jsdom/sdenv 伪造浏览器环境，

劫持 Canvas、伪造浏览器指纹，和上层程序通过标准输入输出通信

可以自动识别验证码画布缺口，模拟带随机抖动的鼠标拖拽事件，执行极验 JS 并输出验证码验证结果

[Asm] *纯文本查看* *复制代码*
/**

Node.js 编写的极验滑块验证码无头模拟器，
基于 jsdom/sdenv 伪造浏览器环境，
劫持 Canvas、伪造浏览器指纹，
和上层程序通过标准输入输出通信；
可以自动识别验证码画布缺口，
模拟带随机抖动的鼠标拖拽事件，
执行极验 JS 并输出验证码验证结果

 * 通信协议
 *   Python → Node : {"op":"initGeetest","config":{...}}
 *                   {"op":"httpResult","reqId":N,"status":200,"body":"..."}
 *                   {"op":"call","on":"instance","name":"appendTo","args":["#captcha"]}
 *                   {"op":"fire","selector":".geetest_slider_button","type":"pointerdown","ev":{...}}
 *                   {"op":"query"|"html"|"listeners"|"capturedW"|"canvasDiff"|"validate"}
 *                   {"op":"drag","distance":N,"x0":..,"y0":..,"duration":..}
 *                   {"op":"eval","code":"..."}  {"op":"exit"}
 *   Node → Python : {"op":"ready"} {"op":"log","msg":...}
 *                   {"op":"http","reqId":N,"url":...}
 *                   {"op":"image","url":...}
 *                   {"op":"payload","len":N,"head":"..."}
 *                   {"op":"w","url":...,"w":...,"challenge":...}
 *                   {"op":"result","for":,"value":{...}}
 *                   {"op":"error","msg":...}
 */

'use strict';

const fs = require('fs');
const path = require('path');

/* sdenv 优先（环境更逼真）；找不到退回原生 jsdom */
let sdenv = null;
for (const p of [process.env.SDENV_PATH, 'sdenv', 'D:/sdenv/node_modules/sdenv']) {
  if (!p) continue;
  try { sdenv = require(p); break; } catch (e) { /* 试下一个 */ }
}
let JSDOM = null;
if (!sdenv) {
  try { ({ JSDOM } = require('jsdom')); } catch (e) { /* ignore */ }
}
let napi = null;
try { napi = require('@napi-rs/canvas'); } catch (e) { /* 兜底不可用 */ }

const DIR = __dirname;
const send = (o) => process.stdout.write(JSON.stringify(o) + '\n');
const log = (m) => send({ op: 'log', msg: String(m) });

/* ============================ 状态 ============================ */
let win = null;
let domRef = null;
let instance = null;
let nativeCanvas = false;
const realCanvas = new WeakMap();
const capturedW = [];
const pending = new Map();
let httpSeq = 1;
const seenImg = new Set();

/* ============================ 画布兜底 ============================ */
function makeCtx(kind) {
  const grad = { addColorStop() {} };
  const stub = { canvas: null };
  ['fillRect', 'clearRect', 'putImageData', 'fillText', 'strokeText', 'beginPath', 'closePath',
   'moveTo', 'lineTo', 'arc', 'fill', 'stroke', 'save', 'restore', 'translate', 'scale', 'rotate',
   'setTransform', 'transform', 'clip', 'rect', 'bezierCurveTo', 'quadraticCurveTo', 'arcTo',
   'ellipse', 'setLineDash', 'strokeRect', 'resetTransform', 'drawFocusIfNeeded',
   'createPattern'].forEach((n) => { stub[n] = () => (n.startsWith('create') ? grad : undefined); });
  stub.drawImage = function () {};
  stub.createLinearGradient = () => grad;
  stub.createRadialGradient = () => grad;
  stub.measureText = () => ({ width: 10, actualBoundingBoxAscent: 8, actualBoundingBoxDescent: 2 });
  stub.getImageData = (x, y, w, h) => ({
    width: Math.max(1, w | 0), height: Math.max(1, h | 0),
    data: new Uint8ClampedArray(Math.max(4, (w | 0) * (h | 0) * 4)),
  });
  stub.createImageData = (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(Math.max(4, w * h * 4)) });
  stub.getLineDash = () => [];
  stub.isPointInPath = () => false;
  if (kind === 'webgl' || kind === 'experimental-webgl' || kind === 'webgl2') {
    return new Proxy({}, {
      get(t, k) {
        if (k === 'getExtension') return () => ({ UNMASKED_VENDOR_WEBGL: 1, UNMASKED_RENDERER_WEBGL: 2 });
        if (k === 'getParameter') {
          return (p) => (p === 1 ? 'Google Inc. (NVIDIA)'
            : p === 2 ? 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4060 Laptop GPU (0x000028A0) Direct3D11 vs_5_0 ps_5_0, D3D11)'
              : 'WebKit');
        }
        if (k === 'getSupportedExtensions') return () => ['WEBGL_debug_renderer_info', 'ANGLE_instanced_arrays'];
        if (k === 'getShaderPrecisionFormat') return () => ({ precision: 23, rangeMin: 127, rangeMax: 127 });
        if (k === 'canvas') return null;
        return () => 0;
      },
    });
  }
  return stub;
}

function realOf(el) {
  let c = realCanvas.get(el);
  if (!c) {
    c = napi.createCanvas(Math.max(1, el.width || 300), Math.max(1, el.height || 150));
    realCanvas.set(el, c);
  }
  return c;
}

function ctxOf(el) {
  const rc = realOf(el);
  const ctx = rc.getContext('2d');
  if (!ctx.__patched) {
    const od = ctx.drawImage.bind(ctx);
    ctx.drawImage = function (img, ...rest) {
      let real = img;
      if (img && img.__napiImage) real = img.__napiImage;
      else if (img && img.tagName === 'CANVAS') real = realOf(img);
      try { return od(real, ...rest); } catch (e) { return undefined; }
    };
    ctx.__patched = true;
  }
  return ctx;
}

/** 取元素背后的真 2D 上下文（原生优先，其次 @napi-rs 兜底） */
function getRealCtx(el) {
  if (nativeCanvas) { try { return el.getContext('2d'); } catch (e) { return null; } }
  return ctxOf(el);
}

/** 在 window 上下文里执行代码 */
function evalInWin(code) {
  if (win && typeof win.eval === 'function') return win.eval(code);
  const vm = require('vm');
  if (domRef && typeof domRef.getInternalVMContext === 'function') {
    return vm.runInContext(code, domRef.getInternalVMContext());
  }
  throw new Error('无法在当前 window 执行代码');
}

function describe(el) {
  if (!el) return 'null';
  if (el === win) return 'window';
  if (el === win.document) return 'document';
  const cls = typeof el.className === 'string' && el.className
    ? '.' + el.className.trim().split(/\s+/).join('.') : '';
  return (el.tagName || 'OBJ') + cls;
}

/* ============================ JSONP ============================ */
function deliver(url, body) {
  const m = /[?&]callback=([^&]+)/.exec(url);
  const mm = /^\s*[^(]*\(([\s\S]*)\)\s*;?\s*$/.exec(body);
  let data = null;
  try { data = JSON.parse(mm ? mm[1] : body); } catch (e) { log('JSONP 解析失败: ' + e.message); }
  if (m) {
    const cb = decodeURIComponent(m[1]);
    const fn = win[cb];
    if (typeof fn === 'function') {
      try { fn.call(win, data); } catch (e) { log('回调抛错: ' + e.message); }
    } else {
      log('回调未定义: ' + cb);
    }
    try { delete win[cb]; } catch (e) { /* ignore */ }
  }
  return data;
}

/* ============================ 请求拦截 ============================ */
function onScriptUrl(url) {
  const mw = /[?&]w=([^&]*)/.exec(url);
  if (mw && /ajax\.php/.test(url)) {
    let w = mw[1];
    try { w = decodeURIComponent(w); } catch (e) { /* ignore */ }
    const mc = /[?&]challenge=([^&]*)/.exec(url);
    const rec = { url, w, challenge: mc ? mc[1] : null, at: Date.now() };
    capturedW.push(rec);
    send({ op: 'w', url, w, challenge: rec.challenge });
  }
  const reqId = httpSeq++;
  pending.set(reqId, { url });
  send({ op: 'http', reqId, url });
}

/* ============================ 初始化 ============================ */
function bootstrap() {
  const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
    + '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  const html = ''
    + '
';
  const cfg = {
    url: 'https://demos.geetest.com/slide-float.html',
    referrer: 'https://demos.geetest.com/',
    contentType: 'text/html',
    pretendToBeVisual: true,
    runScripts: 'outside-only',
    userAgent: UA,
    resources: 'usable',
    // ★ 必须静音：jsdom/sdenv 的 console 与资源加载错误默认写 stderr，
    //   而 stderr 管道若没人读会被写满，Node 直接阻塞 —— 表现为整个流程卡死。
    consoleConfig: { log() {}, error() {}, warn() {}, info() {}, debug() {}, dir() {} },
  };
  try {
    const jsdomMod = (sdenv && sdenv.jsdom) || (JSDOM ? require('jsdom') : null);
    if (jsdomMod && typeof jsdomMod.VirtualConsole === 'function') {
      const vc = new jsdomMod.VirtualConsole();
      ['error', 'warn', 'info', 'dir', 'log', 'jsdomError'].forEach((ev) => vc.on(ev, () => {}));
      cfg.virtualConsole = vc;
    }
  } catch (e) { /* 静音失败不致命 */ }

  if (sdenv && typeof sdenv.jsdomFromText === 'function') {
    domRef = sdenv.jsdomFromText(html, cfg);
    log('环境: sdenv ' + sdenv.version + ' (jsdom fork, 带反检测补丁)');
  } else if (JSDOM) {
    domRef = new JSDOM(html, cfg);
    log('环境: 原生 jsdom (未找到 sdenv)');
  } else {
    log('环境: 既没有 sdenv 也没有 jsdom，无法继续');
    process.exit(1);
  }
  win = domRef.window;

  if (sdenv && typeof sdenv.browser === 'function') {
    try { sdenv.browser(win, 'chrome'); log('已注入 sdenv browser(chrome)'); }
    catch (e) { log('sdenv.browser 注入失败: ' + e.message); }
  }

  /* ---- 探测是否自带真 canvas ---- */
  try {
    const tc = win.document.createElement('canvas');
    tc.width = 4; tc.height = 4;
    const tg = tc.getContext('2d');
    if (tg && typeof tg.getImageData === 'function') {
      tg.fillStyle = '#ff0000';
      tg.fillRect(0, 0, 2, 2);
      const d = tg.getImageData(0, 0, 4, 4).data;
      nativeCanvas = d[0] > 200 && d[1]  {
      const d = Object.getOwnPropertyDescriptor(win.HTMLCanvasElement.prototype, k);
      if (!d) return;
      Object.defineProperty(win.HTMLCanvasElement.prototype, k, {
        configurable: true,
        get() { return d.get.call(this); },
        set(v) {
          d.set.call(this, v);
          const c = realCanvas.get(this);
          if (c) {
            const nv = Math.max(1, Number(v) || 1);
            if ((k === 'width' && c.width !== nv) || (k === 'height' && c.height !== nv)) c[k] = nv;
          }
        },
      });
    });
  }

  /* ---- 环境指纹补丁 ---- */
  try {
    Object.defineProperty(win.navigator, 'webdriver', { get: () => false, configurable: true });
    Object.defineProperty(win.navigator, 'hardwareConcurrency', { get: () => 16, configurable: true });
    Object.defineProperty(win.navigator, 'deviceMemory', { get: () => 32, configurable: true });
    Object.defineProperty(win.navigator, 'languages', { get: () => ['zh-CN', 'zh'], configurable: true });
    Object.defineProperty(win.navigator, 'language', { get: () => 'zh-CN', configurable: true });
    Object.defineProperty(win.navigator, 'platform', { get: () => 'Win32', configurable: true });
    Object.defineProperty(win.navigator, 'vendor', { get: () => 'Google Inc.', configurable: true });
    Object.defineProperty(win.navigator, 'maxTouchPoints', { get: () => 0, configurable: true });
  } catch (e) { log('navigator 补丁部分失败: ' + e.message); }
  try {
    const mkPlugin = (name) => ({ name, filename: name, description: name, length: 1 });
    const names = ['PDF Viewer', 'Chrome PDF Viewer', 'Chromium PDF Viewer',
      'Microsoft Edge PDF Viewer', 'WebKit built-in PDF'];
    const arr = names.map(mkPlugin);
    arr.item = (i) => arr[i] || null;
    arr.namedItem = (n) => arr.find((p) => p.name === n) || null;
    arr.refresh = () => {};
    Object.defineProperty(win.navigator, 'plugins', { get: () => arr, configurable: true });
    const mt = names.map((n) => ({ type: 'application/pdf', suffixes: 'pdf', description: n, enabledPlugin: mkPlugin(n) }));
    mt.item = (i) => mt[i] || null;
    mt.namedItem = (n) => mt.find((m) => m.type === n) || null;
    Object.defineProperty(win.navigator, 'mimeTypes', { get: () => mt, configurable: true });
  } catch (e) { log('plugins 补丁失败: ' + e.message); }
  try {
    Object.defineProperty(win.document, 'hidden', { get: () => false, configurable: true });
    Object.defineProperty(win.document, 'visibilityState', { get: () => 'visible', configurable: true });
    win.document.hasFocus = () => true;
  } catch (e) { /* ignore */ }
  try {
    Object.defineProperty(win.screen, 'width', { get: () => 1920, configurable: true });
    Object.defineProperty(win.screen, 'height', { get: () => 1080, configurable: true });
    Object.defineProperty(win.screen, 'availWidth', { get: () => 1920, configurable: true });
    Object.defineProperty(win.screen, 'availHeight', { get: () => 1040, configurable: true });
    Object.defineProperty(win.screen, 'colorDepth', { get: () => 24, configurable: true });
    Object.defineProperty(win, 'devicePixelRatio', { get: () => 1, configurable: true });
    Object.defineProperty(win, 'outerWidth', { get: () => 1920, configurable: true });
    Object.defineProperty(win, 'outerHeight', { get: () => 1080, configurable: true });
    Object.defineProperty(win, 'innerWidth', { get: () => 1280, configurable: true });
    Object.defineProperty(win, 'innerHeight', { get: () => 720, configurable: true });
  } catch (e) { log('screen 补丁失败: ' + e.message); }
  if (typeof win.requestAnimationFrame !== 'function') {
    win.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16);
    win.cancelAnimationFrame = (id) => clearTimeout(id);
  }

  /* ---- performance.timing：极验把它的 21 个字段编码进 ep.tm ---- */
  try {
    const t0 = Date.now() - 3200;
    const timing = {
      navigationStart: t0,
      unloadEventStart: 0, unloadEventEnd: 0,
      redirectStart: 0, redirectEnd: 0,
      fetchStart: t0 + 4,
      domainLookupStart: t0 + 6, domainLookupEnd: t0 + 18,
      connectStart: t0 + 18, connectEnd: t0 + 44,
      secureConnectionStart: t0 + 30,
      requestStart: t0 + 46, responseStart: t0 + 130, responseEnd: t0 + 190,
      domLoading: t0 + 210,
      domInteractive: t0 + 880,
      domContentLoadedEventStart: t0 + 880,
      domContentLoadedEventEnd: t0 + 940,
      domComplete: t0 + 1100,
      loadEventStart: t0 + 1100,
      loadEventEnd: t0 + 1150,
    };
    Object.defineProperty(win.performance, 'timing', { get: () => timing, configurable: true });
    Object.defineProperty(win.performance, 'navigation', {
      get: () => ({ type: 0, redirectCount: 0 }), configurable: true,
    });
    if (typeof win.performance.getEntriesByType !== 'function') {
      Object.defineProperty(win.performance, 'getEntriesByType', { value: () => [], configurable: true });
    }
    if (typeof win.performance.getEntries !== 'function') {
      Object.defineProperty(win.performance, 'getEntries', { value: () => [], configurable: true });
    }
    log('已补 performance.timing (' + Object.keys(timing).length + ' 字段)');
  } catch (e) { log('performance.timing 补丁失败: ' + e.message); }

  /* ----  ---- */
  function fireLoad(el) {
    try { if (typeof el.onload === 'function') el.onload(); } catch (e) { /* ignore */ }
    try { el.dispatchEvent(new win.Event('load')); } catch (e) { /* ignore */ }
  }
  function notifyImage(el) {
    const url = el.getAttribute('src') || el.src || '';
    if (!url) return;
    send({ op: 'image', url });
    // 原生真 canvas + resources:'usable' 时 jsdom 会自己加载解码，绝不能伪造 load
    if (nativeCanvas) return;
    if (seenImg.has(url)) { setTimeout(() => fireLoad(el), 0); return; }
    seenImg.add(url);
    if (napi) {
      napi.loadImage(url).then((im) => {
        el.__napiImage = im;
        el.__natW = im.width;
        el.__natH = im.height;
        setTimeout(() => fireLoad(el), 0);
      }).catch((e) => {
        log('图片解码失败 ' + String(url).slice(-46) + ': ' + e.message);
        setTimeout(() => fireLoad(el), 0);
      });
    } else {
      setTimeout(() => fireLoad(el), 0);
    }
  }
  const imgProto = win.HTMLImageElement.prototype;
  const origSetAttr = win.Element.prototype.setAttribute;
  win.Element.prototype.setAttribute = function (k, v) {
    const r = origSetAttr.call(this, k, v);
    if (String(k).toLowerCase() === 'src' && this.tagName === 'IMG') notifyImage(this);
    return r;
  };
  const srcDesc = Object.getOwnPropertyDescriptor(imgProto, 'src');
  try {
    Object.defineProperty(imgProto, 'src', {
      configurable: true,
      get() { return srcDesc && srcDesc.get ? srcDesc.get.call(this) : this.getAttribute('src'); },
      set(v) {
        if (srcDesc && srcDesc.set) srcDesc.set.call(this, v); else origSetAttr.call(this, 'src', v);
        notifyImage(this);
      },
    });
    ['naturalWidth', 'naturalHeight'].forEach((k) => {
      try {
        Object.defineProperty(imgProto, k, {
          configurable: true,
          get() { return k === 'naturalWidth' ? (this.__natW || 312) : (this.__natH || 160); },
        });
      } catch (e) { /* ignore */ }
    });
  } catch (e) { log('img 补丁失败: ' + e.message); }

  /* ---- 伪布局：jsdom 没有排版 ---- */
  const GEO = {
    geetest_window: [589.9, 183.0, 260, 160],
    geetest_absolute: [589.9, 183.0, 260, 160],
    geetest_slider_button: [583.9, 346.0, 66, 66],
    geetest_slider_track: [589.9, 358.0, 177, 38],
    geetest_slider: [580.9, 174.0, 278, 222],
    geetest_holder: [580.9, 174.0, 300, 222],
    geetest_canvas_bg: [589.9, 183.0, 260, 160],
    geetest_canvas_slice: [589.9, 183.0, 260, 160],
    geetest_canvas_fullbg: [589.9, 183.0, 260, 160],
  };
  win.Element.prototype.getBoundingClientRect = function () {
    const cls = typeof this.className === 'string' ? this.className : '';
    for (const key of Object.keys(GEO)) {
      if (cls.split(/\s+/).includes(key)) {
        const [l, t, w, h] = GEO[key];
        return { x: l, y: t, left: l, top: t, right: l + w, bottom: t + h,
                 width: w, height: h, toJSON() { return this; } };
      }
    }
    const [l, t, w, h] = GEO.geetest_holder;
    return { x: l, y: t, left: l, top: t, right: l + w, bottom: t + h,
             width: w, height: h, toJSON() { return this; } };
  };

  /* ---- 记录监听器 & 载荷明文 ---- */
  win.__listeners = [];
  const origAdd = win.EventTarget.prototype.addEventListener;
  win.EventTarget.prototype.addEventListener = function (type, fn, opts) {
    try { win.__listeners.push({ el: this, type, seq: win.__listeners.length }); } catch (e) { /* ignore */ }
    return origAdd.call(this, type, fn, opts);
  };

  win.__payloads = [];
  const origEnc = win.encodeURIComponent;
  win.encodeURIComponent = function (s) {
    try {
      if (typeof s === 'string' && s.length > 200) {
        if (win.__payloads.length ：交给 Python ---- */
  const origAppend = win.Node.prototype.appendChild;
  win.Node.prototype.appendChild = function (node) {
    if (node && node.tagName === 'SCRIPT' && node.src) {
      onScriptUrl(String(node.src));
      const it = pending.get(httpSeq - 1);
      if (it) it.el = node;
      return node;
    }
    return origAppend.call(this, node);
  };

  /* ---- 注入极验 bundle ---- */
  for (const f of ['gct.js', 'gt.js', 'fullpage.js', 'slide.js']) {
    const p = path.join(DIR, f);
    if (!fs.existsSync(p)) { log('缺少 ' + f); continue; }
    try {
      evalInWin(fs.readFileSync(p, 'utf8'));
      log('已注入 ' + f);
    } catch (e) {
      log('注入 ' + f + ' 失败: ' + e.message);
    }
  }
  send({ op: 'ready', hasGeetest: typeof win.Geetest, hasInitGeetest: typeof win.initGeetest,
         hasSlide3: !!(win.Geetest && win.Geetest.slide3), sdenv: !!sdenv, nativeCanvas });
}

/* ============================ 指令 ============================ */
function handle(cmd) {
  switch (cmd.op) {
    case 'initGeetest': {
      if (typeof win.initGeetest !== 'function') {
        return send({ op: 'result', for: 'initGeetest', value: { ok: false, error: 'initGeetest 未定义' } });
      }
      try {
        win.initGeetest(cmd.config || {}, (captchaObj) => {
          instance = captchaObj;
          win.__captcha = captchaObj;
          send({ op: 'result', for: 'handler', value: { ok: true } });
        });
        return send({ op: 'result', for: 'initGeetest', value: { ok: true } });
      } catch (e) {
        return send({ op: 'result', for: 'initGeetest', value: { ok: false, error: e.message } });
      }
    }

    case 'init': {
      const Ctor = cmd.ctor === 'Geetest' ? win.Geetest : (win.Geetest && win.Geetest.slide3);
      if (!Ctor) return send({ op: 'result', for: 'init', value: { ok: false, error: 'Geetest.slide3 未加载' } });
      try {
        instance = new Ctor(cmd.config || {});
        win.__inst = instance;
        return send({ op: 'result', for: 'init', value: { ok: true } });
      } catch (e) {
        return send({ op: 'result', for: 'init', value: { ok: false, error: e.message } });
      }
    }

    case 'httpResult': {
      const item = pending.get(cmd.reqId);
      pending.delete(cmd.reqId);
      if (!item) return;
      if (cmd.status !== 200) { log('HTTP ' + cmd.status + ' ' + String(item.url).slice(0, 90)); return; }
      const isJs = /\.js(\?|$)/.test(item.url) && /static\.(geetest|geevisit)\.com/.test(item.url);
      if (isJs) {
        try { evalInWin(cmd.body); log('已注入远程 JS ' + item.url.split('/').pop().slice(0, 30)); }
        catch (e) { log('注入远程 JS 失败: ' + e.message); }
      } else {
        deliver(item.url, cmd.body);
      }
      if (item.el) { try { if (typeof item.el.onload === 'function') item.el.onload(); } catch (e) { /* ignore */ } }
      return;
    }

    case 'listeners': {
      send({ op: 'result', for: 'listeners',
             value: win.__listeners.map((l, i) => ({ i, type: l.type, el: describe(l.el) })) });
      return;
    }

    case 'fire': {
      const el = win.document.querySelector(cmd.selector);
      if (!el) return send({ op: 'result', for: 'fire', value: { ok: false, error: '未找到 ' + cmd.selector } });
      const o = Object.assign({ bubbles: true, cancelable: true, view: win, composed: true }, cmd.ev || {});
      let ev;
      if (cmd.type.startsWith('pointer')) ev = new win.PointerEvent(cmd.type, o);
      else if (cmd.type.startsWith('touch')) ev = new win.Event(cmd.type, o);
      else ev = new win.MouseEvent(cmd.type, o);
      try {
        el.dispatchEvent(ev);
        return send({ op: 'result', for: 'fire', value: { ok: true, on: describe(el) } });
      } catch (e) {
        return send({ op: 'result', for: 'fire', value: { ok: false, error: e.message } });
      }
    }

    case 'query': {
      const els = [...win.document.querySelectorAll(cmd.selector)];
      send({ op: 'result', for: 'query', value: {
        count: els.length,
        items: els.slice(0, 12).map((e) => ({ tag: e.tagName, cls: e.className, txt: (e.textContent || '').slice(0, 40) })),
      } });
      return;
    }

    case 'html': {
      const el = cmd.selector ? win.document.querySelector(cmd.selector) : win.document.body;
      send({ op: 'result', for: 'html', value: { html: el ? el.outerHTML.slice(0, cmd.limit || 2000) : null } });
      return;
    }

    case 'call': {
      const target = cmd.on === 'instance' ? instance : win;
      const fn = target && target[cmd.name];
      if (typeof fn !== 'function') {
        return send({ op: 'result', for: 'call', value: { ok: false, error: cmd.name + ' 不是函数' } });
      }
      try {
        const r = fn.apply(target, cmd.args || []);
        send({ op: 'result', for: 'call', value: { ok: true,
          ret: r === undefined ? null : String(typeof r === 'object' ? JSON.stringify(r) : r).slice(0, 400) } });
      } catch (e) {
        send({ op: 'result', for: 'call', value: { ok: false, error: e.message } });
      }
      return;
    }

    case 'canvasDiff': {
      const bg = win.document.querySelector('.geetest_canvas_bg');
      const fb = win.document.querySelector('.geetest_canvas_fullbg');
      const sl = win.document.querySelector('.geetest_canvas_slice');
      if (!bg || !fb || !sl) {
        return send({ op: 'result', for: 'canvasDiff', value: { ok: false, error: '画布元素缺失' } });
      }
      const W = bg.width, H = bg.height;
      const gb = getRealCtx(bg), gf = getRealCtx(fb), gs = getRealCtx(sl);
      if (!gb || !gf || !gs) {
        return send({ op: 'result', for: 'canvasDiff', value: { ok: false, error: '拿不到 2D 上下文' } });
      }
      const B = gb.getImageData(0, 0, W, H).data;
      const F = gf.getImageData(0, 0, W, H).data;
      const S = gs.getImageData(0, 0, W, H).data;
      const prof = new Array(W).fill(0);
      for (let x = 0; x  25) c++;
        }
        prof[x] = c;
      }
      const peak = Math.max.apply(null, prof);
      const peakX = prof.indexOf(peak);
      const th = Math.max(12, peak * 0.6);
      let hole = peakX;
      while (hole > 0 && prof[hole - 1] >= th) hole--;
      let pmn = 1e9, pmx = -1;
      for (let y = 0; y  200) { if (x  pmx) pmx = x; }
        }
      }
      const sample = [[10, 80], [130, 80], [250, 80]].map(([x, y]) => {
        const i = (y * W + x) * 4;
        return [B[i], B[i + 1], B[i + 2]];
      });
      const sl2 = win.document.querySelector('.geetest_slider');
      const sliderClass = sl2 ? sl2.className : '';
      send({ op: 'result', for: 'canvasDiff', value: {
        ok: true, W, H, peak, peakX, threshold: +th.toFixed(1),
        hole, pieceLeft: pmn, pieceRight: pmx, distance: hole - pmn, sample,
        sliderClass, ready: /geetest_ready/.test(sliderClass),
      } });
      return;
    }

    case 'drag': {
      const D = cmd.distance;
      const dur = cmd.duration || 2000;
      const N = cmd.steps || Math.round(dur / 10);
      const x0 = cmd.x0 === undefined ? 616.9 : cmd.x0;
      const y0 = cmd.y0 === undefined ? 379.0 : cmd.y0;
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

      const btnEl = win.document.querySelector(cmd.selector || '.geetest_slider_button');
      const holderEl = win.document.querySelector(cmd.moveSelector || '.geetest_holder');
      const targetsFor = (types) => {
        const set = [];
        win.__listeners.filter((l) => types.includes(l.type)).forEach((l) => {
          if (l.el && !set.includes(l.el)) set.push(l.el);
        });
        return set;
      };
      const downTargets = [...new Set([...(btnEl ? [btnEl] : []), ...targetsFor(['pointerdown', 'mousedown'])])];
      const moveTargets = [...new Set([...(holderEl ? [holderEl] : []), ...targetsFor(['pointermove', 'mousemove'])])];
      const upTargets = [...new Set([...(holderEl ? [holderEl] : []), ...targetsFor(['pointerup', 'mouseup'])])];

      const mkM = (t, x, y, down) => new win.MouseEvent(t, {
        bubbles: true, cancelable: true, view: win, clientX: x, clientY: y,
        screenX: x + 10, screenY: y + 140, button: 0, buttons: down ? 1 : 0, detail: 1, which: down ? 1 : 0 });
      const mkP = (t, x, y, down) => new win.PointerEvent(t, {
        bubbles: true, cancelable: true, view: win, clientX: x, clientY: y,
        screenX: x + 10, screenY: y + 140, button: 0, buttons: down ? 1 : 0,
        pointerId: 1, pointerType: 'mouse', isPrimary: true, width: 1, height: 1, pressure: down ? 0.5 : 0 });
      const blast = (els, t, x, y, down) => {
        els.forEach((el) => {
          try { el.dispatchEvent(t.startsWith('pointer') ? mkP(t, x, y, down) : mkM(t, x, y, down)); }
          catch (e) { /* ignore */ }
        });
      };

      const speed = [];
      let nz = 0;
      for (let i = 0; i  a + b, 0);
      const xs = [];
      let acc = 0;
      for (let i = 0; i  {
        const t0 = Date.now();
        let sleepMs = 0;
        let dispatchMs = 0;
        blast(moveTargets, 'mousemove', x0, y0, false);
        await sleep(200); sleepMs += 200;
        blast(downTargets, 'mousedown', x0, y0, true);
        blast(downTargets, 'pointerdown', x0, y0, true);
        await sleep(150); sleepMs += 150;
        let yy = 0;
        for (let i = 0; i  0 && i  0 && i % 50 === 0) {
            send({ op: 'log', msg: `drag 进度 ${i}/${xs.length}  wall=${Date.now() - t0}ms` });
          }
        }
        const XF = x0 + xs[xs.length - 1], YF = y0 + yy;
        blast(upTargets, 'pointerup', XF, YF, false);
        blast(upTargets, 'mouseup', XF, YF, false);
        send({ op: 'result', for: 'drag', value: {
          ok: true, events: xs.length, x0, distance: D,
          wallMs: Date.now() - t0, sleepMs: Math.round(sleepMs), dispatchMs,
          overheadMs: Math.round(Date.now() - t0 - sleepMs - dispatchMs),
        } });
      })();
      return;
    }

    case 'validate': {
      let v = null;
      try { v = instance && instance.getValidate(); } catch (e) { /* ignore */ }
      send({ op: 'result', for: 'validate', value: { ok: !!v, validate: v } });
      return;
    }

    case 'capturedW':
      send({ op: 'result', for: 'capturedW', value: capturedW });
      return;

    case 'eval': {
      try {
        send({ op: 'result', for: 'eval', value: { ok: true, ret: String(evalInWin(cmd.code)).slice(0, 1500) } });
      } catch (e) {
        send({ op: 'result', for: 'eval', value: { ok: false, error: e.message } });
      }
      return;
    }

    case 'exit':
      process.exit(0);
    default:
      send({ op: 'error', msg: 'unknown op ' + cmd.op });
  }
}

/* ============================ stdio ============================ */
process.on('uncaughtException', (e) => log('uncaughtException: ' + e.message));
process.on('unhandledRejection', (e) => log('unhandledRejection: ' + (e && e.message ? e.message : String(e))));

let buf = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (c) => {
  buf += c;
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i).trim();
    buf = buf.slice(i + 1);
    if (!line) continue;
    let cmd;
    try { cmd = JSON.parse(line); } catch (e) { continue; }
    try { handle(cmd); } catch (e) { send({ op: 'error', msg: e.message }); }
  }
});

bootstrap();

执行效果

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(327.42 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4MzIxOXwwMWUwMTQwYnwxNzkxMDkxMTg1fDB8MjEzMDg1OQ%3D%3D&nothumb=yes)

2026-10-3 21:16 上传

---

[查看原文](https://www.52pojie.cn/thread-2130859-1-1.html)
