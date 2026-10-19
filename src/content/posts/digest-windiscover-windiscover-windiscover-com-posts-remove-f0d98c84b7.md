---
title: "不同浏览器中禁用网页弹窗与横幅元素的方法"
published: 2026-10-19
description: "多种主流浏览器可通过安装第三方扩展程序的方式，实现对网页上特定视觉元素的自定义屏蔽。主要依赖的工具是 uBlock Origin 扩展，该扩展允许用户在页面上选择并隐藏独立元素，同"
image: ""
tags: ["采集", "WinDiscover"]
category: "资讯精选"
draft: false
lang: ""
author: "walkingdog"
sourceLink: "https://windiscover.com/posts/remove-website-banners-popups-elements-guides.html"
---

> 转载自 [WinDiscover](https://windiscover.com/posts/remove-website-banners-popups-elements-guides.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

多种主流浏览器可通过安装第三方扩展程序的方式，实现对网页上特定视觉元素的自定义屏蔽。主要依赖的工具是 uBlock Origin 扩展，该扩展允许用户在页面上选择并隐藏独立元素，同时创建个性化过滤器以确保这些元素下次访问时不再出现。

### **浏览器兼容性与支持情况**

Google Chrome 于 8 月移除了 Manifest V2 扩展支持，常规版 uBlock Origin 已无法在 Chrome Web Store 获取。目前仍可通过 Lite 版本实现基本功能，其内置自定义过滤器和元素选择器可满足大部分需求。

![](https://cdn.neowin.com/news/images/uploaded/2026/10/1792181945_ublock_origin_chrome_3_story.webp)

Mozilla Firefox 继续支持完整版本的 uBlock Origin，用户可直接从官方附加组件商店安装，拥有最全面的功能支持。

![](https://cdn.neowin.com/news/images/uploaded/2026/10/1792182054_ublock_origin_firefox_3_story.webp)

Opera 同样支持完整版本的 uBlock Origin，操作方式与 Firefox 一致。

### **Chrome 与 Edge 使用方法**

Microsoft Edge 作为 Chromium 内核浏览器，操作流程与 Chrome 基本相同。操作步骤如下：

- 访问包含目标元素的网页

- 点击浏览器工具栏中的 uBlock Origin Lite 图标

- 选择 创建自定义过滤器 选项

- 移动鼠标悬停在需要移除的元素上使其高亮显示

- 点击该元素

- 在弹出的对话框中查看系统建议的过滤器规则

- 通过滑块调整筛选范围精度

- 完成过滤器创建

![](https://cdn.neowin.com/news/images/uploaded/2026/10/1792181272_ublock_origin_edge_1_story.webp)

此机制会在用户下次返回同一网站时自动应用已保存的过滤器。如需删除已创建的规则，可在仪表盘中的 自定义过滤器 部分进行管理。

### **Firefox 与 Opera 操作方法**

完整版本 uBlock Origin 提供额外功能，包括元素 zap 器。该功能以闪电形图标呈现，仅临时移除页面元素，刷新网页后元素将恢复显示。

![](https://cdn.neowin.com/news/images/uploaded/2026/10/1792182099_ublock_origin_opera_story.webp)

Opera 正在开发版本 Opera 139 中测试原生元素选择器功能，允许用户右键点击不需要的元素并选择 屏蔽该元素，无需额外安装扩展。该特性目前尚未在稳定版中开放，uBlock Origin 仍是当前更便捷的解决方案。

### **注意事项与局限性**

自定义过滤器并非绝对永久有效，特别是对于频繁变更布局结构的网站，原先被隐藏的元素可能会重新出现。某些页面元素与其他区域存在关联，过度屏蔽可能导致页面布局受损或误删有用内容。

如不小心移除了需要保留的元素，可返回 uBlock Origin 的过滤器设置界面撤销更改。建议在实施屏蔽前进行测试，确保达到理想的网页视觉效果。

via [Neowin](https://www.neowin.net/guides/how-to-remove-banners-pop-ups-and-other-annoying-elements-from-websites/)

©2026 WinDiscover [WinDiscover](https://windiscover.com) | [阅读原文](https://windiscover.com/posts/remove-website-banners-popups-elements-guides.html) | [添加评论](https://windiscover.com/posts/remove-website-banners-popups-elements-guides.html#comments)

[不同浏览器中禁用网页弹窗与横幅元素的方法](https://windiscover.com/posts/remove-website-banners-popups-elements-guides.html)最先出现在[WinDiscover](https://windiscover.com)。

---

[查看原文](https://windiscover.com/posts/remove-website-banners-popups-elements-guides.html)
