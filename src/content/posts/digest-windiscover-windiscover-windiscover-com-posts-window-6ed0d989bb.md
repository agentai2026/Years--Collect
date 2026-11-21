---
title: "Windows USB4 新功能可连接多台 PC 提升 AI 计算性能"
published: 2026-11-20
description: "微软宣布在 Windows 11 中引入 RDMA over USB4 开发者预览功能，支持将多台具备 USB4 能力的 Windows PC 串联起来，联合共享内存和 GPU 算"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/windows-usb4-multi-pc-rdma-feature.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/windows-usb4-multi-pc-rdma-feature.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

微软宣布在 Windows 11 中引入 RDMA over USB4 开发者预览功能，支持将多台具备 USB4 能力的 Windows PC 串联起来，联合共享内存和 GPU 算力，用于运行单台设备无法承载的大型本地 AI 模型。该功能仅需 USB4 线缆即可实现互联。

![](https://cdn.neowin.com/news/images/uploaded/2025/03/1740824043_usb-c_cable_full.jpg)

### **RDMA 技术原理与优势**

RDMA（Remote Direct Memory Access，远程直接内存访问）允许 Windows PC 绕过 CPU 直接访问其他设备的内存资源，从而消除传统网络通信中的瓶颈。该技术已在 DirectStorage 等存储技术中得到应用，同时因仅需 USB4 线缆替代昂贵的网络设备，大幅降低了部署成本。

![](https://cdn.neowin.com/news/images/uploaded/2026/11/1795159168_cpu_bottleneck_on_tcp_latency_sigcomm_pdf.webp)

### **性能表现数据**

微软实测数据显示，在两机互联场景下，RDMA over USB4 对小型消息的往返延迟降至 **28–50 微秒**，约为同等条件下以太网连接的 **四分之一**。在 **40Gbps** 和 **80Gbps** 两种带宽配置下均保持低延迟水平。

AMD 测试三台搭载 Ryzen AI Max 处理器的小型 PC 集群，每台配备 Radeon 8060S 显卡与 **128GB** 统一内存。通过 **40Gbps** USB4 链路互联后，成功运行参数量达 **235B** 的 Qwen3-235B-A22B AI 模型，生成速度约 **18.5 tokens/秒**。

Intel 测试三至四台搭载 Core Ultra Series 3 处理器的 PC，每台内存 **64GB**。三机配置处理 GPT-OSS-120B 模型时速度约为 **49 tokens/秒**，增加第四台后提升至 **54 tokens/秒**。

![](https://cdn.neowin.com/news/images/uploaded/2026/11/1795160140_usb4_rdma_microsoft_1.webp)

### **部署建议与限制**

微软建议使用全网状（full-mesh）拓扑结构连接各设备，而非级联方式，后者会显著影响整体性能。该功能将通过 Windows Insider 实验通道（Future Platforms）以开发者预览版形式提供，默认关闭，需通过注册表开启并临时关闭安全启动。

![](https://cdn.neowin.com/news/images/uploaded/2026/11/1795160162_usb4_rdma_microsoft_2.webp)

### **未来生态扩展**

微软正与 AMD、Intel 及开源社区合作推动技术普及，并探索 Windows ML 与 DirectX Compute Graph Compiler 如何进一步提升原生多 PC AI 执行能力。

![](https://cdn.neowin.com/news/images/uploaded/2026/11/1795159191_windows_usb4_rdma_demo_1_story.webp)

### **适用场景与应用前景**

该功能主要针对专业 AI 开发者与高性能计算用户，使得多 PC 协同推理成为可能，解决单设备内存与算力不足的问题。结合已支持的 Unified Memory 管理方案，为本地 AI 工作负载提供了更具性价比的解决方案。

![](https://cdn.neowin.com/news/images/uploaded/2026/11/1795159185_windows_usb4_rdma_demo_3_story.webp)

via [Neowin](https://www.neowin.net/news/microsoft-shows-massive-gains-with-new-windows-usb4-feature-that-combines-multiple-pcs/)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/windows-usb4-multi-pc-rdma-feature.html) | [添加评论](https://windiscover.com/posts/windows-usb4-multi-pc-rdma-feature.html#comments)

[Windows USB4 新功能可连接多台 PC 提升 AI 计算性能](https://windiscover.com/posts/windows-usb4-multi-pc-rdma-feature.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/windows-usb4-multi-pc-rdma-feature.html)
