---
title: "Windows 11 更新 KB5124008 导致 Always On VPN 连接故障"
published: 2026-09-11
description: "微软发布了最新的 Windows 11 补丁星期二更新，多个技术问题随之出现。其中，名为 KB5124008 的更新破坏了使用基于证书认证的 Always On VPN 连接，导致"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/windows-11-update-kb5124008-always-on-vpn-issue.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/windows-11-update-kb5124008-always-on-vpn-issue.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

微软发布了最新的 Windows 11 补丁星期二更新，多个技术问题随之出现。其中，名为 KB5124008 的更新破坏了使用基于证书认证的 Always On VPN 连接，导致相关连接无法生效。

![](https://cdn.neowin.com/news/images/uploaded/2026/07/1783690458_red_windows_11_story.webp)

### **受影响的用户范围**

此次回归主要影响运行 Windows 11 **24H2** 和 **25H2** 版本的客户端。连接对象为通过 Microsoft Intune 部署的 Windows Server **2019** RRAS 和 NPS 服务器。受影响的用户尝试重复安装和卸载补丁时，故障可被复现，移除补丁并重启后问题随即消失。

### **故障成因与排查建议**

独立顾问分析认为，此行为表明更新修改了网络堆栈或 IPsec 证书处理机制，而非用户配置错误。在安全修复日益频繁的情况下，日常工作流程被打断迫使企业在安全与功能间做出选择。VPN 握手期间的证书协商过程似乎受到影响。管理员可通过 WSUS 和 Intune 暂停更新推送，直到微软发布热修复补丁或修订累积更新。同时建议联系 Microsoft Premier 或 Unified Support 提交支持案例并提供日志。

### **临时规避方案**

对于必须保留补丁以满足合规要求但需要 VPN 连通性的管理员，可通过 Intune 将受影响配置文件暂时切换为使用 EAP-TLS 身份验证。这可能会绕过任何受损的证书链验证路径。管理员可在评论区反馈是否遇到此更新相关问题。

via [Neowin](https://www.neowin.net/news/windows-11-update-kb5124008-breaks-always-on-vpn-connections/?utm_source=rss)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/windows-11-update-kb5124008-always-on-vpn-issue.html) | [添加评论](https://windiscover.com/posts/windows-11-update-kb5124008-always-on-vpn-issue.html#comments)

[Windows 11 更新 KB5124008 导致 Always On VPN 连接故障](https://windiscover.com/posts/windows-11-update-kb5124008-always-on-vpn-issue.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/windows-11-update-kb5124008-always-on-vpn-issue.html)
