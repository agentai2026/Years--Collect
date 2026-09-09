---
title: "辅助VS2022建立浏览数据库--解决QT源码调试跳转问题(仅供参考)"
published: 2026-09-08
description: "背景：利用VS2022调试QT源码时，进入到QT源码库内部发现有些宏的定义跳转不进去。 可能原因：VS在建立浏览缓存库的时候会扫描HeaderFiles下的头文件，不在里面的不会建立相关条目跳转关系 临时方法：用一个自定义头文件 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "lrj2025kernel"
sourceLink: "https://www.52pojie.cn/thread-2127032-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2127032-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

背景：利用VS2022调试QT源码时，进入到QT源码库内部发现有些宏的定义跳转不进去。

可能原因：VS在建立浏览缓存库的时候会扫描HeaderFiles下的头文件，不在里面的不会建立相关条目跳转关系

临时方法：用一个自定义头文件包含一些第QT库中重要的头文件，然后vs中添加现有项，让VS开始的时候扫描一遍建立关系

一、添加QT源码目录

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(69.45 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3NzYyOXwwNDc5ODQ3MXwxNzg4OTI0MDcwfDB8MjEyNzAzMg%3D%3D&nothumb=yes)

源码目录

2026-9-8 19:50 上传

二、建立一个QT用于测试例子工程

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(34.59 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3NzYzMHxkYmRiMTQyYnwxNzg4OTI0MDcwfDB8MjEyNzAzMg%3D%3D&nothumb=yes)

例子工程

2026-9-8 19:52 上传

三、编写自定义头文件PrivateIndex.h，内容如下

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(16.4 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3NzY0MXw4MzA3YWY1MnwxNzg4OTI0MDcwfDB8MjEyNzAzMg%3D%3D&nothumb=yes)

头我呢见

2026-9-8 20:08 上传

四、将此头文件添加到工程，添加现有项，只添加不引用，不要在任何cpp中引用，这里添加的目的就是为了让VS扫描一下建立关系

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(17.74 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3NzYzMXxmNmU4NDkyZXwxNzg4OTI0MDcwfDB8MjEyNzAzMg%3D%3D&nothumb=yes)

添加现有项

2026-9-8 19:55 上传

五、添加附加包含目录

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(25.46 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3NzYzMnxmNGI3ZWZkOHwxNzg4OTI0MDcwfDB8MjEyNzAzMg%3D%3D&nothumb=yes)

附加包含

2026-9-8 19:56 上传

六、断点调试

**1、F11一直走到这里,点击类进去**

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(11.8 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3NzYzM3xlN2U2MDQ0N3wxNzg4OTI0MDcwfDB8MjEyNzAzMg%3D%3D&nothumb=yes)

F11

2026-9-8 19:58 上传

**2、试试下方的定义能否点进去，能点进去说明配置成功了**

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(8.4 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3NzYzNHwyNmFhYWU5N3wxNzg4OTI0MDcwfDB8MjEyNzAzMg%3D%3D&nothumb=yes)

点进去

2026-9-8 19:59 上传

**3、点进去的样子（完结）**

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(10.71 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3NzYzNXw3M2FmYjJmNHwxNzg4OTI0MDcwfDB8MjEyNzAzMg%3D%3D&nothumb=yes)

进1

2026-9-8 20:00 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(8.89 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3NzYzNnw1YTg3YjE0NHwxNzg4OTI0MDcwfDB8MjEyNzAzMg%3D%3D&nothumb=yes)

进2

2026-9-8 20:01 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(3.04 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3NzYzN3w0ZmZiNWQxZnwxNzg4OTI0MDcwfDB8MjEyNzAzMg%3D%3D&nothumb=yes)

进3

2026-9-8 20:01 上传

---

[查看原文](https://www.52pojie.cn/thread-2127032-1-1.html)
