---
title: "LOL 大乱斗换人助手 - 没有手速，全是科技！"
published: 2026-09-18
description: "[md]# 大乱斗换人别拼手速！一个小工具，看中谁，点一下就换！ 兄弟们，大乱斗最痛苦的瞬间是什么？ 不是被分到亚索，而是替补席明明躺着一个“救世主”，刚准备点击——没了。 只能默默感慨一句：卧槽，哥们 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "PJlay"
sourceLink: "https://www.52pojie.cn/thread-2128811-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2128811-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

## 大乱斗换人别拼手速！一个小工具，看中谁，点一下就换！

兄弟们，大乱斗最痛苦的瞬间是什么？

不是被分到亚索，而是替补席明明躺着一个“救世主”，刚准备点击——没了。

只能默默感慨一句：卧槽，哥们手速真快!

所以我做了个小工具：**ARAM Picker（大乱斗换人助手）**。

![](https://static.52pojie.cn/static/image/common/none.gif)

**屏幕截图 2026-08-19 210034.png** *(1.06 MB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4MDA5OHwyYTg5NzFlZnwxNzg5NzgwODU5fDB8MjEyODgxMQ%3D%3D&nothumb=yes)

1

2026-9-18 23:14 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**422f119dbbc7906de039c0b7651b9d4d.png** *(1005.5 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4MDA5OXw3N2ZkODQ0OXwxNzg5NzgwODU5fDB8MjEyODgxMQ%3D%3D&nothumb=yes)

2

2026-9-18 23:15 上传

### 功能介绍

- 自动检测英雄联盟客户端

- 自动接受对局（可关闭）

- 自动识别大乱斗选人阶段

- 显示当前英雄、替补席英雄和倒计时

- 点击替补英雄即可发起交换

- 遇到交换冷却时自动等待并重试

- 目标英雄被队友换走后自动取消等待

- 支持可选的自动接受对局

- 进入选人阶段自动置顶窗口

- 英雄名称优先读取客户端中文数据

### 使用方法

- 启动英雄联盟客户端和本工具

- 进入大乱斗选人阶段

- 在左侧列表点击想交换的英雄

- 等待交换完成，开始快乐游戏

### 注意事项

本代码没有明显的注入型外挂行为，只通过本机英雄联盟客户端的 LCU 接口读取选人状态，调用替补交换和自动接受对局接口。

理论上不会封号，但凡事没有绝对，所以大家使用前请自行评估封号风险（我个人测试了挺久，都是没问题的）

如果你也经历过“想换的英雄永远在队友手里”，欢迎试试。

愿大家每局都能换到心仪英雄，少玩折磨阵容，多玩快乐大乱斗

完整源码：**https://github.com/lay-codes/aram-picker**

赠人玫瑰，手有余香。方便的话，感谢各位大佬，帮忙点个星，万分感谢！

exe（下载链接已省略，请看原文） 密码:52pj

关键代码：

[Python] *纯文本查看* *复制代码*
import json
import os
import threading
from pathlib import Path
import psutil
import requests
from urllib3.exceptions import InsecureRequestWarning
requests.packages.urllib3.disable_warnings(InsecureRequestWarning)

class LCUConnector:
    """连接本机英雄联盟客户端接口。"""

    def __init__(self):
        self.port = None
        self.auth_token = None
        self.base_url = None
        self.session = None
        self._http_lock = threading.Lock()

    @property
    def connected(self):
        return self.session is not None

    def connect(self):
        return self._try_lockfile() or self._try_process_args()

    def _try_lockfile(self):
        paths = []
        for process in psutil.process_iter(["name", "exe"]):
            try:
                name = process.info.get("name") or ""
                executable = process.info.get("exe")
                if name.startswith("LeagueClient") and executable:
                    paths.append(Path(executable).parent / "lockfile")
            except (psutil.Error, OSError):
                continue

        for env_name in ("LOCALAPPDATA", "PROGRAMFILES", "PROGRAMFILES(X86)"):
            base = os.environ.get(env_name)
            if base:
                paths.append(Path(base) / "Riot Games" / "LeagueClient" / "lockfile")

        for path in dict.fromkeys(paths):
            try:
                # 锁文件的端口和令牌分别在第三、第四段
                parts = path.read_text(encoding="utf-8").strip().split(":")
                if len(parts)  0 and name:
                names[champion_id] = str(name)
        if names:
            self.name_map = names
        return bool(names)

    def _fetch_datadragon(self):
        try:
            versions_response = requests.get(
                "https://ddragon.leagueoflegends.com/api/versions.json", timeout=10
            )
            versions_response.raise_for_status()
            versions = versions_response.json()
            if not versions:
                return False

            champions_response = requests.get(
                "https://ddragon.leagueoflegends.com/cdn/"
                f"{versions[0]}/data/zh_CN/champion.json",
                timeout=10,
            )
            champions_response.raise_for_status()
            champions = champions_response.json()["data"].values()
            self.name_map = {
                int(champion["key"]): champion["name"] for champion in champions
            }
            return bool(self.name_map)
        except (requests.RequestException, KeyError, TypeError, ValueError):
            return False

    def get_name(self, champion_id):
        return self.name_map.get(champion_id, f"英雄#{champion_id}")

---

[查看原文](https://www.52pojie.cn/thread-2128811-1-1.html)
