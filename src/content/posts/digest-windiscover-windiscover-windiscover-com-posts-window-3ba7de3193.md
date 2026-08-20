---
title: "微软修复 Defender 零日漏洞时意外导致病毒扫描崩溃"
published: 2026-08-19
description: "微软近期在修复 Windows Defender 零日漏洞的过程中引入了新的技术故障，导致用户无法正常完成病毒扫描。受影响的 Defender 版本包括 v1.1.26070.7"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/windows-defender-scan-crash-bug.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/windows-defender-scan-crash-bug.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

微软近期在修复 Windows Defender 零日漏洞的过程中引入了新的技术故障，导致用户无法正常完成病毒扫描。受影响的 Defender 版本包括 **v1.1.26070.7** 和 **v1.1.26080.2**，大量用户反馈快速扫描与全盘扫描均在接近完成时崩溃。

![](https://cdn.neowin.com/news/images/uploaded/2026/08/1787120691_neowin_defender_bug_1_story.webp)

### **问题表现与影响范围**

根据 Reddit 用户反馈，安装最新 Windows 安全更新后，Defender 的快速扫描和全盘扫描均受到影响。具体表现为扫描进程在接近完成时崩溃，离线扫描则卡在 **91%** 进度。有趣的是，手动扫描整个驱动器似乎仍可正常工作，表明问题可能与 Defender 处理特定扫描操作的机制有关。

### **错误代码与组件定位**

用户在事件查看器中观察到错误代码 **0x000005**，指向 **mpengine.dll** 文件，该文件属于微软反恶意软件引擎的核心组件。同时，DefenderApiLoggerLowPriv 会话错误也在事件查看器中持续出现数日。安全情报更新版本 **1.457.222.0** 至 **1.457.230.0** 均被确认存在此问题。

### **临时解决方案**

ESET 研究员 Aryeh Goretsky 指出，通过系统还原至之前的 Defender 版本可解决该问题，进一步证实近期更新是故障根源。目前微软尚未就此问题发布官方确认声明，但预计将在近期推出修复更新。

via [Neowin](https://www.neowin.net/news/microsoft-totally-breaks-windows-defender-virus-scans-in-trying-to-fix-a-0-day-flaw/)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/windows-defender-scan-crash-bug.html) | [添加评论](https://windiscover.com/posts/windows-defender-scan-crash-bug.html#comments)

[微软修复 Defender 零日漏洞时意外导致病毒扫描崩溃](https://windiscover.com/posts/windows-defender-scan-crash-bug.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/windows-defender-scan-crash-bug.html)
