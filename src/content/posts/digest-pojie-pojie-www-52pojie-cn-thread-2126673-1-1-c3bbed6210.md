---
title: "VS2022编译QT5.15.2源码x64静态版本(仅作技术讨论，商用请遵循相关协议)"
published: 2026-09-06
description: "一、准备环节 1、准备QT5.15.2源码包：everywhere-src-5.15.2.zip https://download.qt.io/archive/qt/5.15/5.15.2/single/ 2、编译环境：next一路安装，遇到勾选path的位置勾选上，安装包都放网盘了，请自取：htt ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "lrj2025kernel"
sourceLink: "https://www.52pojie.cn/thread-2126673-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2126673-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

一、准备环节

1、准备QT5.15.2源码包：**everywhere-src-5.15.2.zip**

**https://download.qt.io/archive/qt/5.15/5.15.2/single/**

**

**

2、编译环境：next一路安装，遇到勾选path的位置勾选上，安装包都放网盘了，请自取：**https://wwals.lanzouv.com/b01giak8pa 密码:973b**

**python-2.7.amd64.msi**

**jom_1_1_2.zip：将他解压到C:\Qt\jom即可，使用时可设置临时环境变量**

**rubyinstaller-1.9.3-p551.exe**

**strawberry-perl-5.12.3.0-64bit.msi**

二、配置环节

1、解压QT5.15.2源码包到E:\qt-everywhere-src-5.15.2

2、修改配置文件，主要是将默认生成动态的选项改为静态：E:\qt-everywhere-src-5.15.2\qtbase\mkspecs\common\msvc-desktop.conf,如图

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(30.35 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3NzI0Nnw5MzFkODRkZHwxNzg4NzQ5NDIzfDB8MjEyNjY3Mw%3D%3D&nothumb=yes)

配置

2026-9-6 18:57 上传

三、安装环节

1、打开VS2022命令行

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(68.36 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3NzI0N3wyODBlMDdhN3wxNzg4NzQ5NDIzfDB8MjEyNjY3Mw%3D%3D&nothumb=yes)

vs2022

2026-9-6 18:59 上传

2、进入QT源码目录 cd /d E:\qt-everywhere-src-5.15.2

3、执行脚本配置编译环境

**set PATH=C:\Qt\jom;%PATH%          //设置临时jom环境**

**set PATH=C:\Python27\;%PATH%     //设置临时python环境，如果系统有多个python，环境变量污染了，需要临时启用使用py27版本**

**执行下方脚本**

**REM Qt 5.15.2 静态编译配置 (MSVC 2022 x64)**

**configure.bat ^**

**-mp                                                                           & REM 启用多核编译**

**-confirm-license                                                              & REM 自动接受开源许可证**

**-opensource                                                                   & REM 使用开源版本**

**-platform win32-msvc                                                          & REM 目标平台 Windows+MSVC**

**-debug-and-release                                                            & REM 同时编译 Debug 和 Release**

**-force-debug-info                                                             & REM 强制包含调试符号**

**-static                                                                       & REM 编译为静态库**

**-force-asserts                                                                & REM Release 也保留断言**

**-prefix C:\Qt\5.15.2\5.15.2-msvc2022-x64-static              & REM 安装输出目录**

**-static-runtime                                                               & REM 静态链接 C++ 运行时**

**-silent                                                                       & REM 静默模式减少输出**

**-opengl desktop                                                               & REM 使用桌面 OpenGL**

**-qt-sqlite                                                                    & REM 使用 Qt 自带的 SQLite**

**-qt-pcre                                                                      & REM 使用 Qt 自带的 PCRE 正则库**

**-qt-zlib                                                                      & REM 使用 Qt 自带的 zlib**

**-qt-freetype                                                                  & REM 使用 Qt 自带的 FreeType 字体**

**-qt-harfbuzz                                                                  & REM 使用 Qt 自带的 HarfBuzz 文本塑形**

**-qt-libpng                                                                    & REM 使用 Qt 自带的 PNG 库**

**-qt-libjpeg                                                                   & REM 使用 Qt 自带的 JPEG 库**

**-nomake examples                                                              & REM 跳过编译示例**

**-nomake tests                                                                 & REM 跳过编译测试**

**

**

4、上一步没有错误后执行

**jom -j8:后面的数字根据自己机器情况适当修改**

**漫长等待中~~~~~~~~~~**

5、成功后安装,安装位置就是上面配置的C:\Qt\5.15.2\5.15.2-msvc2022-x64-static

**jom install**

6、安装成功后将其配置到QTCreator(没有的请自行安装)中即可，里面的警告可忽略

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(22.48 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3NzI1MHxlOGQxZDBlZnwxNzg4NzQ5NDIzfDB8MjEyNjY3Mw%3D%3D&nothumb=yes)

creator

2026-9-6 19:14 上传

---

[查看原文](https://www.52pojie.cn/thread-2126673-1-1.html)
