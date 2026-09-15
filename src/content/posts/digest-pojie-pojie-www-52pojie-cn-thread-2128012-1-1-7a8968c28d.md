---
title: "利用 openclaw-weixin 做一个通知系统"
published: 2026-09-14
description: "[md]#"
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "pzx521521"
sourceLink: "https://www.52pojie.cn/thread-2128012-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2128012-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

## 利用 openclaw-weixin 做一个通知系统

>
github-action 运行失败时想发送一个通知

目前看的解决方案 类似于 `Server 酱`的东西,还要关注公众号,还有条数限制,

总之各种不方便

前一段时间微信有了openclaw,想到可以利用它可以发送通知

[openclaw-weixin 官方源码](https://github.com/Tencent/openclaw-weixin)

其实 QQ也有,但是 QQ的是 websocket->要一直开着服务器,多账号的话也吃不消

但是 免费的云函数(cf worker/vecel function) 都没办法长连接的

而 wechat openclaw 用的是 http,对免费部署+多账号友好一点

其实还可以接受微信的消息,但是暂时没有想到有什么用

- 实时接受信息

因为你要实时接受信息就意味着你要一直开着服务器->直接用官方更好

- 定时接受信息/手动接受信息

暂时不知道有什么用

所以感觉发送通知有点用

原理

-
通过 `https://ilinkai.weixin.qq.com`生成二维码

-
扫描二维码后会返回

`{
"user_id": "o9cq800SOIIKr4JZpzKSRZ6IRRJk@im.wechat",
"get_updates_buf": "ChAIBBDC+qHziTQYvobP8ok0Ejo4NjkwYTM1NWQxOWRAaW0uYm90OjA2MDAwMDlhZDNjM2ZiNWU1MTM1MWY2YzBjNGUyMDFlMjFiNDU2",
"current_peer": "o9cq800SOIIKr4JZpzKSRZ6IRRJk@im.wechat",
"peers": {
  "o9cq800SOIIKr4JZpzKSRZ6IRRJk@im.wechat": {
    "context_token": "AARzJWAFAAABAAAAAADq0p8HKlvy54AXSYenaiAAAAB+9905Q6UiugPBawU3n3cyzQX+LkN8ofRzsCZYN0mt7uqx7SuPDhP2dGTFfb/S+ES9m50w1+UtTZ+148a9V0pwe991XHrI"
  }
},
}`

-
`user_id`每个 wechat 账户对应一个

-
`peer` 指的是用户,SDK支持多个 bot,但是 wechat现在仅支持单 bot

-
`get_updates_buf`  是收信游标,每次 wechat 发送会进行信息会进行更新

比如你 wechat 分别发送了消息 `0,1,2,3`, 每次接受消息都会返回一个游标,如果用 1 的 `get_updates_buf`,就会收到消息`2,3`,用 2 的`get_updates_buf`就会收到 3

- 它是支持多条消息的:比如先发送了`0`接受了,然后有发送了`1,2,3`,中间没有任何人接受,用`0`的 `get_updates_buf`就会接收到`1,2,3`然后返回 3 的游标

-
`context_token` 是一个`发信凭证`,你想给 `wechat bot`发送消息,必须带这个,每条接收的消息都会带一个`context_token`,只有最新的凭证才能用于再次发送,旧的发信凭证会过期.(实际上短时间内并不会过期,仍然可以使用)

然后

`/ilink/bot/getupdates`是接受消息

`/ilink/bot/sendmessage` 是发送消息

补齐对应的参数即可,重新扫码之后上面的除了`user_id`以外会全部失效

[github地址](https://github.com/pzx521521/openclaw-weixin-cli/)

[在线测试网址](https://oc.parap.dpdns.org/)

---

[查看原文](https://www.52pojie.cn/thread-2128012-1-1.html)
