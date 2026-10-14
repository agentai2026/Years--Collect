---
title: "微软加固 Windows 11 可移动存储中的 reFS 支持 限制远程加载风险"
published: 2026-10-14
description: "微软正在推进针对 Windows 11 文件系统的一项安全改进措施，主要针对重解析功能在可移动介质上的使用场景进行加固。这一举措旨在降低 reFS 文件系统相关的安全风险。 重解析"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/microsoft-hardens-windows-11-ref-removable-media-risks.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/microsoft-hardens-windows-11-ref-removable-media-risks.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

微软正在推进针对 Windows 11 文件系统的一项安全改进措施，主要针对重解析功能在可移动介质上的使用场景进行加固。这一举措旨在降低 reFS 文件系统相关的安全风险。

![](https://storage.windiscover.com/files/windows-11-refs-security.png)

### **重解析功能与安全背景**

重解析标记是一种允许文件系统对特定文件路径进行自定义处理的机制。传统上，该功能被用于符号链接、挂载点和分布式缓存系统。当 reFS 格式出现在可移动媒体时，恶意载荷可能利用重解析点实现远程代码执行攻击。

### **新防护机制的具体范围**

此次加固聚焦于可移动设备上的 reFS 实例。系统将对挂载行为施加更严格的验证，阻止未经授权的远程解析尝试。第三方备份与同步工具若依赖重解析功能，可能需要适配新的权限模型。

### **影响评估与应用兼容性**

企业环境中部署的外部存储解决方案可能受到波及。管理员需要在重新评估备份策略前确认现有工具链是否兼容新的访问限制。微软暂未公开具体受影响的应用名单。

### **后续更新计划**

官方表示此安全增强将通过累积更新推送，预计在下个半年度版本中正式落地。受影响的组织可通过更新日志确认变更细节并调整配置。

via [Neowin](https://www.neowin.net/news/microsoft-not-a-fan-of-refs-on-removable-media-hardening-windows-11-against-it/?utm_source=rss)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/microsoft-hardens-windows-11-ref-removable-media-risks.html) | [添加评论](https://windiscover.com/posts/microsoft-hardens-windows-11-ref-removable-media-risks.html#comments)

[微软加固 Windows 11 可移动存储中的 reFS 支持 限制远程加载风险](https://windiscover.com/posts/microsoft-hardens-windows-11-ref-removable-media-risks.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/microsoft-hardens-windows-11-ref-removable-media-risks.html)
