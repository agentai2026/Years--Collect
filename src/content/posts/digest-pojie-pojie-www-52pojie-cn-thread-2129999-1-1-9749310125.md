---
title: "dy app强制绕过抓包限制拦截接口明文"
published: 2026-09-27
description: "选择app版本，38.0.0，版本太新抓包检测太严格难以越过 普通抓包工具（Charles /mitmproxy）对dy无效。可以通过 Frida 注入dy进程，在加密函数执行前获取明文。 原因如下： [*]dy开启了证书校验（SSL Pinning）； [*]接口使用 HTTP/2，所有请求头通过 HPACK 压 ."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "wabc666"
sourceLink: "https://www.52pojie.cn/thread-2129999-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2129999-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

选择app版本，38.0.0，版本太新抓包检测太严格难以越过

普通抓包工具（Charles /mitmproxy）对dy无效。可以通过 Frida 注入dy进程，在加密函数执行前获取明文。

原因如下：
dy开启了证书校验（SSL Pinning）；接口使用 HTTP/2，所有请求头通过 HPACK 压缩为二进制编码；x-gorgon 这类反爬签名，是在原生层完成添加的。

请求相关类hook

Cronet 是 Chromium 网络库，dy自研封装 com.ttnet.org.chromium.net.impl.*，所有 http 请求底层走这套代码。
先**枚举这几个请求相关类的所有字段**，看字段名称和类型，猜测哪个成员保存请求头、请求参数、url；拿到字段名之后，下一步就可以写 Frida 脚本：

Hook CronetUrlRequest 构造函数 /start () 请求发起函数读取实例的 headers 字段，拿到dy加密请求头、请求体；

[Asm] *纯文本查看* *复制代码*
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""附着到运行中的dy进程, 枚举 Cronet 请求相关类的字段(找 headers/params 反射入口)。
   用法: python3 /tmp/probe_cronet.py
"""
import subprocess
import sys
import time

import frida

HOST = "127.0.0.1:31337"
PKG = "com.ss.android.ugc.aweme"

JS = r"""
Java.perform(function () {
  function dump(name) {
    try {
      var C = Java.use(name);
      var fs = C.class.getDeclaredFields();
      var lines = [];
      for (var i = 0; i

用spawn模式启动app，脚本逻辑如下

通过 adb forward 打通手机 Frida 服务端口force-stop 杀掉dy，**spawn 模式（先挂起 App，注入脚本后再 resume）**在dy TTNet/Cronet 网络引擎初始化前注入，才能修改 ALPN、关闭 QUIC；attach 附加到已经跑起来的 App 来不及加载 js 脚本，接管 message 日志，写入日志文件，超时自动停止

[Asm] *纯文本查看* *复制代码*
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""dy抓包 runner(spawn 模式): 在 App 初始化网络引擎之前注入, 才能改写 ALPN/关停 QUIC。

用法:
    DURATION=900 python3 -u /tmp/douyin_spawn3.py
日志:
    /tmp/douyin_frida3.log
"""
import os
import subprocess
import sys
import time
import frida

HOST = "127.0.0.1:31337"
PKG = "com.ss.android.ugc.aweme"
SCRIPT = "/tmp/douyin_capture3.js"
LOG = os.environ.get("LOG", "/tmp/douyin_frida3.log")
DURATION = int(os.environ.get("DURATION", "300"))

logf = open(LOG, "a", encoding="utf-8", buffering=1)

def _safe(s):
    return str(s).encode("utf-8", "replace").decode("utf-8", "replace")

def w(s):
    try:
        logf.write(_safe(s) + "\n")
    except Exception:
        pass

def on_message(message, data):
    try:
        t = message.get("type")
        if t == "log":
            w(message.get("payload", ""))
        elif t == "send":
            w("[send] %r" % (message.get("payload"),))
        elif t == "error":
            w("[error] %s" % message.get("description", ""))
            w(message.get("stack", ""))
    except Exception as e:
        try:
            w("[!] on_message 异常: %r" % (e,))
        except Exception:
            pass

def ensure_forward(verbose=True):
    for attempt in range(3):
        try:
            out = subprocess.check_output(["adb", "forward", "--list"], stderr=subprocess.DEVNULL).decode()
            if "tcp:31337" in out:
                return True
            subprocess.check_output(["adb", "forward", "tcp:31337", "tcp:31337"], stderr=subprocess.DEVNULL)
            time.sleep(0.5)
            out = subprocess.check_output(["adb", "forward", "--list"], stderr=subprocess.DEVNULL).decode()
            if "tcp:31337" in out:
                if verbose:
                    w(" 已重建 adb forward tcp:31337")
                return True
        except Exception as e:
            if verbose:
                w("[!] adb forward 异常: %s" % e)
            time.sleep(1)
    return False

def main():
    ensure_forward()
    dev = frida.get_device_manager().add_remote_device(HOST)

    # 杀掉残留进程, 保证是从零启动(spawn 才能接管初始化)
    try:
        subprocess.check_output(["adb", "shell", "am", "force-stop", PKG], stderr=subprocess.DEVNULL)
        time.sleep(2)
    except Exception as e:
        w("[!] force-stop 异常: %s" % e)

    w("\n========== spawn %s (%s) ==========" % (PKG, time.strftime("%H:%M:%S")))
    try:
        pid = dev.spawn([PKG])
    except Exception as e:
        w("[!] spawn 失败: %s" % e)
        return
    w(" spawned pid=%s (已挂起)" % pid)

    session = None
    for i in range(4):
        try:
            session = dev.attach(pid)
            break
        except Exception as e:
            w("[!] attach(spawn) 第 %d/4 次失败: %s" % (i + 1, e))
            ensure_forward()
            time.sleep(2)
    if session is None:
        w("[!] attach 失败, 放行进程以免卡死")
        try:
            dev.resume(pid)
        except Exception:
            pass
        return

    with open(SCRIPT, encoding="utf-8") as f:
        src = f.read()
    script = session.create_script(src, runtime="v8")
    script.on("message", on_message)

    def on_log(level, text):
        w("[" + level + "] " + text)
    try:
        script.set_log_handler(on_log)
    except Exception as e:
        w("[!] set_log_handler 失败: %s" % e)

    def on_detached(reason, crash):
        w("[!] 会话已断开 reason=%s" % reason)
        if crash is not None:
            try:
                w("[!] crash summary=%s pid=%s" % (crash.summary, crash.pid))
            except Exception:
                pass
            try:
                w("[!] crash report:\n%s" % crash.report)
            except Exception as e:
                w("[!] crash report 读取失败: %s" % e)
    session.on("detached", on_detached)

    try:
        script.load()
    except Exception as e:
        w("[!] script.load 失败: %s" % e)
        try:
            dev.resume(pid)
        except Exception:
            pass
        return

    w(" 脚本已注入(spawn 模式), 放行 App")
    try:
        dev.resume(pid)
    except Exception as e:
        w("[!] resume 失败: %s" % e)
    w(" 监控中, DURATION=%ds" % DURATION)

    end = time.time() + DURATION
    tick = 0
    while time.time()

注入脚本

Java 层 Hook：Conscrypt SSL 流读写，抓 Java SSL 明文；Hook OkHttp、Cronet，直接提取 URL、请求头（x-gorgon、x-tt-token 这类鉴权头）Native 层 Hook：libssl /libboringssl/libttnet 的SSL_read/SSL_write，拿到 TLS 解密后的原始明文SSL Pinning 绕过：Java TrustManager、OkHttp CertificatePinner、BoringSSL 底层证书校验全部 Hook，让 App 不校验服务器证书ALPN 修改：强制 TCP 连接协商http/1.1，避开 HTTP/2 HPACK 头部压缩（HTTP2 的头会被压缩，SSL 层看不到原始 Header）QUIC 观测：不直接破坏 QUIC TLS（会导致 App 崩溃），**QUIC 要靠 UDP 层面拦截，TTNet 会自动回落 TCP**

[Asm] *纯文本查看* *复制代码*
'use strict';
/*
 *dy com.ss.android.ugc.aweme 明文抓包 + SSL pinning 绕过（无需代理/证书）
 * 用法:
 *   frida -U -f com.ss.android.ugc.aweme -l /tmp/douyin_capture.js --runtime=v8
 * 输出: stdout（配合 shell 重定向 / frida -o 落盘）
 * 原理:
 *   Java 层 hook Conscrypt 的 SSLInputStream/SSLOutputStream 读写缓冲（解密后明文）
 *   原生层 hook libssl/libcronet/libttboringssl 的 SSL_read/SSL_write（覆盖 Cronet/TTNet/BoringSSL）
 *   pinning 绕过: TrustManagerImpl / okhttp CertificatePinner / BoringSSL custom_verify + X509_VERIFY_PARAM
 */

var MAX_DUMP = 8192;
var seen = 0;
var alpnLogged = 0;
var alpnSeen = 0;
var quicLogged = 0;
var quicEngineLogged = 0;

function nowStr() {
    var d = new Date();
    return d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '.' +
        ('00' + d.getMilliseconds()).slice(-3);
}

/* ── 字节 → 可读文本(frida V8 无 TextDecoder, 手写 UTF-8 解码) + 十六进制兜底 ── */
function utf8Decode(arr) {
    var out = '';
    for (var i = 0; i = 0xc0 && c = 0xe0 && c = 0xf0 && i + 3 > 10), 0xdc00 + (cp & 0x3ff));
        } else { out += '?'; i++; }
    }
    return out;
}

function hexOf(arr, max) {
    var hex = '';
    for (var j = 0; j ';
    var s = utf8Decode(arr);
    var printable = 0;
    for (var i = 0; i = 0x20 && cc  0xff) printable++;
    }
    if (printable / s.length > 0.85) return s.replace(/\r\n/g, '\n');
    return ' ' + hexOf(arr, 256) + (arr.length > 256 ? '...' : '');
}

/* 原生指针 dump */
function dumpNative(ptr, len) {
    var n = Math.min(len, MAX_DUMP);
    if (n ';
    var arr;
    try { arr = new Uint8Array(Memory.readByteArray(ptr, n)); } catch (e) { return ''; }
    try {
        if (n >= 2) {
            if (arr[0] === 0x16 && arr[1] === 0x03) return '';
        }
    } catch (e) { }
    return decodeBytes(arr);
}

/* Java byte[] dump */
function dumpJava(javaBytes, off, len) {
    var n = Math.min(len, MAX_DUMP);
    if (n ';
    var arr = new Uint8Array(n);
    try { for (var i = 0; i '; }
    return decodeBytes(arr);
}

function emit(tag, where, data) {
    seen++;
    console.log('\n════ [' + nowStr() + '] #' + seen + ' ' + tag + ' ' + where + ' ════');
    console.log(data);
}

/* ─────────── Java 层 ─────────── */
function sockInfoJava(obj) {
    // obj 是内部类实例(SSLInputStream/SSLOutputStream)，通过 this$0 取出外层 socket
    try {
        var f = obj.getClass().getDeclaredField('this$0');
        f.setAccessible(true);
        var sock = f.get(obj);
        if (sock === null) return '?';
        var addr = sock.getInetAddress();
        return (addr === null ? '?' : addr.getHostAddress()) + ':' + sock.getPort();
    } catch (e) {
        return '?';
    }
}

function hookJavaPlaintext() {
    var names = [
        'com.android.org.conscrypt.ConscryptFileDescriptorSocket$SSLOutputStream',
        'com.android.org.conscrypt.ConscryptFileDescriptorSocket$SSLInputStream',
        'com.android.org.conscrypt.ConscryptEngineSocket$SSLOutputStream',
        'com.android.org.conscrypt.ConscryptEngineSocket$SSLInputStream',
        'com.android.org.conscrypt.OpenSSLSocketImpl$SSLOutputStream',
        'com.android.org.conscrypt.OpenSSLSocketImpl$SSLInputStream'
    ];
    names.forEach(function (cn) {
        try {
            var C = Java.use(cn);
            try {
                C.write.overload('[B', 'int', 'int').implementation = function (b, off, len) {
                    try { emit('JAVA-OUT', sockInfoJava(this), dumpJava(b, off, len)); } catch (e) { }
                    return this.write(b, off, len);
                };
            } catch (e) { }
            try {
                C.read.overload('[B', 'int', 'int').implementation = function (b, off, len) {
                    var r = this.read(b, off, len);
                    try { if (r > 0) emit('JAVA-IN ', sockInfoJava(this), dumpJava(b, off, r)); } catch (e) { }
                    return r;
                };
            } catch (e) { }
        } catch (e) { }
    });
}

/* ─────────── 原生层（Cronet / BoringSSL / TTNet） ─────────── */
var getpeernameFn = null;
try {
    getpeernameFn = new NativeFunction(Module.getExportByName(null, 'getpeername'), 'int', ['int', 'pointer', 'pointer']);
} catch (e) { getpeernameFn = null; }

function peerOfFd(fd) {
    if (getpeernameFn === null) return 'fd=' + fd;
    try {
        var buf = Memory.alloc(128);
        var lenPtr = Memory.alloc(4);
        lenPtr.writeInt(128);
        if (getpeernameFn(fd, buf, lenPtr) !== 0) return 'fd=' + fd;
        var family = buf.readU16();
        if (family !== 2) return 'fd=' + fd + '(af' + family + ')';
        var port = (buf.add(2).readU8() = 32) return false;
    try {
        var a = new Uint8Array(Memory.readByteArray(ptr, Math.min(len, 16)));
        for (var i = 0; i = 0x20 && c  0 && !isNoise(this.buf, this.len)) {
                        var tg = targetOf(this.ssl, fdFn);
                        emit('NATIVE-OUT', modName + ' ssl=' + this.ssl + ' ' + tg, dumpSslSmart(this.buf, this.len, tg));
                    }
                },
                onLeave: function (retval) {
                    if (!isRead) return;
                    var n = retval.toInt32();
                    if (n > 0 && !isNoise(this.buf, n)) {
                        var tg2 = targetOf(this.ssl, fdFn);
                        emit('NATIVE-IN ', modName + ' ssl=' + this.ssl + ' ' + tg2, dumpSslSmart(this.buf, n, tg2));
                    }
                }
            });
            console.log(' hooked ' + modName + '!' + fnName);
        } catch (e) { }
    }
    doHook('SSL_read', true);
    doHook('SSL_read_ex', true);
    doHook('SSL_write', false);
    doHook('SSL_write_ex', false);
}

var hookedPin = {};
function hookNativePinningFor(modName) {
    if (hookedPin[modName]) return;
    hookedPin[modName] = true;
    var okCb = new NativeCallback(function () { return 0; }, 'int', ['pointer', 'pointer']);

    function tryReplace(fnName, retType, argTypes, mkImpl) {
        var a = null;
        try { a = Module.getExportByName(modName, fnName); } catch (e) { return; }
        if (a === null) return;
        try {
            var orig = new NativeFunction(a, retType, argTypes);
            Interceptor.replace(a, new NativeCallback(mkImpl(orig), retType, argTypes));
            console.log(' pinning-bypass ' + modName + '!' + fnName);
        } catch (e) { }
    }
    tryReplace('SSL_CTX_set_custom_verify', 'void', ['pointer', 'int', 'pointer'], function (orig) {
        return function (ctx, mode, cb) { orig(ctx, mode, okCb); };
    });
    tryReplace('SSL_CTX_set_verify', 'void', ['pointer', 'int', 'pointer'], function (orig) {
        return function (ctx, mode, cb) { orig(ctx, 0, NULL); };
    });
    /* Cronet/Chromium 走的是 per-SSL API, 必须单独替换, 否则 pinning 依然生效 */
    tryReplace('SSL_set_custom_verify', 'void', ['pointer', 'int', 'pointer'], function (orig) {
        return function (ssl, mode, cb) { orig(ssl, mode, okCb); };
    });
    tryReplace('SSL_set_verify', 'void', ['pointer', 'int', 'pointer'], function (orig) {
        return function (ssl, mode, cb) { orig(ssl, 0, NULL); };
    });
    try {
        var a = Module.getExportByName(modName, 'SSL_CTX_set_cert_verify_callback');
        var okCbStore = new NativeCallback(function () { return 1; }, 'int', ['pointer', 'pointer']);
        var origCV = new NativeFunction(a, 'void', ['pointer', 'pointer', 'pointer']);
        Interceptor.replace(a, new NativeCallback(function (ctx, cb, arg) {
            return origCV(ctx, okCbStore, arg);
        }, 'void', ['pointer', 'pointer', 'pointer']));
        console.log(' pinning-bypass ' + modName + '!SSL_CTX_set_cert_verify_callback');
    } catch (e) { }
    tryReplace('X509_verify_cert', 'int', ['pointer'], function () {
        return function () { return 1; };
    });
    tryReplace('X509_STORE_CTX_get_error', 'int', ['pointer'], function () {
        return function () { return 0; };
    });
    ['X509_VERIFY_PARAM_set1_host', 'X509_VERIFY_PARAM_set1_ip_asc',
        'X509_VERIFY_PARAM_set1_ip'].forEach(function (fn) {
            tryReplace(fn, 'int', ['pointer', 'pointer', 'int'], function () {
                return function () { return 1; };
            });
        });
    tryReplace('ssl_crypto_x509_session_verify_cert_chain', 'int', ['pointer', 'pointer'], function () {
        return function () { return 1; };
    });
    tryReplace('SSL_get_verify_result', 'long', ['pointer'], function () {
        return function () { return 0; };
    });
}

/* ─────────── Java 层: 直接抓业务请求 URL(不依赖协议解析) ─────────── */
var javaUrlLogged = 0;

function logJavaUrl(tag, method, url) {
    try {
        if (javaUrlLogged >= 500) return;
        javaUrlLogged++;
        console.log('[NET] ' + tag + ' ' + (method || '?') + ' ' + url);
    } catch (e) { }
}

/* 反射找对象里的 url/uri 字段(应对私有字段) */
function findUrlField(o, depth) {
    if (o === null || o === undefined || depth > 2) return null;
    var cls = null;
    try { cls = o.getClass(); } catch (e) { return null; }
    while (cls !== null) {
        var fs = null;
        try { fs = cls.getDeclaredFields(); } catch (e) { fs = null; }
        if (fs) {
            for (var i = 0; i '; }
}

function cronetHeaderPairs(obj) {
    var pairs = [];
    try {
        var H = obj.mRequestHeaders.value;
        if (!H) return pairs;
        var n = H.size();
        var strs = [];
        for (var i = 0; i  0 && (ci  CH_LIMIT) return;
    var url = '';
    try { url = jstr(obj.mInitialUrl.value); } catch (e) { }
    if (!url) { try { url = jstr(obj.mFinalUrl.value); } catch (e) { } }
    if (!url) { url = findUrlField(obj, 0); }
    if (!url) return;
    var method = '';
    try { method = jstr(obj.mInitialMethod.value); } catch (e) { }
    if (!method) method = (phase === 'REQ' ? '?' : 'RESP');
    var line = '[HDR] ' + phase + ' ' + method + ' ' + url;
    if (CH_NOISE.test(url)) return;
    if (phase === 'REQ') {
        var pairs = cronetHeaderPairs(obj);
        if (pairs.length) line += ' | REQ-HEADERS: ' + pairs.join(' ; ');
    } else {
        var info = null;
        try { info = obj.mResponseInfo.value; } catch (e) { }
        if (!info && infoArg) info = infoArg;
        var r = cronetRespPairs(info);
        var rp = [];
        if (r.status) rp.push('status=' + r.status);
        for (var k in r) {
            if (k === 'status' || k === 'err') continue;
            rp.push(k + '=' + String(r[k]).slice(0, 120));
        }
        if (r.err) rp.push(r.err);
        if (rp.length) line += ' | RESP-HEADERS: ' + rp.join(' ; ');
        else line += ' | RESP-HEADERS: ';
    }
    CH_COUNT++;
    console.log(line);
}

function hookJavaNetwork() {
    /* OkHttp(App 内置 / TTNet 内置) */
    ['okhttp3.Request$Builder', 'com.android.okhttp.Request$Builder'].forEach(function (cn) {
        try {
            var C = Java.use(cn);
            C.build.implementation = function () {
                var r = this.build();
                try { logJavaUrl(cn, r.method(), r.url().toString()); } catch (e) { }
                return r;
            };
            console.log(' java-net ' + cn + '.build');
        } catch (e) { }
    });
    /* TTNet/Chromium Cronet: 反射取请求 URL */
    ['com.ttnet.org.chromium.net.impl.CronetUrlRequest',
        'org.chromium.net.impl.CronetUrlRequest',
        'com.ttnet.org.chromium.net.impl.CronetBidirectionalStream',
        'com.android.okhttp.internal.http.HttpEngine'].forEach(function (cn) {
            var C = null;
            try { C = Java.use(cn); } catch (e) { return; }
            ['start', 'startInternal', 'sendRequest', 'readResponse'].forEach(function (fn) {
                try {
                    var isCronet = /CronetUrlRequest$/.test(cn);
                    C[fn].overloads.forEach(function (ov) {
                        ov.implementation = function () {
                            try {
                                if (isCronet) {
                                    logCronetDetail(this, 'REQ');
                                } else {
                                    logJavaUrl(cn + '.' + fn, null, findUrlField(this, 0));
                                }
                            } catch (e) { }
                            return ov.apply(this, arguments);
                        };
                    });
                    console.log(' java-net ' + cn + '.' + fn);
                } catch (e) { }
            });
        });
    /* Cronet 响应头(状态码/logid/内容类型) */
    try {
        var CR2 = Java.use('com.ttnet.org.chromium.net.impl.CronetUrlRequest');
        ['onResponseStarted', 'onRedirectReceived', 'onSucceeded'].forEach(function (m) {
            try {
                CR2[m].overloads.forEach(function (ov) {
                    ov.implementation = function () {
                        /* 必须在原方法体执行完之后读取: onResponseStarted 内部才给
                           mResponseInfo 赋值, 提前读会拿到 null。info 参数作为兜底。 */
                        var ret;
                        try { ret = ov.apply(this, arguments); } catch (e0) { throw e0; }
                        try {
                            logCronetDetail(this, m === 'onResponseStarted' ? 'RESP' : 'DONE',
                                arguments.length ? arguments[0] : null);
                        } catch (e) { }
                        return ret;
                    };
                });
                console.log(' java-net CronetUrlRequest.' + m);
            } catch (e) { }
        });
    } catch (e) { }
    /* java.net.URL 兜底 */
    try {
        var U = Java.use('java.net.URL');
        U.openConnection.overload().implementation = function () {
            try { logJavaUrl('java.net.URL', null, this.toString()); } catch (e) { }
            return this.openConnection();
        };
        console.log(' java-net java.net.URL.openConnection');
    } catch (e) { }
}

/* ─────────── 让 API 通道退化为 HTTP/1.1(明文可读) ───────────
 * dy业务接口走 HTTP/2(HPACK 压缩头), 在 SSL 明文层看不到 GET/POST 行;
 * 这里把 ALPN 列表改写成仅 http/1.1, 服务端就会协商 h1 → 请求行/头全明文。
 * 同时把 QUIC(HTTP/3) 关掉: 否则 API 会走 UDP, 完全绕过 SSL hook。
 */

function b64(bytes) {
    var T = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var out = '';
    for (var i = 0; i > 2] + T[((b0 & 3) > 4)] +
            ((i + 1 > 6)] : '=') +
            ((i + 2  ' + b64(arr) + (len > n ? '...(截断)' : '');
    } catch (e) { return ''; }
}

var CDN_RE = /douyinvod|sjxydc|mygscdjmyxzg|douyinpic|douyincdn|bytedns|byteimg|ibyteimg|tos-cn|pstatp|bytecdntp|vod-/i;

/* 纯埋点/日志上报(mon.*、log.*)的二进制 gzip 体没有分析价值, 直接丢弃避免日志爆炸 */
var NOISE_HOST_RE = /mon\.zijieapi|log[0-9]?\.|logbk|bytehwm|mssdk|\.bytegecko|minigame/i;

function dumpSslSmart(ptr, len, host) {
    var t = dumpNative(ptr, len);
    if (t.indexOf(' 65536) return t;
        return rawDump(ptr, len);
    }
    return t;
}

var hookedAlpn = {};

/* QuicHe 要求 ALPN 必须是 "h3", 改掉会让 QUIC 握手内部 CHECK 失败 → SIGTRAP 崩溃,
   所以只对 TCP 通道(h2,http/1.1)动手, 见到 h3 原样放行 */
function alpnListHasH3(protos, len) {
    try {
        var i = 0;
        while (i = 0x20 && c = 25) return;
                        try {
                            var n = this.lenp.readU32();
                            if (n > 0 && n

---

[查看原文](https://www.52pojie.cn/thread-2129999-1-1.html)
