---
title: "如何使用 ViVeTool 在 Windows 11 中启用新搜索体验"
published: 2026-11-23
description: "微软为 Windows 11 推出了全新的搜索体验设计，完全重做了外观和功能。新版搜索可作为智能体直接修改 PC 设置，无需手动点击。目前该功能已纳入最新累积预览更新 KB5132"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/windows-11-new-search-experience-vivetool.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/windows-11-new-search-experience-vivetool.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

微软为 Windows 11 推出了全新的搜索体验设计，完全重做了外观和功能。新版搜索可作为智能体直接修改 PC 设置，无需手动点击。目前该功能已纳入最新累积预览更新 KB5132057，面向普通用户逐步推送。

如需提前启用，可通过 ViVeTool 工具手动激活隐藏功能。

![](https://cdn.neowin.com/news/images/uploaded/2026/11/1795194831_windows_11_search_experience_new_full.webp)

### **新功能概述与推送进度**

新版搜索体验于 2025 年 10 月首次宣布，目前已正式成为最新累积预览更新的一部分，开始向常规 Windows 11 用户推送。然而安装更新并不保证立即获得新界面，因为微软采用渐进式发布策略。

### **ViVeTool 手动启用方法**

首先从 GitHub 下载 ViVeTool 并解压归档文件。将文件放置于 C:\ViVeTool 目录，以管理员身份打开 Windows Terminal 或 PowerShell，输入以下命令导航至 ViVeTool 文件夹：

cd C:\ViVeTool

随后输入启用新搜索体验的命令：

.**\**ViVeTool.exe /enable /id:**58381341**

![](https://cdn.neowin.com/news/images/uploaded/2026/11/1795194460_search_experience_vivetool_story.webp)

命令执行完成后重启电脑，即可按下 Windows + S 或点击任务栏搜索按钮查看新界面是否出现。

### **其他功能 ID 备选方案**

如果仍未看到新搜索界面，可尝试启用与 redesign 关联的额外功能 ID：

.**\**ViVeTool.exe /enable /id:**58381341,59210771,59210767**

再次重启系统应用更改。若仍不成功，另有针对早期 Insider 版本的组合报告：

.**\**ViVeTool.exe /enable /id:**59210771,57259990,58381341,59210767**

![](https://cdn.neowin.com/news/images/uploaded/2026/11/1795194409_windows_11_search_experience_2_story.webp)

### **注意事项**

上述功能 ID 虽与新搜索体验关联，但尚未在所有支持的 Windows 11 构建上独立验证。新版搜索初始仅提供英文版本，其他语言用户可能暂时无法访问。启用界面也不意味着所有新功能立即可用。

via [Neowin](https://www.neowin.net/guides/how-to-enable-the-new-search-experience-in-windows-11-with-vivetool/)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/windows-11-new-search-experience-vivetool.html) | [添加评论](https://windiscover.com/posts/windows-11-new-search-experience-vivetool.html#comments)

[如何使用 ViVeTool 在 Windows 11 中启用新搜索体验](https://windiscover.com/posts/windows-11-new-search-experience-vivetool.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/windows-11-new-search-experience-vivetool.html)
