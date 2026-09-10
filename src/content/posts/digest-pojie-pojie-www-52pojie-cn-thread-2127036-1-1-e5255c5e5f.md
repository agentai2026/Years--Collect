---
title: "100以内加减法生成器"
published: 2026-09-08
description: "类似的软件有很多，但是不太符合我的想法。所以作了一个符合二年级的计算规则的工具。可以保存图片。 规则1、加法的结果不能大于 100，减法的结果不能小于 0。 规则2、每次点击，生成一页算题，共 54 道。 新增规则： ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "Sai01"
sourceLink: "https://www.52pojie.cn/thread-2127036-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2127036-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

类似的软件有很多，但是不太符合我的想法。所以作了一个符合二年级的计算规则的工具。可以保存图片。

规则1、加法的结果不能大于 100，减法的结果不能小于 0。

规则2、每次点击，生成一页算题，共 54 道。

新增规则：取消10以内的加减法，去除重复题目。

以下是部分代码：

1. 加法生成（操作数≥10，结果≤100）

function makeAddition() {  var a = randInt(10, 90);        // 第一个数 ≥10  var maxB = 100 - a;  var b = randInt(10, maxB);       // 第二个数 ≥10，且 a+b≤100  return a + ' + ' + b + ' =';}

2.减法生成（操作数≥10，结果≥0）

function makeSubtraction() {  var a = randInt(10, 100);        // 被减数 ≥10  var b = randInt(10, a);           // 减数 ≥10，且 b≤a 保证结果≥0  return a + ' - ' + b + ' =';}

3.去重生成 54 道

var seen = new Set();       // 去重集合var problems = [];while (problems.length < 54) {  var expr = Math.random() < 0.5 ? makeAddition() : makeSubtraction();  if (!seen.has(expr)) {     // 只收录未出现过的题    seen.add(expr);    problems.push(expr);  }}

---

[查看原文](https://www.52pojie.cn/thread-2127036-1-1.html)
