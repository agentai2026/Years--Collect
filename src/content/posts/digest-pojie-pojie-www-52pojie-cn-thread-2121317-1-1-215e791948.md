---
title: "每日健康记录"
published: 2026-08-04
description: "[md]## 项目简介 一个纯前端的"
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "yibeijiu"
sourceLink: "https://www.52pojie.cn/thread-2121317-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2121317-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

![](https://static.52pojie.cn/static/image/common/none.gif)

**Snipaste_2026-08-04_22-51-02.jpg** *(172.31 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg2OTU3MnxjOGU1MjdjMXwxNzg2MDc2NzA1fDB8MjEyMTMxNw%3D%3D&nothumb=yes)

2026-8-4 22:57 上传

### 项目简介

一个纯前端的每日健康记录网页，只有一个 HTML 文件，不需要安装软件，也不需要服务器。

数据保存在浏览器本地，不会自动上传。

### 功能

- 按日期记录和查看数据

- 睡眠、饮水、饮食和运动记录

- 心情、精力和压力评分

- 体温及身体不适记录

- 近 7 天趋势图

- 深色模式

- JSON 备份和恢复

- CSV 导出

- 手机和电脑自适应

### 使用方法

- 解压附件

- 双击 `daily_health_record.html`

- 填写数据后点击“保存记录”

- 定期使用“导出 JSON”备份

>
清理浏览器数据或更换电脑前，请先导出备份。

### 文件结构

`daily_health_record.html
使用说明.txt`

### 关键代码说明

#### 1. 本地保存

使用 `localStorage` 保存全部记录：

`const STORAGE_KEY = "dailyHealthRecords_v1";

function getRecords() {
  try {
    return JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "{}"
    );
  } catch {
    return {};
  }
}

function setRecords(records) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(records)
  );
}`
数据按日期保存，同一天再次保存时直接更新：

`const records = getRecords();
records[dateInput.value] = collectForm();
setRecords(records);`

#### 2. 收集表单数据

将页面输入统一整理成对象：

`function collectForm() {
  return {
    date: dateInput.value,
    sleepHours: Number(sleepHours.value),
    waterMl: Number(waterMl.value),
    exerciseMinutes: Number(exerciseMinutes.value),
    mood: Number(mood.value),
    energy: Number(energy.value),
    stress: Number(stress.value),
    notes: notes.value.trim(),
    updatedAt: new Date().toISOString()
  };
}`

#### 3. 趋势图

趋势图使用原生 Canvas 绘制，没有使用第三方图表库。

评分范围为 1～5，纵坐标换算如下：

`const y =
  pad.top +
  plotH -
  ((value - 1) / 4) * plotH;`
近 7 天的数据按日期连接，缺少数据的日期不会强行连线。

#### 4. 导出文件

使用 `Blob` 在浏览器中生成 JSON 或 CSV 文件：

`function downloadBlob(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}`
JSON 用于备份和恢复，CSV 可使用 Excel 或 WPS 打开。

### 隐私说明

- 无网络请求

- 无登录

- 无广告

- 无第三方 CDN

- 不上传健康数据

浏览器本地存储不是加密存储，不建议在公共电脑中记录敏感信息。

### 兼容性

建议使用 Edge、Chrome 或 Firefox，IE 不支持。

### 下载

文件：

![](https://static.52pojie.cn/static/image/filetype/zip.gif)

[daily_health_record.zip](forum.php?mod=attachment&aid=Mjg2OTU3M3w0NDAwODQ4OHwxNzg2MDc2NzA1fDB8MjEyMTMxNw%3D%3D)

*(11.48 KB, 下载次数: 18, 售价: 1 CB吾爱币)*

2026-8-4 22:58 上传

点击文件名下载附件

售价: 1 CB吾爱币	 [[记录]](forum.php?mod=misc&action=viewattachpayments&aid=2869573)

下载积分: 吾爱币 -1 CB

---

[查看原文](https://www.52pojie.cn/thread-2121317-1-1.html)
