---
title: "Collabora 推出针对早期疏漏的巧妙内存优化"
published: 2026-11-27
description: "Collabora 在线办公套件针对其内存管理机制进行了一项关键优化，解决了在文档处理过程中因内存页面复制导致的资源浪费问题。这一改进已在其官方博客中公布，并通过测试验证了显著的性"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/collabora-memory-optimization-missed.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/collabora-memory-optimization-missed.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

Collabora 在线办公套件针对其内存管理机制进行了一项关键优化，解决了在文档处理过程中因内存页面复制导致的资源浪费问题。这一改进已在其官方博客中公布，并通过测试验证了显著的性能提升。

![](https://cdn.neowin.com/news/images/uploaded/2026/02/1772051650_collab-_full.webp)

### **内存优化原理**

Collabora Online 采用每个文档独立进程（称为”kit”）的模式运行。为避免消耗过多内存，系统通过父进程”forkit”加载完整办公套件，利用 Linux 的 Copy-on-Write 功能实现文档进程间的内存共享。然而，Linux 通常以 **4 kb** 为单位管理内存页，即使共享页仅修改少量字节，系统仍需为该进程复制整个内存页。

### **优化方案与测试数据**

Collabora 开发者 Méven Car 指出，forkit 进程在创建临时数据后会遗留微小内存间隙，导致后续文档进程意外触发冗余复制。例如打开空白文本文档原本仅需约 **6.5 MB** 新数据，却会额外消耗 **39 MB** 内存。新版优化通过在启动时为 forkit 填充内存间隙，强制新进程分配全新内存页，使现有共享页保持完整。该操作耗时约 **11ms**，且主进程大小不变。

![](https://cdn.neowin.com/news/images/uploaded/2026/11/1795722869_collabra_online_mem_boost_2.webp)

测试显示，在四核 CPU 与 **8 GB RAM** 的服务器上模拟 **10 用户**并发处理时：空白文档内存消耗从 **53.9 MB**降至**24.4 MB**（降幅**55%**），Writer 文档从**73.6 MB**降至**47.8 MB**（降幅**35%**），Impress 演示文稿从**72.1 MB**降至**50.3 MB**（降幅**30%**）。预估千级用户服务器可节约高达 **25 GB** 内存。

![](https://cdn.neowin.com/news/images/uploaded/2026/11/1795722874_collabra_online_mem_boost_story.webp)

### **技术影响与应用场景**

团队认为该技术方案可推广至其他依赖 Copy-on-Write 的子进程优化应用。相关技术细节已在 Collabora 官方博客发布，标志着开源办公领域在资源效率层面的持续进步。

via [Neowin](https://www.neowin.net/news/microsoft-office-alternative-collabora-gets-a-clever-memory-optimization-missed-earlier/)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/collabora-memory-optimization-missed.html) | [添加评论](https://windiscover.com/posts/collabora-memory-optimization-missed.html#comments)

[Collabora 推出针对早期疏漏的巧妙内存优化](https://windiscover.com/posts/collabora-memory-optimization-missed.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/collabora-memory-optimization-missed.html)
