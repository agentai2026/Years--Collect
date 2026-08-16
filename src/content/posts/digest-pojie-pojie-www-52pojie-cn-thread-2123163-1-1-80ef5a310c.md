---
title: "【Python】Custom Image API Skill，让Codex支持第三方GPT-IMAGE-2模型调用"
published: 2026-08-15
description: "[md]# Custom Image API Skill： CodeX调用skill ，让只有 Chat 接口的工具间接调用图片模型 ``` 该工具由AI生成，在CodeX做过测试完整可用。其他工具需要做一定的配置，根据相关工具的skill扩展来针对处理。 ``` ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "Cristy"
sourceLink: "https://www.52pojie.cn/thread-2123163-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2123163-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

## Custom Image API Skill： CodeX调用skill ，让只有 Chat 接口的工具间接调用图片模型

`该工具由AI生成，在CodeX做过测试完整可用。其他工具需要做一定的配置，根据相关工具的skill扩展来针对处理。`

### 一、背景：Chat 接口和图片接口不在同一条调用链上

很多 AI 工具的模型调用链默认面向对话模型，通常只会调用兼容 OpenAI 风格的：

`POST /chat/completions`
例如：中转平台提供了当前顶流图片生成模型， `gpt-image-2` 模型。但CodeX等工具无法直接使用。因为gpt-image-2 往往提供的是另一组 OpenAI 兼容接口：

`POST /images/generations
POST /images/edits`
这就导致：即使底层 provider 支持图片模型，上层工具也可能没有原生的图片请求入口，不能直接把一次对话调用转换为图片生成调用，更不能稳定地处理图片 URL、Base64 或图片二进制响应。

`custom-image-api` 的核心作用，就是在这两套协议之间提供一个轻量的桥接层：

`上层工具的自然语言请求
        -> 工具识别到图片生成指令
        -> Skill 或本地脚本
        -> OpenAI 兼容的 /images/generations 或 /images/edits
        -> 图片 URL/Base64/二进制响应
        -> 本地图片文件
        -> 返回给上层工具展示或继续处理`
因此，它不是把图片模型“伪装成 Chat 模型”，而是让原本只有 Chat 调用能力的工具，通过 Skill/插件或本地脚本间接调用图片专用接口。

### 二、它解决了什么问题

图片接口接入时，除了请求路径不同，还存在一组重复工作：

- 根据 Codex profile 找到模型和 provider；

- 拼接 `/images/generations` 或 `/images/edits` 接口地址；

- 从环境变量或 Codex 的 `auth.json` 读取认证信息；

- 生成请求使用 JSON，图片编辑请求使用 `multipart/form-data`；

- 兼容 URL、Base64、Data URI 和直接图片响应；

- 把返回的图片下载、解码、识别格式并保存到本地；

- 避免 API Key 出现在命令输出、错误信息和共享技能目录中。

`custom-image-api` 集中处理了这些协议细节。它是一套可被工具调用的适配 Skill。对于 Codex，它表现为 `custom-image-api` Skill；对于其他工具，也可以直接复用其中的 Python 脚本和配置约定。

从能力边界看，它把“上层只支持 Chat”与“底层支持图片接口”解耦了：

`上层工具：负责理解用户意图、触发 Skill、展示结果
                         |
                         v
桥接层：负责配置、认证、请求编码、响应解析、文件保存
                         |
                         v
图片 provider：负责真正的 image2 或其他图片模型推理`
这里的 `image2` 可以理解为图片模型的具体名称，例如某个 provider 上配置的 `gpt-image-2`；真正决定能否使用的，是 provider 是否暴露兼容的图片接口。

### 三、目录结构

`custom-image-api/
├── SKILL.md                    # Skill 的行为说明和调用约定
├── agents/
│   └── openai.yaml             # 在 Codex 中显示的名称、描述和默认提示词
├── references/
│   └── setup.md                # 可移植安装和配置说明
└── scripts/
    ├── generate_image.py       # 实际执行生成、编辑、下载和保存
    └── self_test.py             # 不访问网络的协议和兼容性测试`
其中最重要的是 `generate_image.py`。它使用 Python 标准库完成 HTTP 请求、TOML 配置读取、multipart 编码、Base64 解码和图片文件保存，因此没有额外的第三方 Python 依赖。

### 四、运行前提

需要满足以下条件：

- 已安装并启用支持个人 Skill 的 Codex。

- Python 3.11 或更高版本。脚本使用标准库 `tomllib` 读取 `config.toml`。

- 一个支持以下接口的 OpenAI 兼容图片服务：

`POST /images/generations`

- `POST /images/edits`

- 图片服务返回 URL、Base64、Data URI，或直接返回 `image/*` 响应。

### 五、CodeX安装 Skill

将完整的 `custom-image-api` 目录复制到个人 Skill 目录：

Windows：

`%USERPROFILE%\\.codex\\skills\\custom-image-api\\`
macOS/Linux：

`~/.codex/skills/custom-image-api/`
复制完成后，重新启动一个 Codex task，使 Skill 元数据重新加载。不要把 API Key、`auth.json`、个人 `config.toml`、生成图片或机器相关的绝对路径复制到 Skill 目录中。

### 六、配置 Codex

在 Codex 的 `config.toml` 中配置一个图片 provider 和 `custom-image` profile。示例：

`[model_providers.team-image]
name = "team-image"
base_url = "https://image-api.example.com/v1"
env_key = "TEAM_IMAGE_API_KEY"

[profiles.custom-image]
model_provider = "team-image"
model = "gpt-image-2"`
然后在本机设置 `TEAM_IMAGE_API_KEY` 环境变量。密钥不应写入 Skill、提示词或团队共享配置。

如果 provider 使用 Codex 已有的 OpenAI 认证，也可以配置：

`[model_providers.openai-image]
name = "openai-image"
base_url = "https://api.openai.com/v1"
requires_openai_auth = true

[profiles.custom-image]
model_provider = "openai-image"
model = "gpt-image-2"`
此时脚本会从 Codex 的 `auth.json` 读取已经保存的 `OPENAI_API_KEY`。脚本还兼容 `experimental_bearer_token`，但不建议在共享模板中使用，因为它会把凭据直接放进 `config.toml`。

#### Endpoint 地址如何解析

脚本会根据 `base_url` 自动得到最终接口：

`base_url`
生成接口
编辑接口

`https://host`

---

[查看原文](https://www.52pojie.cn/thread-2123163-1-1.html)
