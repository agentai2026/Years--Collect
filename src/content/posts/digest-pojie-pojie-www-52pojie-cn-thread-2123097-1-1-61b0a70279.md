---
title: "分享一个刚出炉的文件夹增量备份功能的批处理希望大家能用上。"
published: 2026-08-15
description: "使用场景，有两个目录backup和backup1 ，先把backup和backup1目录进行同步， 同步之后生成日志记录增量文件。根据日志把增量的部分单独复制到目录backup2 复制代码保存utf-8 批处理格式文件即可运行。生成日志的目录是批处理文件所在目录 @echo off setlocal enab ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "omar111"
sourceLink: "https://www.52pojie.cn/thread-2123097-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2123097-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

使用场景，有两个目录backup和backup1 ，先把backup和backup1目录进行同步，

同步之后生成日志记录增量文件。根据日志把增量的部分单独复制到目录backup2

复制代码保存utf-8 批处理格式文件即可运行。生成日志的目录是批处理文件所在目录

@echo off

setlocal enabledelayedexpansion

chcp 65001 >nul

::====================配置区====================

set "SOURCE=d:\backup"

set "BASE=d:\backup1"

set "INCREMENT=d:\backup2"

set "LOG=%~dp0增量日志_%date:/=-%_%time::=-%.log"

::================================================

echo ==============================================

echo 源目录：%SOURCE%

echo 基准目录：%BASE%

echo 增量文件存放：%INCREMENT%（仅存放变动文件）

echo ==============================================

echo.

if not exist "%SOURCE%" (

    echo [错误] 源目录不存在 %SOURCE%

    echo [错误] 源目录不存在 %SOURCE% >>"%LOG%"

    pause

    exit /b 1

)

::清空上次增量文件夹

if exist "%INCREMENT%" rmdir /s /q "%INCREMENT%" 2>nul

md "%INCREMENT%"

set "totalFile=0"

set "changeFile=0"

echo 【1】开始比对文件，仅复制变动文件至 %INCREMENT%

for /f "delims=" %%f in ('dir /s /b /a-d "%SOURCE%" 2^>nul') do (

    set /a totalFile+=1

    set "SrcFile=%%f"

    set "RelPath=!SrcFile:%SOURCE%=!"

    if "!RelPath:~0,1!"=="\" set "RelPath=!RelPath:~1!"

    set "BaseFile=%BASE%\!RelPath!"

    set "IncFile=%INCREMENT%\!RelPath!"

    set "NeedCopy=0"

    ::判定规则

    if not exist "!BaseFile!" (

        set NeedCopy=1

    ) else (

        for %%b in ("!BaseFile!") do (

            if not "%%~zf"=="%%~zb" (

                set NeedCopy=1

            ) else (

                if not "%%~tf"=="%%~tb" (

                    set NeedCopy=1

                )

            )

        )

    )

    ::只有变动才复制到backup2

    if !NeedCopy! equ 1 (

        set "IncDir=%%~dpf"

        set "IncDir=!IncDir:%SOURCE%=%INCREMENT%!"

        if not exist "!IncDir!" md "!IncDir!" 2>nul

        copy /y "!SrcFile!" "!IncFile!" >nul

        if !errorlevel! equ 0 (

            set /a changeFile+=1

            echo [变更] !RelPath!

            echo [变更] !RelPath! >>"%LOG%"

        ) else (

            echo [失败] !RelPath!

            echo [失败] !RelPath! >>"%LOG%"

        )

    )

)

echo.

echo 【2】更新基准目录 backup1，为下次比对做准备

robocopy "%SOURCE%" "%BASE%" /E /MIR /XO /XN /XC /R:3 /W:5 /NP /NDL >>"%LOG%"

echo.

echo ==============================================

echo 总共扫描文件：%totalFile%

echo 本次变动文件：%changeFile%

echo 变动文件仅保存在：%INCREMENT%

echo 日志文件：%LOG%

echo ==============================================

pause

---

[查看原文](https://www.52pojie.cn/thread-2123097-1-1.html)
