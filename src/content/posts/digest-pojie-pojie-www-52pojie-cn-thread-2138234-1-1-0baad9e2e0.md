---
title: "Full GC优化"
published: 2026-11-17
description: "最近线上一个服务半夜频繁告警，接口 P99 偶尔飙到 3s+，监控一看 JVM 每分钟一次 Full GC。排查 + 调优折腾了两天，总算稳下来了，整理一下过程，给同样被 GC 问题折磨的老哥避避坑。 一、先别瞎调参数，先看现象 很多人上来就百度一堆 -Xmx -Xmn 往上一堆，这是大忌 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "zhangxaiozhang"
sourceLink: "https://www.52pojie.cn/thread-2138234-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2138234-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

最近线上一个服务半夜频繁告警，接口 P99 偶尔飙到 3s+，监控一看 JVM 每分钟一次 Full GC。排查 + 调优折腾了两天，总算稳下来了，整理一下过程，给同样被 GC 问题折磨的老哥避避坑。

**一、先别瞎调参数，先看现象**

很多人上来就百度一堆 -Xmx -Xmn 往上一堆，这是大忌。调优第一步永远是**搞清楚 GC 到底在干嘛**，不然纯属玄学。

先把 GC 日志打开（JDK8 和 JDK9+ 参数不一样，别抄错）：

JDK8：-XX:+PrintGCDetails -XX:+PrintGCDateStamps -XX:+PrintGCTimeStamps-Xloggc:/data/logs/gc-%t.log-XX:+UseGCLogFileRotation -XX:NumberOfGCLogFiles=5 -XX:GCLogFileSize=50M

JDK11+（统一用 -Xlog，老参数全废了）：-Xlog:gc*:file=/data/logs/gc-%t.log:time,uptime,level,tags:filecount=5,filesize=50M

日志出来后丢进  这种网站可视化一下，几秒钟就能看出是**内存泄漏**、**晋升过快**、还是**新生代太小**，比盯着原始日志强一百倍。

**二、我这次的实际问题**

GCEasy 报告显示：Young GC 特别频繁，并且每次 Young GC 后有大量对象直接晋升老年代，老年代水位快速上涨 → 触发 Mixed/Full GC。

定位到根因：
有个接口一次性从数据库捞了几万条数据拼成大 List，全进 Survivor 塞不下，直接提前进老年代；默认用 Parallel GC，吞吐还行但停顿不可控，业务对延迟敏感根本扛不住；堆配得太小（默认跟着物理内存走），新生代和老年代比例不合理。

**三、调整后的参数（生产实测稳的）**-server-Xms4g -Xmx4g-XX:MetaspaceSize=256m -XX:MaxMetaspaceSize=512m-XX:+UseG1GC-XX:MaxGCPauseMillis=150-XX:InitiatingHeapOccupancyPercent=45-XX:+ParallelRefProcEnabled-XX:+HeapDumpOnOutOfMemoryError-XX:HeapDumpPath=/data/dump/heap.hprof

**逐条说人话：**[td]参数

---

[查看原文](https://www.52pojie.cn/thread-2138234-1-1.html)
