---
title: "微软警告 Exchange Online 管理员检查 PowerShell 脚本 以防属性弃用引发故障"
published: 2026-11-15
description: "微软提醒 Exchange Online 管理员需在属性被弃用前检查其 PowerShell 脚本配置，避免因命令行工具特性变更导致自动化流程中断。 属性弃用时间表 自 2026"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/microsoft-exchange-online-powershell-script-warning.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/microsoft-exchange-online-powershell-script-warning.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

微软提醒 Exchange Online 管理员需在属性被弃用前检查其 PowerShell 脚本配置，避免因命令行工具特性变更导致自动化流程中断。

![](https://cdn.neowin.com/news/images/uploaded/2026/03/1774333271_depositphotos_587737484_l_full.webp)

### **属性弃用时间表**

自 **2026 年 11 月 15 日** 起，Get-Mailbox -Migration 与 New-Mailbox -Migration 命令将停止返回受影响属性。随后在 **2026 年 12 月 15 日** 生效时，相关属性将在迁移场景中被完全禁止配置。

### **影响范围与排查方向**

需重点审查依赖 Get-Mailbox -Migration、Set-Mailbox -Migration 等命令的脚本与集成系统。任何固定期望返回值或引用已弃用参数的自动化工具均可能失效。

![](https://cdn.neowin.com/news/images/uploaded/2026/03/1774333271_depositphotos_587737484_l_story.webp)

### **处置建议与支持路径**

未使用受影响属性的工作流无需操作。若业务必需该属性，管理员需联系微软技术支持并提供具体参数、命令及影响场景说明。

via [Neowin](https://www.neowin.net/news/exchange-online-administrators-warned-to-check-powershell-scripts-before-property-removals/)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/microsoft-exchange-online-powershell-script-warning.html) | [添加评论](https://windiscover.com/posts/microsoft-exchange-online-powershell-script-warning.html#comments)

[微软警告 Exchange Online 管理员检查 PowerShell 脚本 以防属性弃用引发故障](https://windiscover.com/posts/microsoft-exchange-online-powershell-script-warning.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/microsoft-exchange-online-powershell-script-warning.html)
