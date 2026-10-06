---
title: "ks app rpc调用加密算法实现搜索"
published: 2026-10-05
description: "版本号，12.11.30.39921 ks_client.py,js脚本注入 App [mw_shl_code=asm,true]import argparse import json import os import subprocess import sys import time try: import frid"
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "wabc666"
sourceLink: "https://www.52pojie.cn/thread-2131016-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2131016-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

版本号，12.11.30.39921

ks_client.py,js脚本注入 App

[Asm] *纯文本查看* *复制代码*
import argparse
import json
import os
import subprocess
import sys
import time

try:
    import frida
except ImportError:
    sys.exit("缺少 frida：pip install frida")

HERE = os.path.dirname(os.path.abspath(__file__))
PKG = "com.smile.gifmaker"

def _find_script(explicit=None):
    """定位注入脚本：--script 显式指定优先；否则找 ks_rpc.js。

    显式指定时可用于注入其它纯 native 脚本，例如
    out/runtime/hook_logcat.js（抓 App 自己打印的完整 curl 请求行）。
    """
    if explicit:
        if os.path.isfile(explicit):
            return os.path.abspath(explicit)
        sys.exit("找不到脚本: %s" % explicit)
    cands = [
        os.path.join(HERE, "out", "runtime", "ks_rpc.js"),
        os.path.join(HERE, "ks_rpc.js"),
    ]
    for c in cands:
        if os.path.isfile(c):
            return c
    sys.exit("找不到 ks_rpc.js（已找过: %s）" % ", ".join(cands))

SCRIPT = _find_script()

# ------------------------------------------------------------------ #
# 目标 App 的签名明文构造规则（REPORT §6.6.2）
# ------------------------------------------------------------------ #
NS_PREFIXES = ("__NS",)

def build_plaintext(query_pairs, form_pairs):
    """sorted(set(query + form)) 去 __NS* 前缀后，无分隔符拼接。

    注意：必须排除 __NS 开头的所有参数（它们是签名自身的产物）。
    """
    seen = set()
    for k, v in list(query_pairs) + list(form_pairs):
        if any(k.startswith(p) for p in NS_PREFIXES):
            continue
        seen.add("%s=%s" % (k, "" if v is None else v))
    # Java TreeSet 用的是 String.compareTo（UTF-16 码元序）；
    # 纯 ASCII 场景下与 Python 的 ord 序一致。
    return "".join(sorted(seen))

# ------------------------------------------------------------------ #
# Frida 会话管理
# ------------------------------------------------------------------ #
class KsSession:
    def __init__(self, device_id=None, spawn=False, pkg=PKG, verbose=True,
                 override_sdk=None, script_path=None):
        self.pkg = pkg
        self.verbose = verbose
        self.override_sdk = override_sdk
        self.script_path = _find_script(script_path)
        self.pid = None
        self.spawned = False
        self.dev = self._pick_device(device_id)
        if spawn:
            self.pid = self.dev.spawn([pkg])
            self.spawned = True
            self._log("spawn %s -> pid %d" % (pkg, self.pid))
        else:
            self.pid = self._resolve_pid()
            self._log("attach pid %s" % self.pid)
        self.session = self.dev.attach(self.pid)
        with open(self.script_path, "r", encoding="utf-8") as f:
            self.script = self.session.create_script(f.read())
        self.script.on("message", self._on_message)
        self.script.load()
        self._log("%s 已注入" % os.path.basename(self.script_path))
        if self.spawned:
            self.dev.resume(self.pid)
            self._log("已 resume，App 继续运行")
        self._touch_sdk()

    # ---------------- 内部 ----------------
    def _log(self, msg):
        if self.verbose:
            print("[client] " + msg, file=sys.stderr)

    def _on_message(self, message, data):
        # 注意：这些 print 必须 flush，否则重定向到文件时 stdout 是块缓冲，
        # 抓包期间看不到实时输出（curl 行可达 7KB，很容易被“吞”在缓冲区里）。
        if message.get("type") == "send":
            print("[script] %s" % message.get("payload"), flush=True)
        elif message.get("type") == "error":
            print("[script:ERROR] %s"
                  % (message.get("stack") or message), file=sys.stderr,
                  flush=True)
        elif message.get("type") == "log":
            # ks_rpc.js 的 LOG() 走 console.log，务必回显，否则无法排障
            lvl = message.get("level", "info")
            p = message.get("payload")
            if isinstance(p, dict):
                p = p.get("description", p)
            print("[ks_rpc:%s] %s" % (lvl, p), flush=True)

    def _pick_device(self, device_id):
        if device_id:
            return frida.get_device(device_id)
        for getter in (frida.get_usb_device, frida.get_local_device):
            try:
                d = getter(timeout=5)
                return d
            except Exception:
                continue
        devs = [d for d in frida.enumerate_devices()
                if d.type not in ("local", "barebone")]
        if devs:
            return devs[0]
        sys.exit("找不到可用设备。请确认 adb devices 有设备、且 frida-server 已运行。")

    def _resolve_pid(self):
        for p in self.dev.enumerate_processes():
            if p.name == self.pkg:
                return p.pid
        procs = self.dev.enumerate_applications()
        for a in procs:
            if a.identifier == self.pkg and a.pid:
                return a.pid
        sys.exit("App %s 未在运行；可改用 --spawn。" % self.pkg)

    @staticmethod
    def detect_sdk(serial=None):
        """adb shell getprop ro.build.version.sdk -> int，失败返回 None"""
        cmd = ["adb"]
        if serial:
            cmd += ["-s", serial]
        cmd += ["shell", "getprop", "ro.build.version.sdk"]
        try:
            out = subprocess.check_output(cmd, stderr=subprocess.DEVNULL,
                                          timeout=10)
            return int(out.decode("utf-8", "replace").strip())
        except Exception:
            return None

    def _touch_sdk(self):
        """getClock 的第三个参数必须是真实 SDK_INT，为 0 会算出错误的 sig。"""
        try:
            st = self.status()
        except Exception as e:
            self._log("status 失败: %s" % e)
            return
        if st.get("sdkInt"):
            self._log("sdkInt=%s（脚本内反射读得）" % st["sdkInt"])
            return
        sdk = self.override_sdk or self.detect_sdk(
            getattr(self.dev, "id", None))
        if sdk:
            self.call("setsdkint", sdk)
            self._log("sdkInt=%d（adb 兜底写入）" % sdk)
        else:
            self._log("!! 拿不到 SDK_INT，getClock 可能算出错误 sig；"
                      "可用 --sdk N 手工指定")

    # ---------------- 对外 ----------------
    def call(self, name, *a):
        return getattr(self.script.exports_sync, name)(*a)

    def status(self):
        return json.loads(self.call("status"))

    def wait_ready(self, what="signReady", timeout=90):
        """轮询等待某个就绪位；期间请手动在 App 里触发一次搜索。"""
        t0 = time.time()
        last = None
        while time.time() - t0  ret) 反验我们的 kas() 复现能力。"""
    if not ks.status().get("kasReady"):
        print("等待 prSelf（请滑动/打开搜索页触发一次真实请求）...",
              file=sys.stderr)
        if not ks.wait_ready("kasReady", args.wait):
            sys.exit("kasReady 超时；pr 未被调用过。")
    rows = json.loads(ks.call("kasverify"))
    if not rows:
        print("没有可用的 pr 样本（pr 尚未被 App 调用）。", file=sys.stderr)
        return 2
    ok = bad = 0
    for i, r in enumerate(rows, 1):
        ok += r["ok"]
        bad += (not r["ok"])
        print("PR 样本#%-2d path(%d 字符, App arg4=%s) App=%s RPC=%s %s"
              % (i, len(r["path"]), r.get("appArg4"), r["app"], r["rpc"],
                 "OK" if r["ok"] else "MISMATCH"))
    print("\n合计: 一致 %d / 不符 %d" % (ok, bad))
    return 0 if bad == 0 else 1

def cmd_samples(ks, args):
    print(json.dumps(json.loads(ks.call("samples")), indent=2, ensure_ascii=False))
    return 0

def cmd_verify(ks, args):
    """核心自校验：用 App 自己产生并被我捕获的 (明文, sig) 样本，
    经 RPC 重算，逐条比对。全等 => RPC 链路（索引、对象、调用约定）正确。"""
    samples = json.loads(ks.call("samples"))
    usable = [s for s in samples if s.get("plaintext") and s.get("sig")]
    if not usable:
        print("还没有可用样本。请先在 App 里触发一次请求（打开搜索页）。", file=sys.stderr)
        return 2
    if not ks.status().get("signReady"):
        if not ks.wait_ready("signReady", args.wait):
            sys.exit("signReady 超时。")
    ok = bad = 0
    for i, s in enumerate(usable, 1):
        got = ks.call("sign", s["plaintext"])
        same = (got == s["sig"])
        ok += same
        bad += (not same)
        print("样本#%-2d len=%-4d App=%s RPC=%s %s"
              % (i, len(s["plaintext"]), s["sig"], got, "OK" if same else "MISMATCH"))
        if not same and args.show_plain:
            print("   明文: " + s["plaintext"])
    print("\n合计: 一致 %d / 不符 %d" % (ok, bad))
    if bad == 0:
        print("=> RPC 签名链路正确，可放心用于任意明文。")
        return 0
    print("=> 存在不符，请检查样本采集时机（是否混入不同 sdkInt / 不同 Context）。",
          file=sys.stderr)
    return 1

def cmd_watch(ks, args):
    """
    """
    if not ks.status().get("signReady"):
        if not ks.wait_ready("signReady", args.wait):
            sys.exit("signReady 超时。")
    seen = set()
    t0 = time.time()
    n_app = n_ok = n_bad = 0
    print("监听 %ds……请在 App 里打开搜索页 / 下拉刷新，产生真实请求。"
          % int(args.duration), file=sys.stderr)
    while time.time() - t0  %r" % args.keyword, file=sys.stderr)

    plain = build_plaintext(query.items(), form.items())
    path = urllib.parse.urlparse(url).path
    print("# path    = %s" % path, file=sys.stderr)
    print("# 明文长度 = %d" % len(plain), file=sys.stderr)
    print("# 明文     = %s" % plain, file=sys.stderr)

    if args.sig:
        sig = args.sig
        print("# sig 由命令行给定（复用抓包值）", file=sys.stderr)
    else:
        if not ks.status().get("signReady"):
            print("等待 Context ...", file=sys.stderr)
            if not ks.wait_ready("signReady", args.wait):
                sys.exit("signReady 超时。")
        sig = ks.call("sign", plain)
    print("# sig     = %s" % sig, file=sys.stderr)

    kas = args.kas
    if kas is None and not args.kas_from_capture:
        if ks.status().get("kasReady"):
            kas = ks.call("kas", path)
            print("# kas     = %s" % kas, file=sys.stderr)
        else:
            print("# kas 不可用（prSelf 未捕获），沿用抓包值", file=sys.stderr)

    q = list(query.items())
    q.append(("sig", sig))
    for k in ("__NStokensig", "__NS_sig3", "__NS_xfalcon"):
        v = carried.get(k)
        if v:
            q.append((k, v))
        else:
            print("# 警告: 模板缺少 %s，请求可能被拒" % k, file=sys.stderr)

    full_url = url + "?" + urllib.parse.urlencode(q)
    body = urllib.parse.urlencode(form)
    if kas:
        headers["kas"] = kas

    print("\n===== 待发送请求 =====")
    print("POST " + full_url)
    for k, v in headers.items():
        print("%s: %s" % (k, v))
    print()
    print(body)

    if not args.send:
        print("\n(仅打印；加 --send 实际发送)", file=sys.stderr)
        return 0

    import requests
    r = requests.post(full_url, data=body.encode("utf-8"), headers=headers,
                      timeout=20)
    print("\n===== 响应 %d =====" % r.status_code, file=sys.stderr)
    print(r.text[:2000])
    return 0 if r.ok else 1

def cmd_capture(ks, args):
    """
    """
    print("[client] capture %.0fs，脚本=%s"
          % (args.duration, ks.script_path), file=sys.stderr)
    end = time.time() + args.duration
    try:
        while time.time()

ks_rpc.js，调用app原生函数算出 sig

[Asm] *纯文本查看* *复制代码*

var TAG = "[KSRPC] ";
var P = Process.pointerSize;

function LOG() {
    console.log(TAG + Array.prototype.slice.call(arguments).join(" "));
}

/* ================================================================== */
/* 0. JNI 索引（= 标准 JNI 规范索引，无偏移；证据见文件头）            */
/* ================================================================== */
var J = {
    GetVersion: 4,
    FindClass: 6,
    ExceptionOccurred: 15,
    ExceptionClear: 17,
    NewGlobalRef: 21,
    DeleteGlobalRef: 22,
    DeleteLocalRef: 23,
    GetObjectClass: 31,
    CallObjectMethod: 34,
    GetStaticMethodID: 113,
    CallStaticObjectMethod: 114,
    GetStaticFieldID: 144,
    GetStaticIntField: 150,
    NewString: 163,
    GetStringLength: 164,
    NewStringUTF: 167,
    GetStringUTFLength: 168,
    GetStringUTFChars: 169,
    ReleaseStringUTFChars: 170,
    GetArrayLength: 171,
    NewByteArray: 176,
    GetByteArrayElements: 184,
    ReleaseByteArrayElements: 192,
    SetByteArrayRegion: 208
};

/* ================================================================== */
/* 1. JavaVM / JNIEnv 管理（RPC 线程需要自己的 JNIEnv）                */
/* ================================================================== */
var g_vm = null;

function initJavaVM() {
    var f = Module.findExportByName(null, "JNI_GetCreatedJavaVMs");
    if (!f) { LOG("!! 找不到 JNI_GetCreatedJavaVMs"); return false; }
    var fn = new NativeFunction(f, "int", ["pointer", "int", "pointer"]);
    var buf = Memory.alloc(P);
    var cnt = Memory.alloc(4);
    var rc = fn(buf, 1, cnt);
    if (rc !== 0 || cnt.readInt()  0 ? n : 1);
    if (n > 0) buf.writeByteArray(bytes);
    jf(env, J.SetByteArrayRegion, "void",
        ["pointer", "pointer", "int", "int", "pointer"])(env, arr, 0, n, buf);
    return arr;
}

/* ================================================================== */
/* 2b. 不依赖 App 流量地取 Context                                     */
/*     android.app.ActivityThread.currentApplication() -> Application  */
/*     这是纯 JNI 反射调用，不经过 Java.perform / ART instrumentation， */
/*     因此不会触发 App 的 Frida 检测（REPORT §6.5）。                  */
/* ================================================================== */
function jniPendingException(env, where) {
    var ex = jf(env, J.ExceptionOccurred, "pointer", ["pointer"])(env);
    if (!ex.isNull()) {
        jf(env, J.ExceptionClear, "void", ["pointer"])(env);
        jf(env, J.DeleteLocalRef, "void", ["pointer", "pointer"])(env, ex);
        LOG("!! JNI 异常 @ " + where);
        return true;
    }
    return false;
}

function getContextViaActivityThread(env) {
    var cls = jf(env, J.FindClass, "pointer", ["pointer", "pointer"])(
        env, Memory.allocUtf8String("android/app/ActivityThread"));
    if (cls.isNull() || jniPendingException(env, "FindClass(ActivityThread)")) {
        return null;
    }
    var mid = jf(env, J.GetStaticMethodID, "pointer",
        ["pointer", "pointer", "pointer", "pointer"])(
        env, cls,
        Memory.allocUtf8String("currentApplication"),
        Memory.allocUtf8String("()Landroid/app/Application;"));
    if (mid.isNull() || jniPendingException(env, "GetStaticMethodID(currentApplication)")) {
        return null;
    }
    /* currentApplication() 无参，非 A 变体在 AAPCS 下与定参调用等价 */
    var ctx = jf(env, J.CallStaticObjectMethod, "pointer",
        ["pointer", "pointer", "pointer"])(env, cls, mid);
    if (ctx.isNull() || jniPendingException(env, "CallStaticObjectMethod")) {
        return null;
    }
    LOG("ActivityThread.currentApplication() -> Context @" + ctx);
    return ctx;
}

/* 读 android.os.Build$VERSION.SDK_INT。
 * 必须拿到真值：getClock(ctx, data, sdkInt) 的第三个参数就是它，
 * 传 0 会让 App 走到错误的代码分支、算出不一致的 sig。 */
function readSdkInt(env) {
    var cls = jf(env, J.FindClass, "pointer", ["pointer", "pointer"])(
        env, Memory.allocUtf8String("android/os/Build$VERSION"));
    if (cls.isNull() || jniPendingException(env, "FindClass(Build$VERSION)")) {
        return null;
    }
    var fid = jf(env, J.GetStaticFieldID, "pointer",
        ["pointer", "pointer", "pointer", "pointer"])(
        env, cls,
        Memory.allocUtf8String("SDK_INT"),
        Memory.allocUtf8String("I"));
    if (fid.isNull() || jniPendingException(env, "GetStaticFieldID(SDK_INT)")) {
        return null;
    }
    var v = jf(env, J.GetStaticIntField, "int",
        ["pointer", "pointer", "pointer"])(env, cls, fid);
    if (jniPendingException(env, "GetStaticIntField(SDK_INT)")) return null;
    return v | 0;
}

/* 确保 g_jctx 可用：优先用 App 真实调用捕获到的，其次走 ActivityThread */
function ensureContext(env) {
    if (!g_sdkInt) {
        var s = readSdkInt(env);
        if (s !== null && s > 0) {
            g_sdkInt = s;
            LOG("SDK_INT(反射读得) = " + s);
        }
    }
    if (g_jctx) return g_jctx;
    var ctx = getContextViaActivityThread(env);
    if (!ctx) return null;
    g_jctx = newGlobalRef(env, ctx);
    g_classGetClock = newGlobalRef(env, jf(env, J.GetObjectClass, "pointer",
        ["pointer", "pointer"])(env, ctx));
    LOG(">>> (ActivityThread 路线) 捕获 jctx=" + g_jctx);
    return g_jctx;
}

/* ================================================================== */
/* 3. 定位两个 native 入口                                             */
/* ================================================================== */
var GETCLOCK_OFF = 0x1711;      /* libcore.so，APK 静态确认 + 运行时零偏差 */
var PR_OFF = 0x2550;            /* libw.so，同上 */
var PR_ARRAY_OFF = 0x10004;     /* .data+4；5 x 12B 正好填满 .data 的 0x40 */
var addrGetClock = null;
var addrPr = null;

function findGetClock() {
    var m = Process.findModuleByName("libcore.so");
    if (!m) return null;   /* 静默：so 尚未加载是 spawn 注入的正常阶段 */
    var a = Module.findExportByName("libcore.so",
        "Java_com_yxcorp_gifshow_util_CPU_getClock");
    if (a) { LOG("getClock(导出符号) @ " + a + "  base=" + m.base); return a; }
    var b = m.base.add(GETCLOCK_OFF);
    LOG("getClock 无导出，用 base+0x" + GETCLOCK_OFF.toString(16) + " -> " + b);
    return b;
}

function findPr() {
    var m = Process.findModuleByName("libw.so");
    if (!m) return null;   /* 静默：同上 */
    LOG("libw.so base=" + m.base);
    try {
        var arr = m.base.add(PR_ARRAY_OFF);
        var n0 = arr.readPointer().readUtf8String();
        var s0 = arr.add(P).readPointer().readUtf8String();
        LOG("JNINativeMethod[0] name=" + n0 + " sig=" + s0);
        if (n0 === "ac" || n0 === "pr") {
            for (var i = 0; i >> 捕获 jctx=" + g_jctx + " jclass=" + g_classGetClock +
                        " sdkInt=" + g_sdkInt);
                }
            },
            onLeave: function (ret) {
                /* 过滤掉本脚本自己发起的调用：那些不是 App 产生的样本，
                 * 拿它们自校验等于自己比自己对，没有证明力。 */
                if (g_rpcCall) return;
                if (g_samples.length >= 20) return;
                try {
                    var env = this.env;
                    var n = jf(env, J.GetArrayLength, "int",
                        ["pointer", "pointer"])(env, this.arr);
                    var bp = jf(env, J.GetByteArrayElements, "pointer",
                        ["pointer", "pointer", "pointer"])(env, this.arr, NULL);
                    var plain = "";
                    if (n > 0 && !bp.isNull()) {
                        plain = bp.readUtf8String(n);
                        jf(env, J.ReleaseByteArrayElements, "void",
                            ["pointer", "pointer", "pointer", "int"])(
                            env, this.arr, bp, 2);
                    }
                    var sig = readJString(env, ret);
                    /* 按 sig 去重：App 冷启动会连发几十个相同请求
                     * （比如同一个 16 字节明文），若不去重会瞬间占满 20 个
                     * 槽位，导致后续真正有差异的样本被丢弃。
                     * sig 是明文的函数，同 sig 必同明文，去重安全。 */
                    for (var k = 0; k >> SIG 样本#" + g_samples.length + " plainLen=" + n +
                        " sig=" + sig);
                } catch (e) { LOG("样本记录异常: " + e); }
            }
        });
        LOG("hooked getClock");
    }

    if (!addrPr) { /* libw.so 还没加载，等下一轮 */ }
    else if (hookPrDone) { }
    else {
        hookPrDone = true;
        Interceptor.attach(addrPr, {
            onEnter: function (args) {
                if (g_rpcCall) return;   /* 过滤本脚本自己的 kas() 调用 */
                this.env = args[0];
                if (!g_prSelf && !args[1].isNull()) {
                    g_prSelf = newGlobalRef(this.env, args[1]);
                    LOG(">>> 捕获 prSelf=" + g_prSelf + " (来自 arg1)");
                }
                if (g_prSamples.length >= 8) return;
                /* 签名 (IIILjava/lang/String;)Ljava/lang/String; 已经告诉我们：
                 *   args[0]=env  args[1]=this  args[2..4]=int  args[5]=jstring
                 * 只读确定位置。不要「逐个试读」——对非字符串指针调用
                 * GetStringUTFChars 有踩内存/挂线程的风险。 */
                var ints = [args[2].toInt32(), args[3].toInt32(),
                            args[4].toInt32()];
                var path = null;
                try { path = readJString(this.env, args[5]); } catch (e) {
                    path = null;
                }
                /* 同样按 path 去重，避免重复项挤掉有差异的样本 */
                for (var k = 0; k >> PR 入参 ints=" + JSON.stringify(ints) +
                    " path=" + path);
            },
            onLeave: function (ret) {
                var last = g_prSamples[g_prSamples.length - 1];
                if (last && last.ret === undefined) {
                    try {
                        last.ret = readJString(this.env, ret);
                        LOG(">>> PR 返回 = " + last.ret);
                    } catch (e) { last.ret = null; }
                }
            }
        });
        LOG("hooked pr");
    }
}

/* ------------------------------------------------------------------ */
/* 惰性解析：spawn 注入时 libcore.so / libw.so 还没被 System.loadLibrary */
/* 加载，启动瞬间解析必然失败。改为「每次调用前尝试解析 + 启动后轮询」， */
/* so 一旦加载就自动装 hook，无需重启 App。                              */
/* ------------------------------------------------------------------ */
function resolveTargets() {
    if (!addrGetClock) {
        var a = findGetClock();
        if (a) {
            addrGetClock = a;
            FN_GETCLOCK = new NativeFunction(addrGetClock, "pointer",
                ["pointer", "pointer", "pointer", "pointer", "int"]);
            LOG(">>> 已定位 getClock @ " + addrGetClock);
        }
    }
    if (!addrPr) {
        var b = findPr();
        if (b) {
            addrPr = b;
            FN_PR = new NativeFunction(addrPr, "pointer",
                ["pointer", "pointer", "int", "int", "int", "pointer"]);
            LOG(">>> 已定位 pr @ " + addrPr);
        }
    }
    installHooks();
    return !!(addrGetClock || addrPr);
}

/* 启动后每 100ms 试一次，最多 600 次（60 秒）。
 * 间隔不能太大：libw.so 一旦加载，App 可能立刻调用 pr，
 * 这段时间内 hook 未装上就会永久漏掉 prSelf。 */
var resolveTries = 0;
var ensureCtxTries = 0;
var resolveTimer = setInterval(function () {
    resolveTries++;
    if (resolveTries > 1) quietResolve = true;
    var ok = resolveTargets();

    /* spawn 注入时 App 的 Application 还没创建，ActivityThread 路线必然返回
     * null。这里持续重试，App 一起来就把 Context 拿到手，不必等它自己
     * 调一次 getClock。 */
    if (!g_jctx && ensureCtxTries = 600) {
        quietResolve = false;
        LOG("轮询超时：getClock=" + (addrGetClock ? "有" : "无") +
            " pr=" + (addrPr ? "有" : "无") +
            " ctx=" + (g_jctx ? "有" : "无"));
        clearInterval(resolveTimer);
    }
    if (ok && resolveTries % 50 === 0) {
        LOG("轮询中 tries=" + resolveTries +
            " getClock=" + (addrGetClock ? "有" : "无") +
            " pr=" + (addrPr ? "有" : "无") +
            " ctx=" + (g_jctx ? "有" : "无"));
    }
}, 100);

/* ================================================================== */
/* 5. RPC 导出                                                         */
/* ================================================================== */
var FN_GETCLOCK = null;
var FN_PR = null;

/* 用指针+长度构造 jbyteArray，避免 JS 数组中转（明文可能带非 ASCII） */
function newJByteArrayFromPtr(env, ptrBuf, len) {
    var arr = jf(env, J.NewByteArray, "pointer", ["pointer", "int"])(env, len);
    if (arr.isNull()) return null;
    jf(env, J.SetByteArrayRegion, "void",
        ["pointer", "pointer", "int", "int", "pointer"])(env, arr, 0, len, ptrBuf);
    return arr;
}

/* UTF-8 编码后返回 {ptr,len}，长度靠扫 NUL 得到 */
function utf8(str) {
    var p = Memory.allocUtf8String(str);
    var n = 0;
    while (p.add(n).readU8() !== 0) n++;
    return { ptr: p, len: n };
}

function doSign(plaintext) {
    resolveTargets();
    if (!FN_GETCLOCK) throw new Error("getClock 未定位（libcore.so 尚未加载？）");
    var env = attachCurrentThread();
    if (!env) throw new Error("AttachCurrentThread 失败");
    if (!ensureContext(env)) {
        throw new Error("拿不到 Context：ActivityThread 路线失败，且 App 尚未调用过 getClock");
    }
    var u = utf8(plaintext);
    var jarr = newJByteArrayFromPtr(env, u.ptr, u.len);
    if (!jarr) throw new Error("NewByteArray 失败");
    g_rpcCall = true;
    var ret;
    try {
        ret = FN_GETCLOCK(env, g_classGetClock, g_jctx, jarr, g_sdkInt);
    } finally {
        g_rpcCall = false;
    }
    var sig = readJString(env, ret);
    if (!sig) throw new Error("getClock 返回空");
    return sig;
}

function doKas(str) {
    resolveTargets();
    if (!FN_PR) throw new Error("pr 未定位（libw.so 尚未加载？）");
    if (!g_prSelf) throw new Error("prSelf 未捕获：请先在 App 里刷新一次搜索页，再重试");
    var env = attachCurrentThread();
    if (!env) throw new Error("AttachCurrentThread 失败");
    var js = newJString(env, str);
    if (!js) throw new Error("NewStringUTF 失败");
    /* 复刻 Java: WeaponHI.m50832a: w.m50873pr(99999, 2, str.length() * 2, str) */
    g_rpcCall = true;
    var ret;
    try {
        ret = FN_PR(env, g_prSelf, 99999, 2, str.length * 2, js);
    } finally {
        g_rpcCall = false;
    }
    var kas = readJString(env, ret);
    if (!kas) throw new Error("pr 返回空");
    return kas;
}

rpc.exports = {
    ping: function () { return "pong"; },

    status: function () {
        resolveTargets();
        var env = attachCurrentThread();
        var ctxOk = false;
        if (env) ctxOk = !!ensureContext(env);
        var signReady = !!(FN_GETCLOCK && g_jctx);
        var kasReady = !!(FN_PR && g_prSelf);
        return JSON.stringify({
            pid: Process.id,
            arch: Process.arch,
            ptrSize: P,
            jniVersion: env ? ("0x" + (jniVersion(env) >>> 0).toString(16)) : null,
            jniVersionOk: env ? (jniVersion(env) === 0x10006) : false,
            getClock: addrGetClock ? addrGetClock.toString() : null,
            libcoreBase: (function () {
                var m = Process.findModuleByName("libcore.so");
                return m ? m.base.toString() : null;
            })(),
            pr: addrPr ? addrPr.toString() : null,
            libwBase: (function () {
                var m = Process.findModuleByName("libw.so");
                return m ? m.base.toString() : null;
            })(),
            haveJctx: !!g_jctx,
            havePrSelf: !!g_prSelf,
            sdkInt: g_sdkInt,
            sigSamples: g_samples.length,
            prSamples: g_prSamples.length,
            signReady: signReady,
            kasReady: kasReady,
            ready: signReady && kasReady
        });
    },

    sign: function (plaintext) { return doSign(plaintext); },
    kas: function (str) { return doKas(str); },

    /* 手工覆盖 sdkInt（默认已由反射读得，仅在读失败时兜底）。
     * 注意：Frida 的 rpc.exports 键会被转小写查找，必须全小写！ */
    setsdkint: function (v) { g_sdkInt = v | 0; return g_sdkInt; },

    /* 用 App 真实 pr 调用的 (path, ret) 反验 kas()：这是 kas 链路唯一有证明力的
     * 校验，和 sign 的 verify 同等重要。 */
    kasverify: function () {
        resolveTargets();
        var out = [];
        for (var i = 0; i sig"是否与本地算法一致 */
    samples: function () { return JSON.stringify(g_samples); },
    prsamples: function () { return JSON.stringify(g_prSamples); }
};

/* ================================================================== */
/* 6. 引导                                                             */
/* ================================================================== */
LOG("===== ks_rpc.js 启动  pid=" + Process.id + " arch=" + Process.arch + " =====");
if (initJavaVM()) {
    var env0 = attachCurrentThread();
    if (env0) {
        var v = jniVersion(env0);
        LOG("JNI GetVersion = 0x" + (v >>> 0).toString(16) +
            (v === 0x10006 ? "  OK (JNI 1.6)" : "  !!! 异常，索引模型可能不适用"));
    }
}
resolveTargets();   /* 首次尝试；若 so 未加载，由上面的轮询兜底 */

/* 主动尝试走 ActivityThread 路线把 Context 拿到手（无需 App 产生流量） */
var envBoot = attachCurrentThread();
if (envBoot) {
    if (ensureContext(envBoot)) {
        LOG("Context 已就绪，sign() 可直接使用");
    } else {
        LOG("ActivityThread 路线未成功；sign() 需等 App 调用一次 getClock");
    }
}

LOG("===== ready =====");
LOG("  sign : " + (FN_GETCLOCK && g_jctx ? "可用" : "待 Context"));
LOG("  kas  : " + (FN_PR && g_prSelf ? "可用" : "待 App 调用一次 pr（打开搜索页）"));

ks_atlas.js,算第二个签名 __NS_sig3

[Asm] *纯文本查看* *复制代码*

var TAG = "[KSATLAS] ";
var P = Process.pointerSize;

function LOG() {
    console.log(TAG + Array.prototype.slice.call(arguments).join(" "));
}

/* ================================================================== */
/* 0. JNI 索引（= 标准 JNI 规范索引，无偏移；证据见 ks_rpc.js 文件头）  */
/* ================================================================== */
var J = {
    GetVersion: 4,
    FindClass: 6,
    ExceptionOccurred: 15,
    ExceptionClear: 17,
    NewGlobalRef: 21,
    DeleteLocalRef: 23,
    GetObjectClass: 31,
    GetMethodID: 33,
    CallObjectMethod: 34,
    GetStaticMethodID: 113,
    CallStaticObjectMethod: 114,
    NewStringUTF: 167,
    GetStringUTFLength: 168,
    GetStringUTFChars: 169,
    ReleaseStringUTFChars: 170
};

/* ================================================================== */
/* 1. JavaVM / JNIEnv                                                  */
/* ================================================================== */
var g_vm = null;

function initJavaVM() {
    var f = Module.findExportByName(null, "JNI_GetCreatedJavaVMs");
    if (!f) { LOG("!! 找不到 JNI_GetCreatedJavaVMs"); return false; }
    var fn = new NativeFunction(f, "int", ["pointer", "int", "pointer"]);
    var buf = Memory.alloc(P);
    var cnt = Memory.alloc(4);
    var rc = fn(buf, 1, cnt);
    if (rc !== 0 || cnt.readInt()  (ExceptionOccurred 调用失败: " + e + ")";
    }
    if (!ex || ex.isNull()) return null;
    try { jf(env, J.ExceptionClear, "void", ["pointer"])(env); } catch (e) { /* ignore */ }
    var txt = null;
    try {
        var cls = jf(env, J.GetObjectClass, "pointer", ["pointer", "pointer"])(env, ex);
        if (cls && !cls.isNull()) {
            var mid = getMid(env, cls, "toString", "()Ljava/lang/String;");
            if (mid && !mid.isNull()) txt = readJString(env, callObjM0(env, ex, mid));
        }
    } catch (e2) { txt = "(toString 提取失败: " + e2 + ")"; }
    try { jf(env, J.DeleteLocalRef, "void", ["pointer", "pointer"])(env, ex); } catch (e3) { /* ignore */ }
    return where + " -> " + (txt === null ? "(无文本)" : txt);
}

/* ================================================================== */
/* 3. App ClassLoader 兜底（FindClass 在多 dex/自定义 Loader 下可能落空）*/
/* ================================================================== */
var g_cl = null;

function appClassLoader(env) {
    if (g_cl && !g_cl.isNull()) return g_cl;
    try {
        var at = findClassDirect(env, "android.app.ActivityThread");
        if (at.isNull()) { LOG("!! " + jniEx(env, "FindClass(ActivityThread)")); return NULL; }
        var midApp = getStaticMid(env, at, "currentApplication", "()Landroid/app/Application;");
        var e1 = jniEx(env, "GetStaticMethodID(currentApplication)");
        if (e1) { LOG("!! " + e1); return NULL; }
        var app = callStaticObj0(env, at, midApp);
        var e2 = jniEx(env, "ActivityThread.currentApplication()");
        if (e2) { LOG("!! " + e2); return NULL; }
        if (app.isNull()) { LOG("!! currentApplication() == null"); return NULL; }
        var ccls = findClassDirect(env, "android.content.Context");
        var midCL = getMid(env, ccls, "getClassLoader", "()Ljava/lang/ClassLoader;");
        var e3 = jniEx(env, "GetMethodID(Context.getClassLoader)");
        if (e3) { LOG("!! " + e3); return NULL; }
        var cl = callObjM0(env, app, midCL);
        var e4 = jniEx(env, "Context.getClassLoader()");
        if (e4) { LOG("!! " + e4); return NULL; }
        if (cl.isNull()) { LOG("!! getClassLoader() == null"); return NULL; }
        g_cl = jf(env, J.NewGlobalRef, "pointer", ["pointer", "pointer"])(env, cl);
        LOG("App ClassLoader = " + g_cl);
        return g_cl;
    } catch (e) {
        LOG("!! appClassLoader 异常 " + e);
        return NULL;
    }
}

/* 先 FindClass，失败则走 App ClassLoader.loadClass */
function findClass(env, name) {
    var cls = findClassDirect(env, name);
    if (!cls.isNull()) return cls;
    LOG("FindClass(" + name + ") 落空，改用 ClassLoader.loadClass：" + jniEx(env, "FindClass"));
    var cl = appClassLoader(env);
    if (cl.isNull()) return NULL;
    var clsCL = findClassDirect(env, "java.lang.ClassLoader");
    var mid = getMid(env, clsCL, "loadClass", "(Ljava/lang/String;)Ljava/lang/Class;");
    var e1 = jniEx(env, "GetMethodID(ClassLoader.loadClass)");
    if (e1) { LOG("!! " + e1); return NULL; }
    var res = callObjM1(env, cl, mid, newJString(env, name));
    var e2 = jniEx(env, "ClassLoader.loadClass(" + name + ")");
    if (e2) { LOG("!! " + e2); return NULL; }
    if (res.isNull()) LOG("!! loadClass(" + name + ") == null");
    return res;
}

/* ================================================================== */
/* 4. atlasSign 复算                                                    */
/* ================================================================== */
var KSEC = "com.kuaishou.android.security.KSecurity";
var g_clsK = null;
var g_midAtlas = null;
var g_probe = {};

function ensureAtlas(env) {
    if (g_clsK && !g_clsK.isNull() && g_midAtlas && !g_midAtlas.isNull()) return true;
    var cls = findClass(env, KSEC);
    if (cls.isNull()) { g_probe.ksecurity = "FindClass 失败"; return false; }
    g_clsK = jf(env, J.NewGlobalRef, "pointer", ["pointer", "pointer"])(env, cls);
    var mid = getStaticMid(env, g_clsK, "atlasSign", "(Ljava/lang/String;)Ljava/lang/String;");
    var e1 = jniEx(env, "GetStaticMethodID(atlasSign)");
    if (e1) { g_probe.ksecurity = e1; return false; }
    g_midAtlas = mid;
    g_probe.ksecurity = "ok cls=" + g_clsK + " mid=" + mid;
    LOG(g_probe.ksecurity);
    return true;
}

function doAtlas(env, input) {
    var t0 = Date.now();
    if (!ensureAtlas(env)) return { input: input, err: g_probe.ksecurity || "ensureAtlas 失败" };
    var js = newJString(env, input);
    var ret = callStaticObj1(env, g_clsK, g_midAtlas, js);
    var ex = jniEx(env, "KSecurity.atlasSign()");
    if (ex) return { input: input, err: ex, ms: Date.now() - t0 };
    if (ret.isNull()) return { input: input, err: "atlasSign 返回 null", ms: Date.now() - t0 };
    var out = readJString(env, ret);
    jf(env, J.DeleteLocalRef, "void", ["pointer", "pointer"])(env, ret);
    return { input: input, sig3: out, ms: Date.now() - t0 };
}

/* ================================================================== */
/* 5. RPC 导出（键名会被转小写）                                        */
/* ================================================================== */
rpc.exports = {
    status: function () {
        var env = attachCurrentThread();
        if (!env) return JSON.stringify({ err: "AttachCurrentThread 失败" });
        return JSON.stringify({
            pid: Process.id,
            arch: Process.arch,
            vm: g_vm ? g_vm.toString() : null,
            jniVersion: "0x" + (jf(env, J.GetVersion, "int", ["pointer"])(env) >>> 0).toString(16),
            ksecurity: g_probe.ksecurity || null,
            classloader: g_cl ? g_cl.toString() : null
        });
    },

    /* 诊断：FindClass 直连 / ClassLoader 兜底 / 目标方法存在性 */
    probe: function () {
        var env = attachCurrentThread();
        if (!env) return JSON.stringify({ err: "AttachCurrentThread 失败" });
        var out = {};
        try {
            var c1 = findClassDirect(env, KSEC);
            out.findClassDirect = c1.isNull() ? ("null | " + jniEx(env, "FindClass(KSecurity)")) : c1.toString();
            var cl = appClassLoader(env);
            out.classLoader = cl.isNull() ? null : cl.toString();
            if (!cl.isNull()) {
                var clsCL = findClassDirect(env, "java.lang.ClassLoader");
                var mid = getMid(env, clsCL, "loadClass", "(Ljava/lang/String;)Ljava/lang/Class;");
                var r = callObjM1(env, cl, mid, newJString(env, KSEC));
                var e = jniEx(env, "loadClass(KSecurity)");
                out.loadClass = e ? e : (r.isNull() ? "null" : r.toString());
            }
            out.ensureAtlas = ensureAtlas(env);
            out.ok = !!(g_clsK && g_midAtlas);
        } catch (err) { out.error = String(err); }
        return JSON.stringify(out);
    },

    /* 主接口：input = encodedPath + sig（与 App 侧 __NS_sig3 输入完全一致） */
    atlas: function (input) {
        var env = attachCurrentThread();
        if (!env) return JSON.stringify({ input: input, err: "AttachCurrentThread 失败" });
        var r;
        try { r = doAtlas(env, input); }
        catch (e) { r = { input: input, err: "JS 异常 " + e }; }
        LOG("atlas(" + JSON.stringify(String(input).slice(0, 90)) + ") -> " + (r.sig3 || r.err));
        return JSON.stringify(r);
    },

    /* 连打 N 次同输入：判定 atlasSign 输出是否存在计数器/随机成分。
     * gapMs > 0 时在两次调用之间真实休眠，用于区分「计数器」与「时间」。 */
    atlasseq: function (input, n, gapMs) {
        var env = attachCurrentThread();
        if (!env) return JSON.stringify({ err: "AttachCurrentThread 失败" });
        var count = n || 5, gap = gapMs || 0;
        var outs = [];
        for (var i = 0; i  0 && gap > 0) { try { Thread.sleep(gap); } catch (e) { /* ignore */ } }
            var r = doAtlas(env, input);
            outs.push({ i: i, sig3: r.sig3 || null, err: r.err || null, ms: r.ms });
        }
        var deltas = [];
        for (var j = 1; j " + j, same: a === b, xor: x });
        }
        return JSON.stringify({ input: input, n: outs.length, gap_ms: gap, outs: outs, xor_deltas: deltas });
    },

    /* 批量校验：[{input, expected}, ...] -> 命中率报告（抓包对回归） */
    atlasverify: function (json) {
        var env = attachCurrentThread();
        if (!env) return JSON.stringify({ err: "AttachCurrentThread 失败" });
        var cases;
        try { cases = JSON.parse(json); } catch (e) { return JSON.stringify({ err: "入参不是 JSON: " + e }); }
        var out = [], pass = 0;
        for (var i = 0; i >> 0).toString(16) +
            (v === 0x10006 ? "  OK (JNI 1.6)" : "  !!! 与预期不符"));
        if (ensureAtlas(e0)) LOG("KSecurity.atlasSign 已就绪");
        else LOG("KSecurity.atlasSign 未就绪（用 probe() 查因）");
    }
}
LOG("===== ready: rpc.exports = status/probe/atlas/atlasverify =====");

ks_e2e.py，发包

[Asm] *纯文本查看* *复制代码*
import argparse
import json
import os
import sys
import time
import urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, ROOT)
sys.path.insert(0, HERE)

from ks_client import KsSession, build_plaintext              # noqa: E402
from replay_probe import build as build_request               # noqa: E402

JS_ATLAS = os.path.join(HERE, "ks_atlas.js")
DEFAULT_TPL = os.path.join(ROOT, "examples", "replay.example.json")

def log(tag, msg):
    print("E2E|%s|%s" % (tag, msg), flush=True)

def xor_hex(a, b):
    """两个 hex 串逐字节 XOR（长度取短），用于观察 sig3 的逐调用掩码结构。"""
    n = min(len(a), len(b)) // 2 * 2
    return "".join("%02x" % (int(a[i:i + 2], 16) ^ int(b[i:i + 2], 16))
                   for i in range(0, n, 2))

def build_atlas_script(session):
    """在同一 session 里再注入 ks_atlas.js，返回 (script, exports)。"""
    if not os.path.isfile(JS_ATLAS):
        raise RuntimeError("找不到 %s" % JS_ATLAS)
    with open(JS_ATLAS, "r", encoding="utf-8") as fh:
        src = fh.read()
    script = session.create_script(src)
    script.on("message",
              lambda m, d: log("JS", json.dumps(m, ensure_ascii=False)[:400]))
    script.load()
    return script, script.exports_sync

def atlas_sign(atlas, inp):
    r = atlas.atlas(inp)
    if isinstance(r, (bytes, bytearray)):
        r = r.decode("utf-8", "replace")
    d = json.loads(r)
    if d.get("err"):
        raise RuntimeError("atlasSign 失败: %s" % d["err"])
    return d["sig3"]

def main():
    ap = argparse.ArgumentParser(prog="ks_e2e.py")
    ap.add_argument("--template", default=DEFAULT_TPL)
    ap.add_argument("--keyword", help="替换 form.keyword（默认沿用抓包真值）")
    ap.add_argument("--send", action="store_true", help="实际发送请求")
    ap.add_argument("--rounds", type=int, default=1)
    ap.add_argument("--keep-xfalcon", action="store_true",
                    help="保留抓包 __NS_xfalcon（默认丢弃：服务端实测不校验）")
    ap.add_argument("--fresh-reqid", action="store_true", help="换用新的 X-REQUESTID")
    ap.add_argument("--dump", help="把响应正文写入该文件（便于 grep 校验关键词命中）")
    ap.add_argument("--spawn", action="store_true", help="spawn 启动 App（默认 attach）")
    ap.add_argument("--wait", type=int, default=120)
    ap.add_argument("--timeout", type=int, default=25)
    args = ap.parse_args()

    with open(args.template, "r", encoding="utf-8") as fh:
        tpl = json.load(fh)
    captured = dict(tpl.get("captured_sigs", {}))
    captured_sig3 = captured.get("__NS_sig3")
    captured_sig = tpl["_来源抓包"]["captured_sig"]
    path = urllib.parse.urlparse(tpl["url"]).path

    query = dict(tpl.get("query", {}))
    form = dict(tpl.get("form", {}))
    if args.keyword is not None:
        form["keyword"] = args.keyword
    plain = build_plaintext(query.items(), form.items())
    log("PLAIN", "path=%s len=%d keyword=%r"
        % (path, len(plain), form.get("keyword")))

    ks = KsSession(spawn=args.spawn)
    try:
        st = ks.status()
        log("STATUS", json.dumps(st, ensure_ascii=False))
        if not st.get("signReady"):
            log("WAIT", "等待 signReady（最多 %ds，可在 App 内触发一次搜索）..."
                % args.wait)
            if not ks.wait_ready("signReady", args.wait):
                log("FATAL", "signReady 超时")
                return 2
        _atlas_script, atlas = build_atlas_script(ks.session)

        for i in range(args.rounds):
            sig = ks.call("sign", plain)
            sig3 = atlas_sign(atlas, path + sig)
            log("SIG", "#%d %s %s" % (i, sig,
                                      "== 抓包值" if sig == captured_sig
                                      else "!= 抓包值"))
            if not captured_sig3:
                log("SIG3", "#%d %s" % (i, sig3))
            elif sig3 == captured_sig3:
                log("SIG3", "#%d %s == 抓包值" % (i, sig3))
            else:
                log("SIG3", "#%d %s != 抓包值 (xor=%s)"
                    % (i, sig3, xor_hex(sig3, captured_sig3)))

            if not args.send:
                continue

            # 注意 build() 里 set_q 先于 drop_q 生效，故 __NS_sig3 只能进 set_q
            set_q = {"sig": sig, "__NS_sig3": sig3}
            set_h = None
            if args.fresh_reqid:
                set_h = {"X-REQUESTID": "%d%05d" % (int(time.time() * 1000), 0)}
            full_url, body, headers = build_request(
                tpl, keyword=args.keyword, set_q=set_q,
                drop_q=("__NStokensig", "__NS_xfalcon"), set_h=set_h)
            if args.keep_xfalcon and captured.get("__NS_xfalcon"):
                sep = "&" if "?" in full_url else "?"
                full_url += sep + urllib.parse.urlencode(
                    {"__NS_xfalcon": captured["__NS_xfalcon"]})

            import requests
            try:
                r = requests.post(full_url, data=body.encode("utf-8"),
                                  headers=headers, timeout=args.timeout)
            except Exception as exc:                            # noqa: BLE001
                log("RESP", "#%d EXC %s" % (i, exc))
                continue
            accepted = r.status_code == 200 and '"result":50' not in r.text
            log("RESP", "#%d http=%d len=%d %s | %s"
                % (i, r.status_code, len(r.text),
                   "ACCEPTED" if accepted else "REJECTED",
                   r.text[:400].replace("\n", " ")))
            if args.dump:
                with open(args.dump, "w", encoding="utf-8") as fh:
                    fh.write(r.text)
                log("DUMP", "响应正文已写入 %s（%d 字节）" % (args.dump, len(r.text)))
                # 关键词命中旁证：mixFeeds 里应能找到与关键词相关的字段/标题
                kw = form.get("keyword") or ""
                if kw:
                    log("HIT", "keyword=%r 在响应中出现 %d 次（大小写不敏感）"
                        % (kw, r.text.lower().count(kw.lower())))
    finally:
        ks.close()

    log("DONE", "")
    return 0

if __name__ == "__main__":
    sys.exit(main())

---

[查看原文](https://www.52pojie.cn/thread-2131016-1-1.html)
