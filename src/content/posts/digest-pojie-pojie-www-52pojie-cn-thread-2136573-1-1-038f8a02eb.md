---
title: "《帝国时代 IV》.rlc 炼狱模式存档的加密算法与文件结构"
published: 2026-11-09
description: "[md]> 不涉及游戏本体修改、不涉及 DRM、不涉及联机。 --- ## 一、这是什么文件 《帝国时代 IV》炼狱模式玩家数据的进度落在： ``` %USERPROFILE%\\\\Documents\\\\My Games\\\\Age of Empires IV%users\\\\\\\\datastore\\\\rogue_mode."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "StackPointer"
sourceLink: "https://www.52pojie.cn/thread-2136573-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2136573-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

>
不涉及游戏本体修改、不涉及 DRM、不涉及联机。

### 一、这是什么文件

《帝国时代 IV》炼狱模式玩家数据的进度落在：

`%USERPROFILE%\Documents\My Games\Age of Empires IV\Users\\datastore\rogue_mode.rlc`
`datastore\cloud\` 下还有一份 Steam 云同步用的副本，格式完全相同。

文件本身 4KB 左右，长度总是 16 的整数倍，整段高熵 —— 分组密码 + PKCS#7 填充的标准特征。

### 二、算法一览

项目
值

对称算法

---

[查看原文](https://www.52pojie.cn/thread-2136573-1-1.html)
