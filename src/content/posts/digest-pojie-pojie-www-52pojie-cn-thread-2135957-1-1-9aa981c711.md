---
title: "最近折腾各种相册，用脚本把windows壁纸定时换成bing图片"
published: 2026-11-05
description: "也算是突发奇想，虽然固定的照片肯定是自己喜欢的，但是随机获取bing当天的照片再设置为壁纸也不错，毕竟bing的照片质量都不差 bing有接口可以直接获取图片：https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN 返回 JSON，id"
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "fdsuf4"
sourceLink: "https://www.52pojie.cn/thread-2135957-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2135957-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

也算是突发奇想，虽然固定的照片肯定是自己喜欢的，但是随机获取bing当天的照片再设置为壁纸也不错，毕竟bing的照片质量都不差

bing有接口可以直接获取图片：https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN

返回 JSON，idx=0 表示今日，可拼出 1920×1080 或 UHD 高清图地址。

[Asm] *纯文本查看* *复制代码*
import os, requests, ctypes

def main():
    api = "https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN"
    headers = {"User-Agent": "Mozilla/5.0"}
    data = requests.get(api, headers=headers, timeout=10).json()
    img = data["images"][0]

    # 拼高清图（也可用 _UHD.jpg 拿 4K）
    url = f"https://cn.bing.com{img['urlbase']}_1920x1080.jpg"

    save_dir = os.path.join(os.path.expanduser("~"), "Pictures", "BingWallpaper")
    os.makedirs(save_dir, exist_ok=True)
    path = os.path.join(save_dir, img["startdate"] + ".jpg")

    r = requests.get(url, headers=headers, timeout=30)
    with open(path, "wb") as f:
        f.write(r.content)

    # 设置桌面壁纸（SPI_SETDESKWALLPAPER=20）
    ctypes.windll.user32.SystemParametersInfoW(20, 0, path, 3)
    print("已更新壁纸:", path, "|", img.get("copyright", ""))

if __name__ == "__main__":
    main()

脚本保存为.py格式，然后设置为windows的定时任务，我的电脑中午休息肯定是不关机+空闲状态，就在12点后更新就行了

设置定时任务也可以试试以下命令，我是手动设置的：

schtasks /create /tn "更新Bing壁纸" /tr "\"C:\Python311\python.exe\" D:\scripts\setBing.py" /sc daily /st 12:20

注意修改python.exe和脚本为你自己的路径

---

[查看原文](https://www.52pojie.cn/thread-2135957-1-1.html)
