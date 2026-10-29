---
title: "我做了个《凡人修仙传》同人修仙模拟器：随机出生，活完一生"
published: 2026-10-29
description: "[md]## 项目说明与地址 《一介凡人》是一个以《凡人修仙传》世界观为背景的**非官方同人**人生模拟项目。它不包含原作文本、图片或商业素材，原作及相关权利归原作者所有；本项目仅作个人技术交流，不提供付费内容。 ## 页面预览 ### 首页 ![一介凡人首页 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "sakura521"
sourceLink: "https://www.52pojie.cn/thread-2134721-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2134721-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

### 项目说明与地址

《一介凡人》是一个以《凡人修仙传》世界观为背景的**非官方同人**人生模拟项目。它不包含原作文本、图片或商业素材，原作及相关权利归原作者所有；本项目仅作个人技术交流，不提供付费内容。

### 页面预览

#### 首页

![](https://litter.catbox.moe/y9o3aj.png)

#### 降生与推演

![](https://litter.catbox.moe/9xooj4.png)

#### 图鉴

![](https://litter.catbox.moe/ac6i5d.png)

### 一、项目边界

这是一个纯静态的“人生模拟器”：

- 无构建、无框架、无 npm 运行时依赖；

- 打开 `index.html` 即可运行；

- 一局由若干“年/阶段”推进，玩家在关键节点做选择；

- 默认数据保存在浏览器 `localStorage`；

- 后端是可选的：只有留言、账号、云存档等跨设备能力才需要 Python + SQLite。

技术栈：

`HTML / CSS / 原生 JavaScript
可选：Python stdlib ThreadingHTTPServer + SQLite`
架构示意：

![](https://litter.catbox.moe/p1g18v.png)

### 二、核心状态：一个可序列化的对象

引擎不把状态藏在 DOM 或闭包里，而是集中到一个普通对象中。这样存档、回放、自动测试都可以直接复用。

`const initialState = {
  seed: 123456789,
  age: 16,
  tier: 1,              // 当前境界
  cult: 0,              // 当前境界修为 0-100
  mood: 60,
  insight: 20,
  injury: 0,            // 0-3，影响修炼与破境
  traits: { kind: 0, ruthless: 0, curious: 0, bold: 0, calm: 0 },
  flags: {},            // 一次性事件、剧情标记
  pending: null,        // 当前等待玩家处理的抉择
  log: [],
};`
几个原则：

- **状态必须可 JSON 序列化**，不保存函数、DOM 节点和类实例。

- **pending 是唯一的阻塞点**：有 pending 时主循环不能继续推进。

- 事件、UI、存档都只读写状态，不直接修改彼此。

### 三、主循环：时间推进与事件中断

主循环做三件事：推进年份、结算年度变化、检查是否触发事件。

`step() {
  const s = this.state;
  if (!s.alive) return { status: "dead" };
  if (s.pending) return { status: "pending" };

  const realm = this.realm();
  let years = realm.per || 1;
  if (s.age + years > s.maxAge) {
    years = Math.max(1, s.maxAge - s.age);
  }

  for (let i = 0; i
`afterStep()` 只负责“触发什么”，不负责“怎么渲染”：

`afterStep() {
  const s = this.state;

  if (this.maybeMainline()) return;
  if (this.maybeChain()) return;

  if (!s.pending && s.cult >= 100 && this.canBreak()) {
    s.pending = { kind: "break", chance: this.breakChance() };
    return;
  }

  if (!s.pending && this.rng.chance(this.eventChance())) {
    const event = this.pickEvent();
    if (event) this.trigger(event.id);
  }
}`
这种写法有一个很实用的好处：**自动播放和手动操作共用同一套状态机**，只是 UI 层决定什么时候调用 `step()`、什么时候展示 `pending`。

### 四、事件池：用数据描述，而不是写死剧情

事件不是一长串 `if/else`，而是数据对象：

`const EVENTS = [
  {
    id: "market_choice",
    once: true,
    weight: 4,
    when: (s) => s.age >= 16 && s.stones >= 10,
    text: (s) => `坊市里有人向你兜售一件旧物。`,
    choices: [
      {
        label: "买下它",
        effects: { stones: -10, insight: 2, trait: { curious: 1 } },
        outcome: "你把旧物收进袖中，决定回去慢慢研究。",
      },
      {
        label: "转身离开",
        effects: { mood: 1 },
        outcome: "你没有回头。",
      },
    ],
  },
];`
选择器只负责筛选：

`pickEvent() {
  const s = this.state;

  let pool = EVENTS.filter((event) => {
    if (event.once && s.seen[event.id]) return false;
    if (event.stage && ![].concat(event.stage).includes(this.stage())) return false;
    return !event.when || event.when(s);
  });

  const recent = new Set((s.recentEvents || []).slice(-12));
  const fresh = pool.filter((event) => !recent.has(event.id));
  if (fresh.length) pool = fresh;

  return this.rng.weighted(pool, (event) => {
    const trait = event.tone ? s.traits[event.tone] || 0 : 0;
    return (event.weight || 1) * (1 + Math.min(0.75, trait * 0.06));
  });
}`
关键点：

- `when` 做硬条件过滤，权重只影响“出现概率”，不负责禁止；

- `once` 与 `sceneKey` 防止同一事件连续重复；

- 事件只产出 `pending.choices`，不直接操作界面；

- 选项的 `effects` 是纯数据，方便做日志、回放和自动测试。

### 五、抉择校验：把限制放在数据里

选项的 `requires` 不写死在 UI 中，而是在引擎里统一校验：

`choose(index, options) {
  const s = this.state;
  const choice = s.pending && s.pending.choices[index];
  if (!choice) return null;

  const req = choice.requires || {};

  if (req.trait) {
    for (const key of Object.keys(req.trait)) {
      if ((Number(s.traits[key]) || 0)
这样做有三个好处：

- 以后加“性格门槛”“因果门槛”“道统门槛”时，不需要改一堆 UI 代码；

- 自动模式和手动模式校验一致；

- 测试可以直接构造状态验证边界，而不需要点 DOM。

### 六、突破概率：把隐藏随机变成可见成本

破境不要只返回一个数字，而是返回完整拆解：

`breakForecast() {
  const s = this.state;

  const base =
    0.78 -
    s.tier * 0.04 +
    s.mood * 0.0015 +
    s.insight * 0.0006 +
    (this.rootPower() - 1) * 0.04 +
    (s.physique?.breakBonus || 0) +
    this.artifactBreakBonus() +
    Math.min(s.breakBonus, 25) / 100 -
    (s.flags.demon ? 0.1 : 0) -
    (s.flags.heart_scar ? 0.05 : 0);

  const prep = Math.min(3, Math.max(0, s.breakPrep || 0)) * 0.03;
  const injury = Math.min(3, Math.max(0, s.injury || 0)) * 0.03;
  const chance = clamp(base + prep - injury, 0.12, 0.94);

  return { base, prep, injury, chance };
}`
UI 可以把各项直接展示给玩家：

`基础成算 47%
根基准备 +9%
伤势 -6%
最终成算 50%`
设计上的取舍：

- **不设隐藏默认加成**，玩家看到的数字就是实际掷骰使用的数字；

- 准备和伤势都进入同一个概率池，避免“系统暗补”；

- 失败后保留部分准备、增加伤势，让失败产生后续决策，而不是单纯重开；

- 修为速度通过境界需求和资质曲线调节，不使用“年龄硬门槛”强行卡人。

### 七、存档与可选后端

前端存档只保存可序列化快照：

`saveRun() {
  const snapshot = {
    version: 1,
    seed: this.state.seed,
    state: this.state,
  };

  localStorage.setItem("demo.run.v1", JSON.stringify(snapshot));
}`
恢复时做三件事：

- 校验版本号；

- 把缺失字段补默认值；

- 丢弃非预期字段，避免旧存档污染新逻辑。

如果要做跨设备同步，可以加一个可选后端：

`# 脱敏示意，不是完整服务
class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/api/save":
            self._json(200, load_snapshot(self.current_user()))`
后端只在需要账号、留言、云存档时启用；静态页面本身仍然可以离线运行。前端通过 `fetch` 连接，请求失败时继续使用 `localStorage`，不让后端成为单点故障。

### 八、测试与平衡

这个项目目前有 400 多项断言和多种随机种子回归，重点覆盖：

- 主循环不会在 `pending` 状态下继续推进；

- 同一随机种子得到同一结果；

- 事件条件、一次性事件和场景去重；

- 破境概率各项相加等于最终概率；

- 失败、伤势、资源扣除不会出现负数或 NaN；

- 自动模式与手动模式使用同一套状态机。

平衡调整不能只拍脑袋。比较有效的方法是写一个只读审计脚本：

`for (let i = 0; i
然后看各境界到达年龄的中位数、分位数和死亡原因，而不是只看“某一局感觉太快”。

### 九、踩过的坑

#### 1. 不要让 UI 直接改状态

早期我在按钮回调里直接改 `state`，结果自动模式和手动模式各有一套逻辑，后面很难维护。正确做法是：

按钮点击 → sim.choose() → 状态变化 → 重新渲染

#### 2. 概率不要藏默认值

风险选项不要偷偷加固定成功加成；否则玩家无法通过失败复盘。所有修正项都应该进入 `breakForecast` 或风险预览。

#### 3. 文本也需要去重

同一事件文本在一局里反复出现，会立刻破坏沉浸感。除了事件 id，还要记录 `sceneKey` 和最近文本使用次数。

#### 4. 本地存档要有上限和迁移

`localStorage` 不是数据库。我的做法是只保留最近一段人生快照，并在读取时做字段补全和版本迁移；不要在存档里塞函数或 DOM。

### 十、这套结构适合什么

它不只适合人生模拟器，也适合：

- 文字冒险 / 互动小说；

- Roguelike 事件流；

- 养成和经营类小游戏；

- 需要“可复现随机 + 可解释概率”的轻量模拟。

核心可以压缩成一句话：

>
**把世界状态放进一个可序列化对象，把内容放进数据，把选择交给统一的校验器，把随机性锁在可复现的种子里。**

### 附：目录结构（脱敏）

`project/
├─ index.html
├─ play.html
├─ css/
│  ├─ tokens.css
│  ├─ base.css
│  └─ game.css
├─ js/
│  ├─ common.js      # 导航、主题、通用工具
│  ├─ data.js        # 静态配置
│  ├─ events.js      # 事件池
│  ├─ sim.js         # 状态机与规则
│  └─ game.js        # 渲染与交互
└─ server.py         # 可选后端`

### 项目地址

- 游玩：[https://wang1375830242.github.io/yijie-fanren/](https://wang1375830242.github.io/yijie-fanren/)

- 源码：[https://github.com/wang1375830242/yijie-fanren](https://github.com/wang1375830242/yijie-fanren)

---

[查看原文](https://www.52pojie.cn/thread-2134721-1-1.html)
