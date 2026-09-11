---
title: "Godot 4.8一键编译批处理"
published: 2026-09-10
description: "[mw_shl_code=shell,true]@echo off chcp 936 >nul 2>&1 setlocal enabledelayedexpansion title Godot 4.8-dev 一键编译 rem =============================================="
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "冥界3大法王"
sourceLink: "https://www.52pojie.cn/thread-2127383-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2127383-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(320.71 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3ODAxM3xkYTg0YWE4MnwxNzg5MDk4NjExfDB8MjEyNzM4Mw%3D%3D&nothumb=yes)

2026-9-10 20:27 上传

[Shell] *纯文本查看* *复制代码*
@echo off
chcp 936 >nul 2>&1
setlocal enabledelayedexpansion
title Godot 4.8-dev 一键编译

rem ============================================================
rem   Godot 4.8-dev 一键编译脚本
rem   项目路径：X:\Compile_My_Godot4.8
rem   用法：直接双击本文件
rem ============================================================

rem ------------------ 配置区（一般不用改） ------------------
set "PROJ=X:\Compile_My_Godot4.8"
set "PY=X:\Python310_x64\python.exe"

rem  可选驱动开关：
rem    0 = 关闭 accesskit / angle / d3d12（快速编译，推荐先用这个）
rem    1 = 启用三者（会先联网下载约 300MB 依赖，功能完整）
set "USE_EXTRA=0"
rem ---------------------------------------------------------

echo ============================================================
echo    Godot 4.8-dev 一键编译
echo ============================================================
echo.

rem ---------- 第 1 步：检查项目目录 ----------
echo [1/4] 检查项目目录 ...
if not exist "%PROJ%\SConstruct" (
    echo    [错误] 在 %PROJ% 下找不到 SConstruct 文件。
    echo    请确认项目路径是否正确，或修改本脚本开头的 PROJ 变量。
    goto :fail
)
echo    项目目录正常。

rem ---------- 第 2 步：检查 Python ----------
echo.
echo [2/4] 检查 Python ...
if not exist "%PY%" (
    echo    [错误] 找不到 Python：%PY%
    echo    请修改本脚本开头的 PY 变量，指向你的 python.exe。
    goto :fail
)
"%PY%" --version
if errorlevel 1 (
    echo    [错误] Python 无法正常运行。
    goto :fail
)

rem ---------- 第 3 步：检查 SCons ----------
echo.
echo [3/4] 检查 SCons ...
"%PY%" -c "import SCons" >nul 2>&1
if errorlevel 1 (
    echo    SCons 未安装，正在自动安装（使用清华镜像，请保持联网）...
    "%PY%" -m pip install scons -i [url=https://pypi.tuna.tsinghua.edu.cn/simple]https://pypi.tuna.tsinghua.edu.cn/simple[/url]
    if errorlevel 1 (
        echo.
        echo    [错误] SCons 安装失败。请检查网络，或手动执行：
        echo        "%PY%" -m pip install scons -i [url=https://pypi.tuna.tsinghua.edu.cn/simple]https://pypi.tuna.tsinghua.edu.cn/simple[/url]
        goto :fail
    )
)
echo    SCons 已就绪。

rem ---------- 第 4 步：编译 ----------
echo.
echo [4/4] 开始编译 ...
echo.

cd /d "%PROJ%"

set "SCONS=%PY%"
set "SCONSCMD=-m SCons"

set "EXTRA_FLAGS="
if "%USE_EXTRA%"=="1" (
    echo    正在安装可选驱动依赖（accesskit / angle / d3d12）...
    echo.
    "%PY%" misc\scripts\install_accesskit.py
    "%PY%" misc\scripts\install_angle.py
    "%PY%" misc\scripts\install_d3d12_sdk_windows.py
    echo.
) else (
    set "EXTRA_FLAGS=accesskit=no angle=no d3d12=no"
)

echo    编译参数：platform=windows target=editor arch=x86_64 !EXTRA_FLAGS!
echo    并行核心：%NUMBER_OF_PROCESSORS% 个
echo    预计耗时：20 ~ 40 分钟，请勿关闭本窗口
echo.
echo ------------------------------------------------------------
echo.

"%SCONS%" %SCONSCMD% platform=windows target=editor arch=x86_64 !EXTRA_FLAGS! -j%NUMBER_OF_PROCESSORS%

if errorlevel 1 (
    echo.
    echo ------------------------------------------------------------
    echo    [错误] 编译失败。
    echo    请把窗口上方最后 20 行左右的红色错误信息截图反馈。
    echo    常见原因参见 分析结果.md 的「常见问题排查」章节。
    goto :fail
)

rem ---------- 检查产物 ----------
echo.
echo ------------------------------------------------------------
echo.
if exist "%PROJ%\bin\godot.windows.editor.x86_64.exe" (
    echo ============================================================
    echo    编译成功！
    echo.
    echo    编辑器位置：
    echo    %PROJ%\bin\godot.windows.editor.x86_64.exe
    echo ============================================================
    echo.
    choice /c YN /n /m "是否立即启动编辑器？[Y=启动 / N=退出] "
    if errorlevel 2 goto :done
    start "" "%PROJ%\bin\godot.windows.editor.x86_64.exe"
    goto :done
) else (
    echo    [错误] 编译过程没有报错，但未找到产物文件。
    echo    请检查 bin 目录内容。
    goto :fail
)

:fail
echo.
echo 按任意键关闭窗口...
pause >nul
exit /b 1

:done
echo.
echo 按任意键关闭窗口...
pause >nul
exit /b 0

---

[查看原文](https://www.52pojie.cn/thread-2127383-1-1.html)
