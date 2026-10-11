---
title: "如何查找 Windows 11 中的隐藏启动应用和进程"
published: 2026-10-11
description: "Windows 任务管理器仅显示部分启动项，而大量应用、服务和脚本会在系统启动时自动运行却不在此列表中。微软提供的 Sysinternals Autoruns 工具可以扫描所有位置"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/how-to-find-hidden-startup-apps-and-processes-in-windows-11.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/how-to-find-hidden-startup-apps-and-processes-in-windows-11.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

Windows 任务管理器仅显示部分启动项，而大量应用、服务和脚本会在系统启动时自动运行却不在此列表中。微软提供的 Sysinternals Autoruns 工具可以扫描所有位置，完整展示系统启动时的全部项目。

![](https://cdn.neowin.com/news/images/uploaded/2026/10/1791579303_autoruns_story.webp)

### **Autoruns 工具简介**

Autoruns 属于 Microsoft Sysinternals 套件的一部分，该套件还包括 Sysmon 和其他实用系统诊断工具。它会扫描 Windows 用于自动启动软件的所有不同位置，将信息集中在单一界面中展示。

![](https://cdn.neowin.com/news/images/uploaded/2026/10/1791579338_autoruns_windows_11_story.webp)

### **安装与基本操作**

首先从微软官方网站下载 Autoruns 并解压归档文件。以管理员身份运行 Autoruns64.exe 后等待几秒完成系统扫描。界面包含多个标签页分别对应不同类型的启动项：

- Logon（登录）标签：查看登录时启动的程序

- Scheduled Tasks（计划任务）标签：查看通过任务计划程序启动的软件

- Services（服务）标签：查看配置为随 Windows 启动的后台服务

- Everything（全部）标签：一次性查看所有启动项

### **筛选微软组件与禁用启动项**

初始列表可能过于庞大因为 Windows 本身创建了大量自动启动条目。在 Options > Hide Microsoft Entries 选项中勾选隐藏，可移除大部分微软组件使第三方软件更易识别。找到不需要的条目后取消勾选即可禁用，不会删除原始项目以便后续恢复。Autoruns 还会显示每个条目的来源位置如注册表键值、计划任务、启动文件夹或服务。

此工具有重要前提需要提醒：Autoruns 暴露的大量启动项中包含系统服务、驱动程序等重要组件，这些对 Windows 正常运行必不可少。如果不确定某项功能请预先查询后再关闭。对于大多数用户，Logon、Scheduled Tasks 和 Services 是最重要的几个板块，建议仔细查看这些列表寻找潜在的可禁用项目。

via [Neowin](https://www.neowin.net/guides/how-to-find-hidden-startup-apps-and-processes-in-windows-11/?utm_source=rss)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/how-to-find-hidden-startup-apps-and-processes-in-windows-11.html) | [添加评论](https://windiscover.com/posts/how-to-find-hidden-startup-apps-and-processes-in-windows-11.html#comments)

[如何查找 Windows 11 中的隐藏启动应用和进程](https://windiscover.com/posts/how-to-find-hidden-startup-apps-and-processes-in-windows-11.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/how-to-find-hidden-startup-apps-and-processes-in-windows-11.html)
