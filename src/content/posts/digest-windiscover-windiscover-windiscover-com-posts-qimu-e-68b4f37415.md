---
title: "「憩目」更新 1.3.8：新增「眨眼」以及“刘海屏”支持"
published: 2026-08-17
description: "盯屏幕久了眼睛干涩、酸胀，眼科医生的建议一直是 20-20-20 法则：每用眼 20 分钟，看向 20 英尺（约 6 米）外 20 秒。难的不是道理，是坚持——以及大多数提醒软件总"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/qimu-eyecare-1-3-8-blink-and-notch-support.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/qimu-eyecare-1-3-8-blink-and-notch-support.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

盯屏幕久了眼睛干涩、酸胀，眼科医生的建议一直是 20-20-20 法则：每用眼 20 分钟，看向 20 英尺（约 6 米）外 20 秒。难的不是道理，是坚持——以及大多数提醒软件总在演示、开会的时刻糊人一脸全屏遮罩，最后落得被卸载。

憩目是一款常驻托盘的 Windows 护眼提醒工具，核心特点是**挑时机**：全屏看视频、做演示、打游戏时不弹；检测到麦克风被占用（开会、通话）时不弹；人离开电脑，倒计时自动冻结。无广告、无账号、无遥测，用眼数据不出本机。

刚刚发布的 1.3.8 版本，回答的是另一个真实场景：当推送憩目提醒通知时，如果既不想跳过，也不想眼睛得不到休息该怎么办？因此，憩目在这个版本加入了“眨眼”选项，眨眼同样可以缓解长时间看屏幕时眼睛所受到的压力。以下是憩目 1.3.8 的具体更新细节：

### 新增「眨眼代替」：跳过之外的温和出口

![](https://storage.windiscover.com/files/20260817213920.png)

以前这个时刻只有两个选项：乖乖休息，或者点「跳过」。跳过点多了，护眼软件就形同虚设——这不是用户不自律，是软件只给了两个极端选项。

![](https://storage.windiscover.com/files/20260817213849.png)

1.3.8 在提醒横幅和憩屏上都加了一枚新按钮：**「眨眼一会儿」**。点下去不是敷衍地关掉提醒，而是进入全屏，跟着屏幕上的眼睑动画完整地眨几次眼。这个设计有依据：干眼的主要成因之一就是专注时眨眼次数骤降，几次完整的闭合能重新润滑眼球表面——它替代不了「望远」，但比什么都不做强得多。做完自动散场，憩目周期照常重新开始。

眨几次可以自己定（Pro，默认 3 次）。不喜欢这个选项，设置里可以整个关掉——它和跳过、延后一样，是留给用户的出口，不是塞过来的功能。

### 统计里，眨眼是一等公民

配套地，统计页把眨眼当成独立维度，而不是混进跳过里——「眨了再走」和「白嫖跳过」是两种行为，混在一起两边都不准。这个版本里：概览多了一张「眨眼次数」卡（它的「比昨天」刻意做成中性灰：眨得多还是少，好坏说不清，软件不假装知道答案）；用眼记录每段带眨眼徽章；当日一览时间轴上有专属的琥珀色标记；本周图表可以按眨眼单独下钻。

当日一览的图例也在这个版本变成了筛选器——点「小憩」只看小憩，点「眨眼」只看眨眼，汇总横幅跟着换成那一类的次数与时间，再点一次回到全部。

### 修复：一个 97 分钟不提醒的隐形 bug

这条修复值得单独讲。某些程序会让 Windows 短暂切走桌面——最典型的是远程桌面客户端的自动重连（每次会把凭据界面唤起半分钟）和 UAC 提权框。旧版本判断锁屏用的是「打不开输入桌面 = 锁了」，会把这类闪烁误读成「用户离开了座位」，然后悄悄重置倒计时。实测最严重的案例：一个后台挂着的远程桌面客户端每两分钟重连一次，97 分钟里憩目一次提醒都没发出，而且全程无感——护眼软件最坏的失效方式，就是这种静默失效。

1.3.8 改用系统会话状态这个权威判据（WTS 会话锁定标志），安全桌面闪烁不再影响计时。顺带把反方向的毛病也治了：现代 Windows 的锁屏界面其实并不切安全桌面，旧判据连真锁屏都要靠 5 分钟空闲阈值兜底；现在锁屏那一秒立刻停表，一秒都不多记。

另一个修复小而重要：极少数情况下，已购的 Pro 会被商店的一次瞬时查询失败误判成「未购买」，弹出「试用已结束」。现在要连续两次独立查询都这么说才会降级——花了钱的权益不该被一次网络抖动没收。

### Mac 版同步上架：住在菜单栏里，还带了个「灵动岛」

![](https://storage.windiscover.com/files/20260817213342.png)

这个版本的另一件大事：**憩目的 macOS 版本上架 Mac App Store 了**，与 Windows 版同步到 1.3.8。

Mac 版是地道的菜单栏应用：倒计时环、下次憩目、今日次数都在菜单栏那枚小图标上，要看就点开，不看就当它不存在。20-20-20 提醒、小憩与长憩、全屏/会议免打扰、离开识别、用眼统计，与 Windows 版是同一套能力。

最值得单说的是刘海适配：在带刘海的 MacBook 上，憩前预告不再是屏幕角落的一条横幅，而是**从刘海处展开推出**——就是 iPhone 用户熟悉的那套「灵动岛」形态，预告完了再缩回刘海里。刘海本是块用不上的黑色区域，拿来放一条几十秒就走的提醒，再合适不过。非刘海屏的 Mac 上则回落成常规横幅，行为一致。

免费版完整可用这一点两边一致；Mac 版的 Pro 除一次性买断外，还可以按月/按年订阅（由 App Store 管理，随时可取消），Windows 版则只有买断一种。

官网本周也上线了五种语言（简中/繁中/英/日/韩），跟随系统语言自动切换，还有一个不用下载就能试的在线体验。

### 下载

- **Microsoft Store**：[https://apps.microsoft.com/detail/9N5V74X94TC3](https://apps.microsoft.com/detail/9N5V74X94TC3)

- **winget 一键安装**：
`winget install --source msstore 9N5V74X94TC3
`

- 官网（含在线体验）：[https://qimuapp.pages.dev](https://qimuapp.pages.dev/)

- Mac 版：[https://apps.apple.com/app/qimu-eye-break-reminder/id6795188246](https://apps.apple.com/app/qimu-eye-break-reminder/id6795188246)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/qimu-eyecare-1-3-8-blink-and-notch-support.html) | [添加评论](https://windiscover.com/posts/qimu-eyecare-1-3-8-blink-and-notch-support.html#comments)

[「憩目」更新 1.3.8：新增「眨眼」以及“刘海屏”支持](https://windiscover.com/posts/qimu-eyecare-1-3-8-blink-and-notch-support.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/qimu-eyecare-1-3-8-blink-and-notch-support.html)
