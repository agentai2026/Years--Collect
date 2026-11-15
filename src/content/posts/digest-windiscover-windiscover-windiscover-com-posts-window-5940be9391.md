---
title: "Windows 11 在 IPv6-only 网络下无法通过 OOBE 初始设置"
published: 2026-11-15
description: "用户在部署 Windows 11 时发现一个隐蔽的网络识别问题：当设备连接到仅支持 IPv6 的网络时，初始设置体验（OOBE）会中途报错中断，尽管系统界面显示互联网已连接。 问题"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/windows-11-ipv6-only-network-oobe-issue.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/windows-11-ipv6-only-network-oobe-issue.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

用户在部署 Windows 11 时发现一个隐蔽的网络识别问题：当设备连接到仅支持 IPv6 的网络时，初始设置体验（OOBE）会中途报错中断，尽管系统界面显示互联网已连接。

![](https://cdn.neowin.com/news/images/uploaded/2022/06/1654793970_2-ventura-bloom-dark_full.jpg)

### **问题复现与测试过程**

这一发现由 X 平台用户 Bob Pony 提出。他在仅有 IPv6 连通性而无 IPv4 的网络环境中测试 Windows 11 初始设置过程，系统虽然显示”已连接互联网”，但尝试继续操作时会弹出错误提示，声称互联网连接已丢失。Bob Pony 在最新版本 Windows 11 Insider 构建上也重复了相同测试，结果显示此问题并非局限于特定版本。

### **潜在影响范围**

另一位 X 用户 Spring 补充指出，如果设备因某种原因缺少 IPv4（例如与其他设备的 IP 地址冲突），用户在初始设置阶段可能完全被锁定或卡住。有分析认为微软并未将 IPv6 纳入官方支持方案，导致此类配置下无法完成部署。

![](https://pbs.twimg.com/amplify_video_thumb/2121552493985288192/img/ZfqX3YD_OY-U4sFI.jpg)

### **问题性质讨论**

目前尚不清楚这是临时性程序缺陷还是未来的正式需求限制。如果确属后者，对于依赖 IPv6-only 网络架构的企业或家庭网络环境而言，可能需要额外的网络桥接方案才能顺利完成 Windows 11 安装流程。

![](https://cdn.neowin.com/news/images/uploaded/2022/06/1654793970_2-ventura-bloom-dark.jpg)

via [Neowin](https://www.neowin.net/news/user-unexpectedly-finds-surprising-windows-11-internet-requirement-microsoft-doesnt-warn-on/)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/windows-11-ipv6-only-network-oobe-issue.html) | [添加评论](https://windiscover.com/posts/windows-11-ipv6-only-network-oobe-issue.html#comments)

[Windows 11 在 IPv6-only 网络下无法通过 OOBE 初始设置](https://windiscover.com/posts/windows-11-ipv6-only-network-oobe-issue.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/windows-11-ipv6-only-network-oobe-issue.html)
