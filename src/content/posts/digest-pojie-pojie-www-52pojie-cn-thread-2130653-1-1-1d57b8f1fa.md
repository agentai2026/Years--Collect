---
title: "《血战上海滩》九项属性修改器 源代码分享"
published: 2026-10-01
description: "[md]# ShanghaiTrainer源代码 欢迎学习ShanghaiTrainer软件源代码！本源码讨论的话题是早期国产游戏的内存写入演示、加密INI读写、游戏资源文件提取等课题，供逆向初学者学习。 本源码遵循Creative Commons At ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "烟99"
sourceLink: "https://www.52pojie.cn/thread-2130653-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2130653-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

## ShanghaiTrainer源代码

欢迎学习ShanghaiTrainer软件源代码！本源码讨论的话题是早期国产游戏的内存写入演示、加密INI读写、游戏资源文件提取等课题，供逆向初学者学习。

本源码遵循Creative Commons Attribution - NonCommercial许可协议，禁止商业用途！

本帖为之前的我的逆向文章的关联帖子之一

传送门：

>
【致初学修改器的你】如何优雅的杀敌以做到英雄无敌?记一次血战上海滩修改器制作过程

[https://www.52pojie.cn/thread-2024353-1-1.html](https://www.52pojie.cn/thread-2024353-1-1.html)

(出处: 吾爱破解论坛)

这次优化了弹药无限的实现方式，从之前的锁内存数改为nop掉dec，还追加了突破连发限制的修改项，单发武器也可以连发了，这意味着你可以用巴祖卡突突突了，爽炸天！

#### 郑重声明

1、修改器提供的所有功能仅限个人学习研究使用，通过修改器的附加功能所获得的游戏资源文件之版权归相关公司所有，严禁将所获得的游戏资源文件用于其他用途，修改器设计者概不承担因而造成的一切后果。

2、软件遵循Creative Commons Attribution - NonCommercial许可协议，禁止用于商业用途。

#### 基本信息

源码名称：ShanghaiTrainer

源码版本：1.0.1

遵循协议：Creative Commons Attribution - NonCommercial

源码语言：C#

.NET Framework框架版本：4.5

#### 基本介绍

本修改器可以实现弹药锁定、追加积分和杀敌、清空误伤平民等功能，还可以实现窗口模式运行游戏，并额外追加了INI文件加解密和PCK打包解包功能，以满足不同人的需要。

#### 更新日志

;--------------------------------------------

2026.10.01 -- v1.0.1

;--------------------------------------------

1、优化修改项的实现方式。

2、新增修改项，它能让手枪、步枪和巴祖卡这样的单发武器像冲锋枪一样能够连发（手榴弹暂不支持）。推荐搭配修改项使用，可以做到终极必杀。

;--------------------------------------------

2025.04.15 -- v1.0.0

;--------------------------------------------

1、修改器正式发布。

#### 测试截图

![](https://static.52pojie.cn/static/image/common/none.gif)

**QQ2026101-19388.gif** *(738.06 KB, 下载次数: 2)*

[下载附件](forum.php?mod=attachment&aid=Mjg4Mjc5NHw2ZTUwZjdiMHwxNzkxMDAzNzg3fDB8MjEzMDY1Mw%3D%3D&nothumb=yes)

2026-10-1 19:42 上传

#### 如何编译

1、本项目依赖于.NET Framework V4.5运行，原则上Visual Studio 2015就可以编译，但是本人是在Visual Studio 2022中编译的，因此建议在Visual Studio 2022中编译。

2、本项目引用了zlib.NET源码库，这部分源码略，编译前请自行到官网下载并添加到项目中。

#### 意见或建议

可通过论坛回帖留言的方式反馈，也可私信该帖楼主也就是我来反馈。禁止留QQ、微信等联系方式，对利用私信留联系方式的行为将从重处罚！

#### 源码链接

游客，如果您要查看本帖隐藏内容请[回复](forum.php?mod=post&action=reply&fid=24&tid=2130653)

---

[查看原文](https://www.52pojie.cn/thread-2130653-1-1.html)
