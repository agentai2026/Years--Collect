---
title: "DLL图片资源提取器"
published: 2026-11-16
description: "\\\"\\\"\\\" DLL 图片资源提取器 (DLL Image Resource Extractor) ================================================== 功能: * 批量提取 .NET DLL / .g.resources 文件中内嵌的图片资源 (PNG / CUR / "
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "ldkj2022"
sourceLink: "https://www.52pojie.cn/thread-2138091-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2138091-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

"""

DLL 图片资源提取器 (DLL Image Resource Extractor)

==================================================

功能:

  * 批量提取 .NET DLL / .g.resources 文件中内嵌的图片资源 (PNG / CUR / ICO / BMP / GIF / JPG)

  * 图形界面: 选择多个文件 -> 一键提取 -> 树形浏览 + 缩略图网格 + 大图预览

  * 结果导出到磁盘, 可按原资源名保留目录结构

实现说明:

  * PE / CLR 资源段解析: 纯 Python (struct), 无第三方依赖

  * .resources 二进制流解析: 调用 Windows 内置 PowerShell 的 System.Resources.ResourceReader

  * 缩略图: Pillow (若不可用则退回文件图标/占位)

依赖:

  * Python 3.8+ (带 tkinter)

  * Pillow (可选, 用于缩略图; 未安装亦不影响提取)

  * Windows PowerShell 5.1+ (系统自带)

"""

[Python] *纯文本查看* *复制代码*
def iter_resource_blobs(blob):
    """Yield (kind, bytes) from CLR resource section.

    Some assemblies store blobs tightly packed (no alignment), others pad each
    blob to an 8-byte boundary. Pick whichever walk consumes the whole section.
    """
    tight, pos_t = _walk_blobs(blob, align=False)
    aligned, pos_a = _walk_blobs(blob, align=True)
    n = len(blob)
    # score = bytes consumed; prefer the walk that reaches the end cleanly
    score_t = pos_t / n if n else 0
    score_a = pos_a / n if n else 0
    # tie-break: prefer more parsed blobs when both fully consume
    chosen = tight if score_t >= score_a else aligned
    if score_t == score_a and len(aligned) > len(tight):
        chosen = aligned
    for payload in chosen:
        yield classify_bytes(payload), payload

---

[查看原文](https://www.52pojie.cn/thread-2138091-1-1.html)
