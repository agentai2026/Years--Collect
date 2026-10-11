---
title: "不需要服务器，用金山文档给 Trae 每日自动签到（多账号）"
published: 2026-10-11
description: "不需要服务器，用金山文档给 Trae 每日自动签到（多账号）"
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "cxs808"
sourceLink: "https://www.52pojie.cn/thread-2131917-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2131917-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

**不需要服务器，用金山文档给 Trae 每日自动签到（多账号）**
> 零基础照着做就行，全程大概 10 分钟。配好一次，以后每天全自动，不用再打开电脑。

**一、这是干什么的**

Trae CN是一款 AI 编程工具，每天签到能领积分（可以换模型的用量）。这个方案用「金山文档」的定时脚本帮你自动签到，好处是：
**不用自己买服务器**，也不用电脑一直开机；到点由金山文档云端自动跑；支持**多个账号**；签完能推消息到**微信**（Server酱 / PushPlus）或**企业微信**。

整体就三步：**拿 token → 建表格填进去 → 粘脚本设定时任务**。下面一步步来。

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(170.73 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4NDkzNXwwYjQ3NDdlYXwxNzkxNjkyODIzfDB8MjEzMTkxNw%3D%3D&nothumb=yes)

2026-10-11 12:20 上传

**二、开始前要准备的**一共三样，都很容易凑齐：
**一台 Windows 电脑**，并且已经安装、登录过 Trae 客户端（用于获取真实的设备ID）；**这台电脑装了 Python**（能运行 .py 脚本即可）；**一个金山文档账号**（微信扫码登录小程序即可）。

**三、第一步：拿到你的 token**

「token」可以理解成你的**登录凭证**——脚本靠它才能代替你去签到。

这个不用自己找，脚本会自动取。

**1. 运行取 token 的脚本**进入放脚本的文件夹（把下面路径替换成你自己的），然后运行：python trae_gettoken.py

运行后：

终端会打印你的**设备号**；自动在**默认浏览器打开登录页**（没弹出来就手动把终端里那条链接复制到浏览器）；

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(157.28 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4NDkzN3wyNTVkNDdkY3wxNzkxNjkyODIzfDB8MjEzMTkxNw%3D%3D&nothumb=yes)

2026-10-11 12:21 上传

在网页上用**手机号 + 验证码**登录，然后点「登录并使用 Trae」；

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(120.05 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4NDkzOHwwM2NkYTU3MXwxNzkxNjkyODIzfDB8MjEzMTkxNw%3D%3D&nothumb=yes)

2026-10-11 12:21 上传

登录成功后，浏览器地址栏会跳到 http://127.0.0.1:xxxxx/authorize?refreshToken=...（页面显示「无法访问」是**正常的**，看地址栏、别看页面）；**把地址栏这一整条链接复制下来**，粘回终端，回车。

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(128.41 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4NDkzOXwwZmU2NzA4NHwxNzkxNjkyODIzfDB8MjEzMTkxNw%3D%3D&nothumb=yes)

2026-10-11 12:21 上传

**2. 拿到一行 JSON**

做完上面，终端会打印类似这样的一行：{"name":"你的名字","refreshToken":"eyJhbGciOi...很长一串","deviceId":"3124143766407755"}

**这一整行就是你的账号信息**，先复制存好，下一步要用。

它也会自动写进同目录的 tokens.txt 里，找不到了去那里看。

> 提示：如果是多账号，重复本步骤，每个账号各跑一次、各拿到一行 JSON。

> **每个账号必须用不同设备号**（不同机器），这是服务端的限制。

**四、第二步：上传表格，把账号填进去**

**1. 上传表格模板**项目里给你备好了一张现成的表格模板 Trae签到-金山文档空表格.xlsx，表头、列宽都已经调好，**直接用它，不用自己新建**。打开微信上的金山文档小程序，把这张表格上传进去。

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(77.35 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4NDk0MHw4NWVjYWY3ZnwxNzkxNjkyODIzfDB8MjEzMTkxNw%3D%3D&nothumb=yes)

2026-10-11 12:21 上传

**2. 填账号**上传后表头已经齐了，从第 2 行开始，每行填一个账号：[td]列

---

[查看原文](https://www.52pojie.cn/thread-2131917-1-1.html)
