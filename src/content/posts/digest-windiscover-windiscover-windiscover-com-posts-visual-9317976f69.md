---
title: "Visual Studio 九月更新引发BYOM架构重大变革"
published: 2026-09-30
description: "微软正式发布Visual Studio 2026九月稳定渠道更新，引发Bring Your Own Model架构重大变更。本次更新同步新增Podman容器原生调试支持与NuGet"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/visual-studio-september-update-byom-changes.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/visual-studio-september-update-byom-changes.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

微软正式发布Visual Studio 2026九月稳定渠道更新，引发Bring Your Own Model架构重大变更。本次更新同步新增Podman容器原生调试支持与NuGet漏洞自动修复机制，现已向社区版、专业版及企业版用户开放下载。

![](https://cdn.neowin.com/news/images/uploaded/2026/05/1778058505_vs2026_story.webp)

### **BYOM架构全面转型**

新版彻底重构Bring Your Own Model功能实现路径，强制转向基于GitHub Copilot SDK的Agent框架，原有Ask与Agent模式被弃用。开发者需手动重新注册Ollama模型，可通过Chat > Model Picker > Manage Models进行重新配置。该调整旨在统一AI架构至现代智能体工作流体系，同时支持调用微软Foundry、OpenAI、Anthropic等多平台模型资源。

### **NuGet漏洞修复自动化**

针对NU1901至NU1904等漏洞预警，Fixer列新增Sparkle操作入口。点击后可调用GitHub Copilot Chat与NuGet MCP服务器自动完成漏洞修复，显著提升依赖安全管理效率。系统会明确标识不支持的Agent模型功能，避免静默失败导致的开发阻塞。

### **容器调试能力扩展**

Attach to Process功能正式支持Podman容器调试。开发者可在Debug > Attach to Process中选择Podman连接类型并执行搜索操作。此外，代码分支高亮显示功能支持通过右键菜单关闭，也可在Tools > Options > Environment > Fonts and Colors中自定义颜色方案。

via [Neowin](https://www.neowin.net/news/visual-studio-update-breaks-your-byom-setup-for-ai/?utm_source=rss)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/visual-studio-september-update-byom-changes.html) | [添加评论](https://windiscover.com/posts/visual-studio-september-update-byom-changes.html#comments)

[Visual Studio 九月更新引发BYOM架构重大变革](https://windiscover.com/posts/visual-studio-september-update-byom-changes.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/visual-studio-september-update-byom-changes.html)
