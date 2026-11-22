---
title: "微软承认Outlook全球中断期间部分邮件丢失"
published: 2026-11-22
description: "微软发布了针对2026年11月12日全球Outlook服务中断的最终事后报告，确认部分消费者邮件未能送达收件人。此次事件还影响了Microsoft Defender for Off"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/microsoft-outlook-global-outage-final-report-2026.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/microsoft-outlook-global-outage-final-report-2026.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

微软发布了针对2026年11月12日全球Outlook服务中断的最终事后报告，确认部分消费者邮件未能送达收件人。此次事件还影响了Microsoft Defender for Office的安全功能正常运作。

![](https://cdn.neowin.com/news/images/uploaded/2026/02/1770964191_outlook_full.webp)

### **事故经过与影响范围**

2026年11月12日，微软遭遇大规模服务中断，导致全球数百万用户无法访问Outlook、Exchange Online及其他Microsoft 365服务。系统最终在约12小时后恢复正常运行。事故由2026年7月引入的软件缺陷触发，叠加服务器容量减少和Teams流量激增，导致超过80%的网络网关服务器一度无响应。

### **邮件丢失情况确认**

微软确认所有队列企业邮件最终成功发送，未发现企业消息永久丢失。然而消费者用户方面存在差异：部分因超过30天未活跃而超时的延迟消息未能送达，发送方收到投递失败报告。微软未透露受影响的邮件数量和用户规模。

![](https://cdn.neowin.com/news/images/uploaded/2026/02/1770964191_outlook_story.webp)

### **安全功能受损详情**

事故期间Microsoft Defender for Office的关键安全能力受到干扰：

- Zero-hour自动清理(ZAP)功能因威胁情报更新不可用而延迟执行，恶意邮件移除速度慢于正常水平

- Safe Links安全链接验证出现问题，部分用户遇到绕过验证选项

- 邮件管理员无法释放或删除隔离邮件，管理允许/阻止列表及执行补救操作受阻

### **Purview服务同步影响**

Microsoft Purview政策变更、安全告警和处理活动均出现延迟，涉及Data Loss Prevention、eDiscovery、Insider Risk Management和审计搜索等功能模块。

### **修复措施与时间表**

微软计划采取以下改进措施：

- 2026年第四季度：修改流量分发设计，限制Teams故障转移到受影响区域

- 2027年第一季度：按工作负载分离网络网关容量池，防止单一服务问题扩散

- 扩展压力测试至新的高核心服务器，采用更接近生产环境的流量模式

### **沟通机制改进**

微软承认首次客户通知比广泛影响开始晚了约20分钟，计划在2026年底前改进自动化中断通知系统以提升通信效率。

via [Neowin](https://www.neowin.net/news/microsoft-admits-some-emails-bounced-during-global-outlook-outage-reveals-new-failures/)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/microsoft-outlook-global-outage-final-report-2026.html) | [添加评论](https://windiscover.com/posts/microsoft-outlook-global-outage-final-report-2026.html#comments)

[微软承认Outlook全球中断期间部分邮件丢失](https://windiscover.com/posts/microsoft-outlook-global-outage-final-report-2026.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/microsoft-outlook-global-outage-final-report-2026.html)
