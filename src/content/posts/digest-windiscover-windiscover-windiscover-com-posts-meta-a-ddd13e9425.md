---
title: "Meta 广告投放恶意壁纸应用 SYS010 窃取敏感数据并监控邮件"
published: 2026-11-27
description: "Bitdefender 安全团队发现新型恶意软件 SYS010 通过 Meta 广告平台传播，伪装成动态壁纸应用在后台窃取用户敏感数据并监控 Gmail 与 Outlook 邮件账"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/meta-ads-malicious-live-wallpaper-app-sys010-steals-data.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/meta-ads-malicious-live-wallpaper-app-sys010-steals-data.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

Bitdefender 安全团队发现新型恶意软件 SYS010 通过 Meta 广告平台传播，伪装成动态壁纸应用在后台窃取用户敏感数据并监控 Gmail 与 Outlook 邮件账户。

![](https://cdn.neowin.com/news/images/uploaded/2026/11/1794995436_malware-detected-warning-screen-depositphotos_263293254_xl_full.webp)

### **攻击机制与技术实现**

研究人员于 **10 月 16 日**首次在 Facebook 平台识别到该恶意广告活动，截至目前仍有大量仿冒广告持续运行。该恶意软件伪装为 Lively Wallpapers 或 Wallpaper Engine 等正版动态壁纸应用，引导用户下载至官方外观的域名网站。

### **浏览器扩展强制安装手段**

恶意应用一旦安装便会修改浏览器管理策略，强制在 Chrome、Edge 或 Firefox 等浏览器中植入恶意扩展。在 Chrome 中，攻击者将浏览器注册在其控制的 Google 管理控制台内实现强制安装；Firefox 则通过策略漏洞完成扩展部署同时禁用开发者工具与滥用报告功能。

![](https://cdn.neowin.com/news/images/uploaded/2026/11/1795753068_ad.webp)

### **权限绕过与持久化控制**

常规情况下此类操作需要管理员权限，威胁行为体通过每三秒触发一次用户账户控制弹窗的方式规避限制，最多可达 **99 次**直至受害者批准请求。获得控制后恶意软件会阻止用户禁用或删除这些扩展组件。

### **数据窃取范围与安全建议**

恶意扩展可读取 Gmail 与 Outlook 账号内的最近邮件内容并将其发送至攻击者服务器，甚至删除选定邮件。Bitdefender 警告这使得威胁方能够拦截登录验证码并在受害者察觉前删除安全告警。安全公司建议用户勿从社交媒体广告下载可疑软件，同时企业应审查 Meta Ads 账户访问权限并检查异常活动。

via [Neowin](https://www.neowin.net/news/malicious-live-wallpaper-app-delivered-via-meta-ads-steals-sensitive-data-spies-on-emails/)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/meta-ads-malicious-live-wallpaper-app-sys010-steals-data.html) | [添加评论](https://windiscover.com/posts/meta-ads-malicious-live-wallpaper-app-sys010-steals-data.html#comments)

[Meta 广告投放恶意壁纸应用 SYS010 窃取敏感数据并监控邮件](https://windiscover.com/posts/meta-ads-malicious-live-wallpaper-app-sys010-steals-data.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/meta-ads-malicious-live-wallpaper-app-sys010-steals-data.html)
