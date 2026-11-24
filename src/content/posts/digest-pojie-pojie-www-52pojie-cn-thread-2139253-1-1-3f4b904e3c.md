---
title: "Windows 程序反调试检测的设计（进阶篇）"
published: 2026-11-23
description: "Windows 程序反调试检测的设计（进阶篇）"
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "冷月孤心"
sourceLink: "https://www.52pojie.cn/thread-2139253-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2139253-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

Windows 程序反调试检测的设计（进阶篇）

我在 Windows 测试程序 AntiDbgtest 里主动设置 PEB 的 BeingDebugged 和 NtGlobalFlag，再观察这两个字段是否被改写。在这组附加测试中，**附加后的首个检测轮次观察到了诱饵被清除，后续刷新却没有看到新变化。** 如果只靠诱饵变化判断调试状态，程序还在被调试，界面也可能显示本轮未命中。

在同为 x64、都按轮写日志的对照测试中，运行后附加时，旧版在首轮命中后回到零项，新版在后续 19 轮持续命中四项。直接从调试器启动时，旧版后续保留三项命中，新版后续保留四项。下面结合判定条件解释差别，再单独讨论可见线程能否触发新的诱饵改写。

**一、刷新时，区分状态和变化**

早期日志只在检测项从非命中状态转为命中时写一行。连续点击两次，哪怕两轮都完成了检查，只要状态没变，第二轮也可能没有新记录。这样很难判断究竟是检测没跑、返回值变了，还是写日志的条件没满足。

现在每次启动、手动刷新和自动刷新都追加完整一轮。日志含 PID、轮次、写入时的毫秒级时间、触发方式和每项的判定依据。同一个文件里可以按启动标记和 PID 区分各次运行。写入时间在采集完成后取得，附加发生在哪个区间要结合实际操作和当轮读数判断。结果与上一轮相同时也会写入。写入失败在界面上显示错误码。新版在原有六个显示项之外，增加了可见线程探测。

当前程序先解释旧诱饵的读数，再为本轮主动探测重新布置诱饵。下面的伪代码保留源码中的函数名。注意 SampleBeforeRearm 的采样位置。如果先写回预设值再读最后一次，可能把刚发生的变化覆盖掉。

`// 伪代码：窗口入口、RunChecks 和 LogRound 的组合void Refresh(Trigger trigger) {    CheckRound round = CollectRound(trigger == Manual);    round.samples[SampleBeforeRearm] = ReadCanaries();    EvaluateRound(round);       // 使用本轮保存的样本和预设值    RunVisibleThreadProbe();   // 另行重植、采样并判定    ArmCanaries();             // 为下一轮普通检查准备预设值    LogRound(trigger);         // 即使与上轮相同，也追加本轮完整记录}`

如果第一轮记录到 BeingDebugged 1→0，后续采样都保持在预设值 1，日志会保留这个差别。「本轮无新证据／曾命中」表示该项曾满足过自己的命中条件，本轮未达到该条件。历史命中也可能来自入口检查或查询矛盾等其他依据，具体要回看当时的原始记录。

**二、用进程外查询解释结果矛盾**

实测中经常出现这样一组读数：进程内 CheckRemoteDebuggerPresent 报告无调试，调试对象为空，调试标志也按当前规则解释为无调试。仅看到这一组返回值，无法区分程序确实没在调试器里，还是这组查询拿到的都是经过干预的状态。

新版在进程内远程查询没有报告调试时，会短暂启动同一个 EXE 的观察者模式。观察者按 PID 打开目标，查询目标当前的调试状态，然后用退出码回传结果。创建成功后，主程序对等待操作设置了 500 毫秒上限。创建失败、等待未完成或查询失败只会让这一路观测不可用，其他有效证据仍可参与判定。手动校准子进程负责验证调试端口和调试对象两项查询。程序用已知处于调试关系中的子进程作为对照，校准结果反映查询在该对照目标上的表现。

`// 伪代码：只展开进程外证据和交叉判定，省略入口检查与手动校准round.remote = QueryCurrentProcess();if (!round.remote.debugged)    round.externalRemote = QueryFromObserver();bool externalDebugged = round.externalRemote.available                     && round.externalRemote.debugged;bool canaryChanged = (bdChangedAt >= 0 || gfChangedAt >= 0);bool debugEvidence = canaryChanged || externalDebugged;auto Contradicts = [&](const QueryResult& query) {    return debugEvidence && query.available && !query.debugged;};bool portMismatch   = Contradicts(round.remote);bool objectMismatch = Contradicts(round.object);bool flagsMismatch  = Contradicts(round.flags);bool crossHit       = portMismatch || objectMismatch || flagsMismatch;`

进程外查询阳性后，几个进程内结果可同时被标记为矛盾。它们共享同一个外部观察，不能当成几次独立确认。观察者也受权限和环境影响，每次启动都有开销。诱饵本身是程序主动写入的，因此 IsDebuggerPresent 读到我写进去的 1，也无法单独确证调试。

有两个返回值会影响后面的读表。本程序把调试对象查询的 STATUS_PORT_NOT_SET 解释为「查询可用，未报告调试对象」，其他无法解释的失败则记为不可用。调试标志只在查询成功后参与判定，当前代码用 flags == 0 表示有调试。

**三、把伪代码代入连续三轮真实读数**

这组 x64 实测取自新版的同一次运行。第 1 轮正常启动，第 2 轮是附加后的首次自动刷新，第 3 轮继续自动刷新。第 2、3 轮的本地与共享查询入口检查均报告正常，也都没有执行手动校准，因此可以沿着上面的矛盾分支解释持续命中。表中的「无调试」是程序对各项 API 返回值的解释。

**当轮观测或派生条件**

---

[查看原文](https://www.52pojie.cn/thread-2139253-1-1.html)
