---
title: "用aardio制作一个IM软件 (源码)"
published: 2026-10-18
description: "cuteQQ 基于 aardio 编写的一个轻量级局域网即时通讯工具的完整源码，源码中包含[客户端]与[服务器]两部分。 项目Github仓库：https://github.com/maoshengwei2025-eng/cuteQQ 功能特性 [*]注册 / 登录 / 修 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "sdsdsd2026"
sourceLink: "https://www.52pojie.cn/thread-2133014-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2133014-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

**cuteQQ**

基于 aardio 编写的一个轻量级局域网即时通讯工具的完整源码，源码中包含[客户端]与[服务器]两部分。

项目Github仓库：https://github.com/maoshengwei2025-eng/cuteQQ

![](https://attach.52pojie.cn/forum/202610/18/002935fmyfgotg3cp1jjgg.png)

**功能特性**

注册 / 登录 / 修改密码 / 注销账号，密码采用「盐 + SHA-256」哈希存储好友管理：添加 / 删除好友，好友列表消息收发与离线消息（服务器 SQLite 存储，上线自动补发）文件传输：分片发送，单文件上限 20MB，同名文件自动加前缀防覆盖心跳保活：客户端 30 秒一跳，服务器巡检并清理死连接断线自动重连：失败自动重试并恢复登录会话顶号踢线：账号异地登录时旧连接被强制下线输入校验：用户名白名单、密码长度、文件名清洗等安全加固

**目录结构**

[XML] *纯文本查看* *复制代码*
cuteQQ/
├── client/          # 客户端（aardio 工程）
│   ├── default.aproj
│   ├── main.aardio
│   ├── dlg/         # 各窗口界面
│   ├── lib/         # wsHelper / chatBox / userList 等库
│   └── res/         # 图标、头像、提示音
└── server/          # 服务器（aardio 工程）
    ├── default.aproj
    ├── main.aardio
    ├── lib/         # chatServer / db / security 等库
    └── res/         # 默认头像

**运行方式**

使用 aardio IDE 打开 server/default.aproj，发布服务器端程序并运行（默认监听 8080 端口）；使用 aardio IDE 打开 client/default.aproj，发布客户端程序并运行；客户端首次启动后，在设置中填写服务器地址（默认 ws://127.0.0.1:8080），注册账号即可使用。

**下载地址**

蓝奏云： https://yooboo.lanzouq.com/ioN9M4cddk0d （密码:52pj）

---

[查看原文](https://www.52pojie.cn/thread-2133014-1-1.html)
