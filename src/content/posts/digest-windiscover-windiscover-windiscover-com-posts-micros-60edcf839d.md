---
title: "微软即将推出 Windows 11 管理员保护功能"
published: 2026-09-12
description: "微软正在推进 Windows 11 的安全改进计划，即将正式推出一项名为「管理员保护」(Administrator Protection) 的功能。此前该功能经历了多次延期，现在预"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/microsoft-windows-11-administrator-protection-release.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/microsoft-windows-11-administrator-protection-release.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

微软正在推进 Windows 11 的安全改进计划，即将正式推出一项名为「管理员保护」(Administrator Protection) 的功能。此前该功能经历了多次延期，现在预计将随 Windows 11 版本 26H2 正式向公众开放。

![](https://cdn.neowin.com/news/images/uploaded/2025/02/1738778171_windows_11_story.jpg)

### **功能背景与发布时间线**

早在 2024 年末，微软便开始测试名为管理员保护的新安全特性，并在后续数月内逐步增强其功能。该功能曾在 Insider Preview 预览版中推出，但在去年意外被取消发布。近期，随着可选的 2026 年 8 月预览更新（KB5120998）的推送，微软开始重新引入此功能。最新的 Release Preview 版本 KB5124006（构建号 28000.3079）也已包含此项能力，标志着功能已接近最终发布状态。

### **安全机制与技术原理**

管理员保护是一项原生安全功能，为非特权用户在需要时提供即时管理权限。传统的权限提升 (EoP) 攻击途径一旦被普通用户掌握可能带来严重风险，而管理员保护通过要求请求者必须通过 Windows Hello 进行身份验证来规避这一风险。当认证成功后，系统会生成一个隐藏的、独立于用户配置文件的临时账户，并创建隔离的管理员令牌提供给请求进程。进程结束后，该令牌会被立即销毁。这意味着，如果一个应用持续需要提升后的访问权限和特权，它可能无法按预期工作。

### **部署方式与默认设置**

值得注意的是，在最近几次发布中，管理员保护仍然处于禁用状态，需要通过自定义 OMA-URI 手动启用。两种预览方法包括 Intune 设置目录和 Windows 设置，标准方法则是 CSP 和组策略对象 (GPO)。微软强调，管理员保护并非「正式安全边界」，而是通过配置文件分离强化安全基础设施，以抵御 EoP 漏洞利用。

### **IT 管理与用户体验影响**

微软认为，这种安全模型在保证高度安全性的同时提供了灵活的用户控制能力，使原本无特权的用户能够在需要时允许受信任且授权的应用以更高权限状态运行。它也减轻了 IT 管理员手动配置这些特权的工作负担，使其不需要基于临时需求进行人工调配。

via [Neowin](https://www.neowin.net/news/microsoft-is-finally-getting-ready-to-release-administrator-protection-in-windows-11/?utm_source=rss)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/microsoft-windows-11-administrator-protection-release.html) | [添加评论](https://windiscover.com/posts/microsoft-windows-11-administrator-protection-release.html#comments)

[微软即将推出 Windows 11 管理员保护功能](https://windiscover.com/posts/microsoft-windows-11-administrator-protection-release.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/microsoft-windows-11-administrator-protection-release.html)
