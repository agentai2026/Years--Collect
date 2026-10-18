---
title: "Windows 11 KB5127648更新导致智能应用控制功能失效"
published: 2026-10-18
description: "微软发布的Windows 11 KB5127648 October 2026 Patch Tuesday更新在优化系统性能的同时引发多项异常。本次更新导致企业网络认证功能失效，同时"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/kb5127648-smart-app-control-failure.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/kb5127648-smart-app-control-failure.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

微软发布的Windows 11 KB5127648 October 2026 Patch Tuesday更新在优化系统性能的同时引发多项异常。本次更新导致企业网络认证功能失效，同时使部分设备的Smart App Control选项被灰色化禁用。

### **更新异常与安装问题**

通过Windows Update或ISO安装的KB5127648更新存在多个已知错误代码，包括**0x800f0845**、**0x80070306**和**0x800f0989**。更新破坏了一个重要的企业网络认证功能，微软已确认该问题并提供临时解决方案。

![](https://cdn.neowin.com/news/images/uploaded/2026/06/1781504609_windows_11_patch_tuesday__bug_neowin_1_story.webp)

### **Smart App Control功能故障**

Smart App Control原本用于提升弱CPU设备性能，通过在后台拦截恶意应用减少CPU负担。更新后部分设备启用选项变灰，尽管微软已移除强制干净安装要求超过一年。

### **Registry修复方案**

管理员需以管理员身份运行命令提示符执行以下注册表修改：

reg add “HKLM\SYSTEM\CurrentControlSet\Policies\Microsoft\FeatureManagement\Overrides” /v **2883193997** /t REG_DWORD /d **1** /f

reg add “HKLM\SYSTEM\CurrentControlSet\Policies\Microsoft\FeatureManagement\Overrides” /v **2850574478** /t REG_DWORD /d **1** /f

重启后检查Smart App Control选项是否恢复可用。

### **组策略修复方法**

适用于Windows 11 **24H2**、**25H2**和**26H2**版本的组策略文件：

- [KB5074105 261015_19222 Feature Preview](https://download.microsoft.com/download/0a6cd6b8-5238-4129-bf2f-9d2a1edde053/Windows%2011%2024H2%2c%20Windows%2011%2025H2%20and%20Windows%20Server%202025%20KB5074105%20261015_19222%20Feature%20Preview.msi)

- [KB5074105 261015_19221 Feature Preview](https://download.microsoft.com/download/b0e50eea-931f-49e9-be90-6d6268e94721/Windows%2011%2024H2%2c%20Windows%2011%2025H2%20and%20Windows%20Server%202025%20KB5074105%20261015_19221%20Feature%20Preview.msi)

需将两项策略设置设为Enabled状态后再重启设备。

via [Neowin](https://www.neowin.net/news/kb5127648-microsoft-breaks-windows-11-exclusive-feature-that-helps-weak-pcs-perform-better/)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/kb5127648-smart-app-control-failure.html) | [添加评论](https://windiscover.com/posts/kb5127648-smart-app-control-failure.html#comments)

[Windows 11 KB5127648更新导致智能应用控制功能失效](https://windiscover.com/posts/kb5127648-smart-app-control-failure.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/kb5127648-smart-app-control-failure.html)
