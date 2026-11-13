---
title: "火车票发票重命名"
published: 2026-11-12
description: "[mw_shl_code=python,true]import sys import shutil import pymupdf # 新版写法，替代 import fitz import re import os def get_ticket_info(pdf_path): doc = pymupdf.open(pdf"
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "liyitong"
sourceLink: "https://www.52pojie.cn/thread-2137296-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2137296-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

[Python] *纯文本查看* *复制代码*
import sys
import shutil

import pymupdf  # 新版写法，替代 import fitz
import re
import os

def get_ticket_info(pdf_path):
    doc = pymupdf.open(pdf_path)
    page = doc[0]

    stations = None
    name = None

    for block in page.get_text("blocks"):
        text = block[4].strip()

        if '站' in text and 'G' in text:
            found = re.findall(r'([\u4e00-\u9fa5]+站)', text)
            if len(found) >= 2:
                stations = (found[0].rstrip('站'), found[1].rstrip('站'))

        m = re.search(r'\d{3}\*{3,}\d{4}\s*([\u4e00-\u9fa5·]+)', text)
        if m:
            name = m.group(1)

    doc.close()

    if name and stations:
        return f"{name}_{stations[0]}-{stations[1]}"
    return None

files = sys.argv[1:]
for file in files:
    base = get_ticket_info(file)
    if base:
        # 新文件保存在原文件所在目录，也可以改成其他目录，如 r"D:\车票"
        new_path = os.path.join(os.path.dirname(file), base + '.pdf')

        # 若目标文件已存在，自动加序号避免覆盖
        count = 1
        while os.path.exists(new_path):
            new_path = os.path.join(os.path.dirname(file), f"{base}_{count}.pdf")
            count += 1

        shutil.copy2(file, new_path)
        print(f"已另存: {file} → {os.path.basename(new_path)}")
    else:
        print(f"pdf文件内容读取失败: {file}")
input("按任意键退出")
软件下载：

https://liyitong.lanzout.com/ivcCJ4fq3o2f

从12306上开具的发票PDF，直接拖动到软件上即可。支持批量处理，能一次性拖曳多个发票PDF。

---

[查看原文](https://www.52pojie.cn/thread-2137296-1-1.html)
