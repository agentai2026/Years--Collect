---
title: "牛马工资计数器,纯 PHP + HTML5"
published: 2026-10-19
description: "# 牛马工资计数器 打工人专用 · 按秒实时计算当天工资的考勤打卡小工具。纯 PHP + HTML5，数据存本地 JSON 文件，无需数据库。 ## 功能 - 4 位工号免密注册 / 登录（新工号首次登录自动弹出打工问卷） - 打工问卷： ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "307921917"
sourceLink: "https://www.52pojie.cn/thread-2133209-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2133209-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

# 牛马工资计数器

打工人专用 · 按秒实时计算当天工资的考勤打卡小工具。纯 PHP + HTML5，数据存本地 JSON 文件，无需数据库。

## 功能

- 4 位工号免密注册 / 登录（新工号首次登录自动弹出打工问卷）

- 打工问卷：单休 / 双休、月薪、上午上下班、下午上下班（每日工时自动计算，默认 8 小时）

- 实时计薪：到上班点自动按秒跳动，酷炫数字动画 + 进度环 + 背景粒子

- 迟到上班按钮：点击后从点击时刻重新开始计薪

- 近 7 日收益柱状图：统计当前工号的每日收入，悬停查看明细

- 设置页：随时修改问卷内容、清除今日打卡、退出登录

## 计薪口径

| 项目 | 规则 |

|---|---|

| 双休 | 月薪 ÷ 21.75 天（法定月计薪天数） |

| 单休 | 月薪 ÷ 26 天 |

| 每秒工资 | 日薪 ÷ 每日工作秒数（上午 + 下午，不含午休） |

| 当日已赚 | 已工作秒数 × 每秒工资（到点未打卡自动按准点计薪） |

| 迟到打卡 | 从打卡时刻开始计秒 |

## 部署

要求：PHP 7.4+（推荐 8.x），任意 Web 服务器。

1. 将 `salary-counter` 整个目录放到网站根目录（如 `C:\xampp\htdocs\`、宝塔 `/www/wwwroot/`、飞牛 OS 的应用目录）

2. 确保 `data/` 目录有写入权限（Linux/NAS 上执行 `chmod -R 775 data`）

3. 浏览器访问 `http://你的地址/salary-counter/` 即可

没有现成服务器时，命令行快速启动：

```bash

cd salary-counter

php -S 0.0.0.0:8080

# 然后访问 http://localhost:8080/

```

Nginx 部署时建议额外禁止直接访问 `data/` 目录（Apache 已内置 `.htaccess` 防护）。

## 数据与备份

- 每个工号一个文件：`data/user_XXXX.json`（XXXX 为工号）

- 备份 / 迁移 = 复制整个 `salary-counter` 目录

## 注意

- 本工具无密码，仅适合自用或家庭内网，请勿部署到公网存放敏感数据

- 历史日收入：有快照用快照，无快照且当天有打卡记录的按满日工资预估

![](https://static.52pojie.cn/static/image/common/none.gif)

**360截图20261020074946366.jpg** *(46.39 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4NzMyOXwzNjEwZmE5NXwxNzkyNTQ4MDkzfDB8MjEzMzIwOQ%3D%3D&nothumb=yes)

2026-10-20 07:50 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**360截图20261020075021334.jpg** *(54.5 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4NzMzMHw5NjliM2EwY3wxNzkyNTQ4MDkzfDB8MjEzMzIwOQ%3D%3D&nothumb=yes)

2026-10-20 07:50 上传

![](https://static.52pojie.cn/static/image/filetype/zip.gif)

[salary-counter.zip](forum.php?mod=attachment&aid=Mjg4NzEyOHw5ZjMwMTc2NnwxNzkyNTQ4MDkzfDB8MjEzMzIwOQ%3D%3D)

*(35.45 KB, 下载次数: 34)*

2026-10-19 16:24 上传

点击文件名下载附件

下载积分: 吾爱币 -1 CB

仅供娱乐！

---

[查看原文](https://www.52pojie.cn/thread-2133209-1-1.html)
