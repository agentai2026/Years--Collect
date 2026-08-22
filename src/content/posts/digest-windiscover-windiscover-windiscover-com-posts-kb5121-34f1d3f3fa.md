---
title: "微软确认 KB5121003 更新导致 RGB 设备引发 Windows 11 崩溃与重启"
published: 2026-08-22
description: "微软确认 Windows 11 最新补丁 KB5121003 与部分 RGB 照明设备存在兼容性问题，可能导致游戏崩溃、系统无响应或意外重启。该问题与名为 inpoutx64 的驱"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/kb5121003-rgb-windows-11-crash-issue.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/kb5121003-rgb-windows-11-crash-issue.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

微软确认 Windows 11 最新补丁 **KB5121003** 与部分 RGB 照明设备存在兼容性问题，可能导致游戏崩溃、系统无响应或意外重启。该问题与名为 **inpoutx64** 的驱动文件相关，目前微软尚未发布永久修复方案。

![](https://cdn.neowin.com/news/images/uploaded/2023/02/1676020207_windows_11_rgb_story.jpg)

### **问题表现与影响范围**

受影响的设备包括带有 RGB 灯效的外设或内部组件，这些设备可能安装了文件名类似 **inpoutx64** 的驱动程序。微软表示，当受影响的游戏启动时，系统可能出现以下症状：游戏无响应、意外关闭、弹出 **EXCEPTION_ACCESS_VIOLATION** 错误，或在更严重的情况下导致整机重启。

### **已知受影响的游戏**

根据用户反馈，目前已确认受到影响的游戏包括：**ARC Raiders**、**MARVEL Tōkon: Fighting Souls** 以及 **THE FINALS**。微软正在持续调查以确定 RGB 组件与触发问题的游戏之间的具体关联机制。

### **临时解决方案**

THE FINALS 开发团队已针对该问题发布技术支持公告，确认 **inpoutx64.sys** 驱动文件在 KB5121003 更新后发生了变化。该团队提供了一个临时解决方案：停止并删除 **inpoutx64** 服务，从 Windows 驱动文件夹中移除对应的 **inpoutx64.sys** 文件，并可选择清理相关注册表项。

### **后续修复计划**

微软目前仍在持续调查该问题，尚未确认具体哪款 RGB 设备或软件包为根本原因，也未提供官方补丁。微软建议受影响用户通过反馈渠道提交问题详情，以便加速排查和修复进程。

via [Neowin](https://www.neowin.net/news/kb5121003-microsoft-confirms-rgb-triggers-windows-11-to-unexpectedly-restart-and-crash/)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/kb5121003-rgb-windows-11-crash-issue.html) | [添加评论](https://windiscover.com/posts/kb5121003-rgb-windows-11-crash-issue.html#comments)

[微软确认 KB5121003 更新导致 RGB 设备引发 Windows 11 崩溃与重启](https://windiscover.com/posts/kb5121003-rgb-windows-11-crash-issue.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/kb5121003-rgb-windows-11-crash-issue.html)
