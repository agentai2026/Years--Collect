---
title: "微软公布 Exchange Online EWS 停用应急方案 IT 管理员可临时恢复连接"
published: 2026-10-22
description: "微软已发布最新 advisory，说明 Exchange Online 应用程序在 EWS 协议关闭后如何临时恢复功能。IT 管理员可通过管理控制台或 PowerShell 指令启"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/exchange-online-ews-emergency-solutions-for-it-admins.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/exchange-online-ews-emergency-solutions-for-it-admins.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

微软已发布最新 advisory，说明 Exchange Online 应用程序在 EWS 协议关闭后如何临时恢复功能。IT 管理员可通过管理控制台或 PowerShell 指令启用被禁用的服务，但该方案仅适用于特定时间窗口。

### **紧急恢复操作指引**

收到消息中心关于 EWS 停用的通知后，管理员可选择在 Microsoft 365 管理中心页面取消勾选组织范围的 EWS 访问阻止设置。更改生效时间通常为 **1-4 小时**，此操作将暂时解除对现有应用的限制。

![](https://cdn.neowin.com/news/images/uploaded/2025/08/1755024379_1280x720-ghost-white-solid-color-background-fotor-20250812234553_story.webp)

### **PowerShell 高级控制方案**

对于需要精细权限管理的场景，推荐使用 Exchange Online PowerShell 模块执行 Get-OrganizationConfig 命令检测当前状态。若返回 disabled 状态，运行 Set-OrganizationConfig -EWSEnabled $true 即可重新激活服务。

### **临时方案的时效限制**

微软强调该应急方案有效期截止至 **2027 年 4 月**。此后必须完成应用层级的 EWS 依赖迁移，否则受影响应用将持续无法正常工作。

h3>

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/exchange-online-ews-emergency-solutions-for-it-admins.html) | [添加评论](https://windiscover.com/posts/exchange-online-ews-emergency-solutions-for-it-admins.html#comments)

[微软公布 Exchange Online EWS 停用应急方案 IT 管理员可临时恢复连接](https://windiscover.com/posts/exchange-online-ews-emergency-solutions-for-it-admins.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/exchange-online-ews-emergency-solutions-for-it-admins.html)
