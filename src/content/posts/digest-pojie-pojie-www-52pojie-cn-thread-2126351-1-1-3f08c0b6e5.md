---
title: "植物大战僵尸重制版MOD，自动收集场上所有阳光"
published: 2026-09-04
description: "[md]一个基于 \\\\[MelonLoader\\\\]的 Mod： **自动收集场上所有阳光/硬币，并让你随时切换「算给玩家 1 还是玩家 2」**。 收阳光发生在游戏逻辑层、**完全不占用你的鼠标**，放植物时不会冲突。 我做这个的原因就是我和女朋友打植物大战僵尸双人模式的时候阳光收集不过 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "旧梦多故人"
sourceLink: "https://www.52pojie.cn/thread-2126351-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2126351-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

一个基于 [MelonLoader]的 Mod：

**自动收集场上所有阳光/硬币，并让你随时切换「算给玩家 1 还是玩家 2」**。

收阳光发生在游戏逻辑层、**完全不占用你的鼠标**，放植物时不会冲突。

我做这个的原因就是我和女朋友打植物大战僵尸双人模式的时候阳光收集不过来，打到30关的

时候就来不及收集阳光了，而且鼠标点点点特别累，手柄光标划过去就自动收了。

后面找了一个开源的MOD，但是它只能把阳光自动收给我，玩家2收不到。所以就在AI的帮助下开发了这个MOD。

[1076383223/AutoCollect-Toggle: 植物大战僵尸：重植版，双人模式下自动化拾取阳光不用点点点。并且可以快捷切换自动收取给玩家1还是玩家2。](https://github.com/1076383223/AutoCollect-Toggle)

### **安装（最简单，推荐普通玩家）**

-
**装好 MelonLoader**（图形安装器）： [https://github.com/LavaGang/MelonLoader.Installer](https://github.com/LavaGang/MelonLoader.Installer)

运行安装器 → 选中你的游戏启动路径 `Replanted.exe`（游戏启动路径：Replanted.exe） → 点 Install。

-
**首次启动一次游戏**，让 MelonLoader 生成好运行环境（会自动装 .NET 6 的）。

-
到本仓库的 **发行版** 页面，下载 `AutoCollect.dll`。

-
把 `AutoCollect.dll` 丢进游戏目录下的 `Mods\` 文件夹，例如：

`\PvZ Replanted\Mods\AutoCollect.dll
`

-
重启游戏即可。

>
:warning: 如果你之前装过**其它**自动收阳光 Mod（例如 SAutoCollectMod），请把它从 `Mods\` 里

删掉或改名（如 `SAutoCollectMod.dll.bak`），否则会有**两个收集器同时收**，导致异常。

本项目是基于开源项目的修改而来，原版只能自动收阳光给玩家1我写的核心逻辑

逻辑 1：自动收阳光的注入点（BoardUpdatePatch.cs）

原版游戏每帧在 Board.Update() 里维护阳光币（Coin）。我用 Harmony 在它之后挂了个 Postfix（第 8-9 行：[HarmonyPatch(typeof(Board), "Update")] Postfix），每帧扫描 board.m_coins（第 22 行），对每一枚还没被收、没死的币直接调 coin.Collect(...)（第 35 行）。

逻辑 2：目标玩家可切换（这是相对原版最大的「我生成的逻辑」）

ModEntry.cs 里用 static int _targetPlayer（第 13 行，0=玩家1 / 1=玩家2）存当前目标。

暴露成 public static int TargetPlayer => _targetPlayer;（第 67 行），供补丁读取。

切换入口两个：OnGUI() 左上角按钮（第 46-57 行）+ OnUpdate() 监听 F9（第 38-44 行），都调 ToggleTarget()（第 59-64 行）翻转 0/1 并写回 MelonPrefs。

补丁里把原版**写死的 Collect(0)（永远玩家1）**改成了 coin.Collect(ModEntry.TargetPlayer)（第 35 行）——这就是「目标可切换」的关键一行。

逻辑 3：安全护栏（防止误收不该自动收的东西）

挑战关进行中直接 return（第 14-17 行，mChallengeState > Normal）。

关卡已通关/已发奖/淡出中不收（第 19-20 行，flag6）。

coins == null 防崩（第 23 行）。

跳过种子包和礼物植物：CoinType.UsableSeedPacket or CoinType.PresentPlant 时 return（第 29-32 行）——这类币是玩家要主动选的，不该被自动抢收。

逻辑 4：状态持久化

OnInitializeMelon()（第 20-36 行）用 MelonPreferences.CreateCategory + CreateEntry 把目标玩家写进 UserData/MelonPreferences.cfg，重启游戏记住上次选的玩家。然后从 cfg 读回 _targetPlayer，并对非法值兜底成 0（第 29 行）。

构建/部署链（AutoCollect.csproj + build.bat）

csproj 8 个引用全指向 $(GameDir)\MelonLoader... 下 MelonLoader 首次启动生成的 DLL（0Harmony / Assembly-CSharp / MelonLoader / UnityEngine.*），不随仓库分发（csproj 第 22-48 行）。

build.bat：dotnet build -c Release -p:GameDir=...（第 15 行）→ 把 bin\Release\net6.0\AutoCollect.dll 拷进游戏 Mods\（第 36 行）→ 自动把旧 SAutoCollectMod.dll 改名备份避免双收集器冲突（第 31-34 行）。

---

[查看原文](https://www.52pojie.cn/thread-2126351-1-1.html)
