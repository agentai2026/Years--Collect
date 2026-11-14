---
title: "PNG → ICO 专业生成器"
published: 2026-11-13
description: "最近写了一个纯本地的单网页ICO图标生成器。分享出来给大家一起使用吧。 功能很简单就是把图标转为ico图标。 我之前都是网上百度ico转换，用别人的，要么卡，要么打不开，要么转的质量不行。索性在AI辅助下手搓了 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "春天的萌动"
sourceLink: "https://www.52pojie.cn/thread-2137476-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2137476-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

最近写了一个纯本地的单网页ICO图标生成器。分享出来给大家一起使用吧。

功能很简单就是把图标转为ico图标。

我之前都是网上百度ico转换，用别人的，要么卡，要么打不开，要么转的质量不行。索性在AI辅助下手搓了一个。

下面会放出网页html文件，可以下载到本地使用，代码全开源不烧心。

并且我还花了4块5毛钱，上传到unicloud里面去了，现在也可以直接联网打开网址即可，

![](https://static.52pojie.cn/static/image/common/none.gif)

**PixPin_2026-11-13_15-09-57.jpg** *(191.57 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg5NDIzOXwyZTlmYTE5NXwxNzk0NjM2MTExfDB8MjEzNzQ3Ng%3D%3D&nothumb=yes)

2026-11-13 16:23 上传

因为用的是uni自带的托管，我也没有买域名，先看到的可以先用，就那一点空间，如果人多可能撑不到几天

[https://env-00jy72n5bgbm-static.normal.cloudstatic.cn/](https://env-00jy72n5bgbm-static.normal.cloudstatic.cn/)

![](https://static.52pojie.cn/static/image/filetype/zip.gif)

[PNG → ICO 专业生成器（网页单文件，解压使用）.zip](forum.php?mod=attachment&aid=Mjg5NDI0MHwyYTljZjJhZnwxNzk0NjM2MTExfDB8MjEzNzQ3Ng%3D%3D)

*(47.57 KB, 下载次数: 45)*

2026-11-13 16:23 上传

点击文件名下载附件

下载积分: 吾爱币 -1 CB

它能做什么：

一次勾选多个尺寸（16/24/32/48/64/128/256，也能自己填 1–256 的任意值），直接生成一个多尺寸 ICO

输入支持 PNG / JPG / WebP / SVG / GIF，动图取第一帧

可以调内边距、缩放模式、九宫格对齐、圆角或圆形遮罩、背景色、透明阈值，编码也能选 PNG 或 BMP（32/24/8/4/1bpp）

批量模式：一次导入多张，按源文件名生成，重名自动加序号，打包成 ZIP 一次下载

生成前会做结构校验，每个尺寸用了什么编码、多少位深都能看到

把 .ico 拖进去还能反解查看里面每一帧，单独导出 PNG

![](https://static.52pojie.cn/static/image/smiley/default/lol.gif)

连发两次都发错版块了，实在不好意思，网页源码是要发语言区对吧，这一次应该对了，最近非常喜欢捣鼓网页式的小工具，本次如果发对了，下次就不迷路了。

[HTML] *纯文本查看* *复制代码*

PNG → ICO 专业生成器

# PNG → ICO 专业生成器

      支持 PNG / JPG / WebP / SVG · 多尺寸 · 完全离线

      单图
      批量

      撤销

      重做

      粘贴

      打开图片

    生成并下载

  图片
  预览
  导出

## 图片

        0
        清空

      拖拽图片到此处

      PNG / JPG / WebP / SVG · 支持多选

       全选
      已选 0 / 0

    可继续拖入图片，批量一次生成

## 预览

          棋盘格
          白色
          黑色

          适应
          1×
          2×
          4×
          8×
          16×

          把图片拖进来开始

          支持 PNG / JPG / WebP / SVG，导入后按 ← → 切换尺寸

            选择图片
            载入示例

         像素网格
         中心线
         安全区

## 导出设置

      0

        尺寸与编码

            经典
            完整
            图标集
            清空

              px

            添加
            清空自定义

            逐尺寸编码 0

        渲染设置

            缩放模式

              适应
              填充
              拉伸
              原始

            对齐锚点

            内边距 0%

              X 偏移

              Y 偏移

            重采样算法

              高质量（阶梯降采样）
              最近邻（像素风）

            遮罩

              无
              圆角矩形
              圆形

            圆角半径 20%

        背景设置

            背景模式

              透明
              纯色填充

              颜色

              不透明度 100%

        编码与兼容

            默认编码

              自动（智能选择）
              全部 PNG
              全部 BMP 32bpp
              全部 BMP 24bpp
              全部 BMP 8bpp
              全部 BMP 4bpp
              全部 BMP 1bpp

            Alpha 阈值 128

              兼容模式（BMP 自上而下存储）

              调色板抖动（Floyd–Steinberg）

          输出文件名
            跟随素材名

        批量模式按源文件名命名，重名自动加序号

          生成并下载
          仅生成

          逐个下载
          保存到文件夹…
          复制文件名列表

松开鼠标以导入图片

### 裁剪源图

      &#10005;

    拖拽画框 · 拖动内部移动 · 拖动四角缩放

       锁定 1:1
      重置

      取消
      应用

### 键盘快捷键

      &#10005;

#### 文件

        打开图片CtrlO

        粘贴图像CtrlV

        生成并下载CtrlS

#### 编辑

        撤销CtrlZ

        重做CtrlShiftZ

#### 预览

        上一 / 下一尺寸←→

        放大 / 缩小+-

#### 其它

        打开本面板?

        关闭弹窗 / 菜单Esc

        区域操作菜单右键

      macOS 用 &#8984; 代替 Ctrl · 图片区域支持右键唤出更多操作

      知道了

### 查看 ICO

      &#10005;

      选择一个尺寸查看

      拖入 .ico 即可查看结构

      导出全部 PNG
      导出当前 PNG

---

[查看原文](https://www.52pojie.cn/thread-2137476-1-1.html)
