---
title: "图片多合一拼接合并成长图九宫格拼图对比图等形式"
published: 2026-11-11
description: "支持自定义N行M列的任意网格布局，最多可以处理10×10共100张图片。 软件提供无缝、间隔、线条三种拼接模式，间隔与线条的宽度、颜色均可自由调节，满足不同排版需求。 每一格图片支持鼠标滚轮独立缩放与拖拽平移， ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "lujucom"
sourceLink: "https://www.52pojie.cn/thread-2136820-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2136820-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

![](https://static.52pojie.cn/static/image/common/none.gif)

**2416.界面.png** *(788.38 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg5Mjk5MHw1NjJkMTAwN3wxNzk0NDYyNTIyfDB8MjEzNjgyMA%3D%3D&nothumb=yes)

2026-11-11 06:21 上传

支持自定义N行M列的任意网格布局，最多可以处理10×10共100张图片。

软件提供无缝、间隔、线条三种拼接模式，间隔与线条的宽度、颜色均可自由调节，满足不同排版需求。

每一格图片支持鼠标滚轮独立缩放与拖拽平移，缩放范围0.1x至10x，并可单独重置或一键清空。

支持原图比例及1:1、4:3、16:9等常用网格比例切换；还可自定义输出画布尺寸，比例不符时自动居中裁剪后缩放，避免拉伸变形。

支持拖放图片、双击选图、按文件夹批量填充，并按时间戳自动命名保存为.PNG文件。

整个拼接过程是基于pillow来合成的，输出清晰、拼接精准，适合制作拼图、九宫格、对比图等常见场景。

功能简单，操作便捷，欢迎二次开发。

成品软件下载：

https://pan.baidu.com/s/5e8w2SzV4Fi0EYZNRlizuig

或者

https://pan.quark.cn/s/81ad8782d117

均可。

核心代码如下：

[Python] *纯文本查看* *复制代码*
import os
from datetime import datetime
from PIL import Image, ImageDraw

BASE_IMG_EXTS = ('.png', '.jpg', '.jpeg', '.bmp', '.gif', '.webp',
                 '.tif', '.tiff', '.ico', '.tga')

GRID_RATIOS = {"1:1": 1.0, "4:3": 4 / 3, "3:4": 3 / 4,
               "16:9": 16 / 9, "9:16": 9 / 16,
               "3:2": 3 / 2, "2:3": 2 / 3}

def _rgba(hex_color):
    h = hex_color.lstrip("#")
    if len(h) != 6:
        return (255, 255, 255, 255)
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), 255)

class Cell:
    __slots__ = ("row", "col", "path", "pil_img",
                 "scale", "offset_x", "offset_y")

    def __init__(self, row, col):
        self.row = row
        self.col = col
        self.path = None
        self.pil_img = None
        self.scale = 1.0
        self.offset_x = 0
        self.offset_y = 0

    def set_image(self, path):
        img = Image.open(path)
        self.pil_img = img.copy()
        self.path = path
        self.scale = 1.0
        self.offset_x = 0
        self.offset_y = 0

    def clear(self):
        self.path = None
        self.pil_img = None
        self.scale = 1.0
        self.offset_x = 0
        self.offset_y = 0

class ImageMerger:
    def __init__(self, rows=3, cols=3, merge_mode="无缝", gap=0,
                 bg_color="#ffffff", line_color="#000000",
                 grid_ratio="原图比例"):
        self.rows = rows
        self.cols = cols
        self.merge_mode = merge_mode
        self.gap = gap
        self.bg_color = bg_color
        self.line_color = line_color
        self.grid_ratio = grid_ratio
        self.cell_ratio = None
        self.cells = [Cell(r, c) for r in range(rows) for c in range(cols)]

    def cell_at(self, row, col):
        return self.cells[row * self.cols + col]

    def load_image(self, row, col, path):
        cell = self.cell_at(row, col)
        cell.set_image(path)
        if self.cell_ratio is None:
            self.cell_ratio = cell.pil_img.width / cell.pil_img.height
        return cell

    def load_folder(self, folder):
        files = sorted(
            os.path.join(folder, f) for f in os.listdir(folder)
            if f.lower().endswith(BASE_IMG_EXTS)
            and os.path.isfile(os.path.join(folder, f))
        )
        filled = 0
        for cell, path in zip(self.cells, files):
            cell.set_image(path)
            filled += 1
            if self.cell_ratio is None:
                self.cell_ratio = cell.pil_img.width / cell.pil_img.height
        return filled

    def clear_all(self):
        for c in self.cells:
            c.clear()
        self.cell_ratio = None

    def _fixed_ratio(self):
        return GRID_RATIOS.get(self.grid_ratio)

    def _effective_gap(self):
        return self.gap if self.merge_mode in ("间隔", "线条") else 0

    def _cell_base_size(self, cell):
        ow, oh = cell.pil_img.width, cell.pil_img.height
        fixed = self._fixed_ratio()
        if fixed is None:
            return ow, oh
        if fixed >= ow / oh:
            return ow, max(1, round(ow / fixed))
        return max(1, round(oh * fixed)), oh

    def compute_layout(self):
        gap = self._effective_gap()
        sizes = {}
        for cell in self.cells:
            sizes[(cell.row, cell.col)] = (
                (0, 0) if cell.pil_img is None else self._cell_base_size(cell)
            )
        col_widths = [max((sizes[(r, c)][0] for r in range(self.rows)), default=0)
                      for c in range(self.cols)]
        row_heights = [max((sizes[(r, c)][1] for c in range(self.cols)), default=0)
                       for r in range(self.rows)]
        total_w = sum(col_widths) + gap * (self.cols - 1)
        total_h = sum(row_heights) + gap * (self.rows - 1)
        return col_widths, row_heights, total_w, total_h

    def compute_content_size(self):
        _, _, w, h = self.compute_layout()
        return w, h

    def _paste_cell(self, merged, cell, target_w, target_h, bg_rgba, px, py):
        if target_w  0:
            draw = ImageDraw.Draw(merged)
            lc = self.line_color
            for i in range(1, self.cols):
                x = sum(col_widths[:i]) + self.gap * (i - 1) + self.gap // 2
                draw.rectangle([x - self.gap // 2, 0,
                                x + self.gap // 2, total_h - 1], fill=lc)
            for j in range(1, self.rows):
                y = sum(row_heights[:j]) + self.gap * (j - 1) + self.gap // 2
                draw.rectangle([0, y - self.gap // 2,
                                total_w - 1, y + self.gap // 2], fill=lc)

        bg_rgba = _rgba(bg)
        gap = self._effective_gap()

        for r in range(self.rows):
            for c in range(self.cols):
                cell = self.cell_at(r, c)
                if cell.pil_img is None:
                    continue
                px = sum(col_widths[:c]) + gap * c
                py = sum(row_heights[:r]) + gap * r
                self._paste_cell(merged, cell, col_widths[c], row_heights[r],
                                 bg_rgba, px, py)

        if canvas_size:
            uw, uh = canvas_size
            r_user = uw / uh
            r_content = merged.width / merged.height
            if abs(r_user - r_content) / r_content >= 0.005:
                if r_user > r_content:
                    vis_h = max(1, round(merged.width / r_user))
                    top = (merged.height - vis_h) // 2
                    merged = merged.crop((0, top, merged.width, top + vis_h))
                else:
                    vis_w = max(1, round(merged.height * r_user))
                    left = (merged.width - vis_w) // 2
                    merged = merged.crop((left, 0, left + vis_w, merged.height))
            if (merged.width, merged.height) != (uw, uh):
                merged = merged.resize((uw, uh), Image.LANCZOS)

        return merged

    def save(self, output_dir, canvas_size=None):
        merged = self.generate(canvas_size=canvas_size)
        os.makedirs(output_dir, exist_ok=True)
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        name = f"组合_{self.rows}x{self.cols}_{self.merge_mode}_{ts}.png"
        path = os.path.join(output_dir, name)
        merged.save(path)
        return path

if __name__ == "__main__":
    merger = ImageMerger(
        rows=2, cols=2,
        merge_mode="间隔",
        gap=10,
        bg_color="#ffffff",
        line_color="#000000",
        grid_ratio="原图比例",
    )

    merger.load_folder("./inputs")

    saved = merger.save("./outputs", canvas_size=None)
    print("已保存:", saved)

---

[查看原文](https://www.52pojie.cn/thread-2136820-1-1.html)
