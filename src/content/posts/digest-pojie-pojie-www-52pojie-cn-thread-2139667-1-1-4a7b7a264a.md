---
title: "[开源示例] 多模态模型调用极简模板（OpenAI SDK / Claude Code / 异步视频轮询）"
published: 2026-11-25
description: "最近在折腾多模态大模型调用（文本对话、终端 AI 编程、文生图/图生视频异步任务），发现不同客户端和不同模型接口的调用模板非常分散，每次新建项目都要重写一遍鉴权、流式输出和异步轮询逻辑。 整理了一套轻量、零多余依赖的 Python + Bash 开源极简模板（MIT 协议） ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "wlsp"
sourceLink: "https://www.52pojie.cn/thread-2139667-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2139667-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

最近在折腾多模态大模型调用（文本对话、终端 AI 编程、文生图/图生视频异步任务），发现不同客户端和不同模型接口的调用模板非常分散，每次新建项目都要重写一遍鉴权、流式输出和异步轮询逻辑。

整理了一套轻量、零多余依赖的 **Python + Bash 开源极简模板（MIT 协议）**，方便大家直接套用到任何 OpenAI 兼容或 Anthropic 原生接口上：

**开源仓库地址（MIT）：**https://github.com/h451ke-sketch/novaink-api-examples

**一、模板包含哪些开箱即用的脚本？**

  **1. OpenAI 标准协议流式对话模板（Python）**：兼容标准 /v1/chat/completions，通过环境变量切换 OPENAI_BASE_URL 与 OPENAI_API_KEY，不写死任何供应商；

  **2. Claude Code 终端环境变量配置脚本（Bash / JSON）**：一键配置 ANTHROPIC_BASE_URL 与 ANTHROPIC_AUTH_TOKEN（特别注意原生协议末尾不要多拼 /v1，否则会报 404）；

  **3. 异步视频生成指数退避轮询模板（Python httpx）**：针对耗时 40s~180s 的异步视频生成接口（POST /v1/videos → GET /v1/videos/{id}），内置**初始 5s 逐步退避至 15s 轮询 + 多模型自动降级 Fallback + 流式下载落盘**，避免阻塞主线程。

**二、核心异步轮询与多模型自动降级代码片段**import asyncio, os, httpxAPI_BASE = os.getenv("API_BASE_URL", "https://你的OpenAI兼容接口/v1")API_KEY = os.environ["API_KEY"]HEADERS = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}async def submit_and_poll(client: httpx.AsyncClient, model: str, prompt: str, max_wait=420):    r = await client.post(f"{API_BASE}/videos", headers=HEADERS,                          json={"model": model, "prompt": prompt, "aspect_ratio": "16:9"}, timeout=45)    r.raise_for_status()    task_id = r.json().get("id") or r.json().get("task_id")    elapsed, interval = 0, 5    while elapsed **路径拼接坑**：OpenAI SDK 类工具（Cherry Studio / Cursor / Dify）填 .../v1，而 Anthropic 原生 SDK（Claude Code）会自动拼 /v1/messages，配置根域名即可，不能再带 /v1；

  **任务状态持久化**：视频异步任务通常耗时 1~3 分钟，拿到 task_id 后务必先落库/写 Redis，防止进程重启丢单；

  **临时链转存**：上游返回的视频下载链接普遍有时效，拉取到 URL 后应立刻流式下载落盘或转存对象存储。

完整代码和 README 都在 GitHub 仓库里，MIT 开源欢迎自取或提 PR 交流！

---

[查看原文](https://www.52pojie.cn/thread-2139667-1-1.html)
