---
title: "微软确认 Windows Server 2028 将移除多项传统功能"
published: 2026-11-28
description: "微软已公布 Windows Server 2028 正式版本将移除的多项旧有功能清单，涵盖网络服务、安全配置及传统组件等多个方面。 网络协议与远程访问服务移除 服务器版本将不再支持"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/microsoft-windows-server-2028-remove-features-list.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/microsoft-windows-server-2028-remove-features-list.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

微软已公布 Windows Server 2028 正式版本将移除的多项旧有功能清单，涵盖网络服务、安全配置及传统组件等多个方面。

![](https://cdn.neowin.com/news/images/uploaded/2026/11/1794943028_image_26a47397_full.webp)

### **网络协议与远程访问服务移除**

服务器版本将不再支持 **Windows Internet Name Service (WINS)**、**DirectAccess**、**PPTP/L2TP** 远程访问协议以及 **SMBv1** 文件共享版本。管理员需迁移至 DNS 解析、Always On VPN、IKEv2/SSTP 协议或 SMBv2/v3 替代方案。

![](https://cdn.neowin.com/news/images/uploaded/2026/11/1794943028_image_26a47397_story.webp)

### **管理与脚本工具更新**

系统删除了 **VBScript** 引擎与 **WMIC** 命令行工具，建议改用 PowerShell 进行脚本管理。WSUS 服务器角色同样被移除，但在早期服务器版本仍受支持。AT Time Service (ATSVC) 及其 at.exe 命令也由任务调度程序取代。

### **固件与支持架构调整**

 legacy BIOS 引导模式将被弃用，仅支持 **UEFI** 启动标准。Hyper-V 虚拟机模板需采用第 2 代配置，MultiPoint Services 服务停止集成，Shielded VMs 由 Trusted VMs 替代。

### **.NET Framework 部署变更**

.NET Framework 3.5 不再预装或作为可选组件提供，需通过独立安装包部署。

![](https://cdn.neowin.com/news/images/uploaded/2026/11/1794943028_image_26a47397_story.webp)

### **实施注意事项**

当前 Windows Server 2028 仍处于预览阶段，部分功能可能临时存在于测试版本中，正式发行前决策仍有调整可能。

![](https://cdn.neowin.com/news/images/uploaded/2026/11/1794943028_image_26a47397_story.webp)

via [Neowin](https://www.neowin.net/news/here-is-the-list-of-features-microsoft-plans-to-remove-from-windows-server-2028/)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/microsoft-windows-server-2028-remove-features-list.html) | [添加评论](https://windiscover.com/posts/microsoft-windows-server-2028-remove-features-list.html#comments)

[微软确认 Windows Server 2028 将移除多项传统功能](https://windiscover.com/posts/microsoft-windows-server-2028-remove-features-list.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/microsoft-windows-server-2028-remove-features-list.html)
