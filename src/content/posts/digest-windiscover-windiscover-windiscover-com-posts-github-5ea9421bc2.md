---
title: "GitHub 发布 8 小时大规模故障根因分析"
published: 2026-08-19
description: "GitHub 发布了 8 月 17 日大规模服务中断的详细根因分析报告。本次故障持续近 8 小时，影响了 GitHub.com、Issues、Pull Requests、APIs、"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/github-8-hour-outage-root-cause-analysis.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/github-8-hour-outage-root-cause-analysis.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

GitHub 发布了 8 月 17 日大规模服务中断的详细根因分析报告。本次故障持续近 8 小时，影响了 GitHub.com、Issues、Pull Requests、APIs、Actions、Copilot 及多项认证服务，高峰期 Web 和 API 错误率达到约 20%。

![](https://cdn.neowin.com/news/images/uploaded/2025/08/1754930428_github_ceo_microsoft_story.webp)

### **故障起点：负载均衡器饱和**

故障始于 GitHub 美国中部数据中心负载均衡器达到流量峰值后出现的饱和状态。一个 Istio sidecar pod 达到并发上限，但其自动扩展策略仅监控宿主服务而未考虑 sidecar 的限制，导致扩展失败。

### **连锁反应蔓延**

该故障逐步蔓延，最终导致 **4 个 HAProxy 节点**耗尽其流控上限。由于这些节点参与了 GitHub 的网关认证路径，认证请求开始出现延迟或失败。GitHub 的重试逻辑反而加剧了问题，向已经过载的内部负载均衡器发送了更多流量。

### **区域切换暴露次生问题**

GitHub 尝试将部分流量切换至弗吉尼亚北部数据中心，但出现了新的问题。一个内部端点的延迟响应暴露了 VS Code 中存在的潜在重试漏洞，导致 Copilot 认证流量出现爆发式增长。

### **Copilot Token Service 流量激增**

Copilot Token Service 正常情况下每秒处理 **7,000 至 9,000** 个请求。故障期间，该数值飙升至每秒 **70,000 至 100,000** 个请求——失败的请求触发了额外重试，部分请求甚至进入无限重试循环。

### **恢复措施与后续改进**

GitHub 通过减少网关重试、临时使用 HTTP 403 响应阻止特定 Token 请求、逐步恢复流量等措施最终稳定了服务。基于本次事件的教训，团队计划修复自动扩展策略、审计 Istio 容量限制、审查重试与退避行为、修复 VS Code 重试漏洞，并改进负载均衡器监控与区域故障转移保护机制。

via [Neowin](https://www.neowin.net/news/github-details-cascading-failures-behind-its-massive-8-hour-outage-on-monday/)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/github-8-hour-outage-root-cause-analysis.html) | [添加评论](https://windiscover.com/posts/github-8-hour-outage-root-cause-analysis.html#comments)

[GitHub 发布 8 小时大规模故障根因分析](https://windiscover.com/posts/github-8-hour-outage-root-cause-analysis.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/github-8-hour-outage-root-cause-analysis.html)
