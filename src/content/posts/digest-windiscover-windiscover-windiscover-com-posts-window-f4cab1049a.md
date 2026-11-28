---
title: "微软公布 Windows Server 2028 四项功能将进入废弃阶段"
published: 2026-11-28
description: "微软正在推进 Windows Server 2028 的发布进程，并公布了一系列功能废弃计划。共有四项技术被列入废弃名单，虽然目前在产品中仍然可用，但在未来版本中可能被移除。 Br"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/windows-server-2028-feature-deprecation.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/windows-server-2028-feature-deprecation.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

微软正在推进 Windows Server 2028 的发布进程，并公布了一系列功能废弃计划。共有四项技术被列入废弃名单，虽然目前在产品中仍然可用，但在未来版本中可能被移除。

![](https://cdn.neowin.com/news/images/uploaded/2026/03/1774274688_windows_11_neowin_logo_red_full.webp)

### **BranchCache 带宽优化技术**

BranchCache 是一项广域网（WAN）带宽优化技术，用于缓存来自不同位置的内容。目前微软仅要求客户规划向替代方案的过渡，具体替代方案尚未明确说明。

### **Windows Deployment Services 角色**

Windows Deployment Services（WDS）服务器角色及其所有关联将被废弃。如果当前使用 WDS 提供的预启动执行环境（PXE）配合 Microsoft Configuration Manager，微软建议改用 Configuration Manager PXE 响应器而不依赖 WDS。

### **PowerShell 5.1 命令行工具**

Windows PowerShell **5.1** 被列入废弃名单，用户被鼓励迁移至 **Windows PowerShell 7**。微软指出两个版本之间可能存在兼容性差异，建议在迁移前测试脚本以验证依赖关系并制定相应迁移计划。

### **Windows Sockets Direct 网络接口**

Windows Sockets Direct 因系统区域网络（SAN）端点创建在 Windows Server 2028 中默认禁用而被废弃。其他网络技术如 NetworkDirect、SMB Direct 或 Remote Direct Memory Access（RDMA）不受此废弃影响。

### **迁移建议与风险提示**

使用上述技术的组织应考虑迁移至替代方案。例如，WINS 几年前已被废弃，并将在 Windows Server 2028 正式发布时移除。

via [Neowin](https://www.neowin.net/news/these-four-features-are-being-deprecated-in-windows-server-2028/)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/windows-server-2028-feature-deprecation.html) | [添加评论](https://windiscover.com/posts/windows-server-2028-feature-deprecation.html#comments)

[微软公布 Windows Server 2028 四项功能将进入废弃阶段](https://windiscover.com/posts/windows-server-2028-feature-deprecation.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/windows-server-2028-feature-deprecation.html)
