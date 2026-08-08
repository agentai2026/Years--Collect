---
title: "Windscribe 发布开源工具 deGDID 可禁用 Windows 11 的隐藏设备追踪标识符"
published: 2026-08-07
description: "上月披露的法律文件显示，微软为每份 Windows 安装分配一个持久的 Global Device Identifier（GDID），该标识符可在特定微软服务间唯一识别设备。VPN"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/windscribe-degdid-windows-11-gdid-tracker.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/windscribe-degdid-windows-11-gdid-tracker.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

上月披露的法律文件显示，微软为每份 Windows 安装分配一个持久的 Global Device Identifier（GDID），该标识符可在特定微软服务间唯一识别设备。VPN 服务提供商 Windscribe 现已发布免费开源工具 deGDID，用于永久移除并阻止该标识符的重新生成。

![](https://cdn.neowin.com/news/images/uploaded/2026/07/1784770314_windows_11_watchers_story.webp)

### **GDID 的工作原理**

GDID 是微软服务器生成的设备级标识符，与 Windows 安装绑定。不同于计算机名或硬件序列号，该标识符旨在跨微软服务保持一致性，用于关联来自同一 Windows 安装的活动数据。微软在技术文档和法律文件中承认该标识符的存在，但 Windows 未提供手动禁用或重新生成的内置选项。

### **deGDID 的技术实现**

Windscribe 指出，单纯删除注册表值不足以解决问题，因为 Windows 会自动从微软服务器重新下载并重建该标识符。deGDID 采用双重防护机制：

- 通过修改 Windows hosts 文件屏蔽已知微软注册路径，并辅以 Windows 防火墙规则加固拦截

- 清除目标用户、SYSTEM、.DEFAULT 身份位置、Token 设备 ID、设备票据、凭据管理器条目、ConnectedDevicesPlatform、TokenBroker、WAM 代理缓存及匹配的 NegativeCache 条目中的本地 GDID 相关状态

### **使用方式与系统兼容性**

该工具无需修改 Windows 系统文件即可运行。用户可通过命令行执行以下操作：

- 执行 `.\degdid.ps1 -Status` 进行只读检查

- 执行 `.\degdid.ps1 -Status -Redact` 在分享输出前进行脱敏处理

- 执行 `.\degdid.ps1 -Protect` 启动标准保护流程：先拦截、验证拦截、清除本地状态、等待、重新盘点，最后输出结果报告

官方表示该工具理论上支持所有 Windows 11 版本（**21H2 至 25H2**）以及 Windows 10 版本 **22H2**。

### **隐私权衡与注意事项**

由于标识符在服务器端生成，deGDID 无法删除微软已关联的历史记录，仅能阻止未来新标识符的签发。Windscribe 警告，禁用 GDID 可能影响依赖设备识别的微软服务，测试期间未发现问题，但边缘场景下某些 Windows 功能或服务可能出现异常。该工具支持撤销操作，用户可通过管理员权限命令提示符执行 `.\degdid.ps1 -Unprotect` 恢复原始状态。

via [Neowin](https://www.neowin.net/news/permanently-disable-microsofts-hidden-tracker-on-all-windows-11-versions-with-this-script/)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/windscribe-degdid-windows-11-gdid-tracker.html) | [添加评论](https://windiscover.com/posts/windscribe-degdid-windows-11-gdid-tracker.html#comments)

[Windscribe 发布开源工具 deGDID 可禁用 Windows 11 的隐藏设备追踪标识符](https://windiscover.com/posts/windscribe-degdid-windows-11-gdid-tracker.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/windscribe-degdid-windows-11-gdid-tracker.html)
