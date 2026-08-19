---
title: "采集电脑硬件信息并上报"
published: 2026-08-17
description: "win的论坛有，这个是客户端为Linux，比如国产化系统，采集信息发送至服务端，用于资产管理，服务端我是win，所以只写了win，懒，服务端禁止运行脚本的运行txt里的命令，服务端右键使用powershell运行，客户端运行：打开终 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "ruanyang2"
sourceLink: "https://www.52pojie.cn/thread-2123457-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2123457-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

win的论坛有，这个是客户端为Linux，比如国产化系统，采集信息发送至服务端，用于资产管理，服务端我是win，所以只写了win，懒，服务端禁止运行脚本的运行txt里的命令，服务端右键使用powershell运行，客户端运行：打开终端，输入python3空格（把客户端拖进终端），回车，文件大小3K,代码怎么发忘了，不过不重要，客户端如果是win的话也能用，通过网盘分享的文件：win+Linux收集硬件信息.7z

链接: https://pan.baidu.com/s/1N4lnYRMIu2UzEGQV3oXVqQ?pwd=bz3f 提取码: bz3f 复制这段内容后打开百度网盘手机App，操作更方便哦

--来自百度网盘超级会员v1的分享
$Port = 51528 $CsvFile = "C:\hw_info\devices.csv"

New-Item -ItemType Directory -Path "C:\hw_info" -Force | Out-Null

if (!(Test-Path $CsvFile)) { "client_id,hostname,user_name,location,os,kernel,cpu_model,cpu_cores,memory_total,ip_address,mac_address,timestamp" | Out-File -FilePath$CsvFile -Encoding UTF8

}

Write-Host "UDP server listening on port $Port..." -ForegroundColor Green

$localEP = New-Object System.Net.IPEndPoint([System.Net.IPAddress]::Any, [int]$Port)

$udp = New-Object System.Net.Sockets.UdpClient($localEP)

$remoteEP = New-Object System.Net.IPEndPoint([System.Net.IPAddress]::Any, 0)

while ($true) { $bytes = $udp.Receive([ref]$remoteEP)

if ($bytes.Length -eq 0) { continue }

`$json = [System.Text.Encoding]::UTF8.GetString($bytes)
$obj = $json | ConvertFrom-Json

$client_id = $obj.client_id
$hostname = $obj.hostname
$user_name = $obj.user_name
$location = $obj.location
$os = $obj.os
$kernel = $obj.kernel
$cpu_model = $obj.cpu_model
$cpu_cores = $obj.cpu_cores
$memory_total = $obj.memory_total
$timestamp = $obj.timestamp

$ip_address = ""
$mac_address = ""
if ($obj.network -ne $null) {
    foreach ($nic in $obj.network) {
        if ($nic.name -ne "lo" -and $nic.ip -and $nic.ip -ne "") {
            $ip_address = $nic.ip
            $mac_address = $nic.mac
            break
        }
    }
}

$csvLine = '"' + $client_id + '","' + $hostname + '","' + $user_name + '","' + $location + '","' + $os + '","' + $kernel + '","' + $cpu_model + '",' + $cpu_cores + ',' + $memory_total + ',"' + $ip_address + '","' + $mac_address + '","' + $timestamp + '"'
Add-Content -Path $CsvFile -Value $csvLine

Write-Host "Saved: $hostname ($user_name @ $location) IP: $ip_address MAC: $mac_address" -ForegroundColor Cyan`
}

---

[查看原文](https://www.52pojie.cn/thread-2123457-1-1.html)
