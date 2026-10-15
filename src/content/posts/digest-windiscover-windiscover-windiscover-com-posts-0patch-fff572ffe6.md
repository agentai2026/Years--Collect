---
title: "0patch 为旧版 Windows Server 提供 DNS 远程代码执行漏洞紧急补丁"
published: 2026-10-14
description: "第三方微补丁服务提供商 0patch 正在为旧版 Windows Server 操作系统紧急部署针对一项高危 DNS 远程代码执行漏洞的保护措施。该漏洞允许攻击者通过特制的 DNS"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/0patch-protects-legacy-windows-server-from-dns-rce-vulnerability-2.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/0patch-protects-legacy-windows-server-from-dns-rce-vulnerability-2.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

第三方微补丁服务提供商 0patch 正在为旧版 Windows Server 操作系统紧急部署针对一项高危 DNS 远程代码执行漏洞的保护措施。该漏洞允许攻击者通过特制的 DNS 数据包在目标服务器上执行任意代码。

### **漏洞严重性与影响范围**

此次披露的漏洞影响尚未获得微软延长期支持的旧版 Windows Server 版本。DNS 服务作为基础网络基础设施，一旦遭到远程代码执行攻击，可能导致服务器完全失陷，数据泄露或被用于后续横向移动攻击。

### **0patch 应急修复方案**

0patch 推出的微补丁方案允许企业在不重启系统的情况下应用修复。这种临时性解决方案特别适用于难以停机维护的生产环境，能够在微软正式补丁发布前提供额外的安全防护层。

### **安全建议与官方立场**

微软建议受影响的客户尽快升级至仍在支持周期内的操作系统版本。在迁移完成前，应配置防火墙规则限制 DNS 端口访问，并启用入侵检测系统监控异常流量模式。

via [Neowin](https://www.neowin.net/news/0patch-protects-legacy-windows-server-versions-from-critical-dns-remote-code-execution/?utm_source=rss)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/0patch-protects-legacy-windows-server-from-dns-rce-vulnerability-2.html) | [添加评论](https://windiscover.com/posts/0patch-protects-legacy-windows-server-from-dns-rce-vulnerability-2.html#comments)

[0patch 为旧版 Windows Server 提供 DNS 远程代码执行漏洞紧急补丁](https://windiscover.com/posts/0patch-protects-legacy-windows-server-from-dns-rce-vulnerability-2.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/0patch-protects-legacy-windows-server-from-dns-rce-vulnerability-2.html)
