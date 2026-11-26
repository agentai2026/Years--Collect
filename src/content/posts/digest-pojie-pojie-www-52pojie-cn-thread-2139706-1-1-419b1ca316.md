---
title: "批量出图流水线：Puppeteer 渲染本地模板 + Pillow 合成多尺寸图"
published: 2026-11-25
description: "[md]做小商品规格图，最费时间的其实不是修图，是重复：同一批素材要铺白底、排规格文字、再导好几个尺寸，鼠标点一下午。 我后来把这套流程拆成两段：浏览器负责\\\"把本地 HTML 模板渲染成图\\\"，Pillow 负责\\\"合成 + 导出\\\"。改文案只改模板里的字，不用动代码。环境是 P ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "hjl7uqz3mx"
sourceLink: "https://www.52pojie.cn/thread-2139706-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2139706-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

做小商品规格图，最费时间的其实不是修图，是重复：同一批素材要铺白底、排规格文字、再导好几个尺寸，鼠标点一下午。

我后来把这套流程拆成两段：浏览器负责"把本地 HTML 模板渲染成图"，Pillow 负责"合成 + 导出"。改文案只改模板里的字，不用动代码。环境是 Python 3.11 + Pillow 10.x + Node 18 + Puppeteer 24。

### 一、流程结构

- `templates/*.html`：人物图 + 规格文字，版式比例按最终输出尺寸写死

- `shots/`：浏览器渲染出来的 PNG（2 倍图）

- `compose.py`：铺白底、加规格角标、导出多尺寸 JPG

### 二、浏览器段：只记几个要点

写法网上一搜一大把，这里只记我自己踩过的：

- **2 倍图**：`page.setViewport({ width, height, deviceScaleFactor: 2 })`，要 2 倍图就在这儿给。我一开始又加了启动参数 `--force-device-scale-factor`，被乘了两次，尺寸离谱，去掉启动参数才正常。

- **字体没加载完就截图**：必须等 `await page.evaluate(() => document.fonts.ready)`，否则中文掉回默认字体，字号和换行全变。

- **`fullPage: true` 配 `position: fixed`**：吸顶装饰会被重复渲染到每一屏。我改成固定视口截图、不开 fullPage。

- **固定 userDataDir**：换一份 Chrome profile 跑，默认缩放和字体渲染会跟着变，出来的图和上一批对不上。我把 profile 固定住，保证每次渲染一致。

- **透明底还是白底**：`omitBackground: false` 才是白底，`true` 出的是带 alpha 的 PNG，后面 Pillow 的处理方式完全不一样。

顺带一提，这套浏览器段我底层是走 CDP 的：Puppeteer 的 `page.evaluate` 实际发出去的就是 `Runtime.evaluate`，截图是 `Page.captureScreenshot`。需要更细的粒度时，我直接用 `ws` 连本机 9222 端口自己发指令，比套一层封装库更省事。

### 三、合成段：Pillow

`# compose.py —— 铺白底 + 加规格角标 + 导出多尺寸
from PIL import Image, ImageDraw, ImageFont
import argparse

WHITE = (255, 255, 255)
FONT_PATH = "fonts/NotoSansCJK-Regular.ttc"   # 找不到会 OSError
LABEL_FILL = (250, 248, 240)                   # 米白字
LABEL_EDGE = (92, 62, 42)                     # 深棕描边

def flatten(im, bg=WHITE):
    """透明底铺白底。直接 alpha_composite 会因尺寸不匹配报错，
    正确做法是转成 RGBA 后，把 alpha 通道当 mask 贴到白底上。"""
    if im.mode != "RGBA":
        im = im.convert("RGBA")
    canvas = Image.new("RGB", im.size, bg)
    canvas.paste(im, (0, 0), im.getchannel("A"))
    return canvas

def draw_label(im, text, xy, font):
    """先画描边再盖字：四周各偏移一次深棕，最后盖上米白。"""
    d = ImageDraw.Draw(im)
    x, y = xy
    for dx, dy in ((-2, 0), (2, 0), (0, -2), (0, 2)):
        d.text((x + dx, y + dy), text, font=font, fill=LABEL_EDGE)
    d.text((x, y), text, font=font, fill=LABEL_FILL)
    return im

def export(im, sizes, out_dir="out", label="3只装"):
    """sizes: {"main": 800, "detail": 1200, "thumb": 240}"""
    font = ImageFont.truetype(FONT_PATH, 40)
    out = {}
    for name, w in sizes.items():
        r = im.resize((w, round(w * im.height / im.width)), Image.LANCZOS)
        draw_label(r, label, (24, 24), font)
        p = f"{out_dir}/{name}.jpg"
        r.save(p, "JPEG", quality=90, optimize=True, subsampling=0)
        out[name] = p
    return out

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("--sizes", default="main=800,detail=1200,thumb=240")
    a = ap.parse_args()
    sizes = {k: int(v) for k, v in (kv.split("=") for kv in a.sizes.split(","))}
    im = flatten(Image.open(a.src))
    export(im, sizes)`
实际踩到的几个点：

- **`Image.ANTIALIAS` 没了**。Pillow 10 把这个别名删了，要写 `Image.LANCZOS`（9.1 起就是新名字），不改直接 `AttributeError`。

- **JPEG 的 `quality` 默认是 75**。规格图要贴很近看，75 边缘会有明显块效应，我固定 90，再把 `subsampling=0` 关掉色度抽样，体积只涨一点，边缘小字不糊。

- **ICC 色彩配置不会自动带过去**。原图带 ICC 的话，`im.info.get("icc_profile")` 取出来、存盘时再传回去，不然转成 RGB 之后在部分看图软件里会偏色。

- **中文字体别依赖系统**。Linux 上 `ImageFont.truetype` 找不到字体会直接 `OSError: cannot open resource`，把字体文件塞进项目里最省事。

- **圆角、描边这类效果别用 Pillow 硬算**。我最后还是把角标放回 HTML 模板里用 CSS 画，Pillow 只负责尺寸和格式。

### 四、格式转换

这里有个新手常踩的坑：`dwebp` 和 `cwebp` 方向是反的，`dwebp` 只能把 WebP 解码成 PNG，真正编码成 WebP 的是 `cwebp`。

`# ImageMagick 7：WebP 转 JPG 并铺白底
magick -background white -flatten in.webp out.jpg

# 官方工具：dwebp 解码（WebP → PNG）
dwebp in.webp -o out.png

# 官方工具：cwebp 编码（PNG → WebP），-q 是有损质量
cwebp in.png -o out.webp -q 90

# 想顺手清掉元数据、统一压体积，cwebp 加 -metadata none
cwebp in.png -o out.webp -q 90 -metadata none`

### 五、用起来是什么样

`python compose.py shots/white_1.png --sizes main=800,detail=1200,thumb=240`
九张图从渲染到导出跑下来在二十秒上下，比在 PS 里一张张排快一个量级；改文案改模板就行。现在还缺可视化配置，颜色和文案都写在模板里，后面想接个表格驱动。

（代码有 AI 辅助整理和补全；流程、参数取舍和上面这些坑，都是我在实际出图时一个个试出来的。）

---

[查看原文](https://www.52pojie.cn/thread-2139706-1-1.html)
