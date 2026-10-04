---
title: "Windows 如何快速查找锁定文件的后台进程"
published: 2026-10-04
description: "当尝试删除、重命名或移动文件时，若因其他应用占用而失败，通常可通过系统内置工具或第三方软件定位锁定进程，避免重启电脑。微软提供了 Resource Monitor 资源监视器和 P"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/how-to-find-locked-file-process-windows.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/how-to-find-locked-file-process-windows.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

当尝试删除、重命名或移动文件时，若因其他应用占用而失败，通常可通过系统内置工具或第三方软件定位锁定进程，避免重启电脑。微软提供了 Resource Monitor 资源监视器和 PowerToys 中的 File Locksmith 文件锁匠两种方法供用户选择。

![](https://cdn.neowin.com/news/images/uploaded/2026/10/1790951575_find_out_locked_files_story.webp)

### **方法一：使用资源监视器**

资源监视器可直接搜索打开的文件句柄并显示当前持有文件的进程。操作步骤如下：按下 Win + R 键输入 resmon 并回车，进入 CPU 选项卡后展开 Associated Handles 区域，在搜索框输入文件名的一部分等待结果，最后在匹配项旁查看进程名称关闭对应应用即可重新访问文件。

![](https://cdn.neowin.com/news/images/uploaded/2026/10/1790952531_find_locked_windows_files_1_story.webp)

需要注意的是搜索结果可能出现 explorer.exe，此时不建议直接结束 Windows Explorer 进程。多数情况下并非文件管理器阻止删除，更可能是其他进程所致。如确认涉及文件管理器应先关闭相关文件窗口，或通过任务管理器安全重启 explorer 而非强制终止 shell 进程。

### **方法二：使用 PowerToys 文件锁匠**

对于安装了 PowerToys 的用户，File Locksmith 提供更快捷的解决方案。开启该功能后右键目标文件或文件夹选择显示更多选项，点击 Unlock with File Locksmith 即可查看占用进程列表。该方法针对选定文件直接检查而非手动遍历系统句柄，效率更高且界面更直观。卸载后可通过 Microsoft Store 或官方 GitHub 页面重新获取此免费工具。

![](https://cdn.neowin.com/news/images/uploaded/2026/10/1790952500_find_locked_windows_files_2_story.webp)

无论采用哪种方法，关键是要先确认进程身份再执行关闭操作，避免因盲目终止系统进程导致异常。资源监视器适合不想额外安装软件的场景，而 File Locksmith 则提供更精准快速的定位体验。

via [Neowin](https://www.neowin.net/guides/how-to-find-which-app-or-process-is-locking-a-file-in-windows/?utm_source=rss)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/how-to-find-locked-file-process-windows.html) | [添加评论](https://windiscover.com/posts/how-to-find-locked-file-process-windows.html#comments)

[Windows 如何快速查找锁定文件的后台进程](https://windiscover.com/posts/how-to-find-locked-file-process-windows.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/how-to-find-locked-file-process-windows.html)
