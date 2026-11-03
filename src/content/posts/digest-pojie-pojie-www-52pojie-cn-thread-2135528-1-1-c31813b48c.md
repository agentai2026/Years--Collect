---
title: "VS2022 Windows Installer 缓存缺失扫描与修复工具"
published: 2026-11-03
description: "VS2022 Windows Installer 缓存缺失扫描与修复工具"
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "ldkj2022"
sourceLink: "https://www.52pojie.cn/thread-2135528-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2135528-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

VS2022 Windows Installer 缓存缺失扫描与修复工具

=============================================

功能：

  1. 全量扫描 UserData 注册表中所有已登记产品的 LocalPackage 缓存文件是否存在

  2. 自动匹配 VS 包目录 (D:\\ProgramData\\Microsoft\\VisualStudio\\Packages) 中的 MSI 源

  3. 一键提权补缓存（复制到 C:\\WINDOWS\\Installer）

  4. 一键提权触发 setup.exe repair（--passive --norestart）

  5. 检查最近一次修复的 errors.log（空 = 成功）

用法：

  双击运行（GUI）；或命令行：

    python vs_cache_repair_tool.py --scan          # 仅扫描，输出 JSON 到 stdout

    python vs_cache_repair_tool.py --place   # 提权子进程：按清单补缓存（内部使用）

  需要管理员权限的操作（补缓存 / repair）会自动弹 UAC，由 ShellExecuteW runas 提权。

---

[查看原文](https://www.52pojie.cn/thread-2135528-1-1.html)
