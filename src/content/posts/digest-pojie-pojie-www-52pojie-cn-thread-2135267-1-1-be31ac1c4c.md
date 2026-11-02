---
title: "把私人影音搬进网盘：一次加密挂载的折腾记录"
published: 2026-11-01
description: "关键词：加密挂载 / WebDAV / rclone crypt / chunker / 目录缓存环境：Debian 11 · x86_64 · 3.8G 内存 · 网盘 SVIP · 上行 40 MiB/s名词预备：远程存储（remote），能被当作目录访问的远端空间；挂载，让它在本机看 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "然并卵zh"
sourceLink: "https://www.52pojie.cn/thread-2135267-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2135267-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

> 关键词：加密挂载 / WebDAV / rclone crypt / chunker / 目录缓存环境：Debian 11 · x86_64 · 3.8G 内存 · 网盘 SVIP · 上行 40 MiB/s

> 名词预备：**远程存储（remote）**，能被当作目录访问的远端空间；**挂载**，让它在本机看起来像本地文件夹。其余术语第一次出现时会解释。

**一、起因：硬盘快坏了，网盘还空着**

今天摆弄 NAS 发现系统起不来了，分析发现是机械硬盘有坏道，看了眼 smartctl 离挂掉不远了，盘上的视频得再找处着落，又发现我网盘 SVIP 的 14TB 空间一大半没用上……
不加密直接传？省事，但等于同意平台扫描内容、做审核、和谐

打成加密压缩包？隐私有了，但想看第 30 分钟，得先把 6GB 下载完

那有没有办法把网盘里的视频既加密，又可以随时播放呢？自然是有的，用OpenList 挂盘，用 rclone 做加密存、解密读，用WorkBuddy一晚上搞定

**二、整体架构**

具体架构见下图：

![](https://static.52pojie.cn/static/image/common/none.gif)

**converted-svg.png** *(85.36 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg5MDQzN3w2MDYwYjM0OHwxNzkzNTgyMDg0fDB8MjEzNTI2Nw%3D%3D&nothumb=yes)

2026-11-1 22:44 上传

**层**

---

[查看原文](https://www.52pojie.cn/thread-2135267-1-1.html)
