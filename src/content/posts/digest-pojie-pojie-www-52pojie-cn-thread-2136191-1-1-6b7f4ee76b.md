---
title: "Magictools：windows的神奇妙妙工具"
published: 2026-11-06
description: "[md]# Magictools：解决Windows烦恼 相信很多人在面对Windows时，时常和我有一样的烦恼，右键菜单被一些无用的软件垃圾填满，windows自动更新难以关闭，每次重装就需要重新去查看一下注册表目录重新去设置一下，莫名 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "summer581"
sourceLink: "https://www.52pojie.cn/thread-2136191-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2136191-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

## Magictools：解决Windows烦恼

相信很多人在面对Windows时，时常和我有一样的烦恼，右键菜单被一些无用的软件垃圾填满，windows自动更新难以关闭，每次重装就需要重新去查看一下注册表目录重新去设置一下，莫名其妙的软件自启项，和一些文件的格式转换，还有内存的优化，对于计算机大佬来说这很简单，但是对于一个计算机小白，这无疑是十分麻烦的，这也是我开发这个工具箱的初衷。接下来给一些刚开始接触计算机这个行业的同学讲解一些小知识。（大佬勿喷）

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(105.71 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg5MjA1OXxiMDkyYzg1MXwxNzk0MDE0NzM0fDB8MjEzNjE5MQ%3D%3D&nothumb=yes)

2026-11-6 23:01 上传

### 0x00 右键菜单

windows的资源管理器会按「当前对象是什么」去 `HKEY_CLASSES_ROOT` 里找菜单。同一个右键会有很多层：先看这个对象自己的键，再看它的类型，最后看 `*` 和 `AllFilesystemObjects`。所以「文件」页和「所有对象」页看到的不是同一批项。

静态命令放在 `shell\`。显示名读 `MUIVerb`，没有就读默认值；要点击后执行的程序在子键 `command` 的默认值里。`@shell32.dll,-8506` 这种值不是标题，调用 `SHLoadIndirectString` 才能换成当前语言的文字。

`HKEY_CLASSES_ROOT\*\shell\OpenWith
    MUIVerb              REG_SZ
    command              REG_SZ     "C:\Program Files\App\app.exe" "%1"`
各页面实际读取的键：

页面
注册表位置

文件

---

[查看原文](https://www.52pojie.cn/thread-2136191-1-1.html)
