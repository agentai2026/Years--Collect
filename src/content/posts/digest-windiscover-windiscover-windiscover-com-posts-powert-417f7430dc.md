---
title: "微软推送 PowerToys 预览版 v0.101.2282.0，修复 Command Palette 显示问题"
published: 2026-08-17
description: "微软发布 PowerToys 工具最新开发版本 v0.101.2282.0，本次更新聚焦 Command Palette 的稳定性修复与性能优化，同时引入多项底层改进与安全加固。"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/powertoys-preview-v0-101-2282-0-command-palette-fixes.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/powertoys-preview-v0-101-2282-0-command-palette-fixes.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

微软发布 PowerToys 工具最新开发版本 **v0.101.2282.0**，本次更新聚焦 Command Palette 的稳定性修复与性能优化，同时引入多项底层改进与安全加固。

![](https://cdn.neowin.com/news/images/uploaded/2023/06/1685715602_11_story.jpg)

### **Command Palette 核心修复**

本次更新修复了一个关键问题：当用户使用 Win+P 切换显示模式（如连接/断开外接显示器）时，Command Palette 的 Dock 界面可能出现空白或配置错误的情况。此外，更新还优化了 Dock 在刷新时的资源占用，并改进了被替换项目的清理机制。

### **性能与资源优化**

开发团队通过重用视图模型（view models）、合并刷新操作以及清理废弃项目，显著降低了 Command Palette Dock 的资源消耗。这些底层优化使工具运行更加高效。

### **安全与扩展管理改进**

更新修复了扩展安装流程中的一个安全问题：此前失败的扩展包操作（安装、更新、卸载）可能被错误地记录为成功状态，该漏洞现已得到妥善处理。

### **DevDocs 扩展调整**

DevDocs 扩展已从内置组件移至第三方插件目录。该扩展原本为内置功能，开发团队决定将其剥离为可选安装项，用户现可通过插件目录自行发现并安装。

### **获取方式**

该预览版本需从 GitHub 手动下载，提供 x64 与 ARM64 两种架构的 per-user 及 machine-wide 安装包。

via [Neowin](https://www.neowin.net/news/microsoft-pushes-powertoys-preview-v010122820-with-command-palette-fixes/?utm_source=rss)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/powertoys-preview-v0-101-2282-0-command-palette-fixes.html) | [添加评论](https://windiscover.com/posts/powertoys-preview-v0-101-2282-0-command-palette-fixes.html#comments)

[微软推送 PowerToys 预览版 v0.101.2282.0，修复 Command Palette 显示问题](https://windiscover.com/posts/powertoys-preview-v0-101-2282-0-command-palette-fixes.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/powertoys-preview-v0-101-2282-0-command-palette-fixes.html)
