---
title: "【批处理】右键二级菜单管理脚本"
published: 2026-09-16
description: "最近想合并右键菜单一些选项，用Regedit太麻烦就写了这个批处理 保存时编码设置为UTF8 如果显示乱码就设置为ANSI 一级菜单：https://www.52pojie.cn/thread-2084011-1-1.html 代码： [mw_shl_code=bash,true]@echo off & chcp 65"
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "沉默酱紫"
sourceLink: "https://www.52pojie.cn/thread-2128342-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2128342-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

最近想合并右键菜单一些选项，用Regedit太麻烦就写了这个批处理

**保存时编码设置为UTF8 如果显示乱码就设置为ANSI**

一级菜单：https://www.52pojie.cn/thread-2084011-1-1.html

代码：

[Bash shell] *纯文本查看* *复制代码*
@echo off & chcp 65001 & color 1f
fltmc >nul || echo 请右键批处理以管理员身份运行! && timeout /t 3 /nobreak && exit

:menu
cls & title 右键二级菜单管理脚本
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
echo -[1]桌面右键-
echo -[2]文件右键-
echo -[3]文件夹右键-
echo -[4]文件夹背景右键-
echo -[5]磁盘分区右键-
echo -[6].exe文件右键-
echo -[00]退出批处理-
echo ---------------------------------------------------------------------------------------------

set /p num=
if "!num!"=="0" goto :menu
if "!num!"=="1" (
    cls & title 给桌面右键添加选项
    echo 你需要添加或删除右键选项: -[1]添加菜单 [2]删除菜单 [3]添加子项 [4]删除子项 [5]打开注册表,按其他则退出-
    set /p numid=
    if "!numid!"=="0" goto :menu
    if "!numid!"=="1" goto :oneadd
    if "!numid!"=="2" goto :onedel
    if "!numid!"=="3" goto :oneadd.s
    if "!numid!"=="4" goto :onedel.s
    if "!numid!"=="5" goto :onereg
    exit
)
if "!num!"=="2" (
    cls & title 给文件右键添加选项
    echo 你需要添加或删除右键选项: -[1]添加菜单 [2]删除菜单 [3]添加子项 [4]删除子项 [5]打开注册表,按其他则退出-
    set /p numid=
    if "!numid!"=="0" goto :menu
    if "!numid!"=="1" goto :twoadd
    if "!numid!"=="2" goto :twodel
    if "!numid!"=="3" goto :twoadd.s
    if "!numid!"=="4" goto :twodel.s
    if "!numid!"=="5" goto :tworeg
    exit
)
if "!num!"=="3" (
    cls & title 给文件夹右键添加选项
    echo 你需要添加或删除右键选项: -[1]添加菜单 [2]删除菜单 [3]添加子项 [4]删除子项 [5]打开注册表,按其他则退出-
    set /p numid=
    if "!numid!"=="0" goto :menu
    if "!numid!"=="1" goto :threeadd
    if "!numid!"=="2" goto :threedel
    if "!numid!"=="3" goto :threeadd.s
    if "!numid!"=="4" goto :threedel.s
    if "!numid!"=="5" goto :threereg
    exit
)
if "!num!"=="4" (
    cls & title 给文件夹背景右键添加选项
    echo 你需要添加或删除右键选项: -[1]添加菜单 [2]删除菜单 [3]添加子项 [4]删除子项 [5]打开注册表,按其他则退出-
    set /p numid=
    if "!numid!"=="0" goto :menu
    if "!numid!"=="1" goto :fouradd
    if "!numid!"=="2" goto :fourdel
    if "!numid!"=="3" goto :fouradd.s
    if "!numid!"=="4" goto :fourdel.s
    if "!numid!"=="5" goto :fourreg
    exit
)
if "!num!"=="5" (
    cls & title 给磁盘分区右键添加选项
    echo 你需要添加或删除右键选项: -[1]添加菜单 [2]删除菜单 [3]添加子项 [4]删除子项 [5]打开注册表,按其他则退出-
    set /p numid=
    if "!numid!"=="0" goto :menu
    if "!numid!"=="1" goto :fiveadd
    if "!numid!"=="2" goto :fivedel
    if "!numid!"=="3" goto :fiveadd.s
    if "!numid!"=="4" goto :fivedel.s
    if "!numid!"=="5" goto :fivereg
    exit
)
if "!num!"=="6" (
    cls & title 给.exe文件右键添加选项
    echo 你需要添加或删除右键选项: -[1]添加菜单 [2]删除菜单 [3]添加子项 [4]删除子项 [5]打开注册表,按其他则退出-
    set /p numid=
    if "!numid!"=="0" goto :menu
    if "!numid!"=="1" goto :sixadd
    if "!numid!"=="2" goto :sixdel
    if "!numid!"=="3" goto :sixadd.s
    if "!numid!"=="4" goto :sixdel.s
    if "!numid!"=="5" goto :sixreg
    exit
)
if "!num!"=="00" endlocal & exit
goto :menu

rem ==============================================================================================
rem ==============================================================================================
rem ==============================================================================================

:oneadd
echo ---------------------------------------------------------------------------------------------
echo 注册表菜单的名字:字母数字或组合
set /p keymain=
if not "!keymain!"=="" (
    reg add "HKEY_CLASSES_ROOT\DesktopBackground\Shell\!keymain!\Shell" /f
) else (
    cls & goto :menu
)
echo ---------------------------------------------------------------------------------------------
echo 在右键菜单中显示的名字:
set /p MUIVerb=
reg add "HKEY_CLASSES_ROOT\DesktopBackground\Shell\!keymain!" /v MUIVerb /t reg_sz /d "!MUIVerb!" /f
reg add "HKEY_CLASSES_ROOT\DesktopBackground\Shell\!keymain!" /v SubCommands /t reg_sz /d "" /f
echo ---------------------------------------------------------------------------------------------
echo 选项显示的图标的路径:
set /p ico=
if not "!ico!"=="" (
    reg add "HKEY_CLASSES_ROOT\DesktopBackground\Shell\!keymain!" /v icon /t reg_expand_sz /d "!ico!" /f
) else (
    reg add "HKEY_CLASSES_ROOT\DesktopBackground\Shell\!keymain!" /v icon /t reg_expand_sz /d "" /f
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

:oneadd.s
echo ---------------------------------------------------------------------------------------------
if not "!keymain!"=="" (
    echo 当前名字是!keymain!
)
echo 注册表菜单的名字:字母数字或组合
set /p keymain=
echo ---------------------------------------------------------------------------------------------
echo 注册表子项的名字:字母数字或组合
set /p keyname=
if not "!keyname!"=="" (
    reg add "HKEY_CLASSES_ROOT\DesktopBackground\Shell\!keymain!\Shell\!keyname!" /f
) else (
    cls & goto :menu
)
echo ---------------------------------------------------------------------------------------------
echo 在右键菜单中显示的名字:
set /p default=
reg add "HKEY_CLASSES_ROOT\DesktopBackground\Shell\!keymain!\Shell\!keyname!" /ve /d "!default!" /f
echo ---------------------------------------------------------------------------------------------
echo 选项打开的程序的路径:如c:\xx\xx.exe
set /p route=
reg add "HKEY_CLASSES_ROOT\DesktopBackground\Shell\!keymain!\Shell\!keyname!\command" /f
reg add "HKEY_CLASSES_ROOT\DesktopBackground\Shell\!keymain!\Shell\!keyname!\command" /ve /d "!route!" /f
echo ---------------------------------------------------------------------------------------------
echo 选项显示的图标的路径:按回车则是打开的程序的图标
set /p icon=
if not "!icon!"=="" (
    reg add "HKEY_CLASSES_ROOT\DesktopBackground\Shell\!keymain!\Shell\!keyname!" /v icon /t reg_expand_sz /d "!icon!" /f
) else (
    reg add "HKEY_CLASSES_ROOT\DesktopBackground\Shell\!keymain!\Shell\!keyname!" /v icon /t reg_expand_sz /d "!route!" /f
)
echo ---------------------------------------------------------------------------------------------
echo 已添加完毕,是否继续添加: -[1]继续添加,按其他则返回开头-
set /p numback=
if "!numback!"=="1" (
    set /a numback=0
    cls & goto :oneadd.s
) else (
    cls & goto :menu
)
exit

:onedel
echo ---------------------------------------------------------------------------------------------
reg query "HKEY_CLASSES_ROOT\DesktopBackground\Shell"
echo ---------------------------------------------------------------------------------------------
echo 你想删除的键的名字:Shell\后面的值
set /p delname=
if not "!delname!"=="" (
    reg delete "HKEY_CLASSES_ROOT\DesktopBackground\Shell\!delname!" /f
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

:onedel.s
echo ---------------------------------------------------------------------------------------------
reg query "HKEY_CLASSES_ROOT\DesktopBackground\Shell"
echo ---------------------------------------------------------------------------------------------
if not "!keymain!"=="" (
    echo 当前名字是!keymain!
)
echo 注册表菜单的名字:字母数字或组合
set /p keymain=
echo ---------------------------------------------------------------------------------------------
echo 你想删除的键的名字:Shell\后面的值
set /p delname=
if not "!delname!"=="" (
    reg delete "HKEY_CLASSES_ROOT\DesktopBackground\Shell\!keymain!\Shell\!delname!" /f
    echo 已删除!delname! & echo 是否继续删除: -[1]继续删除,按其他则返回开头-
    set /p value=
    if "!value!"=="1" (
        set /a value=0
        cls & goto :onedel.s
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
    echo HKEY_CLASSES_ROOT\DesktopBackground\Shell\ | clip
    echo 已将地址复制到剪切板并为你打开了注册表
    regedit
    cls & goto :menu
) else (
    regjump "HKEY_CLASSES_ROOT\DesktopBackground\Shell"
    cls & goto :menu
)
exit

rem ==============================================================================================
rem ==============================================================================================
rem ==============================================================================================

:twoadd
echo ---------------------------------------------------------------------------------------------
echo 注册表菜单的名字:字母数字或组合
set /p keymain=
if not "!keymain!"=="" (
    reg add "HKEY_CLASSES_ROOT\*\shell\!keymain!\Shell" /f
) else (
    cls & goto :menu
)
echo ---------------------------------------------------------------------------------------------
echo 在右键菜单中显示的名字:
set /p MUIVerb=
reg add "HKEY_CLASSES_ROOT\*\shell\!keymain!" /v MUIVerb /t reg_sz /d "!MUIVerb!" /f
reg add "HKEY_CLASSES_ROOT\*\shell\!keymain!" /v SubCommands /t reg_sz /d "" /f
echo ---------------------------------------------------------------------------------------------
echo 选项显示的图标的路径:
set /p ico=
if not "!ico!"=="" (
    reg add "HKEY_CLASSES_ROOT\*\shell\!keymain!" /v icon /t reg_expand_sz /d "!ico!" /f
) else (
    reg add "HKEY_CLASSES_ROOT\*\shell\!keymain!" /v icon /t reg_expand_sz /d "" /f
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

:twoadd.s
echo ---------------------------------------------------------------------------------------------
if not "!keymain!"=="" (
    echo 当前名字是!keymain!
)
echo 注册表菜单的名字:字母数字或组合
set /p keymain=
echo ---------------------------------------------------------------------------------------------
echo 注册表子项的名字:字母数字或组合
set /p keyname=
if not "!keyname!"=="" (
    reg add "HKEY_CLASSES_ROOT\*\shell\!keymain!\Shell\!keyname!" /f
) else (
    cls & goto :menu
)
echo ---------------------------------------------------------------------------------------------
echo 在右键菜单中显示的名字:
set /p default=
reg add "HKEY_CLASSES_ROOT\*\shell\!keymain!\Shell\!keyname!" /ve /d "!default!" /f
echo ---------------------------------------------------------------------------------------------
echo 选项打开的程序的路径:如c:\xx\xx.exe
set /p route=
reg add "HKEY_CLASSES_ROOT\*\shell\!keymain!\Shell\!keyname!\command" /f
reg add "HKEY_CLASSES_ROOT\*\shell\!keymain!\Shell\!keyname!\command" /ve /d "!route!" /f
echo ---------------------------------------------------------------------------------------------
echo 选项显示的图标的路径:按回车则是打开的程序的图标
set /p icon=
if not "!icon!"=="" (
    reg add "HKEY_CLASSES_ROOT\*\shell\!keymain!\Shell\!keyname!" /v icon /t reg_expand_sz /d "!icon!" /f
) else (
    reg add "HKEY_CLASSES_ROOT\*\shell\!keymain!\Shell\!keyname!" /v icon /t reg_expand_sz /d "!route!" /f
)
echo ---------------------------------------------------------------------------------------------
echo 已添加完毕,是否继续添加: -[1]继续添加,按其他则返回开头-
set /p numback=
if "!numback!"=="1" (
    set /a numback=0
    cls & goto :twoadd.s
) else (
    cls & goto :menu
)
exit

:twodel
echo ---------------------------------------------------------------------------------------------
reg query "HKEY_CLASSES_ROOT\*\shell"
echo ---------------------------------------------------------------------------------------------
echo 你想删除的键的名字:Shell\后面的值
set /p delname=
if not "!delname!"=="" (
    reg delete "HKEY_CLASSES_ROOT\*\shell\!delname!" /f
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

:twodel.s
echo ---------------------------------------------------------------------------------------------
reg query "HKEY_CLASSES_ROOT\*\shell"
echo ---------------------------------------------------------------------------------------------
if not "!keymain!"=="" (
    echo 当前名字是!keymain!
)
echo 注册表菜单的名字:字母数字或组合
set /p keymain=
echo ---------------------------------------------------------------------------------------------
echo 你想删除的键的名字:Shell\后面的值
set /p delname=
if not "!delname!"=="" (
    reg delete "HKEY_CLASSES_ROOT\*\shell\!keymain!\Shell\!delname!" /f
    echo 已删除!delname! & echo 是否继续删除: -[1]继续删除,按其他则返回开头-
    set /p value=
    if "!value!"=="1" (
        set /a value=0
        cls & goto :twodel.s
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
    echo HKEY_CLASSES_ROOT\*\shell\ | clip
    echo 已将地址复制到剪切板并为你打开了注册表
    regedit
    cls & goto :menu
) else (
    regjump "HKEY_CLASSES_ROOT\*\shell"
    cls & goto :menu
)
exit

rem ==============================================================================================
rem ==============================================================================================
rem ==============================================================================================

:threeadd
echo ---------------------------------------------------------------------------------------------
echo 注册表菜单的名字:字母数字或组合
set /p keymain=
if not "!keymain!"=="" (
    reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Directory\shell\!keymain!\Shell" /f
) else (
    cls & goto :menu
)
echo ---------------------------------------------------------------------------------------------
echo 在右键菜单中显示的名字:
set /p MUIVerb=
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Directory\shell\!keymain!" /v MUIVerb /t reg_sz /d "!MUIVerb!" /f
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Directory\shell\!keymain!" /v SubCommands /t reg_sz /d "" /f
echo ---------------------------------------------------------------------------------------------
echo 选项显示的图标的路径:
set /p ico=
if not "!ico!"=="" (
    reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Directory\shell\!keymain!" /v icon /t reg_expand_sz /d "!ico!" /f
) else (
    reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Directory\shell\!keymain!" /v icon /t reg_expand_sz /d "" /f
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

:threeadd.s
echo ---------------------------------------------------------------------------------------------
if not "!keymain!"=="" (
    echo 当前名字是!keymain!
)
echo 注册表菜单的名字:字母数字或组合
set /p keymain=
echo ---------------------------------------------------------------------------------------------
echo 注册表子项的名字:字母数字或组合
set /p keyname=
if not "!keyname!"=="" (
    reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Directory\shell\!keymain!\Shell\!keyname!" /f
) else (
    cls & goto :menu
)
echo ---------------------------------------------------------------------------------------------
echo 在右键菜单中显示的名字:
set /p default=
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Directory\shell\!keymain!\Shell\!keyname!" /ve /d "!default!" /f
echo ---------------------------------------------------------------------------------------------
echo 选项打开的程序的路径:如c:\xx\xx.exe
set /p route=
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Directory\shell\!keymain!\Shell\!keyname!\command" /f
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Directory\shell\!keymain!\Shell\!keyname!\command" /ve /d "!route!" /f
echo ---------------------------------------------------------------------------------------------
echo 选项显示的图标的路径:按回车则是打开的程序的图标
set /p icon=
if not "!icon!"=="" (
    reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Directory\shell\!keymain!\Shell\!keyname!" /v icon /t reg_expand_sz /d "!icon!" /f
) else (
    reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Directory\shell\!keymain!\Shell\!keyname!" /v icon /t reg_expand_sz /d "!route!" /f
)
echo ---------------------------------------------------------------------------------------------
echo 已添加完毕,是否继续添加: -[1]继续添加,按其他则返回开头-
set /p numback=
if "!numback!"=="1" (
    set /a numback=0
    cls & goto :threeadd.s
) else (
    cls & goto :menu
)
exit

:threedel
echo ---------------------------------------------------------------------------------------------
reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Directory\shell"
echo ---------------------------------------------------------------------------------------------
echo 你想删除的键的名字:Shell\后面的值
set /p delname=
if not "!delname!"=="" (
    reg delete "HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Directory\shell\!delname!" /f
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

:threedel.s
echo ---------------------------------------------------------------------------------------------
reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Directory\shell"
echo ---------------------------------------------------------------------------------------------
if not "!keymain!"=="" (
    echo 当前名字是!keymain!
)
echo 注册表菜单的名字:字母数字或组合
set /p keymain=
echo ---------------------------------------------------------------------------------------------
echo 你想删除的键的名字:Shell\后面的值
set /p delname=
if not "!delname!"=="" (
    reg delete "HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Directory\shell\!keymain!\Shell\!delname!" /f
    echo 已删除!delname! & echo 是否继续删除: -[1]继续删除,按其他则返回开头-
    set /p value=
    if "!value!"=="1" (
        set /a value=0
        cls & goto :threedel.s
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
    echo HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Directory\shell\ | clip
    echo 已将地址复制到剪切板并为你打开了注册表
    regedit
    cls & goto :menu
) else (
    regjump "HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Directory\shell"
    cls & goto :menu
)
exit

rem ==============================================================================================
rem ==============================================================================================
rem ==============================================================================================

:fouradd
echo ---------------------------------------------------------------------------------------------
echo 注册表菜单的名字:字母数字或组合
set /p keymain=
if not "!keymain!"=="" (
    reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Directory\background\shell\!keymain!\Shell" /f
) else (
    cls & goto :menu
)
echo ---------------------------------------------------------------------------------------------
echo 在右键菜单中显示的名字:
set /p MUIVerb=
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Directory\background\shell\!keymain!" /v MUIVerb /t reg_sz /d "!MUIVerb!" /f
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Directory\background\shell\!keymain!" /v SubCommands /t reg_sz /d "" /f
echo ---------------------------------------------------------------------------------------------
echo 选项显示的图标的路径:
set /p ico=
if not "!ico!"=="" (
    reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Directory\background\shell\!keymain!" /v icon /t reg_expand_sz /d "!ico!" /f
) else (
    reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Directory\background\shell\!keymain!" /v icon /t reg_expand_sz /d "" /f
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

:fouradd.s
echo ---------------------------------------------------------------------------------------------
if not "!keymain!"=="" (
    echo 当前名字是!keymain!
)
echo 注册表菜单的名字:字母数字或组合
set /p keymain=
echo ---------------------------------------------------------------------------------------------
echo 注册表子项的名字:字母数字或组合
set /p keyname=
if not "!keyname!"=="" (
    reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Directory\background\shell\!keymain!\Shell\!keyname!" /f
) else (
    cls & goto :menu
)
echo ---------------------------------------------------------------------------------------------
echo 在右键菜单中显示的名字:
set /p default=
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Directory\background\shell\!keymain!\Shell\!keyname!" /ve /d "!default!" /f
echo ---------------------------------------------------------------------------------------------
echo 选项打开的程序的路径:如c:\xx\xx.exe
set /p route=
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Directory\background\shell\!keymain!\Shell\!keyname!\command" /f
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Directory\background\shell\!keymain!\Shell\!keyname!\command" /ve /d "!route!" /f
echo ---------------------------------------------------------------------------------------------
echo 选项显示的图标的路径:按回车则是打开的程序的图标
set /p icon=
if not "!icon!"=="" (
    reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Directory\background\shell\!keymain!\Shell\!keyname!" /v icon /t reg_expand_sz /d "!icon!" /f
) else (
    reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Directory\background\shell\!keymain!\Shell\!keyname!" /v icon /t reg_expand_sz /d "!route!" /f
)
echo ---------------------------------------------------------------------------------------------
echo 已添加完毕,是否继续添加: -[1]继续添加,按其他则返回开头-
set /p numback=
if "!numback!"=="1" (
    set /a numback=0
    cls & goto :fouradd.s
) else (
    cls & goto :menu
)
exit

:fourdel
echo ---------------------------------------------------------------------------------------------
reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Directory\background\shell"
echo ---------------------------------------------------------------------------------------------
echo 你想删除的键的名字:Shell\后面的值
set /p delname=
if not "!delname!"=="" (
    reg delete "HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Directory\background\shell\!delname!" /f
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

:fourdel.s
echo ---------------------------------------------------------------------------------------------
reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Directory\background\shell"
echo ---------------------------------------------------------------------------------------------
if not "!keymain!"=="" (
    echo 当前名字是!keymain!
)
echo 注册表菜单的名字:字母数字或组合
set /p keymain=
echo ---------------------------------------------------------------------------------------------
echo 你想删除的键的名字:Shell\后面的值
set /p delname=
if not "!delname!"=="" (
    reg delete "HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Directory\background\shell\!keymain!\Shell\!delname!" /f
    echo 已删除!delname! & echo 是否继续删除: -[1]继续删除,按其他则返回开头-
    set /p value=
    if "!value!"=="1" (
        set /a value=0
        cls & goto :fourdel.s
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
    echo HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Directory\background\shell\ | clip
    echo 已将地址复制到剪切板并为你打开了注册表
    regedit
    cls & goto :menu
) else (
    regjump "HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Directory\background\shell"
    cls & goto :menu
)
exit

rem ==============================================================================================
rem ==============================================================================================
rem ==============================================================================================

:fiveadd
echo ---------------------------------------------------------------------------------------------
echo 注册表菜单的名字:字母数字或组合
set /p keymain=
if not "!keymain!"=="" (
    reg add "HKEY_CLASSES_ROOT\Drive\shell\!keymain!\Shell" /f
) else (
    cls & goto :menu
)
echo ---------------------------------------------------------------------------------------------
echo 在右键菜单中显示的名字:
set /p MUIVerb=
reg add "HKEY_CLASSES_ROOT\Drive\shell\!keymain!" /v MUIVerb /t reg_sz /d "!MUIVerb!" /f
reg add "HKEY_CLASSES_ROOT\Drive\shell\!keymain!" /v SubCommands /t reg_sz /d "" /f
echo ---------------------------------------------------------------------------------------------
echo 选项显示的图标的路径:
set /p ico=
if not "!ico!"=="" (
    reg add "HKEY_CLASSES_ROOT\Drive\shell\!keymain!" /v icon /t reg_expand_sz /d "!ico!" /f
) else (
    reg add "HKEY_CLASSES_ROOT\Drive\shell\!keymain!" /v icon /t reg_expand_sz /d "" /f
)
echo ---------------------------------------------------------------------------------------------
echo 已添加完毕,是否继续添加: -[1]继续添加,按其他则返回开头-
set /p numback=
if "!numback!"=="1" (
    set /a numback=0
    cls & goto :fiveadd
) else (
    cls & goto :menu
)
exit

:fiveadd.s
echo ---------------------------------------------------------------------------------------------
if not "!keymain!"=="" (
    echo 当前名字是!keymain!
)
echo 注册表菜单的名字:字母数字或组合
set /p keymain=
echo ---------------------------------------------------------------------------------------------
echo 注册表子项的名字:字母数字或组合
set /p keyname=
if not "!keyname!"=="" (
    reg add "HKEY_CLASSES_ROOT\Drive\shell\!keymain!\Shell\!keyname!" /f
) else (
    cls & goto :menu
)
echo ---------------------------------------------------------------------------------------------
echo 在右键菜单中显示的名字:
set /p default=
reg add "HKEY_CLASSES_ROOT\Drive\shell\!keymain!\Shell\!keyname!" /ve /d "!default!" /f
echo ---------------------------------------------------------------------------------------------
echo 选项打开的程序的路径:如c:\xx\xx.exe
set /p route=
reg add "HKEY_CLASSES_ROOT\Drive\shell\!keymain!\Shell\!keyname!\command" /f
reg add "HKEY_CLASSES_ROOT\Drive\shell\!keymain!\Shell\!keyname!\command" /ve /d "!route!" /f
echo ---------------------------------------------------------------------------------------------
echo 选项显示的图标的路径:按回车则是打开的程序的图标
set /p icon=
if not "!icon!"=="" (
    reg add "HKEY_CLASSES_ROOT\Drive\shell\!keymain!\Shell\!keyname!" /v icon /t reg_expand_sz /d "!icon!" /f
) else (
    reg add "HKEY_CLASSES_ROOT\Drive\shell\!keymain!\Shell\!keyname!" /v icon /t reg_expand_sz /d "!route!" /f
)
echo ---------------------------------------------------------------------------------------------
echo 已添加完毕,是否继续添加: -[1]继续添加,按其他则返回开头-
set /p numback=
if "!numback!"=="1" (
    set /a numback=0
    cls & goto :fiveadd.s
) else (
    cls & goto :menu
)
exit

:fivedel
echo ---------------------------------------------------------------------------------------------
reg query "HKEY_CLASSES_ROOT\Drive\shell"
echo ---------------------------------------------------------------------------------------------
echo 你想删除的键的名字:Shell\后面的值
set /p delname=
if not "!delname!"=="" (
    reg delete "HKEY_CLASSES_ROOT\Drive\shell\!delname!" /f
    echo 已删除!delname! & echo 是否继续删除: -[1]继续删除,按其他则返回开头-
    set /p value=
    if "!value!"=="1" (
        set /a value=0
        cls & goto :fivedel
    ) else (
        cls & goto :menu
    )
) else (
    cls & goto :menu
)
exit

:fivedel.s
echo ---------------------------------------------------------------------------------------------
reg query "HKEY_CLASSES_ROOT\Drive\shell"
echo ---------------------------------------------------------------------------------------------
if not "!keymain!"=="" (
    echo 当前名字是!keymain!
)
echo 注册表菜单的名字:字母数字或组合
set /p keymain=
echo ---------------------------------------------------------------------------------------------
echo 你想删除的键的名字:Shell\后面的值
set /p delname=
if not "!delname!"=="" (
    reg delete "HKEY_CLASSES_ROOT\Drive\shell\!keymain!\Shell\!delname!" /f
    echo 已删除!delname! & echo 是否继续删除: -[1]继续删除,按其他则返回开头-
    set /p value=
    if "!value!"=="1" (
        set /a value=0
        cls & goto :fivedel.s
    ) else (
        cls & goto :menu
    )
) else (
    cls & goto :menu
)
exit

:fivereg
cd /d c:\windows\
if not exist regjump.exe (
    echo HKEY_CLASSES_ROOT\Drive\shell\ | clip
    echo 已将地址复制到剪切板并为你打开了注册表
    regedit
    cls & goto :menu
) else (
    regjump "HKEY_CLASSES_ROOT\Drive\shell"
    cls & goto :menu
)
exit

rem ==============================================================================================
rem ==============================================================================================
rem ==============================================================================================

:sixadd
echo ---------------------------------------------------------------------------------------------
echo 注册表菜单的名字:字母数字或组合
set /p keymain=
if not "!keymain!"=="" (
    reg add "HKEY_CLASSES_ROOT\SystemFileAssociations\.exe\shell\!keymain!\Shell" /f
) else (
    cls & goto :menu
)
echo ---------------------------------------------------------------------------------------------
echo 在右键菜单中显示的名字:
set /p MUIVerb=
reg add "HKEY_CLASSES_ROOT\SystemFileAssociations\.exe\shell\!keymain!" /v MUIVerb /t reg_sz /d "!MUIVerb!" /f
reg add "HKEY_CLASSES_ROOT\SystemFileAssociations\.exe\shell\!keymain!" /v SubCommands /t reg_sz /d "" /f
echo ---------------------------------------------------------------------------------------------
echo 选项显示的图标的路径:
set /p ico=
if not "!ico!"=="" (
    reg add "HKEY_CLASSES_ROOT\SystemFileAssociations\.exe\shell\!keymain!" /v icon /t reg_expand_sz /d "!ico!" /f
) else (
    reg add "HKEY_CLASSES_ROOT\SystemFileAssociations\.exe\shell\!keymain!" /v icon /t reg_expand_sz /d "" /f
)
echo ---------------------------------------------------------------------------------------------
echo 已添加完毕,是否继续添加: -[1]继续添加,按其他则返回开头-
set /p numback=
if "!numback!"=="1" (
    set /a numback=0
    cls & goto :sixadd
) else (
    cls & goto :menu
)
exit

:sixadd.s
echo ---------------------------------------------------------------------------------------------
if not "!keymain!"=="" (
    echo 当前名字是!keymain!
)
echo 注册表菜单的名字:字母数字或组合
set /p keymain=
echo ---------------------------------------------------------------------------------------------
echo 注册表子项的名字:字母数字或组合
set /p keyname=
if not "!keyname!"=="" (
    reg add "HKEY_CLASSES_ROOT\SystemFileAssociations\.exe\shell\!keymain!\Shell\!keyname!" /f
) else (
    cls & goto :menu
)
echo ---------------------------------------------------------------------------------------------
echo 在右键菜单中显示的名字:
set /p default=
reg add "HKEY_CLASSES_ROOT\SystemFileAssociations\.exe\shell\!keymain!\Shell\!keyname!" /ve /d "!default!" /f
echo ---------------------------------------------------------------------------------------------
echo 选项打开的程序的路径:如c:\xx\xx.exe
set /p route=
reg add "HKEY_CLASSES_ROOT\SystemFileAssociations\.exe\shell\!keymain!\Shell\!keyname!\command" /f
reg add "HKEY_CLASSES_ROOT\SystemFileAssociations\.exe\shell\!keymain!\Shell\!keyname!\command" /ve /d "!route!" /f
echo ---------------------------------------------------------------------------------------------
echo 选项显示的图标的路径:按回车则是打开的程序的图标
set /p icon=
if not "!icon!"=="" (
    reg add "HKEY_CLASSES_ROOT\SystemFileAssociations\.exe\shell\!keymain!\Shell\!keyname!" /v icon /t reg_expand_sz /d "!icon!" /f
) else (
    reg add "HKEY_CLASSES_ROOT\SystemFileAssociations\.exe\shell\!keymain!\Shell\!keyname!" /v icon /t reg_expand_sz /d "!route!" /f
)
echo ---------------------------------------------------------------------------------------------
echo 已添加完毕,是否继续添加: -[1]继续添加,按其他则返回开头-
set /p numback=
if "!numback!"=="1" (
    set /a numback=0
    cls & goto :sixadd.s
) else (
    cls & goto :menu
)
exit

:sixdel
echo ---------------------------------------------------------------------------------------------
reg query "HKEY_CLASSES_ROOT\SystemFileAssociations\.exe\shell"
echo ---------------------------------------------------------------------------------------------
echo 你想删除的键的名字:Shell\后面的值
set /p delname=
if not "!delname!"=="" (
    reg delete "HKEY_CLASSES_ROOT\SystemFileAssociations\.exe\shell\!delname!" /f
    echo 已删除!delname! & echo 是否继续删除: -[1]继续删除,按其他则返回开头-
    set /p value=
    if "!value!"=="1" (
        set /a value=0
        cls & goto :sixdel
    ) else (
        cls & goto :menu
    )
) else (
    cls & goto :menu
)
exit

:sixdel.s
echo ---------------------------------------------------------------------------------------------
reg query "HKEY_CLASSES_ROOT\SystemFileAssociations\.exe\shell"
echo ---------------------------------------------------------------------------------------------
if not "!keymain!"=="" (
    echo 当前名字是!keymain!
)
echo 注册表菜单的名字:字母数字或组合
set /p keymain=
echo ---------------------------------------------------------------------------------------------
echo 你想删除的键的名字:Shell\后面的值
set /p delname=
if not "!delname!"=="" (
    reg delete "HKEY_CLASSES_ROOT\SystemFileAssociations\.exe\shell\!keymain!\Shell\!delname!" /f
    echo 已删除!delname! & echo 是否继续删除: -[1]继续删除,按其他则返回开头-
    set /p value=
    if "!value!"=="1" (
        set /a value=0
        cls & goto :sixdel.s
    ) else (
        cls & goto :menu
    )
) else (
    cls & goto :menu
)
exit

:sixreg
cd /d c:\windows\
if not exist regjump.exe (
    echo HKEY_CLASSES_ROOT\SystemFileAssociations\.exe\shell\ | clip
    echo 已将地址复制到剪切板并为你打开了注册表
    regedit
    cls & goto :menu
) else (
    regjump "HKEY_CLASSES_ROOT\SystemFileAssociations\.exe\shell"
    cls & goto :menu
)
exit

rem ==============================================================================================
rem ==============================================================================================
rem ==============================================================================================

**解压密码是52pojie**

![](https://static.52pojie.cn/static/image/filetype/zip.gif)

[右键二级菜单.zip](forum.php?mod=attachment&aid=Mjg3OTM3NXxlYmI5YmNhNnwxNzg5NjkxMzc1fDB8MjEyODM0Mg%3D%3D)

*(2.72 KB, 下载次数: 24)*

2026-9-16 12:14 上传

点击文件名下载附件

下载积分: 吾爱币 -1 CB

---

[查看原文](https://www.52pojie.cn/thread-2128342-1-1.html)
