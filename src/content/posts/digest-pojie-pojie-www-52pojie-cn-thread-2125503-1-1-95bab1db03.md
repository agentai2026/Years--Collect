---
title: "一款极简的网址导航源码 免服务器部署在cloudflare上"
published: 2026-08-31
description: "在原版上在增加了 数据云端同步 Favicon第三方图标源 仓库地址 https://github.com/pxhzaii/NavSync demo https://d.5as.cn/ 部分代码/云端同步 [mw_shl_code=javascript,true]// functions/api/[].ts // 云端"
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "pxhzai"
sourceLink: "https://www.52pojie.cn/thread-2125503-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2125503-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

在原版上在增加了 数据云端同步   Favicon第三方图标源

仓库地址

[https://github.com/pxhzaii/NavSync](https://github.com/pxhzaii/NavSync)

demo

[https://d.5as.cn/](https://d.5as.cn/)

部分代码/云端同步

[JavaScript] *纯文本查看* *复制代码*
// functions/api/[[path]].ts
// 云端同步 API — 基于 GitHub Gist + Cloudflare Pages Functions
//
// 端点：
//   POST /api/connect   连接（验证 Token + 检测 Gist，自动创建）
//   POST /api/upload    上传配置到 Gist
//   POST /api/download   从 Gist 拉取配置
//   POST /api/disconnect 断开（清空 Token）
//
// 安全：口令保护 + 暴力破解防护（5 次错误锁定 15 分钟）

import type { Env } from '../_shared'
import {
  checkPassword,
  fetchWithTimeout,
  gistHeaders,
  handleError,
  jsonResponse,
  readBody,
  GIST_API_URL,
  GIST_FILE,
} from '../_shared'

interface ConnectBody { token: string }
interface DataBody { data: string }

export const onRequestPost: PagesFunction = async (context) => {
  const { request, env } = context
  const url = new URL(request.url)
  const path = url.pathname.replace(/^\/api\/?/, '').toLowerCase()

  // 口令校验（未设置口令时跳过）
  const authError = checkPassword(request, env)
  if (authError) return authError

  try {
    switch (path) {
      case 'connect': return await handleConnect(request, env)
      case 'upload': return await handleUpload(request, env)
      case 'download': return await handleDownload(request, env)
      case 'disconnect': return jsonResponse({ success: true })
      default: return jsonResponse({ error: '未知端点' }, 404)
    }
  }
  catch (err: any) {
    return handleError(err)
  }
}

/** 连接：验证 Token + 检测/创建 Gist */
async function handleConnect(request: Request, env: Env): Promise {
  const { token } = await readBody(request)
  if (!token)
    return jsonResponse({ error: 'Token 不能为空' }, 400)

  const headers = gistHeaders(token)

  // 查询用户所有 Gists，找是否已有 navsync-config.json
  const resp = await fetchWithTimeout(GIST_API_URL, { headers })
  if (!resp.ok) {
    const msg = resp.status === 401 ? 'Token 无效' : `GitHub API ${resp.status}`
    return jsonResponse({ error: msg }, 400)
  }

  const gists = await resp.json()
  const existing = gists.find((g: any) =>
    g.files && g.files[GIST_FILE] !== undefined,
  )

  let gistId = existing?.id
  if (!gistId) {
    // 自动创建空 Gist
    const createResp = await fetchWithTimeout(GIST_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        description: 'NavSync Cloud Sync',
        public: false,
        files: { [GIST_FILE]: { content: '{}' } },
      }),
    })
    if (!createResp.ok)
      return jsonResponse({ error: '创建 Gist 失败' }, 500)
    const created = await createResp.json()
    gistId = created.id
  }

  return jsonResponse({ success: true, gistId })
}

/** 上传：将配置写入 Gist */
async function handleUpload(request: Request, env: Env): Promise {
  const { token } = await readBody(request)
  const { data } = await readBody(request)
  if (!token || !data)
    return jsonResponse({ error: '参数缺失' }, 400)

  const headers = gistHeaders(token)
  const resp = await fetchWithTimeout(`${GIST_API_URL}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      files: { [GIST_FILE]: { content: data } },
    }),
  })

  if (!resp.ok)
    return jsonResponse({ error: '上传失败' }, 500)

  return jsonResponse({ success: true })
}

/** 下载：从 Gist 读取配置 */
async function handleDownload(request: Request, env: Env): Promise {
  const { token } = await readBody(request)
  if (!token)
    return jsonResponse({ error: 'Token 不能为空' }, 400)

  const headers = gistHeaders(token)
  const resp = await fetchWithTimeout(GIST_API_URL, { headers })

  if (!resp.ok)
    return jsonResponse({ error: '下载失败' }, 500)

  const gists = await resp.json()
  const target = gists.find((g: any) =>
    g.files && g.files[GIST_FILE] !== undefined,
  )

  if (!target)
    return jsonResponse({ error: '未找到同步数据' }, 404)

  const fileResp = await fetchWithTimeout(
    `${GIST_API_URL}/${target.id}`,
    { headers },
  )
  const gist = await fileResp.json()
  const content = gist.files?.[GIST_FILE]?.content || '{}'

  return jsonResponse({ success: true, data: content })
}

---

[查看原文](https://www.52pojie.cn/thread-2125503-1-1.html)
