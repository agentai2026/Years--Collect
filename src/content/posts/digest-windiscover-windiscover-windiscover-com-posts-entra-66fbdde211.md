---
title: "微软邮件通知 Entra ID 客户：SMS 与语音认证将于 2027 年 2 月退役"
published: 2026-08-07
description: "微软已开始向 Entra ID（原 Azure AD）客户发送邮件，预告一项重大身份认证策略变更：内置 SMS 与语音认证将于 2027 年 2 月 1 日正式退役，组织需在此之前"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/entra-id-sms-voice-authentication-retirement-passkeys.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/entra-id-sms-voice-authentication-retirement-passkeys.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

微软已开始向 Entra ID（原 Azure AD）客户发送邮件，预告一项重大身份认证策略变更：内置 SMS 与语音认证将于 **2027 年 2 月 1 日**正式退役，组织需在此之前迁移至 passkeys 无密码认证方案。

![](https://cdn.neowin.com/news/images/uploaded/2026/08/1786089847_entra-id_story.webp)

### **停用时间表与过渡机制**

根据邮件内容，过渡将从 **2026 年 9 月 1 日**开始。届时，Entra ID 将自动为仍在使用 SMS 或语音认证的用户启用 passkeys，并在登录时提示用户完成注册。若用户在 **2027 年 2 月 1 日**截止日期前仍未创建 passkey 或选择其他防钓鱼认证方式，系统将实施不可绕过的登录阻断，强制要求完成 passkey 设置后方可继续使用。

### **安全风险与 passkeys 优势**

微软推动此项变更的核心原因在于 SMS 认证的安全隐患。SMS 验证易遭受 SIM 卡交换攻击（SIM-swapping）以及中间人钓鱼攻击（Adversary-in-the-Middle, AitM）。相比之下，passkeys 采用公钥加密技术，并将验证凭证存储于可信设备本地，能够有效抵御针对密码和一次性验证码的攻击，以及日益复杂的 AI 驱动的社会工程学攻击。

### **特殊场景与合规要求**

对于因合规原因必须保留 SMS 或语音认证的组织，微软提供了替代方案：通过 Microsoft Security Store 接入客户自主管理的电信运营商。相关定价信息将于 **2026 年 9 月 18 日**公布，配置功能则于 **2026 年 10 月 30 日**开放。

### **管理员操作建议**

微软建议管理员立即在 Authentication Methods Policy 中审计当前 SMS 与语音认证的使用情况，并主动将用户迁移至 Microsoft Authenticator 或硬件安全密钥等 passkeys 方案，以避免 2026 年 9 月初终端用户遭遇意外的登录提示。

via [Neowin](https://www.neowin.net/news/microsoft-starts-sending-out-emails-to-warn-about-big-entra-id-change-to-authentication/)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/entra-id-sms-voice-authentication-retirement-passkeys.html) | [添加评论](https://windiscover.com/posts/entra-id-sms-voice-authentication-retirement-passkeys.html#comments)

[微软邮件通知 Entra ID 客户：SMS 与语音认证将于 2027 年 2 月退役](https://windiscover.com/posts/entra-id-sms-voice-authentication-retirement-passkeys.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/entra-id-sms-voice-authentication-retirement-passkeys.html)
