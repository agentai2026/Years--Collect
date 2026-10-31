---
title: "Rufus 4.16 Beta 修复影响数百万电脑 NTFS 问题 新增 USB 4 支持"
published: 2026-10-31
description: "Rufus 发布新版 4.16 Beta，修复影响数百万电脑的 NTFS 驱动程序错误，同时增强 USB 设备识别能力。新版本通过确保文件连续写入避免触发该漏洞，并原生支持 USB"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/rufus-416-beta-fixes-ntfs-bug-new-usb-support.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/rufus-416-beta-fixes-ntfs-bug-new-usb-support.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

Rufus 发布新版 4.16 Beta，修复影响数百万电脑的 NTFS 驱动程序错误，同时增强 USB 设备识别能力。新版本通过确保文件连续写入避免触发该漏洞，并原生支持 USB 3.2 及 USB4 协议。

![](https://cdn.neowin.com/news/images/uploaded/2022/08/1660478268_rufus.jpg)

### **NTFS 固件漏洞修复机制**

开发者 Pete Batard 指出，AMI UEFI NTFS 驱动版本 0x10000 在读取碎片化文件时存在严重缺陷。当文件数据分散存储于非连续簇时，驱动会返回错误数据导致启动介质验证失败。新解决方案强制将文件连续写入 NTFS 分区，类似 7-Zip 自 17.0 版本采用的优化策略。

### **USB 协议识别升级**

工具现可精确识别 USB 3.2 (20Gbps)、USB4 (40Gbps) 及 USB4 2.0 (80Gbps) 设备规格。此改进解决了此前无法区分不同 USB 标准的痛点，帮助用户准确判断外接存储设备性能上限。

### **系统兼容性优化**

更新包含多项底层修复：修正 ESP 分区挂载逻辑错误，解决非英语区域时区重复显示问题，移除有问题的组策略依赖。嵌入式组件 GRUB 更新至 2.16 版，libcdio 库同步升级至最新状态。

### **下载地址与注意事项**

当前 Beta 版本提供经典右键菜单恢复、静默安装选项优化等功能。用户需从 Neowin 软件页或 GitHub 官方仓库获取，建议重要场景使用前先行测试稳定性。

via [Neowin](https://www.neowin.net/news/rufus-brings-improved-usb-reporting-fixes-ntfs-bug-affecting-millions-of-pcs/)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/rufus-416-beta-fixes-ntfs-bug-new-usb-support.html) | [添加评论](https://windiscover.com/posts/rufus-416-beta-fixes-ntfs-bug-new-usb-support.html#comments)

[Rufus 4.16 Beta 修复影响数百万电脑 NTFS 问题 新增 USB 4 支持](https://windiscover.com/posts/rufus-416-beta-fixes-ntfs-bug-new-usb-support.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/rufus-416-beta-fixes-ntfs-bug-new-usb-support.html)
