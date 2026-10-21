---
title: "系统屏保翻页时钟"
published: 2026-10-19
description: "翻页时钟 https://wwbmj.lanzouu.com/iq9jN4co2sfg 密码:ggfw 更新了下,把设置等待时间进入屏保一起加进去,省的还要再开系统屏保设置时间. 更新了天气,自定义颜色....主打一个听劝. ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "再贱就再见"
sourceLink: "https://www.52pojie.cn/thread-2133257-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2133257-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

翻页时钟

![](https://static.52pojie.cn/static/image/common/none.gif)

**333333.png** *(48.97 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4NzQxMXw2NzA1NThmOHwxNzkyNTQ1Mjg0fDB8MjEzMzI1Nw%3D%3D&nothumb=yes)

2026-10-20 12:49 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**5555555555.png** *(42.13 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4NzM5MnxjYWZlNjcyOHwxNzkyNTQ1Mjg0fDB8MjEzMzI1Nw%3D%3D&nothumb=yes)

2026-10-20 12:10 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**22222222.png** *(50.83 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4NzMzMnxhYTlhN2NiZnwxNzkyNTQ1Mjg0fDB8MjEzMzI1Nw%3D%3D&nothumb=yes)

2026-10-20 08:33 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**111111.png** *(52.58 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4NzMzMXw4YzM4N2JiNnwxNzkyNTQ1Mjg0fDB8MjEzMzI1Nw%3D%3D&nothumb=yes)

2026-10-20 08:33 上传

https://wwbmj.lanzouu.com/iq9jN4co2sfg

密码:ggfw

更新了下,把设置等待时间进入屏保一起加进去,省的还要再开系统屏保设置时间.

更新了天气,自定义颜色....

![](https://static.52pojie.cn/static/image/smiley/default/2.gif)

主打一个听劝....

更新了可以自定义视频图片.....

更新后要重新应用到系统屏保,要不然还是旧的

翻转时钟屏保

====================

设置：字体、日期、农历、12/24小时、秒、时间/日期/午别大小。

12小时制：上午/下午在小时块上方、与小时左边缘对齐。

「应用」写入注册表 HKCU\Software\FliqloClockC（不生成 config.ini）。

「删除配置」清除该注册表项并恢复默认。

「应用到系统屏保」复制为 %WINDIR%\FliqloClockC.scr 并设为当前屏保（可能弹出提权）。

退出：Esc / Q / 鼠标移动或点击。

[C] *纯文本查看* *复制代码*
   1| /* Fliqlo-style flip clock screensaver — pure C Win32 GDI
   2|  * Double-click / no args: settings.  /s : screensaver.  /c : settings.
   3|  */
   4| #ifndef UNICODE
   5| #define UNICODE
   6| #endif
   7| #ifndef _UNICODE
   8| #define _UNICODE
   9| #endif
  10| #define WIN32_LEAN_AND_MEAN
  11| #include
  12| #include
  13| #include
  14| #include
  15| #include
  16| #include
  17| #include
  18| #include
  19| #include
  20| #include
  21| #include "lunar.h"
  22|
  23| #ifndef CLEARTYPE_NATURAL_QUALITY
  24| #define CLEARTYPE_NATURAL_QUALITY 5
  25| #endif
  26|
  27| #ifndef max
  28| #define max(a,b) (((a)>(b))?(a):(b))
  29| #define min(a,b) (((a) 200) g_cfg.time_scale = 200;
 176|     if (g_cfg.date_scale  300) g_cfg.date_scale = 300;
 178|     if (g_cfg.ampm_scale  300) g_cfg.ampm_scale = 300;
 180|     RegCloseKey(hk);
 181| }
 182|
 183| static void reg_write_dword(HKEY hk, const wchar_t *name, int v) {
 184|     DWORD val = (DWORD)v;
 185|     RegSetValueExW(hk, name, 0, REG_DWORD, (const BYTE *)&val, sizeof(val));
 186| }
 187|
 188| static void save_config(void) {
 189|     /* Persist to HKCU registry only — never create config.ini beside exe */
 190|     HKEY hk = NULL;
 191|     DWORD disp = 0;
 192|     if (RegCreateKeyExW(HKEY_CURRENT_USER, REG_SUBKEY, 0, NULL, 0,
 193|                         KEY_WRITE, NULL, &hk, &disp) != ERROR_SUCCESS)
 194|         return;
 195|     RegSetValueExW(hk, L"font_family", 0, REG_SZ,
 196|                    (const BYTE *)g_cfg.font_family,
 197|                    (DWORD)((wcslen(g_cfg.font_family) + 1) * sizeof(wchar_t)));
 198|     reg_write_dword(hk, L"show_date", g_cfg.show_date);
 199|     reg_write_dword(hk, L"show_lunar", g_cfg.show_lunar);
 200|     reg_write_dword(hk, L"show_seconds", g_cfg.show_seconds);
 201|     reg_write_dword(hk, L"hour_format", g_cfg.hour_format);
 202|     reg_write_dword(hk, L"time_scale", g_cfg.time_scale);
 203|     reg_write_dword(hk, L"date_scale", g_cfg.date_scale);
 204|     reg_write_dword(hk, L"ampm_scale", g_cfg.ampm_scale);
 205|     RegCloseKey(hk);
 206|     (void)g_config_path;
 207| }
 208|

---

[查看原文](https://www.52pojie.cn/thread-2133257-1-1.html)
