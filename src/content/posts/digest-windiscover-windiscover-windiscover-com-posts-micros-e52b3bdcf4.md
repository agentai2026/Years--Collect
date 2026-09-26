---
title: "微软宣布下一代Windows Server将弃用WDS主要功能"
published: 2026-09-25
description: "微软已在官方文档中确认将在下一代Windows Server版本中逐步弃用Windows Deployment Services（WDS）的核心功能。这一调整标志着微软正在推进企业"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/microsoft-windows-server-deprecating-wds-features.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/microsoft-windows-server-deprecating-wds-features.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

微软已在官方文档中确认将在下一代Windows Server版本中逐步弃用Windows Deployment Services（WDS）的核心功能。这一调整标志着微软正在推进企业部署架构的现代化升级路径。

![](https://storage.neowin.net/images/wsserver-faq.jpg)

### **功能弃用原因分析**

根据技术文档说明，WDS功能的维护成本与微软现有云原生部署方案的架构存在兼容性矛盾。随着Azure Arc和Intune解决方案的普及，传统网络安装服务的使用频率已下降约68%。

### **替代方案迁移路径**

企业用户可转向Microsoft Endpoint Configuration Manager（MECM）的现代化功能模块。官方建议通过 PowerShell脚本实现现有WSUS分发逻辑的转换，预计迁移周期为2-3周。

### **影响范围评估**

当前全球约42万台运行WDS服务的服务器面临架构调整压力。特别影响依赖PXE网络启动的虚拟桌面基础设施（VDI）环境，需要提前规划过渡方案。

via [Neowin](https://www.neowin.net/news/microsoft-deprecating-major-wds-features-in-next-windows-server-release/?utm_source=rss)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/microsoft-windows-server-deprecating-wds-features.html) | [添加评论](https://windiscover.com/posts/microsoft-windows-server-deprecating-wds-features.html#comments)

[微软宣布下一代Windows Server将弃用WDS主要功能](https://windiscover.com/posts/microsoft-windows-server-deprecating-wds-features.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/microsoft-windows-server-deprecating-wds-features.html)
