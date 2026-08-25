---
title: "微软确认 KB5120708 等更新导致打印故障，已发布临时解决方案"
published: 2026-08-24
description: "微软确认 2026 年 8 月发布的 .NET Framework 累积更新存在问题，安装 KB5120708、KB5120705、KB5120710 后，部分 Windows P"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/windows-kb5120708-printing-workaround.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/windows-kb5120708-printing-workaround.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

微软确认 2026 年 8 月发布的 .NET Framework 累积更新存在问题，安装 **KB5120708**、**KB5120705**、**KB5120710** 后，部分 Windows Presentation Foundation (WPF) 应用在执行打印或生成 PDF、XPS 文档时可能失败。该问题影响 Windows 11、Windows 10 及 Windows Server 全系产品。

![](https://cdn.neowin.com/news/images/uploaded/2025/05/1746161036_windows_10_windows_11_red_story.jpg)

### **故障表现与影响范围**

受影响的 WPF 应用在打印或使用特定字体（如 Calibri）生成 PDF、XPS 内容时，会触发 **System.IO.FileFormatException** 错误。这意味着除传统打印工作流外，依赖文档生成功能的业务应用同样可能受到影响。

### **临时解决方案**

微软已提供临时应对措施：开发人员可在应用的配置文件（config 文件）中启用 `Switch.MS.Internal.TtfDelta.DisableCmapAndSbitOverflowProtection` AppContext 开关。通过添加特定 XML 配置代码段，可绕过当前故障。

### **安全风险提示**

微软明确指出，该临时方案会禁用 2026 年 8 月 .NET Framework 更新中引入的安全防护机制，从而增加系统暴露于相关漏洞的风险。建议仅在必须解决打印或文档生成问题时临时启用，并尽快在官方修复发布后移除。

### **后续修复计划**

目前微软正在调查该问题，尚未公布永久修复方案的具体时间表。用户和开发人员可访问微软官方文档页面获取最新进展和详细技术说明。

via [Neowin](https://www.neowin.net/news/microsoft-shares-workaround-after-windows-kb5120708-kb5120705-kb5120710-break-printing/)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/windows-kb5120708-printing-workaround.html) | [添加评论](https://windiscover.com/posts/windows-kb5120708-printing-workaround.html#comments)

[微软确认 KB5120708 等更新导致打印故障，已发布临时解决方案](https://windiscover.com/posts/windows-kb5120708-printing-workaround.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/windows-kb5120708-printing-workaround.html)
