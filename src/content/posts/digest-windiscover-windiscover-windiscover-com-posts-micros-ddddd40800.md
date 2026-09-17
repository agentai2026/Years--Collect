---
title: "微软确认 Microsoft Edge 153 在使用部分网页应用时可能冻结"
published: 2026-09-17
description: "微软已确认新版 Microsoft Edge 浏览器在运行特定网页应用时可能出现冻结问题。该故障主要发生在 Edge 153 版本，受影响的用户反馈在访问某些在线应用时浏览器界面会"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/microsoft-edge-freeze-web-apps-issue.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/microsoft-edge-freeze-web-apps-issue.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

微软已确认新版 Microsoft Edge 浏览器在运行特定网页应用时可能出现冻结问题。该故障主要发生在 Edge 153 版本，受影响的用户反馈在访问某些在线应用时浏览器界面会出现长时间无响应状态。

![](https://storage.windiscover.com/files/edge-browser-crash.png)

### **问题具体表现**

根据用户报告，当使用基于 Electron 架构或高负载 JavaScript 的网页应用时，Edge 浏览器 CPU 占用率会异常升高，进而导致界面卡死。典型场景包括使用 Web 版文档编辑工具、实时协作平台及在线设计应用。

### **影响范围统计**

测试数据显示，在 Edge **153** 版本中约 **12%** 的高频网页应用场景会出现此问题。微软内部测试团队已在 Dev 分支复现该缺陷，并正在追踪根因定位。

### **微软官方回应**

微软工程团队表示该问题主要与特定网页应用的资源调度机制存在兼容性冲突有关。目前正通过调整内存管理策略和优化 JavaScript 引擎调用流程来修复。

### **解决方案进展**

预计在下个稳定版更新（Edge 153.1）中推出临时缓解方案，建议受影响用户暂时切换到 Chrome **版本 128** 或使用 Incognito 模式降低内存占用。

via [Neowin](https://www.neowin.net/news/microsoft-confirms-edge-153-can-freeze-while-using-some-web-apps/?utm_source=rss)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/microsoft-edge-freeze-web-apps-issue.html) | [添加评论](https://windiscover.com/posts/microsoft-edge-freeze-web-apps-issue.html#comments)

[微软确认 Microsoft Edge 153 在使用部分网页应用时可能冻结](https://windiscover.com/posts/microsoft-edge-freeze-web-apps-issue.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/microsoft-edge-freeze-web-apps-issue.html)
