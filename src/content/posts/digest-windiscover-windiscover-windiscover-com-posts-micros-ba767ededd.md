---
title: "微软紧急推送 OOB 更新修复 Windows 激活与授权错误"
published: 2026-11-14
description: "微软发布紧急带外（OOB）补丁以修复 Windows 系统中出现的许可激活错误。该问题在 November 的 Patch Tuesday 更新后出现，主要影响使用 Softwar"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/microsoft-emergency-oob-windows-update-license-activation-fix.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/microsoft-emergency-oob-windows-update-license-activation-fix.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

微软发布紧急带外（OOB）补丁以修复 Windows 系统中出现的许可激活错误。该问题在 November 的 Patch Tuesday 更新后出现，主要影响使用 Software Licensing Management Tool 进行自动化操作的企业用户。

![](https://cdn.neowin.com/news/images/uploaded/2026/07/1783696770_screenshot_2026-07-10_201824_full.webp)

### **错误触发与影响范围**

用户在安装 November 的 Patch Tuesday 构建（KB5132057、KB5132265 等）后，执行 SLMGR 相关任务时遭遇错误 0x80041008（无效参数）。此问题主要集中在通过 slmgr.vbs 脚本自动化处理 Windows 激活和产品密钥部署的企业环境中。

### **适用系统与补丁编号**

本次 OOB 补丁覆盖以下受影响的 SKU：

- Windows Server 2025：KB5136489

- Windows Server 2022：KB5136487

- Windows Server 2019 与 Windows 10 Enterprise LTSC 2019：KB5136490

- Windows 11 23H2：KB5136483

- Windows 10 22H2 ESU 与 Windows 10 Enterprise LTSC 2021：KB5136493

### **更新部署方式**

作为累积更新，该补丁包含截至当前的所有已修复项目。未安装 Patch Tuesday 的用户可直接部署此 OOB 补丁。Windows Server 与 Windows 10 系列可通过 Microsoft Update Catalog 获取，Windows 11 23H2 用户还可从 Windows Update 的可选更新栏目中下载。

via [Neowin](https://www.neowin.net/news/microsoft-releases-emergency-oob-windows-update-to-fix-licensing-and-activation-issues/)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/microsoft-emergency-oob-windows-update-license-activation-fix.html) | [添加评论](https://windiscover.com/posts/microsoft-emergency-oob-windows-update-license-activation-fix.html#comments)

[微软紧急推送 OOB 更新修复 Windows 激活与授权错误](https://windiscover.com/posts/microsoft-emergency-oob-windows-update-license-activation-fix.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/microsoft-emergency-oob-windows-update-license-activation-fix.html)
