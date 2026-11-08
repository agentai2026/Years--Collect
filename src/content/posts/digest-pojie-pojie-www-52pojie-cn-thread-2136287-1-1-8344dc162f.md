---
title: "PDF去水印工具"
published: 2026-11-07
description: "PDF 去水印工具 (GUI) 原理：不做\\\"涂白遮盖\\\"，而是把 PDF 页面内容流 (content stream) 词法解析成 token 序列，定位 BT..ET 文本块、q..Q 绘图块、BDC..EMC 标记块， 按规则标记整块删除后重建内容流 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "ldkj2022"
sourceLink: "https://www.52pojie.cn/thread-2136287-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2136287-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

PDF 去水印工具 (GUI)

原理：不做"涂白遮盖"，而是把 PDF 页面内容流 (content stream) 词法解析成

      token 序列，定位 BT..ET 文本块、q..Q 绘图块、BDC..EMC 标记块，

      按规则标记整块删除后重建内容流，再用 PyMuPDF 重写 PDF。

      因此正文、矢量图形、书签、链接等对象均保持原样，不会被栅格化。

依赖：Python 3.8+、tkinter（标准库）、PyMuPDF（pip install pymupdf）

# ---------------------------------------------------------------------------

# 二、资源字典分析（透明度 / 图片 / Form / OCG 图层）

# ---------------------------------------------------------------------------

[Python] *纯文本查看* *复制代码*
def xref_key(doc, xref, key, depth=0):
    """取字典键；Resources 可能继承自父节点，向上回溯。"""
    try:
        typ, val = doc.xref_get_key(xref, key)
        if typ != "null" or depth > 4:
            return typ, val
        _, parent = doc.xref_get_key(xref, "Parent")
        m = re.search(r"(\d+)\s+0\s+R", parent or "")
        if m:
            return xref_key(doc, int(m.group(1)), key, depth + 1)
    except Exception:
        pass
    return "null", ""

---

[查看原文](https://www.52pojie.cn/thread-2136287-1-1.html)
