---
title: "不需要服务器，用金山文档给 Qoder 每日自动签到（多账号）"
published: 2026-10-11
description: "与Trae签到相似，https://www.52pojie.cn/thread-2131917-1-1.html，又写了Qoder的金山云文档签到程序。 > 零基础照着做就行，全程大概 10 分钟。配好一次，以后每天全自动，不用再打开电脑。 --- ## 一、这是干什么的 Qoder 是一款 AI ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "cxs808"
sourceLink: "https://www.52pojie.cn/thread-2131975-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2131975-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

与Trae签到相似，https://www.52pojie.cn/thread-2131917-1-1.html，又写了Qoder的金山云文档签到程序。

> 零基础照着做就行，全程大概 10 分钟。配好一次，以后每天全自动，不用再打开电脑。

---

## 一、这是干什么的

Qoder 是一款 AI 编程工具，每天签到能领 Credits（可以换模型的用量）。

这个方案用「金山文档」的定时脚本帮你自动签到，好处是：

- **不用自己买服务器**，也不用电脑一直开机；

- 到点由金山文档云端自动跑；

- 支持**多个账号**；

- 签完能推消息到**微信**（Server酱 / PushPlus）或**企业微信**。

整体就三步：**拿账号信息 → 建表格填进去 → 粘脚本设定时任务**。下面一步步来。

---

## 二、开始前要准备的

一共三样，都很容易凑齐：

1. **一台 Windows 电脑**，并且已经安装、登录过 Qoder 客户端（用于提取设备标识和 token）；

2. **这台电脑装了 Python**（能运行 `.py` 脚本即可）；

3. **一个金山文档账号**（微信扫码登录小程序即可）。

---

## 三、第一步：拿到账号信息（设备标识 + token）

Qoder 没有浏览器登录接口，签到要用的 **token** 和 **设备标识** 都存在客户端本地，靠一个脚本一次提取。

### 1. 运行取号脚本

进入放脚本的文件夹（把下面路径替换成你自己的），然后运行：

```bash

python qoder_gettoken.py

```

运行后，终端会打印一行完整 JSON（这就是表格 A 列要填的内容），并自动追加写入同目录的 `tokens.txt`。

想给账号起个名，加 `--name`：

```bash

python qoder_gettoken.py --name 我的账号

```

### 2. 拿到一行 JSON

做完上面，终端会打印类似这样的一行（很长，粘的时候整行复制）：

```json

{"name":"我的账号","refreshToken":"drt-xxxx","accessToken":"dt-xxxx",

 "device":{"clientType":"10","machineOS":"x86_64_windows","machineHostname":"DESKTOP-xxx",

           "machineId":"xxx","machineToken":"xxx","machineCode":"xxx","machineType":"xxx","version":"0.3.4"}}

```

**这一整行就是你的账号信息**，先复制存好，下一步直接粘到表格 A 列。它也自动存进了同目录的 `tokens.txt`，找不到了去那里看。

> 提示：`refreshToken` 和 `accessToken` 都要有。脚本优先直接用 `accessToken` 签到，只有遇到 token 失效（401）时才用 `refreshToken` 自动续期。多账号就重复本步骤，每台机器各跑一次、各拿到一行 JSON。

---

## 四、第二步：上传表格，把账号填进去

### 1. 上传表格模板

项目里给你备好了一张现成的表格模板 `Qoder签到-金山文档.xlsx`，表头、列宽都已经调好，**直接用它，不用自己新建**。

打开微信上的金山文档小程序，把这张表格上传进去。

### 2. 填账号

上传后表头已经齐了，从第 2 行开始，每行填一个账号：

| 列   | 表头           | 怎么填                                   |

| ---- | -------------- | ---------------------------------------- |

| A    | 账号（JSON）   | 粘第一步拼好的那一整行 JSON              |

| B    | 是否签到       | 填「是」才签，其它/留空都跳过            |

| C    | Server酱 token | 要推送就填，不要就留空                   |

| D    | PushPlus token | 同上                                     |

| E    | 企业微信 key   | 群机器人 webhook 的 key 或完整地址，同上 |

| F    | 签到结果       | 不用管，脚本会自己写                     |

**关于推送（可选）：** C / D / E 三列你填哪列就推哪列，也能同时填多个。都不填也能正常签到，只是不通知你。

- **Server酱**：在  用微信扫码，拿到一个 `SCT...` 开头的 token；

- **PushPlus**：在  拿到 token；

- **企业微信**：在群聊添加「群机器人」，得到 Webhook 地址（填完整地址或地址里 `key=` 后面的那串都行）。

---

## 五、第三步：粘贴脚本，设定时任务

这是最后一步，把「签到脚本」交给金山文档自动跑。

### 1. 打开脚本编辑器

在金山文档表格里：顶部菜单「**效率**」→「**高级开发**」→「**AirScript 脚本编辑器**」。

### 2. 粘贴脚本

新建一个脚本，把项目里的 `Qoder签到-金山文档AirScript.js` 整个内容复制粘贴进去，保存。

> 脚本开头已经有接口地址和列布局说明，一般不用改；账号行数会自动识别，也不用填。

### 3. 校验服务

（这里跟 Trae 版一样，确认 AirScript 的 HTTP 服务可用、脚本能保存。）

### 4. 建定时任务

在脚本编辑器里点「**定时任务**」（或「计划任务」），新建一个：

- 设置为**每天**运行；

- 时间**避开整点**，比如 `08:37` 这种随机一点的时刻。

保存后，到点它就会自己跑了。

---

## 六、验证一下有没有配好

1. 可以在脚本编辑器里点「**运行**」手动跑一次，看下方日志；

2. 如果签到成功，表格 F 列会写上「`xxx签到成功 +100`」；已领过的话会写「`xxx已领取`」；

3. 填了推送的话，你的微信 / 企业微信会收到一条「签到成功」的消息。

看到这些，就说明整套已经跑通了，以后每天全自动，不用再管。

---

## 七、常见问题

**Q1：运行 `python` 提示「不是内部或外部命令」**

说明 Python 没装好，或者装的时候没勾 `Add Python to PATH`。重新装一遍勾上，或重启命令行再试。

**Q2：`qoder_gettoken.py` 提示解不开 / 拿不到 token**

要满足两件事：① 在**装了并登录 Qoder 客户端**的 Windows 上跑；② 用**登录客户端时的同一 Windows 用户**运行脚本。实在不行用 `QODER_AUTH_DIR` 手动指定客户端数据目录。

**Q3：日志一直显示「待下发」或「活动列表为空」**

一般是设备标识不对或过期：缺 `device` 块会提示「设备标识缺失」，`machineToken` 过期会查不到活动。回 Windows 重跑 `qoder_gettoken.py` 更新 `device`，把新的 device 块填回 A 列。

**Q4：提示「需重新登录」**

refreshToken 也失效了。重新跑一遍 `qoder_gettoken.py`，拿新的 `refreshToken` 填回 A 列。

**Q5：国际版用户**

Qoder 国际版 API 地址不同。打开 `Qoder签到-金山文档AirScript.js`，把开头的 `BASE` 从 `https://openapi.qoder.com.cn` 改成 `https://openapi.qoder.sh`。

**Q6：会重复发币吗？**

不会。claim 接口幂等，重复跑不会重复领取，不用担心定时任务多跑。

**Q7：能跟 Python 版签到程序同时跑吗？**

不建议。两个程序拿到的是各自的 accessToken，同时跑会互相轮换 token，导致其中一个的 token 失效。同一个账号**只保留一个**签到程序（金山文档版或 Python 版二选一）即可。

---

## 八、最后

- 本项目仅用于个人学习与自动化，请遵守 Qoder 相关服务条款；

- 使用产生的一切后果由使用者自己承担；

- token 属于敏感信息，**别发到公开群里**。

有问题欢迎在评论区留言。

Qoder签到-金山文档AirScript.js

[JavaScript] *纯文本查看* *复制代码*
// ============================================================================
//  Qoder 每日自动签到 · 金山文档 AirScript 版（修复版）
//  与 Python 版 qoder_core.py 对齐：优先用 accessToken，查活动 401 时才用
//  refreshToken 续期，不再一上来就强制刷新。
// ============================================================================
//
// 【表格列布局】（第 1 行是表头，账号从第 2 行开始，每行一个账号）
//   A  账号 JSON       一行一个账号，格式见下方示例
//   B  是否签到        填「是」才签，其它/空 跳过
//   C  Server酱 token  填了就推，留空不推
//   D  PushPlus token  填了就推，留空不推
//   E  企业微信 key    填了就推，留空不推（群机器人 webhook 的 key，或完整地址都行）
//   F  签到结果        脚本自动写回，平时不用管
//
// 【A 列账号 JSON 怎么写】——把 qoder_gettoken.py 打印的整行直接粘进来即可：
//   {"name":"账号1","refreshToken":"drt-xxx","accessToken":"dt-xxx",
//    "device":{"clientType":"10","machineOS":"x86_64_windows","machineHostname":"DESKTOP-xxx",
//              "machineId":"xxx","machineToken":"xxx","machineCode":"xxx","machineType":"xxx","version":"0.3.4"}}
//
//   · device 里 8 个字段必须齐（来自装了 Qoder 客户端的机器），尤其 machineToken 不能为空
//   · accessToken 优先直接用；查活动被拒(401)时才用 refreshToken 换新的并写回 A 列
//
// 【怎么运行】
//   金山文档 → 效率 → 高级开发 → AirScript 脚本编辑器，把本文件整个粘贴进去，
//   再建一个「定时任务」每天跑一次（建议避开整点）。账号行数会自动识别，不用改。

var date = new Date().getFullYear() + "-" + (new Date().getMonth() + 1).toString().padStart(2, '0') + "-" + new Date().getDate().toString().padStart(2, '0');

// ── Qoder 接口常量（一般不用改）─────────────────────────
var BASE = "https://openapi.qoder.com.cn";   // 国际版改成 https://openapi.qoder.sh
var UA = "Qoder/claim";
var EP_CAMPAIGNS = "/sash/api/v1/me/campaigns";
var EP_CLAIM = "/sash/api/v1/me/campaigns/"; // 后面拼 campaignId + "/claim"
var EP_REFRESH = "/api/v1/deviceToken/refresh";

// ── 列号变量 ───────────────────────────────────────────
var tokenColumn = "A";
var qiandaoColumn = "B";
var serverchanColumn = "C";
var pushplusColumn = "D";
var qywxColumn = "E";
var signinresult = "F";

function nowBJ() {
    var t = new Date();
    return t.getFullYear() + "-" + (t.getMonth() + 1).toString().padStart(2, '0') + "-" + t.getDate().toString().padStart(2, '0')
        + " " + t.getHours().toString().padStart(2, '0') + ":" + t.getMinutes().toString().padStart(2, '0') + ":" + t.getSeconds().toString().padStart(2, '0');
}

// device 对象 → Cosy-* 请求头
function deviceHeaders(device) {
    var map = {
        "clientType": "Cosy-ClientType",
        "machineOS": "Cosy-MachineOS",
        "machineHostname": "Cosy-MachineHostname",
        "machineId": "Cosy-MachineId",
        "machineToken": "Cosy-MachineToken",
        "machineCode": "Cosy-MachineCode",
        "machineType": "Cosy-MachineType",
        "version": "Cosy-Version"
    };
    var h = {};
    for (var k in map) {
        var v = (device && device[k] != null && device[k] !== "") ? String(device[k]) : "";
        if (v !== "") h[map[k]] = v;
    }
    if (!h["Cosy-ClientType"]) h["Cosy-ClientType"] = "10";
    return h;
}

function qHeaders(device, token) {
    var h = { "Accept": "application/json", "User-Agent": UA, "Content-Type": "application/json" };
    var d = deviceHeaders(device);
    for (var k in d) h[k] = d[k];
    if (token) h["Authorization"] = "Bearer " + token;
    return h;
}

// 兼容 WPS AirScript 不同版本的响应状态字段
function respStatus(resp) {
    if (!resp) return 0;
    if (resp.statusCode != null) return resp.statusCode;
    if (resp.status != null) return resp.status;
    return 0;
}

// 用 refreshToken 换 accessToken，返回 {status, accessToken, refreshToken} 或 {error}
function refreshAccess(device, refresh_token) {
    var resp, data;
    try {
        resp = HTTP.post(BASE + EP_REFRESH,
            JSON.stringify({ "refresh_token": refresh_token }),
            { headers: qHeaders(device, ""), timeout: 30000 });
        data = resp.json();
        if (typeof data === "string") { try { data = JSON.parse(data); } catch (e) { data = null; } }
    } catch (e) {
        return { error: "刷新请求失败：" + e.message };
    }
    var tok = (data && (data.token || data.accessToken || data.access_token)) || "";
    if (!tok) return { error: "刷新失败：服务端未返回 token（状态码 " + respStatus(resp) + "）" };
    return {
        status: respStatus(resp),
        accessToken: tok,
        refreshToken: (data && (data.refreshToken || data.refresh_token)) || refresh_token
    };
}

// 查活动列表，返回 {status, data}
function getCampaigns(device, token) {
    var resp = HTTP.get(BASE + EP_CAMPAIGNS, { headers: qHeaders(device, token), timeout: 30000 });
    var data = null;
    try { data = resp.json(); } catch (e) { data = null; }
    if (typeof data === "string") { try { data = JSON.parse(data); } catch (e) { data = null; } }
    return { status: respStatus(resp), data: data };
}

// 领取某个活动，返回 {status, data}
function doClaim(device, token, cid) {
    var resp = HTTP.post(BASE + EP_CLAIM + cid + "/claim",
        JSON.stringify({}),
        { headers: qHeaders(device, token), timeout: 30000 });
    var data = null;
    try { data = resp.json(); } catch (e) { data = null; }
    if (typeof data === "string") { try { data = JSON.parse(data); } catch (e) { data = null; } }
    return { status: respStatus(resp), data: data };
}

// 单账号推送：用该行自己的 C/D/E 通道
function sendNotify(sc, pp, wx, text) {
    var title = "&#129302; Qoder 每日签到";
    if (sc !== "") {
        HTTP.post("https://sctapi.ftqq.com/" + sc + ".send",
            { title: title, desp: text },
            { headers: { "Content-Type": "application/json" }, timeout: 60000 });
    }
    if (pp !== "") {
        HTTP.post("https://www.pushplus.plus/send",
            { token: pp, title: title, content: text.replace(/\n/g, "
"), channel: "wechat", template: "html" },
            { headers: { "Content-Type": "application/json" }, timeout: 60000 });
    }
    if (wx !== "") {
        var key = wx.split("key=").pop();
        HTTP.post("https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=" + key,
            JSON.stringify({ "msgtype": "text", "text": { "content": text } }),
            { headers: { "Content-Type": "application/json" }, timeout: 60000 });
    }
}

function fmtInt(v) {
    var n = parseInt(Number(v), 10);
    if (isNaN(n)) return String(v);
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function countAccounts() {
    var r = 2;
    while (r  0) {
        var got = 0, fail = 0;
        for (var j = 0; j  0) {
            notifyOne(servertoken, pushtoken, qywxtoken, "&#10060;", name, uid, "失败", fail + "/" + claimable.length + " 个活动领取失败");
            writeResult(row, date + " 失败");
        } else {
            notifyOne(servertoken, pushtoken, qywxtoken, "&#9989;", name, uid, "签到成功", "签到成功 +" + fmtInt(got) + " Credits");
            writeResult(row, date + " 签到成功 +" + fmtInt(got));
        }
        continue;
    }

    // 无可领：判断「今日已领」还是「待下发」
    var now = Date.now() / 1000;
    var hasClaimed = false;
    for (var m = 0; m

qoder_gettoken.py

[Python] *纯文本查看* *复制代码*
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
qoder_gettoken.py · Qoder 取账号信息（设备标识 + token，单文件零依赖）
════════════════════════════════════════════════════════════
在「装了并登录 Qoder 客户端」的 Windows 机器上跑一次，取到两样东西：

  · token：accessToken + refreshToken（DPAPI 解密密钥 + AES-GCM 解密 auth.v1.dat）
  · 设备标识：Cosy-* 那 8 个字段（客户端 runtime-info.exe + auth.machine-id）

然后合并成「一行 JSON」打印出来，并追加写入同目录的 tokens.txt。
这一行 JSON 就是金山文档表格 A 列要填的内容（直接整行粘过去）。

用法：
    python qoder_gettoken.py                # 取号并打印 + 写入 tokens.txt
    python qoder_gettoken.py --name 我的账号  # 指定账号显示名（默认「我的账号」）

输出示例（正是 A 列要的那一行）：
    {"name":"我的账号","refreshToken":"drt-xxx","accessToken":"dt-xxx",
     "device":{"clientType":"10","machineOS":"x86_64_windows","machineHostname":"DESKTOP-xxx",
               "machineId":"xxx","machineToken":"xxx","machineCode":"xxx","machineType":"xxx","version":"0.3.4"}}

环境变量（可选）：
    QODER_AUTH_DIR   手动指定客户端数据目录（auth.v1.dat / auth.machine-id 所在）
    QODER_UMID_EXE   手动指定 runtime-info.exe 全路径（找不到时用）

前提：
  1. 必须先在本机登录过 Qoder 客户端；
  2. 用「登录客户端时的同一 Windows 用户」运行本脚本（DPAPI 才能解开）。
"""
import base64
import ctypes
import ctypes.wintypes as wt
import glob
import json
import os
import platform
import socket
import subprocess
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

UMID_REL = ("resources", "umid", "runtime-info.exe")

HERE = os.path.dirname(os.path.abspath(__file__))

# ── Windows 解密原语（DPAPI + AES-GCM）────────────────────
class _DataBlob(ctypes.Structure):
    _fields_ = [("cbData", wt.DWORD), ("pbData", ctypes.POINTER(ctypes.c_char))]

class _AeadInfo(ctypes.Structure):
    _fields_ = [
        ("cbSize", wt.ULONG), ("dwInfoVersion", wt.ULONG),
        ("pbNonce", ctypes.POINTER(ctypes.c_ubyte)), ("cbNonce", wt.ULONG),
        ("pbAuthData", ctypes.POINTER(ctypes.c_ubyte)), ("cbAuthData", wt.ULONG),
        ("pbTag", ctypes.POINTER(ctypes.c_ubyte)), ("cbTag", wt.ULONG),
        ("pbMacContext", ctypes.POINTER(ctypes.c_ubyte)), ("cbMacContext", wt.ULONG),
        ("cbAAD", wt.ULONG), ("cbData", ctypes.c_ulonglong), ("dwFlags", wt.ULONG),
    ]

def _dpapi_unprotect(data):
    src = _DataBlob(len(data), ctypes.create_string_buffer(data, len(data)))
    dst = _DataBlob()
    if not ctypes.windll.crypt32.CryptUnprotectData(ctypes.byref(src), None, None, None, None, 0x01, ctypes.byref(dst)):
        raise OSError("DPAPI 解不开（%s）——需同一用户且已登录桌面" % ctypes.WinError())
    try:
        return ctypes.string_at(dst.pbData, dst.cbData)
    finally:
        ctypes.windll.kernel32.LocalFree(dst.pbData)

def _decrypt_gcm_cng(key, nonce, blob):
    bcrypt = ctypes.WinDLL("bcrypt.dll")

    def chk(res, what):
        if res != 0:
            raise OSError("CNG %s 失败 NTSTATUS=0x%08x" % (what, res & 0xFFFFFFFF))

    ct, tag = blob[:-16], blob[-16:]
    h_alg = ctypes.c_void_p()
    chk(bcrypt.BCryptOpenAlgorithmProvider(ctypes.byref(h_alg), "AES", None, 0), "OpenAlg")
    mode = "ChainingModeGCM"
    chk(bcrypt.BCryptSetProperty(h_alg, "ChainingMode", mode, (len(mode) + 1) * 2, 0), "SetProperty")
    h_key = ctypes.c_void_p()
    kbuf = ctypes.create_string_buffer(key, len(key))
    chk(bcrypt.BCryptGenerateSymmetricKey(h_alg, ctypes.byref(h_key), None, 0, kbuf, len(key), 0), "GenKey")
    nbuf = (ctypes.c_ubyte * len(nonce)).from_buffer_copy(nonce)
    tbuf = (ctypes.c_ubyte * len(tag)).from_buffer_copy(tag)
    info = _AeadInfo()
    info.cbSize = ctypes.sizeof(_AeadInfo)
    info.dwInfoVersion = 1
    info.pbNonce = ctypes.cast(nbuf, ctypes.POINTER(ctypes.c_ubyte))
    info.cbNonce = len(nonce)
    info.pbTag = ctypes.cast(tbuf, ctypes.POINTER(ctypes.c_ubyte))
    info.cbTag = len(tag)
    ibuf = ctypes.create_string_buffer(ct, len(ct))
    obuf = ctypes.create_string_buffer(len(ct))
    done = ctypes.c_ulong()
    chk(bcrypt.BCryptDecrypt(h_key, ibuf, len(ct), ctypes.byref(info), None, 0,
                             obuf, len(ct), ctypes.byref(done), 0), "Decrypt")
    return obuf.raw[:done.value]

def _decrypt_gcm(key, nonce, blob):
    try:
        from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    except ImportError:
        return _decrypt_gcm_cng(key, nonce, blob)
    return AESGCM(key).decrypt(nonce, blob, None)

# ── 客户端数据目录 / 安装目录 ──────────────────────────────
def appdata_dirs():
    env = os.environ.get("QODER_AUTH_DIR", "").strip()
    if env:
        return [env]
    appdata = os.environ.get("APPDATA", os.path.join(os.path.expanduser("~"), "AppData", "Roaming"))
    out = []
    for pat in ("com.qoder.app.*", "com.qodercn.app.*"):
        out += sorted(glob.glob(os.path.join(appdata, pat)), key=os.path.getmtime, reverse=True)
    seen, res = set(), []
    for p in out:
        k = p.lower()
        if k not in seen:
            seen.add(k)
            res.append(p)
    return res

def reg_roots():
    import winreg
    roots = []
    for hive in (winreg.HKEY_CURRENT_USER, winreg.HKEY_LOCAL_MACHINE):
        try:
            key = winreg.OpenKey(hive, r"Software\Microsoft\Windows\CurrentVersion\Uninstall")
        except OSError:
            continue
        try:
            n = winreg.QueryInfoKey(key)[0]
        except OSError:
            winreg.CloseKey(key)
            continue
        for i in range(n):
            try:
                with winreg.OpenKey(key, winreg.EnumKey(key, i)) as sub:
                    name = str(winreg.QueryValueEx(sub, "DisplayName")[0]).lower()
                    if "qoder" in name:
                        loc = str(winreg.QueryValueEx(sub, "InstallLocation")[0]).strip()
                        if loc:
                            roots.append(os.path.abspath(loc))
            except OSError:
                continue
        winreg.CloseKey(key)
    return roots

def candidate_umid_exes():
    env = os.environ.get("QODER_UMID_EXE", "").strip()
    if env:
        return [env]
    local = os.environ.get("LOCALAPPDATA", os.path.join(os.path.expanduser("~"), "AppData", "Local"))
    pf = os.environ.get("ProgramFiles", r"C:\Program Files")
    pf86 = os.environ.get("ProgramFiles(x86)", r"C:\Program Files (x86)")
    roots = [os.path.join(local, "Programs", "Qoder"), os.path.join(pf, "Qoder"), os.path.join(pf86, "Qoder"),
             os.path.join(local, "Programs", "Qoder CN"), os.path.join(pf, "Qoder CN"), os.path.join(pf86, "Qoder CN")]
    roots += reg_roots()
    return [os.path.join(r, *UMID_REL) for r in roots]

def run_umid(exe):
    try:
        p = subprocess.run([exe, "--account-stdin"], input=b"", capture_output=True,
                           timeout=40, cwd=os.path.dirname(exe))
        out = p.stdout.decode("utf-8", "replace").strip()
        lines = [l for l in out.splitlines() if l.strip()]
        return json.loads(lines[-1]) if lines else {}
    except Exception:
        return {}

def arch():
    m = platform.machine().lower()
    return {"amd64": "x86_64", "x86_64": "x86_64", "aarch64": "aarch64", "arm64": "aarch64"}.get(m, "x86_64")

# ── 取设备标识 ───────────────────────────────────────────
def get_device():
    exe = next((p for p in candidate_umid_exes() if os.path.isfile(p)), None)
    ri = run_umid(exe) if exe else {}
    dev = {
        "clientType": "10",
        "machineOS": arch() + "_windows",
        "machineHostname": socket.gethostname(),
        "machineId": "",
        "machineToken": ri.get("machineToken") or "",
        "machineCode": ri.get("machineCode") or "",
        "machineType": ri.get("machineType") or "",
        "version": "",
    }
    for root in appdata_dirs():
        p = os.path.join(root, "auth.machine-id")
        try:
            v = open(p, encoding="utf-8").read().strip()
            if v:
                dev["machineId"] = v
                break
        except OSError:
            continue
    for e in candidate_umid_exes():
        mf = os.path.join(os.path.dirname(os.path.dirname(e)), "build-manifest.json")
        try:
            with open(mf, encoding="utf-8") as fh:
                dev["version"] = str(json.load(fh).get("productVersion") or "")
                break
        except Exception:
            continue
    return dev, exe

# ── 取 token ─────────────────────────────────────────────
def _read_store(root):
    raw_path = os.path.join(root, "auth.v1.dat")
    state_path = os.path.join(root, "Local State")
    if not (os.path.isfile(raw_path) and os.path.isfile(state_path)):
        return None
    with open(raw_path, "rb") as fh:
        raw = fh.read()
    if raw[:3] != b"v10":
        return None
    with open(state_path, "r", encoding="utf-8") as fh:
        state = json.load(fh)
    key_blob = base64.b64decode(state["os_crypt"]["encrypted_key"])
    sess = json.loads(_decrypt_gcm(_dpapi_unprotect(key_blob[5:]), raw[3:15], raw[15:]).decode("utf-8"))
    if not sess.get("token"):
        return None
    return sess

def get_token():
    for root in appdata_dirs():
        try:
            sess = _read_store(root)
            if sess:
                out = {"accessToken": sess.get("token") or "",
                       "refreshToken": sess.get("refreshToken") or ""}
                if sess.get("expiresAt"):
                    out["expiresAt"] = sess["expiresAt"]
                return out
        except Exception:
            continue
    return None

def main(argv):
    name = "我的账号"
    for a in argv:
        if a.lower() == "--name" and argv.index(a) + 1

![](https://static.52pojie.cn/static/image/filetype/rar.gif)

[qoder-checkin-金山云文档.rar](forum.php?mod=attachment&aid=Mjg4NTA2NXw0ZTBlZjIxZHwxNzkxNzgwMzczfDB8MjEzMTk3NQ%3D%3D)

*(17.1 KB, 下载次数: 11)*

2026-10-11 21:22 上传

点击文件名下载附件

下载积分: 吾爱币 -1 CB

---

[查看原文](https://www.52pojie.cn/thread-2131975-1-1.html)
