---
title: "DataSecure：minifilter 透明加解密的工程思路"
published: 2026-09-07
description: "[md]# ## 0x00 问题从哪里来 企业里最常见的数据安全诉求不是「把磁盘整卷加密」，而是： - 机密目录里的文档，**授权办公软件**打开是明文； - 同一份文件拷到 U 盘、用记事本打开、被备份工具搬走，看到的 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "summer581"
sourceLink: "https://www.52pojie.cn/thread-2126863-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2126863-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

##

### 0x00  问题从哪里来

企业里最常见的数据安全诉求不是「把磁盘整卷加密」，而是：

- 机密目录里的文档，**授权办公软件**打开是明文；

- 同一份文件拷到 U 盘、用记事本打开、被备份工具搬走，看到的是**密文或占位**；

- 用户几乎感觉不到加解密，Office / WPS 仍能正常保存、另存、自动备份。

这就是 **透明加密**（Transparent Encryption）：加密发生在文件系统过滤层，应用仍按明文语义读写。

Windows 上这件事几乎只能落在 **minifilter**。理由很直接：

- 文件 I/O 最终都要经过 `FltMgr`；

- 可以按 IRP 精细挂钩 `CREATE / READ / WRITE / QUERY / SET / CLOSE`；

- 可以给每个文件流挂 `Stream Context`，把「这份文件现在是不是密文」记住；

- 可以通过 Communication Port 把策略从用户态面板灌进内核。

DataSecure 就是按这条路走完的一套工程：内核过滤驱动 + 用户态 DLL + WPF 控制面板。

![](https://static.52pojie.cn/static/image/common/none.gif)

**Screenshot 2026-09-06 182347.png** *(87.83 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3NzQzMnw0Njg5MTliZHwxNzg4ODMxMjQ4fDB8MjEyNjg2Mw%3D%3D&nothumb=yes)

2026-9-7 19:41 上传

效果也很直观：授权进程看到明文，未授权进程看到占位文案。

![](https://static.52pojie.cn/static/image/common/none.gif)

**Screenshot 2026-09-06 182425.png** *(88.86 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3NzQzM3xhZDY2ODVkY3wxNzg4ODMxMjQ4fDB8MjEyNjg2Mw%3D%3D&nothumb=yes)

2026-9-7 19:41 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**Screenshot 2026-09-06 182640.png** *(11.7 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3NzQzNHxmZTJkNTgwNXwxNzg4ODMxMjQ4fDB8MjEyNjg2Mw%3D%3D&nothumb=yes)

2026-9-7 19:41 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**Screenshot 2026-09-06 182800.png** *(32.85 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3NzQzNXxlMjA4YjU5YnwxNzg4ODMxMjQ4fDB8MjEyNjg2Mw%3D%3D&nothumb=yes)

2026-9-7 19:41 上传

### 0x01  项目概况

驱动 INF 把它登记进 **FSFilter Encryption** 组，高度 `141001`：

`Class = "Encryption"
ClassGuid = {a0a701c0-a511-42ff-aa6c-06dc0395576f}
LoadOrderGroup = "FSFilter Encryption"
Instance1.Altitude = "141001"`
高度选在 Encryption 组，是为了尽量靠近文件系统、在多数「监控类」过滤器之下处理真实数据。具体高度要按微软 altitude 分配表避开冲突，这里只说明选型意图。

数据面的一句话模型：

`应用  ──明文语义──►  DataSecure minifilter  ──密文落盘──►  NTFS
         ▲                      │
         │                      ▼
    授权进程看到明文        标识尾 + AES 密文
    备份进程看到完整密文
    其它进程看到占位串`
策略面的一句话模型：

`机密文件夹 ∩ 保护扩展名  →  进入透明加密通道
进程名册（Plaintext / Backup）→ 决定看到哪一种视图`

### 0x02  三层怎么咬合

`┌──────────────────────────────────────────────┐
│  DataSecure.exe  (WPF, MVVM)                 │
│  授权软件 / 保护格式 / 机密文件夹 / 特权加解密 │
│  DriverManager 加载卸载  RuleStore 落盘策略   │
└──────────────────────┬───────────────────────┘
                       │ FilterSendMessage
                       │ 端口 \DataSecure
┌──────────────────────▼───────────────────────┐
│  PocUserDll.dll                              │
│  FilterConnectCommunicationPort              │
│  剪贴板防护（用户态补充，内核管不到剪贴板）    │
└──────────────────────┬───────────────────────┘
                       │ FltCreateCommunicationPort
┌──────────────────────▼───────────────────────┐
│  DataSecure.sys                              │
│  IRP 回调 + StreamContext + 进程名册          │
│  标识尾读写 + 缓冲隔离 + 加解密               │
└──────────────────────────────────────────────┘`
用户态不碰加解密。面板只发命令：加一条扩展名、加一个机密目录、给某个 exe 明文权限。内核才是唯一的数据面。

这条边界很重要。一旦把密钥、缓冲切换、标识尾偏移放到用户态，任何有调试器的人都能直接拆。

### 0x03  过滤器挂哪些 IRP

透明加密**不必**拦截全部 IRP。DataSecure 只挂和「内容 / 长度 / 身份」相关的六类：

`CONST FLT_OPERATION_REGISTRATION Callbacks[] = {
    { IRP_MJ_CREATE,            0, PocPreCreateOperation,  PocPostCreateOperation },
    { IRP_MJ_READ,              0, PocPreReadOperation,    PocPostReadOperation },
    { IRP_MJ_WRITE,             0, PocPreWriteOperation,   PocPostWriteOperation },
    { IRP_MJ_QUERY_INFORMATION, 0, PocPreQueryInformationOperation,
                                   PocPostQueryInformationOperation },
    { IRP_MJ_SET_INFORMATION,   0, PocPreSetInformationOperation,
                                   PocPostSetInformationOperation },
    { IRP_MJ_CLOSE,             0, PocPreCloseOperation,   PocPostCloseOperation },
    { IRP_MJ_OPERATION_END }
};`
对应职责：

IRP
在这套方案里干什么

CREATE

---

[查看原文](https://www.52pojie.cn/thread-2126863-1-1.html)
