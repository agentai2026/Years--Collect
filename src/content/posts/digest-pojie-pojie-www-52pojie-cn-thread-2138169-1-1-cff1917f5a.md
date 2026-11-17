---
title: "Windows端VS Code + WSLC + Windows ADB 容器化安卓开发环境搭建教程"
published: 2026-11-17
description: "wslc是微软WSL容器（WSL Containers）功能的Linux容器命令行工具。该工具语法与Docker高度相似，用于在Windows系统上开箱即用地构建、运行和部署Linux容器，无需额外安装Docker引擎。整体思路是： [*]Windows 端：提供 VS Code、WSLC、ADB 和代理网络； [*]"
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "diyag411"
sourceLink: "https://www.52pojie.cn/thread-2138169-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2138169-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

wslc是微软WSL容器（WSL Containers）功能的Linux容器命令行工具。该工具语法与Docker高度相似，用于在Windows系统上开箱即用地构建、运行和部署Linux容器，无需额外安装Docker引擎。整体思路是：

Windows 端：提供 VS Code、WSLC、ADB 和代理网络；WSLC 容器端：负责 Android SDK、JDK、Gradle 编译；Windows ADB 端：负责连接手机/TV 设备、安装 APK、logcat 调试。 2, 4, 11

适合场景：

快速创建出不同版本开发环境，互补干扰；AI编程使用容器化部署隔离真机环境避免风险； 环境可快速迁移；

**一、环境准备**

**1. 系统要求**

Windows 10 2004 以上，或 Windows 11，专业版windows；已开启硬件虚拟化；WSL 2 已安装； WSL 版本建议 ≥ 2.9.3。

管理员 PowerShell 中执行：

[Asm] *纯文本查看* *复制代码*
wsl --update
wsl --shutdown
wsl --version
wslc version

如果 wslc version 能输出版本号，说明 WSLC 可用。

**2. 安装 VS Code 与扩展**

安装：

Visual Studio Code；Dev Containers 扩展。

在 VS Code 设置中搜索：

Dev Containers: Docker Path

将其设置为：

wslc

这样 Dev Containers 会使用 WSLC 作为容器后端，而不是 Docker Desktop。

**二、项目目录结构**

假设项目位于：

D:\youerproject\youerapp

创建如下结构：
youerapp/

├── .devcontainer/

│   ├── devcontainer.json

│   └── Dockerfile

├── setup-wslc-android.ps1

└── 你的 Android 项目文件

**三、编写 Dockerfile**

.devcontainer/Dockerfile 示例：

[Asm] *纯文本查看* *复制代码*

FROM docker.1ms.run/ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN sed -i 's@//archive.ubuntu.com@//mirrors.aliyun.com@g; s@//security.ubuntu.com@//mirrors.aliyun.com@g' /etc/apt/sources.list.d/ubuntu.sources

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      openjdk-11-jdk \
      openjdk-17-jdk \
      curl \
      unzip \
      git \
      zip \
      && rm -rf /var/lib/apt/lists/*

ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV ANDROID_HOME=/opt/android-sdk
ENV CMDLINE_TOOLS_ROOT=$ANDROID_HOME/cmdline-tools
ENV PATH=$JAVA_HOME/bin:$CMDLINE_TOOLS_ROOT/latest/bin:$ANDROID_HOME/platform-tools:$PATH

RUN mkdir -p $CMDLINE_TOOLS_ROOT && \
    curl -fsSL https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip \
      -o cmdline-tools.zip && \
    unzip -q cmdline-tools.zip -d $CMDLINE_TOOLS_ROOT && \
    mv $CMDLINE_TOOLS_ROOT/cmdline-tools $CMDLINE_TOOLS_ROOT/latest && \
    rm cmdline-tools.zip

RUN yes | sdkmanager --licenses && \
    sdkmanager \
      "platform-tools" \
      "build-tools;34.0.0" \
      "platforms;android-34"

ENV JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
ENV PATH=$JAVA_HOME/bin:$CMDLINE_TOOLS_ROOT/latest/bin:$ANDROID_HOME/platform-tools:$PATH

WORKDIR /workspace

关键点：

sdkmanager 新版需要 Java 17，所以安装 SDK 期间使用 JDK 17；安装完成后再把默认 JDK 切回 11，避免部分项目不兼容 JDK 17；如果项目本身要求 JDK 17，可以保留 JAVA_HOME 为 JDK 17。

**四、编写 devcontainer.json**

.devcontainer/devcontainer.json 示例：

[Asm] *纯文本查看* *复制代码*
{
  "name": "Android Build",
  "build": {
    "dockerfile": "Dockerfile",
    "context": ".."
  },
  "mounts": [
    "source=${localWorkspaceFolder},target=/workspace,type=bind"
  ],
  "workspaceFolder": "/workspace",
  "remoteUser": "root",
  "customizations": {
    "vscode": {
      "extensions": [],
      "settings": {
        "terminal.integrated.defaultProfile.linux": "bash"
      }
    }
  }
}

**五、初始化构建脚本**

setup-wslc-android.ps1 示例：

[Asm] *纯文本查看* *复制代码*
$ErrorActionPreference = "Stop"

$ImageName     = "android-build-jdk11"
$ContainerName = "android-build"
$ProjectPath   = "D:\youerproject\youerapp"
$DockerfilePath = Join-Path $ProjectPath ".devcontainer\Dockerfile"

Write-Host "=== 检查 wslc ===" -ForegroundColor Cyan
wslc version

Write-Host "=== 检查项目目录 ===" -ForegroundColor Cyan

if (-not (Test-Path $ProjectPath)) {
    Write-Host "项目目录不存在: $ProjectPath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $DockerfilePath)) {
    Write-Host "Dockerfile 不存在: $DockerfilePath" -ForegroundColor Red
    exit 1
}

Write-Host "=== 构建镜像 ===" -ForegroundColor Cyan

wslc build -t "$ImageName" -f "$DockerfilePath" "$ProjectPath"

if ($LASTEXITCODE -ne 0) {
    Write-Host "镜像构建失败。" -ForegroundColor Red
    exit 1
}

Write-Host "=== 清理旧容器 ===" -ForegroundColor Cyan

$old = wslc ps -a --format json 2>$null | ConvertFrom-Json |
       Where-Object { $_.Names -eq $ContainerName }

if ($old) {
    Write-Host "停止旧容器: $ContainerName" -ForegroundColor Yellow
    wslc stop $ContainerName
    wslc rm $ContainerName
}

Write-Host "=== 启动容器 ===" -ForegroundColor Cyan

wslc run -d `
    --name $ContainerName `
    --restart unless-stopped `
    -v "${ProjectPath}:/workspace" `
    -e JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64 `
    -e ANDROID_HOME=/opt/android-sdk `
    -w /workspace `
    $ImageName `
    tail -f /dev/null

if ($LASTEXITCODE -ne 0) {
    Write-Host "容器启动失败。" -ForegroundColor Red
    exit 1
}

$ApkPath = Join-Path $ProjectPath "app\build\outputs\apk\debug\app-debug.apk"
Write-Host "容器已启动: $ContainerName" -ForegroundColor Green
Write-Host "APK 位置: $ApkPath" -ForegroundColor Green
Write-Host "安装命令: adb install ""$ApkPath""" -ForegroundColor Green
Write-Host "VS Code: Dev Containers - Attach to Running Container, 选择 $ContainerName" -ForegroundColor Green

脚本文件建议保存为 UTF-8 with BOM，避免 PowerShell 5.1 解析中文时出现引号错误。

运行方式：

cd D:\Work\Codes\tvapp

.\setup-wslc-android.ps1

**六、在 VS Code 中连接容器**

脚本运行成功后，在 VS Code 中：

按 Ctrl+Shift+P；执行：[Asm] *纯文本查看* *复制代码*
Dev Containers: Attach to Running Container
选择 android-build；进入容器后，打开 /workspace；在容器终端中执行

    [Asm] *纯文本查看* *复制代码*
cd /workspace./gradlew assembleDebug

构建产物会出现在：
D:\youerproject\youerapp\app\build\outputs\apk\debug\app-debug.apk

**七、Windows 端 ADB 调试**

容器只负责编译，ADB 建议继续由 Windows 端处理，这样最稳定。

1. 确认 ADB 可用

Windows PowerShell 中执行：

[Asm] *纯文本查看* *复制代码*
adb version
adb devices

如果提示找不到 adb，需要把 Android SDK 的 platform-tools 加入 Windows PATH，例如：
C:\Users\\AppData\Local\Android\Sdk\platform-tools

具体请修改为 platform-tools的解压路径

2. 连接设备

USB 连接时：

[Asm] *纯文本查看* *复制代码*
adb devices

无线调试时：

[Asm] *纯文本查看* *复制代码*
adb tcpip 5555
adb connect :5555
adb devices

3. 安装 APK

[Asm] *纯文本查看* *复制代码*
adb install D:\youerproject\youerapp\app\build\outputs\apk\debug\app-debug.apk

重新安装：

[Asm] *纯文本查看* *复制代码*
adb install -r D:\youerproject\youerapp\app\build\outputs\apk\debug\app-debug.apk

4. 查询包名

[Asm] *纯文本查看* *复制代码*
adb shell pm list packages -3
adb shell pm list packages | findstr
adb shell dumpsys window | findstr mCurrentFocus

5. 查看日志

[Asm] *纯文本查看* *复制代码*
adb logcat -c
adb logcat *:E
adb logcat YourTag:D *:S
adb logcat --pid=(adb shell pidof com.your.package)

Windows PowerShell 中用 findstr 替代 grep：

adb logcat | findstr "Exception"

**八、推荐工作流**

1.Windows 端：开代理、连设备、装 APK、看 logcat；

2.WSLC 容器端：装 JDK、Android SDK、跑 Gradle 构建；

3.VS Code 端：通过 Dev Containers 附加到 android-build 容器，编辑代码、执行构建；

4.调试端：始终用 Windows ADB，避免容器内外 ADB 冲突。

这套方案适合手机、平板、TV应用或任何需要容器化编译、但希望保持 Windows ADB 调试链路的场景。

---

[查看原文](https://www.52pojie.cn/thread-2138169-1-1.html)
