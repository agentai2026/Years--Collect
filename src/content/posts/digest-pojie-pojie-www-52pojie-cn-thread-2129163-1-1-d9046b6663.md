---
title: "EmEditor JSON 格式化宏：支持选中、全文和截断 JSON"
published: 2026-09-21
description: "自己写了一个 EmEditor 的 JSON 格式化宏，平时查看接口返回或日志里的 JSON 很方便。 选中内容时只格式化选中部分，没有选中则自动格式化全文；对于末尾被截断的 JSON，也会临时补齐后完成格式化，再删除自动补齐的内容 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "ammo"
sourceLink: "https://www.52pojie.cn/thread-2129163-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2129163-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

自己写了一个 EmEditor 的 JSON 格式化宏，平时查看接口返回或日志里的 JSON 很方便。

选中内容时只格式化选中部分，没有选中则自动格式化全文；对于末尾被截断的 JSON，也会临时补齐后完成格式化，再删除自动补齐的内容，保持原来的截断状态。

还可以在 EmEditor 中给宏配置快捷键，比如设置成和 IDEA 一样的 Ctrl + Alt + L，使用起来基本和 IDE 格式化代码一样顺手。

默认使用4个空格缩进，JSON 有问题时会弹窗提示。

宏代码放在下面，有需要的朋友可以直接复制并保存为 .jsee 文件使用。

需要注意：超长数字可能存在 JavaScript 精度问题，Long 类型 ID 建议使用字符串表示。

[Asm] *纯文本查看* *复制代码*
// 选中内容格式化；没有选中则格式化全文
var selectedText = document.selection.Text;

if (selectedText.length === 0) {
    document.selection.SelectAll();
    selectedText = document.selection.Text;
}

if (/^\s*$/.test(selectedText)) {
    alert("当前文档没有内容！");
} else {
    try {
        var result = formatJson(selectedText);
        document.selection.Text = result.text;

        if (result.repaired) {
            alert("已临时补齐并格式化，补齐的内容已删除。");
        }
    } catch (e) {
        alert("JSON 无法格式化：\n" + e.message);
    }
}

function formatJson(text) {
    text = text.replace(/^\uFEFF/, "");

    // 完整 JSON 直接格式化
    try {
        return {
            text: JSON.stringify(JSON.parse(text), null, 4),
            repaired: false
        };
    } catch (ignore) {
    }

    var repair = repairTruncatedJson(text);
    var formatted = JSON.stringify(
        JSON.parse(repair.text),
        null,
        4
    );

    // 删除临时补齐的括号
    for (var i = repair.closers.length - 1; i >= 0; i--) {
        formatted = removeLastExpected(
            formatted,
            repair.closers.charAt(i)
        );
    }

    formatted = rtrim(formatted);

    // 删除临时补充的 null，恢复为冒号结尾
    if (repair.addedNull) {
        formatted = formatted.replace(/null\s*$/, "");
        formatted = rtrim(formatted);
    }

    // 恢复原来的末尾逗号
    if (repair.removedComma) {
        formatted = rtrim(formatted) + ",";
    }

    // 删除临时补齐的字符串双引号
    if (repair.addedQuote) {
        formatted = removeLastExpected(formatted, "\"");

        // 原文最后是单个反斜杠时，修复阶段额外补了一个
        if (repair.addedBackslash) {
            formatted = removeLastExpected(formatted, "\\");
        }
    }

    return {
        text: formatted,
        repaired: true
    };
}

function repairTruncatedJson(originalText) {
    var text = originalText.replace(/^\s+|\s+$/g, "");
    var stack = [];
    var inString = false;
    var escaped = false;

    for (var i = 0; i  0) {
        var closer = stack.pop();
        text += closer;
        closers += closer;
    }

    return {
        text: text,
        closers: closers,
        addedQuote: addedQuote,
        addedBackslash: addedBackslash,
        removedComma: removedComma,
        addedNull: addedNull
    };
}

// 删除末尾指定的补齐字符
function removeLastExpected(text, expected) {
    var index = text.length - 1;

    while (index >= 0 && /\s/.test(text.charAt(index))) {
        index--;
    }

    if (index

---

[查看原文](https://www.52pojie.cn/thread-2129163-1-1.html)
