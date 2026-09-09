---
title: "powershell bat ffmpeg 把视频均分为n段"
published: 2026-09-08
description: "看到了https://www.52pojie.cn/thread-2126892-1-1.html 下载了挺好用，但是有点大，自己的电脑已经安装了ffmpeg也配置了path，所以用豆包写了个ps1和bat的。 使用方法： 1 需要你的电脑已经安装ffmpeg，并且配置了 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "joody"
sourceLink: "https://www.52pojie.cn/thread-2126967-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2126967-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

看到了https://www.52pojie.cn/thread-2126892-1-1.html

下载了挺好用，但是有点大，自己的电脑已经安装了ffmpeg也配置了path，所以用豆包写了个ps1和bat的。

![](https://static.52pojie.cn/static/image/common/none.gif)

**截图.jpg** *(192.84 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3NzUyMXxhMzc2ZjE4OHwxNzg4OTE5MzAyfDB8MjEyNjk2Nw%3D%3D&nothumb=yes)

2026-9-8 13:52 上传

使用方法：

1 需要你的电脑已经安装ffmpeg，并且配置了path

2 把视频拖入到bat上面，

3 cmd窗口选择复制还是重新编码

4 cmd窗口选择分成几段视频，

5 回车，等待即可。

懒得复制代码的，可以直接下载：下载:https://tinyant.lanzouu.com/iCpYG47c405i 密码:52pj

代码如下：

[Asm] *纯文本查看* *复制代码*

param(
[Parameter(ValueFromRemainingArguments=$true)]
$InputFile
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8

# 没有传入文件
if(-not $InputFile){
Write-Host "`n用法：把视频拖拽到【split.bat】图标上运行`n" -ForegroundColor Yellow
Read-Host "按回车退出"
exit 1
}
$InputFile = $InputFile[0]
if(-not (Test-Path $InputFile -PathType Leaf)){
Write-Host "文件不存在：$InputFile" -ForegroundColor Red
Read-Host "回车退出"
exit 1
}

# 检查ffmpeg ffprobe
try{
$null = Get-Command ffmpeg -ErrorAction Stop
$null = Get-Command ffprobe -ErrorAction Stop
}
catch{
Write-Host "错误：PATH找不到ffmpeg / ffprobe，请配置环境变量" -ForegroundColor Red
Read-Host "回车退出"
exit 1
}

$fileObj = Get-Item $InputFile
$inputDir = $fileObj.DirectoryName
$baseName = $fileObj.BaseName

# ----------------------选择编码模式----------------------
Write-Host "`n=============================================="
Write-Host "源文件: $InputFile"
Write-Host "请选择分割模式："
Write-Host "[直接回车] 流复制（速度快，可能黑屏）【默认】"
Write-Host "[输入1] 重编码（速度慢，兼容性好，修复黑屏）"
Write-Host "=============================================="
while($true){
$modeInp = Read-Host "mode"
if([string]::IsNullOrWhiteSpace($modeInp)){
#直接回车 默认流复制
$vCodec = "-c copy"
Write-Host ">>已选择：流复制模式`n"
break
}
if($modeInp -eq "1"){
$vCodec = "-c:v libx264 -preset fast -c:a aac"
Write-Host ">>已选择：重编码模式`n"
break
}
Write-Host "无效输入，直接回车=流复制；输入1=重编码"
}

# ----------------------输入分段数量----------------------
$minSeg = 2
$maxSeg = 10
$defaultSeg = 6
Write-Host "=============================================="
Write-Host "输入分段数量 ($minSeg-$maxSeg)，直接回车默认 $defaultSeg"
Write-Host "=============================================="
while($true){
$inp = Read-Host "segments"
if([string]::IsNullOrWhiteSpace($inp)){
$segCount = $defaultSeg
break
}
[int]$num = 0
if([int]::TryParse($inp,[ref]$num)){
if($num -ge $minSeg -and $num -le $maxSeg){
$segCount = $num
break
}else{
Write-Host "数值范围 $minSeg ~ $maxSeg" -ForegroundColor DarkYellow
}
}else{
Write-Host "不是有效数字，请重新输入" -ForegroundColor DarkYellow
}
}

#读取视频时长
Write-Host "`n正在读取视频时长..."
$durRaw = ffprobe -v error -select_streams v:0 -show_entries stream=duration -of default=noprint_wrappers=1:nokey=1 "`"$InputFile`"" 2>$null
if(-not $durRaw){
Write-Host "读取视频时长失败！" -ForegroundColor Red
Read-Host "回车退出"
exit 1
}
$totalDur = [double]$durRaw
Write-Host "总时长(秒): $totalDur"

#输出文件夹
$timeStr = Get-Date -Format "yyyyMMdd_HHmmss"
$outFolder = Join-Path $inputDir "$timeStr`_split"
New-Item -Path $outFolder -ItemType Directory -Force | Out-Null
Write-Host "输出目录: $outFolder"

$segLen = [Math]::Round($totalDur / $segCount,4)
Write-Host "每段时长: $segLen 秒`n"

#循环分割
for($i=0; $i -lt $segCount; $i++){
$startSec = [Math]::Round($i * $segLen,4)
$idx = $i + 1
$idxStr = $idx.ToString("D2")
$outFile = Join-Path $outFolder "$baseName`_$idxStr.mp4"

Write-Host "------------------------------------------------"
Write-Host "[$idxStr/$segCount] start=$startSec length=$segLen"
ffmpeg -y -i "`"$InputFile`"" -ss $startSec -t $segLen @($vCodec.Split()) "`"$outFile`""
$rc = $LASTEXITCODE
Write-Host "ffmpeg 返回码: $rc`n"
}

Write-Host "=============================================="
Write-Host "全部处理完成！输出文件夹：$outFolder" -ForegroundColor Green
Write-Host "=============================================="
# Read-Host "`n按回车键关闭窗口"

[Asm] *纯文本查看* *复制代码*
@echo off
chcp 65001 >nul
if "%~1"=="" (
echo 请把视频文件拖拽到此bat图标上
pause
exit
)
powershell -ExecutionPolicy Bypass -File "%~dp0split_video.ps1" "%~1"
pause

---

[查看原文](https://www.52pojie.cn/thread-2126967-1-1.html)
