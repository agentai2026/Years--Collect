---
title: "微软确认七月漏洞导致 Entra 数据泄露"
published: 2026-11-22
description: "微软确认其 Entra Connect Health 服务在 2026 年 7 月引入的安全漏洞可能导致客户租户信息被未授权访问。该漏洞于 11 月被发现并修复，涉及只读权限下的租"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/microsoft-entra-data-breach-july-bug.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/microsoft-entra-data-breach-july-bug.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

微软确认其 Entra Connect Health 服务在 2026 年 7 月引入的安全漏洞可能导致客户租户信息被未授权访问。该漏洞于 11 月被发现并修复，涉及只读权限下的租户配置元数据和联系邮箱信息。

![](https://cdn.neowin.com/news/images/uploaded/2026/11/1795286974_entra_red_full.webp)

### **漏洞发现与时间线**

微软检测到 Entra Connect Health API 中的漏洞发生在**2026 年 11 月 9 日**，但该问题实际于**2026 年 7 月 23 日**已引入。公司随后在**2026 年 11 月 19 日**部署了服务器端修复方案，次日完成调查结论。

巧合的是，此前大规模 M365 Exchange 和 Outlook 中断事件同样与一个追溯至 7 月的软件缺陷有关联。

### **受影响的信息范围**

已获取的数据包括租户 ID、显示名称、初始域名、国家代码、区域范围、Entra 许可层级、目录同步状态和 Connect Health 注册状态。API 响应中还包含与技术人员和管理员账户关联的电子邮件地址。

披露信息还包括一个遗留证书，该证书曾用于将 Connect Health 代理注册到内部服务，但此服务已于 2024 年末退役，证书也已过期不再使用。

### **未暴露的信息类型**

微软澄清漏洞未泄露用户密码、密码哈希、身份验证令牌、有效加密密钥、本地服务器或 Active Directory 拓扑详情，以及 Azure 订阅信息。调查未发现未授权的配置变更证据。

### **组织应对建议**

微软建议受影响的组织通知安全与 IT 团队，因为暴露的联系信息和租户元数据可能被用于定向钓鱼或社会工程学攻击。管理员应确保特权账户受到更耐用的多重身份验证保护，并审查 Connect Health 配置、审核日志和登录活动记录是否有异常情况。

微软已发布一个只读的 PowerShell 脚本，供管理员在本地运行以检查可能暴露的信息类型，但该脚本只能返回当前值，无法重建事件发生时可访问的信息。

好消息是微软表示无需客户提供软件更新或其他补救措施来应对该漏洞，因为服务器端修复已经部署。

via [Neowin](https://www.neowin.net/news/after-outage-microsoft-confirms-another-july-bug-that-led-to-entra-data-breach/)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/microsoft-entra-data-breach-july-bug.html) | [添加评论](https://windiscover.com/posts/microsoft-entra-data-breach-july-bug.html#comments)

[微软确认七月漏洞导致 Entra 数据泄露](https://windiscover.com/posts/microsoft-entra-data-breach-july-bug.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/microsoft-entra-data-breach-july-bug.html)
