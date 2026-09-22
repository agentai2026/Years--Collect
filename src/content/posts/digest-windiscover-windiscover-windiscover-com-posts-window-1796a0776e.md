---
title: "Windows Admin Center 2610 公共预览版发布，整合两种模式并优化管理体验"
published: 2026-09-21
description: "微软正式发布 Windows Admin Center 2610 公共预览版，此次更新整合管理模式与虚拟化模式安装包，重编 Azure 注册流程并新增网络增强选项，修复 GPU 等"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/windows-admin-center-version-2610-public-preview.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/windows-admin-center-version-2610-public-preview.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

微软正式发布 Windows Admin Center 2610 公共预览版，此次更新整合管理模式与虚拟化模式安装包，重编 Azure 注册流程并新增网络增强选项，修复 GPU 等已知 Bug，但有三项遗留问题待解决。该版本作为重要管理工具面向企业 IT 管理员开放下载。

![](https://cdn.neowin.com/news/images/uploaded/2025/12/1765608196_windowsadmincenter1_story.webp)

### **安装模式整合升级**

新版本最大的亮点是将 Administration Mode（管理模块模式）和 Virtualization Mode（虚拟化模式）的独立安装包合并为单一安装程序。管理员只需在一台机器上选择所需模式进行安装，简化了部署步骤并缩短了交付时间。微软明确说明不支持在同一台设备上同时安装这两种模式。

### **Azure 注册与网络体验改进**

网关 Azure 注册体验经过重新设计，用户自动获取所需的最低权限，无需额外联系高级系统管理员即可开始使用。此外，Azure Arc 的 onboard 流程更加精简，管理员可使用简化的界面管理混合环境和基础架构。网络方面增加了暂停/重试、备份与恢复、证书生命周期管理以及实时迁移等功能。

### **VMware 集成与支持调整**

针对部分客户因 Broadcom 策略变化希望迁移的需求，微软目前尚未提供替代方案，已建议停止评估预览版的虚拟机转换工具，相关扩展已从平台移除。建议用户暂时考虑使用 Windows Admin Center 以外的其他工具。同时解决了 GPU 工具、代理日志记录和安装程序失败等相关 Bug。

### **已知遗留问题**

尽管有诸多改进，当前版本仍存在三个未解决的 Bug：

- [虚拟化模式] 当 Azure Arc 启用状态表被折叠时可能显示不准确。

- [虚拟化模式] 工具扩展内的部分链接可能错误重定向到管理模块模式界面。

- [双模式] 执行虚拟机实时迁移时，若源和目标节点具有不同的认证方法，操作可能会失败。

via [Neowin](https://www.neowin.net/news/windows-admin-center-version-2610-hits-public-preview-brings-major-improvements/?utm_source=rss)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/windows-admin-center-version-2610-public-preview.html) | [添加评论](https://windiscover.com/posts/windows-admin-center-version-2610-public-preview.html#comments)

[Windows Admin Center 2610 公共预览版发布，整合两种模式并优化管理体验](https://windiscover.com/posts/windows-admin-center-version-2610-public-preview.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/windows-admin-center-version-2610-public-preview.html)
