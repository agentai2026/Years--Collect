---
title: "个人整改后做的html版网页密码管理系统"
published: 2026-09-01
description: "因公司销售助理反映上一个版本里面有网址、用户、密码管理了，可有时候却不记得应该用哪个浏览器去打开网址实现正确的系统登录。销售助理主管又找我从新整改下。 为了尽快让销售助理使用上整改后的HTML版的网页密码管理 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "kissfox"
sourceLink: "https://www.52pojie.cn/thread-2125770-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2125770-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

因公司销售助理反映上一个版本里面有网址、用户、密码管理了，可有时候却不记得应该用哪个浏览器去打开网址实现正确的系统登录。销售助理主管又找我从新整改下。

为了尽快让销售助理使用上整改后的HTML版的网页密码管理系统，我根据销售助理主管提出的要求重新整改了。

主要整改：

网址指定浏览器访问：

用于销售助理平时点击添加后客户的ERP的网页进入客户的ERP系统，可以根据自己在后台添加的网址指定浏览器来实现。

点击访问客户ERP 系统的时候，会自动检测指定浏览器是否已经安装，如未安装，会弹窗提示安装浏览器。

管理员后台整改：

主要整改添加客户ERP系统是选择使用什么浏览器。数据自动保存，管理员后台还修改了数据导入及导出JSON功能。

管理员后台密码默认: admin123，员工查看密码默认: employee2024

支持 Excel (.xls, .xlsx) 导入导出

所有数据存储方式改成了 localStorage

可点击「备份数据库」下载完整数据库文件

界面主题增加：

增加有8种颜色主题切换

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(132.33 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3NTkzNHxjYTg1NDY3MXwxNzg4MzE4MDk0fDB8MjEyNTc3MA%3D%3D&nothumb=yes)

2026-9-1 14:17 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(82.72 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3NTkzNnwwZjcwNmRkMnwxNzg4MzE4MDk0fDB8MjEyNTc3MA%3D%3D&nothumb=yes)

2026-9-1 14:19 上传

[HTML] *纯文本查看* *复制代码*

    企业密码管理系统

# 密码管理系统

            主题

        员工门户
        管理后台

## 快捷访问

                    显示密码

（原文含表格，请查看原文链接）

                查看密码: **employee2024**

## 凭证管理

                    新增
                    导出 Excel
                    导入 Excel

                    &#128229; 导出 JSON
                    &#128228; 导入 JSON

                &#128192; 数据库已连接
                localStorage 持久化存储

                    &#128190; 自动备份到下载文件夹
                    每次修改数据后自动导出 JSON 文件到电脑下载目录

                    已关闭

                &#128190; 存储位置：浏览器 localStorage
                &#128202; 记录数：0 条
                &#128204; 持久化：&#9989; 刷新/关闭不丢失
                &#128203; 最后备份：无

（原文含表格，请查看原文链接）

#### &#9881;&#65039; 安全设置

                员工查看密码修改

                管理员密码修改

                管理员: **admin123**
                员工: **employee2024**
                &#128161; 开启「自动备份」后每次修改自动导出 JSON 到下载文件夹

        &#127760;

### 浏览器

        请先确认电脑已安装该浏览器，如未安装请先下载。

            下次不再提示

            取消
            &#11015; 下载浏览器
            确定，已安装

### 添加凭证

        网址

        账号

        密码

            浏览器

                默认
                Edge
                Chrome
                Firefox

            取消
            保存

操作成功

由于个人对HTML网页代码的理解还是欠缺，大家有什么新的建议可提出，或有什么错误的地方，麻烦大家告知，我虚心求教。

---

[查看原文](https://www.52pojie.cn/thread-2125770-1-1.html)
