---
title: "52pojie收藏夹助手"
published: 2026-09-21
description: "[md]```"
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "Su007"
sourceLink: "https://www.52pojie.cn/thread-2129178-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2129178-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

`52pojie收藏夹助手 —— 提取失效帖/更新检查`
代码参考来源：

-
☆千年琥珀☆ [https://www.52pojie.cn/thread-2068863-1-1.html](https://www.52pojie.cn/thread-2068863-1-1.html)

-
981930674 [https://www.52pojie.cn/thread-2105060-1-1.html](https://www.52pojie.cn/thread-2105060-1-1.html)

**更新内容：**

- 新增「一键提取失效收藏」，自动识别 5 类失效状态：楼主被封禁 / 帖子已删除 / 主题不存在 / 404 页面不存在 / 阅读权限不足

- 失效帖支持批量删除，删除后可在菜单里一键恢复

- 检测改为增量扫描，只测还没测过的，不用每次全量重扫

- 每条的失效状态可手动纠正（点状态标签标记「已忽略」），不用整轮重扫

- 新增 CSV 导出（8 列，Excel 直接打开），TXT 清单按类型分组

- 新增「诊断」，取不到页面时一键排查是哪一层被拦

- 原生弹窗全部换成自绘

**修复的问题：**

- 修复 GBK 编码。Discuz 页面是 gbk，所有中文关键词判定之前都在静默失配，失效帖会被归到"未知"而不是"失效"

- 修复「批量检测更新」永远报 **0 个有更新**。收藏时间经本地存储往返会退化成字符串，比较恒为 false（原版遗留）

- 修复 404 帖全部漏判。论坛 404 页是带 HTTP 404 状态码返回的，原先先判状态码后解析正文，直接跳过

- 修复采集过程中某一页失败会静默截断列表，并**用残缺列表覆盖缓存**，导致后面条目的检测结果全部丢失

- 修复三处缺少异常保护导致脚本"假死"（所有操作提示"有其他任务正在执行"，只能刷新页面）

- 修复更新检测把"请求失败"和"帖子没编辑过"混为一谈，被 WAF 拦时静默报 0 条

- 修复失效删除成功了但列表不更新（成功判定恒为失败）

**其他：**

- 帖子页挂在创宇盾 WAF 后面，非正常导航的请求会返回 JS 挑战页。识别到挑战页会立刻中止整轮，不再产生满屏假"异常"

- 撞到 429 会自动把后续间隔放大（×1.6，最高 8s），顺利时缓慢回落。检测时请勿把间隔调太小

- 楼主被封禁的屏蔽提示也可能出现在**回复**里，判定严格限定在首帖内，避免误杀

- 帖子正文引用 404 文案、标题里带 "404" 的，都不会被误判（有专门的回归测试）

![](https://img.meituan.net/csc/8bbe547b2712b27fc672053e671a039b195472.png)

![](https://img.meituan.net/csc/7e24cf5a6f8f59e7fa8cadc0c5d24edc107509.png)

![](https://img.meituan.net/csc/ad2a7de9053c8129cd959b8bf45ab3a486132.png)

判定优先级：

![](https://img.meituan.net/csc/8d35ee4906171054fcc820acb692ba74166136.png)

### 这里的代码复制后不生效，建议从蓝奏下载源码使用

`// ==UserScript==
// @name         52pojie全量收藏-右下角菜单+批量可正常启停+更新收藏时间+失效帖一键提取
// @namespace    http://tampermonkey.net/
// @version      5.6
// @description  在 4.3 基础上重构：一键提取失效收藏（楼主被封禁 / 已删除 / 主题不存在 / 404 / 权限不足）。GBK 显式解码、三通道传输、WAF/429 自适应退避、增量扫描、列表轻量校验、手动纠错、删除可恢复、自绘弹窗、CSV/TXT 导出
// @AuThor       专属定制
// @match        *://www.52pojie.cn/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_setClipboard
// @connect      52pojie.cn
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // ========== 可自定义配置项 ==========
    const DEFAULT_MAX_PAGE = 50;      // 收藏采集最大页数上限
    const DEFAULT_SCAN_DELAY = 1200;  // 失效检测每条间隔(ms)。论坛对高频请求会直接回 429，别调太低
    const DEFAULT_DEL_DELAY = 700;    // 批量删除间隔(ms)
    const DEAD_SCAN_TIMEOUT = 12000;  // 单个帖子页超时(ms)
    // =================================

    function isFavoritePage() {
        return location.href.includes('mod=space') && location.href.includes('do=favorite');
    }

    let favCacheList = null;
    let isLoading = false;
    let stopCheck = false;
    let formhashCache = '';
    let deadOnly = false;          // 列表是否只看失效
    let currentTask = '';          // 'scan' | 'delete' | 'batch' | ''

    function getMaxPage() {
        const val = GM_getValue("favMaxPage", "");
        const num = parseInt(val);
        return isNaN(num) || num  base) runtimeDelay = Math.max(base, Math.round(runtimeDelay * 0.92));
    }
    function resetDelay() { runtimeDelay = 0; }

    function getFormhash() {
        if (formhashCache) return formhashCache;
        const hashInput = document.querySelector('input[name="formhash"]');
        if (hashInput) formhashCache = hashInput.value;
        return formhashCache || '';
    }

    try {
        const cacheStr = GM_getValue("favCacheData", "");
        if (cacheStr) favCacheList = JSON.parse(cacheStr);
    } catch (e) {
        favCacheList = null;
    }

    GM_addStyle(`
        #cfMenuWrap {position:fixed;bottom:20px;right:20px;z-index:10000;font-size:13px;}
        #cfMenuBtn {width:50px;height:50px;background:#007bff;color:#fff;border:none;border-radius:8px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.25);}
        #cfMenuBtn:hover {background:#0056b3;}
        #cfMenuList {display:none;position:absolute;bottom:58px;right:0;background:#fff;border-radius:6px;box-shadow:0 2px 12px rgba(0,0,0,0.2);overflow:hidden;min-width:170px;}
        #cfMenuList.show {display:block;}
        .cf-menu-item {padding:10px 12px;cursor:pointer;white-space:nowrap;border-bottom:1px solid #f0f0f0;}
        .cf-menu-item:last-child {border-bottom:none;}
        .cf-menu-item:hover {background:#f5f7fa;}
        .update-indicator {color:#ff0000;font-weight:bold;margin-left:5px;}
        .progress-container {position:fixed;bottom:90px;right:20px;width:240px;background:#fff;border-radius:5px;box-shadow:0 2px 10px rgba(0,0,0,0.2);padding:10px;z-index:100002;display:none;}
        .progress-bar {height:10px;background:#e9ecef;border-radius:5px;overflow:hidden;}
        .progress-fill {height:100%;background:#28a745;width:0%;transition:width 0.3s ease;}
        .progress-text {font-size:12px;margin-top:5px;text-align:center;}
        #favModal {position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:90%;max-width:760px;max-height:78vh;background:#fff;border-radius:10px;box-shadow:0 4px 30px rgba(0,0,0,0.35);z-index:100001;display:none;overflow:hidden;}
        .modal-head {padding:12px 15px;background:#f8f9fa;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;}
        .modal-title {font-size:14px;font-weight:bold;color:#333;}
        .modal-close {color:#f56c6c;cursor:pointer;font-size:18px;font-weight:bold;}
        .head-btn {padding:4px 8px;border:none;border-radius:3px;cursor:pointer;font-size:12px;}
        #refreshFavBtn {background:#007bff;color:#fff;}
        #checkAllFavBtn {background:#dc3545;color:#fff;}
        #checkAllFavBtn.stop-bg {background:#6c757d;}
        #scanDeadBtn {background:#e67e22;color:#fff;}
        #scanDeadBtn.stop-bg {background:#6c757d;}
        #favSearchInput {width:calc(100% - 20px);margin:10px;padding:8px 12px;border:1px solid #007bff;border-radius:4px;outline:none;font-size:14px;background:#fff;}
        .modal-toolbar {display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:0 10px 10px;}
        .tool-btn {padding:4px 9px;border:1px solid #d0d0d0;background:#fff;border-radius:3px;cursor:pointer;font-size:12px;color:#333;}
        .tool-btn:hover {background:#f5f7fa;}
        .tool-btn.active {background:#007bff;border-color:#007bff;color:#fff;}
        .tool-btn.danger {border-color:#ff4444;color:#ff4444;}
        .tool-btn.danger:hover {background:#ff4444;color:#fff;}
        .fav-stats {font-size:12px;color:#666;margin-left:auto;}
        .modal-body {padding:10px;overflow-y:auto;max-height:calc(78vh - 170px);}
        .fav-item {padding:8px 10px;border-bottom:1px solid #f1f1f1;color:#0066cc;font-size:13px;display:flex;justify-content:space-between;align-items:center;gap:8px;}
        .fav-item.is-dead {background:#fffafa;}
        .fav-item.is-dead .fav-title {color:#a32d2d;text-decoration:line-through;}
        .fav-title {flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer;}
        .fav-update {color:red;font-weight:bold;}
        .fav-page-tag {color:#999;font-size:12px;white-space:nowrap;}
        .fav-btn {padding:2px 6px;color:#fff;border:none;border-radius:3px;font-size:12px;cursor:pointer;white-space:nowrap;margin-left:4px;}
        .fav-update-btn {background:#009688;}
        .fav-update-btn:hover {background:#00796b;}
        .fav-del-btn {background:#ff4444;}
        .fav-del-btn:hover {background:#cc0000;}
        .mask-layer {position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:100000;display:none;}
        .load-all-tip {text-align:center;padding:15px;color:#666;}
        .empty-tip {text-align:center;padding:30px;color:#999;}
        .dead-tag {font-size:11px;padding:1px 6px;border-radius:3px;white-space:nowrap;margin-left:6px;font-weight:normal;text-decoration:none;display:inline-block;}
        .dead-tag.t-banned {background:#fff3cd;color:#8a6d3b;border:1px solid #ffe08a;}
        .dead-tag.t-deleted {background:#fdecea;color:#a32d2d;border:1px solid #f5c2be;}
        .dead-tag.t-perm {background:#eef2f6;color:#5f6b7a;border:1px solid #d5dde5;}
        .dead-tag.t-unknown {background:#f4f4f4;color:#777;border:1px solid #e0e0e0;}
        .dead-tag.t-ignored {background:#f1efe8;color:#888780;border:1px solid #d3d1c7;}
        .dead-tag.clickable, .dead-tag[data-toggle] {cursor:pointer;}
        .dead-tag.clickable:hover {filter:brightness(0.94);}
        .diag {font-family:Consolas,Monaco,monospace;font-size:12px;line-height:1.55;white-space:pre-wrap;word-break:break-all;background:#fafaf8;border:1px solid #e5e5e0;border-radius:6px;padding:12px;color:#2c2c2a;margin:0;}
        /* ===== 自绘弹窗 ===== */
        #uiMask {position:fixed;inset:0;background:rgba(0,0,0,0.32);z-index:100010;display:none;}
        #uiDialog {position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:90%;max-width:430px;background:#fff;border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,0.26);z-index:100011;display:none;overflow:hidden;font-size:13px;color:#2c2c2a;}
        .ui-dlg-head {display:flex;align-items:center;gap:8px;padding:15px 16px 0;}
        .ui-dlg-dot {width:8px;height:8px;border-radius:50%;flex:0 0 auto;}
        .ui-dlg-title {font-size:14px;font-weight:500;flex:1;color:#2c2c2a;}
        .ui-dlg-x {cursor:pointer;color:#b4b2a9;font-size:19px;line-height:1;padding:0 2px;}
        .ui-dlg-x:hover {color:#5f5e5a;}
        .ui-dlg-body {padding:10px 16px 2px;line-height:1.7;white-space:pre-wrap;word-break:break-word;max-height:52vh;overflow-y:auto;color:#444441;}
        .ui-dlg-input {width:calc(100% - 32px);margin:12px 16px 0;padding:8px 10px;border:1px solid #d5dde5;border-radius:6px;font-size:13px;outline:none;color:#2c2c2a;box-sizing:border-box;}
        .ui-dlg-input:focus {border-color:#007bff;}
        .ui-dlg-foot {display:flex;justify-content:flex-end;gap:8px;padding:15px 16px 16px;}
        .ui-dlg-btn {padding:7px 16px;border-radius:6px;border:1px solid #d8d8d2;background:#fff;color:#444441;font-size:13px;cursor:pointer;}
        .ui-dlg-btn:hover {background:#f5f5f2;}
        .ui-dlg-btn.primary {background:#007bff;border-color:#007bff;color:#fff;}
        .ui-dlg-btn.primary:hover {background:#0069d9;}
        .ui-dlg-btn.danger {background:#e24b4a;border-color:#e24b4a;color:#fff;}
        .ui-dlg-btn.danger:hover {background:#c93f3e;}
        #uiToastWrap {position:fixed;top:18px;left:50%;transform:translateX(-50%);z-index:100020;display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none;}
        .ui-toast {background:#2c2c2a;color:#fff;padding:9px 16px;border-radius:8px;font-size:13px;box-shadow:0 6px 18px rgba(0,0,0,0.2);opacity:0;transform:translateY(-6px);transition:opacity .18s ease,transform .18s ease;max-width:70vw;}
        .ui-toast.show {opacity:1;transform:translateY(0);}
        .ui-toast.ok {background:#0f6e56;}
        .ui-toast.err {background:#a32d2d;}
        .ui-toast.warn {background:#ba7517;}
    `);

    const menuWrap = document.createElement("div");
    menuWrap.id = "cfMenuWrap";
    menuWrap.innerHTML = `
        收藏

            全部收藏列表

            本页检测更新

            一键提取失效收藏

            诊断（检测失败排查）

            恢复误删的收藏

            设置采集页数上限

    `;
    document.body.appendChild(menuWrap);

    // ====================== 自绘弹窗（替代浏览器原生 alert/confirm/prompt）======================
    const UI = (function () {
        const COLORS = { info: '#007bff', success: '#1d9e75', warn: '#ba7517', error: '#e24b4a', question: '#7f77dd' };
        const TITLES = { info: '提示', success: '完成', warn: '注意', error: '出错了', question: '请确认' };

        const mask = document.createElement('div'); mask.id = 'uiMask';
        const dlg = document.createElement('div'); dlg.id = 'uiDialog';
        dlg.innerHTML = `

                ×

        `;
        const toastWrap = document.createElement('div'); toastWrap.id = 'uiToastWrap';
        document.body.appendChild(mask);
        document.body.appendChild(dlg);
        document.body.appendChild(toastWrap);

        const elDot = dlg.querySelector('.ui-dlg-dot');
        const elTitle = dlg.querySelector('.ui-dlg-title');
        const elBody = dlg.querySelector('.ui-dlg-body');
        const elInput = dlg.querySelector('.ui-dlg-input');
        const elFoot = dlg.querySelector('.ui-dlg-foot');
        const elX = dlg.querySelector('.ui-dlg-x');

        let resolveFn = null, cancelValue = null;

        function settle(value) {
            const fn = resolveFn;
            resolveFn = null;
            dlg.style.display = 'none';
            mask.style.display = 'none';
            elInput.style.display = 'none';
            document.removeEventListener('keydown', onKey, true);
            if (fn) fn(value);
        }

        function onKey(e) {
            if (e.key === 'Escape') { e.stopPropagation(); settle(cancelValue); }
            else if (e.key === 'Enter' && elInput.style.display !== 'none') { e.stopPropagation(); settle(elInput.value); }
        }

        elX.onclick = function () { settle(cancelValue); };
        mask.onclick = function () { settle(cancelValue); };

        function open(opts) {
            return new Promise(function (resolve) {
                // 上一个还没关掉就先按"取消"结掉，避免它的 await 永远悬着
                if (resolveFn) settle(cancelValue);

                resolveFn = resolve;
                cancelValue = ('cancelValue' in opts) ? opts.cancelValue : null;

                const type = opts.type || 'info';
                elDot.style.background = COLORS[type] || COLORS.info;
                elTitle.textContent = opts.title || TITLES[type] || TITLES.info;
                elBody.textContent = (opts.message == null) ? '' : String(opts.message);
                elBody.style.display = elBody.textContent ? 'block' : 'none';

                if (opts.input) {
                    elInput.style.display = 'block';
                    elInput.value = (opts.input.value == null) ? '' : opts.input.value;
                    elInput.placeholder = opts.input.placeholder || '';
                } else {
                    elInput.style.display = 'none';
                }

                elFoot.innerHTML = '';
                (opts.buttons || [{ text: '知道了', value: true, primary: true }]).forEach(function (b) {
                    const btn = document.createElement('button');
                    btn.className = 'ui-dlg-btn' + (b.primary ? ' primary' : '') + (b.danger ? ' danger' : '');
                    btn.textContent = b.text;
                    btn.onclick = function () { settle(typeof b.value === 'function' ? b.value() : b.value); };
                    elFoot.appendChild(btn);
                });

                mask.style.display = 'block';
                dlg.style.display = 'block';
                document.addEventListener('keydown', onKey, true);
                if (opts.input) setTimeout(function () { elInput.focus(); elInput.select(); }, 30);
            });
        }

        return {
            alert: function (message, type, title) { return open({ message: message, type: type || 'info', title: title }); },
            confirm: function (message, o) {
                o = o || {};
                return open({
                    message: message,
                    type: o.type || 'question',
                    title: o.title,
                    cancelValue: false,
                    buttons: [
                        { text: o.cancelText || '取消', value: false },
                        { text: o.okText || '确定', value: true, primary: !o.danger, danger: !!o.danger }
                    ]
                });
            },
            prompt: function (message, value, o) {
                o = o || {};
                return open({
                    message: message,
                    type: 'question',
                    title: o.title || '请输入',
                    input: { value: value, placeholder: o.placeholder || '' },
                    cancelValue: null,
                    buttons: [
                        { text: '取消', value: null },
                        { text: '确定', value: function () { return elInput.value; }, primary: true }
                    ]
                });
            },
            // 多选一：buttons = [{text, value, primary, danger}]，返回被点按钮的 value
            choose: function (message, buttons, title) {
                return open({ message: message, type: 'question', title: title, buttons: buttons, cancelValue: null });
            },
            toast: function (message, type, ms) {
                const t = document.createElement('div');
                t.className = 'ui-toast' + (type ? ' ' + type : '');
                t.textContent = message;
                toastWrap.appendChild(t);
                requestAnimationFrame(function () { t.classList.add('show'); });
                setTimeout(function () {
                    t.classList.remove('show');
                    setTimeout(function () { t.remove(); }, 260);
                }, ms || 2600);
            }
        };
    })();

    const menuBtn = document.getElementById("cfMenuBtn");
    const menuList = document.getElementById("cfMenuList");
    const menuItems = menuList.querySelectorAll(".cf-menu-item");
    menuBtn.onclick = () => menuList.classList.toggle("show");
    function closeMenu() { menuList.classList.remove("show"); }

    async function setPageLimit() {
        closeMenu();
        const now = getMaxPage();
        const input = await UI.prompt(`请输入收藏采集最大页数上限\n（当前：${now} 页）`, now, { title: '采集页数上限', placeholder: '例如 50' });
        if (input === null || input === undefined) return;
        const num = parseInt(String(input).trim());
        if (isNaN(num) || num  setTimeout(r, ms)); }

    // ====================== 帖子有效性检测 ======================
    // 判定结果 type 取值：
    //   ok          正常
    //   banned      楼主被封禁 / 内容自动屏蔽
    //   deleted     帖子已删除（违规被删）
    //   notexist    主题不存在 / 已被删除或审核中
    //   notfound    论坛 404 页（页面不存在或已删除，常带 HTTP 404 状态码）
    //   permission  阅读权限不足（没失效，只是当前身份看不到）
    //   pending     审核中
    //   login       未登录（必须中止整轮检测，否则会误判全部失效）
    //   unknown     响应异常 / 未识别页面（不并入失效）
    const DEAD_TYPES = ['banned', 'deleted', 'notexist', 'notfound'];

    function isDeadType(t) { return DEAD_TYPES.indexOf(t) > -1; }

    function tagClassOf(type) {
        if (type === 'banned') return 't-banned';
        if (type === 'deleted' || type === 'notexist' || type === 'notfound') return 't-deleted';
        if (type === 'permission' || type === 'pending') return 't-perm';
        return 't-unknown';
    }

    function classifyMessage(txt) {
        // 注意顺序：Discuz 的"主题不存在或已被删除或正在被审核"同时含"已被删除"，
        // 必须先判"不存在"，否则会被误标成"帖子已删除"
        if (/不存在|无此主题|找不到|已被移走|已被删除或正在被审核/.test(txt)) {
            return { type: "notexist", label: "主题不存在", detail: txt };
        }
        if (/现已删除|已被删除|违规行为|涉嫌存在|现已被删|内容已删除/.test(txt)) {
            return { type: "deleted", label: "帖子已删除", detail: txt };
        }
        if (/阅读权限|权限不足|无权|用户组|等级不足/.test(txt)) {
            return { type: "permission", label: "阅读权限不足", detail: txt };
        }
        if (/审核/.test(txt)) {
            return { type: "pending", label: "审核中", detail: txt };
        }
        if (/登录|游客|注册/.test(txt)) {
            return { type: "login", label: "需要登录", detail: txt };
        }
        return { type: "unknown", label: "无法访问", detail: txt };
    }

    // ====================== 解码层 ======================
    // 52pojie 的 Discuz 页面是 Content-Type: text/html; charset=gbk。
    // 中文关键词判定（"现已删除"/"作者被禁止或删除"）全靠文本匹配，
    // 一旦解码错成乱码，失效帖会被静默归到"无法访问"而不是失效 —— 必须自己按 charset 解码。
    function contentTypeOf(headers) {
        if (!headers) return '';
        const m = String(headers).match(/content-type\s*:\s*[^\r\n]*/i);
        return m ? m[0] : '';
    }

    function decodeBytes(buf, contentType) {
        if (typeof buf === 'string') return buf;
        let bytes;
        if (buf instanceof ArrayBuffer) bytes = new Uint8Array(buf);
        else if (buf && buf.buffer) bytes = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
        else return String(buf == null ? '' : buf);

        let cs = (String(contentType || '').match(/charset\s*=\s*["']?([\w-]+)/i) || [])[1] || '';
        if (!cs) {
            // 头里没有就嗅探前 2KB 的
            let head = '';
            try { head = new TextDecoder('utf-8').decode(bytes.slice(0, 2048)); } catch (e) { head = ''; }
            const m = head.match(/]+charset\s*=\s*["']?([\w-]+)/i);
            cs = m ? m[1] : '';
        }
        cs = (cs || 'utf-8').toLowerCase();
        if (cs === 'gb2312' || cs === 'gb-2312') cs = 'gbk';
        try {
            return new TextDecoder(cs).decode(bytes);
        } catch (e) {
            try { return new TextDecoder('gbk').decode(bytes); } catch (e2) { return new TextDecoder('utf-8').decode(bytes); }
        }
    }

    function hasPostStruct(doc) {
        if (!doc) return false;
        return !!doc.querySelector('#postlist, #postlistcontainer, .t_f, div[id^="post_"]');
    }

    // 首帖容器。排除 post_rate_xxx（那是帖内的评分小窗，不是帖子本身）
    const FIRST_POST_SEL = '#postlist div[id^="post_"]:not([id^="post_rate_"])';

    // 反爬 WAF 的硬特征：创宇盾/加速乐一类「JS 挑战页」
    // 例：Please enable JavaScript and refresh the page.
    //     var c='/WZWSREL3RocmVhZC0xNDMxMzYtMS0xLmh0bWw='
    function isHardChallenge(html, doc) {
        const h = html || "";
        if (/WZWSREL|__jsl_clearance|jsl_clearance/i.test(h)) return true;
        if (/Please enable JavaScript/i.test(h)) return true;
        const ns = doc && doc.querySelector("noscript");
        if (ns && /enable JavaScript|开启\s*JavaScript|需要开启/i.test(ns.textContent || "")) return true;
        return false;
    }

    // 软特征：页面既不是已知错误页、又没有帖子结构，可见文字还极少 —— 基本是空壳/挑战页
    function isSoftChallenge(doc, html) {
        const bodyText = ((doc && doc.body && doc.body.textContent) || "").replace(/\s+/g, "");
        return bodyText.length  (t || "").replace(/\s+/g, " ").trim().slice(0, 200);

        // 0) 反爬挑战页：这不是帖子的状态，绝不能记成"异常"，否则整批结果全废
        if (isHardChallenge(html, doc)) {
            return { type: "blocked", label: "被WAF拦截", detail: "返回的是反爬 JS 挑战页，不是帖子内容" };
        }

        const pageTitle = doc.title || "";
        const h1 = doc.querySelector("h1");
        const bodyText = (doc.body && doc.body.textContent) || "";
        const struct = hasPostStruct(doc);

        // 1) 论坛 404 页：
        //    404 - 页面未找到 | 吾爱破解论坛
        //
# 404

## 您所访问的页面不存在或者已删除

        //

        const is404 =
            !!doc.querySelector("#catch-the-cat") ||
            (/404/.test(pageTitle) && /页面未找到|不存在|已删除/.test(pageTitle)) ||
            (h1 && h1.textContent.trim() === "404" && !struct) ||
            // 文案兜底必须叠加"没有帖子结构"，否则正文里引用该句的正常帖会被误杀
            (/您所访问的页面不存在或者已删除/.test(bodyText) && !struct);
        if (is404) {
            return { type: "notfound", label: "404 页面不存在", detail: "您所访问的页面不存在或者已删除" };
        }

        // 2) 整帖级错误提示： ...

        const msg = doc.querySelector("#messagetext");
        if (msg) return classifyMessage(flat(msg.textContent));

        // 3) 首帖被屏蔽：提示: *作者被禁止或删除 内容自动屏蔽*

        const firstPost = doc.querySelector(FIRST_POST_SEL) || doc.body || doc;
        const locked = firstPost.querySelector(".locked");
        if (locked) {
            const txt = flat(locked.textContent);
            if (/作者被禁止或删除|内容自动屏蔽|禁止或删除/.test(txt)) {
                return { type: "banned", label: "楼主被封禁", detail: txt };
            }
            if (/审核/.test(txt)) {
                return { type: "pending", label: "审核中", detail: txt };
            }
            return { type: "banned", label: "内容被屏蔽", detail: txt };
        }

        // 4) 没有帖子结构 —— 先看是不是软挑战页，否则记异常并带上证据供排查
        if (!struct) {
            if (isSoftChallenge(doc, html)) {
                return { type: "blocked", label: "被WAF拦截", detail: "页面无可读内容（疑似挑战页或 JS 空壳）" };
            }
            return {
                type: "unknown",
                label: status === 200 ? "响应异常" : ("HTTP " + status),
                detail: `标题「${flat(pageTitle) || "(空)"}」 长度 ${(html || "").length} 状态 ${status}`
            };
        }

        return { type: "ok", label: "正常", detail: "" };
    }

    function parseDoc(html) {
        if (!html) return null;
        try { return new DOMParser().parseFromString(html, 'text/html'); } catch (e) { return null; }
    }

    // 判断删除是否成功。返回 { ok, why }。
    // 只认「明确的错误容器」，不对全文做关键词扫描 —— 正常页面里同样可能出现这些词。
    function judgeDeleteResponse(res) {
        if (!res || !res.ok) return { ok: false, why: (res && res.err) || "请求未完成" };
        if (res.status !== 200) return { ok: false, why: "HTTP " + res.status + "（可能被限流，或登录态已失效）" };
        const doc = parseDoc(res.html);
        const msg = doc ? doc.querySelector("#messagetext") : null;
        if (msg) {
            const cls = String(msg.className || "");
            const txt = (msg.textContent || "").replace(/\s+/g, " ").trim().slice(0, 140);
            // Discuz 成功页是 alert_right「收藏删除成功」；错误页是 alert_error 或带错误文案
            if (/alert_error/i.test(cls) || /非法操作|没有权限|不存在|请先登录|您需要登录|删除失败/.test(txt)) {
                return { ok: false, why: txt || "服务器返回错误页" };
            }
        }
        return { ok: true, why: "" };
    }

    // 帖子的最后编辑时间是否晚于收藏时间。纯判定，不碰网络，便于离线测试。
    // 关键：必须区分「请求/页面失败」与「帖子确实没被编辑过」——
    // 老实现两种情况都返回 null，被 WAF 拦时会静默报"0 个有更新"。
    function classifyThreadEdit(doc, html, status, favDate) {
        if (status === 429) return { ok: false, updated: false, why: '被限流(429)' };
        if (status !== 200) return { ok: false, updated: false, why: 'HTTP ' + status };
        if (!doc) return { ok: false, updated: false, why: '无法解析响应' };
        if (isHardChallenge(html, doc)) return { ok: false, updated: false, why: '被WAF拦截' };

        const s = doc.querySelector("i.pstatus");
        if (!s) return { ok: true, updated: false };      // 真·没编辑过
        const m = s.textContent.match(/于\s+(\d{4}-\d{1,2}-\d{1,2}\s+\d{1,2}:\d{1,2})\s+编辑/);
        if (!m) return { ok: true, updated: false };
        const dm = m[1].match(/(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{1,2})/);
        if (!dm) return { ok: true, updated: false };
        const editDate = new Date(dm[1], dm[2] - 1, dm[3], dm[4], dm[5]);

        // favDate 在内存里是 Date，但经 GM 存储 JSON 往返后会变成字符串，
        // 直接 `editDate > favDate` 会做 NaN 比较恒为 false —— 批量检测就永远检不出更新。
        // 这里统一归一化成 Date 再比。
        if (!favDate) return { ok: true, updated: false };
        const fav = (favDate instanceof Date) ? favDate : new Date(favDate);
        if (isNaN(fav.getTime())) return { ok: true, updated: false };
        return { ok: true, updated: editDate > fav };
    }

    // 被判为失效、但用户还没手动"忽略"的条目才算真失效
    function isDeadItem(it) {
        return !!(it && it.dead && isDeadType(it.dead.type) && !it.dead.override);
    }

    function computeDeadStats(list) {
        const s = { total: (list || []).length, dead: 0, banned: 0, deleted: 0, notexist: 0, notfound: 0, limited: 0, unknown: 0, ignored: 0, checked: 0 };
        (list || []).forEach(it => {
            const t = it.dead && it.dead.type;
            if (!t) return;
            s.checked++;
            // 用户手动忽略的不计入失效，单独计数（误判不该逼着用户整轮重扫）
            if (isDeadType(t) && it.dead.override) { s.ignored++; return; }
            if (t === 'banned') { s.banned++; s.dead++; }
            else if (t === 'deleted') { s.deleted++; s.dead++; }
            else if (t === 'notexist') { s.notexist++; s.dead++; }
            else if (t === 'notfound') { s.notfound++; s.dead++; }
            else if (t === 'permission' || t === 'pending') s.limited++;
            else if (t !== 'ok') s.unknown++;
        });
        return s;
    }

    // CSV：把整个列表导成表格，方便丢进 Excel 自己筛
    function buildCsvFrom(list) {
        const q = v => {
            const s = String(v == null ? '' : v);
            return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
        };
        const fmtDate = v => {
            if (!v) return '';
            const d = (v instanceof Date) ? v : new Date(v);
            if (isNaN(d.getTime())) return '';
            const p = n => String(n).padStart(2, '0');
            return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
        };
        const rows = [['序号', '状态', '标题', '链接', '帖子ID', '收藏ID', '收藏时间', '所在页']];
        (list || []).forEach((x, i) => {
            const t = x.dead && x.dead.type;
            let status = '未检测';
            if (t) {
                if (isDeadType(t) && x.dead.override) status = '已忽略';
                else status = (t === 'ok') ? '正常' : x.dead.label;
            }
            rows.push([i + 1, status, x.title, x.url, x.tid, x.favid, fmtDate(x.favDate), x.page]);
        });
        return rows.map(r => r.map(q).join(',')).join('\r\n');
    }

    // ====================== 传输层（网络）======================
    // page  : 页面上下文 fetch —— 同源、走浏览器正常网络栈，最可能带上 WAF 通行证
    // gm    : GM_xmlhttpRequest —— 请求头像 XHR，最容易被 WAF 挑战
    // iframe: 真实导航加载 —— 最像人工点击，最重但最稳
    const TRANSPORTS = ['page', 'gm', 'iframe'];
    let activeTransport = GM_getValue("favTransport", "") || "";

    // 统一的 GM 取页：要 arraybuffer 自己按 charset 解码，避免 GBK 页面变乱码
    function gmHtml(opt) {
        return new Promise(resolve => {
            GM_xmlhttpRequest(Object.assign({ responseType: 'arraybuffer' }, opt, {
                onload: r => {
                    const html = (r.response != null)
                        ? decodeBytes(r.response, contentTypeOf(r.responseHeaders))
                        : (r.responseText || '');
                    resolve({ ok: true, status: r.status, finalUrl: r.finalUrl || opt.url, html: html });
                },
                onerror: () => resolve({ ok: false, status: 0, html: '', err: '网络错误' }),
                ontimeout: () => resolve({ ok: false, status: 0, html: '', err: '超时' })
            }));
        });
    }

    function rawFetch(url, mode) {
        const t0 = Date.now();
        if (mode === 'page') {
            return fetch(url, { credentials: 'include', redirect: 'follow', cache: 'no-store' })
                .then(async r => {
                    const buf = await r.arrayBuffer();
                    return {
                        ok: true, status: r.status, finalUrl: r.url,
                        html: decodeBytes(buf, r.headers.get('content-type')),
                        ms: Date.now() - t0
                    };
                })
                .catch(e => ({ ok: false, err: String((e && e.message) || e), ms: Date.now() - t0 }));
        }
        if (mode === 'iframe') {
            return new Promise(resolve => {
                const f = document.createElement('iframe');
                f.style.cssText = 'position:fixed;left:-99999px;top:0;width:1024px;height:768px;';
                let done = false;
                const finish = r => { if (done) return; done = true; clearTimeout(timer); try { f.remove(); } catch (e) {} resolve(r); };
                const timer = setTimeout(() => finish({ ok: false, err: 'iframe 加载超时', ms: Date.now() - t0 }), DEAD_SCAN_TIMEOUT);
                f.onload = () => {
                    // 追加后会先触发一次 about:blank 的 load，忽略掉
                    try {
                        if (f.contentWindow && f.contentWindow.location.href === 'about:blank') return;
                    } catch (e) { /* 跨域读不到就继续 */ }
                    try {
                        const d = f.contentDocument;
                        finish({ ok: true, status: 200, finalUrl: f.contentWindow.location.href, html: d ? d.documentElement.outerHTML : '', doc: d, ms: Date.now() - t0 });
                    } catch (e) {
                        finish({ ok: false, err: '无法读取 iframe 内容：' + e.message, ms: Date.now() - t0 });
                    }
                };
                f.onerror = () => finish({ ok: false, err: 'iframe 加载失败', ms: Date.now() - t0 });
                document.body.appendChild(f);
                f.src = url;
            });
        }
        return gmHtml({
            method: 'GET', url: url, timeout: DEAD_SCAN_TIMEOUT,
            headers: { 'Referer': 'https://www.52pojie.cn/home.php?mod=space&do=favorite&view=me' }
        }).then(r => Object.assign(r, { ms: Date.now() - t0 }));
    }

    async function checkThreadStatus(url, transport) {
        const mode = transport || activeTransport || 'page';
        const res = await rawFetch(url, mode);
        if (!res.ok) return { type: 'unknown', label: '请求失败', detail: res.err || '', transport: mode };
        const doc = res.doc || parseDoc(res.html);
        const v = classifyDoc(doc, res.html, res.status);
        v.transport = mode;
        v.ms = res.ms;
        return v;
    }

    // 依次试三种通道，挑出第一个能拿到真实页面的；lockBest=true 时锁死并持久化
    async function probeTransports(url, lockBest) {
        const tried = [];
        for (const t of TRANSPORTS) {
            const res = await rawFetch(url, t);
            const doc = res.doc || parseDoc(res.html);
            const v = res.ok ? classifyDoc(doc, res.html, res.status) : null;
            const info = {
                transport: t,
                ok: res.ok,
                status: res.status,
                err: res.err,
                ms: res.ms,
                len: (res.html || '').length,
                title: doc ? (doc.title || '') : '',
                struct: hasPostStruct(doc),
                verdict: v ? v.type : '-',
                challenge: v ? v.type === 'blocked' : false,
                snippet: (res.html || '').replace(/\s+/g, ' ').slice(0, 160)
            };
            tried.push(info);
            // 只有真正读到 Discuz 页面才算可用；挑战页和限流都不能锁
            if (lockBest && res.ok && v && v.type !== 'blocked' && v.type !== 'ratelimited') {
                activeTransport = t;
                GM_setValue('favTransport', t);
                return { transport: t, tried };
            }
            await delay(300);
        }
        return { transport: '', tried };
    }

    function resetTransport() {
        activeTransport = '';
        GM_setValue('favTransport', '');
    }

    function transportRows(tried) {
        return tried.map(t => {
            const state = !t.ok
                ? ('失败 ' + (t.err || ''))
                : (t.challenge ? '被WAF挑战页拦截' : ('可用，判定=' + (t.verdict || '-')));
            return `  · ${String(t.transport).padEnd(7)} HTTP=${t.status || '-'}  长度=${t.len || 0}  ${t.ms || 0}ms  ${state}`;
        }).join('\n');
    }

    function showTransportFailure(tried, sampleUrl) {
        UI.alert(
`❌ 三条传输通道都拿不到真实帖子内容，检测已中止。

本次未产生任何判定结果（不会误报，也不会漏掉后又被当成正常）。

样本：${sampleUrl}

通道探测：
${transportRows(tried)}

原因：52pojie 的 /thread-* 页面挂在创宇盾 WAF 后面，对非真实导航的请求
会返回一个「Please enable JavaScript」的 JS 挑战页。抓到挑战页不计入失效，直接中止。

下一步：
  1) 点菜单「诊断（检测失败排查）」，把报告复制发我；
  2) 确认浏览器此刻能正常打开论坛帖子（登录态、已过验证）；
  3) 若 iframe 通道也失败，需要换方案。`);
    }

    // ====================== favid 采集 ======================
    function parseFavItem(item, pageNum) {
        const link = item.querySelector('a[href*="thread-"]');
        const dateDom = item.querySelector(".xg1");
        const favDate = dateDom ? parseChineseDate(dateDom.textContent.trim()) : null;

        // 从页面标签 id="fav_18081556" 提取真实收藏ID
        const favid = item.id?.replace("fav_", "") || "";

        if (!link || !favid) return null;
        const tid = link.href.match(/thread-(\d+)-/)?.[1] || "";

        return {
            title: link.title || link.textContent.trim(),
            url: link.href.startsWith("http") ? link.href : "https://www.52pojie.cn/" + link.href,
            favDate: favDate,
            update: false,
            page: pageNum,
            favid: favid,
            tid: tid,
            dead: null
        };
    }

    // ====================== 误删恢复日志 ======================
    // 删除是破坏性操作。记下 tid（重新收藏只需 tid），万一误删还能找回来。
    const UNDO_MAX = 300;

    function readDeletedLog() {
        try { return JSON.parse(GM_getValue("favDeletedLog", "[]")) || []; } catch (e) { return []; }
    }

    function logDeleted(item) {
        if (!item || !item.tid) return;
        let log = readDeletedLog();
        log.unshift({ tid: String(item.tid), title: item.title || '', url: item.url || '', at: Date.now() });
        const seen = new Set();
        log = log.filter(x => {
            if (!x || !x.tid || seen.has(x.tid)) return false;
            seen.add(x.tid);
            return true;
        }).slice(0, UNDO_MAX);
        GM_setValue("favDeletedLog", JSON.stringify(log));
    }

    // 恢复：用 addFavorite 把 tid 重新收藏回去
    async function restoreDeleted() {
        closeMenu();
        const log = readDeletedLog();
        if (log.length === 0) {
            UI.alert('没有可恢复的记录。', 'info');
            return;
        }
        const preview = log.slice(0, 5).map((x, i) => `${i + 1}. ${String(x.title).slice(0, 26)}`).join('\n');
        if (!await UI.confirm(
            `将重新收藏最近删除的 ${log.length} 条：\n\n${preview}${log.length > 5 ? `\n… 还有 ${log.length - 5} 条` : ''}\n\n注意：恢复后的收藏时间是"现在"，不会还原原始收藏时间。`,
            { title: '恢复误删的收藏', okText: '开始恢复' }
        )) return;

        if (isLoading) { UI.alert("当前有其他任务正在执行，请稍候", 'warn'); return; }
        isLoading = true;
        currentTask = 'restore';
        showProgress();

        let ok = 0, fail = 0, why = '';
        const doneTids = new Set();
        try {
            for (let i = 0; i  0) {
            GM_setValue("favDeletedLog", JSON.stringify(log.filter(x => !doneTids.has(x.tid))));
        }
        UI.alert(`恢复完成：成功 ${ok} 条，失败 ${fail} 条。${why ? '\n\n失败原因示例：' + why : ''}\n\n恢复成功的条目已从记录中移除。`, fail ? 'warn' : 'success');
    }

    // ====================== 真实删除接口 ======================
    // 返回 { ok, why }。quiet=true 时不弹窗、不重绘（批量删除用）
    async function deleteFavorite(favid, itemEl, quiet) {
        const formhash = getFormhash();
        if (!formhash || !favid) {
            const why = "formhash 或 favid 缺失（请在收藏页且已登录的状态下操作）";
            if (!quiet) UI.alert("删除失败：" + why, 'error');
            return { ok: false, why: why };
        }

        const res = await gmHtml({
            method: "POST",
            url: "https://www.52pojie.cn/home.php?mod=spacecp&ac=favorite&op=delete&favid=" + favid,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Referer": "https://www.52pojie.cn/home.php?mod=space&do=favorite&view=me"
            },
            data: `deletesubmit=true&formhash=${formhash}&handlekey=a_delete_${favid}`
        });

        const verdict = judgeDeleteResponse(res);
        if (!verdict.ok) {
            if (!quiet) UI.alert("删除失败：" + verdict.why, 'error');
            return verdict;
        }

        // 立即同步本地列表：移除这一条，其余条目的检测结果原样保留 —— 不需要重新检测
        const removed = (favCacheList || []).find(x => String(x.favid) === String(favid));
        if (itemEl) itemEl.style.display = "none";
        favCacheList = (favCacheList || []).filter(x => String(x.favid) !== String(favid));
        if (removed) logDeleted(removed);   // 留一份可恢复记录
        GM_setValue("favCacheData", JSON.stringify(favCacheList));
        if (!quiet && favModal.style.display === "block") renderFavList();
        return { ok: true, why: "" };
    }

    // ====================== 收藏接口 ======================
    async function addFavorite(tid) {
        const formhash = getFormhash();
        if (!formhash || !tid) {
            UI.alert("收藏失败：formhash 或 帖子ID 缺失", 'error');
            return false;
        }

        const res = await gmHtml({
            method: "GET",
            url: `https://www.52pojie.cn/home.php?mod=spacecp&ac=favorite&type=thread&id=${tid}&formhash=${formhash}&infloat=yes&handlekey=k_favorite&inajax=1&ajaxtarget=fwin_content_k_favorite`,
            headers: {
                "Referer": "https://www.52pojie.cn/home.php?mod=space&do=favorite&view=me"
            }
        });
        if (res.ok && res.status === 200 && res.html.includes("收藏成功")) return true;
        UI.alert("收藏失败：服务器异常", 'error');
        return false;
    }

    async function fetchFirstPage() {
        const res = await gmHtml({ method: "GET", url: `https://www.52pojie.cn/home.php?mod=space&do=favorite&type=thread&page=1` });
        if (!res.ok) return [];
        const doc = parseDoc(res.html);
        if (!doc) return [];
        const list = [];
        doc.querySelectorAll('li[id^="fav_"]').forEach(it => {
            const obj = parseFavItem(it, 1);
            if (obj) list.push(obj);
        });
        return list;
    }

    // ====================== 更新收藏时间 ======================
    async function updateFavorite(item, itemEl) {
        if (!item.tid || !item.favid) {
            UI.alert("帖子信息不完整，无法更新", 'warn');
            return;
        }

        if (!await UI.confirm("确定要【更新收藏时间】吗？\n操作：删除旧收藏 → 重新收藏")) {
            return;
        }

        const delRes = await deleteFavorite(item.favid, null);
        if (!delRes.ok) return;   // deleteFavorite 内部已弹出失败原因
        await delay(800);

        const addOk = await addFavorite(item.tid);
        if (!addOk) return;

        UI.toast('收藏时间更新成功，正在置顶本条…', 'ok');

        const newList = await fetchFirstPage();
        const newItem = newList.find(x => x.tid === item.tid);

        if (newItem) {
            newItem.page = 1;
            newItem.update = false;
            // 继承原有的失效检测结果（刚收藏完不用重测）
            newItem.dead = item.dead || null;

            favCacheList = favCacheList.filter(x => x.tid !== item.tid);
            favCacheList.unshift(newItem);
            GM_setValue("favCacheData", JSON.stringify(favCacheList));
        }

        renderFavList();
    }

    function resetCheckState() {
        stopCheck = false;
        isLoading = false;
        currentTask = '';
        hideProgress();
        menuItems.forEach(item => {
            if (item.dataset.action === "checkSingle") item.textContent = "本页检测更新";
        });
    }

    function resetBatchBtn() {
        stopCheck = false;
        isLoading = false;
        currentTask = '';
        checkAllBtn.innerText = "批量检测更新";
        checkAllBtn.classList.remove("stop-bg");
        scanDeadBtn.innerText = "检测失效";
        scanDeadBtn.classList.remove("stop-bg");
    }

    async function checkSingleUpdate() {
        closeMenu();
        if (!isFavoritePage()) {
            UI.alert("请进入【我的-收藏】页面再使用", 'warn');
            return;
        }
        const singleItem = [...menuItems].find(i => i.dataset.action === "checkSingle");
        if (singleItem.textContent === "停止检测") {
            stopCheck = true;
            updateProgress(0, 0, "已手动停止");
            setTimeout(resetCheckState, 600);
            return;
        }
        stopCheck = false;
        isLoading = true;
        currentTask = 'batch';
        singleItem.textContent = "停止检测";
        showProgress();
        try {
            const els = [...document.querySelectorAll('li[id^="fav_"]')];
            const total = els.length;
            let cur = 0, upd = 0, failed = 0, firstWhy = '';
            for (const el of els) {
                if (stopCheck) break;
                cur++;
                const dDom = el.querySelector(".xg1");
                const link = el.querySelector('a[href*="thread-"]');
                if (!dDom || !link) continue;
                const favDate = parseChineseDate(dDom.textContent.trim());
                if (!favDate) continue;
                const url = link.href.startsWith("http") ? link.href : "https://www.52pojie.cn/" + link.href;
                updateProgress(cur, total, `检测 ${cur}/${total} · 间隔 ${getScanDelay()}ms`);

                const r = await probeThreadUpdate(url, favDate);
                if (!r.ok) {
                    // 失败要计数并上报，不能当成"没更新"
                    failed++;
                    if (!firstWhy) firstWhy = r.why;
                    if (/429/.test(r.why)) { bumpDelay(); }
                    await delay(getScanDelay());
                    continue;
                }
                easeDelay();

                // 回写缓存，保证弹窗列表与页面上看到的标记一致
                const favid = el.id.replace('fav_', '');
                const cached = (favCacheList || []).find(x => String(x.favid) === String(favid));
                if (cached) cached.update = r.updated;

                if (r.updated) {
                    const nx = dDom.nextElementSibling;
                    if (!nx || !nx.classList.contains("update-indicator")) {
                        const span = document.createElement("span");
                        span.className = "update-indicator";
                        span.innerText = "有更新";
                        dDom.after(span);
                    }
                    upd++;
                }
                await delay(getScanDelay());
            }
            if (favCacheList) GM_setValue("favCacheData", JSON.stringify(favCacheList));
            updateProgress(total, total, `完成：${upd} 个有更新`);
            if (failed) {
                UI.alert(`本页检测完成：${upd} 个有更新，${failed} 条检测失败。\n\n失败原因示例：${firstWhy}\n\n失败的条目按"未检测"处理，可稍后重试。`, 'warn');
            } else {
                UI.toast(`本页检测完成：${upd} 个有更新`, upd ? 'warn' : 'ok');
            }
        } catch (e) {
            console.error(e);
            UI.alert('本页检测出错：' + ((e && e.message) || e), 'error');
        } finally {
            resetCheckState();
        }
    }

    const mask = document.createElement('div'); mask.className = "mask-layer"; document.body.appendChild(mask);
    const favModal = document.createElement('div');
    favModal.id = "favModal";
    favModal.innerHTML = `

            全部收藏列表

                同步列表
                批量检测更新
                检测失效

            ×

            只看失效
            复制清单
            导出 TXT
            导出 CSV
            删除全部失效

    `;
    document.body.appendChild(favModal);

    const searchInput = favModal.querySelector("#favSearchInput");
    const refreshBtn = favModal.querySelector("#refreshFavBtn");
    const checkAllBtn = favModal.querySelector("#checkAllFavBtn");
    const scanDeadBtn = favModal.querySelector("#scanDeadBtn");
    const toggleDeadBtn = favModal.querySelector("#toggleDeadBtn");
    const copyDeadBtn = favModal.querySelector("#copyDeadBtn");
    const exportDeadBtn = favModal.querySelector("#exportDeadBtn");
    const exportCsvBtn = favModal.querySelector("#exportCsvBtn");
    const delAllDeadBtn = favModal.querySelector("#delAllDeadBtn");
    const favStats = favModal.querySelector("#favStats");
    const closeBtn = favModal.querySelector(".modal-close");
    const modalBody = favModal.querySelector(".modal-body");
    const modalTitle = favModal.querySelector(".modal-title");

    function closeModal() { favModal.style.display = "none"; mask.style.display = "none"; }
    closeBtn.onclick = closeModal;
    mask.onclick = closeModal;

    // Esc 关闭主弹窗。自绘弹窗的 Esc 处理在捕获阶段 stopPropagation，两者不会互相干扰。
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        if (favModal.style.display === 'block') closeModal();
    });

    async function goPage(page) {
        const res = await gmHtml({ method: "GET", url: `https://www.52pojie.cn/home.php?mod=space&do=favorite&type=thread&page=${page}`, timeout: DEAD_SCAN_TIMEOUT });
        return res.ok ? parseDoc(res.html) : null;
    }

    async function collectAllFav(forceRefresh = false) {
        if (isLoading) return favCacheList;
        if (favCacheList && !forceRefresh) return favCacheList;
        // 采集前留一份旧列表：采完后按 favid 继承已有的检测结果，
        // 这样「重新采集」只刷新列表成员，不会把辛苦扫出来的失效标记清空
        const prev = favCacheList || [];
        isLoading = true;
        currentTask = 'collect';
        let allList = [], page = 1;
        const maxPage = getMaxPage();
        let failedPage = 0, reachedLimit = false;
        modalBody.innerHTML = `正在采集收藏...
`;

        try {
            while (true) {
                if (page > maxPage) { reachedLimit = true; break; }
                const pageDoc = await goPage(page);
                if (!pageDoc) { failedPage = page; break; }
                const items = pageDoc.querySelectorAll('li[id^="fav_"]');
                if (items.length === 0) break;
                modalBody.innerHTML = `采集第 ${page} 页 / 上限 ${maxPage} 页
`;
                items.forEach(item => {
                    const res = parseFavItem(item, page);
                    res && allList.push(res);
                });
                page++;
                await delay(400);
            }
        } catch (e) {
            console.error(e);
            failedPage = page;
        }

        // 采集中断时绝不能用残缺列表覆盖缓存 —— 否则第 N 页之后那些条目的检测结果会全部丢失
        if (failedPage && prev.length > 0) {
            isLoading = false;
            currentTask = '';
            UI.alert(`采集第 ${failedPage} 页失败，已中止。\n\n为避免丢失已有数据，本次结果未写入缓存（本地仍是上次的 ${prev.length} 条）。\n可稍后点「同步列表」重试。`, 'error');
            return favCacheList;
        }
        // 采到 0 条但本地原本有数据 → 多半是登录态失效，同样不覆盖
        if (allList.length === 0 && prev.length > 0) {
            isLoading = false;
            currentTask = '';
            UI.alert(`本次只采集到 0 条收藏，但本地记录有 ${prev.length} 条。\n\n可能登录态已失效或请求异常，本次结果未写入缓存。请确认已登录后重试。`, 'warn');
            return favCacheList;
        }

        // 继承旧的检测结果：favid 为准，tid 兜底（重建收藏后 favid 会变）
        const byFavid = new Map(), byTid = new Map();
        prev.forEach(x => {
            if (x.favid) byFavid.set(String(x.favid), x);
            if (x.tid) byTid.set(String(x.tid), x);
        });
        let carried = 0;
        allList.forEach(it => {
            const old = byFavid.get(String(it.favid)) || (it.tid && byTid.get(String(it.tid)));
            if (!old) return;
            if (old.dead) { it.dead = old.dead; carried++; }
            if (old.update) it.update = true;
        });

        favCacheList = allList;
        GM_setValue("favCacheData", JSON.stringify(allList));
        GM_setValue("favListSyncedAt", Date.now());
        GM_setValue("favListTruncated", reachedLimit ? 1 : 0);
        isLoading = false;
        currentTask = '';
        if (carried > 0) console.log(`[收藏检查] 列表同步完成，已继承 ${carried} 条历史检测结果`);
        if (reachedLimit) {
            // 因为撞上限而停，说明后面大概率还有 —— 不能让用户以为列表是完整的
            UI.toast(`已达页数上限 ${maxPage} 页（${allList.length} 条），可能还有更多未采集`, 'warn', 4500);
        }
        return favCacheList;
    }

    // 轻量校验：只抓第 1 页和缓存里最后一页，比对 favid 序列。
    // 一致 → 继续用缓存（省掉整轮采集）；不一致 → 列表在别处被改过，自动重新采集。
    // 校验拿不到有效页面时一律返回 checked:false（宁可不动，也不误判）。
    async function verifyCacheFresh() {
        if (!favCacheList || favCacheList.length === 0) return { checked: false, ok: true, note: '无缓存' };

        const pageSet = new Set([1]);
        let maxPage = 1;
        favCacheList.forEach(x => { if (x.page && x.page > maxPage) maxPage = x.page; });
        if (maxPage > 1) pageSet.add(maxPage);

        for (const p of pageSet) {
            const res = await gmHtml({
                method: 'GET',
                url: `https://www.52pojie.cn/home.php?mod=space&do=favorite&type=thread&page=${p}`,
                timeout: DEAD_SCAN_TIMEOUT
            });
            if (!res.ok) return { checked: false, ok: true, note: '校验请求失败' };
            const doc = parseDoc(res.html);
            if (!doc || isHardChallenge(res.html, doc)) return { checked: false, ok: true, note: '校验被拦截' };

            const fresh = [];
            doc.querySelectorAll('li[id^="fav_"]').forEach(it => {
                const f = it.id.replace('fav_', '');
                if (f) fresh.push(f);
            });
            if (!fresh.length) return { checked: false, ok: true, note: `第 ${p} 页为空` };

            const cached = favCacheList.filter(x => x.page === p).map(x => String(x.favid));
            const same = fresh.length === cached.length && fresh.every((f, i) => f === cached[i]);
            if (!same) {
                return { checked: true, ok: false, note: `第 ${p} 页已变化（线上 ${fresh.length} 条 / 缓存 ${cached.length} 条）` };
            }
            await delay(300);
        }
        return { checked: true, ok: true };
    }

    function fmtTimeAgo(ts) {
        if (!ts) return '';
        const d = new Date(ts);
        const p = n => String(n).padStart(2, '0');
        return `${p(d.getHours())}:${p(d.getMinutes())}`;
    }

    function fmtTimeAgoFull(ts) {
        if (!ts) return '尚未同步';
        const mins = Math.floor((Date.now() - ts) / 60000);
        if (mins  !x.dead).length;
        const est = n => Math.max(1, Math.ceil(n * getScanDelay() / 60000));
        let targets;

        if (autoSwitch) {
            // 「一键提取失效」要快：只查没结果的；全都查过就直接看已有结果
            targets = unchecked > 0 ? favCacheList.filter(x => !x.dead) : favCacheList.slice();
        } else if (unchecked === 0) {
            if (!await UI.confirm(`全部 ${allCount} 条都已有检测结果。\n\n要重新检测一遍吗？（会重新访问 ${allCount} 个帖子页，约 ${est(allCount)} 分钟）`, { title: '检测失效', okText: '全部重检' })) return;
            targets = favCacheList.slice();
        } else {
            const scope = await UI.choose(
                `共 ${allCount} 条收藏，其中 ${unchecked} 条还没检测过。\n\n`
                + `· 仅检测未检过的：${unchecked} 条，约 ${est(unchecked)} 分钟\n`
                + `· 全部重新检测：${allCount} 条，约 ${est(allCount)} 分钟\n\n`
                + `已检测过的结果会保留。只有之前检测失败的条目才需要重检。`,
                [
                    { text: '取消', value: null },
                    { text: `仅检测未检过的（${unchecked}）`, value: 'new', primary: true },
                    { text: `全部重检（${allCount}）`, value: 'all' }
                ],
                '检测失效'
            );
            if (!scope) return;
            targets = scope === 'all' ? favCacheList.slice() : favCacheList.filter(x => !x.dead);
        }
        if (targets.length === 0) { UI.alert('没有需要检测的条目。', 'info'); return; }

        stopCheck = false;
        isLoading = true;
        currentTask = 'scan';
        scanDeadBtn.innerText = "停止检测";
        scanDeadBtn.classList.add("stop-bg");
        checkAllBtn.innerText = "批量检测更新";
        checkAllBtn.classList.remove("stop-bg");
        resetDelay();                 // 新一轮检测，间隔回到基准
        showProgress();

        const total = targets.length;
        let i = 0, deadN = 0, limN = 0, unkN = 0, blockedN = 0, consecBlocked = 0, aborted = '';

        try {
            // 预检：先用第一条探明哪条通道能拿到真实页面。
            // 放在循环前，避免跑了几百条才发现全军覆没。
            updateProgress(0, total, '正在预检传输通道...');
            modalBody.innerHTML = '正在预检传输通道（页面fetch / GM请求 / iframe）...
';
            const pr = await probeTransports(targets[0].url, true);
            if (!pr.transport) {
                showTransportFailure(pr.tried, targets[0].url);
                return;
            }
            modalBody.innerHTML = `通道就绪：${pr.transport} · 起始间隔 ${getScanDelay()}ms
开始检测 ${total} 条…
`;

            for (const item of targets) {
                if (stopCheck) break;
                i++;
                updateProgress(i, total, `失效检测 ${i}/${total}`);
                modalBody.innerHTML = `正在检测 ${i}/${total}：
${escapeHtml(item.title)}
`;

                let r = await checkThreadStatus(item.url);

                if (r.type === 'login') {
                    aborted = "检测到「需要登录」的响应，为避免把全部收藏误判为失效，已自动中止。请先登录 52pojie 后重试。";
                    break;
                }

                // 429 限流：先把后续间隔整体调大（治本），再对当前这条退避重试
                if (r.type === 'ratelimited') {
                    bumpDelay();
                    let recovered = false;
                    for (let k = 0; k = 3) {
                        resetTransport();
                        showTransportFailure([{ transport: r.transport, ok: true, status: 200, challenge: true, verdict: 'blocked' }], item.url);
                        return;
                    }
                } else {
                    consecBlocked = 0;
                    item.dead = r;
                    if (isDeadType(r.type)) deadN++;
                    else if (r.type === 'permission' || r.type === 'pending') limN++;
                    else if (r.type !== 'ok') unkN++;
                }

                // 每 10 条落盘一次，中断也不丢结果
                if (i % 10 === 0) GM_setValue("favCacheData", JSON.stringify(favCacheList));
                // 顺利一条就慢慢把间隔收回基准，兼顾速度和抗限流
                if (r.type !== 'blocked') easeDelay();
                updateProgress(i, total, `失效检测 ${i}/${total} · 间隔 ${getScanDelay()}ms`);
                await delay(getScanDelay());
            }
        } catch (e) {
            console.error(e);
        } finally {
            GM_setValue("favCacheData", JSON.stringify(favCacheList));
            isLoading = false;
            currentTask = '';
            hideProgress();
            scanDeadBtn.innerText = "检测失效";
            scanDeadBtn.classList.remove("stop-bg");
            renderFavList();
        }

        if (aborted) { UI.alert(aborted, 'error'); return; }

        const st = getDeadStats();
        let tip = `检测完成（共 ${i}/${total} 条 · 通道 ${activeTransport}）\n\n失效 ${deadN} 条：\n  · 楼主被封禁 ${st.banned}\n  · 帖子已删除 ${st.deleted}\n  · 主题不存在 ${st.notexist}\n  · 404 页面不存在 ${st.notfound}\n受限 ${limN} 条（权限不足/审核中）\n异常 ${unkN} 条（需人工复核，未计入失效）`;
        if (blockedN > 0) tip += `\n被拦截 ${blockedN} 条（未计入任何结果）`;
        // 全盘异常时给出明确指引，而不是让用户对着一堆"响应异常"发懵
        if (unkN > 0 && unkN === i && deadN === 0) {
            tip += `\n\n⚠️ 全部 ${i} 条都是「响应异常」，说明不是帖子的状态问题，\n而是取页面这一步就错了。请点菜单「诊断（检测失败排查）」把报告发我。`;
        }

        // 从「一键提取失效收藏」入口进来：直接切到失效视图并交付结果
        if (autoSwitch) {
            deadOnly = true;
            toggleDeadBtn.classList.add("active");
            renderFavList();
            UI.alert(tip + "\n\n已切换到「只看失效」视图，可点「复制清单」或「导出 TXT」取走结果。", 'success');
            return;
        }

        renderFavList();
        if (deadN > 0 && !deadOnly) {
            if (await UI.confirm(tip + "\n\n是否切换到「只看失效」视图？")) {
                deadOnly = true;
                toggleDeadBtn.classList.add("active");
                renderFavList();
            }
        } else {
            UI.alert(tip);
        }
    }

    scanDeadBtn.onclick = function () { scanDeadFavorites(false); };

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, c => ({ '&': '&', '': '>', '"': '"', "'": ''' }[c]));
    }

    // ====================== 清单导出 ======================
    function fmtNow() {
        const d = new Date();
        const p = n => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
    }

    function buildDeadReport() {
        const st = getDeadStats();
        const deadList = getDeadList();
        const limList = (favCacheList || []).filter(x => x.dead && (x.dead.type === 'permission' || x.dead.type === 'pending'));
        const unkList = (favCacheList || []).filter(x => x.dead && !isDeadType(x.dead.type) && x.dead.type !== 'ok' && x.dead.type !== 'permission' && x.dead.type !== 'pending');

        const L = [];
        L.push("# 52pojie 收藏失效清单");
        L.push(`# 导出时间：${fmtNow()}`);
        L.push(`# 收藏总数：${st.total}    失效：${deadList.length}    受限：${limList.length}    异常：${unkList.length}`);
        L.push("");
        L.push(`===== 失效收藏（楼主被封禁 ${st.banned} / 帖子已删除 ${st.deleted} / 主题不存在 ${st.notexist} / 404不存在 ${st.notfound}）=====`);
        if (deadList.length === 0) L.push("(无)");
        deadList.forEach((x, idx) => {
            L.push(`${idx + 1}. [${x.dead.label}] ${x.title}`);
            L.push(`   ${x.url}`);
            if (x.dead.detail) L.push(`   站点提示：${x.dead.detail}`);
        });
        if (limList.length) {
            L.push("");
            L.push(`===== 受限收藏（权限不足 / 审核中，建议保留）=====`);
            limList.forEach((x, idx) => {
                L.push(`${idx + 1}. [${x.dead.label}] ${x.title}`);
                L.push(`   ${x.url}`);
            });
        }
        if (unkList.length) {
            L.push("");
            L.push(`===== 响应异常（需人工核实）=====`);
            unkList.forEach((x, idx) => {
                L.push(`${idx + 1}. [${x.dead.label}] ${x.title}`);
                L.push(`   ${x.url}`);
            });
        }
        return L.join("\r\n");
    }

    function copyText(text) {
        try {
            if (typeof GM_setClipboard === "function") { GM_setClipboard(text, "text"); return true; }
        } catch (e) { /* fallthrough */ }
        try {
            const ta = document.createElement("textarea");
            ta.value = text;
            ta.style.position = "fixed";
            ta.style.left = "-9999px";
            document.body.appendChild(ta);
            ta.select();
            const ok = document.execCommand("copy");
            ta.remove();
            return ok;
        } catch (e) { return false; }
    }

    function downloadText(filename, text, mime) {
        const blob = new Blob(["\ufeff" + text], { type: (mime || "text/plain") + ";charset=utf-8" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    }

    copyDeadBtn.onclick = function () {
        if (getDeadStats().checked === 0) { UI.alert("还没有检测结果，请先点「检测失效」", 'warn'); return; }
        const txt = buildDeadReport();
        if (copyText(txt)) {
            UI.toast(`已复制 ${getDeadList().length} 条失效记录`, 'ok');
        } else {
            UI.alert("复制失败，请改用「导出 TXT」", 'error');
        }
    };

    exportDeadBtn.onclick = function () {
        if (getDeadStats().checked === 0) { UI.alert("还没有检测结果，请先点「检测失效」", 'warn'); return; }
        const d = new Date();
        const p = n => String(n).padStart(2, '0');
        const name = `52pojie-失效收藏-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.txt`;
        downloadText(name, buildDeadReport());
    };

    exportCsvBtn.onclick = function () {
        if (!favCacheList || favCacheList.length === 0) { UI.alert("还没有列表数据，请先点「同步列表」。", 'warn'); return; }
        const st = getDeadStats();
        const d = new Date();
        const p = n => String(n).padStart(2, '0');
        const name = `52pojie-收藏清单-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.csv`;
        downloadText(name, buildCsvFrom(favCacheList), "text/csv");
        UI.toast(`已导出 ${favCacheList.length} 条（失效 ${st.dead} 条）`, 'ok');
    };

    toggleDeadBtn.onclick = function () {
        deadOnly = !deadOnly;
        toggleDeadBtn.classList.toggle("active", deadOnly);
        renderFavList();
    };

    // ====================== 【新增】批量删除失效收藏 ======================
    async function deleteAllDead() {
        const list = getDeadList();
        if (list.length === 0) {
            UI.alert("当前没有标记为失效的收藏。请先执行「检测失效」。", 'warn');
            return;
        }
        if (isLoading) { UI.alert("当前有其他任务正在执行，请稍候", 'warn'); return; }
        if (!await UI.confirm(`即将删除 ${list.length} 条失效收藏。\n\n该操作不可撤销（删除的是你在 52pojie 的收藏记录，非帖子本身）。是否继续？`)) return;
        if (!await UI.confirm(`二次确认：确定删除这 ${list.length} 条？`)) return;

        stopCheck = false;
        isLoading = true;
        currentTask = 'delete';
        showProgress();
        delAllDeadBtn.disabled = true;

        let ok = 0, fail = 0, done = 0, stopped = false;
        const reasons = [];
        const snapshot = list.slice();

        try {
            for (const item of snapshot) {
                if (stopCheck) break;
                done++;
                updateProgress(done, snapshot.length, `删除失效收藏 ${done}/${snapshot.length}`);
                const r = await deleteFavorite(item.favid, null, true);
                if (r.ok) {
                    ok++;
                } else {
                    fail++;
                    if (reasons.length  0) {
            msg += `\n\n失败条目仍保留在列表中，可稍后重试。\n失败原因示例：\n` + reasons.map(x => '  · ' + x).join('\n');
        }
        if (stopped) msg += `\n\n（已手动停止，剩余条目未处理）`;
        if (ok > 0) msg += `\n\n误删可到菜单「恢复误删的收藏」里找回。`;
        UI.alert(msg, fail ? 'warn' : 'success');
    }

    delAllDeadBtn.onclick = deleteAllDead;

    // ====================== 渲染列表 ======================
    function renderFavList() {
        if (!favCacheList) return;
        const key = searchInput.value.trim().toLowerCase();
        const st = getDeadStats();

        const maxPage = getMaxPage();
        modalTitle.textContent = `全部收藏：${favCacheList.length} 条 / 上限：${maxPage} 页`;

        const syncedAt = parseInt(GM_getValue("favListSyncedAt", "")) || 0;
        const truncated = parseInt(GM_getValue("favListTruncated", "0")) === 1;
        favStats.textContent = (st.checked === 0
            ? "未检测失效"
            : `失效 ${st.dead} · 受限 ${st.limited} · 异常 ${st.unknown}`
              + (st.ignored ? ` · 已忽略 ${st.ignored}` : ''))
            + (syncedAt ? ` ｜ 列表 ${fmtTimeAgo(syncedAt)}` : '')
            + (truncated ? ' ｜ ⚠ 未采完' : '');
        favStats.title = (syncedAt
            ? `列表同步于 ${new Date(syncedAt).toLocaleString('zh-CN')}（${fmtTimeAgoFull(syncedAt)}）\n点「同步列表」可刷新成员，检测结果会保留`
            : '尚未同步列表')
            + (truncated ? `\n\n⚠ 上次采集撞到页数上限（${getMaxPage()} 页）就停了，后面可能还有收藏没采到。\n用菜单「设置采集页数上限」调大后再同步。` : '');

        let filterList = favCacheList.filter(item => item.title.toLowerCase().includes(key));
        if (deadOnly) {
            filterList = filterList.filter(item => item.dead && item.dead.type !== 'ok');
        }

        modalBody.innerHTML = "";
        if (filterList.length === 0) {
            modalBody.innerHTML = deadOnly
                ? '没有失效收藏（或尚未检测）
'
                : '无匹配收藏
';
            return;
        }

        filterList.forEach(item => {
            const div = document.createElement("div");
            const dt = item.dead && item.dead.type;
            const confirmedDead = isDeadItem(item);
            div.className = "fav-item" + (confirmedDead ? " is-dead" : "");
            if (item.dead && item.dead.detail) div.title = item.dead.detail;

            let deadTag = "";
            if (dt && dt !== 'ok') {
                if (item.dead.override && isDeadType(dt)) {
                    deadTag = `已忽略 · 点此恢复`;
                } else {
                    const extra = isDeadType(dt) ? '（点此标记为正常，不再计入失效）' : '';
                    deadTag = `${escapeHtml(item.dead.label)}`;
                }
            }

            div.innerHTML = `

                    ${escapeHtml(item.title)}${item.update ? '●有更新' : ""}${deadTag}

                第${item.page}页
                更新收藏
                删除
            `;

            div.querySelector('.fav-title').onclick = () => window.open(item.url, "_blank");

            // 点状态标签 = 手动纠正误判。不用整轮重扫。
            const tagEl = div.querySelector('.dead-tag[data-toggle]');
            if (tagEl) {
                tagEl.onclick = (e) => {
                    e.stopPropagation();
                    item.dead.override = !item.dead.override;
                    GM_setValue("favCacheData", JSON.stringify(favCacheList));
                    renderFavList();
                    UI.toast(item.dead.override ? '已标记为正常，不再计入失效' : '已恢复为失效', 'ok');
                };
            }

            const updateBtn = div.querySelector('.fav-update-btn');
            updateBtn.onclick = (e) => {
                e.stopPropagation();
                updateFavorite(item, div);
            };

            const delBtn = div.querySelector('.fav-del-btn');
            delBtn.onclick = async (e) => {
                e.stopPropagation();
                if (!await UI.confirm('确定要删除该收藏吗？')) return;
                delBtn.disabled = true;
                delBtn.textContent = '删除中';
                const r = await deleteFavorite(item.favid, div);
                if (!r.ok) {
                    // 失败必须看得见：请求可能已发出，但结果不确定，不能静默
                    delBtn.disabled = false;
                    delBtn.textContent = '删除';
                    UI.alert('删除失败：' + r.why + '\n\n如果刷新后确认已删掉，说明请求其实成功了。点标题栏的「同步列表」即可让本地列表跟上，已检测出的标记不会丢。', 'error');
                }
            };

            modalBody.appendChild(div);
        });
    }

    async function openFavModal() {
        closeMenu();
        getFormhash();
        favModal.style.display = "block";
        mask.style.display = "block";
        searchInput.value = "";
        if (!favCacheList) {
            await collectAllFav(false);
        } else {
            // 有缓存时先做一次轻量校验，避免把「在别处已被删掉」的条目继续展示
            modalBody.innerHTML = '正在校验列表是否最新…
';
            const v = await verifyCacheFresh();
            if (v.checked && !v.ok) {
                modalBody.innerHTML = `${escapeHtml(v.note)}
正在同步列表（检测结果会保留）…
`;
                await collectAllFav(true);
                UI.toast('列表已自动同步，检测结果已保留', 'ok');
            } else if (v.note) {
                console.log('[收藏检查] 列表校验跳过：' + v.note);
            }
        }
        deadOnly = false;
        toggleDeadBtn.classList.remove("active");
        renderFavList();
    }

    // 【新增】一键提取入口：打开弹窗 → 直接开始失效检测 → 自动切到只看失效
    async function extractDeadFavorites() {
        closeMenu();
        getFormhash();
        favModal.style.display = "block";
        mask.style.display = "block";
        if (!favCacheList) await collectAllFav(false);
        if (!favCacheList || favCacheList.length === 0) {
            UI.alert("未采集到收藏，请确认已登录且收藏不为空。", 'warn');
            return;
        }
        // 全都已有结果就别重复扫了，直接把上次的结果摊开
        if (favCacheList.every(x => x.dead)) {
            deadOnly = true;
            toggleDeadBtn.classList.add("active");
            renderFavList();
            const st = getDeadStats();
            UI.alert(`已有全部 ${favCacheList.length} 条的检测结果：\n\n失效 ${st.dead} 条 · 受限 ${st.limited} 条 · 异常 ${st.unknown} 条`
                + (st.ignored ? ` · 已忽略 ${st.ignored} 条` : '')
                + `\n\n已切到「只看失效」视图。如需重新检测，点标题栏的「检测失效」。`, 'info');
            return;
        }
        await scanDeadFavorites(true);
    }

    // 【新增】诊断：用三种通道各打一次同一条收藏，把原始证据摊出来
    async function runDiagnostics() {
        closeMenu();
        favModal.style.display = 'block';
        mask.style.display = 'block';
        modalTitle.textContent = '传输通道诊断';
        favStats.textContent = '';
        if (!favCacheList || favCacheList.length === 0) {
            modalBody.innerHTML = '请先点「同步列表」加载收藏列表，再运行诊断。
';
            return;
        }
        const item = favCacheList[0];
        const lines = [];
        lines.push('52pojie 收藏检测 · 传输通道诊断报告');
        lines.push('时间：' + fmtNow());
        lines.push('已锁定通道：' + (activeTransport || '(未锁定)'));
        lines.push('样本收藏：' + item.url);
        lines.push('');

        for (const t of TRANSPORTS) {
            modalBody.innerHTML = `正在测试通道 ${t} …
`;
            const res = await rawFetch(item.url, t);
            const doc = res.doc || parseDoc(res.html);
            const v = res.ok ? classifyDoc(doc, res.html, res.status) : null;
            lines.push(`【${t}】`);
            lines.push(`  请求结果   : ${res.ok ? 'HTTP ' + res.status : '失败 - ' + (res.err || '')}`);
            lines.push(`  耗时/长度  : ${res.ms}ms / ${(res.html || '').length} 字节`);
            lines.push(`  页面标题   : ${doc ? (doc.title || '(空)') : '(无法解析)'}`);
            lines.push(`  有帖子结构 : ${hasPostStruct(doc) ? '是' : '否'}`);
            lines.push(`  命中判定   : ${v ? v.type + ' - ' + v.label : '-'}`);
            lines.push(`  内容片段   : ${(res.html || '').replace(/\s+/g, ' ').slice(0, 180)}`);
            lines.push('');
            await delay(400);
        }
        lines.push('（把以上内容完整发回即可定位：是 WAF 拦截、登录态问题，还是页面结构变了）');

        const report = lines.join('\n');
        modalBody.innerHTML = `${escapeHtml(report)}`;
        copyText(report);
        UI.toast('诊断报告已复制到剪贴板', 'ok');
    }

    menuItems.forEach(item => {
        item.onclick = function () {
            const act = this.dataset.action;
            switch (act) {
                case "checkSingle": checkSingleUpdate(); break;
                case "openFav": openFavModal(); break;
                case "checkDead": extractDeadFavorites(); break;
                case "diag": runDiagnostics(); break;
                case "restore": restoreDeleted(); break;
                case "setPageLimit": setPageLimit(); break;
            }
        };
    });

    refreshBtn.onclick = async function () {
        if (isLoading) { UI.alert("当前有其他任务正在执行，请稍候", 'warn'); return; }
        await collectAllFav(true);
        renderFavList();
        UI.toast('列表已同步，检测结果已保留', 'ok');
    };
    searchInput.addEventListener("input", renderFavList);

})();`

### 链接：[https://wwbfw.lanzoue.com/b00mqnhcgd](https://wwbfw.lanzoue.com/b00mqnhcgd)  密码:52pj

---

[查看原文](https://www.52pojie.cn/thread-2129178-1-1.html)
