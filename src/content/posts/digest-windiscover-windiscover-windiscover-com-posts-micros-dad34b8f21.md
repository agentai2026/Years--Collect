---
title: "微软推出无法禁用的Entra ID硬删除保护功能"
published: 2026-11-12
description: "微软在Entra ID服务中推出了名为”硬删除保护”的新安全功能，当前处于公共预览阶段。该功能启用后可锁定已软删除的账户，确保在七天内无法被永久删除，且一旦"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/microsoft-entra-hard-deletion-protection-feature.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/microsoft-entra-hard-deletion-protection-feature.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

微软在Entra ID服务中推出了名为”硬删除保护”的新安全功能，当前处于公共预览阶段。该功能启用后可锁定已软删除的账户，确保在七天内无法被永久删除，且一旦激活即不可关闭。

![](https://cdn.neowin.com/news/images/uploaded/2025/07/1751438716_microsoft-entra-id_story.webp)

### **功能设计逻辑与操作限制**

正常情况下，Entra ID中的账户删除会进入为期30天的软删除恢复期。硬删除保护功能在此基础上增加了额外约束，防止关键对象在软删除初期被强制永久移除。管理员需具备Backup Administrator角色权限方可启用此功能，系统会通过警告弹窗提醒其不可逆特性。

### **启用流程与影响范围**

启用操作需在Azure门户完成，支持批量保护20个同类型对象。若误启用，唯一补救措施是先执行软删除并等待一周自动解除锁定状态。微软说明该机制特别适用于防止误操作或恶意破坏导致的账户丢失风险。

### **技术文档与后续规划**

官方文档详细说明了不同场景下的应用规则及例外情况。目前尚未公布正式版本发布日期，建议管理员在测试环境验证后再部署到生产环境。

![](https://cdn.neowin.com/news/images/uploaded/2025/07/1751438716_microsoft-entra-id_story.webp)

### **企业安全策略价值**

该功能通过延长数据保留时间窗口提升了容错能力，尤其适合高敏感账户的管理场景。结合零信任架构理念，为企业提供了更深层次的访问控制保护手段。

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/microsoft-entra-hard-deletion-protection-feature.html) | [添加评论](https://windiscover.com/posts/microsoft-entra-hard-deletion-protection-feature.html#comments)

[微软推出无法禁用的Entra ID硬删除保护功能](https://windiscover.com/posts/microsoft-entra-hard-deletion-protection-feature.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/microsoft-entra-hard-deletion-protection-feature.html)
