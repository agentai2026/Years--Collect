---
title: "Trae 每日自动签到脚本，顺手把 9074 的根因挖出来了"
published: 2026-09-28
description: "[md]**项目地址：https://github.com/wallechfox/Trae-Checkin** --- ## 起因 Trae 每天签到给积分，手动点挺烦。网上也有几个开源脚本，我一开始是直接用现成的，结果踩了两个坑。 1.签到直接报错： ``` {\\\"code\\\":9074,\\\"message\\\":\\\""
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "cxs808"
sourceLink: "https://www.52pojie.cn/thread-2130100-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2130100-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

**项目地址：[https://github.com/wallechfox/Trae-Checkin](https://github.com/wallechfox/Trae-Checkin)**

### 起因

Trae 每天签到给积分，手动点挺烦。网上也有几个开源脚本，我一开始是直接用现成的，结果踩了两个坑。

1.签到直接报错：

`{"code":9074,"message":"当前参与用户太多，请稍后再试"}`
2.在另一台电脑上提取的 token，填进去提示「Token 无效」。

搜了一圈，说法很乱。有说限流的，有说出口 IP 的，有说换设备号的，有说补请求头的。我照着试了个遍，都没有解决问题。

后来干脆把能找到的七八个程序全部下载下来对着读，才发现问题根本不在那些地方。

### 一、9074 的真正原因

**那句「当前参与用户太多」是骗人的，跟人多不多没关系。**

真正的原因是 `x-device-id` 这个请求头。它必须是客户端在服务器上**真实注册过**的设备号，自己编一个 16 位数字不行。

这个号就藏在客户端本地的 `storage.json` 里，而且是写在**键名**上的，连解密都不需要：

`iCubeAuthInfo://icube-dc:1234567890123456
                          ^^^^^^^^^^^^^^^^ 这 16 位`
（上面这个是格式示例，不是真号）

做个对照实验，同一个账号、同一时刻，只改设备号这一个变量：

发出去的设备号
status 里的 did_checked_in
claim 返回

自己生成的 16 位数字

---

[查看原文](https://www.52pojie.cn/thread-2130100-1-1.html)
