---
title: "Microsoft Word 保存 PDF 至错误文件夹并生成随机文件名问题已确认"
published: 2026-09-29
description: "微软已确认 Microsoft Word 在处理文档另存为 PDF 格式时存在一个文件路径选择异常问题。部分用户在执行保存操作后，PDF 文件可能被存储到非预期的目录位置，且文件名"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/microsoft-word-pdf-save-wrong-folder-random-filenames-issue.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/microsoft-word-pdf-save-wrong-folder-random-filenames-issue.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

微软已确认 Microsoft Word 在处理文档另存为 PDF 格式时存在一个文件路径选择异常问题。部分用户在执行保存操作后，PDF 文件可能被存储到非预期的目录位置，且文件名呈现为随机字符序列而非原文档名称。

### **问题表现与用户反馈**

根据 Neowin 报道，多名用户在 Microsoft Office forums 社群反馈该异常现象。问题核心在于系统弹窗选择的保存目录与实际保存结果不符，最终生成的 PDF 文件出现在用户未曾指定的其他文件夹内。

### **技术分析与影响范围**

该问题并非单一用户本地配置异常所致。经技术团队初步排查，多个 Word 版本均可能出现此行为，包括 Microsoft 365 订阅版及独立购买版本的 **2024** 年更新通道。文件名随机化机制源自系统调用层级的临时命名策略，正常情况下应在写入前替换为用户原始文件名。

### **解决方案与后续计划**

微软表示相关 Bug 已被收录进内部问题追踪系统，开发团队正在分析文件管理器交互逻辑中的潜在冲突点。在修复方案上线之前，建议受影响用户采用打印至 PDF 驱动程序的备选保存方式规避此问题。

via [Neowin](https://www.neowin.net/news/microsoft-confirms-word-can-save-pdfs-to-the-wrong-folder-with-random-filenames/?utm_source=rss)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/microsoft-word-pdf-save-wrong-folder-random-filenames-issue.html) | [添加评论](https://windiscover.com/posts/microsoft-word-pdf-save-wrong-folder-random-filenames-issue.html#comments)

[Microsoft Word 保存 PDF 至错误文件夹并生成随机文件名问题已确认](https://windiscover.com/posts/microsoft-word-pdf-save-wrong-folder-random-filenames-issue.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/microsoft-word-pdf-save-wrong-folder-random-filenames-issue.html)
