---
title: "微软发布 Windows 11 KB5124008 补丁修复域名解析错误"
published: 2026-09-17
description: "微软向 Windows 11 用户推送了最新累计更新 KB5124008，此次更新主要修复了与 DNS 缓存机制相关的网络连接故障。该问题可能导致部分应用无法访问互联网资源。 DN"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/microsoft-windows-11-kb5124008-domain-bug-fix.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/microsoft-windows-11-kb5124008-domain-bug-fix.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

微软向 Windows 11 用户推送了最新累计更新 KB5124008，此次更新主要修复了与 DNS 缓存机制相关的网络连接故障。该问题可能导致部分应用无法访问互联网资源。

![](https://storage.neowin.net/images/articles/windows-update-patch.jpg)

### **DNS 缓存错误修复**

本次更新修正了系统在处理 DNS 查询请求时出现的缓冲区溢出漏洞。当设备尝试解析域名地址时，旧的代码逻辑可能引发短暂的网络中断，尤其在频繁切换 Wi-Fi 网络的场景下更为明显。

### **影响范围与修复方案**

受影响的设备主要为运行 Windows 11 22H2 和 23H2 版本的终端。修复措施通过调整网络协议栈内核模块实现，现已集成至 **KB5124008** 补丁中，用户可通过 Windows Update 手动下载安装。

### **后续优化计划**

微软表示将继续监测网络模块稳定性，并计划在 2025 年第二季度推出更彻底的解决方案。目前建议受影响用户在连接公共 Wi-Fi 时暂时禁用自动重连功能。

via [Neowin](https://www.neowin.net/news/microsoft-issues-manual-fix-for-windows-11-kb5124008-domain-bug/?utm_source=rss)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/microsoft-windows-11-kb5124008-domain-bug-fix.html) | [添加评论](https://windiscover.com/posts/microsoft-windows-11-kb5124008-domain-bug-fix.html#comments)

[微软发布 Windows 11 KB5124008 补丁修复域名解析错误](https://windiscover.com/posts/microsoft-windows-11-kb5124008-domain-bug-fix.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/microsoft-windows-11-kb5124008-domain-bug-fix.html)
