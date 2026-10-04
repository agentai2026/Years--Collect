---
title: "腾讯天御过滑块"
published: 2026-10-03
description: "目标站点，https://vip.meijiehezi.com/index/login/login 页面登陆校验逻辑 打开登录页 → 页面加载验证码相关 JS、采集电脑 / 浏览器指纹 → 弹出滑块 → 拖动滑块到位置 → 浏览器算出算力证明、上报给腾讯天御服务器校验 → 天御返回合法票据（ticket ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "wabc666"
sourceLink: "https://www.52pojie.cn/thread-2130817-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2130817-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

目标站点，[https://vip.meijiehezi.com/index/login/login](https://vip.meijiehezi.com/index/login/login)

页面登陆校验逻辑

打开登录页 → 页面加载验证码相关 JS、采集电脑 / 浏览器指纹 → 弹出滑块 → 拖动滑块到位置 → 浏览器算出算力证明、上报给腾讯天御服务器校验 → 天御返回合法票据（ticket） → 把账号密码 + 票据 + CSRF 令牌一起提交网站登录接口 → 服务器校验通过，下发 Cookie 会话，跳转后台首页，登录成功

实现流程

c.get(LOGIN_PAGE)：访问登录页，拿到__token__和会话 Cookiecap_union_prehandle：初始化腾讯验证码会话，拿到图片地址、滑块参数、PoW 题目下载滑块图、背景图solve_gap()：图像算法算出滑块缺口 X 坐标solve_pow()：穷举算出 PoW 答案cap_union_new_verify：提交滑块坐标 + PoW 答案给腾讯，校验通过拿到ticket当前代码：提交账号密码 + ticket 给媒介盒子，**登录账号**

协议方式过滑块直接实现登陆

[Asm] *纯文本查看* *复制代码*
#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
纯 HTTP完成 媒介盒子 登录 + 腾讯滑块 TCaptcha v2
"""

import base64
import hashlib
import http.cookiejar
import io
import json
import random
import re
import time
import urllib.parse
import urllib.request
import numpy as np
from PIL import Image

SITE = "https://vip.meijiehezi.com"#媒介盒子的主站点域名
API = "https://turing.captcha.qcloud.com"#腾讯云验证码（TCaptcha）服务域名
AID = "190824934"#媒介盒子在腾讯验证码后台申请的项目 ID
LOGIN_PAGE = SITE + "/index/login/login.html"
LOGIN_API = SITE + "/index/login/login_by_username_p.html"

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36")

#简易版 requests
class Client:
    def __init__(self):
        self.cj = http.cookiejar.CookieJar()
        self.opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(self.cj))

    def request(self, url, data=None, headers=None, method=None):
        h = {"User-Agent": UA, "Accept-Language": "zh-CN,zh;q=0.9"}
        if headers:
            h.update(headers)
        body = None
        if data is not None:
            body = urllib.parse.urlencode(data).encode()
            h.setdefault("Content-Type", "application/x-www-form-urlencoded")
        req = urllib.request.Request(url, data=body, headers=h, method=method)
        with self.opener.open(req, timeout=25) as r:
            return r.read()

    def get(self, url, headers=None):
        return self.request(url, None, headers)

    def post(self, url, data, headers=None):
        return self.request(url, data, headers)

#图像算法，自动找出滑块验证码里缺口的横向坐标 X
def solve_gap(sprite_img, bg_img, sprite_pos, tile_size, init_pos):
    sx, sy = sprite_pos
    tw, th = tile_size
    px, py = init_pos

    sp = np.asarray(sprite_img.convert("RGBA"))
    alpha = sp[sy:sy + th, sx:sx + tw, 3]
    mask = alpha > 128

    # 轮廓点（4 邻域里有背景像素的掩膜像素）
    inside = mask
    nb = np.zeros_like(mask)
    nb[1:, :] |= ~mask[:-1, :]
    nb[:-1, :] |= ~mask[1:, :]
    nb[:, 1:] |= ~mask[:, :-1]
    nb[:, :-1] |= ~mask[:, 1:]
    outline = np.argwhere(inside & nb)          # [(v,u), ...]
    vs, us = outline[:, 0], outline[:, 1]

    gray = np.asarray(bg_img.convert("L")).astype(np.float64)
    H, W = gray.shape
    gx = np.zeros_like(gray)
    gy = np.zeros_like(gray)
    gx[:, 1:-1] = (gray[:, 2:] - gray[:, :-2]) / 2.0
    gy[1:-1, :] = (gray[2:, :] - gray[:-2, :]) / 2.0
    edge = np.hypot(gx, gy)

    ys = py + vs
    ok = (ys >= 0) & (ys = 0) & (xs = 0) & (iy = 0) & (xs ", resp[:300])
    try:
        vr = json.loads(resp)
    except Exception:
        print("    响应不可解析"); return
    print("    errorCode =", vr.get("errorCode"))

    # ---- 7. 登录 ----
    lr = c.post(LOGIN_API, {
        "username": user, "password": pwd,
        "ticket": vr["ticket"], "randstr": vr["randstr"], "__token__": token,
    }, {"Referer": LOGIN_PAGE, "Origin": SITE}).decode("utf-8", "replace")
    print("[7] login ->", lr[:300])
    try:
        lj = json.loads(lr)
        print("\n结论：纯 HTTP 登录 %s  code=%s msg=%s" %
              ("成功" if lj.get("code") == 200 else "失败", lj.get("code"), lj.get("msg")))
    except Exception:
        pass

if __name__ == "__main__":
    main()

---

[查看原文](https://www.52pojie.cn/thread-2130817-1-1.html)
