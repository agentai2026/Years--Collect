---
title: "Windows 11 26H2 配合 Rufus 安装技巧 内存占用降至 2.5GB"
published: 2026-10-11
description: "微软表示正在优化 Windows 11 的内存使用体验，主要针对配备 8GB 或更多 RAM 的系统。用户在部署 Windows 11 版本 26H2 时采用第三方安装工具 Ruf"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/windows-11-26h2-rufus-installation-low-ram-usage.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/windows-11-26h2-rufus-installation-low-ram-usage.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

微软表示正在优化 Windows 11 的内存使用体验，主要针对配备 8GB 或更多 RAM 的系统。用户在部署 Windows 11 版本 26H2 时采用第三方安装工具 Rufus 的最新功能，发现内存占用显著降低。

一位测试者在一台配备 AMD Ryzen 5 3500 处理器和 16GB DDR4-2133 内存的 PC 上安装 Windows 11 26H2，结果显示系统仅消耗约 2.5GB 内存，同时仍有 2.1GB 用于缓存，整体运行保持流畅。

![](https://cdn.neowin.com/news/images/uploaded/2023/03/1677840430_windows_11_logo.jpg)

### **Rufus 新增优化选项**

Rufus 自版本 4.14 起引入名为”Quality of Life”的新功能，允许在安装过程中禁用 Teams、Outlook、Copilot 等预装微软应用。这些应用在设备启动时会自动运行，消耗大量后台内存资源。

### **实测内存占用表现**

测试中使用 Rufus 最新版本 4.15 完成安装，Task Manager 显示初始内存消耗仅为 2.5GB，远低于常规预期。系统剩余内存以缓存形式留存 2.1GB，保证日常操作响应速度。

![](https://cdn.neowin.com/news/images/uploaded/2026/10/1791664237_rufus_qol_option_bloat_removal_low_ram_use_source_x.webp)

### **系统要求与兼容性说明**

尽管微软强调优化工作主要针对 8GB 及以上内存配置，Windows 11 官方系统要求仍维持最低 4GB RAM 标准。当前版本 26H2 已可通过 Ventoy 等工具绕过硬件限制，但网络及 MSA 账户要求可能无法完全规避。

### **后续更新策略**

Rufus 更新采用累积性质，支持该”Quality of Life”功能的用户可选择任何高于 4.14 的版本。该功能旨在减少预装应用对有限内存资源的占用，提升中低端设备的可用性。

via [Neowin](https://www.neowin.net/news/windows-11-26h2-reportedly-uses-shockingly-low-ram-with-a-rufus-installation-trick/?utm_source=rss)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/windows-11-26h2-rufus-installation-low-ram-usage.html) | [添加评论](https://windiscover.com/posts/windows-11-26h2-rufus-installation-low-ram-usage.html#comments)

[Windows 11 26H2 配合 Rufus 安装技巧 内存占用降至 2.5GB](https://windiscover.com/posts/windows-11-26h2-rufus-installation-low-ram-usage.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/windows-11-26h2-rufus-installation-low-ram-usage.html)
