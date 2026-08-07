---
title: "微软宣布 2026 年退役 Entra ID MemberOf 操作符引发争议"
published: 2026-08-06
description: "微软宣布将于 2026 年 11 月 3 日在 Microsoft Entra ID 中退役 MemberOf 规则操作符。依赖该功能实现嵌套组逻辑的动态组、管理单元和权限策略将被"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/microsoft-entra-id-retires-memberof-operator.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/microsoft-entra-id-retires-memberof-operator.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

微软宣布将于 **2026 年 11 月 3 日**在 Microsoft Entra ID 中退役 MemberOf 规则操作符。依赖该功能实现嵌套组逻辑的动态组、管理单元和权限策略将被迫重构，此决定已在管理员社区引发广泛争议。

![](https://cdn.neowin.com/news/images/uploaded/2025/07/1751438716_microsoft-entra-id_story.webp)

### **功能背景与退役原因**

MemberOf 操作符最初作为本地 Active Directory 嵌套安全组与云原生 Entra ID 组之间的桥梁推出。然而，微软在 Message Center ID **MC1448379** 公告中解释称，该功能存在严重的性能瓶颈——单个 MemberOf 规则会导致整个租户内所有动态组的处理延迟，因此决定不将其推进至正式发布（General Availability）阶段。

### **潜在影响与风险**

退役后，所有使用 MemberOf 的配置将永久停止后台处理，成员数据将冻结在最终已知状态。微软警告称，若管理员未采取行动，可能导致以下后果：

- M365 组访问权限过时

- 条件访问（Conditional Access）策略执行失效

- 许可分配漂移——用户可能保留不应有的许可证或缺失应有的席位

### **管理员应对策略**

由于 Entra ID 动态成员规则缺乏 MemberOf 的直接 1:1 替代方案，组织需采取以下措施：

- 使用 Microsoft Graph PowerShell 或 Entra 管理中心导出工具审计现有环境

- 将 MemberOf 逻辑替换为直接用户/设备属性过滤器

- 将动态组转换为静态分配成员

微软建议在退役日期前完成上述调整，以防止许可漂移和安全策略缺口。

### **社区反应**

该决定在 Reddit 等社区引发强烈反对。有管理员表示这将严重破坏现有架构，另有评论质疑微软为何不优先修复性能问题而非直接移除功能。

via [Neowin](https://www.neowin.net/news/microsoft-decides-to-retire-memberof-operator-in-entra-id-dynamic-groups-creates-backlash/)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/microsoft-entra-id-retires-memberof-operator.html) | [添加评论](https://windiscover.com/posts/microsoft-entra-id-retires-memberof-operator.html#comments)

[微软宣布 2026 年退役 Entra ID MemberOf 操作符引发争议](https://windiscover.com/posts/microsoft-entra-id-retires-memberof-operator.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/microsoft-entra-id-retires-memberof-operator.html)
