---
title: "微软将在新 Windows Outlook 及网页版中屏蔽更多邮件附件"
published: 2026-10-06
description: "微软宣布将在 New Outlook for Windows 和 Outlook 网页版中扩展受限制的邮件附件类型列表。自 2026 年 11 月初起，.msix 和 .msixb"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/microsoft-outlook-block-msix-attachments.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/microsoft-outlook-block-msix-attachments.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

微软宣布将在 New Outlook for Windows 和 Outlook 网页版中扩展受限制的邮件附件类型列表。自 2026 年 11 月初起，.msix 和 .msixbundle 格式的文件将成为新的受限附件类型。

![](https://cdn.neowin.com/news/images/uploaded/2025/06/1749575190_exchange_outlook_story.webp)

### **技术背景与风险考量**

MSIX 作为微软现代化的 Windows 应用封装格式，旨在提供更安全的安装体验。然而该格式曾被攻击者利用 ms-appinstaller: 协议进行恶意软件传播。2023 年 12 月微软已禁用默认响应协议，现进一步从邮件系统层面阻断相关威胁路径。

### **实施时间与范围**

更新计划于 **2026 年 11 月** 启动部署，预计中旬完成全球环境（含 GCC、DoD 等）推送。安全类更新通常优先保障执行进度，实际生效时间可能提前至 12 月初。

### **企业应对建议**

Microsoft 365 管理员可通过设置 OwaMailboxPolicy 对象的 AllowedFileTypes 属性保留特定文件传输权限。官方文档提供 PowerShell 配置指南，默认允许文件类型清单将在支持页面同步更新。

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/microsoft-outlook-block-msix-attachments.html) | [添加评论](https://windiscover.com/posts/microsoft-outlook-block-msix-attachments.html#comments)

[微软将在新 Windows Outlook 及网页版中屏蔽更多邮件附件](https://windiscover.com/posts/microsoft-outlook-block-msix-attachments.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/microsoft-outlook-block-msix-attachments.html)
