---
title: "如何在 Windows 11 中使用 ViVeTool 启用新版右键菜单"
published: 2026-10-20
description: "微软正在向 Windows 11 正式版推送全新设计的右键上下文菜单功能，该体验此前仅在预览版系统开放。用户可通过第三方工具 ViVeTool 提前尝试已发布的界面改进。 功能背景"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/windows-11-vivetool-context-menu-enable.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/windows-11-vivetool-context-menu-enable.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

微软正在向 Windows 11 正式版推送全新设计的右键上下文菜单功能，该体验此前仅在预览版系统开放。用户可通过第三方工具 ViVeTool 提前尝试已发布的界面改进。

### **功能背景与可用性**

新版右键菜单是 Windows 11 过去几个月最受期待的变化之一，微软对其进行了彻底重构以解决用户对传统菜单的不满。尽管该功能已在 Windows 11 Release Preview 构建版本 **26200.9807** 和 **26300.9807** 中随更新推送，但由于采用渐进式发布策略，普通用户可能需要等待较长时间才能自动获得更新。

![](https://cdn.neowin.com/news/images/uploaded/2026/10/1792412865_context_menu_windows_11_story.webp)

### **启用方法与操作步骤**

用户可以通过以下步骤提前启用新功能：首先从 GitHub 下载最新版的 ViVeTool 并解压至任意目录（例如 **C:\ViVeTool**），随后以管理员身份打开终端并进入该文件夹执行命令。微软建议使用最简单的功能 ID 启动：**.\ViVeTool.exe /enable /id:60813048**，完成后重启电脑验证效果。

### **多组合配置方案**

部分用户在单个 ID 无效时可能需要额外参数。在测试中发现，对于 Build **26300.9711**，需在命令中添加第二个 ID：**.\ViVeTool.exe /enable /id:49453572,60813048**。若仍无反应，可尝试三 ID 组合方案：**.\ViVeTool.exe /enable /id:49453572,60813048,61934903**。

### **风险提示与后续计划**

由于功能仍处于实验阶段，未来系统构建可能会调整所需 ID 导致方法失效。目前 ViVeTool 方案可作为预览窗口使用，微软团队表示将根据实际情况持续优化正式版推送策略。

via [Neowin](https://www.neowin.net/guides/how-to-enable-the-new-context-menu-in-windows-11-with-vivetool/)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/windows-11-vivetool-context-menu-enable.html) | [添加评论](https://windiscover.com/posts/windows-11-vivetool-context-menu-enable.html#comments)

[如何在 Windows 11 中使用 ViVeTool 启用新版右键菜单](https://windiscover.com/posts/windows-11-vivetool-context-menu-enable.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/windows-11-vivetool-context-menu-enable.html)
