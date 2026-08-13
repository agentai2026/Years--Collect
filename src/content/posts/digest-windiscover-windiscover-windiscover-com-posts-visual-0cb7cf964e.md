---
title: "Visual Studio Code 1.133 发布：支持免登录使用 Agents 窗口"
published: 2026-08-12
description: "微软发布 Visual Studio Code 1.133 版本，本次更新重点优化开发者工作流程，新增免登录 GitHub 即可访问 Agents 窗口的实验性功能，并支持在线话中"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/visual-studio-code-1-133-release.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/visual-studio-code-1-133-release.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

微软发布 Visual Studio Code **1.133** 版本，本次更新重点优化开发者工作流程，新增免登录 GitHub 即可访问 Agents 窗口的实验性功能，并支持在线话中切换模型提供商。

![](https://cdn.neowin.com/news/images/uploaded/2025/05/1746781447_vscode_story.jpg)

### **免登录访问 Agents 窗口**

此前，开发者若无法访问 github.com 或不愿使用 GitHub 账户，可能会被阻止进入 Agents 窗口。新版本通过实验性设置 **chat.agentHost.allowSignedOutWhenUsable** 解决这一问题。启用后，用户无需登录 GitHub 即可访问 Agents 窗口，GitHub 身份验证将仅与单个 Agent 或模型关联，而非整个 Agents 窗口。

### **模型提供商切换优化**

1.133 版本允许用户在同一会话中于 Anthropic 与 Copilot 之间切换模型提供商。此前，Claude 会话完全依赖 GitHub Copilot 订阅或 Claude 自有配置（如 API 密钥），切换提供商需重新配置 Agent Host。

更新后，模型选择器同时显示两组选项，用户可在对话轮次间更便捷地切换。Anthropic 下列出的模型由 Anthropic 计费，Copilot 下的模型则使用用户的 Copilot 订阅额度。

### **粘性滚动与浏览器自动刷新**

针对长对话场景，新版本引入 Prompt 粘性滚动功能。滚动浏览长对话时，已滑过的 Prompt 将固定于聊天窗口顶部，便于识别回复归属。点击固定 Prompt 可快速跳转回该位置，或使用旁边的上/下按钮逐步浏览 Prompt 历史。

此外，集成浏览器现支持 HTML 文件自动刷新。当磁盘上的 HTML 文件发生变更时，浏览器将自动重新加载，帮助开发者即时查看编辑效果。

via [Neowin](https://www.neowin.net/news/microsoft-releases-visual-studio-code-1133-heres-whats-new/)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/visual-studio-code-1-133-release.html) | [添加评论](https://windiscover.com/posts/visual-studio-code-1-133-release.html#comments)

[Visual Studio Code 1.133 发布：支持免登录使用 Agents 窗口](https://windiscover.com/posts/visual-studio-code-1-133-release.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/visual-studio-code-1-133-release.html)
