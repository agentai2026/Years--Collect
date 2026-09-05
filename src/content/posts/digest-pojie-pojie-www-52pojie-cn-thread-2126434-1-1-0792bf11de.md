---
title: "服务器版【死了么】，免费部署在vercel， 自定义配置内容，定时发送，多邮箱收件人"
published: 2026-09-04
description: "我也不喜欢死了么这个名字，所以项目命名为Emergency-notice， 但这个项目的初衷就是类似的意思， 不过更加的灵活。 项目特点： 免费部署在服务器， 触发机制完美解决掉因为手机设备信号，电量，没有网络等的小概率情况， 功能列表： 1， 非常灵活的自定义配 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "小不点的对象"
sourceLink: "https://www.52pojie.cn/thread-2126434-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2126434-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

我也不喜欢死了么这个名字，所以项目命名为Emergency-notice， 但这个项目的初衷就是类似的意思， 不过更加的灵活。

项目特点： 免费部署在服务器， 触发机制完美解决掉因为手机设备信号，电量，没有网络等的小概率情况，

功能列表：

1， 非常灵活的自定义配置。 超时，邮箱，多收件人邮箱，邮件内容等，都可以通过vercel环境变量来配置，

2，傻瓜式部署， 填写好环境变量，设置触发任务，就可以使用了

3，使用QQ邮箱STMP协议发送邮件， 避免邮件进入垃圾箱， 注意：需要去申请授权码配置在环境变量

4，严格的安全机制， 敏感信息均在环境变量里面配置，不存在代码泄露， 哪怕请求接口泄露了， 没有授权码， 一样访问不了

5，维护简单， 本地只负责请求签到， 剩下的全在服务器处理

6，支持开发，只需要拿到请求签到的接口， 根据自己需求， 可以开发App，网页版， 以及自动化请求签到的需求

搁置的功能

1，定位

这个定位实际上， 几乎已经完成了， 而且可以实现精度非常高，1000米范围之内， 而且自带周边建筑物标记， 方便快速识别当时定位签到的位置， 当准备修改代码的时候，

想到了一个问题， 如果在A城市签到携带了定位信息， 在B城市忘了或者怎么样，导致没有签到， 那么在触发超时配置之后， 服务器就会发送邮件， 并且在邮箱内容携带该定位信息 ，

但是这个信息是A城市的定位信息，并不是B城市的， 所以就会产生没必要的误导信息， 当然这个问题也能解决， 只需要提示，是最近的一次签到定位信息就可以了， 但这样子的话，

定位功能就不能完全发挥作用。 所以没有足够的理由支撑开发定位功能， 所以该功能暂时搁置。

在微信里面开通邮件服务， 在微信里面就能看邮件， 超级方便，  没时间看邮箱， 难道还没时间看微信？  建议都配置一下

项目直通车：[https://github.com/es3344520/Emergency-notice](https://github.com/es3344520/Emergency-notice)

[JavaScript] *纯文本查看* *复制代码*
import nodemailer from 'nodemailer';

export async function sendNotification() {
  const senderEmail = process.env.QQ_EMAIL_ACCOUNT;
  const authCode = process.env.QQ_EMAIL_AUTH_CODE;
  const recipients = process.env.NOTIFY_EMAILS?.split(',').map(e => e.trim()).filter(Boolean) || [];
  const subject = process.env.EMAIL_SUBJECT;
  const body = process.env.EMAIL_BODY;

  const transporter = nodemailer.createTransport({
    host: "smtp.qq.com",
    port: 465,
    secure: true,
    auth: {
      user: senderEmail,
      pass: authCode,
    },
  });

  await transporter.sendMail({
    from: senderEmail,
    to: recipients.join(', '),
    subject: subject,
    text: body,
  });
}

---

[查看原文](https://www.52pojie.cn/thread-2126434-1-1.html)
