---
title: "自用挪车二维码，免服务器，可免费5G短信通知,可打电话"
published: 2026-10-28
description: "最近发现pushplus支持免费5G短信通知了(中国移动用户),想起来之前论坛里有过几个版本的挪车二维码页面, 加上我自己用vibe coding加上了自己的一些想法,感觉挺好用的,就把代码分享出来供大家参考. 这是部署完的页面预览 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "niustark"
sourceLink: "https://www.52pojie.cn/thread-2134649-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2134649-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

最近发现pushplus支持免费5G短信通知了(中国移动用户),想起来之前论坛里有过几个版本的挪车二维码页面,

加上我自己用vibe coding加上了自己的一些想法,感觉挺好用的,就把代码分享出来供大家参考.

这是部署完的页面预览

![](https://static.52pojie.cn/static/image/common/none.gif)

**5349cdaf03ea1f2260eb8a52e583d383.jpg** *(166.78 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4OTI5NHwxZDI4NmRhMHwxNzkzMzIxMTAxfDB8MjEzNDY0OQ%3D%3D&nothumb=yes)

2026-10-28 16:23 上传

利用Cloudflare Workers部署挪车页面

代码粘贴到workers里就行了,在设置里面增加这3个变量,填自己的

手机号

车牌号

pushplus的token就行了

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(89.45 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4OTMwMHxhNzU0YWJkMHwxNzkzMzIxMTAxfDB8MjEzNDY0OQ%3D%3D&nothumb=yes)

2026-10-28 16:49 上传

代码打包了.

![](https://static.52pojie.cn/static/image/filetype/zip.gif)

[move-car-worker.zip](forum.php?mod=attachment&aid=Mjg4OTI5OHxiNTgzMTU5Y3wxNzkzMzIxMTAxfDB8MjEzNDY0OQ%3D%3D)

*(4.06 KB, 下载次数: 93)*

2026-10-28 16:35 上传

点击文件名下载附件

下载积分: 吾爱币 -1 CB

收到短信提醒是这样的

![](https://static.52pojie.cn/static/image/common/none.gif)

**2026-10-29_09-08-15.png** *(140.31 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4OTQ2Nnw4YmMxMmRjNHwxNzkzMzIxMTAxfDB8MjEzNDY0OQ%3D%3D&nothumb=yes)

2026-10-29 09:09 上传

[JavaScript] *纯文本查看* *复制代码*
// ===== 使用 ES Module 语法（Cloudflare Workers 当前标准写法）=====
// 环境变量通过 fetch 的第二个参数 env 传入，确保能读到配置
export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env)
  }
}

async function handleRequest(request, env) {
  // 防御：个别部署环境不传 env 时，退化为空对象，避免报 undefined 错误
  env = env || globalThis.env || {}

  // ===== 敏感信息全部从环境变量读取（在 Cloudflare 控制台或 wrangler 中配置）=====
  // 必须配置的环境变量：
  //   PHONE          车主手机号，如 15888888888
  //   PUSHPLUS_TOKEN pushplus 的 token
  //   PLATE          车牌号，如 豫C99999
  const phone = env.PHONE
  const pushplusToken = env.PUSHPLUS_TOKEN
  const plate = env.PLATE

  // 校验环境变量是否已配置
  if (!phone || !pushplusToken || !plate) {
    return new Response(
      '缺少环境变量：请在 Cloudflare 中配置 PHONE、PUSHPLUS_TOKEN、PLATE（Settings → Variables → Environment Variables / Secrets）',
      { status: 500, headers: { 'Content-Type': 'text/plain;charset=UTF-8' } }
    )
  }

  // 从车牌号中拆出省份简称、发牌机关字母、序号（如 豫C99999 -> 豫 / C / 99999）
  const plateProvince = plate.slice(0, 1)
  const plateLetter = plate.slice(1, 2)
  const plateNumbers = plate.slice(2)

  const htmlContent = `

        通知车主挪车
        &#128663;">

            ${plateProvince}
            ${plateLetter}
            ${plateNumbers}

          请通过以下方式联系车主，我会立即前来处理

            &#128664;&#65039;通知挪车

            &#128656;提醒未关车窗

            &#128161;提醒未关车灯

              &#128222;电话联系

  `;

  return new Response(htmlContent, {
    headers: { 'Content-Type': 'text/html;charset=UTF-8' },
  });
}

---

[查看原文](https://www.52pojie.cn/thread-2134649-1-1.html)
