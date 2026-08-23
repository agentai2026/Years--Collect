---
title: "调试Lazarus源码F7进入不了排查过程记录"
published: 2026-08-22
description: "一、新建一个Lazarus项目，在CreateForm处下断点，F7追踪 发现跟踪到下图后F7进入不了Create(其实我想跟踪到最根上TObject)，直接到了下一句 二、看到这种现象后，想着从源码重新构建一个调试版本(编译器、 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "lrj2025kernel"
sourceLink: "https://www.52pojie.cn/thread-2124233-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2124233-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

**一、新建一个Lazarus项目，在CreateForm处下断点，F7追踪**

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(14.67 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3Mzk0N3wyYzBlMmE3N3wxNzg3NDM5NzM4fDB8MjEyNDIzMw%3D%3D&nothumb=yes)

断点处

2026-8-22 11:27 上传

发现跟踪到下图后F7进入不了Create(其实我想跟踪到最根上TObject

![](https://static.52pojie.cn/static/image/smiley/default/lol.gif)

)，直接到了下一句

![](https://static.52pojie.cn/static/image/common/none.gif)

**进不去上一级.png** *(36.43 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3Mzk1MnwyNWVmNGU3ZHwxNzg3NDM5NzM4fDB8MjEyNDIzMw%3D%3D&nothumb=yes)

进不去

2026-8-22 11:36 上传

二、看到这种现象后，想着从源码重新构建一个调试版本(编译器、Lazarus IDE等都从源码构建)方便查看底层，先给一个总图：

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(53.27 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3Mzk1NnxhNTM2MDFjM3wxNzg3NDM5NzM4fDB8MjEyNDIzMw%3D%3D&nothumb=yes)

总图

2026-8-22 11:46 上传

三、总体分两大块构建编译器FPC、构建Lazarus IDE，它们的目录结构如图：

简洁版：

![](https://static.52pojie.cn/static/image/common/none.gif)

**目录结构.png** *(15.4 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3Mzk1N3xhM2Y3YTUzZnwxNzg3NDM5NzM4fDB8MjEyNDIzMw%3D%3D&nothumb=yes)

简洁目录

2026-8-22 11:55 上传

详细版：

![](https://static.52pojie.cn/static/image/common/none.gif)

**详细目录.png** *(60.39 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3Mzk1OHwzNDZjMWY2OXwxNzg3NDM5NzM4fDB8MjEyNDIzMw%3D%3D&nothumb=yes)

详细目录

2026-8-22 11:55 上传

四、编译总图于运行依赖总图

![](https://static.52pojie.cn/static/image/common/none.gif)

**编译总图与运行时依赖图.png** *(38 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3Mzk2M3wwYjFlZGQ0OHwxNzg3NDM5NzM4fDB8MjEyNDIzMw%3D%3D&nothumb=yes)

编译总图

2026-8-22 12:13 上传

五、这些源码目录中有很多文件，以下是对重要文件拓展名解释

![](https://static.52pojie.cn/static/image/common/none.gif)

**拓展名.png** *(111.37 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3Mzk2OXw3YTAzNGIyNXwxNzg3NDM5NzM4fDB8MjEyNDIzMw%3D%3D&nothumb=yes)

拓展名

2026-8-22 12:46 上传

六、构建编译器FPC,采用“自举”（Bootstrap）过程——即用旧编译器编译出新编译器，经典自举如图

![](https://static.52pojie.cn/static/image/common/none.gif)

**编译器自举流程.png** *(11.22 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3Mzk1OXw0NDgzOWNkYnwxNzg3NDM5NzM4fDB8MjEyNDIzMw%3D%3D&nothumb=yes)

自举

2026-8-22 12:02 上传

一个常见的实践是，用一个稍早版本（例如 3.0.x）来首次编译 3.2.2，一旦成功，后续就可以用编译出的新版 3.2.2 来“自举”编译，这里官方直接推荐用FPC3.2.2做引导编译器

![](https://static.52pojie.cn/static/image/common/none.gif)

**FPC自举过程.png** *(18.64 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3Mzk2MnwyZDUwMjg1ZnwxNzg3NDM5NzM4fDB8MjEyNDIzMw%3D%3D&nothumb=yes)

自举过程

2026-8-22 12:12 上传

七、构建空目录

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(17.11 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3Mzk2NXwwZGRkMGI5ZHwxNzg3NDM5NzM4fDB8MjEyNDIzMw%3D%3D&nothumb=yes)

FPC目录

2026-8-22 12:20 上传

上图位FPC目录：output存储编译结果，带调试符号的FPC，source存储FPC源代码，tools作为FPC3.2.2做引导编译器的安装目录，里面有make.exe工具

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(9.51 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3Mzk2NnxhYzhhZjEzZnwxNzg3NDM5NzM4fDB8MjEyNDIzMw%3D%3D&nothumb=yes)

lazarus源码

2026-8-22 12:25 上传

上图位lazarus源码位置

八、准备FPC3.2.2安装包、FPC3.2.2源码，双击安装包选择到fpc/tools目录安装，解压压缩文件至fpc/source，如图：

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(3.29 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3Mzk2MXw2Zjg4ODk0NHwxNzg3NDM5NzM4fDB8MjEyNDIzMw%3D%3D&nothumb=yes)

安装包

2026-8-22 12:09 上传

九、编译 Debug FPC + RTL,执行这行指令除了编译FPC以外，也包含了对RTL的编译

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(10.88 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3Mzk2OHw1ZjM5NjI1ZXwxNzg3NDM5NzM4fDB8MjEyNDIzMw%3D%3D&nothumb=yes)

编译FPC

2026-8-22 12:41 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**makeall.png** *(12.34 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3Mzk4NHwwODVmNWI5ZnwxNzg3NDM5NzM4fDB8MjEyNDIzMw%3D%3D&nothumb=yes)

makeall

2026-8-22 13:09 上传

以上命令选项相关解释：

![](https://static.52pojie.cn/static/image/common/none.gif)

**选项.png** *(120.46 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3Mzk3MHwzMDlmYTA3MnwxNzg3NDM5NzM4fDB8MjEyNDIzMw%3D%3D&nothumb=yes)

选项

2026-8-22 12:48 上传

DWAF信息是什么？其实就是调试信息(注意下图中的DWARF是嵌入到.O文件中的)

![](https://static.52pojie.cn/static/image/common/none.gif)

**DW信息.png** *(10.35 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3Mzk3MXwyZjgzMDE1NnwxNzg3NDM5NzM4fDB8MjEyNDIzMw%3D%3D&nothumb=yes)

调试信息总图

2026-8-22 12:51 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**DWARF参数表.png** *(69.83 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3Mzk3Mnw2YzU2ODY4YnwxNzg3NDM5NzM4fDB8MjEyNDIzMw%3D%3D&nothumb=yes)

参数表

2026-8-22 12:53 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**类比C  .png** *(17.22 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3Mzk3M3w4Y2E5Mjc3NXwxNzg3NDM5NzM4fDB8MjEyNDIzMw%3D%3D&nothumb=yes)

类比

2026-8-22 12:53 上传

十、编译完成安装FPC至fpc/output目录，安装后output目录有了内容

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(14.24 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3Mzk3NHwxZTk0YTc2ZHwxNzg3NDM5NzM4fDB8MjEyNDIzMw%3D%3D&nothumb=yes)

安装

2026-8-22 12:56 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(23.75 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3Mzk3NXxhOGE2NWRjMXwxNzg3NDM5NzM4fDB8MjEyNDIzMw%3D%3D&nothumb=yes)

内容

2026-8-22 12:58 上传

生成的bin目录中并没有make.exe,记得将fpc/tools/make.exe剪切过去，这样make的时候调用的才是新的fpc.exe，否则调用的还是旧的

十一、生成FPC全局配置文件fpc.cfg,这个文件是编译器启动时自动加载的一组默认编译参数，主要作用是告诉PFC去哪里找库

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(12.5 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3NDAxNXwyZjJlNDA1NXwxNzg3NDM5NzM4fDB8MjEyNDIzMw%3D%3D&nothumb=yes)

cfg

2026-8-22 15:31 上传

安装完成后，在fpc.exe同目录会生成一个fpc.cfg的文件，此文件里面的路径要稍作修改，否则lazarus使用的时候会报错

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(9.87 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3NDAwOXw3YTJjOGIyMnwxNzg3NDM5NzM4fDB8MjEyNDIzMw%3D%3D&nothumb=yes)

报错

2026-8-22 14:56 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(22.32 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3NDAwOHwxNTk3YzUyYXwxNzg3NDM5NzM4fDB8MjEyNDIzMw%3D%3D&nothumb=yes)

文件修改

2026-8-22 14:54 上传

十二、以上是FPC编译过程，用已经安装好的 FPC 编译器，重新生成 Lazarus IDE（lazarus.exe）以及它依赖的 LCL、Packages 等单元，总体编译图如下

![](https://static.52pojie.cn/static/image/common/none.gif)

**三阶段构建(用已经安装好的 FPC 编译器，重新生成 Lazarus IDE（lazarus.exe）以及它.png** *(13.2 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3Mzk4NXw4MjU0ZDU2OHwxNzg3NDM5NzM4fDB8MjEyNDIzMw%3D%3D&nothumb=yes)

构建lazuaru

2026-8-22 13:14 上传

十三、开始编译，开始编译前clean一下，且注意看一下make的位置是否为刚刚新生成fpc目录内

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(12.42 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3NDAwNnw2Y2QzZmNkZnwxNzg3NDM5NzM4fDB8MjEyNDIzMw%3D%3D&nothumb=yes)

make新位置

2026-8-22 14:02 上传

编译完成后

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(74.4 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3NDAwMnwzNzYxNmFiNXwxNzg3NDM5NzM4fDB8MjEyNDIzMw%3D%3D&nothumb=yes)

生产了

2026-8-22 13:34 上传

十四、第一次启动需要配置一下目录

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(43.79 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3NDAwM3w2NjQ2ODI5ZXwxNzg3NDM5NzM4fDB8MjEyNDIzMw%3D%3D&nothumb=yes)

目录配置

2026-8-22 13:35 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(36.01 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3NDAwNHxiMjlmOTg4N3wxNzg3NDM5NzM4fDB8MjEyNDIzMw%3D%3D&nothumb=yes)

位置

2026-8-22 13:37 上传

再次检查路径

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(57.16 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3NDAxMHw3NmVkZDFjMnwxNzg3NDM5NzM4fDB8MjEyNDIzMw%3D%3D&nothumb=yes)

路径检查

2026-8-22 14:57 上传

十五、设置IDE为调试类型的IDE,这里选择后直接保存设置即可，无需构建(因为我们前面已经用新的fpc.exe构建过了

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(33.49 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3NDAxMXw3Mzk0YzM4N3wxNzg3NDM5NzM4fDB8MjEyNDIzMw%3D%3D&nothumb=yes)

配置

2026-8-22 15:00 上传

十六、在文章起始提到的位置下断点，F7追踪，最终发现可追踪到TObject

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(13.3 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3NDAxMnw1ZGRjZDQwYnwxNzg3NDM5NzM4fDB8MjEyNDIzMw%3D%3D&nothumb=yes)

TObject

2026-8-22 15:01 上传

十七、补充：以上是FPC编译器与LazarusIDE都从源码构建，如果只是想跟踪的底层其实只需要构建FPC即可，IDE用二进制安装包直接安装(其实里面含有了源代码)，然后通过界面中的构建Lazarus重新构建即可

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(35.26 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3NDAxM3w5ODQ2NDRlM3wxNzg3NDM5NzM4fDB8MjEyNDIzMw%3D%3D&nothumb=yes)

构建IDA

2026-8-22 15:04 上传

这里的构建过程是：调用新生成的FPC.EXE将lazarus及其相关模块重新构建一遍，与上面的命令行构建方式本质相同

![](https://static.52pojie.cn/static/image/common/none.gif)

**三阶段构建(用已经安装好的 FPC 编译器，重新生成 Lazarus IDE（lazarus.exe）以及它.png** *(13.2 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3NDAxNHxmNjk5NGEyNXwxNzg3NDM5NzM4fDB8MjEyNDIzMw%3D%3D&nothumb=yes)

构件图

2026-8-22 15:07 上传

---

[查看原文](https://www.52pojie.cn/thread-2124233-1-1.html)
