---
title: "加拿大时区变更致 Microsoft 软件问题 IT 管理员反应激烈"
published: 2026-11-02
description: "加拿大部分地区于 2026 年 11 月 1 日停止实行夏令时，这一系统级时区变更导致 Microsoft Outlook 和 Exchange 等软件出现兼容性问题，引发 IT"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/canada-timezone-changes-outlook-exchange-admin-issues.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/canada-timezone-changes-outlook-exchange-admin-issues.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

加拿大部分地区于 2026 年 11 月 1 日停止实行夏令时，这一系统级时区变更导致 Microsoft Outlook 和 Exchange 等软件出现兼容性问题，引发 IT 管理员群体强烈不满。

### **受影响地区与UTC偏移量**

不实行夏令时的地区包括 British Columbia、Alberta 和 Manitoba 三省，以及部分 Northwest Territories（含 Yellowknife 和 Inuvik）与 Northwestern Ontario。这些区域将分别保持在 UTC-07:00、UTC-06:00 和 UTC-05:00 的时区不变。

![](https://cdn.neowin.com/news/images/uploaded/2024/11/1730561448_outlook_broken.jpg)

### **Outlook 日历事件迁移故障**

最严重的困扰来自 Outlook 和 Exchange Online。现有日历事件不会自动迁移到新时区，用户必须逐一审查并更新即将到来的会议，尤其是跨越 11 月 1 日后的重复性会议。根据 r/sysadmin 论坛一位管理员披露，有机构使用约 900 行的 PowerShell 脚本批量修改组织内日历事件的时区设置。

### **Microsoft 修复计划与支持文档**

微软已确认 Outlook 日历事件无法自动迁移，正在开发 Exchange Online PowerShell cmdlet 以协助管理员修正非重复性会议。该工具预计于 11 月 4 日发布。针对重复性会议的解决方案仍在开发中，尚未确定具体发布时间。官方支持文档同时列出受影响的组件包括 Teams Auto Attendant、SharePoint On-Prem、Power Automate、Fabric 和 Dynamics 365 Finance and Operations。

### **服务器与环境适配挑战**

多个企业报告需将 Windows 服务器、Linux 服务器、PostgreSQL 数据库和管理桌面切换至替代时区以维持一致性。另有管理员反映 Outlook 的工作时间设置影响空闲/忙碌日历可见性。Teams Rooms 设备显示时间落后 Windows 一小时，要求升级 Edge 和 WebView2 浏览器内核。

via [Neowin](https://www.neowin.net/news/admins-absolutely-furious-with-microsoft-due-to-canada-time-zone-changes/)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/canada-timezone-changes-outlook-exchange-admin-issues.html) | [添加评论](https://windiscover.com/posts/canada-timezone-changes-outlook-exchange-admin-issues.html#comments)

[加拿大时区变更致 Microsoft 软件问题 IT 管理员反应激烈](https://windiscover.com/posts/canada-timezone-changes-outlook-exchange-admin-issues.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/canada-timezone-changes-outlook-exchange-admin-issues.html)
