---
title: "Linux 内核将 TSC 设为 x86 处理器硬性要求，与 Windows 策略趋同"
published: 2026-08-17
description: "Linux 内核开发者已通过代码提交将时间戳计数器（TSC）设为 x86 架构的无条件配置，正式结束了对无 TSC 老旧处理器的兼容支持。这一变更意味着 Linux 在技术上与 W"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/linux-tsc-mandatory-x86-requirement.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/linux-tsc-mandatory-x86-requirement.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

Linux 内核开发者已通过代码提交将时间戳计数器（TSC）设为 x86 架构的无条件配置，正式结束了对无 TSC 老旧处理器的兼容支持。这一变更意味着 Linux 在技术上与 Windows 多年前确立的高精度计时策略趋同。

![](https://cdn.neowin.com/news/images/uploaded/2025/07/1752849723_linux-windows_story.webp)

### **内核变更的技术背景**

Linux 内核最新提交 "x86/cpu: Make CONFIG_X86_TSC unconditional" 移除了允许构建无 TSC 支持内核的剩余配置逻辑。TSC 是自 Intel Pentium 时代引入的 64 位寄存器，能够以更高分辨率测量经过的时间，且访问速度远快于 HPET（高精度事件计时器）或 ACPI PM 计时器等平台级定时器。

### **老旧硬件支持的逐步淘汰**

Linux 长期以来需要维护针对无 TSC 或 TSC 不可靠处理器的兼容代码，以支持追溯至 i486 时代的硬件。随着 **Linux 7.0** 正式移除 Intel 486 处理器支持，以及后续开发周期中对阻碍 TSC 通用化处理的更多处理器支持的清理，内核终于可以安全地假定所有受支持的 x86 处理器均具备 TSC 功能。

### **与 Windows 实现路径的对比**

微软早在 Windows 2000 和 Windows XP 时代就引入了 QueryPerformanceCounter（QPC）作为高精度性能计数器。Windows 7 和 Windows Server 2008 R2 已在支持同步的系统中使用恒定速率 TSC 作为 QPC 的基础，Windows 8 系列则进一步将 TSC 作为性能计数器的默认实现并优化了多处理器同步机制。

### **性能优势的量化差异**

微软官方文档指出，基于 TSC 的 QPC 读取仅需数十至数百个 CPU 周期，而回退到主板级定时器的成本约为 **0.8~1.0 微秒**。此外，TSC 方案可避免内核态切换，而 HPET 或 PM 计时器等替代方案则无法做到这一点。Linux 此次变更的核心价值在于终于能够移除维持数十年的 TSC 可靠性检测与校准兼容代码。

via [Neowin](https://www.neowin.net/news/linux-finally-follows-windows-and-makes-a-cpu-feature-requirement-mandatory/)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/linux-tsc-mandatory-x86-requirement.html) | [添加评论](https://windiscover.com/posts/linux-tsc-mandatory-x86-requirement.html#comments)

[Linux 内核将 TSC 设为 x86 处理器硬性要求，与 Windows 策略趋同](https://windiscover.com/posts/linux-tsc-mandatory-x86-requirement.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/linux-tsc-mandatory-x86-requirement.html)
