---
title: "微软发布Windows Server OOB热补丁 修复KB5131077导致的网络错误"
published: 2026-11-26
description: "微软今日发布了面向Windows Server 2025系统的新一代带外更新，版本号为KB5138318（OS Build 26100.33732）。该热补丁用于修复前序KB513"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/microsoft-windows-server-oob-hotpatch-kb5138318-fix.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/microsoft-windows-server-oob-hotpatch-kb5138318-fix.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

微软今日发布了面向Windows Server 2025系统的新一代带外更新，版本号为KB5138318（OS Build **26100.33732**）。该热补丁用于修复前序KB5131077热补丁更新引发的问题。

![](https://cdn.neowin.com/news/images/uploaded/2024/02/1708634661_img19_full.jpg)

### **修复范围与技术细节**

微软说明此次更新仅修复一项特定问题：当启用Router Advertisement时，设备可能在与IPv6路由产生冲突后停止运行。官方公告指出，在安装2026年11月Windows安全热补丁（KB5131077）后，部分启用了RA功能并接收时间限定IPv6路由的Windows Server 2025设备，在路由计时器到期时会意外停止，终止代码为 **0x139**（KERNEL_SECURITY_CHECK_FAILURE）。

### **更新获取方式**

用户可以通过Windows Update自动下载并安装此更新，前提是设备已安装基线October KB5126646更新以及SSU版本 **26100.33634** 或更高版本。

### **已知状态说明**

微软表示目前尚未发现KB5138318存在其他已知问题。

via [Neowin](https://www.neowin.net/news/microsoft-outs-windows-server-kb5138318-2610033732-oob-hotpatch-to-fix-kb5131077-bug/)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/microsoft-windows-server-oob-hotpatch-kb5138318-fix.html) | [添加评论](https://windiscover.com/posts/microsoft-windows-server-oob-hotpatch-kb5138318-fix.html#comments)

[微软发布Windows Server OOB热补丁 修复KB5131077导致的网络错误](https://windiscover.com/posts/microsoft-windows-server-oob-hotpatch-kb5138318-fix.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/microsoft-windows-server-oob-hotpatch-kb5138318-fix.html)
