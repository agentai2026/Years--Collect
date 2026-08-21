---
title: "markdown 编辑器(tauri) - 小工具"
published: 2026-08-20
description: "一款 轻量级 本地 Markdown 编辑器 初心: vs code 日常用，但太重 (加载一堆，打开很慢)， 遂希望，仅是打开和编辑 md 文档，能快点，方便点 # 本软件特色 (主体参考 vs code 的观感) - markdown ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "pyjiujiu"
sourceLink: "https://www.52pojie.cn/thread-2123918-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2123918-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

一款  轻量级 本地 Markdown 编辑器

初心:

vs code  日常用，但太重 (加载一堆，打开很慢)，

遂希望，仅是打开和编辑 md 文档，能快点，方便点

# 本软件特色

(主体参考 vs code 的观感)

- markdown 实时预览（还有点小 bug，不影响使用）

- 支持 html 导出（带图片(需要先点下载)，带代码高亮）

- 允许 从网页直接复制 → 粘贴，会自己转 markdown （适合 需要离线保存网页正文 →  单个网页文件 的场景）

- 支持 pdf 导出(用外部 python reportlab，或 浏览器 打印到pdf)

目前问题

- 还不支持 latex (个人用不到，vs code 后备)

- 格式仅支持 gfm （github用)

---

AI 背景:

- deepseek-pro-0813 + DSH， 涨价前 把软件框架打出来

用的网上传的 锚定到 极简模式+ std 的工具链 (系统提示词简单一句 `You are a helpful software engineer assistant.`  本身带的 linux 的bash 要换 win 的pwsh)

用下来 总体感觉，指令会遗忘一部分，但执行的部分 很丰富(比如会自己 做软件图标，自己打包软件带bundle)

开发一轮后，才意识到 项目体量不小(rust 代码 1300+行(去掉空行)，ts 3600+行)，能一口气 做一个原型 很厉害

- deepseek-flash-0731, 后续迭代(用 opencode，一直用的很顺手)

 主要问题是，迭代会写入 旧的tauri 版本代码，导致很难 debug(部分原因是，pro时没做好，前后端没有桥接(@tauri-apps/cli 和 api 这种))

---

软件截图:

(下载图片的测试界面)

*

![](https://static.52pojie.cn/static/image/common/none.gif)

**下载图片_测试.jpg** (91.77 KB, 下载次数: 0)

[下载附件](forum.php?mod=attachment&aid=Mjg3MzQ2MnwzMDlmZmY2MnwxNzg3MjcwNTQzfDB8MjEyMzkxOA%3D%3D&nothumb=yes)

2026-8-20 11:12 上传

使用

- 左上角 下拉框，或鼠标滚轮，切换模式(markdown / Image（下载） / Export )

- tauri 系列软件，都会在类似 %LOCALAPPDATA%\com.mdeditor.app\ 生成缓存和数据目录，清理C盘时 可以完全删除

- 导出pdf 选择 python，需要 电脑已经安装 python + reportlab + pillow

---

项目 维护在 github:       github.com/fun-tailor/tool_md_editor

打包的 exe(只有 9.6M)，github.com/fun-tailor/tool_md_editor/releases/download/latest/md-editor_260820.exe

---

源代码

(摘录后端  python 部分 ‘src-tauri\app\python\pdf_gen,py’)

[Python] 纯文本查看 复制代码

#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
md_editor PDF generator.

APP_SCRIPT_VERSION: 3
(md_editor only re-seeds this file when the embedded version marker differs,
so local edits survive app updates.)

Converts a Markdown document to PDF with reportlab. The app hands over:
  python pdf_gen.py   [--base ] [--images ] [--no-images]

  --base       directory used to resolve relative image paths (usually the
               folder of the source document)
  --images     directory with copies of every embedded image (the app writes
               them there with their original extensions, including decoded
               data: URLs and downloaded remote images)
  --no-images  keep image links as plain text instead of embedding them

Images are converted to JPEG via Pillow before embedding (PDF only supports
.jpg/.png natively). H1/H2 headings become PDF outline entries.

Requirements: pip install reportlab pillow
The script is standalone by design: edit it freely (it lives next to the
app data, and the app never overwrites a newer version).
"""

import os
import re
import sys
import tempfile

try:
    from reportlab.lib import colors
    from reportlab.lib.enums import TA_LEFT
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
    from reportlab.lib.units import mm
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    from reportlab.platypus import (
        Flowable,
        HRFlowable,
        Image,
        ListFlowable,
        ListItem,
        Paragraph,
        Preformatted,
        SimpleDocTemplate,
        Spacer,
        Table,
        TableStyle,
    )
except ImportError as exc:
    sys.stderr.write("pdf_gen: missing dependency: %s (pip install reportlab pillow)\n" % exc)
    sys.exit(3)

# ---------------------------------------------------------------- fonts ----

FONT_DIRS = [
    os.path.join(os.environ.get("WINDIR", r"C:\Windows"), "Fonts"),
    "/usr/share/fonts/truetype/",
    "/usr/share/fonts/opentype/",
]

CJK_FONT_CANDIDATES = [
    ("SimSun", "simsun.ttc"),   # 宋体 (Windows)
    ("SimSun", "simsun.ttf"),
    ("SimHei", "simhei.ttf"),   # 黑体 (Windows)
    ("Microsoft YaHei", "msyh.ttc"),
    ("Noto Sans CJK SC", "NotoSansCJK-Regular.ttc"),
    ("Noto Sans CJK SC", "NotoSansCJKsc-Regular.otf"),
]

# Updated by register_cjk_fonts(): when a CJK font is available it replaces
# the ASCII-only built-ins so Chinese text is never dropped.
BODY_FONT = "Helvetica"
HEAD_FONT = "Helvetica-Bold"
CODE_FONT = "Courier"

def _find_font(name):
    for d in FONT_DIRS:
        path = os.path.join(d, name)
        if os.path.exists(path):
            return path
    return None

def register_cjk_fonts():
    """Register a CJK font; updates the global font names when one works."""
    global BODY_FONT, HEAD_FONT, CODE_FONT
    for font_name, file_name in CJK_FONT_CANDIDATES:
        path = _find_font(file_name)
        if not path:
            continue
        try:
            subfont = 0
            while True:
                try:
                    pdfmetrics.registerFont(TTFont(font_name, path, subfontIndex=subfont))
                    break
                except Exception:
                    subfont += 1
                    if subfont > 8:
                        raise
        except Exception:
            continue
        if BODY_FONT == "Helvetica" or font_name in ("SimSun", "Microsoft YaHei"):
            BODY_FONT = font_name
        if HEAD_FONT == "Helvetica-Bold":
            HEAD_FONT = font_name
        if CODE_FONT == "Courier":
            CODE_FONT = font_name
        return True
    return False

def build_styles():
    styles = getSampleStyleSheet()
    base = dict(
        fontName=BODY_FONT,
        fontSize=10.5,
        leading=15,
        textColor=colors.black,
        alignment=TA_LEFT,
        spaceAfter=6,
        wordWrap="CJK",
    )
    body = ParagraphStyle("md-body", **base)
    h1 = ParagraphStyle("md-h1", parent=body, fontSize=17, leading=22, spaceBefore=14, spaceAfter=8)
    h2 = ParagraphStyle("md-h2", parent=body, fontSize=14, leading=19, spaceBefore=10, spaceAfter=6)
    h3 = ParagraphStyle("md-h3", parent=body, fontSize=12, leading=17, spaceBefore=8, spaceAfter=4)
    quote = ParagraphStyle("md-quote", parent=body, leftIndent=14, textColor=colors.HexColor("#555555"), spaceAfter=8)
    code = ParagraphStyle("md-code", parent=body, leftIndent=8, spaceAfter=8)
    pre = ParagraphStyle("md-pre", parent=code, fontSize=8.5, leading=11.5, textColor=colors.HexColor("#1f2328"))
    return {"body": body, "h1": h1, "h2": h2, "h3": h3, "quote": quote, "code": code, "pre": pre}

# --------------------------------------------------------------- outline ----

class OutlineEntry(Flowable):
    """Invisible flowable that registers a PDF outline/bookmark entry."""

    def __init__(self, title, key, level):
        super().__init__()
        self.title = title
        self.key = key
        self.level = level
        self.width = 0
        self.height = 0

    def draw(self):
        pass

    # reportlab >= 4.2 passes extra layout kwargs (e.g. `_sW`) to drawOn.
    def drawOn(self, canvas, x, y, **_kwargs):
        canvas.bookmarkPage(self.key)
        canvas.addOutlineEntry(self.title, self.key, self.level, False)

# ------------------------------------------------------------- markdown ----

def xml_escape(text):
    return (
        text.replace("&", "&")
        .replace("", ">")
    )

def render_inline(text):
    """Convert inline markdown (bold/italic/code/links) to reportlab XML."""
    out = []
    i = 0
    n = len(text)
    emphasis = (
        ("***", "**", "***"),
        ("___", "***", "***"),
        ("**", "**", "**"),
        ("__", "**", "**"),
        ("*", "*", "*"),
        ("_", "*", "*"),
    )
    while i = 0:
                out.append('%s' % (CODE_FONT, xml_escape(text[i + 1:close])))
                i = close + 1
                continue
            out.append(xml_escape(ch))
            i += 1
            continue
        if ch == "[":
            m = re.match(r"\[([^\]]*)\]\(([^)\s]+)\)", text[i:])
            if m:
                link_text = xml_escape(m.group(1))
                href = m.group(2)
                if href.startswith(("http://", "https://")):
                    out.append('%s' % (xml_escape(href), link_text))
                else:
                    out.append(link_text)
                i += m.end()
                continue
        matched = False
        for mark, open_tag, close_tag in emphasis:
            if text.startswith(mark, i):
                close = text.find(mark, i + len(mark))
                if close >= 0:
                    out.append(open_tag + render_inline(text[i + len(mark):close]) + close_tag)
                    i = close + len(mark)
                    matched = True
                    break
                out.append(xml_escape(mark))
                i += len(mark)
                matched = True
                break
        if not matched:
            out.append(xml_escape(ch))
            i += 1
    return "".join(out)

def split_table_row(row):
    row = row.strip()
    if row.startswith("|"):
        row = row[1:]
    if row.endswith("|"):
        row = row[:-1]
    return [c.strip() for c in row.split("|")]

def parse_pipe_table(lines, idx):
    """Parse a GFM pipe table starting at lines[idx]; returns (rows, next_idx)."""
    if "|" not in lines[idx]:
        return None, idx
    if idx + 1 >= len(lines) or not re.match(r"^\s*\|?[\s:|-]+\|?\s*$", lines[idx + 1]):
        return None, idx
    rows = [split_table_row(lines[idx])]
    idx += 2
    while idx  900:
            ratio = 900.0 / im.width
            im = im.resize((900, max(1, int(im.height * ratio))), PILImage.LANCZOS)
        im.save(out, "JPEG", quality=85)
        return out
    except Exception:
        return None

def find_image_file(src, base_dir, images_dir):
    """Locate the original image file for a markdown image src.

    The app rewrites every embedded image src to `images/img_N.ext` and copies
    the files into `images_dir`. For bound documents `base_dir` may also point
    at the .md's folder (relative original paths). The images_dir lookup by
    basename must therefore run even when base_dir is absent (new/untitled
    documents) — otherwise no image ever resolves there.
    """
    if src.startswith(("http://", "https://", "data:")):
        name = os.path.basename(src.split("?")[0]) or "image"
        if images_dir:
            for ext in (".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp", ".svg", ""):
                cand = os.path.join(images_dir, os.path.splitext(name)[0] + ext)
                if os.path.exists(cand):
                    return cand
        return None
    if base_dir:
        cand = os.path.join(base_dir, src.replace("/", os.sep).replace("\\", os.sep))
        if os.path.exists(cand):
            return cand
    if images_dir:
        name = os.path.basename(src)
        for ext in (".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp", ".svg", ""):
            cand = os.path.join(images_dir, os.path.splitext(name)[0] + ext)
            if os.path.exists(cand):
                return cand
    return None

def image_flowable(src, base_dir, images_dir, work_dir, alt):
    """Build an Image flowable, converting to JPEG first. None when missing."""
    path = find_image_file(src, base_dir, images_dir)
    if not path:
        return None
    jpg = prepare_jpeg(path, work_dir) or path
    try:
        img = Image(jpg)
        img._restrictSize(150 * mm, 200 * mm)
        return img
    except Exception as exc:
        sys.stderr.write("pdf_gen: image failed: %s\n" % exc)
        return None

def build_pdf(md_text, output_path, base_dir, images_dir, include_images):
    register_cjk_fonts()
    styles = build_styles()
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=16 * mm,
        bottomMargin=16 * mm,
        title=os.path.splitext(os.path.basename(output_path))[0],
    )
    story = []
    heading_count = 0
    work_dir = tempfile.mkdtemp(prefix="md_pdf_")

    lines = md_text.splitlines()
    if lines and lines[0].strip() == "---":
        end = next((i for i in range(1, len(lines)) if lines[i].strip() == "---"), None)
        if end is not None:
            lines = lines[end + 1:]

    idx = 0
    in_code = False
    code_buf = []
    list_items = []

    def flush_list():
        nonlocal list_items
        if list_items:
            items = [ListItem(Paragraph(render_inline(it), styles["body"])) for it in list_items]
            story.append(ListFlowable(items, bulletType="bullet", start="&#8226;", leftIndent=12))
            list_items = []

    def push_image_block(src, alt):
        if not include_images:
            story.append(Paragraph("*[image link: %s]*" % xml_escape(src), styles["body"]))
            return
        img = image_flowable(src, base_dir, images_dir, work_dir, alt)
        if img is not None:
            story.append(img)
        else:
            story.append(Paragraph("*[image: %s]*" % xml_escape(alt or src), styles["body"]))

    while idx "):
            flush_list()
            quote_lines = []
            while idx ") or not lines[idx].strip()):
                if lines[idx].startswith(">"):
                    quote_lines.append(lines[idx][1:].lstrip())
                elif quote_lines:
                    break
                idx += 1
            story.append(Paragraph(render_inline("\n".join(quote_lines)), styles["quote"]))
            continue

        if re.match(r"^\s*[-*+]\s+", line):
            list_items.append(re.sub(r"^\s*[-*+]\s+", "", line))
            idx += 1
            continue

        if re.match(r"^\s*\d+[.)]\s+", line):
            list_items.append(re.sub(r"^\s*\d+[.)]\s+", "", line))
            idx += 1
            continue

        img_m = re.match(r"^\s*!\[([^\]]*)\]\(([^)\s]+)\)\s*$", line)
        if img_m:
            flush_list()
            push_image_block(img_m.group(2), img_m.group(1))
            idx += 1
            continue

        # inline images inside a paragraph
        if include_images and "![" in line:
            flush_list()
            parts = re.split(r"!\[([^\]]*)\]\(([^)\s]+)\)", line)
            para_parts = []
            i = 0
            while i   [--base ] [--images ] [--no-images]\n")
        return 2
    md_path = argv[1]
    out_path = argv[2]
    base_dir = None
    images_dir = None
    include_images = True
    i = 3

    while i

---

[查看原文](https://www.52pojie.cn/thread-2123918-1-1.html)
