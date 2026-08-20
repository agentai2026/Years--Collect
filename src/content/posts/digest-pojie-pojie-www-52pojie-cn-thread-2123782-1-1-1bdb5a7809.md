---
title: "批量裁剪图片不同大小空白"
published: 2026-08-19
description: "工作需要，经常有堆图片需要裁剪，底部空白大小又不一样，文件大小1.13K，论坛找了下也没翻到，压缩包整合了一下所需东西，通过网盘分享的文件：trim_bottom.7z 链接: https://pan.baidu.com/s/1LlgLFRiZEhATunMkofZJxA? ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "ruanyang2"
sourceLink: "https://www.52pojie.cn/thread-2123782-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2123782-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

工作需要，经常有堆图片需要裁剪，底部空白大小又不一样，文件大小1.13K，论坛找了下也没翻到，压缩包整合了一下所需东西，通过网盘分享的文件：trim_bottom.7z

链接: [https://pan.baidu.com/s/1LlgLFRiZEhATunMkofZJxA?pwd=k7ab](https://pan.baidu.com/s/1LlgLFRiZEhATunMkofZJxA?pwd=k7ab) 提取码: k7ab 复制这段内容后打开百度网盘手机App，操作更方便哦

--来自百度网盘超级会员v1的分享
import os

from PIL import Image, ImageChops, ImageOps

INPUT_DIR = "input"      # 原图文件夹

OUTPUT_DIR = "output"    # 输出文件夹

THRESHOLD = 10           # 背景差异阈值，0-255，越小越严格

PADDING = 0              # 底部额外保留的空白像素，默认0

os.makedirs(OUTPUT_DIR, exist_ok=True)

for fname in os.listdir(INPUT_DIR):

if not fname.lower().endswith((".png", ".jpg", ".jpeg", ".bmp", ".webp")):

continue

`path = os.path.join(INPUT_DIR, fname)
try:
    img = Image.open(path)
    img = ImageOps.exif_transpose(img)  # 修正手机照片方向

    # 如果有透明通道，用 alpha 判断内容
    if img.mode in ("RGBA", "LA") and img.getchannel("A").getextrema() != (255, 255):
        mask = img.getchannel("A").point(lambda p: 255 if p > 0 else 0)
    else:
        rgb = img.convert("RGB")
        # 取右下角像素颜色作为背景色，适合纯色背景
        bg_color = rgb.getpixel((rgb.width - 1, rgb.height - 1))
        bg = Image.new("RGB", rgb.size, bg_color)
        diff = ImageChops.difference(rgb, bg).convert("L")
        mask = diff.point(lambda p: 255 if p > THRESHOLD else 0)

    bbox = mask.getbbox()
    if bbox is None:
        print(f"{fname}: 未检测到内容，跳过")
        continue

    bottom = min(bbox[3] + 1 + PADDING, img.height)
    cropped = img.crop((0, 0, img.width, bottom))

    if fname.lower().endswith((".jpg", ".jpeg")):
        cropped = cropped.convert("RGB")

    out_path = os.path.join(OUTPUT_DIR, fname)
    cropped.save(out_path)
    print(f"{fname}: 底部裁到 {bottom}px")

except Exception as e:
    print(f"{fname}: 处理失败 - {e}")`

参数说明
THRESHOLD：如果空白处有轻微杂色或阴影，可以调大，例如 20-30。PADDING：如果想在底部留一点空白，设置成 5 或 10。如果右下角不是空白背景，请把 bg_color = ... 改成固定颜色，例如 bg_color = (255, 255, 255)。

---

[查看原文](https://www.52pojie.cn/thread-2123782-1-1.html)
