---
title: "微软详解 Windows ML API重大更新 支持TensorFlow与PyTorch模型直接调用"
published: 2026-10-08
description: "微软在近期开发者活动中详细展示了 Windows ML 框架的重大功能升级。新一代 API 引入了对 TensorFlow 与 PyTorch 模型的直接加载能力，大幅降低了本地"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/microsoft-windows-ml-api-major-updates.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/microsoft-windows-ml-api-major-updates.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

微软在近期开发者活动中详细展示了 Windows ML 框架的重大功能升级。新一代 API 引入了对 TensorFlow 与 PyTorch 模型的直接加载能力，大幅降低了本地 AI 应用的开发门槛。

![](https://storage.windiscover.com/files/windows-ml-cover.png)

### **支持的模型框架范围**

新版 Windows ML API 原生支持 ONNX Runtime **1.18+** 及 TensorFlow Lite **2.14+** 格式模型。开发者可直接在 UWP、WinUI 3 及 Win32 应用内部署 Python 训练的智能模型，无需中间转换步骤。

### **性能优化细节**

微软宣布针对 Windows 11 设备进行了底层优化，GPU 加速引擎在 DXC 后端下推理速度提升约 **30%**。同时新增了量化感知训练接口，允许开发者在保持精度的前提下将模型体积压缩至原规模的 **75%**。

### **开发者工具链改进**

配套的 Visual Studio 插件现已集成模型测试面板，支持实时查看推理延迟与内存占用指标。SDK 版本更新至 **1.7.0** 后，新增了对 C++/WinRT 与 Rust 语言的原生绑定。

via [Neowin](https://www.neowin.net/news/microsoft-highlights-major-advancements-in-windows-ml/?utm_source=rss)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/microsoft-windows-ml-api-major-updates.html) | [添加评论](https://windiscover.com/posts/microsoft-windows-ml-api-major-updates.html#comments)

[微软详解 Windows ML API重大更新 支持TensorFlow与PyTorch模型直接调用](https://windiscover.com/posts/microsoft-windows-ml-api-major-updates.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/microsoft-windows-ml-api-major-updates.html)
