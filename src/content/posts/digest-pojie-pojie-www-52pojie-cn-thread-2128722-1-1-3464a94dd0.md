---
title: "【PS插件】文本素材库"
published: 2026-09-18
description: "大家好，今天给大家带来一款PS插件 —— 文本素材库。 经常用PS的小伙伴有没有遇到，需要复用以前的文案，然后在到处找以前的psd文件拿文案？ 如果有这方面的烦恼可以使用这个插件，可以将你使用过的文案、网址等文字 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "chengzi527"
sourceLink: "https://www.52pojie.cn/thread-2128722-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2128722-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

大家好，今天给大家带来一款PS插件 —— 文本素材库。

经常用PS的小伙伴有没有遇到，需要复用以前的文案，然后在到处找以前的psd文件拿文案？

如果有这方面的烦恼可以使用这个插件，可以将你使用过的文案、网址等文字内容全部保存在插件里。

查找时只需要输入关键词/分组/标签就可以快速锁定目标文案，再通过插件直接应用到PS的文字图层上。

93.2 KB 的安装包，安装完成后体积仅有238 KB，体积超小的文案储存插件。

![](https://static.52pojie.cn/static/image/common/none.gif)

**微信图片_2026-09-14_110621_718.png** *(16.46 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3OTkyMnw1Y2Q0YTA5MHwxNzg5NzgzMjkzfDB8MjEyODcyMg%3D%3D&nothumb=yes)

2026-9-18 11:11 上传

******************************************************************************************************************************************************

插件介绍：

本插件旨在帮助您高效管理、检索和复用文案素材。

文案筛选查找：通过输入“关键词”、“分组”和“多标签”组合筛选，瞬间锁定目标文案；右键菜单：使用右键菜单可对文案进行复制/修改/删除文案内容，也可以直接将文案应用到PS图层上；暂存区：点击文案存入暂存区，支持多次点击存入不同的文案，可在暂存区随意编辑文案；回收站：素材库删除的文案存入回收站，避免误删文案，在回收站可以恢复文案或彻底删除文案；导入：如果觉得手动添加文案太慢，可以在外部编辑好多个文案，再导入到素材库中，导入的文案支持ctrl+z撤销导入；导出：支持将文案库导出到别台电脑上使用文案素材；

**下载地址：**

百度网盘：https://pan.baidu.com/s/16wX17OjKC3vRyuSSaWeLPw?pwd=52pj     提取码: 52pj

夸克网盘：https://pan.quark.cn/s/56f94ea5430d     提取码：sxc7

安装方法：双击文本素材库.exe，出现安装窗口，点击安装即可。

默认安装目录：C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\

******************************************************************************************************************************************************

*****文案存储与修改*****

文案库存储采用json格式的本地存储，存储位置在插件根目录下的data/TextLibrary/TextLibrary.json

打开本地存储文件TextLibrary.json，你会看到所有文案数据只显示在第一行

![](https://static.52pojie.cn/static/image/common/none.gif)

**文案数据.png** *(5.21 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3OTkyM3w2MmRkN2IwN3wxNzg5NzgzMjkzfDB8MjEyODcyMg%3D%3D&nothumb=yes)

2026-9-18 11:11 上传

这时候用你打开这个本地存储文件的软件，在代码的位置右键，找到 格式化文档，这时候挤在一行的代码就会变成规整的多行代码显示

不同软件叫法不一样，有的叫代码美化/格式化代码等

![](https://static.52pojie.cn/static/image/common/none.gif)

**文案数据1.png** *(69.33 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3OTkyNHwxMTVkNGVhNHwxNzg5NzgzMjkzfDB8MjEyODcyMg%3D%3D&nothumb=yes)

2026-9-18 11:11 上传

每一个{}里的内容就是一条存入的文案，{}里的内容介绍：

id → 记录存储时间category → 分组名称content → 文本1写入位置subContent → 文本2写入位置tags → 标签写入位置，逗号隔开，可写入多个标签

*****导入数据*****

导入数据时，会先检测导入的所有文案，然后显示 新增/重复/更新 多少条文案

![](https://static.52pojie.cn/static/image/common/none.gif)

**导入预检.png** *(38 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3OTkyMXw4ZTQ3N2ZhNnwxNzg5NzgzMjkzfDB8MjEyODcyMg%3D%3D&nothumb=yes)

2026-9-18 11:11 上传

导入数据后，还可以Ctrl+z撤销本次导入。

----------------------------------------------------------------------------------------------------

----------------------------------------------------------------------------------------------------

*****插件实操*****

单文本录入，应用到PS文字图层

![](https://static.52pojie.cn/static/image/common/none.gif)

**单文本.gif** *(259.42 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3OTkzMXxhMThhZjEyNnwxNzg5NzgzMjkzfDB8MjEyODcyMg%3D%3D&nothumb=yes)

2026-9-18 11:28 上传

双文本快捷录入，应用到PS文字图层

![](https://static.52pojie.cn/static/image/common/none.gif)

**双文本 换行.gif** *(412.42 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3OTkzM3xkNjc5YzgxMHwxNzg5NzgzMjkzfDB8MjEyODcyMg%3D%3D&nothumb=yes)

2026-9-18 11:28 上传

智能识别填入文案，在需要分割的地方填入分隔符，分隔符支持：@@@、---、===、***

![](https://static.52pojie.cn/static/image/common/none.gif)

**智能识别.gif** *(111.1 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3OTkzNXxhZmUwOGU5ZXwxNzg5NzgzMjkzfDB8MjEyODcyMg%3D%3D&nothumb=yes)

2026-9-18 11:28 上传

文案查找：关键词/分组/标签 都能有效定位到文案，三个配合使用可以精确定位某条文案

![](https://static.52pojie.cn/static/image/common/none.gif)

**搜索.gif** *(805.07 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3OTkzNHw3MTZmNmExYnwxNzg5NzgzMjkzfDB8MjEyODcyMg%3D%3D&nothumb=yes)

2026-9-18 11:28 上传

PS：插件测试让AI帮忙生成了一些内置文案，如果不想要这些文案，打开插件根目录的data/TextLibrary/TextLibrary.json

全选TextLibrary.json的所有内容，delete删除，再在里面填入[]保存，关闭插件重新打开即可。

---

[查看原文](https://www.52pojie.cn/thread-2128722-1-1.html)
