---
title: "音频频谱图批量生成工具 v0.4（FFmpeg批量验证音频无损的真假）"
published: 2026-10-12
description: "音频频谱图批量生成工具 v0.4（FFmpeg批量验证音频无损的真假）"
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "午夜飘雪"
sourceLink: "https://www.52pojie.cn/thread-2132001-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2132001-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

**音频频谱图批量生成工具 v0.4（FFmpeg批量验证音频无损的真假）**

**简介**

Windows批处理脚本，一键批量生成音频频谱截图。适合收藏无损/怀旧老歌，快速查看音频高频截止，用来判断音源是否为真无损、有无高频被切掉，方便整理NAS音乐库。

**用途说明**很多怀旧老歌、网上抓的MP3，高频会在16k附近一刀切。用这条参考线一眼就能看出频谱截断，快速辨别是不是降质二次转码音源，整理音乐库非常方便。

**效果**

自动截取音频第30秒处频谱图，自带16170Hz白色参考横线，图片顶部居中显示完整文件名（含后缀），文字带黑描边，在深色频谱背景下清晰可读。

**支持格式**

flac / mp3 / m4a / wav支持拖拽单个音频文件或者整个音乐文件夹到bat上直接批量跑；可以读取群晖NAS SMB共享目录的音乐（UNC网络路径）。

**图片效果说明**
频谱面板：showspectrumpic，带左侧频率刻度，分辨率1920×600参考白线：固定16170Hz，快速观察音频高频上限（16k是很多老CD/MP3的典型截止点）标题文字：画面顶部居中，完整文件名+后缀，白色字体+黑色描边，不会压住刻度输出位置：在原音频所在目录自动新建spectrum文件夹，所有频谱png统一存放

**使用方法**

**把ffmpeg.exe和这个bat放在同一个文件夹****直接拖拽音频/整个歌曲文件夹，丢到bat文件上，自动开始生成**生成好的频谱图，保存在原音频目录 spectrum 子文件夹内

**

前置依赖**
下载ffmpeg，取出ffmpeg.exe，和bat放一起(度盘内已上传 ,或者自己去下载)Windows自带微软雅黑msyh.ttc字体，一般系统无需额外安装字体NAS SMB共享音乐也可以直接拖拽使用（CMD会提示UNC警告，不影响ffmpeg执行）

**下载地址**

![](https://static.52pojie.cn/static/image/filetype/text.gif)

[夜未央音频频谱生成工具.txt](forum.php?mod=attachment&aid=Mjg4NTA5N3xjNTVhYjcwY3wxNzkxNzc0MDc3fDB8MjEzMjAwMQ%3D%3D)

*(176 Bytes, 下载次数: 21)*

2026-10-12 00:35 上传

点击文件名下载附件

下载积分: 吾爱币 -1 CB

**

度盘内有0.1 - 0.4 版本 自取适合自己的版本**

**好用的话  请多多支持

好用的话  请多多支持

好用的话  请多多支持

0

**

![](https://static.52pojie.cn/static/image/common/none.gif)

**新建 BMP 图像.png** *(91.29 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4NTA5OHwzMmQxNWMzNXwxNzkxNzc0MDc3fDB8MjEzMjAwMQ%3D%3D&nothumb=yes)

2026-10-12 00:43 上传

**

1

**

![](https://static.52pojie.cn/static/image/common/none.gif)

**雷军-Are you OK！.flac.png** *(469.33 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4NTA5OXw2MmQwYzcxNXwxNzkxNzc0MDc3fDB8MjEzMjAwMQ%3D%3D&nothumb=yes)

2026-10-12 00:43 上传

**

2

**

![](https://static.52pojie.cn/static/image/common/none.gif)

**沈雁-少女的初夜.mp3.png** *(425.39 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4NTEwMHwxNmNkZjdlYnwxNzkxNzc0MDc3fDB8MjEzMjAwMQ%3D%3D&nothumb=yes)

2026-10-12 00:43 上传

**

3**

![](https://static.52pojie.cn/static/image/common/none.gif)

**杨小壮-再也不是你.flac.png** *(415.34 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4NTEwMXw1YTRhMGE0MnwxNzkxNzc0MDc3fDB8MjEzMjAwMQ%3D%3D&nothumb=yes)

2026-10-12 00:43 上传

**脚本代码

**[Asm] *纯文本查看* *复制代码*
@echo off
chcp 936 >nul
setlocal enabledelayedexpansion

if "%~1"=="" (
    echo 使用方法：拖拽音频文件 或者 音乐文件夹到此bat
    pause
    exit /b
)

:loop
if "%~1"=="" goto end
set "input=%~1"

if exist "%input%\*" (
    echo 扫描文件夹：!input!
    pushd "!input!" 2>nul
    for /r %%f in (*.flac *.mp3 *.m4a *.wav) do call :procfile "%%f"
    popd
) else (
    echo 处理单个文件：!input!
    call :procfile "!input!"
)

shift
goto loop

:procfile
set "audio=%~1"
set "audiodir=%~dp1"
:: %~nx1 = 文件名 + 扩展名
set "basename=%~nx1"
set "outdir=!audiodir!spectrum\"
set "outpng=!outdir!!basename!.png"

if exist "!outpng!" (
    echo 【跳过】已存在：%~nx1
    exit /b
)
if not exist "!outdir!" mkdir "!outdir!"

echo 正在处理: !audio!
ffmpeg -y -ss 30 -i "!audio!" -filter_complex "showspectrumpic=s=1920x600:legend=1,drawbox=y=217:color=white:width=iw:height=1:t=fill,drawtext=fontfile=C\\:/Windows/Fonts/msyh.ttc:text=!basename!:x=(w-text_w)/2:y=12:fontsize=28:fontcolor=white:borderw=1:bordercolor=black" -frames:v 1 "!outpng!"

if exist "!outpng!" (
    echo 成功：%~nx1
) else (
    echo 失败：%~nx1
)
echo.
exit /b

:end
endlocal
echo ======================
echo 全部任务处理完毕
pause

**

自定义微调参数（按需改）**

1. y=217：白色16170Hz参考线，上下移动这条横线

2. y=12：顶部文件名文字垂直位置，数字越大文字越往下

3. fontsize=28：标题文字大小4. -ss 30：截取音频第30秒画面，可以改成别的秒数

**打完收工**

---

[查看原文](https://www.52pojie.cn/thread-2132001-1-1.html)
