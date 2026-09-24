---
title: "大某星球电影ts片段数据解析"
published: 2026-09-24
description: "之前写的了分享分享思路，写了就忘记忘记又回头写写没有进步，不知道下一步要去干什么 分析网页数据，知道我们要什么数据，我们要的是把视频下载下来，要怎么下载下来呢，在那个数据里面呢，我们要怎么去分析呢，其实就 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "qq196796483"
sourceLink: "https://www.52pojie.cn/thread-2129665-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2129665-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

之前写的了分享分享思路，写了就忘记忘记又回头写写没有进步，不知道下一步要去干什么

分析网页数据，知道我们要什么数据，我们要的是把视频下载下来，要怎么下载下来呢，在那个数据里面呢，我们要怎么去分析呢，其实就是一个流媒体的文件，但是这个文件要怎么实现下载呢，这些文件是什么呢，其实就是一个视频片段，每当你看到哪里就去请求下载，而不是一个大的数据包，例如你想呀，一个大的数据是不是要服务器承受很大的压力呢，所以把视频分成片段，分成ts流媒体的形式，进行分割，你看不到的地方在偷偷请求呢

本人不才排版不太会，凑合着看吧

本次要实现的是把ts片段下载下载，但是分为同步下载和异步下载而异步（协程或者多线程）本次使用是多线程，协程已经写好了，以及是有思路一点点，去问AI就好啦

本目的就交流，如果有啥问题可以删，废话少说，我的笨笨教程开始了

要请求的完整是https://dmxq0.com/vodplay/230633-3-1.html

本地的倒霉蛋

![](https://attach.52pojie.cn/forum/202609/24/090151r9j6792qfw61fxx9.png)

爬虫的基本步骤

明确自己想要的数据（我想要电影本地化）—— 数据分析（这个数据是怎么来的，以及有没有加密例如AEC加密，或者不是明文，本次没有加密，加密的话可以去研究解密，加油一起学习） —— 数据的请求（分析完毕之后就是写代码了）

一 分析数据的来源

为什么不写明确自己想要的数据呢因为脑子以及知道，我们想要的是实现本地化所以这个我就提一嘴

数据分析1

![](https://attach.52pojie.cn/forum/202609/24/091213cohkzabys9bpppbw.png)

继续分析

数据分析2

![](https://attach.52pojie.cn/forum/202609/24/091423dq6jwr0n0wt6hw9t.png)

那我们就请求网页拿到m3u8的视频链接

思路是这样子的

1.我先下载html实现到本地

[Python] *纯文本查看* *复制代码*
# 拿到网页内容并且保存到本地[/p]
[p=30, 2, left]import requests[/p]
[p=30, 2, left]headers = {
    "User-Agent" :  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0",
    "referrer" : "https://dmxq0.com/"
}[/p]
[p=30, 2, left]url = "https://dmxq0.com/vodplay/230633-3-1.html"
response = requests.get(url, headers=headers)
# 保存到本地
with open("output.html", "w", encoding="utf-8") as f:
    f.write(response.text)
    print("保存成功")

2.喂给ai说自己想要什么，因为里面有数据结构了，它解析数据结构就可以提取数据了常用的提取数据是正则表达式,BeautifulSoup,xpath，会自动去提取数据

[Python] *纯文本查看* *复制代码*
import requests
import re
import json
from bs4 import BeautifulSoup
from urllib.parse import urljoin[/p]
[p=30, 2, left]def extract_video_info(url, save_html=True, save_json=True):
    """
    从大米星球播放页提取视频信息（修复版）
    :param url: 播放页URL
    :param save_html: 是否保存原始HTML
    :param save_json: 是否保存提取结果为JSON
    :return: 结构化的视频信息字典
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0",
        "Referer": "https://dmxq0.com/",
        "Accept-Language": "zh-CN,zh;q=0.9"
    }[/p]
[p=30, 2, left]    # 1. 请求页面，增加异常处理
    try:
        response = requests.get(url, headers=headers, timeout=15)
        response.encoding = "utf-8"
        response.raise_for_status()
    except Exception as e:
        print(f"请求页面失败: {e}")
        return None[/p]
[p=30, 2, left]    html = response.text
    base_url = "https://dmxq0.com"[/p]
[p=30, 2, left]    # 可选：保存原始HTML
    if save_html:
        with open("output.html", "w", encoding="utf-8") as f:
            f.write(html)
        print("原始HTML已保存到 output.html")[/p]
[p=30, 2, left]    # 2. 核心：提取player_aaaa配置对象
    player_pattern = re.compile(r'var player_aaaa=({.*?})', re.S)
    player_match = player_pattern.search(html)
    if not player_match:
        print(" 未找到播放器配置信息")
        return None[/p]
[p=30, 2, left]    try:
        player_data = json.loads(player_match.group(1))
    except json.JSONDecodeError as e:
        print(f"解析播放器数据失败: {e}")
        return None[/p]
[p=30, 2, left]    # 3. 补充解析封面图
    pic_pattern = re.compile(r'player_aaaa\.vod_data\.vod_pic = "(.*?)";')
    pic_match = pic_pattern.search(html)
    if pic_match:
        player_data["vod_data"]["vod_pic"] = pic_match.group(1).replace("&amp;", "&")[/p]
[p=30, 2, left]    # 4. 初始化结果结构
    soup = BeautifulSoup(html, "html.parser")
    result = {
        "video_info": {
            "视频名称": player_data["vod_data"].get("vod_name", ""),
            "导演": player_data["vod_data"].get("vod_director", ""),
            "主演": [a.strip() for a in player_data["vod_data"].get("vod_actor", "").split(",") if a.strip()],
            "分类": [c.strip() for c in player_data["vod_data"].get("vod_class", "").split(",") if c.strip()],
            "封面": player_data["vod_data"].get("vod_pic", ""),
            "年份": "",
            "地区": "",
            "当前版本": "",
            "详情页": "",
        },
        "play_info": {
            "视频直链(m3u8)": player_data.get("url", ""),
            "播放源类型": player_data.get("from", ""),
            "是否加密": "是" if player_data.get("encrypt") == 1 else "否",
            "当前线路ID": player_data.get("sid", ""),
            "当前集数ID": player_data.get("nid", ""),
            "上一页": urljoin(base_url, player_data.get("link_pre")) if player_data.get("link_pre") else "",
            "下一页": urljoin(base_url, player_data.get("link_next")) if player_data.get("link_next") else "",
        },
        "all_sources": [],  # 所有播放线路
        "episodes": {}      # 各线路下的选集
    }[/p]
[p=30, 2, left]    # 5. 提取基础信息（增加容错）
    title_tag = soup.select_one("h1 a")
    if title_tag:
        result["video_info"]["详情页"] = urljoin(base_url, title_tag.get("href", ""))

    year_tag = soup.select_one(".module-info-item .module-info-tag-link")
    if year_tag and re.match(r'^\d{4}$', year_tag.text.strip()):
        result["video_info"]["年份"] = year_tag.text.strip()

    area_tag = soup.select_one(".module-info-item a[href*='area']")
    if area_tag:
        result["video_info"]["地区"] = area_tag.text.strip()[/p]
[p=30, 2, left]    current_ep_tag = soup.select_one(".module-player .module-play-list-link.active span")
    if current_ep_tag:
        result["video_info"]["当前版本"] = current_ep_tag.text.strip()[/p]
[p=30, 2, left]    # ---------------- 修复核心问题：收紧选择器范围 ----------------
    # 只在播放器容器内查找播放线路，避免选到页面其他无关tab
    player_container = soup.select_one(".module-player")
    if not player_container:
        print("未找到播放器容器")
        return result[/p]
[p=30, 2, left]    # 6. 提取所有真实播放线路（过滤无效项）
    tab_items = player_container.select(".module-tab-item.tab-item")
    for idx, item in enumerate(tab_items):
        # 提取线路名称，清理空白
        name_tag = item.select_one("span")
        source_name = name_tag.text.strip() if name_tag else ""

        # 过滤空名称的无效tab
        if not source_name:
            continue

        # 提取链接
        source_link = urljoin(base_url, item.get("href", ""))
        is_active = "active" in item.get("class", [])
        sid_match = re.search(r'-(\d+)-\d+\.html', source_link)
        sid = sid_match.group(1) if sid_match else str(idx+1)[/p]
[p=30, 2, left]        result["all_sources"].append({
            "线路名称": source_name,
            "线路ID": sid,
            "链接": source_link,
            "是否当前选中": is_active
        })[/p]
[p=30, 2, left]    # 7. 提取对应线路下的选集（只找播放器内的列表）
    play_lists = player_container.select(".tab-list.play-tab-list")
    for idx, play_list in enumerate(play_lists):
        if idx >= len(result["all_sources"]):
            break
        source_name = result["all_sources"][idx]["线路名称"]
        episodes = []
        for ep in play_list.select(".module-play-list-link"):
            ep_name_tag = ep.select_one("span")
            episodes.append({
                "版本名称": ep_name_tag.text.strip() if ep_name_tag else f"版本{len(episodes)+1}",
                "播放链接": urljoin(base_url, ep.get("href", "")),
                "是否当前选中": "active" in ep.get("class", [])
            })
        result["episodes"][source_name] = episodes[/p]
[p=30, 2, left]    # 8. 打印结果预览（增加容错，找不到key不崩溃）
    print("\n" + "="*50)
    print("视频信息提取完成")
    print("="*50)
    print(f"视频名称: {result['video_info']['视频名称']}")
    print(f"导演: {result['video_info']['导演']}")
    print(f"年份: {result['video_info']['年份']} | 地区: {result['video_info']['地区']}")
    print(f"当前版本: {result['video_info']['当前版本']}")
    print(f"播放直链: {result['play_info']['视频直链(m3u8)']}")
    print(f"可用线路数: {len(result['all_sources'])}")
    for source in result["all_sources"]:
        name = source["线路名称"]
        ep_count = len(result["episodes"].get(name, []))
        active_mark = "  当前选中" if source["是否当前选中"] else ""
        print(f"  - {name}: {ep_count}个版本{active_mark}")[/p]
[p=30, 2, left]    # 9. 保存结构化结果为JSON
    if save_json:
        with open("视频信息.json", "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        print("\n结构化数据已保存到 视频信息.json")[/p]
[p=30, 2, left]    return result[/p]
[p=30, 2, left]if __name__ == "__main__":
    target_url = "https://dmxq0.com/vodplay/230633-3-1.html"
    video_data = extract_video_info(target_url)

提取到的数据是

数据解析3

![](https://attach.52pojie.cn/forum/202609/24/092039ucqsiqojxdvzssvd.png)

这个就是我们想要的

请求的url https://vip.dytt-see.com/20260830/43779_2ddd93f4/index.m3u8

#EXTM3U

#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=800000,RESOLUTION=1920x1080

3000k/hls/mixed.m3u8

这个是响应数据

![](https://attach.52pojie.cn/forum/202609/24/092153gbiyd9dgcgoqzchq.png)

https://vip.dytt-see.com/20260830/43779_2ddd93f4/3000k/hls/mixed.m3u8得到

![](https://attach.52pojie.cn/forum/202609/24/092228yl7p27ohhnhm7u97.png)

流媒体的文件都会是这样子的形式

![](https://attach.52pojie.cn/forum/202609/24/092253hzdd2sallozq4s2b.png)

那完整的ts片段呢

![](https://attach.52pojie.cn/forum/202609/24/092322o7dfwfdgnwq4m4gn.png)

捋一下思路

请求https://vip.dytt-see.com/20260830/43779_2ddd93f4/index.m3u8

得到https://vip.dytt-see.com/20260830/43779_2ddd93f4/3000k/hls/mixed.m3u8

观察一下其实变化的是

https://vip.dytt-see.com/20260830/43779_2ddd93f4/  后面的可以投机取巧，替换就行，但是请求第一个很多视频网站会提供多个清晰度供选择，比如 360p、720p、1080p。

这些网站的入口 m3u8 文件不是直接列出 .ts 片段，而是列出"多个不同清晰度的媒体清单"。这种 m3u8 叫做 **Master Playlist（主播放列表）

一个典型的 Master Playlist 长这样：

#EXTM3U

#EXT-X-VERSION:3

#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=800000,RESOLUTION=1280x720

https://cdn.example.com/video/720p.m3u8

#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=1500000,RESOLUTION=1920x1080

https://cdn.example.com/video/1080p.m3u8

#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=500000,RESOLUTION=844x340

https://cdn.example.com/video/340p.m3u8

当前是RESOLUTION=1920x1080

好了到这里我们以及去了解到了怎么去找到流媒体文件

得到流媒体文件我们就是遍历拼接成完整的url进行全部单个片段的下载，下载之后用ffmpeg合并起来，也可以直接合并成.mp4的格式，但是好像是画面撕裂的问题，所以用第三方的ffmpeg进行合并起来就可以了，我也不想用ffmpeg合并起来呀，但是都推荐这个嘿嘿嘿

ffmpeg搜索怎么下载就有啦

最终代码是

[Python] *纯文本查看* *复制代码*
import requests
import os
import subprocess
from urllib.parse import urljoin
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm
import time[/p]
[p=30, 2, left]# ====================== 配置信息 ======================
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0",
    "Referer": "https://dmxq0.com/"
}[/p]
[p=30, 2, left]m3u8_url = "https://play.modujx16.com/20240928/wemjIpc9/2000kb/hls/index.m3u8"
output_video = "output.mp4"
temp_dir = "ts_temp"
max_workers = 8 # 开启8线程下载，适合大部分网络环境，过高可能导致被封IP[/p]
[p=30, 2, left]# 完全匹配你本地的FFmpeg路径
ffmpeg_dir = r"E:\工具\ffmpeg-8.1.2-essentials_build\bin"
ffmpeg_path = os.path.normpath(os.path.join(ffmpeg_dir, "ffmpeg.exe"))
ffprobe_path = os.path.normpath(os.path.join(ffmpeg_dir, "ffprobe.exe"))
# ======================================================[/p]
[p=30, 2, left]if not os.path.exists(temp_dir):
    os.makedirs(temp_dir)[/p]
[p=30, 2, left]def download_ts(ts_info):
    """下载单个ts片段，支持失败重试"""
    idx, ts_url, save_path = ts_info
    # 断点续传：小于1KB的损坏文件自动重下
    if os.path.exists(save_path) and os.path.getsize(save_path) > 1024:
        return True, idx

    for retry in range(3):
        try:
            response = requests.get(ts_url, headers=headers, timeout=30, stream=True)
            response.raise_for_status()
            with open(save_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
            return True, idx
        except Exception as e:
            if retry = 3:
                width = int(output[0])
                height = int(output[1])
                duration = float(output[2])
                return {"width": width, "height": height, "duration": duration}
    except Exception:
        pass
    return None[/p]
[p=30, 2, left]def merge_with_ffmpeg(ts_files, output_path):
    """V2优化版合并逻辑，彻底解决找不到文件、合并报错问题"""
    if not os.path.exists(ffmpeg_path):
        print(f"错误：未找到FFmpeg，请检查路径配置：{ffmpeg_path}")
        return False

    # 【核心修复1】concat列表全部使用绝对路径，彻底避免相对路径识别失败
    concat_list_path = os.path.normpath(os.path.abspath(os.path.join(temp_dir, "concat_list.txt")))
    with open(concat_list_path, "w", encoding="utf-8") as f:
        for ts_file in ts_files:
            full_ts_path = os.path.normpath(os.path.abspath(os.path.join(temp_dir, ts_file)))
            # 路径中的单引号自动转义，避免ffmpeg解析出错
            escaped_path = full_ts_path.replace("'", "\\'")
            f.write(f"file '{escaped_path}'\n")

    # 【核心修复2】移除cwd参数，全程使用脚本运行目录作为工作目录，避免路径错位
    try:
        cmd = [
            ffmpeg_path,
            "-y",
            "-f", "concat",
            "-safe", "0",
            "-i", concat_list_path,
            "-c", "copy",
            "-bsf:a", "aac_adtstoasc",  # 新增：修复TS转MP4后音频无法播放的常见问题
            "-movflags", "+faststart",
            output_path
        ]

        print("正在使用FFmpeg合并视频（流拷贝模式，无画质损失）...")
        # 【核心修复3】捕获完整stderr输出，Windows下用GBK兼容编码，错误信息不会乱码截断
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=False,
            errors="ignore"
        )

        # 自动适配Windows编码解析错误信息
        try:
            error_msg = result.stderr.decode("gbk", errors="ignore")
        except:
            error_msg = result.stderr.decode("utf-8", errors="ignore")

        if result.returncode != 0:
            print(f"FFmpeg合并失败，完整错误信息：\n{error_msg}")
            return False
        return True
    except Exception as e:
        print(f"调用FFmpeg出错：{str(e)}")
        return False[/p]
[p=30, 2, left]def main():
    print("="*50)
    print("V2优化版 m3u8 下载合并工具")
    print("="*50)

    # 第一步：获取并解析m3u8文件
    print("正在获取m3u8文件...")
    try:
        response = requests.get(m3u8_url, headers=headers, timeout=30)
        response.raise_for_status()
        m3u8_content = response.text
    except Exception as e:
        print(f"获取m3u8文件失败：{e}")
        return

    base_url = m3u8_url.rsplit('/', 1)[0] + '/'

    # 解析ts列表
    ts_list = []
    for line in m3u8_content.split('\n'):
        line = line.strip()
        if line and not line.startswith('#'):
            ts_list.append(line)

    if not ts_list:
        print("错误：未解析到任何ts片段")
        return

    print(f"共解析到 {len(ts_list)} 个ts片段")
    print(f"下载并发数: {max_workers}")
    print("="*50)

    # 构建下载任务列表
    download_tasks = []
    for idx, ts_filename in enumerate(ts_list):
        ts_full_url = urljoin(base_url, ts_filename)
        ts_save_path = os.path.normpath(os.path.abspath(os.path.join(temp_dir, f"{idx:05d}.ts"))) # 绝对路径，避免路径错位
        download_tasks.append((idx, ts_full_url, ts_save_path)) #

    # 第二步：多线程下载所有ts片段
    success_count = 0
    failed_list = []

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = [executor.submit(download_ts, task) for task in download_tasks]
        with tqdm(total=len(ts_list), desc="下载进度", unit="片段", ncols=80) as pbar:
            for future in as_completed(futures):
                success, idx = future.result() # 获取下载结果
                if success:
                    success_count += 1
                else:
                    failed_list.append(idx) # 记录失败的片段索引
                pbar.update(1) # 更新进度条

    # 重试失败的片段
    if failed_list:
        print(f"\n第一次下载完成：成功{success_count}个，失败{len(failed_list)}个，正在重试失败片段...")
        retry_success = 0
        for idx in failed_list:
            task = download_tasks[idx]
            success, _ = download_ts(task)
            if success:
                success_count += 1
                retry_success += 1
        print(f"重试完成：额外成功{retry_success}个")

    if success_count != len(ts_list):
        print(f"警告：仍有{len(ts_list) - success_count}个片段下载失败，合并后的视频可能不完整")
        confirm = input("是否继续合并？(y/n): ")
        if confirm.lower() != 'y':
            print("已取消合并，临时文件保留在ts_temp目录")
            return

    # 第三步：按顺序合并所有ts文件
    print("="*50)
    ts_files = sorted([f for f in os.listdir(temp_dir) if f.endswith('.ts')]) # 按文件名排序

    if len(ts_files) == 0:
        print("错误：没有找到已下载的ts文件")
        return

    merge_success = merge_with_ffmpeg(ts_files, os.path.normpath(os.path.abspath(output_video)))

    if not merge_success:
        print("合并失败，临时文件保留在ts_temp目录")
        return

    # 第四步：清理临时文件
    print("清理临时文件...")
    for ts_file in ts_files:
        try:
            os.remove(os.path.join(temp_dir, ts_file))
        except:
            pass
    try:
        os.remove(os.path.join(temp_dir, "concat_list.txt"))
        os.rmdir(temp_dir)
    except:
        pass

    # 第五步：输出视频信息
    print("="*50)
    print("视频处理完成！")
    print(f"文件保存路径: {os.path.abspath(output_video)}")

    # 计算文件大小
    file_size = os.path.getsize(output_video)
    if file_size  0 else f"{minutes}分{seconds}秒"

        print(f"视频分辨率: {width}x{height}", end="")
        if width == 1920 and height == 1080:
            print(" (1080P 全高清)")
        elif width == 3840 and height == 2160:
            print(" (4K 超高清)")
        elif width == 1280 and height == 720:
            print(" (720P 高清)")
        else:
            print()
        print(f"视频时长: {duration_str}")
    print("="*50)[/p]
[p=30, 2, left]if __name__ == "__main__":
    main()

你们可以改成协程的形式比较快

这个是我借助ai写然后去调试修改的，里面的代码我都理解了，所以才发出来和大家分析哪里不会可以提出来一起学习

![](https://attach.52pojie.cn/forum/202609/24/092656mvrb3g9o9r99fgs8.png)

这个是我一步步实现的思路

其实现在我的学习模式是

GitHub找开源代码，在开源代码的基础上捋清楚思路，借助ai一步步去理解，但是老是研究一半就不想研究了，本次方向给大家的是思路大家可以去试一下

最终成果

---

[查看原文](https://www.52pojie.cn/thread-2129665-1-1.html)
