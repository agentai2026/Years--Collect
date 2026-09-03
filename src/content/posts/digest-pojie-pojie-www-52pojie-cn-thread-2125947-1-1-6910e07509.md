---
title: "给cppcryptfs增加Xchacha20-poly1305算法"
published: 2026-09-02
description: "[hr][md]&#129300;Cppcryptfs是基于gocryptfs设计的，但是由于调用的库迟迟不添加Xchacha20-poly1305，所以没有加入Xchacha20-poly1305；我给手动添加上了。 ## 截图 ## 部分代码 ``` #include \\\"stdafx.h\\\" #include #"
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "风之暇想"
sourceLink: "https://www.52pojie.cn/thread-2125947-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2125947-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

🤔Cppcryptfs是基于gocryptfs设计的，但是由于调用的库迟迟不添加Xchacha20-poly1305，所以没有加入Xchacha20-poly1305；我给手动添加上了。

### 截图

![](https://static.52pojie.cn/static/image/common/none.gif)

**Cppcryptfs.png** *(63.31 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3NjE2OXw0NjIwOTdlNnwxNzg4NDA0NTI0fDB8MjEyNTk0Nw%3D%3D&nothumb=yes)

2026-9-2 13:30 上传

### 部分代码

`#include "stdafx.h"

#include
#include

#include "chacha20.h"

static void chacha20_quarter_round(uint32_t s[16], int a, int b, int c, int d)
{
        s[a] += s[b]; s[d] ^= s[a]; s[d] = (s[d] > 16);
        s[c] += s[d]; s[b] ^= s[c]; s[b] = (s[b] > 20);
        s[a] += s[b]; s[d] ^= s[a]; s[d] = (s[d] > 24);
        s[c] += s[d]; s[b] ^= s[c]; s[b] = (s[b] > 25);
}

static void wipe_words(uint32_t *p, int n)
{
        volatile uint32_t *v = p;
        while (n--)
                *v++ = 0;
}

void hchacha20(const unsigned char key[32], const unsigned char nonce[16], unsigned char out[32])
{
        static const uint32_t constant[4] = {
                0x61707865, 0x3320646e, 0x79622d32, 0x6b206574
        };

        uint32_t state[16];

        state[0] = constant[0];
        state[1] = constant[1];
        state[2] = constant[2];
        state[3] = constant[3];

        for (int i = 0; i

### 开源地址

[https://github.com/fzxx/cppcryptfs](https://github.com/fzxx/cppcryptfs)

---

[查看原文](https://www.52pojie.cn/thread-2125947-1-1.html)
