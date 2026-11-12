---
title: "Visual Studio Community 2026 LTSC 离线安装包的制作、安装、踩坑"
published: 2026-11-12
description: "Visual Studio Community 2026 LTSC 于 2026.11.11 如期发布： https://learn.microsoft.com/en-us/visualstudio/releases/2026/release-history 原来制作的 Visual Studio Community "
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "PythonPan"
sourceLink: "https://www.52pojie.cn/thread-2136953-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2136953-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

Visual Studio Community 2026 LTSC 于 2026.11.11 如期发布：

https://learn.microsoft.com/en-us/visualstudio/releases/2026/release-history

原来制作的 Visual Studio Community 2022 LTSC 全流程脚本其实还能用，只是部分需要手动补充的组件变了，第一次制作配套文件需要重新下载。

授人以鱼不如授人以渔，之前分享过必要的文件，但没介绍过用法、关键步骤，于是，本次趁着双十一新会员大量涌入之际，开帖介绍一下。

**01 下载安装器**

制作离线安装包的基础是官方安装器，在 [https://learn.microsoft.com/en-u ... 026/release-history](https://learn.microsoft.com/en-us/visualstudio/releases/2026/release-history) 中下载 LTSC 18.11 的企业版（Enterprise）。没错，虽然制作的是社区版，但官方未提供下载器，需要借助企业版的下载器实现。

**02 创建社区版布局配置**

在非C盘根目录，创建一个文件名为纯英文、无空格、其他字符仅为下划线的文件夹，名字不要太长，建议为 vs_community_ltsc 。将上一步的下载器放入其中，然后创建 Layout.json 文件，内容为：

[JavaScript] *纯文本查看* *复制代码*
{"installChannelUri":".\\ChannelManifest.json","channelUri":"https://aka.ms/vs/18/release.ltsc.18.11/channel","installCatalogUri":".\\Catalog.json","channelId":"VisualStudio.18.Release.LTSC.18.11","productId":"Microsoft.VisualStudio.Product.Community","addProductLang":["zh-CN"],"useLatestInstaller":true,"arch":"x64"}

**03 创建布局**

有了前两步的基础，就可以直接运行命令创建布局了。

命令行为：vs_Enterprise.exe --layout ./ --lang zh-CN --useLatestInstaller

注意，该命令行创建的是所有负载的中文版离线布局，如果不需要那么多负载或者需要其他语言，可以参考官网文档修改，后续相关命令同理，笔者不再提示。

**04 修复布局（自动）**

因为是借助企业版创建社区版的离线布局，实际的布局文件并不完整，需要修复缺失的文件，第一步就是通过命令自动修复：

vs_Enterprise.exe --layout ./ --lang zh-CN --fix --useLatestInstaller

**05 修复布局（手动）**

不过，即使自动修复完毕，离线安装的时候还是会报缺失组件 Microsoft.VisualStudio.Branding.Community,version={版本号},language=zh-CN,productarch=x64，这时需要在文件夹中的  Catalog.json 中寻找该组件的下载地址。

先创建 Microsoft.VisualStudio.Branding.Community,version={版本号},language=zh-CN,productarch=x64 文件夹，版本号按照实际提示替换，比如 Community 2026 LTSC提示的是 Microsoft.VisualStudio.Branding.Community,version=18.11.12306.390,language=zh-CN,productarch=x64 。

搜索下载地址可以用 "id":"Microsoft.VisualStudio.Branding.Community","version":"{版本号}","type":"Vsix","language":"zh-CN","productArch":"x64" 作为关键字，其中版本号按照实际提示替换，本次使用的是 "id":"Microsoft.VisualStudio.Branding.Community","version":"18.11.12306.390","type":"Vsix","language":"zh-CN","productArch":"x64" 。该关键字之后最近的 **"url":** 挨着的就是下载地址，复制到浏览器访问，即可得到 payload.vsix 文件，将其复制到本部分创建的 Microsoft.VisualStudio.Branding.Community,version=18.11.12306.390,language=zh-CN,productarch=x64 文件夹，然后将整个文件夹复制到 第02步创建的文件夹中。

**06 离线安装**

有网的话，可以直接运行 setup.exe。离线安装适用于没有外网的情况，仅能通过以下命令启动：

vs_setup.exe --noWeb

**07 更新、清理旧版本组件**

有了前面的基础，后续每次升级不用重新制作离线安装包，只需执行 01、03、04 三步，即可完成离线安装包的更新。不过，每次更新之后，旧版本的组件不会自动删除，手动删除的话太麻烦。于是，笔者借助Powershell的力量，写了个自动清除旧版本组件的脚本：

[PowerShell] *纯文本查看* *复制代码*
$file = Get-ChildItem -Path ".\Archive\" -Recurse -Filter "Catalog.json"
$files = ($file.FullName -join " ")
.\vs_setup.exe --layout .\ --lang zh-CN --clean $files

将脚本保存为文件（文件名.ps1），右键该文件，选择 使用Powershell运行。

如果系统默认配置不允许执行脚本，可以在Powershell中运行以下命令：

powershell Set-ExecutionPolicy RemoteSigned -Scope Unrestricted

**08 后记**

原本笔者考虑将离线包上传网盘，但无奈体积太大，百度网盘下载也慢，不如让需要的人自己创建，从微软服务器下载速度还比较快。

后面还想着将所有制作好的脚本打包，然后上传网盘或者附件，但考虑到版本更新之后可能方法失效且作为附件也太大，相关命令、脚本也比较简单，最终决定将方法完整写成文章，方便其他人使用。

---

[查看原文](https://www.52pojie.cn/thread-2136953-1-1.html)
