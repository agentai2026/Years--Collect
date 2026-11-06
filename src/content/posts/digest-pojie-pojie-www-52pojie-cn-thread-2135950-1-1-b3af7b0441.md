---
title: "向曰葵太贵了！我用python做了一个平替"
published: 2026-11-05
description: "使用场景：内网多台机器都需要远程控制，传输文件。外出没拿笔记本，只有手机。 使用前提：有公网ip或者域名 项目说明：类似向日葵的远程桌面控制，支持 PC / 手机浏览器访问。 源码下载https://88886666.lanzouu ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "天之牙2012"
sourceLink: "https://www.52pojie.cn/thread-2135950-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2135950-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

使用场景：内网多台机器都需要远程控制，传输文件。外出没拿笔记本，只有手机。

使用前提：有公网ip或者域名

项目说明：类似向日葵的远程桌面控制，支持 PC / 手机浏览器访问。

源码下载https://88886666.lanzouu.com/b0hec7quh

密码:52pj

一、项目简介

一套类似向日葵 / ToDesk 的远程桌面控制系统，用于：

远程查看和控制内网 Windows 电脑的桌面

通过浏览器访问（PC + 手机）

支持文件上传下载

多台设备统一管理

典型场景：

在家远程操作公司电脑

出差时访问自己的办公电脑

一台服务器管理多台内网机器

数据流向：

管理员浏览器访问 hello.php 登录，查看所有被控机

点「压缩/原画」打开远程桌面，WebSocket 连接服务器

被控机 4.py 持续推画面到服务器（WebSocket）

服务器把被控机画面转发给浏览器，把浏览器鼠标键盘转发给被控机

服务器 111.py 负责 WebSocket 双向中继

架构：

服务器：ip:410/                ← 站点根目录（宝塔站点）

├── 服务端核心文件

│   ├── hello.php                 ← 管理面板（登录 + 设备列表）

│   ├── desktop.php               ← 远程桌面页面

│   ├── files.php                 ← 文件管理页面

│   ├── yuancheng.php             ← 心跳接收接口（被控机调用）

│   ├── 111.py                  ← WebSocket 中继服务

│   │

│   └── deploy/                   ← 一键部署包（给被控机用）

│       ├── install.html          ← 安装说明页（浏览器打开）

│       ├── install.bat           ← Windows 一键安装脚本

│       ├── 4.py                  ← 被控端主程序

│       ├── python-3.8.6.exe      ← Python 安装包（26MB）（确保win7也能用）

│       └── whl/                  ← 依赖 wheel 包（47MB，13个文件）

│

└── 运行时生成的文件（不要手动创建）

    ├── look.ini                  ← 设备状态数据库

    ├── look.lock                 ← 文件锁

    ├── cmds/                     ← 待执行命令目录

    ├── agent.log                 ← 被控机日志

    └── heartbeat.log             ← 心跳日志

Q：一定要用宝塔吗？不一定。宝塔只是方便管理 PHP + Nginx。手动装也可以，只要配置对了。Q：被控机能连几个？理论无上限，每台一个独立 device_id，数据库存在 look.ini 里。

【安装步骤】

服务器设置：

**宝塔新建站点，把网站源代码上传进去，端口我用的是410**

**设置权限**

**[PHP] *纯文本查看* *复制代码*
cd /www/wwwroot/你的站点目录
chown -R www:www .
chmod -R 755 .
touch look.ini look.lock
chown www:www look.ini look.lock
chmod 664 look.ini look.lock
mkdir -p cmds && chown www:www cmds && chmod 775 cmds
**

**

改默认账号和密码，hello.php中**

**$ADMIN_USER = 'jipoasnjfnlsadnfsdakf';    // ★ 用户名自己修改**

**$ADMIN_PASS = 'qweqwvfdsolkjgfsdpfjs';    // ★ 改成你的强密码**

**启动中继服务111.py  这个111.py也要放在同一个服务器上运行**

**客户端安装：**

**1.访问 http://服务器ip:端口/deploy/install.html

2.打开cmd  **

**3.复制安装命令   **

**4.等待安装完成**

**远控：**

**打开****http://服务器ip:端口/hello.php**

使用说明：

1.服务器开个反代，端口映射到外网，直接访问  **（如果有https****上https）****http://服务器ip:端口/hello.php  **

2.关于手机端输入文字：双击屏幕召唤输入法

3.源码下载https://88886666.lanzouu.com/b0hec7quh

密码:52pj

预览：

**install.html****界面**

![](https://static.52pojie.cn/static/image/common/none.gif)

**20261105154522.png** *(85.31 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg5MTYzM3xlYTI1ZDkwZHwxNzkzOTQ0MTUyfDB8MjEzNTk1MA%3D%3D&nothumb=yes)

2026-11-5 17:20 上传

hello.php界面

![](https://static.52pojie.cn/static/image/common/none.gif)

**20261105153957.png** *(227.24 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg5MTYzMXwwYjZlOTY0OHwxNzkzOTQ0MTUyfDB8MjEzNTk1MA%3D%3D&nothumb=yes)

2026-11-5 17:20 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**20261105154112.png** *(201.09 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg5MTYzMnxlYzVhZWRiOXwxNzkzOTQ0MTUyfDB8MjEzNTk1MA%3D%3D&nothumb=yes)

2026-11-5 17:20 上传

手机端：

![](https://static.52pojie.cn/static/image/common/none.gif)

**Screenshot_2026-11-05-17-23-47-011_alook.browser.jpg** *(255.91 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg5MTYzNHwzNDhjYTlmYnwxNzkzOTQ0MTUyfDB8MjEzNTk1MA%3D%3D&nothumb=yes)

2026-11-5 17:26 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**Screenshot_2026-11-05-17-24-10-014_alook.browser.jpg** *(429.09 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg5MTYzNXxmNGE4ODg4YnwxNzkzOTQ0MTUyfDB8MjEzNTk1MA%3D%3D&nothumb=yes)

2026-11-5 17:26 上传

---

[查看原文](https://www.52pojie.cn/thread-2135950-1-1.html)
