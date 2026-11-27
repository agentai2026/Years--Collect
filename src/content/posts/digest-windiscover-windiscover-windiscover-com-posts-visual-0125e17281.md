---
title: "Visual Studio Code 1.148 发布 新增 AI 代理防休眠与隔离环境支持"
published: 2026-11-27
description: "微软发布了 Visual Studio Code 1.148 版本更新，此次更新主要聚焦 AI 代理功能的优化体验。新版本引入了系统防休眠机制，确保 AI 代理工作时设备保持激活状"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/visual-studio-code-1148-release-ai-agents-prevent-sleep-isolated-containers.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/visual-studio-code-1148-release-ai-agents-prevent-sleep-isolated-containers.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

微软发布了 Visual Studio Code 1.148 版本更新，此次更新主要聚焦 AI 代理功能的优化体验。新版本引入了系统防休眠机制，确保 AI 代理工作时设备保持激活状态，同时新增了隔离开发容器创建能力。

![](https://cdn.neowin.com/news/images/uploaded/2026/10/1790831061_vscode_yellow_mesh_1920x1080_full.webp)

### **AI 代理运行时防休眠功能**

新版预览功能允许 Visual Studio Code 在 AI 代理工作时保持设备处于运行状态。该功能提供三种配置模式：始终让设备保持活跃、仅在使用交流电适配器时维持活跃，或直接禁用该特性。此设计解决了长期运行的自动化任务因系统进入睡眠状态而中断的问题。

![](https://cdn.neowin.com/news/images/uploaded/2026/10/1790831061_vscode_yellow_mesh_1920x1080_story.webp)

### **隔离开发容器简化部署**

更新后开发者可以直接启动基于 Ubuntu 容器的隔离工作区，无需手动编写 devcontainer.json 配置文件。配合实验性的沙盒配置文件功能，可以为每个远程代理主机定制权限规则，实现差异化的网络访问控制与资源限制策略。

### **其他重要改进项**

除上述核心功能外，本次更新还包含多个实用性优化：闲置代理工作树清理可释放远程主机磁盘空间；Agent Host 对话响应延迟显著缩短；沙盒配置文件支持保存与复用提升配置效率。

via [Neowin](https://www.neowin.net/news/visual-studio-code-1148-is-here-and-it-can-keep-your-pc-awake-while-ai-agents-are-working/)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/visual-studio-code-1148-release-ai-agents-prevent-sleep-isolated-containers.html) | [添加评论](https://windiscover.com/posts/visual-studio-code-1148-release-ai-agents-prevent-sleep-isolated-containers.html#comments)

[Visual Studio Code 1.148 发布 新增 AI 代理防休眠与隔离环境支持](https://windiscover.com/posts/visual-studio-code-1148-release-ai-agents-prevent-sleep-isolated-containers.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/visual-studio-code-1148-release-ai-agents-prevent-sleep-isolated-containers.html)
