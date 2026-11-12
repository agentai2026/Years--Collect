---
title: "Windows 11 最新更新可能破坏 PowerShell 脚本签名验证"
published: 2026-11-12
description: "微软在 November 月 Patch Tuesday 推送的 Windows 11 更新 KB5132061 中引入了一项安全改进，可能导致旧版 PowerShell 脚本签名"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/windows-11-update-kb5132061-powershell-script-breaking-changes.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/windows-11-update-kb5132061-powershell-script-breaking-changes.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

微软在 November 月 Patch Tuesday 推送的 Windows 11 更新 KB5132061 中引入了一项安全改进，可能导致旧版 PowerShell 脚本签名验证失败。

![](https://cdn.neowin.com/news/images/uploaded/2026/11/1794453202_powershell_full.webp)

### **更新变更内容**

根据 KB5132061 发布说明，微软加强了 PowerShell 脚本签名和签名验证的文本编码验证机制。此前能够通过的脚本，如果包含无效的文本编码，现在可能会被 Windows 拒绝签名。

![](https://cdn.neowin.com/news/images/uploaded/2026/11/1794453202_powershell_story.webp)

### **受影响的脚本类型**

此更新主要影响包含无效文本编码的脚本，尤其是格式错误的 UTF-8 文件。更新前 Windows 可在解码过程中替换某些非法字符，但现在系统会明确拒绝格式错误的 UTF-8 编码。

### **错误表现示例**

运行 Get-AuthenticodeSignature 命令时，受影响脚本可能返回 NotSigned 状态，即使之前已成功签名。尝试使用 Set-AuthenticodeSignature 修复问题文件也可能产生错误提示。

### **官方修复方案**

微软已发布支持文档说明处理受影响脚本的方法。建议将脚本保存为带有 BOM（字节顺序标记）的有效 UTF-8 编码，检查内容后重新签名。

### **PowerShell 修复工具**

为便于批量处理，微软提供了 PowerShell 修复工具。该工具可扫描文件的编码问题并尝试自动修复，同时保留现有签名。但微软警告并非所有脚本都能通过自动方式修复。

### **适用系统范围**

此更改不仅限于 Windows 11，微软的指导文档同样涵盖 Windows 10 Enterprise LTSC 2021 以及 Windows Server 2025 等多个服务器版本。

via [Neowin](https://www.neowin.net/news/latest-windows-11-update-kb5132061-could-break-your-powershell-scripts/)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/windows-11-update-kb5132061-powershell-script-breaking-changes.html) | [添加评论](https://windiscover.com/posts/windows-11-update-kb5132061-powershell-script-breaking-changes.html#comments)

[Windows 11 最新更新可能破坏 PowerShell 脚本签名验证](https://windiscover.com/posts/windows-11-update-kb5132061-powershell-script-breaking-changes.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/windows-11-update-kb5132061-powershell-script-breaking-changes.html)
