---
title: "微软修补 Windows NTLM 协议关键安全漏洞"
published: 2026-11-12
description: "微软在 November 2026 Patch Tuesday 更新中对 Windows NTLM 协议安全性进行了重要改进，针对一个关键漏洞实施了多层防护机制。 CVE-2026"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/windows-ntlm-security-improvements-november-2026.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/windows-ntlm-security-improvements-november-2026.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

微软在 November 2026 Patch Tuesday 更新中对 Windows NTLM 协议安全性进行了重要改进，针对一个关键漏洞实施了多层防护机制。

![](https://cdn.neowin.com/news/images/uploaded/2026/08/1785883800_whesvc_featured_image_full.webp)

### **CVE-2026-118737 漏洞详情**

该漏洞属于严重级别，攻击者可通过 Windows Remote Procedure Call Runtime 中加密签名验证不当的问题，实现远程代码执行。Microsoft 通过分阶段推进 NTLM 消息签名来应对这一威胁。

![](https://cdn.neowin.com/news/images/uploaded/2026/08/1785883800_whesvc_featured_image_story.webp)

### **第一阶段：默认启用 NTLM 签名**

Phase 1 已于 2026 年 11 月 10 日开始实施。此时 Windows 客户端默认对所有连接提供 NTLM 签名服务，而服务器端同时接受已签名和未签名的客户端请求。系统将记录未使用 NTLM 签名的客户端事件以供 IT 管理员追踪。

### **第二阶段：严格强制执行**

Phase 2 计划于 2027 年 5 月启动，执行力度更为严格。Windows Server 将默认要求 NTLM 签名，不支持签名的客户端将被 “secure servers” 拒绝。微软强调所有支持的 Windows Server 版本均具备 NTLM 签名能力，此次为分阶段强制策略而非新功能引入。

### **例外情况与技术细节**

guest 账户连接因”无实际特权”而不受此变更影响，强制其签名无法提升组织的网络安全态势。官方还提供了详细的技术文档说明管理员应监控的审计事件、新增注册表键及其可用值等信息。微软亦表示可能在未来某个时间点移除相关注册表键。

via [Neowin](https://www.neowin.net/news/latest-windows-updates-bring-major-ntlm-improvements/)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/windows-ntlm-security-improvements-november-2026.html) | [添加评论](https://windiscover.com/posts/windows-ntlm-security-improvements-november-2026.html#comments)

[微软修补 Windows NTLM 协议关键安全漏洞](https://windiscover.com/posts/windows-ntlm-security-improvements-november-2026.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/windows-ntlm-security-improvements-november-2026.html)
