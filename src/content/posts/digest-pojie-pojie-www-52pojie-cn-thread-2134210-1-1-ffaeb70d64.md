---
title: "库存管理"
published: 2026-10-26
description: "转载个电脑+手机配合的进销存软件，管库存、管批号效期、管单据、能打印能导出，手机上还能扫码和拍照直接录入 所有的单据名称表头,都可以自己设置改名 这个软件还有个彩蛋 主要功能电脑端 [*]入库/ ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "再贱就再见"
sourceLink: "https://www.52pojie.cn/thread-2134210-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2134210-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

**转载个电脑+手机配合的进销存软件，管库存、管批号效期、管单据、能打印能导出，手机上还能扫码和拍照直接录入**

**所有的****单据名称表头,****都可以自己设置改名**

**

这个软件还有个彩蛋**

![](https://static.52pojie.cn/static/image/smiley/default/2.gif)

**主要功能**电脑端
入库/出库 —— 数量正负加减，名称规格批号效期一改就按新物品记；库存不足自动拦库存管理 —— 十多个字段可显示/隐藏、可改名，支持名称和拼音首字母搜索，分页浏览预警提醒 —— 临期、过期、低库存，启动自动弹窗，天数/阈值可设出入库单据 —— 自动单号，可合并、可撤销合并，按时间范围导出导出打印 —— 库存导 Excel，单据导网页打印/另存 PDF；字号边距单号大小可调，也能自定义模板系统设置 —— 软件改名（自动改 exe 名）、密码、窗口大小、字段名称

手机端

    7. 扫码入库/出库 —— 扫条码或二维码，匹配库存后填数量，可以一直扫，点取消才退出

    8. 拍照识别 —— 拍包装自动识别名称、规格、批号、有效期等，逐行勾选、可改字、可指定字段后入库

    9. 手机出库 —— 列表选物品填数量即可，电脑端同步生成出库单

   10. 跟电脑一套规则 —— 电脑隐藏的字段手机也不显示；电脑改的字段名手机同步共同点：不用数据库、不用服务器、不用联网，数据是 CSV 文本，随时备份，Excel 能打开核对。

![](https://static.52pojie.cn/static/image/common/none.gif)

**1.png** *(101.22 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4ODc1MXwzYzNmNTdlZXwxNzkzMDY2NTEwfDB8MjEzNDIxMA%3D%3D&nothumb=yes)

2026-10-26 09:23 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**2.png** *(53.83 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4ODc1MnwwMzUwNTMyNnwxNzkzMDY2NTEwfDB8MjEzNDIxMA%3D%3D&nothumb=yes)

2026-10-26 09:23 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**3.png** *(28.46 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4ODc1M3w1NjRkMDQ2N3wxNzkzMDY2NTEwfDB8MjEzNDIxMA%3D%3D&nothumb=yes)

2026-10-26 09:23 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**4.png** *(41.22 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4ODc1NHxmZmYwMzllOXwxNzkzMDY2NTEwfDB8MjEzNDIxMA%3D%3D&nothumb=yes)

2026-10-26 09:23 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**5.png** *(41.97 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4ODc1NXxmMGUzZDIzNnwxNzkzMDY2NTEwfDB8MjEzNDIxMA%3D%3D&nothumb=yes)

2026-10-26 09:23 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**6.png** *(151.29 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4ODc1NnxmZmNiZTUzZXwxNzkzMDY2NTEwfDB8MjEzNDIxMA%3D%3D&nothumb=yes)

2026-10-26 09:23 上传

更新了出库少于库存的提醒,可以设置提醒字体大小

更新了出库单入库单可以加备注

更新了可以自定义设置提醒的颜色

https://wwbmj.lanzouu.com/iG1dr4dfzjyb

密码:h216

觉得有用的请给与支持！！！

觉得有用的请给与支持！！！

觉得有用的请给与支持！！！

![](https://static.52pojie.cn/static/image/smiley/default/lol.gif)

[C] *纯文本查看* *复制代码*
#include "document.h"
#include
#include
#include

#define IN_HDR  "data/inbound_docs.csv"
#define IN_DET  "data/inbound_lines.csv"
#define OUT_HDR "data/outbound_docs.csv"
#define OUT_DET "data/outbound_lines.csv"

static const char *hdr_path(DocType t) { return t == DOC_IN ? IN_HDR : OUT_HDR; }
static const char *det_path(DocType t) { return t == DOC_IN ? IN_DET : OUT_DET; }

int docs_load_from(DocStore *store, DocType type, const char *hdr_file, const char *det_file) {
    FILE *fh, *fd;
    char line[MAX_LINE];
    char *fields[16];
    int i;

    memset(store, 0, sizeof(*store));
    fh = fopen(hdr_file, "rb");
    if (!fh) return 0;
    {
        unsigned char bom[3];
        size_t n = fread(bom, 1, 3, fh);
        if (!(n == 3 && bom[0] == 0xEF && bom[1] == 0xBB && bom[2] == 0xBF))
            fseek(fh, 0, SEEK_SET);
    }
    if (!fgets(line, sizeof(line), fh)) { fclose(fh); return 0; }
    while (fgets(line, sizeof(line), fh) && store->count  0 && (line[len - 1] == '\n' || line[len - 1] == '\r'))
            line[--len] = '\0';
        if (!line[0]) continue;
        nf = csv_split(line, fields, 16);
        if (nf docs[store->count];
        memset(doc, 0, sizeof(*doc));
        safe_copy(doc->docno, sizeof(doc->docno), fields[0]);
        safe_copy(doc->datetime, sizeof(doc->datetime), fields[1]);
        doc->type = type;

        if (nf >= 9 && strcmp(fields[2], "入库") != 0 && strcmp(fields[2], "出库") != 0) {
            safe_copy(doc->hdr_a, sizeof(doc->hdr_a), fields[2]);
            safe_copy(doc->hdr_b, sizeof(doc->hdr_b), fields[3]);
            safe_copy(doc->hdr_c, sizeof(doc->hdr_c), fields[4]);
            safe_copy(doc->recv_unit, sizeof(doc->recv_unit), fields[5]);
            safe_copy(doc->recv_person, sizeof(doc->recv_person), fields[6]);
            safe_copy(doc->handler, sizeof(doc->handler), fields[7]);
            safe_copy(doc->auditor, sizeof(doc->auditor), fields[8]);
        } else if (nf >= 6 && strcmp(fields[2], "入库") != 0 && strcmp(fields[2], "出库") != 0) {
            safe_copy(doc->recv_unit, sizeof(doc->recv_unit), fields[2]);
            safe_copy(doc->recv_person, sizeof(doc->recv_person), fields[3]);
            safe_copy(doc->handler, sizeof(doc->handler), fields[4]);
            safe_copy(doc->auditor, sizeof(doc->auditor), fields[5]);
            safe_copy(doc->hdr_a, sizeof(doc->hdr_a), doc->recv_unit);
        }
        doc->line_count = 0;
        store->count++;
    }
    fclose(fh);

    fd = fopen(det_file, "rb");
    if (!fd) return 0;
    {
        unsigned char bom[3];
        size_t n = fread(bom, 1, 3, fd);
        if (!(n == 3 && bom[0] == 0xEF && bom[1] == 0xBB && bom[2] == 0xBF))
            fseek(fd, 0, SEEK_SET);
    }
    if (!fgets(line, sizeof(line), fd)) { fclose(fd); return 0; }
    while (fgets(line, sizeof(line), fd)) {
        Document *doc = NULL;
        Item *it;
        int nf;
        size_t len = strlen(line);
        while (len > 0 && (line[len - 1] == '\n' || line[len - 1] == '\r'))
            line[--len] = '\0';
        if (!line[0]) continue;
        nf = csv_split(line, fields, 16);
        if (nf count; i++) {
            if (strcmp(store->docs[i].docno, fields[0]) == 0) {
                doc = &store->docs[i];
                break;
            }
        }
        if (!doc || doc->line_count >= MAX_LINES) continue;
        it = &doc->lines[doc->line_count];
        memset(it, 0, sizeof(*it));
        safe_copy(it->name, sizeof(it->name), fields[1]);
        safe_copy(it->spec, sizeof(it->spec), fields[2]);
        safe_copy(it->mfg, sizeof(it->mfg), fields[3]);
        safe_copy(it->unit, sizeof(it->unit), fields[4]);
        it->qty = atof(fields[5]);
        it->price = atof(fields[6]);

        if (nf >= 12) {
            safe_copy(it->batch, sizeof(it->batch), fields[8]);
            safe_copy(it->prod_date, sizeof(it->prod_date), fields[9]);
            safe_copy(it->expiry, sizeof(it->expiry), fields[10]);
            safe_copy(it->note, sizeof(it->note), fields[11]);
            if (nf >= 13)
                safe_copy(it->inbound_time, sizeof(it->inbound_time), fields[12]);
        } else {
            safe_copy(it->batch, sizeof(it->batch), fields[7]);
            safe_copy(it->prod_date, sizeof(it->prod_date), fields[8]);
            safe_copy(it->expiry, sizeof(it->expiry), fields[9]);
            if (nf > 10) safe_copy(it->note, sizeof(it->note), fields[10]);
        }
        doc->line_count++;
    }
    fclose(fd);

    if (type == DOC_IN) {
        int k;
        for (i = 0; i count; i++) {
            for (k = 0; k docs[i].line_count; k++) {
                Item *it = &store->docs[i].lines[k];
                if (!it->inbound_time[0])
                    safe_copy(it->inbound_time, sizeof(it->inbound_time),
                              store->docs[i].datetime);
            }
        }
    }
    return 0;
}

int docs_load(DocStore *store, DocType type) {
    return docs_load_from(store, type, hdr_path(type), det_path(type));
}

int docs_save_from(const DocStore *store, DocType type, const char *hdr_file, const char *det_file) {
    FILE *fh, *fd;
    int i, j;
    char esc[MAX_NOTE * 2];

    fh = fopen(hdr_file, "wb");
    if (!fh) return -1;
    fputc(0xEF, fh); fputc(0xBB, fh); fputc(0xBF, fh);
    fprintf(fh, "单号,日期时间,头栏A,头栏B,头栏C,领取单位,领取人,经办人,审核人,类型\n");
    for (i = 0; i count; i++) {
        const Document *d = &store->docs[i];
        csv_escape(d->docno, esc, sizeof(esc));
        fprintf(fh, "%s,", esc);
        csv_escape(d->datetime, esc, sizeof(esc));
        fprintf(fh, "%s,", esc);
        csv_escape(d->hdr_a, esc, sizeof(esc));
        fprintf(fh, "%s,", esc);
        csv_escape(d->hdr_b, esc, sizeof(esc));
        fprintf(fh, "%s,", esc);
        csv_escape(d->hdr_c, esc, sizeof(esc));
        fprintf(fh, "%s,", esc);
        csv_escape(d->recv_unit, esc, sizeof(esc));
        fprintf(fh, "%s,", esc);
        csv_escape(d->recv_person, esc, sizeof(esc));
        fprintf(fh, "%s,", esc);
        csv_escape(d->handler, esc, sizeof(esc));
        fprintf(fh, "%s,", esc);
        csv_escape(d->auditor, esc, sizeof(esc));
        fprintf(fh, "%s,%s\n", esc, type == DOC_IN ? "入库" : "出库");
    }
    fclose(fh);

    fd = fopen(det_file, "wb");
    if (!fd) return -1;
    fputc(0xEF, fd); fputc(0xBB, fd); fputc(0xBF, fd);
    fprintf(fd, "单号,通用名称,规格型号,生产企业,单位,数量,单价,金额,产品批号,生产日期,有效期限,备注,入库时间\n");
    for (i = 0; i count; i++) {
        const Document *d = &store->docs[i];
        for (j = 0; j line_count; j++) {
            const Item *it = &d->lines[j];
            csv_escape(d->docno, esc, sizeof(esc));
            fprintf(fd, "%s,", esc);
            csv_escape(it->name, esc, sizeof(esc));
            fprintf(fd, "%s,", esc);
            csv_escape(it->spec, esc, sizeof(esc));
            fprintf(fd, "%s,", esc);
            csv_escape(it->mfg, esc, sizeof(esc));
            fprintf(fd, "%s,", esc);
            csv_escape(it->unit, esc, sizeof(esc));
            fprintf(fd, "%s,", esc);
            fprintf(fd, "%.4f,%.4f,%.2f,", it->qty, it->price, money(it->qty, it->price));
            csv_escape(it->batch, esc, sizeof(esc));
            fprintf(fd, "%s,", esc);
            csv_escape(it->prod_date, esc, sizeof(esc));
            fprintf(fd, "%s,", esc);
            csv_escape(it->expiry, esc, sizeof(esc));
            fprintf(fd, "%s,", esc);
            csv_escape(it->note, esc, sizeof(esc));
            fprintf(fd, "%s,", esc);
            csv_escape(it->inbound_time, esc, sizeof(esc));
            fprintf(fd, "%s\n", esc);
        }
    }
    fclose(fd);
    return 0;
}

int docs_save(const DocStore *store, DocType type) {
    return docs_save_from(store, type, hdr_path(type), det_path(type));
}

static int doc_dt_cmp(const void *a, const void *b) {
    const Document *x = (const Document *)a;
    const Document *y = (const Document *)b;
    int c = strcmp(x->datetime, y->datetime);
    if (c != 0) return c;
    return strcmp(x->docno, y->docno);
}

void docs_sort_by_datetime(DocStore *store) {
    if (!store || store->count docs, (size_t)store->count, sizeof(Document), doc_dt_cmp);
}

int docs_append(DocStore *store, const Document *doc) {
    if (store->count >= MAX_DOCS) return -1;
    store->docs[store->count] = *doc;
    store->count++;
    return docs_save(store, doc->type);
}

Document *docs_find(DocStore *store, const char *docno) {
    int i;
    for (i = 0; i count; i++) {
        if (strcmp(store->docs[i].docno, docno) == 0)
            return &store->docs[i];
    }
    return NULL;
}

int docs_restore_outbound(DocStore *out_store, Inventory *inv, const char *docno,
                          char *err, size_t err_n) {
    Document *d;
    int i, idx = -1;
    if (!out_store || !inv || !docno || !docno[0]) {
        if (err && err_n) snprintf(err, err_n, "参数错误");
        return -1;
    }
    for (i = 0; i count; i++) {
        if (strcmp(out_store->docs[i].docno, docno) == 0) {
            idx = i;
            break;
        }
    }
    if (idx docs[idx];
    if (d->type != DOC_OUT) {
        if (err && err_n) snprintf(err, err_n, "只能撤销出库单");
        return -1;
    }

    for (i = 0; i line_count; i++) {
        Item line = d->lines[i];
        int ki = inventory_find_key(inv, &line);
        if (ki >= 0)
            safe_copy(line.inbound_time, sizeof(line.inbound_time),
                      inv->items[ki].inbound_time);
        if (inventory_add_inbound(inv, &line) != 0) {
            if (err && err_n)
                snprintf(err, err_n, "回加库存失败：%s", line.name[0] ? line.name : "?");
            return -1;
        }
    }

    if (idx count - 1)
        memmove(&out_store->docs[idx], &out_store->docs[idx + 1],
                (size_t)(out_store->count - idx - 1) * sizeof(Document));
    out_store->count--;
    memset(&out_store->docs[out_store->count], 0, sizeof(Document));
    if (inventory_save(inv) != 0 || docs_save(out_store, DOC_OUT) != 0) {
        if (err && err_n) snprintf(err, err_n, "保存失败");
        return -1;
    }
    return 0;
}

---

[查看原文](https://www.52pojie.cn/thread-2134210-1-1.html)
