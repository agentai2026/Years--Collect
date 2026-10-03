---
title: "Qoder 每日自动签到脚本，把 token 从客户端本地解出来了"
published: 2026-10-01
description: "[md]**项目地址：https://github.com/wallechfox/qoder-checkin** --- ## 起因 Qoder 每天有个「领 100 Credits」的活动，得手动点一下。这种小事不想天天惦记，就想跟之前的 Trae 签到一样，挂到青龙上自动跑。 现成的方案我基本都翻了一遍，两个有代 "
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "cxs808"
sourceLink: "https://www.52pojie.cn/thread-2130602-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2130602-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

**项目地址：[https://github.com/wallechfox/qoder-checkin](https://github.com/wallechfox/qoder-checkin)**

### 起因

Qoder 每天有个「领 100 Credits」的活动，得手动点一下。这种小事不想天天惦记，就想跟之前的 Trae 签到一样，挂到青龙上自动跑。

现成的方案我基本都翻了一遍，两个有代表性的：一个单文件版，一个 Cloudflare Worker 版。单文件版挺好，但它要么在装了客户端的机器上现取现跑，要么手动喂 token，放到青龙（Linux、没客户端）上就废了；Worker 版能用，但我不想为这事儿再开一套 Cloudflare 的部署。

于是卡在两处，也正好是 Qoder 跟别的签到最不一样的两点：**token 只能从客户端本地解，活动列表还不一定肯下发。**

### 一、token 藏在 auth.v1.dat 里

Qoder 没有网页登录那套公开接口，token 不从浏览器拿，只存在客户端本地的一个文件里：

`%APPDATA%\com.qodercn.app.stable\auth.v1.dat      # 国内版
%APPDATA%\com.qoder.app.xxx\auth.v1.dat           # 国际版`
文件头是 `v10`，后面是 AES-256-GCM 密文。密钥不在这文件里，得去同目录的 `Local State` 找：

`os_crypt.encrypted_key  →  去掉前 5 字节 → DPAPI 解一遍 → 得到 AES 密钥`
拿这把密钥解 `auth.v1.dat`，明文是个 JSON，`token` / `refreshToken` / `expiresAt` 都在里面。

真正的坑在下半句：**DPAPI 是绑 Windows 用户的。** 把这文件拷到别的用户、或者纯 SSH、服务账号、RDP 裸登的环境下解，一律解不开。必须"当初登录 Qoder 的那个用户、有正常的桌面会话"才行。脚本解不开会明确报错，不会吐个空字符串让你瞎猜。

解密这里做了个降级：装了 `cryptography` 就用它，没装就走 Windows 自带的 CNG（bcrypt），所以依旧零第三方依赖。

### 二、活动列表为什么是空的

这是最容易误判的一个坑。

2026-09-26 起，服务端开始要求请求带一组 `Cosy-*` 设备头，最关键的是 `Cosy-ClientType: 10`。**缺这个头，campaigns 接口直接返回空列表**，体现在脚本里就是天天「活动未下发 / pending」，让你以为活动没到点或者下线了。

那组设备头哪来？客户端安装目录里自带一个组件：

`resources\umid\runtime-info.exe`
拿 `--account-stdin` 跑一下，吐一坨 JSON，里面的 `machineToken` / `machineCode` / `machineType` 就是设备标识的核心几项；`machineId` 从 `auth.machine-id` 读，版本号从 `build-manifest.json` 读，`machineOS` 按架构拼成 `x86_64_windows` 或 `aarch64_windows`。

这坨东西里，`Cosy-MachineToken` 是最可能过期的一个，也是整套方案**唯一的软肋**。它哪天失效了，活动列表又会空回来，表现跟缺 `Cosy-ClientType` 一模一样——都是天天 pending。区别在于：缺 10 是一开始就配错，机器 token 过期是跑了好一阵才突然空。遇到了就回 Windows 重跑提取，没别的招。

### 三、跟 Trae 那套正好反过来

前面写 Trae 签到的时候说过，Trae 是「一台机器一天只能签一个号」，设备号账号级、一份一个，多账号得多台机器。

Qoder 刚好反过来：**设备标识是机器级的，一份就能给目录下所有账号共用。** 所以多账号简单得多，`accounts.json` 里写几个对象就签几个，不用攒机器。这条是从 Worker 版那边确认下来的——它把设备标识配成环境变量，账号录几个签几个。

### 四、脚本

`qoder-checkin/
├── 01_extract.py           ① 取设备标识 + token（装了客户端的 Windows 上跑）
├── 02_checkin.py           ② 签到（青龙/NAS 每天跑这个）
├── qoder_core.py           共用实现 —— 不直接运行
├── config.json             设备标识（Cosy-*）+ 推送 + 端点
├── accounts.example.json   账号模板
└── accounts.json           账号（多账号，01 自动写回/生成）`
几点说明：

- 纯 Python 标准库，零第三方依赖，Python 3.8+ 就行

- 编号 01→02，跟前一个工具一个习惯。`qoder_core.py` 不编号，还是那个原因——Python 不能用数字开头做模块名 import

- `01_extract.py` 一步把设备标识和 token 都取出来，**直接写回** `config.json` 和 `accounts.json`，不用手动复制粘贴。想先预览不落盘就加 `--no-write`

- token 会自己续期：到期前 72 小时主动换新，结果写到 `.qoder_token_cache.json`。青龙的环境变量是静态的，refreshToken 一轮换，不落盘就等于白签了几天

- claim 幂等，重复跑不会重复发币，所以那套去重、补签、冷却的代码全省了

### 五、怎么用

**第一步，提取。** 在装了 Qoder 并且登录过的 Windows 上：

`python 01_extract.py`
跑完 `config.json` 和 `accounts.json` 就自动填好了。整个目录传到青龙就行。

**第二步，签到。** 青龙/NAS 上：

`python3 /ql/data/scripts/qoder/02_checkin.py`
定时：

`0 10 * * *`
每天 10 点跑一次。活动窗口有 24 小时，偶尔漏了在面板手动点一次也能补上，反正幂等。

### 六、几个问题

#### 为什么第一步一定得在装了客户端的机器上跑

token 和设备标识都没有公开接口，只能从客户端本地文件里挖；DPAPI 又绑用户。所以「装过 + 登录过 + 你自己那台 Windows」缺一不可。实在不方便，理论上可以让有客户端的朋友在他机器上跑 `01_extract.py` 把结果给你，但那就成代签了，自己掂量。

#### 会不会把客户端踢下线

脚本读客户端目录是**只读**的，不改客户端一个字。但 Qoder 没有独立登录，token 本质就是从客户端拿出来的同一份，所以脚本在青龙上续期 refreshToken 之后，客户端那边如果还开着、也撞上刷新，两边算同一条链，偶尔会有一头要重新登录。撞上了重跑一次 `01_extract.py` 就回来。

#### 设备标识过期了怎么办

表现就是活动列表空、天天 pending。回 Windows 重跑 `01_extract.py`，`config.json` 会被覆盖成新值，再传到青龙。

#### 国际版怎么办

`config.json` 的 `baseUrls` 默认国内版 `https://openapi.qoder.com.cn`，国际版改成 `https://openapi.qoder.sh`，或设环境变量 `QODER_BASE_URL`。

#### 推送怎么开

`config.json` 的 `notify` 支持企业微信群机器人、PushPlus、自定义 webhook，填一个就行，留空就不推。

### 致谢

解密（DPAPI + AES-GCM）和设备标识提取这套，是站在别人肩膀上：

- sunp-1/qoder-checkin（单文件版，端点、解密、设备头基本都是跟它对齐的）

- qoder-cf-checkin（Cloudflare Worker 版，多账号和 token 续期的思路从这里来）

完整致谢在 README 里。

### 免责声明

第三方逆向实现，跟 Qoder 官方没关系。依赖的是未公开接口，客户端一升级就可能改字段、改路径、改鉴权，说失效就失效。用不用、怎么用，自己判断，账号出问题我不负责。只签自己的号，别拿去批量薅或批量注册。

有问题帖子里回，或者去仓库提 issue。

![](https://static.52pojie.cn/static/image/filetype/rar.gif)

[qoder-checkin.rar](forum.php?mod=attachment&aid=Mjg4MjcwMnxlZGQ2OWI4ZHwxNzkwOTk0MzY0fDB8MjEzMDYwMg%3D%3D)

*(15.59 KB, 下载次数: 18)*

2026-10-1 11:25 上传

点击文件名下载附件

下载积分: 吾爱币 -1 CB

---

[查看原文](https://www.52pojie.cn/thread-2130602-1-1.html)
