---
title: "纸间：开源浏览器AI论文文献阅读器，原生为ai设计，支持对照翻译AI侧边栏等"
published: 2026-11-03
description: "[md]--- # 纸间：一个为大模型而生的浏览器论文阅读器 开源链接：**[github.com/Robbings/Paperpane](https://github.com/Robbings/Paperpane)** 希望能得到大家的Star！ 纸间是一个 Chrome / Edge 浏览器扩展。 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "Roberick"
sourceLink: "https://www.52pojie.cn/thread-2135516-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2135516-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

## 纸间：一个为大模型而生的浏览器论文阅读器

开源链接：**[github.com/Robbings/Paperpane](https://github.com/Robbings/Paperpane)**

希望能得到大家的Star！

![](https://static.52pojie.cn/static/image/common/none.gif)

**hero.png** *(892.89 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg5MDkxMHxhZmE0MTNkZHwxNzkzNjc3MDgzfDB8MjEzNTUxNg%3D%3D&nothumb=yes)

界面展示

2026-11-3 10:51 上传

纸间是一个 Chrome / Edge 浏览器扩展。它把论文阅读、对照翻译、AI 速览与问答、批注笔记和文献管理放在同一个地方，而且从第一天起就是围绕大模型来设计的。

### 起因

我读论文一直用 Zotero。管理文献很好用，但对 AI 的支持实在有限：装了几个插件，不少要付费，付了费体验依然割裂。功能不够原生，加了一堆插件整个阅读器越来越臃肿，用起来也不顺手。

另一个需求是：做调研的时候，我经常一下子翻到很多篇论文，想先在浏览器里打开看看，觉得值得再收进文献库。而浏览器自带的 PDF 阅读器除了「看」什么也做不了。

所以我干脆自己做了一个：**在浏览器里，一个简洁、好看、原生为大模型设计的论文阅读器。**

### 先说说界面

我对阅读界面的设想很简单：**中间是论文，左边是目录，右边是 AI。**

![](https://static.52pojie.cn/static/image/common/none.gif)

**look.png** *(1.04 MB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg5MDkxMnxhYjE1NWI0ZnwxNzkzNjc3MDgzfDB8MjEzNTUxNg%3D%3D&nothumb=yes)

界面展示，支持深浅配色

2026-11-3 10:52 上传

- 左侧显示论文的章节，没有书签的论文也会自动生成目录；

- 右侧是研究区，放着概览、对话、批注和笔记，需要时展开，不用时收起；

- 工具栏和面板都是半透明的玻璃质感，深浅两套主题，深色模式下论文页面也会一起变暗。

论文永远是主角，其他东西都围着它转。

### 打开一篇论文，先看概览

在 Google Scholar、arXiv 这类有 PDF 链接的页面上，纸间会在链接旁边加一个打开按钮。点一下，论文直接进入阅读器，右侧开始自动整理概览。

![](https://static.52pojie.cn/static/image/common/none.gif)

**f1-open.gif** *(1.38 MB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg5MDkwNnwyNzA3NTBjZXwxNzkzNjc3MDgzfDB8MjEzNTUxNg%3D%3D&nothumb=yes)

2026-11-3 10:51 上传

概览会先给出一段话的总结，再列出关键词、研究问题、方法和要点，每条后面都带着指向原文的小编号。概览里放哪些内容也可以自己定，比如只看「研究问题」和「局限性」。

打开一篇论文，先花一分钟看概览，再决定是精读、略读，还是收进库里以后再说，这是我现在最常用的流程。

### 读的时候，划一下就行

读到不懂的地方，不用复制、不用切窗口。选中一段文字，弹出的工具条里有高亮、批注、翻译、解释和提问。

![](https://static.52pojie.cn/static/image/common/none.gif)

**f3-explain.gif** *(1.46 MB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg5MDkwOHw0NjQyMzM4M3wxNzkzNjc3MDgzfDB8MjEzNTUxNg%3D%3D&nothumb=yes)

2026-11-3 10:51 上传

解释和划选翻译会以小浮窗的形式出现，可以拖到论文旁边放着；鼠标移上去时，会有一条虚线指回原文的位置。

如果想追问，就点「提问」，选中的句子会作为引用带进右侧的对话里。回答中的每个结论都标着出处，点一下就跳回原文对照。

图片和图表也能问：用框选工具圈出一块区域，直接让 AI 解释。

### 对照翻译

右侧的译文栏按页翻译，跟着你的阅读位置走。可以只看译文，也可以切到「对照」，一句原文配一句译文；公式和图表不会被乱翻译。

![](https://static.52pojie.cn/static/image/common/none.gif)

**f2-translate.gif** *(2.01 MB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg5MDkwN3w0NzZkMjBlYXwxNzkzNjc3MDgzfDB8MjEzNTUxNg%3D%3D&nothumb=yes)

对照翻译

2026-11-3 10:51 上传

翻译支持两种方式：

- **大模型翻译**：更通顺，适合精读；

- **机器翻译**：更快、更省，其中谷歌翻译的网页接口可以免费使用，在设置里添加并选中即可。

全文翻译和划选翻译可以分别选择不同的方式。

### 图、表、公式，自动识别

纸间会自动识别论文里的图片、表格和公式。鼠标悬停上去，就能让 AI 解释这张图，或者直接复制：

- 公式复制为 LaTeX；

- 表格可以复制为 Markdown、LaTeX，或者 Excel 表格；

- 图片复制为图片。

![](https://static.52pojie.cn/static/image/common/none.gif)

**f4-formula.gif** *(897.01 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg5MDkwOXwzMzkzMDFkN3wxNzkzNjc3MDgzfDB8MjEzNTUxNg%3D%3D&nothumb=yes)

图表公式可以自动识别和翻译

2026-11-3 10:51 上传

写笔记、写综述、做组会 PPT 的时候，终于不用对着截图手敲公式了。

### 批注和笔记

五种颜色的高亮、贴在原文旁的批注便签，以及每篇论文一份支持公式的 Markdown 笔记。右侧的批注列表可以按颜色筛选，点一条就回到原文。

![](https://static.52pojie.cn/static/image/common/none.gif)

**annotations.png** *(954.9 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg5MDkwNXxmMjVmOGJlNHwxNzkzNjc3MDgzfDB8MjEzNTUxNg%3D%3D&nothumb=yes)

支持高亮和批注

2026-11-3 10:51 上传

### 论文库：和 Zotero 互通

纸间自带一个简洁的论文库，设计的出发点就是不和 Zotero 抢活，而是和它互通：

- 多级文件夹、标签、星标和搜索；

- 通过 WebDAV 在多台电脑之间自动同步；

- 可以从 Zotero 导入论文，也可以导出回 Zotero。导入导出都尽量保留笔记、批注、高亮，以及原来的目录结构。

![](https://static.52pojie.cn/static/image/common/none.gif)

**library.png** *(538.16 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg5MDkxMXxjMjczNDZiM3wxNzkzNjc3MDgzfDB8MjEzNTUxNg%3D%3D&nothumb=yes)

文献库，可以和zotero联动

2026-11-3 10:51 上传

我自己的用法是：调研时先在纸间里读，值得长期保存的再同步到 Zotero。

### 支持什么模型

纸间内置了国内外主流厂商的模型接口，也可以添加任何兼容 OpenAI 格式的自定义接口。概览、问答、解释、图像识别和翻译，每一项都可以单独指定模型。

### 数据

- 论文、批注、笔记和设置都保存在浏览器本地，纸间没有服务器，但是可以用webdav同步；

- API 密钥只保存在本机，不会进入备份，也不会同步；

- 只有你主动使用 AI 或翻译功能时，相关内容才会发给你自己配置的服务。

### 使用

纸间是开源的，安装包和源码都在 GitHub：

**[github.com/Robbings/Paperpane](https://github.com/Robbings/Paperpane)**

下载 Release 里的安装包并解压，在浏览器的扩展管理页打开「开发者模式」，选择「加载已解压的扩展程序」即可。第一次打开时会有配置引导，几分钟就能用起来。

如果你也在找一个更顺手的论文阅读方式，欢迎试试看。有问题或建议，欢迎在 Issue 里告诉我；觉得有用的话，也欢迎点一个 Star。

---

[查看原文](https://www.52pojie.cn/thread-2135516-1-1.html)
