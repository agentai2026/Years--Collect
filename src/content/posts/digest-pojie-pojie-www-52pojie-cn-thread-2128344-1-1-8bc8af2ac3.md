---
title: "【批处理】自启动项管理脚本"
published: 2026-09-16
description: "为了方便自己删除一些启动项写的 保存时编码设置为UTF8 如果显示乱码就设置为ANSI 代码： [mw_shl_code=asm,true]@echo off & chcp 65001 & color 1f fltmc >nul || echo 请右键批处理以管理员身份运行! && timeout /t 3 /nobr"
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "沉默酱紫"
sourceLink: "https://www.52pojie.cn/thread-2128344-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2128344-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

为了方便自己删除一些启动项写的

**保存时编码设置为UTF8 如果显示乱码就设置为ANSI**

代码：

[Asm] *纯文本查看* *复制代码*
@echo off & chcp 65001 & color 1f
fltmc >nul || echo 请右键批处理以管理员身份运行! && timeout /t 3 /nobreak && exit

:menu
cls & title 自启动项管理脚本
setlocal enabledelayedexpansion

set /a num=0
set /a value=0
set /a numid=0
set /a delname=0
set /a numback=0

echo ---------------------------------------------------------------------------------------------
echo 最后更新:2026年9月15日 by:沉默酱紫
echo ---------------------------------------------------------------------------------------------
echo 让DOS命令可以跳转注册表地址：https://learn.microsoft.com/zh-cn/sysinternals/downloads/regjump
echo ---------------------------------------------------------------------------------------------
echo 请输入数字使用对应选项:
echo -[1]个人用户-
echo -[2]个人用户.一次性-
echo -[3]全部用户-
echo -[4]全部用户.一次性-
echo -[00]退出批处理-
echo ---------------------------------------------------------------------------------------------

set /p num=
if "!num!"=="0" goto :menu
if "!num!"=="1" (
    cls & title 自启动项-个人用户
    echo 你需要添加或删除右键选项: -[1]添加 [2]删除 [3]打开注册表- 按其他则退出
    set /p numid=
    if "!numid!"=="0" goto :menu
    if "!numid!"=="1" goto :oneadd
    if "!numid!"=="2" goto :onedel
    if "!numid!"=="3" goto :onereg
    exit
)
if "!num!"=="2" (
    cls & title 自启动项-个人用户.一次性
    echo 你需要添加或删除右键选项: -[1]添加 [2]删除 [3]打开注册表- 按其他则退出
    set /p numid=
    if "!numid!"=="0" goto :menu
    if "!numid!"=="1" goto :twoadd
    if "!numid!"=="2" goto :twodel
    if "!numid!"=="3" goto :tworeg
    exit
)
if "!num!"=="3" (
    cls & title 自启动项-全部用户
    echo 你需要添加或删除右键选项: -[1]添加 [2]删除 [3]打开注册表- 按其他则退出
    set /p numid=
    if "!numid!"=="0" goto :menu
    if "!numid!"=="1" goto :threeadd
    if "!numid!"=="2" goto :threedel
    if "!numid!"=="3" goto :threereg
    exit
)
if "!num!"=="4" (
    cls & title 自启动项-全部用户.一次性
    echo 你需要添加或删除右键选项: -[1]添加 [2]删除 [3]打开注册表- 按其他则退出
    set /p numid=
    if "!numid!"=="0" goto :menu
    if "!numid!"=="1" goto :fouradd
    if "!numid!"=="2" goto :fourdel
    if "!numid!"=="3" goto :fourreg
    exit
)
if "!num!"=="00" endlocal & exit
goto :menu

rem ==============================================================================================
rem ==============================================================================================
rem ==============================================================================================

:oneadd
echo ---------------------------------------------------------------------------------------------
echo 注册表项的名字:字母数字或组合
set /p default=
echo ---------------------------------------------------------------------------------------------
echo 自启动程序的路径:(如c:\xx\xx.exe)
set /p route=
if not "!route!"=="" (
    reg add "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run" /v "!default!" /t reg_expand_sz /d "!route!" /f
)
echo ---------------------------------------------------------------------------------------------
echo 已添加完毕,是否继续添加: -[1]继续添加,按其他则返回开头-
set /p numback=
if "!numback!"=="1" (
    set /a numback=0
    cls & goto :oneadd
) else (
    cls & goto :menu
)
exit

:onedel
reg query "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run"
echo ---------------------------------------------------------------------------------------------
echo 你想删除的键的名字:Run\后面的值
set /p delname=
if not "!delname!"=="" (
    reg delete "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run" /v "!delname!" /f
    echo 已删除!delname! & echo 是否继续删除: -[1]继续删除,按其他则返回开头-
    set /p value=
    if "!value!"=="1" (
        set /a value=0
        cls & goto :onedel
    ) else (
        cls & goto :menu
    )
) else (
    cls & goto :menu
)
exit

:onereg
cd /d c:\windows\
if not exist regjump.exe (
    echo HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run | clip
    echo 已将地址复制到剪切板并为你打开了注册表
    regedit
    cls & goto :menu
) else (
    regjump "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run"
    cls & goto :menu
)
exit

rem ==============================================================================================
rem ==============================================================================================
rem ==============================================================================================

:twoadd
echo ---------------------------------------------------------------------------------------------
echo 注册表项的名字:字母数字或组合
set /p default=
echo ---------------------------------------------------------------------------------------------
echo 自启动程序的路径:(如c:\xx\xx.exe)
set /p route=
if not "!route!"=="" (
    reg add "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\RunOnce" /v "!default!" /t reg_expand_sz /d "!route!" /f
)
echo ---------------------------------------------------------------------------------------------
echo 已添加完毕,是否继续添加: -[1]继续添加,按其他则返回开头-
set /p numback=
if "!numback!"=="1" (
    set /a numback=0
    cls & goto :twoadd
) else (
    cls & goto :menu
)
exit

:twodel
reg query "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\RunOnce"
echo ---------------------------------------------------------------------------------------------
echo 你想删除的键的名字:RunOnce\后面的值
set /p delname=
if not "!delname!"=="" (
    reg delete "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\RunOnce" /v "!delname!" /f
    echo 已删除!delname! & echo 是否继续删除: -[1]继续删除,按其他则返回开头-
    set /p value=
    if "!value!"=="1" (
        set /a value=0
        cls & goto :twodel
    ) else (
        cls & goto :menu
    )
) else (
    cls & goto :menu
)
exit

:tworeg
cd /d c:\windows\
if not exist regjump.exe (
    echo HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\RunOnce | clip
    echo 已将地址复制到剪切板并为你打开了注册表
    regedit
    cls & goto :menu
) else (
    regjump "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\RunOnce"
    cls & goto :menu
)
exit

rem ==============================================================================================
rem ==============================================================================================
rem ==============================================================================================

:threeadd
echo ---------------------------------------------------------------------------------------------
echo 注册表项的名字:字母数字或组合
set /p default=
echo ---------------------------------------------------------------------------------------------
echo 自启动程序的路径:(如c:\xx\xx.exe)
set /p route=
if not "!route!"=="" (
    reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /v "!default!" /t reg_expand_sz /d "!route!" /f
)
echo ---------------------------------------------------------------------------------------------
echo 已添加完毕,是否继续添加: -[1]继续添加,按其他则返回开头-
set /p numback=
if "!numback!"=="1" (
    set /a numback=0
    cls & goto :threeadd
) else (
    cls & goto :menu
)
exit

:threedel
reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Run"
echo ---------------------------------------------------------------------------------------------
echo 你想删除的键的名字:Run\后面的值
set /p delname=
if not "!delname!"=="" (
    reg delete "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /v "!delname!" /f
    echo 已删除!delname! & echo 是否继续删除: -[1]继续删除,按其他则返回开头-
    set /p value=
    if "!value!"=="1" (
        set /a value=0
        cls & goto :threedel
    ) else (
        cls & goto :menu
    )
) else (
    cls & goto :menu
)
exit

:threereg
cd /d c:\windows\
if not exist regjump.exe (
    echo HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Run | clip
    echo 已将地址复制到剪切板并为你打开了注册表
    regedit
    cls & goto :menu
) else (
    regjump "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Run"
    cls & goto :menu
)
exit

rem ==============================================================================================
rem ==============================================================================================
rem ==============================================================================================

:fouradd
echo ---------------------------------------------------------------------------------------------
echo 注册表项的名字:字母数字或组合
set /p default=
echo ---------------------------------------------------------------------------------------------
echo 自启动程序的路径:(如c:\xx\xx.exe)
set /p route=
if not "!route!"=="" (
    reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\RunOnce" /v "!default!" /t reg_expand_sz /d "!route!" /f
)
echo ---------------------------------------------------------------------------------------------
echo 已添加完毕,是否继续添加: -[1]继续添加,按其他则返回开头-
set /p numback=
if "!numback!"=="1" (
    set /a numback=0
    cls & goto :fouradd
) else (
    cls & goto :menu
)
exit

:fourdel
reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\RunOnce"
echo ---------------------------------------------------------------------------------------------
echo 你想删除的键的名字:RunOnce\后面的值
set /p delname=
if not "!delname!"=="" (
    reg delete "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\RunOnce" /v "!delname!" /f
    echo 已删除!delname! & echo 是否继续删除: -[1]继续删除,按其他则返回开头-
    set /p value=
    if "!value!"=="1" (
        set /a value=0
        cls & goto :fourdel
    ) else (
        cls & goto :menu
    )
) else (
    cls & goto :menu
)
exit

:fourreg
cd /d c:\windows\
if not exist regjump.exe (
    echo HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\RunOnce | clip
    echo 已将地址复制到剪切板并为你打开了注册表
    regedit
    cls & goto :menu
) else (
    regjump "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\RunOnce"
    cls & goto :menu
)
exit

rem ==============================================================================================
rem ==============================================================================================
rem ==============================================================================================

解压密码是52pojie

![](https://static.52pojie.cn/static/image/filetype/zip.gif)

[自启动管理.zip](forum.php?mod=attachment&aid=Mjg3OTM4N3wyNDdlYzI1ZnwxNzg5Njg4MjE3fDB8MjEyODM0NA%3D%3D)

*(1.7 KB, 下载次数: 36)*

2026-9-16 12:22 上传

点击文件名下载附件

下载积分: 吾爱币 -1 CB

---

[查看原文](https://www.52pojie.cn/thread-2128344-1-1.html)
