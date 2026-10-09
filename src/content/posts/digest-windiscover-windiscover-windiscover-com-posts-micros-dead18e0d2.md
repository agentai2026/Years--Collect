---
title: "微软警告 IT 管理员需更新 Windows PC，否则将失去 Windows Update 服务访问权限"
published: 2026-10-09
description: "微软向企业 IT 管理员发布紧急通知，要求尽快更新受影响的 Windows 10 与 Windows Server 老旧版本设备。若未及时应用补丁，这些设备将无法连接 Window"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/microsoft-warns-it-admins-update-windows-pcs-lose-access-to-windows-update-services.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/microsoft-warns-it-admins-update-windows-pcs-lose-access-to-windows-update-services.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

微软向企业 IT 管理员发布紧急通知，要求尽快更新受影响的 Windows 10 与 Windows Server 老旧版本设备。若未及时应用补丁，这些设备将无法连接 Windows Update 服务器获取安全更新。

![](https://cdn.neowin.com/news/images/uploaded/2022/10/1665931468_screenshot_(29)_(1)_story.jpg)

### **证书轮换机制触发原因**

Windows Update 依赖基于证书的信任机制验证更新服务器的安全性。当预装在系统中的数字证书到期后，老旧版本的系统将无法正常接收更新指令。

### **受影响版本与操作指南**

微软列出了具体处理方案：

- Windows 11 25H2 及后续版本：无需操作

- Windows 11 24H2 和 Windows Server 2025：需在 **2027 年 6 月 19 日**前安装 2025 年 9 月的安全更新

- 其他支持中的 Windows 11 版本及 Windows Server 2022：需在 **2027 年 6 月 19 日**前安装 2026 年 7 月的安全更新

- Windows 10 LTSC 2019/2016 企业版：需在 **2027 年 5 月 17 日**前完成更新

### **长期服务频道设备处理方案**

LTSC/LTSB 分支设备必须通过 Microsoft Update Catalog 手动应用补丁。运行不支持版本的设备需升级至 Windows 11 或最新企业版系统，否则将永久丧失更新服务能力。

### **WSUS 例外情况**

使用 Windows Server Update Services (WSUS) 部署更新的计算机不受此影响，但仍建议同步调整更新策略以匹配新证书周期。

via [Neowin](https://www.neowin.net/news/microsoft-warns-it-admins-to-update-windows-pcs-or-lose-access-to-windows-update-services/?utm_source=rss)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/microsoft-warns-it-admins-update-windows-pcs-lose-access-to-windows-update-services.html) | [添加评论](https://windiscover.com/posts/microsoft-warns-it-admins-update-windows-pcs-lose-access-to-windows-update-services.html#comments)

[微软警告 IT 管理员需更新 Windows PC，否则将失去 Windows Update 服务访问权限](https://windiscover.com/posts/microsoft-warns-it-admins-update-windows-pcs-lose-access-to-windows-update-services.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/microsoft-warns-it-admins-update-windows-pcs-lose-access-to-windows-update-services.html)
