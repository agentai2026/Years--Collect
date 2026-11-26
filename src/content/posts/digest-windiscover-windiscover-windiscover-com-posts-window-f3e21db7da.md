---
title: "Windows Update 持续分发含 WinRing0 漏洞的英特尔驱动程序"
published: 2026-11-26
description: "微软通过 Windows Update 官方渠道持续分发包含已知安全漏洞的英特尔 NUC 系统驱动程序，其内部组件被安全软件标记为高危风险。该问题驱动版本为 1.0.0.38，已于"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/windows-update-intel-driver-wring0-vulnerability.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/windows-update-intel-driver-wring0-vulnerability.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

微软通过 Windows Update 官方渠道持续分发包含已知安全漏洞的英特尔 NUC 系统驱动程序，其内部组件被安全软件标记为高危风险。该问题驱动版本为 1.0.0.38，已于 2022 年 12 月 8 日发布。\n\n

\n

![](https://cdn.neowin.com/news/images/uploaded/2023/07/1689668348_intel_windows_11_red_full.jpg)

\n\n

### **漏洞组件与安全评级**

\n德国科技媒体 DeskModder 发现，Windows 11 更新通道正在推送一款标有[VulnerableDriver:WinNT/Winring0]威胁等级的驱动程序文件。该文件名为 OpenHardwareMonitorLib.sys，位于 Windows Driver Store 中。\n\n

![](https://cdn.neowin.com/news/images/uploaded/2023/07/1689668348_intel_windows_11_red.jpg)

\n\n

### **CVE 漏洞历史背景**

\nWinRing0 内核驱动存在已知安全漏洞，追踪编号为 CVE-2020-14979。该漏洞允许具备初始访问权限的攻击者获取本地权限提升能力，属于 Bring Your Own Vulnerable Driver (BYOVD) 攻击链的典型环节。\n\n

### **微软合规认证矛盾**

\n尽管包含脆弱组件，该驱动程序包携带有效的微软硬件兼容性发布商 WHCP 数字签名。Microsoft Defender 安全软件虽检测出风险，但不会主动阻止安装。\n\n

### **分发持续性问题**

\n从 2023 年 1 月 3 日起，该驱动包未进行分发变更记录查询。Windows Update Agent API 持续返回相同版本标识 Intel Corporation – Extension – 1.0.0.38。\n\n

### **行业责任归属争议**

\n此情况发生在微软启动 Driver Quality Initiative 质量保证计划之后，该倡议承诺仅发布高质量可靠安全的设备驱动程序。Intel 作为厂商负责维护驱动程序包，微软则有义务审查通过 Windows Update 持续分发的所有内容。\n\nvia [Neowin](https://www.neowin.net/news/report-microsoft-officially-shipping-vulnerable-intel-driver-component-via-windows-update/)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/windows-update-intel-driver-wring0-vulnerability.html) | [添加评论](https://windiscover.com/posts/windows-update-intel-driver-wring0-vulnerability.html#comments)

[Windows Update 持续分发含 WinRing0 漏洞的英特尔驱动程序](https://windiscover.com/posts/windows-update-intel-driver-wring0-vulnerability.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/windows-update-intel-driver-wring0-vulnerability.html)
