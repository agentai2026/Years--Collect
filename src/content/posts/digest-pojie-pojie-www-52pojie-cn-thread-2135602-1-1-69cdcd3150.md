---
title: "我宣布了自己死亡--github生命监测"
published: 2026-11-03
description: "[md]前一段时间死了么app火了一阵，没想到这么快我就要用上了。作者也得了绝症，也将不久人世，再见了~（无需过问） 自己简单搓了一个非app的，使用github action每天更新状态，action workflow可手动签到或死亡，死亡 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "jockon"
sourceLink: "https://www.52pojie.cn/thread-2135602-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2135602-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

前一段时间死了么app火了一阵，没想到这么快我就要用上了。作者也得了绝症，也将不久人世，再见了~（无需过问）

自己简单搓了一个非app的，使用github action每天更新状态，action workflow可手动签到或死亡，死亡后自动更新README.md在自己的主页上。

![](https://static.52pojie.cn/static/image/common/none.gif)

**Snipaste_20261103_175250.png** *(41.87 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg5MTAyOHw1NTE5YzBkZXwxNzkzNzY0MzA1fDB8MjEzNTYwMg%3D%3D&nothumb=yes)

2026-11-3 17:53 上传

[b]存活判定方式：

- workflow 手动签到；

- 任务每天执行，7天内没签到默认存活；

![](https://static.52pojie.cn/static/image/common/none.gif)

**活着.png** *(23.04 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg5MTAyOXxkNWM3MzI3MXwxNzkzNzY0MzA1fDB8MjEzNTYwMg%3D%3D&nothumb=yes)

2026-11-3 18:03 上传

[b]死亡判定方式：

1.超过7天未手动签到即宣布死亡。

2.手动执行 workflow 立即死亡。

![](https://static.52pojie.cn/static/image/common/none.gif)

**死亡.png** *(64.53 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg5MTAzMHxiMDk0ZDE3ZHwxNzkzNzY0MzA1fDB8MjEzNTYwMg%3D%3D&nothumb=yes)

2026-11-3 18:04 上传

死亡后：

更新首页README，宣布死亡消息（没了）。

因每个人的信息不同,需要修改成自己的，项目名用自己的用户名（这样可以显示在自己主页上）

[https://github.com/Zhu-junwei/Zhu-junwei/](https://github.com/Zhu-junwei/Zhu-junwei/)

自动任务 life-monitor.yml

`name: Life Monitor

on:
  schedule:
    - cron: '00 19 * * *'
  workflow_dispatch:
    inputs:
      mode:
        description: '选择运行模式'
        required: true
        type: choice
        options:
          - 签到
          - 死亡

jobs:
  monitor:
    runs-on: ubuntu-24.04
    permissions:
      contents: write

    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Setup Python
        uses: actions/setup-python@v7.1.0
        with:
          python-version: '3.13'

      - name: Run life monitor
        run: |
          MODE="${{ github.event.inputs.mode }}"
          if [ "$MODE" = "签到" ]; then
            python life_monitor.py
          elif [ "$MODE" = "死亡" ]; then
            python life_monitor.py --force-death
          else
            # 定时触发：只检查不签到，超过7天自动宣告死亡
            python life_monitor.py --auto
          fi

      - name: Commit and push
        run: |
          MODE="${{ github.event.inputs.mode }}"
          MSG="${MODE:-自动签到}"
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add README.md .last_run
          git diff --cached --quiet || git commit -m "life monitor: $MSG"
          git push`
死亡逻辑life_monitor.py

`#!/usr/bin/env python3
"""生命监测系统"""

import os
import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATE_FILE = os.path.join(BASE_DIR, ".last_run")
README_PATH = os.path.join(BASE_DIR, "README.md")

MAX_DAYS = 7
BIRTH_DATE = datetime.date(1995, 4, 23)
BJ = datetime.timezone(datetime.timedelta(hours=8))

def read_last_run():
    if not os.path.exists(STATE_FILE):
        return None
    try:
        with open(STATE_FILE, "r", encoding="utf-8") as f:
            raw = f.read().strip()
        dt = datetime.datetime.fromisoformat(raw)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=BJ)
        return dt
    except Exception:
        return None

def write_last_run(dt):
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        f.write(dt.isoformat())

def now():
    return datetime.datetime.now(BJ)

def generate_alive_content(last_run, days, scan_time):
    lines = [
        f"🟢 上次存活时间: {last_run.strftime('%Y-%m-%d %H:%M:%S')} (UTC+8)",
        "",
        f"更新时间: {scan_time.strftime('%Y-%m-%d %H:%M:%S')} (UTC+8)",
    ]
    return "\n".join(lines)

def generate_obituary_content(last_run, days, scan_time, force_death=False):
    birth = BIRTH_DATE
    if force_death:
        # 手动确认死亡：死亡日期为当前扫描日期，保留真实最后存活时间
        death_date = scan_time.date()
        death_detail = ""
        death_reason = "手动确认死亡。"
        days_line = f"> **距上次执行**: {days} 天"
    else:
        # 自动判定死亡：超过阈值，估算死亡日期
        death_date = (last_run + datetime.timedelta(days=MAX_DAYS)).date()
        death_detail = f"（最后手动执行后第 {MAX_DAYS} 天（估算））"
        death_reason = f"超过 {MAX_DAYS} 天未检测到生命体征，按协议发布讣告。"
        days_line = f"> **距上次执行**: {days} 天"
    age = death_date.year - birth.year - ((death_date.month, death_date.day)  MAX_DAYS:
            print(f"⚠️  距上次手动执行已过去 {days} 天，超过 {MAX_DAYS} 天阈值！")
            content = generate_obituary_content(last_run, days, scan_time, force_death)
        else:
            print(f"✅ 距上次手动执行 {days} 天，在 {MAX_DAYS} 天阈值内。")
            content = generate_alive_content(last_run, days, scan_time)

    with open(README_PATH, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"📝 README.md 已更新")
    print(f"   间隔: {days} 天 | 模式: {'自动检查' if auto_mode else ('强制死亡' if force_death else '手动打卡')}")
    print(f"   状态: {'讣告' if last_run and days > MAX_DAYS else '正常'}")

if __name__ == "__main__":
    run()`

---

[查看原文](https://www.52pojie.cn/thread-2135602-1-1.html)
