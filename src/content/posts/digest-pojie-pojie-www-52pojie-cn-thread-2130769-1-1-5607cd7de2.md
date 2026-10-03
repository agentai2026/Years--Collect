---
title: "【吾爱首发】cfst-file文件流转"
published: 2026-10-03
description: "项目简介 cfst-file（cfst文件流转）是一个基于 Cloudflare Worker + S3 兼容对象存储 的轻量级文件分发系统。单文件零依赖：一个 Worker 脚本 = 全部后端逻辑 + 管理前端，部署即用，零成本运行（已在 中国科技云 CSTCloud 对象存储 上实测通过，也可用于任何 S3 兼容 "
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "当兵的男人"
sourceLink: "https://www.52pojie.cn/thread-2130769-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2130769-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

**项目简介**

cfst-file（cfst文件流转）是一个基于 **Cloudflare Worker + S3 兼容对象存储** 的轻量级文件分发系统。单文件零依赖：一个 Worker 脚本 = 全部后端逻辑 + 管理前端，部署即用，零成本运行（已在 中国科技云 CSTCloud 对象存储 上实测通过，也可用于任何 S3 兼容存储）。

**功能特性**

大文件分片上传：8MB/片 × 3 并发经 Worker 中转，突破 Cloudflare Worker 100MB 请求体限制，单文件最大 20GB实时状态栏：文件名/大小/速度/进度条/预计剩余时间（500ms 刷新）上传队列：单飞队列（前一个完成才开始下一个），可取消、可插队断点续传：中断后重新选择同一文件自动续传限时分享链接：1/7/30/365 天或永久有效，HMAC 签名防篡改，收件人无需口令Range 断点下载：支持 206 Partial Content额度管控：ListBuckets 全账号真实用量统计，放不下的文件自动拦截中文文件名支持

**关键代码**（展示核心设计）

1. SigV4 签名（Web Crypto 实现，零依赖）：`async function hmac(keyBytes, data) {  const k = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);  return new Uint8Array(await crypto.subtle.sign('HMAC', k, typeof data === 'string' ? new TextEncoder().encode(data) : data));}// 签名链：AWS4-HMAC-SHA256（dateStamp -> region -> s3 -> aws4_request）`

2. 分片上传中转（浏览器 -> Worker -> S3，UNSIGNED-PAYLOAD 流式转发）：`async function handlePart(request, env, url) {  const key = url.searchParams.get('key');  const uploadId = url.searchParams.get('uploadId');  const partNumber = Number(url.searchParams.get('partNumber'));  if (!key.startsWith('files/') || !uploadId || partNumber  10000)    return json(400, { error: '参数错误' });  // 不读取分片进内存，CPU 消耗极低，免费计划可运行  const r = await s3Fetch(env, 'PUT', key, { uploadId, partNumber }, {    body: request.body,    contentLength: Number(request.headers.get('content-length'))  });  const etag = r.headers.get('etag');  if (r.status !== 200 || !etag) return json(502, { error: '分片上传失败' });  return json(200, { etag });}`

**踩坑分享**（中科云 S3 网关实测）

网关拦截一切无 Authorization 头的请求 -> 预签名 URL（SigV4/SigV2）全部 401，浏览器直传路线堵死对象公读 ACL 无效（匿名 GET 仍被拒）ListParts 接口返回 500（网关 bug）-> 断点续传改由前端记录Complete 时自动创建 0 字节目录占位对象 -> 列表按 key.endsWith('/') 过滤

因此最终采用 **Worker 中转分片** 方案：数据面全部走 Worker（服务端签名转发），权限集中、存储桶保持全私有。

**架构**`浏览器（内嵌管理页，同源）  | File.slice() 8MB 分片 -> XHR PUT /api/part（实时进度）  vCloudflare Worker（SigV4 签名 / 上传协调 / 下载代理 / 前端页面）  | UNSIGNED-PAYLOAD 流式转发  vS3 兼容存储（Multipart Upload：Create -> UploadPart -> Complete）`

**源码与预览**

GitHub 源码：[https://github.com/QingSiHuang/cfst-file](https://github.com/QingSiHuang/cfst-file)在线预览：[https://files.ctyun2026.de5.net/](https://files.ctyun2026.de5.net/)（管理界面需口令，页面即本源码部署的真实运行效果）

**部署**

1. Cloudflare 免费账号 + 任意 S3 兼容存储（支持 SigV4 头签名与分片上传）

2. Worker 配置 5 个 Secrets：S3_AK / S3_SK / S3_BUCKET / ADMIN_TOKEN / SHARE_SECRET

3. 部署 filehub-worker.js（控制台粘贴或 API，完整指南见 GitHub README）

4. 绑定自定义域名（Custom Domains API 仅需 Workers 脚本编辑权限）

本系统由本人主导设计（架构决策、需求、实测验证），AI 协助编码实现。所有密钥均存于 Cloudflare Worker Secrets，源码不含任何硬编码凭据。

欢迎交流指正。

---

[查看原文](https://www.52pojie.cn/thread-2130769-1-1.html)
