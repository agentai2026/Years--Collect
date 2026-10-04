---
title: "RemoveWindowsAI 脚本导致 Windows 11 文件资源管理器界面损坏"
published: 2026-10-03
description: "第三方清理工具 RemoveWindowsAI 在安装后可能破坏 Windows 11 的文件资源管理器界面，尤其是在系统更新后会出现异常。该问题已在 GitHub bug 报告中"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/removewindowsai-update-script-breaks-windows-explorer-ui.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/removewindowsai-update-script-breaks-windows-explorer-ui.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

第三方清理工具 RemoveWindowsAI 在安装后可能破坏 Windows 11 的文件资源管理器界面，尤其是在系统更新后会出现异常。该问题已在 GitHub bug 报告中详细记录，影响了运行 Windows 11 25H2 的用户群体。

![](https://cdn.neowin.com/news/images/uploaded/2026/10/1791035328_no-copilot_story.webp)

### **问题背景与触发机制**

RemoveWindowsAI 是一款允许用户从 Windows 11 中移除 AI 功能的第三方工具。安装后，该系统会部署静态更新清理脚本。当用户在 Windows 11 更新至较新版本时，这些遗留脚本可能与新系统产生冲突。

### **受影响的具体版本**

受影响的设备为运行 Windows 11 25H2 x64 架构的机器，从 build **26200.9457** 更新至 **26200.9550** 时出现问题。已发现的残留项包括 ProgramData 清理脚本、用户配置文件、HKLM 注册表键值以及名为 RemoveAI-UpdateCleanupChecker 的计划任务。

### **症状表现**

受影响的设备可能出现向经典 Windows 10 风格 File Explorer 回退、核心 AI 组件缺失等问题。在 Windows 系统更新期间还可能意外执行旧版包移除逻辑，导致功能异常。

### **临时修复方案**

开发者 wallowp2p 在其 GitHub 报告 thread 中提供了恢复步骤：首先禁用 RemoveAI-UpdateCleanupChecker 计划任务；其次将 HKLM\SYSTEM\CurrentControlSet\Control\FeatureManagement\Overrides\8\1561856655 EnabledState 设置为 **1**；然后重启系统；最后安装补丁 KB5124010。

### **安全警示与建议**

此 bug 的存在凸显了使用第三方程序修改 Windows 11 的风险。开发团队建议用户不要在一台用于关键任务的设备上使用此类工具，以免出现不可逆的系统损坏。虽然报告中提出了可能的长期修复方向，但在官方支持前仍需谨慎操作。

via [Neowin](https://www.neowin.net/news/removewindowsai-update-script-breaks-windows-11-file-explorer-ui/?utm_source=rss)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/removewindowsai-update-script-breaks-windows-explorer-ui.html) | [添加评论](https://windiscover.com/posts/removewindowsai-update-script-breaks-windows-explorer-ui.html#comments)

[RemoveWindowsAI 脚本导致 Windows 11 文件资源管理器界面损坏](https://windiscover.com/posts/removewindowsai-update-script-breaks-windows-explorer-ui.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/removewindowsai-update-script-breaks-windows-explorer-ui.html)
