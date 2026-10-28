---
title: "微软Windows CLAT功能正式发布 解决IPv4应用在纯IPv6网络中的兼容问题"
published: 2026-10-28
description: "微软已将Windows客户端侧转换器（Customer-side Translator，简称CLAT）功能推向通用可用状态。该功能允许仅在IPv4环境中运行的应用程序在网络仅支持I"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/windows-clat-feature-general-availability-ipv4-compatibility.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/windows-clat-feature-general-availability-ipv4-compatibility.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

微软已将Windows客户端侧转换器（Customer-side Translator，简称CLAT）功能推向通用可用状态。该功能允许仅在IPv4环境中运行的应用程序在网络仅支持IPv6或混合IPv6配置时正常工作，已通过Windows 11 build **26200.9550**更新实现。

### **核心功能与技术原理**

CLAT是464XLAT翻译系统的客户端组件，负责将设备发出的IPv4流量转换为可通过IPv6网络传输的数据包，并交由服务器端转换器（PLAT）重新转为IPv4格式。这一机制无需修改现有IPv4应用即可使其适应纯IPv6基础架构。

![](https://cdn.neowin.com/news/images/uploaded/2026/08/1785883800_whesvc_featured_image_story.webp)

### **组织级部署优势**

企业用户可通过此功能逐步迁移至IPv6-only环境，无需重新开发应用以支持IPv6协议栈。IT管理员仅需确认网络中存在PLAT或NAT64翻译服务，即可启用该功能。微软指出这能降低配置复杂度，减少安全风险分析，并支持跨Wi-Fi、以太网和移动蜂窝接口自动发现配置。

### **协议兼容性保障**

系统会根据RFC 8781标准从IPv6路由器公告中提取翻译前缀信息PREF64；若无此数据，可通过查询ipv4only.arpa域名获取必要配置参数。该设计确保了在缺乏完整网络通告时的降级处理能力。

### **测试历程与应用价值**

Windows CLAT经历了约一年的私人预览与公开测试阶段，此次正式推出标志着其稳定性得到验证。对于需要保持IPv4应用兼容性又希望推进IPv6转型的企业，提供了一条可行的中间路径。

via [Neowin](https://www.neowin.net/news/windows-clat-is-now-generally-available-for-organizations-using-ipv4-applications/)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/windows-clat-feature-general-availability-ipv4-compatibility.html) | [添加评论](https://windiscover.com/posts/windows-clat-feature-general-availability-ipv4-compatibility.html#comments)

[微软Windows CLAT功能正式发布 解决IPv4应用在纯IPv6网络中的兼容问题](https://windiscover.com/posts/windows-clat-feature-general-availability-ipv4-compatibility.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/windows-clat-feature-general-availability-ipv4-compatibility.html)
