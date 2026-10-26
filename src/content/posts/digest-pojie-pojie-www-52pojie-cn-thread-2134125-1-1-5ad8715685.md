---
title: "账单助手--一个很奇怪的账单助手"
published: 2026-10-25
description: "最近邮箱安全吗用多了,ai了个一个很奇怪的邮箱记账助手 就是你自己给你自己邮箱发主题为账单的主题,内容比如苹果5斤10元,这个开在电脑上就会自动记账 没有单位也行,比如补胎30 邮箱内容要换行 苹果 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "再贱就再见"
sourceLink: "https://www.52pojie.cn/thread-2134125-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2134125-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

最近邮箱安全吗用多了,ai了个一个很奇怪的邮箱记账助手{:1_907:}

就是你自己给你自己邮箱发主题为账单的主题,内容比如苹果5斤10元,这个开在电脑上就会自动记账

没有单位也行,比如补胎30

邮箱内容要换行

苹果5斤10元

补胎30

吃饭10

晚餐1

要这种格式

{:1_896:}

![](https://static.52pojie.cn/static/image/common/none.gif)

**1.png** *(35.47 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4ODYzMXxlOTM2YjU2MHwxNzkyOTg3ODA5fDB8MjEzNDEyNQ%3D%3D&nothumb=yes)

2026-10-25 12:40 上传

https://wwbmj.lanzouu.com/iDVLx4dagsre

密码:2z1g

[C] *纯文本查看* *复制代码*

static int name_is_sane(const char *n) {
    size_t len = strlen(n);
    const unsigned char *p;
    if (len == 0 || len > 96) return 0;
    for (p = (const unsigned char *)n; *p; p++) {
        unsigned char c = *p;
        if (c == '' || c == '=' || c == '*' ||
            c == '{' || c == '}' || c == '\\' || c == '|' ||
            c == '"' || c == '`')
            return 0;
    }
    if (strstr(n, "http://") || strstr(n, "https://")) return 0;
    return 1;
}

/*
 * 解析一行账单。require_currency=1 时必须有“元/块/￥/&#165;/$”，
 * 用于普通邮件，避免广告里的数字被误记。
 *
 * 支持：
 *   香蕉5斤20元        -> 数量 5，单位 斤，金额 20
 *   砌砖5平方米2400元  -> 数量 5，单位 平方米，金额 2400
 *   砌砖2400元         -> 数量 1，单位 项，金额 2400
 */
static int parse_bill_line_ex(const char *line, BillItem *out, int require_currency) {
    const char *p = line;
    char name[MAX_NAME];
    char unit[MAX_UNIT];
    size_t ni = 0, ui = 0;
    double qty = 0, amount = 0;
    char *endp;
    int skip, had_currency = 0, single_amount = 0;

    memset(out, 0, sizeof *out);
    memset(name, 0, sizeof name);
    memset(unit, 0, sizeof unit);

    while (*p && isspace((unsigned char)*p)) p++;
    if (!*p) return 0;

    /* 名称：一直读到第一个数字 */
    while (*p && !isdigit((unsigned char)*p) && *p != '.' && ni + 1  0) {
            const char *q = p;
            while (*q && isspace((unsigned char)*q)) q++;
            if (isdigit((unsigned char)*q) || *q == '.') break;
            name[ni++] = ' ';
            p = q;
            continue;
        }
        if (isspace((unsigned char)*p)) { p++; continue; }
        name[ni++] = *p++;
    }
    name[ni] = '\0';
    trim(name);
    if (!name[0]) return 0;

    while (*p && isspace((unsigned char)*p)) p++;
    if (!isdigit((unsigned char)*p) && *p != '.') return 0;

    /* 第一个数字先按数量解析 */
    qty = strtod(p, &endp);
    if (endp == p) return 0;
    p = endp;
    while (*p && isspace((unsigned char)*p)) p++;

    skip = is_money_suffix((const unsigned char *)p);
    if (skip) {
        /* 名称+金额，没有数量单位：砌砖2400元 -> 1 项 */
        amount = qty;
        qty = 1;
        single_amount = 1;
        had_currency = 1;
        p += skip;
    } else if (*p == '\0' && !require_currency) {
        /* 本地输入允许省略“元”：砌砖2400 */
        amount = qty;
        qty = 1;
        single_amount = 1;
    } else {
        /* 名称+数量+单位+金额：香蕉5斤20元 */
        while (*p && !isdigit((unsigned char)*p) && *p != '.' && ui + 1  1000000.0 || amount > 100000000.0) return 0;
    if (require_currency && !had_currency) return 0;
    if (!name_is_sane(name)) return 0;

    /* 拒绝 MIME 分隔线、HTML 残留 */
    if (name[0] == '-' || name[0] == '=' || name[0] == '= 0x80) { has_text = 1; break; }
        }
        if (!has_text) return 0;
    }

    if (!unit[0]) snprintf(unit, sizeof unit, single_amount ? "项" : "个");
    if (!unit_is_sane(unit)) return 0;

    snprintf(out->name, sizeof out->name, "%s", name);
    out->qty = qty;
    snprintf(out->unit, sizeof out->unit, "%s", unit);
    out->amount = amount;
    return 1;
}

/* 本地输入：允许省略“元” */
static int parse_bill_line(const char *line, BillItem *out) {
    return parse_bill_line_ex(line, out, 0);
}

/* ===================== 3. bills.csv 读取 / 排序 / 写入 ===================== */

/* 解析 CSV 一行：名称可能带引号和逗号 */
static int parse_bill_row(const char *line, BillRow *r) {
    const char *p = line;
    char *endp;
    size_t ni = 0, ui = 0;

    memset(r, 0, sizeof *r);
    while (*p == ' ' || *p == '\t') p++;

    if (*p == '"') {
        p++;
        while (*p && ni + 1 name) {
            if (*p == '"') {
                if (p[1] == '"') { r->name[ni++] = '"'; p += 2; continue; }
                p++;
                break;
            }
            r->name[ni++] = *p++;
        }
        r->name[ni] = '\0';
        if (*p == ',') p++;
    } else {
        while (*p && *p != ',' && ni + 1 name)
            r->name[ni++] = *p++;
        r->name[ni] = '\0';
        if (*p == ',') p++;
    }
    trim(r->name);

    r->qty = strtod(p, &endp);
    if (endp == p) return 0;
    p = endp;
    if (*p == ',') p++;

    while (*p && *p != ',' && ui + 1 unit)
        r->unit[ui++] = *p++;
    r->unit[ui] = '\0';
    trim(r->unit);
    if (*p == ',') p++;

    r->amount = strtod(p, &endp);
    if (endp == p) return 0;
    p = endp;
    if (*p == ',') p++;

    snprintf(r->time, sizeof r->time, "%s", p);
    trim(r->time);
    return 1;
}

/* 时间倒序；同一秒保持文件顺序，避免删除重写后翻转 */
static int bill_cmp_newest(const void *a, const void *b) {
    const BillRow *x = (const BillRow *)a;
    const BillRow *y = (const BillRow *)b;
    int c = strcmp(y->time, x->time);
    if (c != 0) return c;
    if (x->seq seq) return -1;
    if (x->seq > y->seq) return 1;
    return 0;
}

static void free_bill_rows(void) {
    int i;
    for (i = 0; i  0 && (line[n - 1] == '\n' || line[n - 1] == '\r'))
            line[--n] = '\0';

        if (first) {
            first = 0;
            if ((unsigned char)line[0] == 0xEF &&
                (unsigned char)line[1] == 0xBB &&
                (unsigned char)line[2] == 0xBF) {
                memmove(line, line + 3, strlen(line + 3) + 1);
            }
            if (strncmp(line, "名称,", 7) == 0) continue; /* 跳过表头 */
        }
        if (!line[0]) continue;

        nr = (BillRow *)realloc(g_bills, ((size_t)g_nbills + 1) * sizeof *nr);
        if (!nr) break;
        g_bills = nr;
        memset(&g_bills[g_nbills], 0, sizeof g_bills[g_nbills]);
        if (!parse_bill_row(line, &g_bills[g_nbills])) {
            snprintf(g_bills[g_nbills].name, sizeof g_bills[g_nbills].name,
                     "（无法解析）");
            g_bills[g_nbills].qty = 0;
            g_bills[g_nbills].amount = 0;
            g_bills[g_nbills].unit[0] = '\0';
            g_bills[g_nbills].time[0] = '\0';
        }
        g_bills[g_nbills].raw = strdup(line);
        g_bills[g_nbills].seq = g_nbills;
        g_nbills++;
    }
    fclose(fp);
    if (g_nbills > 1)
        qsort(g_bills, (size_t)g_nbills, sizeof g_bills[0], bill_cmp_newest);
}

static int ensure_csv_header(void) {
    FILE *fp = fopen(g_csvPath, "r");
    if (fp) { fclose(fp); return 0; }
    fp = fopen(g_csvPath, "w");
    if (!fp) return -1;
    fputs("\xEF\xBB\xBF", fp);
    fprintf(fp, "名称,数量,单位,金额,时间\n");
    fclose(fp);
    return 0;
}

static int append_csv(const BillItem *it) {
    char tbuf[64];
    FILE *fp;
    if (ensure_csv_header() != 0) return -1;
    fp = fopen(g_csvPath, "a");
    if (!fp) return -1;
    now_str(tbuf, sizeof tbuf);
    fprintf(fp, "\"%s\",%.4g,%s,%.2f,%s\n",
            it->name, it->qty, it->unit, it->amount, tbuf);
    fclose(fp);
    return 0;
}

/* ===================== 4. 搜索 ===================== */

/* ASCII 不区分大小写；中文按 UTF-8 字节直接匹配 */
static int ci_contains(const char *hay, const char *needle) {
    size_t n = strlen(needle);
    if (n == 0) return 1;
    for (; *hay; hay++) {
        size_t i;
        for (i = 0; i = 'A' && a = 'A' && b name, g_search_text)) return 1;
    if (ci_contains(r->unit, g_search_text)) return 1;
    if (ci_contains(r->time, g_search_text)) return 1;
    snprintf(num, sizeof num, "%.4g", r->qty);
    if (ci_contains(num, g_search_text)) return 1;
    snprintf(num, sizeof num, "%.2f", r->amount);
    if (ci_contains(num, g_search_text)) return 1;
    return 0;
}

/* ===================== 5. 表格刷新 ===================== */

static void refresh_bill_table(void) {
    int i, shown = 0;

    if (!g_hList) return;
    ListView_DeleteAllItems(g_hList);
    load_bill_rows();

    for (i = 0; i = 0 && ri = 256) continue;
            snprintf(items[j].name, sizeof items[j].name, "%s", g_bills[i].name);
            items[j].count = 0;
            items[j].sum = 0;
            (*nitems)++;
        }
        items[j].count++;
        items[j].sum += g_bills[i].amount;
        (*count)++;
        *total += g_bills[i].amount;
    }
}

/* 填充汇总表格：名称 / 笔数 / 金额 */
static void summary_fill(void) {
    SummaryItem items[256];
    wchar_t wname[MAX_NAME], wcount[32], wamt[32], wtotal[192];
    int n = 0, count = 0, i;
    double total = 0;

    if (!g_summaryList) return;
    ListView_DeleteAllItems(g_summaryList);
    summary_collect(items, &n, &count, &total);

    for (i = 0; i

---

[查看原文](https://www.52pojie.cn/thread-2134125-1-1.html)
