---
title: "PHP 800行代码内外网传输工具"
published: 2026-10-28
description: "PHP 是最好的语言（虽然刚又爆了漏洞，没升级的抓紧去升级） 这玩意儿解决什么问题场景很具体： [*]你在内网（公司、机房、家里的台式机），手里有个文件想扔到手机上； [*]或者手机上拍了张照片、收了个附件，想弄 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "天之牙2012"
sourceLink: "https://www.52pojie.cn/thread-2134613-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2134613-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

**PHP 是最好的语言（虽然刚又爆了漏洞，没升级的抓紧去升级）**

**这玩意儿解决什么问题****场景很具体：**
你在内网（公司、机房、家里的台式机），手里有个文件想扔到手机上；或者手机上拍了张照片、收了个附件，想弄回电脑；微信传？压缩、限速、还要登录；数据线？找不到线了；装个 AirDroid / LocalSend？内网没网、装不上、或者就是不想装。

**我需要的只有一个动作：电脑上点一下 → 手机扫个码 → 完事。于是就有了这套东西。**

**它是怎么工作的****整体架构其实特别简单**
内网端 666.php：一个控制台页面，点"创建会话"就生成一个随机 token，把二维码甩出来，qrcode.min.js生成二维码；公网端 qr_upload.php：不需要登录，只认 token，负责暂存文件、响应心跳；手机端：扫码即打开，H5 页面，上传和下载都在一个页面里，不需要装任何 App。

两端的通信全部走 HMAC-SHA256 签名 + 时间戳 + nonce，公网端只认签名，不认人的。

**功能清单**
双向传输：内网 → 手机、手机 → 内网，一个会话同时支持；任意文件类型：不转码、不改名，原样搬；多选 + 拖拽：电脑上拖进来，手机上选一堆；单文件 30MB：改 php.ini 还能往上调；2 秒合并心跳：一条请求同时干了"我还活着"和"有文件没"，省了一半流量；15 分钟自动过期：过了就没了，公网不给你留垃圾；随时结束会话：一点"结束"，公网上的文件全部清掉；推送列表可单独移除：发错了？点右上角 × 就行；失败重试：网络抖一下不用重新选文件。

**部署其实就两步**

**

第一步：传文件公网放 qr_upload.php + 【config03.php这个放在web外面】，内网放 666.php + qrcode.min.js。第二步：改配置config03.php 里把密钥换成你自己的，然后 qr_upload.php 里把 QR_CONFIG_FILE 改成你的真实路径，666.php 里把 QR_UPLOAD_BASE_URL 改成你的公网地址。两边密钥必须一致，否则一直 403。

源码：https://88886666.lanzouu.com/b0heb3ebg 密码:cfno

预览图：

![](https://static.52pojie.cn/static/image/common/none.gif)

电脑页面-1.png** *(128.39 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4OTIyNHxlZWEzNTg2NXwxNzkzMjQwOTgwfDB8MjEzNDYxMw%3D%3D&nothumb=yes)

2026-10-28 13:12 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**电脑页面-2.png** *(169.8 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4OTIyNXw5ODRiOTMyMHwxNzkzMjQwOTgwfDB8MjEzNDYxMw%3D%3D&nothumb=yes)

2026-10-28 13:12 上传

手机端

![](https://static.52pojie.cn/static/image/common/none.gif)

**手机-1.jpg** *(81.77 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4OTIyNnxiMTIxYzBkMXwxNzkzMjQwOTgwfDB8MjEzNDYxMw%3D%3D&nothumb=yes)

2026-10-28 13:12 上传

---

[查看原文](https://www.52pojie.cn/thread-2134613-1-1.html)
