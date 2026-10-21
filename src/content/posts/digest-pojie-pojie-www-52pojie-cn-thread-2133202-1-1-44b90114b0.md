---
title: "go编写的局域网扫码传文件，没有其它依赖，可传大文件"
published: 2026-10-19
description: "更新说明： 经过测试，暂时无法解决不同字体以及控制台环境生成二维码破坏问题，所以改成了GUI版本，并且增加了复制按钮，以及目录选择。 核心能力没变，还是双击瞬间打开，并且你机器有几个不同IP，就会有几个二维码 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "saobee"
sourceLink: "https://www.52pojie.cn/thread-2133202-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2133202-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

26.10.21 更新：

优化上传多文件对内存和磁盘的消耗，改为逐个文件提交并且流式写入磁盘，修改上传文件进度及相关文字提示。

====更新说明：

经过测试，暂时无法解决不同字体以及控制台环境生成二维码破坏问题，所以改成了GUI版本，并且增加了复制按钮，以及目录选择。

核心能力没变，还是双击瞬间打开，并且你机器有几个不同IP，就会有几个二维码，这样方便网络环境复杂的朋友。

根据反馈增加预览功能，点击文件名后点“打开”按钮即可。

增加按“创建时间”排序。

![](https://static.52pojie.cn/static/image/common/none.gif)

**qrfs-share-window.png** *(31.7 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4NzIyN3xkOTBkNmE1ZXwxNzkyNTU1MzQ3fDB8MjEzMzIwMg%3D%3D&nothumb=yes)

2026-10-19 20:46 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**qrfs-share-phone.png** *(26.89 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4NzIyNnw1YTRlMWZkZXwxNzkyNTU1MzQ3fDB8MjEzMzIwMg%3D%3D&nothumb=yes)

2026-10-19 20:46 上传

界面非常简单，一个ini文件配置路径和上传权限就行了。以前用aardio搞的那套，内核不支持超大文件，而且会把文件读入内存，导致内存缓慢增长。

让ai写代码搞了一套，去掉各种花里胡哨功能，就是传文件，剪贴板。然后列表增加了可以按文件名和时间排序，以及文件名搜索功能。

源码和成品请在网盘下载：

外链:https://wwbhw.lanzouq.com/b0mcwaxch 密码:52pj

---

[查看原文](https://www.52pojie.cn/thread-2133202-1-1.html)
