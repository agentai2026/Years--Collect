---
title: "安全研究员发现微软 Paint 和 Photos 在 AI 图片中嵌入隐形水印"
published: 2026-08-26
description: "安全研究员 Xusheng Li 通过逆向工程发现，微软 Paint 和 Photos 应用在生成 AI 图片时会嵌入一种不可见的标识符。该标识符以 GUID（全局唯一标识符）形式"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/microsoft-paint-photos-hidden-watermark-ai.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/microsoft-paint-photos-hidden-watermark-ai.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

安全研究员 Xusheng Li 通过逆向工程发现，微软 Paint 和 Photos 应用在生成 AI 图片时会嵌入一种不可见的标识符。该标识符以 **GUID**（全局唯一标识符）形式存在，是一种 128 位、占用 16 字节的数值，旨在唯一标识特定对象，且不会在图片上显示。

![](https://cdn.neowin.com/news/images/uploaded/2026/08/1787691174_copilot_in_paint_story.webp)

### **本地生成仍需服务器交互**

研究发现，即便用户选择本地生成 AI 图片，Paint 仍会向微软服务器发送请求。服务器会返回经过修订的提示词（prompt）以及一个独立的水印标识符，随后 Paint 将该标识符嵌入本地生成的图片中。

![](https://cdn.neowin.com/news/images/uploaded/2026/08/1787690736_watermarkid_story.webp)

### **Watermarker.dll 组件机制**

Li 在分析 Paint 的 AI 功能时发现名为 Watermarker.dll 的组件。Paint 本身提供可见水印选项（可在生成图片上添加 Copilot 标志），但研究员发现另一项独立的水印功能，其运作不依赖于可见水印设置。微软还会为 AI 生成图片添加 C2PA 内容凭证，Li 发现相同的 watermarkId 也会以软绑定值的形式出现在 C2PA 元数据中，将像素层面的隐形水印与图片来源元数据关联。

### **Paint 与 Photos 的处理差异**

研究还发现 Photos 应用包含相同的 Watermarker.dll 组件，其本地 Image Creator 和 Restyle Image 功能同样会在生成图片中嵌入 GUID。但两款应用存在关键差异：Paint 在无法添加隐形水印时会终止整个生成流程，而 Photos 即使水印添加失败仍会返回图片。

### **法规合规与披露争议**

微软官方文档披露 Paint 和 Photos 使用 AI 安全系统，包括提示词审核和 C2PA 内容凭证，并说明即使用于本地模型的提示词也可能发送至微软服务器进行审核。这些措施符合欧盟 AI 法案第 50 条要求，该条款规定 AI 提供商须在其模型生成的内容中包含机器可读水印。然而微软并未明确披露提示词会接收服务器颁发的 GUID。Li 认为这一细节至关重要——若微软将这些标识符与用户账户或其他识别信息关联，该水印理论上可用于追溯图片生成者身份。

### **与 GDID 事件的相似性**

该案例与近期曝光的 GDID 事件存在诸多相似之处。此前公众发现微软为每套 Windows 安装分配唯一标识符，尽管这并非新技术，但微软此前对此披露甚少。截至目前，微软尚未正式回应该研究员的 claims。

via [Neowin](https://www.neowin.net/news/microsoft-hides-watermarks-in-ai-images-made-with-paint-and-photos-researcher-claims/)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/microsoft-paint-photos-hidden-watermark-ai.html) | [添加评论](https://windiscover.com/posts/microsoft-paint-photos-hidden-watermark-ai.html#comments)

[安全研究员发现微软 Paint 和 Photos 在 AI 图片中嵌入隐形水印](https://windiscover.com/posts/microsoft-paint-photos-hidden-watermark-ai.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/microsoft-paint-photos-hidden-watermark-ai.html)
