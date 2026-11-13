---
title: "微软修复Windows Server 补丁 解决Chrome与Edge浏览器兼容问题"
published: 2026-11-13
description: "微软通过最新安全更新修复了Windows Server的远程桌面Web访问功能，解决因浏览器移除XSLT支持导致的兼容性中断风险。该补丁已在Windows Server 2016至"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/microsoft-patches-windows-server-fix-chrome-edge-compatibility.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/microsoft-patches-windows-server-fix-chrome-edge-compatibility.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

微软通过最新安全更新修复了Windows Server的远程桌面Web访问功能，解决因浏览器移除XSLT支持导致的兼容性中断风险。该补丁已在Windows Server 2016至2025版本推送。

![](https://cdn.neowin.com/news/images/uploaded/2024/07/1722170868_windows_server_full.jpg)

### **XSLT支持弃用引发的兼容危机**

Google计划在2026年11月17日停止默认支持XSLT技术，这将导致依赖该技术渲染界面的远程桌面门户无法正常加载。由于RD Web Access界面基于Extensible Stylesheet Language Transformations构建，浏览器功能调整直接威胁企业级远程管理服务的可用性。

![](https://cdn.neowin.com/news/images/uploaded/2024/07/1722170868_windows_server.jpg)

### **服务器端渲染架构升级方案**

本次安全更新KB5131080重构了RD Web Access页面渲染流程，将原本依赖浏览器处理的部分转移至服务器端完成。这种架构调整使远程访问功能完全脱离浏览器XSLT依赖，彻底规避兼容风险。

### **临时缓解方案退出历史舞台**

此前微软建议管理员启用Edge浏览器Internet Explorer模式或手动恢复XSLT支持作为临时解决方案。新补丁发布后允许组织取消过渡性配置，回归标准浏览器策略部署。

### **多版本系统覆盖范围**

此次修复支持Windows Server 2016、2019、2022及最新版2025，企业需在谷歌Chrome 158大规模推送前完成补丁部署，避免远程服务突发中断风险。

via [Neowin](https://www.neowin.net/news/microsoft-patches-windows-server-feature-that-was-about-to-break-in-google-chrome-and-edge/)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/microsoft-patches-windows-server-fix-chrome-edge-compatibility.html) | [添加评论](https://windiscover.com/posts/microsoft-patches-windows-server-fix-chrome-edge-compatibility.html#comments)

[微软修复Windows Server 补丁 解决Chrome与Edge浏览器兼容问题](https://windiscover.com/posts/microsoft-patches-windows-server-fix-chrome-edge-compatibility.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/microsoft-patches-windows-server-fix-chrome-edge-compatibility.html)
