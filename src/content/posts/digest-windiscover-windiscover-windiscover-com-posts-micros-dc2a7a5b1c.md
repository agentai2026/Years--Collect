---
title: "微软确认 2026 年 9 月安全更新破坏 Excel 粘贴功能"
published: 2026-09-15
description: "微软确认 2026 年 9 月累积更新（KB5002914）在部分设备上安装后，会导致 Microsoft Excel 出现复制粘贴功能异常。受影响用户反映执行跨表格粘贴操作时会出"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/microsoft-september-2026-update-excel-copy-paste-issue.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/microsoft-september-2026-update-excel-copy-paste-issue.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

微软确认 2026 年 9 月累积更新（KB5002914）在部分设备上安装后，会导致 Microsoft Excel 出现复制粘贴功能异常。受影响用户反映执行跨表格粘贴操作时会出现内容丢失或格式错乱现象。

### **问题表现与影响范围**

受影响的 Excel 版本需同时满足 Windows 11 24H2 系统条件，问题集中在 **Kerberos 身份验证协议模块** 的更新组件。测试数据显示约 **3%** 的企业部署环境出现相关故障报告。

### **微软官方响应机制**

微软工程团队已建立专项跟踪通道，通过 **Microsoft Defender SmartScreen 服务** 向受影响用户提供自动回滚建议。企业客户可通过组策略临时禁用该更新包以恢复功能。

### **临时解决方案指引**

技术部门提供命令行修复方案，建议运行 `sfc /scannow` 命令重建受损的系统文件。高级用户可通过 PowerShell 卸载更新包：`wusa.exe /uninstall /kb:5002914`

### **后续修复计划**

预计将在 2026 年 10 月中旬推送修正补丁，优先保障企业版用户的办公系统稳定性。个人版系统将同步跟进修复进度。

via [Neowin](https://www.neowin.net/news/microsoft-confirms-september-2026-kb5002914-update-silently-break-excel-copy-paste/?utm_source=rss)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/microsoft-september-2026-update-excel-copy-paste-issue.html) | [添加评论](https://windiscover.com/posts/microsoft-september-2026-update-excel-copy-paste-issue.html#comments)

[微软确认 2026 年 9 月安全更新破坏 Excel 粘贴功能](https://windiscover.com/posts/microsoft-september-2026-update-excel-copy-paste-issue.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/microsoft-september-2026-update-excel-copy-paste-issue.html)
