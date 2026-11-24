---
title: "Windows 程序反调试检测的设计（终结篇）"
published: 2026-11-23
description: "Windows 反调试诱饵实测：从首次改写到逐轮复现 我给自己的 Windows 测试程序 AntiDbgtest 做了两个 PEB 诱饵。程序先写入已知值，再看它们有没有被改写。最初的附加测试中，附加后的首轮读到了两个清零的诱饵。等程序把它们写回，后续普通采样却读不到新的变化，而 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "冷月孤心"
sourceLink: "https://www.52pojie.cn/thread-2139281-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2139281-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

Windows 反调试诱饵实测：从首次改写到逐轮复现

我给自己的 Windows 测试程序 AntiDbgtest 做了两个 PEB 诱饵。程序先写入已知值，再看它们有没有被改写。最初的附加测试中，附加后的首轮读到了两个清零的诱饵。等程序把它们写回，后续普通采样却读不到新的变化，而进程外查询仍然报告有调试。

于是我把问题拆开验证。**进程是否仍在被调试，可以每轮重新查询。某个调试事件前后，诱饵是否又被修改了一次，则要比较该事件前后的实际读数。** 我先试了可见线程和自定义异常，最后试了真正的 DLL 加载。公开源码显示，ScyllaHide 的 x64dbg 插件可以在 DLL 加载事件里重跑 PEB 补丁。首组 x64 对照中，附加后连续 33 轮、调试器直接启动后连续 20 轮，两个字段都在这段窗口内重新清零。后续测试也记录到了 DLL 成功加载、字段保持不变的有调试轮次。

**一、为什么首轮命中，后面却看不到变化**

PEB 是进程环境块，这里用它的两个字段做诱饵。程序把 BeingDebugged 写成 1，把当前的 NtGlobalFlag 与 0x70 做按位或，并保存写入的完整值作为预期。比如原值是 0，写回后才是 0x70。如果原来还有其他位，程序会把它们保留下来。

普通检测以**首次观察到差异的采样点**为依据。例如，轮入口已经读到 BeingDebugged=0，只能确定变化在这次采样之前发生，无法根据这一个读数确定准确的写入时刻。重植后，下一轮如果一直读到预期值，就没有新的诱饵命中。首次结果可以保留在历史记录中，后续轮次仍用当轮读数重新判断。

`// 伪代码：布置诱饵并保存下一段采样要比较的预期void ArmCanaries() {    auto current = ReadCanaries();    expected.beingDebugged = 1;    expected.globalFlags = current.globalFlags | 0x70;    WriteBeingDebugged(expected.beingDebugged);    WriteNtGlobalFlag(expected.globalFlags);}// 伪代码：在重植前，根据本轮已经保存的样本定位首次变化for (const auto& sample : round.samples) {    if (round.bdArmed && sample.beingDebugged != round.expected.beingDebugged)        RecordFirstDifference("BeingDebugged", sample);    if (round.gfArmed && sample.globalFlags != round.expected.globalFlags)        RecordFirstDifference("NtGlobalFlag", sample);}`
这个设计也决定了 IsDebuggerPresent 该怎么解释。测试程序自己写入了 1，API 返回 1 本身就缺乏独立证明力。普通采样关心的是已布置的字段是否改变、查询结果是否与观察矛盾，以及函数入口检查有没有匹配异常特征。每项的命中依据要和原始值一起看。

**二、诱饵不变时，怎样继续观察调试状态**

当进程内的 CheckRemoteDebuggerPresent 没有报告有调试时，AntiDbgtest 会启动同一 EXE 的观察者模式。这个短生命周期子进程按 PID 打开目标，调用 CheckRemoteDebuggerPresent 查询目标，再通过退出码回传结果。父进程在创建成功后对等待设置了 500 毫秒上限。启动失败、等待未完成或查询失败，都使这一路观测不可用。手动刷新的校准子进程另有用途，它为调试端口和调试对象查询提供一个已知处于调试关系中的对照目标。按公开 API 说明，CheckRemoteDebuggerPresent 的函数返回值只表示调用是否成功，目标是否处于调试状态由输出参数给出；这里的 remote 指调试器在另一个并行进程里，并不要求在另一台机器上。

我把进程外结果用在两处。远程查询这一项可以直接使用本轮的进程外阳性结果。与此同时，如果进程内远程查询、调试对象或调试标志查询有效，却报告无调试，就可以记录它们与当前证据的矛盾。程序仍保存这些 API 各自的原始返回值。

`// 伪代码：只展开交叉判定，省略各检测项自己的其他命中条件if (!round.remote.debugged)    round.externalRemote = QueryFromObserver();bool externalDebugged = round.externalRemote.available                     && round.externalRemote.debugged;bool canaryChanged = bdChangedAt >= 0 || gfChangedAt >= 0;bool debugEvidence = canaryChanged || externalDebugged;auto contradicts = [&](QueryResult result) {    return debugEvidence && result.available && !result.debugged;};bool remoteMismatch = contradicts(round.remote);bool objectMismatch = contradicts(round.object);bool flagsMismatch  = contradicts(round.flags);bool crossHit       = remoteMismatch || objectMismatch || flagsMismatch;`
这里的「查询有效」有具体含义。对调试对象查询，程序把 STATUS_PORT_NOT_SET（0xC0000353）解释为可用的无调试对象结果。对调试标志，程序只在调用成功后按当前实现解释结果，0 表示有调试，本次测试中观察到的 1 表示无调试。查询矛盾可以让多行同时显示命中，但几行可能共享同一份外部证据。

在加入 DLL 探测之前，我先让两套 x64 构建都完整追加每轮日志。旧版补上自动刷新和逐轮日志，沿用原来的判定。结果如下。

**场景**

---

[查看原文](https://www.52pojie.cn/thread-2139281-1-1.html)
