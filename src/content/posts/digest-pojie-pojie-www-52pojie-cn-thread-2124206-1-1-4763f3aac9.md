---
title: "hosts云端同步备份/恢复"
published: 2026-08-22
description: "功能 1.增删查改 hosts 记录 2.本地/云端 多版本备份/恢复 3.可以设置备份上限，上限后自动删除hosts_前缀的备份，重命名的不删（不能hosts_前缀）。 使用方法 点启动.bat 云端备份 GitHub Token 打开 https://github.com/settings/tokens 点「Gen"
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "pxhzai"
sourceLink: "https://www.52pojie.cn/thread-2124206-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2124206-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

功能

1.增删查改 hosts 记录

2.本地/云端 多版本备份/恢复

3.可以设置备份上限，上限后自动删除hosts_前缀的备份，重命名的不删（不能hosts_前缀）。

使用方法  点启动.bat

云端备份

GitHub Token 打开 [https://github.com/settings/tokens](https://github.com/settings/tokens) 点「Generate new token (classic)」 勾选 repo 权限（包含仓库读写）

Gitee Token 打开 [https://gitee.com/profile/personal_access_tokens](https://gitee.com/profile/personal_access_tokens) 点「生成新令牌」 勾选 projects 权限（仓库读写）

仓库地址[https://github.com/pxhzaii/HostsCloud](https://github.com/pxhzaii/HostsCloud)

下载地址[https://pxhzai.lanzoub.com/i52lX43yjjrc](https://pxhzai.lanzoub.com/i52lX43yjjrc)

部分代码

[PowerShell] *纯文本查看* *复制代码*
# Hosts Manager - PowerShell backend
# Works on Win7+ with built-in PowerShell, no installation needed
# Features: CRUD hosts records, local multi-version backup, GitHub/Gitee cloud sync

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$AppDir    = Split-Path -Parent $MyInvocation.MyCommand.Path
$DataDir   = Join-Path $AppDir "data"
$BackupDir = Join-Path $DataDir "backups"
$ConfigFile = Join-Path $DataDir "config.json"
$HostsFile = Join-Path $env:SystemRoot "System32\drivers\etc\hosts"

# === Utility functions ===

function Ensure-Dirs {
    if (-not (Test-Path $DataDir))   { New-Item -ItemType Directory -Path $DataDir -Force | Out-Null }
    if (-not (Test-Path $BackupDir)) { New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null }
}

function Get-Timestamp { Get-Date -Format "yyyyMMdd_HHmmss" }

function ConvertTo-JsonArray($items) {
    if ($null -eq $items) { return "[]" }
    if ($items -is [System.Collections.IList] -or $items -is [System.Array] -or ($items -is [System.Collections.ArrayList])) {
        $parts = @()
        foreach ($item in $items) {
            $parts += ($item | ConvertTo-Json -Depth 10 -Compress)
        }
        return "[" + ($parts -join ",") + "]"
    }
    return $items | ConvertTo-Json -Depth 10 -Compress
}

function Send-Json($data) {
    # Fix: PowerShell ConvertTo-Json turns empty arrays into null and single-item arrays into objects
    # We handle the data field specially to ensure arrays stay as JSON arrays
    if ($data -is [System.Collections.Hashtable]) {
        $parts = @()
        foreach ($key in $data.Keys) {
            $val = $data[$key]
            if ($val -is [System.Collections.IList] -or $val -is [System.Array]) {
                $jsonVal = ConvertTo-JsonArray $val
            } elseif ($null -eq $val) {
                $jsonVal = "null"
            } elseif ($val -is [string]) {
                $jsonVal = '"' + ($val -replace '"', '\"' -replace '\\', '\\\\' -replace "`r", '\r' -replace "`n", '\n' -replace "`t", '\t') + '"'
            } elseif ($val -is [boolean]) {
                $jsonVal = if ($val) { "true" } else { "false" }
            } elseif ($val -is [int] -or $val -is [long] -or $val -is [double]) {
                $jsonVal = $val.ToString()
            } else {
                $jsonVal = $val | ConvertTo-Json -Depth 10 -Compress
            }
            $parts += '"' + $key + '":' + $jsonVal
        }
        $json = "{" + ($parts -join ",") + "}"
    } else {
        $json = $data | ConvertTo-Json -Depth 10 -Compress
        if ($null -eq $json) { $json = "null" }
    }
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
    $response.ContentType = "application/json; charset=utf-8"
    $response.ContentLength64 = $bytes.Length
    $response.OutputStream.Write($bytes, 0, $bytes.Length)
    $response.OutputStream.Close()
}

function Send-Ok($data, $msg) { Send-Json @{ ok = $true;  msg = $msg; data = $data } }
function Send-Fail($msg)     { Send-Json @{ ok = $false; msg = $msg; data = $null } }

function Send-Page($html) {
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($html)
    $response.ContentType = "text/html; charset=utf-8"
    $response.ContentLength64 = $bytes.Length
    $response.OutputStream.Write($bytes, 0, $bytes.Length)
    $response.OutputStream.Close()
}

# === Config ===

function Load-Config {
    Ensure-Dirs
    $default = @{ cloud = @{ type = ""; token = ""; repo = ""; branch = "main"; path = "hosts" }; maxBackups = 5 }
    if (Test-Path $ConfigFile) {
        try {
            $cfg = Get-Content $ConfigFile -Raw -Encoding UTF8 | ConvertFrom-Json
            if (-not $cfg.cloud) { $cfg | Add-Member -NotePropertyName cloud -NotePropertyValue $default.cloud }
            foreach ($k in $default.cloud.PSObject.Properties.Name) {
                if (-not ($cfg.cloud.PSObject.Properties.Name -contains $k)) {
                    $cfg.cloud | Add-Member -NotePropertyName $k -NotePropertyValue $default.cloud.$k
                }
            }
            if ($null -eq $cfg.maxBackups) { $cfg | Add-Member -NotePropertyName maxBackups -NotePropertyValue 5 }
            return $cfg
        } catch { }
    }
    return $default
}

function Save-Config($cfg) {
    Ensure-Dirs
    # Rebuild as plain hashtable to avoid PSCustomObject serialization artifacts
    $clean = @{ cloud = @{ type = $cfg.cloud.type; token = $cfg.cloud.token; repo = $cfg.cloud.repo; branch = $cfg.cloud.branch; path = $cfg.cloud.path }; maxBackups = $cfg.maxBackups }
    $clean | ConvertTo-Json -Depth 5 | Set-Content $ConfigFile -Encoding UTF8
}

# === Hosts read/write/parse ===

function Read-HostsText {
    if (-not (Test-Path $HostsFile)) { return "" }
    try { return Get-Content $HostsFile -Raw -Encoding UTF8 }
    catch { return $null }
}

function Write-HostsText($text) {
    $dir = Split-Path $HostsFile
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    [System.IO.File]::WriteAllText($HostsFile, $text, [System.Text.UTF8Encoding]::new($false))
}

function Parse-Hosts($text) {
    $records = [System.Collections.ArrayList]@()
    $lines = $text -split "`r?`n"
    for ($i = 0; $i -lt $lines.Length; $i++) {
        $line = $lines[$i]
        $stripped = $line.Trim()
        if (-not $stripped -or $stripped.StartsWith("#")) {
            [void]$records.Add(@{ ip = ""; domain = ""; comment = ""; enabled = $false; raw = $line; idx = $i })
            continue
        }
        $comment = ""
        $body = $stripped
        if ($stripped.Contains("#")) {
            $parts = $stripped -split "#", 2
            $body = $parts[0].Trim()
            $comment = $parts[1].Trim()
        }
        $fields = $body -split "\s+" | Where-Object { $_ -ne "" }
        if ($fields.Length -ge 2) {
            [void]$records.Add(@{ ip = $fields[0]; domain = $fields[1]; comment = $comment; enabled = $true; raw = $line; idx = $i })
        } else {
            [void]$records.Add(@{ ip = ""; domain = ""; comment = ""; enabled = $true; raw = $line; idx = $i })
        }
    }
    , $records
}

function Serialize-Records($records) {
    $lines = @()
    foreach ($r in $records) {
        if (-not $r.enabled) {
            $lines += if ($r.raw -ne $null) { $r.raw } else { "" }
        } else {
            $ip = ($r.ip + "").Trim()
            $domain = ($r.domain + "").Trim()
            $comment = ($r.comment + "").Trim()
            if ($ip -and $domain) {
                $line = "$ip $domain"
                if ($comment) { $line += "  # $comment" }
                $lines += $line
            } else {
                $lines += if ($r.raw -ne $null) { $r.raw } else { "" }
            }
        }
    }
    return ($lines -join "`n")
}

function Get-Records {
    $text = Read-HostsText
    if ($text -eq $null) { return $null }
    return Parse-Hosts $text
}

function Save-Records($records) {
    $text = Serialize-Records $records
    Write-HostsText $text
}

# === Local backup ===

function Backup-Current {
    Ensure-Dirs
    $text = Read-HostsText
    if ($text -eq $null) { return $false }
    $ts = Get-Timestamp
    $path = Join-Path $BackupDir "hosts_$ts.txt"
    [System.IO.File]::WriteAllText($path, $text, [System.Text.UTF8Encoding]::new($false))

    # Keep only the latest N backups (configurable, default 5), delete older ones
    $maxBk = (Load-Config).maxBackups
    if (-not $maxBk -or $maxBk -lt 1) { $maxBk = 5 }
    $oldFiles = Get-ChildItem $BackupDir -Filter "hosts_*.txt" -ErrorAction SilentlyContinue | Sort-Object Name -Descending | Select-Object -Skip $maxBk
    if ($oldFiles) {
        foreach ($f in $oldFiles) { Remove-Item $f.FullName -Force -ErrorAction SilentlyContinue }
    }
    return $path
}

function List-Backups {
    Ensure-Dirs
    $items = [System.Collections.ArrayList]@()
    Get-ChildItem $BackupDir -Filter "*.txt" -ErrorAction SilentlyContinue | Sort-Object Name -Descending | ForEach-Object {
        $isNamed = -not $_.Name.StartsWith("hosts_")
        [void]$items.Add(@{ name = $_.Name; time = $_.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss"); size = $_.Length; named = $isNamed })
    }
    , $items
}

function Rename-Backup($oldName, $newName) {
    $safeOld = [System.IO.Path]::GetFileName($oldName)
    $safeNew = [System.IO.Path]::GetFileName($newName)
    if (-not $safeNew.EndsWith(".txt")) { $safeNew = $safeNew + ".txt" }
    $oldPath = Join-Path $BackupDir $safeOld
    $newPath = Join-Path $BackupDir $safeNew
    if (-not (Test-Path $oldPath)) { return $false, "Backup not found" }
    if (Test-Path $newPath) { return $false, "Name already exists" }
    Rename-Item -Path $oldPath -NewName $safeNew -Force
    return $true, $safeNew
}

function Read-Backup($name) {
    $safe = [System.IO.Path]::GetFileName($name)
    $path = Join-Path $BackupDir $safe
    if (-not (Test-Path $path)) { return $null }
    return [System.IO.File]::ReadAllText($path, [System.Text.UTF8Encoding]::new($false))
}

function Delete-Backup($name) {
    $safe = [System.IO.Path]::GetFileName($name)
    $path = Join-Path $BackupDir $safe
    if (Test-Path $path) { Remove-Item $path -Force; return $true }
    return $false
}

function Restore-Backup($name) {
    $content = Read-Backup $name
    if ($content -eq $null) { return $false }
    Backup-Current | Out-Null
    Write-HostsText $content
    return $true
}

# === Cloud sync (GitHub / Gitee REST API) ===

function Get-CloudConfig { (Load-Config).cloud }

function Get-EncodedPath($path) {
    return ($path -split "/" | ForEach-Object { [uri]::EscapeDataString($_) }) -join "/"
}

function Test-Cloud {
    $c = Get-CloudConfig
    $type = $c.type; $token = $c.token; $repo = $c.repo
    if ($type -eq "github") {
        try {
            $r = Invoke-RestMethod -Uri "https://api.github.com/user" -Headers @{ Authorization = "Bearer $token"; Accept = "application/vnd.github+json" } -TimeoutSec 15
            return @{ ok = $true; msg = "GitHub: $($r.login)" }
        } catch { return @{ ok = $false; msg = "GitHub: $($_.Exception.Message)" } }
    } elseif ($type -eq "gitee") {
        try {
            $r = Invoke-RestMethod -Uri "https://gitee.com/api/v5/user?access_token=$([uri]::EscapeDataString($token))" -TimeoutSec 15
            return @{ ok = $true; msg = "Gitee: $($r.login)" }
        } catch { return @{ ok = $false; msg = "Gitee: $($_.Exception.Message)" } }
    }
    return @{ ok = $false; msg = "Please select cloud type" }
}

function Cloud-GetFile {
    $c = Get-CloudConfig
    $type = $c.type; $token = $c.token
    $repo  = ($c.repo).Trim().Trim("/")
    $branch = if ($c.branch) { $c.branch } else { "main" }
    $path = if ($c.path) { $c.path } else { "hosts" }
    if (-not $repo) { return $null, "Repo not configured" }

    if ($type -eq "github") {
        try {
            $url = "https://raw.githubusercontent.com/$repo/$([uri]::EscapeDataString($branch))/$(Get-EncodedPath $path)"
            $content = (Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 15).Content
            return $content, $null
        } catch { }
        try {
            $url = "https://api.github.com/repos/$repo/contents/$(Get-EncodedPath $path)?ref=$([uri]::EscapeDataString($branch))"
            $r = Invoke-RestMethod -Uri $url -Headers @{ Authorization = "Bearer $token"; Accept = "application/vnd.github+json" } -TimeoutSec 15
            $content = [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($r.content))
            return $content, $null
        } catch { return $null, "Read failed: $($_.Exception.Message)" }
    } elseif ($type -eq "gitee") {
        try {
            $url = "https://gitee.com/$repo/raw/$([uri]::EscapeDataString($branch))/$(Get-EncodedPath $path)"
            $content = (Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 15).Content
            return $content, $null
        } catch { }
        try {
            $url = "https://gitee.com/api/v5/repos/$repo/contents/$(Get-EncodedPath $path)?ref=$([uri]::EscapeDataString($branch))&access_token=$([uri]::EscapeDataString($token))"
            $r = Invoke-RestMethod -Uri $url -TimeoutSec 15
            $content = [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($r.content))
            return $content, $null
        } catch { return $null, "Read failed: $($_.Exception.Message)" }
    }
    return $null, "Please select cloud type"
}

function Cloud-UpdateFile($content, $message) {
    $c = Get-CloudConfig
    $type = $c.type; $token = $c.token
    $repo  = ($c.repo).Trim().Trim("/")
    $branch = if ($c.branch) { $c.branch } else { "main" }
    if (-not $repo) { return $false, "Repo not configured" }
    $encoded = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($content))

    # Always create a new timestamped file in backups/ directory
    $ts = Get-Timestamp
    $cloudPath = "backups/hosts_$ts.txt"
    $encodedPath = Get-EncodedPath $cloudPath

    if ($type -eq "github") {
        $headers = @{ Authorization = "Bearer $token"; Accept = "application/vnd.github+json" }
        $payload = @{ message = $message; content = $encoded; branch = $branch }
        $json = $payload | ConvertTo-Json -Depth 5
        try {
            $url = "https://api.github.com/repos/$repo/contents/$encodedPath"
            Invoke-RestMethod -Uri $url -Method PUT -Headers $headers -Body $json -ContentType "application/json" -TimeoutSec 15 | Out-Null
            return $true, "Pushed to GitHub"
        } catch { return $false, "Push failed: $($_.Exception.Message)" }
    } elseif ($type -eq "gitee") {
        $payload = @{ access_token = $token; content = $encoded; message = $message; branch = $branch }
        $json = $payload | ConvertTo-Json -Depth 5
        try {
            $url = "https://gitee.com/api/v5/repos/$repo/contents/$encodedPath"
            Invoke-RestMethod -Uri $url -Method POST -Body $json -ContentType "application/json" -TimeoutSec 15 | Out-Null
            return $true, "Pushed to Gitee"
        } catch { return $false, "Push failed: $($_.Exception.Message)" }
    }
    return $false, "Please select cloud type"
}

function Cloud-ListHistory {
    $c = Get-CloudConfig
    $type = $c.type; $token = $c.token
    $repo  = ($c.repo).Trim().Trim("/")
    $branch = if ($c.branch) { $c.branch } else { "main" }
    if (-not $repo) { , @(); return }
    $items = [System.Collections.ArrayList]@()
    $encodedPath = Get-EncodedPath "backups"

    if ($type -eq "github") {
        try {
            $url = "https://api.github.com/repos/$repo/contents/$encodedPath?ref=$([uri]::EscapeDataString($branch))"
            $r = Invoke-RestMethod -Uri $url -Headers @{ Authorization = "Bearer $token"; Accept = "application/vnd.github+json" } -TimeoutSec 15
            $files = @($r | Where-Object { $_.name -like "*.txt" } | Sort-Object name -Descending)
            foreach ($f in $files) {
                $isNamed = -not $f.name.StartsWith("hosts_")
                [void]$items.Add(@{ name = $f.name; path = $f.path; size = $f.size; named = $isNamed })
            }
        } catch { Write-Host "GH history error: $_" }
    } elseif ($type -eq "gitee") {
        try {
            $url = "https://gitee.com/api/v5/repos/$repo/contents/$encodedPath`?ref=$([uri]::EscapeDataString($branch))&access_token=$([uri]::EscapeDataString($token))"
            $r = Invoke-RestMethod -Uri $url -TimeoutSec 15
            $files = @($r | Where-Object { $_.name -like "*.txt" } | Sort-Object name -Descending)
            foreach ($f in $files) {
                $isNamed = -not $f.name.StartsWith("hosts_")
                [void]$items.Add(@{ name = $f.name; path = $f.path; size = $f.size; named = $isNamed })
            }
        } catch { Write-Host "Gitee history error: $_" }
    }
    , $items
}

function Cloud-ReadBackup($filePath) {
    $c = Get-CloudConfig
    $type = $c.type; $token = $c.token
    $repo  = ($c.repo).Trim().Trim("/")
    $branch = if ($c.branch) { $c.branch } else { "main" }
    $encodedPath = Get-EncodedPath $filePath

    if ($type -eq "github") {
        try {
            $url = "https://raw.githubusercontent.com/$repo/$([uri]::EscapeDataString($branch))/$encodedPath"
            return (Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 15).Content, $null
        } catch { }
        try {
            $url = "https://api.github.com/repos/$repo/contents/$encodedPath?ref=$([uri]::EscapeDataString($branch))"
            $r = Invoke-RestMethod -Uri $url -Headers @{ Authorization = "Bearer $token"; Accept = "application/vnd.github+json" } -TimeoutSec 15
            return [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($r.content)), $null
        } catch { return $null, "Read failed: $($_.Exception.Message)" }
    } elseif ($type -eq "gitee") {
        try {
            $url = "https://gitee.com/$repo/raw/$([uri]::EscapeDataString($branch))/$encodedPath"
            return (Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 15).Content, $null
        } catch { }
        try {
            $url = "https://gitee.com/api/v5/repos/$repo/contents/$encodedPath?ref=$([uri]::EscapeDataString($branch))&access_token=$([uri]::EscapeDataString($token))"
            $r = Invoke-RestMethod -Uri $url -TimeoutSec 15
            return [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($r.content)), $null
        } catch { return $null, "Read failed: $($_.Exception.Message)" }
    }
    return $null, "Please select cloud type"
}

function Cloud-DeleteBackup($filePath) {
    $c = Get-CloudConfig
    $type = $c.type; $token = $c.token
    $repo  = ($c.repo).Trim().Trim("/")
    $branch = if ($c.branch) { $c.branch } else { "main" }
    $encodedPath = Get-EncodedPath $filePath

    if ($type -eq "github") {
        try {
            $url = "https://api.github.com/repos/$repo/contents/$encodedPath?ref=$([uri]::EscapeDataString($branch))"
            $r = Invoke-RestMethod -Uri $url -Headers @{ Authorization = "Bearer $token"; Accept = "application/vnd.github+json" } -TimeoutSec 15
            $sha = $r.sha
            $delUrl = "https://api.github.com/repos/$repo/contents/$encodedPath"
            $delBody = @{ message = "delete $filePath"; sha = $sha; branch = $branch } | ConvertTo-Json -Compress
            Invoke-RestMethod -Uri $delUrl -Method DELETE -Headers @{ Authorization = "Bearer $token"; Accept = "application/vnd.github+json" } -Body $delBody -ContentType "application/json" -TimeoutSec 15 | Out-Null
            return $true, "Deleted"
        } catch { return $false, "Delete failed: $($_.Exception.Message)" }
    } elseif ($type -eq "gitee") {
        try {
            $url = "https://gitee.com/api/v5/repos/$repo/contents/$encodedPath`?ref=$([uri]::EscapeDataString($branch))&access_token=$([uri]::EscapeDataString($token))"
            $r = Invoke-RestMethod -Uri $url -TimeoutSec 15
            $sha = $r.sha
            $delUrl = "https://gitee.com/api/v5/repos/$repo/contents/$encodedPath"
            $delBody = @{ access_token = $token; sha = $sha; message = "delete $filePath"; branch = $branch } | ConvertTo-Json -Compress
            Invoke-RestMethod -Uri $delUrl -Method DELETE -Body $delBody -ContentType "application/json" -TimeoutSec 15 | Out-Null
            return $true, "Deleted"
        } catch { return $false, "Delete failed: $($_.Exception.Message)" }
    }
    return $false, "Please select cloud type"
}

function Cloud-RenameBackup($oldPath, $newName) {
    $c = Get-CloudConfig
    $type = $c.type; $token = $c.token
    $repo  = ($c.repo).Trim().Trim("/")
    $branch = if ($c.branch) { $c.branch } else { "main" }
    if (-not $repo) { return $false, "Repo not configured" }
    if (-not $newName.EndsWith(".txt")) { $newName = $newName + ".txt" }
    $newPath = "backups/$newName"
    $encodedOld = Get-EncodedPath $oldPath
    $encodedNew = Get-EncodedPath $newPath

    if ($type -eq "github") {
        $headers = @{ Authorization = "Bearer $token"; Accept = "application/vnd.github+json" }
        try {
            $url = "https://api.github.com/repos/$repo/contents/$encodedOld`?ref=$([uri]::EscapeDataString($branch))"
            $r = Invoke-RestMethod -Uri $url -Headers $headers -TimeoutSec 15
            $content = $r.content
            $sha = $r.sha
            $createBody = @{ message = "rename to $newName"; content = $content; branch = $branch } | ConvertTo-Json -Compress
            $createUrl = "https://api.github.com/repos/$repo/contents/$encodedNew"
            Invoke-RestMethod -Uri $createUrl -Method PUT -Headers $headers -Body $createBody -ContentType "application/json" -TimeoutSec 15 | Out-Null
            $delBody = @{ message = "remove old $oldPath"; sha = $sha; branch = $branch } | ConvertTo-Json -Compress
            $delUrl = "https://api.github.com/repos/$repo/contents/$encodedOld"
            Invoke-RestMethod -Uri $delUrl -Method DELETE -Headers $headers -Body $delBody -ContentType "application/json" -TimeoutSec 15 | Out-Null
            return $true, $newName
        } catch { return $false, "Rename failed: $($_.Exception.Message)" }
    } elseif ($type -eq "gitee") {
        try {
            $url = "https://gitee.com/api/v5/repos/$repo/contents/$encodedOld`?ref=$([uri]::EscapeDataString($branch))&access_token=$([uri]::EscapeDataString($token))"
            $r = Invoke-RestMethod -Uri $url -TimeoutSec 15
            $content = $r.content
            $sha = $r.sha
            $createBody = @{ access_token = $token; content = $content; message = "rename to $newName"; branch = $branch } | ConvertTo-Json -Compress
            $createUrl = "https://gitee.com/api/v5/repos/$repo/contents/$encodedNew"
            Invoke-RestMethod -Uri $createUrl -Method POST -Body $createBody -ContentType "application/json" -TimeoutSec 15 | Out-Null
            $delBody = @{ access_token = $token; sha = $sha; message = "remove old $oldPath"; branch = $branch } | ConvertTo-Json -Compress
            $delUrl = "https://gitee.com/api/v5/repos/$repo/contents/$encodedOld"
            Invoke-RestMethod -Uri $delUrl -Method DELETE -Body $delBody -ContentType "application/json" -TimeoutSec 15 | Out-Null
            return $true, $newName
        } catch { return $false, "Rename failed: $($_.Exception.Message)" }
    }
    return $false, "Please select cloud type"
}

function Cloud-CleanupOldBackups {
    $cfg = Load-Config
    $maxBk = $cfg.maxBackups
    if (-not $maxBk -or $maxBk -lt 1) { $maxBk = 5 }
    $c = $cfg.cloud
    $type = $c.type; $token = $c.token
    $repo  = ($c.repo).Trim().Trim("/")
    $branch = if ($c.branch) { $c.branch } else { "main" }
    if (-not $repo) { return }
    $encodedPath = Get-EncodedPath "backups"

    if ($type -eq "github") {
        try {
            $url = "https://api.github.com/repos/$repo/contents/$encodedPath?ref=$([uri]::EscapeDataString($branch))"
            $r = Invoke-RestMethod -Uri $url -Headers @{ Authorization = "Bearer $token"; Accept = "application/vnd.github+json" } -TimeoutSec 15
            $files = @($r | Where-Object { $_.name -like "hosts_*.txt" } | Sort-Object name -Descending | Select-Object -Skip $maxBk)
            foreach ($f in $files) {
                $delUrl = "https://api.github.com/repos/$repo/contents/$($f.path)"
                $delBody = @{ message = "cleanup $($f.name)"; sha = $f.sha; branch = $branch } | ConvertTo-Json -Compress
                Invoke-RestMethod -Uri $delUrl -Method DELETE -Headers @{ Authorization = "Bearer $token"; Accept = "application/vnd.github+json" } -Body $delBody -ContentType "application/json" -TimeoutSec 15 | Out-Null
            }
        } catch { Write-Host "GH cleanup error: $_" }
    } elseif ($type -eq "gitee") {
        try {
            $url = "https://gitee.com/api/v5/repos/$repo/contents/$encodedPath`?ref=$([uri]::EscapeDataString($branch))&access_token=$([uri]::EscapeDataString($token))"
            $r = Invoke-RestMethod -Uri $url -TimeoutSec 15
            $files = @($r | Where-Object { $_.name -like "hosts_*.txt" } | Sort-Object name -Descending | Select-Object -Skip $maxBk)
            foreach ($f in $files) {
                $infoUrl = "https://gitee.com/api/v5/repos/$repo/contents/$(Get-EncodedPath $f.path)`?ref=$([uri]::EscapeDataString($branch))&access_token=$([uri]::EscapeDataString($token))"
                $info = Invoke-RestMethod -Uri $infoUrl -TimeoutSec 15
                $delUrl = "https://gitee.com/api/v5/repos/$repo/contents/$(Get-EncodedPath $f.path)"
                $delBody = @{ access_token = $token; sha = $info.sha; message = "cleanup $($f.name)"; branch = $branch } | ConvertTo-Json -Compress
                Invoke-RestMethod -Uri $delUrl -Method DELETE -Body $delBody -ContentType "application/json" -TimeoutSec 15 | Out-Null
            }
        } catch { Write-Host "Gitee cleanup error: $_" }
    }
}

# === HTTP server ===

function Read-RequestBody {
    $len = $request.ContentLength64
    if ($len -le 0) { return @{} }
    $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
    $body = $reader.ReadToEnd()
    try { return $body | ConvertFrom-Json } catch { return @{} }
}

function Parse-Query($rawUrl) {
    $q = @{}
    if ($rawUrl.Contains("?")) {
        $qs = $rawUrl.Split("?", 2)[1]
        foreach ($pair in $qs.Split("&")) {
            $kv = $pair.Split("=", 2)
            $q[$kv[0]] = [System.Uri]::UnescapeDataString($kv[1])
        }
    }
    return $q
}

function Start-Server {
    param($Port = 8686)
    $htmlFile = Join-Path $AppDir "index.html"
    $html = ""
    if (Test-Path $htmlFile) { $html = [System.IO.File]::ReadAllText($htmlFile, [System.Text.UTF8Encoding]::new($false)) }
    if (-not $html) { $html = "
# Hosts Manager

Missing index.html

" }

    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://127.0.0.1:$Port/")
    $listener.Start()

    Write-Host "========================================================"
    Write-Host "  Hosts Manager Started"
    Write-Host "  URL: [url=http://127.0.0.1:]http://127.0.0.1:[/url]$Port"
    Write-Host "  Press Ctrl+C to exit"
    Write-Host "========================================================"

    try {
        while ($listener.IsListening) {
            $ctx = $listener.GetContext()
            $script:request  = $ctx.Request
            $script:response = $ctx.Response
            $url = $ctx.Request.Url.AbsolutePath
            $method = $ctx.Request.HttpMethod
            try {
                if ($method -eq "GET") {
                    switch ($url) {
                        "/" { Send-Page $html }
                        "/index.html" { Send-Page $html }
                        "/api/config" {
                            $cfg = Load-Config
                            $maxBk = $cfg.maxBackups
                            if (-not $maxBk -or $maxBk -lt 1) { $maxBk = 5 }
                            $pub = @{ type = $cfg.cloud.type; repo = $cfg.cloud.repo; branch = $cfg.cloud.branch; path = $cfg.cloud.path; has_token = [bool]$cfg.cloud.token; maxBackups = $maxBk }
                            Send-Ok $pub ""
                        }
                        "/api/records" {
                            $records = Get-Records
                            if ($records -eq $null) { Send-Fail "No permission to read hosts, run as admin" }
                            else { Send-Ok $records "" }
                        }
                        "/api/backups" { Send-Ok (List-Backups) "" }
                        "/api/backup/content" {
                            $q = Parse-Query $ctx.Request.Url.AbsoluteUri
                            $content = Read-Backup $q.name
                            if ($content -eq $null) { Send-Fail "Backup not found" }
                            else { Send-Ok $content "" }
                        }
                        "/api/cloud/history" { Send-Ok (Cloud-ListHistory) "" }
                        "/api/cloud/content" {
                            $q = Parse-Query $ctx.Request.Url.AbsoluteUri
                            $result = Cloud-ReadBackup $q.path
                            if ($result[1]) { Send-Fail $result[1] }
                            else { Send-Ok $result[0] "" }
                        }
                        default { $ctx.Response.StatusCode = 404; $ctx.Response.Close() }
                    }
                } elseif ($method -eq "POST") {
                    $data = Read-RequestBody
                    switch ($url) {
                        "/api/records/save" {
                            try { Save-Records $data.records; Send-Ok $true "Saved" }
                            catch { Send-Fail "Save failed: $($_.Exception.Message)" }
                        }
                        "/api/open-hosts" {
                            try {
                                Start-Process "notepad.exe" -ArgumentList "`"$HostsFile`""
                                Send-Ok $true "Opening hosts file"
                            } catch { Send-Fail "Open failed: $($_.Exception.Message)" }
                        }
                        "/api/backup/create" {
                            $r = Backup-Current
                            if ($r) { Send-Ok $r "Backup created" } else { Send-Fail "Backup failed" }
                        }
                        "/api/backup/restore" {
                            try { Restore-Backup $data.name | Out-Null; Send-Ok $true "Restored" }
                            catch { Send-Fail "Restore failed: $($_.Exception.Message)" }
                        }
                        "/api/backup/delete" {
                            Delete-Backup $data.name | Out-Null
                            Send-Ok $true "Deleted"
                        }
                        "/api/backup/rename" {
                            $r = Rename-Backup $data.oldName $data.newName
                            if ($r[0]) { Send-Ok $r[1] "Renamed" } else { Send-Fail $r[1] }
                        }
                        "/api/config/save" {
                            $cfg = Load-Config
                            foreach ($k in @("type", "repo", "branch", "path")) {
                                if ($data.cloud.$k -ne $null) { $cfg.cloud.$k = ($data.cloud.$k + "").Trim() }
                            }
                            if ($data.cloud.token) { $cfg.cloud.token = ($data.cloud.token + "").Trim() }
                            if ($data.maxBackups -ne $null) {
                                $mb = [int]($data.maxBackups)
                                if ($mb -ge 1 -and $mb -le 100) { $cfg.maxBackups = $mb }
                            }
                            Save-Config $cfg
                            Send-Ok $true "Config saved"
                        }
                        "/api/cloud/test" {
                            $r = Test-Cloud
                            if ($r.ok) { Send-Ok $r.msg $r.msg } else { Send-Fail $r.msg }
                        }
                        "/api/cloud/push" {
                            $text = Read-HostsText
                            if ($text -eq $null) { Send-Fail "Cannot read hosts"; break }
                            $result = Cloud-UpdateFile $text "backup hosts $(Get-Timestamp)"
                            if ($result[0]) {
                                Cloud-CleanupOldBackups
                                Send-Ok $true $result[1]
                            } else { Send-Fail $result[1] }
                        }
                        "/api/cloud/pull" {
                            $result = Cloud-GetFile
                            if ($result[1]) { Send-Fail $result[1] } else { Send-Ok $result[0] "" }
                        }
                        "/api/cloud/restore" {
                            $filePath = $data.path
                            if ($filePath) { $result = Cloud-ReadBackup $filePath } else { $result = Cloud-GetFile }
                            if ($result[1]) { Send-Fail $result[1]; break }
                            try {
                                Backup-Current | Out-Null
                                Write-HostsText $result[0]
                                Send-Ok $true "Restored from cloud"
                            } catch { Send-Fail "Write failed: $($_.Exception.Message)" }
                        }
                        "/api/cloud/delete" {
                            $filePath = $data.path
                            if (-not $filePath) { Send-Fail "Path is required" }
                            else {
                                $result = Cloud-DeleteBackup $filePath
                                if ($result[0]) { Send-Ok $true $result[1] } else { Send-Fail $result[1] }
                            }
                        }
                        "/api/cloud/rename" {
                            $oldPath = $data.path
                            $newName = $data.newName
                            if (-not $oldPath -or -not $newName) { Send-Fail "Path and newName are required" }
                            else {
                                $result = Cloud-RenameBackup $oldPath $newName
                                if ($result[0]) { Send-Ok $result[1] "Renamed" } else { Send-Fail $result[1] }
                            }
                        }
                        default { $ctx.Response.StatusCode = 404; $ctx.Response.Close() }
                    }
                }
            } catch {
                try { Send-Fail $_.Exception.Message } catch { }
            }
        }
    } finally {
        $listener.Stop()
    }
}

Start-Server -Port 8686

---

[查看原文](https://www.52pojie.cn/thread-2124206-1-1.html)
