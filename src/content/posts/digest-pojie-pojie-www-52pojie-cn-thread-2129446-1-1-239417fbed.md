---
title: "玩《策略并购》上瘾，自己 vibe coding 了一个大模型商战版（在线可玩 · 已开源）"
published: 2026-09-22
description: "一、事情起因 最近玩《策略并购》(Acquire) 上瘾，翻了一圈没找到什么在线版，于是自己 vibe coding 了一个大模型版本的 原版游戏里的 7 家连锁酒店，换成了现实中的大模型公司（GPT、Claude、Kimi、千问、智谱……），规则一条没改，百分百还原； 地块儿直接 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "baoshan685"
sourceLink: "https://www.52pojie.cn/thread-2129446-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2129446-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

**一、****事情起因**

最近玩《策略并购》(Acquire) 上瘾，翻了一圈没找到什么在线版，于是自己 vibe coding 了一个大模型版本的

原版游戏里的 7 家连锁酒店，换成了现实中的大模型公司（GPT、Claude、Kimi、千问、智谱……），规则一条没改，百分百还原；

地块儿直接用公司图标显示，一眼看清谁占了哪、谁在吞谁，比翻卡片舒服多了

最骚的彩蛋是——**这 7 家公司的股价档位（高 / 中 / 低）每天按真实大模型排行榜自动更新**，榜一的公司就是最贵的那家。也就是说，昨天还在肉搏的 Claude 今天可能就把智谱并了，玩的时候顺手见证 AI 圈洗牌

**二、源码**

**源码在这**：[https://github.com/baoshan685/acquire-llm](https://github.com/baoshan685/acquire-llm) （ISC 协议，随便看随便改）

**三、效果截图**

**四、规则还原到什么程度（这条是我最在意的）**

市面上桌游电子版最怕的就是"糊弄规则"，这版是我逐条对照规则书写的，连规则书都写不清楚的边角情况都用测试钉死了

![](https://static.52pojie.cn/static/image/smiley/default/victory.gif)

9 列 × 12 行 = 108 格棋盘，7 家厂商各 25 股9 档股价表（按连锁规模 + 高 / 中 / 低三档）建连锁送 1 股创始人免费股（**库存空了还不发**）合并奖金：第一大股东 股价 × 10、第二大股东 股价 × 5**唯一股东**通吃第一 + 第二两份奖金并列名次按 $100 取整平分（这条原版规则书都没写清楚，我按英文原版裁定实现）安全链 ≥11 格不可被吞并；两条安全链相邻的格子直接不能落子2:1 换股受吞并方库存限制，处置价按"被吞并瞬间"的股价（不是当前价，也不是下一轮价）终局：某连锁达 41 格，或所有连锁均安全后玩家主动宣布结束

具体到工程上，光是合并 / 换股 / 死格这块，我就写了 test_merge.js、test_dead_tile.js、test_bonus_rules.js、test_comprehensive.js 等 **16 个自动化测试文件**跑回归，加起来快 4000 行，跑完是绿的才敢推

**五、技术栈（老哥们关心的部分）**

一个稍微"离经叛道"的点：**前端零框架、零 npm 依赖**，纯原生 HTML/CSS/JS， 直接怼，file:// 打开就能玩（clone 下来双击 index.html 也行）。

项目结构：

`index.html                入口css/style.css             样式（1776 行，深色现代风）js/engine.js              核心引擎，942 行，纯逻辑零 DOMjs/ai.js                  AI 决策，2715 行，全阶段评分策略js/adapter.js             双模式适配器（Local / Online 同一接口）js/net.js                 客户端 WebSocket 封装（自动重连）js/lobby.js               大厅 / 房间 UIjs/ui.js                  渲染 + 交互，1379 行server/server.js          联机服务（http 静态托管 + ws）server/netengine.js       服务端权威引擎（校验 + 广播 + AI 驱动）server/rooms.js           房间管理（创建 / 加入 / 离开 / 重连）scripts/update-model-order.js   每日定时：抓排行榜 → 下 logo → 生成厂商顺序logos/                    厂商 SVG/PNG，离线可用`
代码量大概：**前端 JS ~6.1k 行，服务端 ~2.4k 行，CSS ~1.8k 行，脚本 + 测试另有 ~4k 行，总计 1.4 万行左右**。

几个自己比较满意的设计点

**1. 引擎 / UI / 传输三层彻底分离**

engine.js 是完全纯函数的，不碰 DOM，可以直接在 Node 里跑测试。adapter.js 定义了 LocalAdapter 和 OnlineAdapter 两个实现同一个接口的适配器，UI 层完全不感知自己是单机还是联机——加 / 切模式零成本。

**2. 联机服务端权威，防作弊是真的防**

Game 实例只存在于服务端，客户端拿到的都是服务端主动推送的视图。而且做了 **publicView + privateView 双视图隔离**：

publicView：棋盘 / 连锁 / 各家现金 / 持股数privateView：**只有自己的手牌**

意思就是——你就算 F12 打开控制台改内存，你也看不到对手手上是什么牌，改自己现金也没用（服务端一校验就踢）。这个架构参考了标准牌类桌游联机的做法，比自己瞎琢磨的心跳协议靠谱多了

![](https://static.52pojie.cn/static/image/smiley/default/handshake.gif)

**3. 断线重连（这个自己踩坑最多）**

一开始以为 WS 断开重连就完事了，实际上要处理：

**半开连接**：客户端 WiFi 掉了但 TCP 没感知到，服务端还以为人在线 → 加了心跳巡检（WS_PING_INTERVAL_MS=15000），一轮 pong 不回就判掉线**重连入座**：按"昵称 + 房间号"找回座位，恢复手牌和游戏状态**卡局兜底**：某人掉线太久没回来，房主可以点"强制结束本局"按当前局面结算**房间回收**：全员掉线的房间保留 30 分钟，已结束的房间保留 10 分钟，防内存泄漏

这几个坑都被 test_reconnect_e2e.js 和 test_reconnect_fixes.js 覆盖到了。

**4. AI 对手（这个是我花时间最多的地方）**

2715 行，ai.js 单文件比很多小项目的整个前端都大。全阶段决策：选牌 / 建连锁 / 选吞并方 / 处置股票（保留 / 换股 / 售出）/ 买股。核心是一个多维评分函数：

落子 → 连锁扩张潜力、是否制造合并机会、是否给自己送免费股合并 → 该吞谁（要考虑股价档位 + 自己持股数 + 对手持股数）处置 → 现金 vs 库存 vs 长期持股价值 三角权衡买股 → 是否要把某家推到安全链、是否要卡对手大股东位置

调分权重调到我想把电脑扔了

![](https://static.52pojie.cn/static/image/smiley/default/sweat.gif)

 但玩下来确实是**会算账**的，不是无脑莽。

**5. 每日排行榜抓取**

scripts/update-model-order.js 每天早上跑一次，从公开大模型排行榜抓排名 → 生成 js/model-order.js → 顺手把 logo 也下到 logos/。所以 7 家公司在棋盘上的排序、股价档位（榜一 1-2 名高档、3-5 名中档、6-7 名低档）都是跟着 AI 圈实际情况在动的。

这个 idea 单纯是玩的时候觉得"既然要换成大模型公司，那不做动态排行就浪费了"，做完发现比想象中上头，每天都想上线看看"今天谁又被谁并了"。

**六、怎么玩（三种入口）**

**① ****单机离线版（vs AI）**

clone 或者下载源码包解压，双击 index.html，浏览器秒开，**不用装任何东西、不用起服务器**。想 1v3、1v5 都行。

`git clone [url]https://github.com/baoshan685/acquire-llm.git[/url]cd acquire-llm# 双击 index.html 即可`
**② **** 自建联机服务（3-6 人）**

需要 Node.js 环境：

`npm installnpm start`
启动后会打印本机 + 局域网地址。房主点「创建房间」拿房间号，其他人输同一房间号加入即可。手机端浏览器也能进，实测过。

想挂公网服务器让朋友远程玩的，把 PORT 改掉 + 前置个 nginx 反代 WS 就行，这个就不展开讲了，评论区有人问再更。

后台管理：ADMIN_PASSWORD=xxx npm start 才开启 /admin，默认关的，安全起见别裸奔。

**七、几个已知不足（先自首，免得老哥们喷我）**

**移动端 UI 只做了能用级别**，不是原生 App，平板体验最好，手机竖屏有点挤**AI 难度只有一档**，评分权重写死的，暂时没做 easy / normal / hard 分层，后面有空加**音效没做**，纯视觉桌游**规则书里的"股份交易阶段"没实现**（原版 Acquire 本身就没有自由交易阶段，这是玩家二创常用的房规，我按官方原版来的）排行榜抓取依赖第三方站点，站挂了会自动 fallback 到最近一次的顺序，不至于崩

**八、源码获取**

仓库：**[https://github.com/baoshan685/acquire-llm](https://github.com/baoshan685/acquire-llm)**（ISC 协议，随便用）

直接点上面链接进去看，或者 git clone想拿压缩包的话：GitHub 页面右边 **Code → Download ZIP**后续有 bug 修复 / 新功能会更新到 main，也可以 watch 一下

**九、免责声明（务必看）**

本项目为 **100% 非商业粉丝向学习项目**，玩法与《Acquire》桌游规则致敬 Avalon Hill 原版。游戏中出现的 GPT、Claude、Meta、智谱、Grok、Kimi、千问 等品牌名称均为各自权利人的商标，**本项目与 OpenAI / Anthropic / Meta / 智谱 AI / xAI / 月之暗面 / 阿里巴巴等公司不存在任何隶属、授权、赞助或背书关系**。logos/ 目录中的图标抓取自公开排行榜页面，图形版权归原权利人所有，**仅供本地学习与娱乐展示使用，请勿用于商业用途或二次分发**。AI 玩家使用的"伯克希尔 / 黑石 / 高盛 / 摩根大通 / 桥水"等投资机构名，仅为游戏内虚构玩家标签，与真实机构无关。**在线版 (acquire.3i0.cn) 免费提供，不收费、无广告、不做流量变现**，纯学习娱乐。若涉及品牌方对本项目提出异议，我会第一时间下架处理。源码仅供学习交流，任何二开 / 商用 / 上架行为本人不参与、不负责。

**十、结语**

vibe coding 时代，一个人 + 一个模型 + 一点点桌游知识，真能把一个 60 年前的经典桌游做成能联机、能玩 AI、有自动化测试、还能一键部署上线的完整项目，成本比想象中低得多。

发这儿是想看看有没有老哥想一起折腾——**如果评论区聊玩法 / 聊架构的人多，我再更一篇「架构拆解」或者「AI 决策评分函数是怎么写的」**，也欢迎来怼规则 bug。

一个人 + 一个 AI，能把一个脑洞做成能玩、能联机、还上线了的完整作品，这件事本身就挺让人上头的。感兴趣的老哥直接点上面的链接开一局就行

![](https://static.52pojie.cn/static/image/smiley/default/handshake.gif)

**源码仓库**：[https://github.com/baoshan685/acquire-llm](https://github.com/baoshan685/acquire-llm)

---

[查看原文](https://www.52pojie.cn/thread-2129446-1-1.html)
