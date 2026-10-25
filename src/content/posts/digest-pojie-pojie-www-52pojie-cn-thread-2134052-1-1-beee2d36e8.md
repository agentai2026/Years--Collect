---
title: "微信公众号归档工具，wechat-mp-archive，V1.3"
published: 2026-10-24
description: "[md]# 自己撸了个微信公众号归档工具：文章 + 评论一键导出 Markdown / HTML / TXT / PDF（开源） ## 起因：公众号后台「搜索文章」接口被关了 做这个工具的直接原因很朴素：想给自己的公众号做一份离线备份。 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "cxs808"
sourceLink: "https://www.52pojie.cn/thread-2134052-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2134052-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

## 自己撸了个微信公众号归档工具：文章 + 评论一键导出 Markdown / HTML / TXT / PDF（开源）

### 起因：公众号后台「搜索文章」接口被关了

做这个工具的直接原因很朴素：想给自己的公众号做一份离线备份。

以前用后台的「搜索文章」接口能翻历史列表，2026-07-30 前后这个接口下线了，剩下的路子只能拿到最近几十篇（比如 40 篇），更早的文章翻不出来。

手上几百篇文章，靠手动一篇篇复制显然不现实，于是就有了这个工具。

- 项目地址：[https://github.com/wallechfox/wechat-mp-archive](https://github.com/wallechfox/wechat-mp-archive)

- 当前版本：v1.3

- 形态：本地跑一个 网页，浏览器打开 `127.0.0.1:5000` 点点点就行，不用命令行

- 环境：Python 3.8+（3.14 实测可用），依赖就 requests / flask / playwright 这几个库

### 能干什么

工具做了三种模式，覆盖三种典型场景：

模式
适用对象
数据来源
能拿到什么
登录方式

模式 1

---

[查看原文](https://www.52pojie.cn/thread-2134052-1-1.html)
