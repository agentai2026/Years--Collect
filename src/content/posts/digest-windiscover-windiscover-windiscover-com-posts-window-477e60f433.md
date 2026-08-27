---
title: "微软通过阻止 inpoutx64 驱动修复 Windows 11 KB5121003 游戏崩溃问题"
published: 2026-08-27
description: "微软已完成对 Windows 11 KB5121003 更新相关问题的调查，确认部分游戏崩溃与意外重启问题由 RGB 控制应用安装的 inpoutx64 系统驱动引发。该公司已开始"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/windows-11-kb5121003-rgb-driver-fix.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/windows-11-kb5121003-rgb-driver-fix.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

微软已完成对 Windows 11 **KB5121003** 更新相关问题的调查，确认部分游戏崩溃与意外重启问题由 RGB 控制应用安装的 **inpoutx64** 系统驱动引发。该公司已开始向受影响的设备推送自动修复方案。

![](https://cdn.neowin.com/news/images/uploaded/2022/10/1666776970_windows_11_logo_story.jpg)

### **问题确认与原因分析**

微软调查显示，RGB 控制软件可能安装文件名类似 inpoutx64 的驱动或代码组件。当受影响系统启动特定游戏时，该驱动会触发兼容性问题，导致系统意外重启或崩溃。

### **自动修复方案**

微软已开始通过自动更新推送解决方案，在受影响设备上阻止 inpoutx64 驱动加载。目前该阻止机制主要针对已启用此驱动且安装 **ARC Raiders** 的系统。

阻止生效后，Windows 将禁用该驱动并显示通知信息，之后游戏应能正常启动。微软正将阻止范围扩展至安装 **MARVEL Tōkon: Fighting Souls** 的系统。Embark Studios 已自行解决 **THE FINALS** 的兼容性问题。

该修复方案正自动推送至非托管的消费者和企业设备，设备需重启方可生效，预计 24 小时内覆盖全部受影响 PC。此驱动阻止机制也将纳入 2026 年 9 月及后续 Windows 补丁更新。

### **手动解决方法**

企业托管设备需由 IT 管理员手动应用修复。微软同时提供了注册表临时禁用方案作为备选：

打开注册表编辑器，导航至 **HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\inpoutx64**，找到 **Start** 值并将其数据改为 **4**，完成后重启 PC。

微软建议在修改注册表前进行备份。禁用该驱动可能导致 RGB 外设或组件的灯光控制功能失效，如需恢复可将 Start 值改回原设置并重启。

via [Neowin](https://www.neowin.net/news/microsoft-is-blocking-the-problem-to-fix-windows-11-kb5121003-restarts-crashes/)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/windows-11-kb5121003-rgb-driver-fix.html) | [添加评论](https://windiscover.com/posts/windows-11-kb5121003-rgb-driver-fix.html#comments)

[微软通过阻止 inpoutx64 驱动修复 Windows 11 KB5121003 游戏崩溃问题](https://windiscover.com/posts/windows-11-kb5121003-rgb-driver-fix.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/windows-11-kb5121003-rgb-driver-fix.html)
