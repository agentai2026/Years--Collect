---
title: "清理C盘的AppData"
published: 2026-11-03
description: "AppData 空间分析工具 ================================================================ 扫描 AppData(Local / LocalLow / Roaming) 下各软件数据目录的占用空间， 自动识别缓存、临时文件等\\\"可安全清理\\\"目录，支持"
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "ldkj2022"
sourceLink: "https://www.52pojie.cn/thread-2135529-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2135529-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

AppData 空间分析工具

================================================================

扫描 AppData(Local / LocalLow / Roaming) 下各软件数据目录的占用空间，

自动识别缓存、临时文件等"可安全清理"目录，支持一键移入回收站（带进度显示）。

用法

----

图形界面 :  python appdata_analyzer.py                  （启动后不自动扫描，点击"开始分析"才开始）

命令行   :  python appdata_analyzer.py --scan [目录] [--csv 输出.csv]

界面自检 :  python appdata_analyzer.py --gui-test       （隐藏窗口自动关闭，用于验证）

依赖     : 仅 Python 标准库（tkinter / os / ctypes），无需安装第三方包。

---

[查看原文](https://www.52pojie.cn/thread-2135529-1-1.html)
