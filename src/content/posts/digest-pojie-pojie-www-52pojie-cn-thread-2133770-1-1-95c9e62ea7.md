---
title: "材料库存管理"
published: 2026-10-22
description: "https://wwbmj.lanzouu.com/imR4y4cyrpjc 密码:2j2a 物品耗材库存管理 V1.0.0 单机版库存小工具：管入库、出库和结存，支持搜索、预警、单据导出。临期、过期、低库存会提醒；可导出 Excel / PDF，数据保存在本机，使用简单。 [mw_shl_code=c, ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "再贱就再见"
sourceLink: "https://www.52pojie.cn/thread-2133770-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2133770-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

https://wwbmj.lanzouu.com/imR4y4cyrpjc

密码:2j2a

**物品耗材库存管理 V1.0.0**

单机版库存小工具：管入库、出库和结存，支持搜索、预警、单据导出。临期、过期、低库存会提醒；可导出 Excel / PDF，数据保存在本机，使用简单。

![](https://static.52pojie.cn/static/image/smiley/default/3.gif)

![](https://attach.52pojie.cn/forum/202610/22/171759lj25bemybjjjurue.png)

[C] *纯文本查看* *复制代码*
// ---- export_excel.c:115-174 ----
/*
* 【入库范围 Excel】
* 过滤 datetime∈[from,to] 的入库单，所有明细行写入同一 CSV（含单号、日期时间列）。
* 文件名：exports/入库_起_止_时间戳.csv（经 path_sanitize + fopen_u8）。
*/
int export_inbound_range_excel(const DocStore *store, const char *from_dt, const char *to_dt,
char *out_path, size_t out_n) {
FILE *fp;
char path[YP_MAX_PATH];
char ts[32];
time_t now;
struct tm *tm;
int i, j, rows = 0;

if (!store) return -1;
settings_load(&g_settings);
now = time(NULL);
tm = localtime(&now);
if (tm)
snprintf(ts, sizeof(ts), "%04d%02d%02d_%02d%02d%02d",
tm->tm_year + 1900, tm->tm_mon + 1, tm->tm_mday,
tm->tm_hour, tm->tm_min, tm->tm_sec);
else
safe_copy(ts, sizeof(ts), "export");
snprintf(path, sizeof(path), "exports/入库_%s_%s_%s.csv",
from_dt && from_dt[0] ? from_dt : "all",
to_dt && to_dt[0] ? to_dt : "all", ts);
path_sanitize_filename(path);
if (ensure_dirs() != 0) return -1;
fp = fopen_u8(path, "wb");
if (!fp) return -1;
write_bom(fp);
fprintf(fp, "单号,日期时间,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
lbl_name(), lbl_spec(), lbl_mfg(), lbl_unit(),
lbl_qty(), lbl_price(), lbl_amount(),
lbl_batch(), lbl_prod_date(), lbl_expiry(), lbl_note());
for (i = 0; i count; i++) {
const Document *d = &store->docs[i];
if (!datetime_in_range(d->datetime, from_dt, to_dt))
continue;
for (j = 0; j line_count; j++) {
const Item *it = &d->lines[j];
csv_cell(fp, d->docno); fputc(',', fp);
csv_cell(fp, d->datetime); fputc(',', fp);
csv_cell(fp, it->name); fputc(',', fp);
csv_cell(fp, it->spec); fputc(',', fp);
csv_cell(fp, it->mfg); fputc(',', fp);
csv_cell(fp, it->unit); fputc(',', fp);
fprintf(fp, "%.0f,%.2f,%.2f,", it->qty, it->price, money(it->qty, it->price));
csv_cell(fp, it->batch); fputc(',', fp);
csv_cell(fp, it->prod_date); fputc(',', fp);
csv_cell(fp, it->expiry); fputc(',', fp);
csv_cell(fp, it->note); fputc('\n', fp);
rows++;
}
}
fclose(fp);
if (out_path && out_n) safe_copy(out_path, out_n, path);
return (rows > 0) ? 0 : -2; /* -2: no matching rows */
}

// ---- export_html.c:1-3 ----
/* export_html.c — 单据 HTML 导出（浏览器 Ctrl+P 另存 PDF）。
* 单张出/入库单；入库还可按时间范围合并多单为一份汇总页。中文文件名经 fopen_u8。 */
#include "export_html.h"

// ---- export_html.c:24-113 ----
/* 单张单据 HTML；出库单页脚输出领取单位/人、经办人、审核人 */
int export_document_html(const Document *doc, char *out_path, size_t out_n) {
FILE *fp;
int i;
double total = 0;
const char *title = doc->type == DOC_IN ? "入库单" : "出库单";
const char *file_prefix = doc->type == DOC_IN ? "入库" : "出库";
char path[YP_MAX_PATH];

settings_load(&g_settings);

/* UTF-8 Chinese name; open via CreateFileW (fopen_u8) */
snprintf(path, sizeof(path), "exports/%s_%s.html", file_prefix, doc->docno);
path_sanitize_filename(path);
if (ensure_dirs() != 0) return -1;
fp = fopen_u8(path, "wb");
if (!fp) {
fprintf(stderr, "无法创建 %s\n", path);
return -1;

---

[查看原文](https://www.52pojie.cn/thread-2133770-1-1.html)
