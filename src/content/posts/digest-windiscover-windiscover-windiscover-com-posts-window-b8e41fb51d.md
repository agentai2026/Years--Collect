---
title: "Windows Server 2028 将移除默认 WoW64 支持，改为通过 FOD 提供"
published: 2026-11-23
description: "微软在 Ignite 2026 大会上宣布，Windows Server 2028 将不再默认内置 WoW64 子系统，32 位应用程序将无法直接运行。不过，管理员仍可通过 Fea"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/windows-server-2028-dropping-32-bit-app-support-woy64-fod.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/windows-server-2028-dropping-32-bit-app-support-woy64-fod.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

微软在 Ignite 2026 大会上宣布，Windows Server 2028 将不再默认内置 WoW64 子系统，32 位应用程序将无法直接运行。不过，管理员仍可通过 Features On Demand 功能按需启用此兼容性层。

![](https://cdn.neowin.com/news/images/uploaded/2026/11/1794943028_image_26a47397_full.webp)

### **WoW64 子系统变更**

自 **Windows Server 2008 R2**（2009 年发布）以来，Windows Server 一直只提供 64 位版本，通过 WoW64 兼容性层运行 32 位应用。从 Windows Server 2028 开始，微软将移除该子系统默认配置，导致 32 位应用开箱后无法执行。

### **FOD 启用方式**

虽然默认状态被禁用，但管理员仍可通过 Features On Demand（FOD）机制手动启用 WoW64 支持。这提供了灵活性，允许组织根据实际需求决定是否保留 32 位兼容性。

### **安全考量**

微软解释此次变更的主要原因是减少攻击面。程序经理 Elden Christensen 表示，移除 WoW64 可以限制 32 位恶意软件在系统中的运行能力，从而提升整体安全性。 “32 位恶意软件将无法在 Windows Server 2028 上运行”。

### **适用范围说明**

此项变更仅适用于 Windows Server 2028 及其后续版本，目前不会对 Windows 10 和 Windows 11 等客户端操作系统产生影响。微软似乎认为短期内不会对客户端版本实施相同策略，但未来存在进一步移除可能性的空间。

via [Neowin](https://www.neowin.net/news/windows-server-2028-dropping-support-for-32-bit-apps-wow64-will-be-available-as-fod/)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/windows-server-2028-dropping-32-bit-app-support-woy64-fod.html) | [添加评论](https://windiscover.com/posts/windows-server-2028-dropping-32-bit-app-support-woy64-fod.html#comments)

[Windows Server 2028 将移除默认 WoW64 支持，改为通过 FOD 提供](https://windiscover.com/posts/windows-server-2028-dropping-32-bit-app-support-woy64-fod.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/windows-server-2028-dropping-32-bit-app-support-woy64-fod.html)
