---
title: "新人作死 の 修理大版主涛之雨-de-吾爱代码块"
published: 2026-11-16
description: "下面第1段代码是大版主@涛之雨 n年之前的脚本代码，借助ai更新了下，实现了，有多个代码块的时候 [*]每个代码块都有各自的折叠/显示按钮，大版主的好像最多只是两个。 [*]页面左下角，有个总的折叠按钮（如果只有1个代码块，这个按钮不会出现），总的按钮是可以拖动 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "haswill"
sourceLink: "https://www.52pojie.cn/thread-2138095-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2138095-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

下面第1段代码是大版主@涛之雨 n年之前的脚本代码，借助ai更新了下，实现了，有多个代码块的时候

每个代码块都有各自的折叠/显示按钮，大版主的好像最多只是两个。页面左下角，有个总的折叠按钮（如果只有1个代码块，这个按钮不会出现），总的按钮是可以拖动移动位置的。

大家可以拿当前这个帖子做实验，看一下总的按钮，折叠起来，更加方便看内容 。

我就不发截图了，大家点一下复制在x浏览器或者via浏览器里面贴一下，刷新一下就看到效果了。

对了，这个代码是带诊断日志的，我就不移除了。

[JavaScript] *纯文本查看* *复制代码*
// ==UserScript==
// @name         吾爱代码块支持
// @namespace    wuai_copy
// @version      0.1.0
// @description  吾爱代码块隐藏/显示切换+md复制按钮支持
// @AuThor       涛之雨
// @match        https://www.52pojie.cn/*
// @grant             none
// @note         吾爱代码块隐藏/显示切换+md复制按钮支持
// @Icon         https://www.52pojie.cn/favicon.ico
// @home         https://greasyfork.org/zh-CN/scripts/416512
// @downloadURL https://update.greasyfork.org/scripts/416512/%E5%90%BE%E7%88%B1%E4%BB%A3%E7%A0%81%E5%9D%97%E6%94%AF%E6%8C%81.user.js
// @updateURL https://update.greasyfork.org/scripts/416512/%E5%90%BE%E7%88%B1%E4%BB%A3%E7%A0%81%E5%9D%97%E6%94%AF%E6%8C%81.meta.js
// ==/UserScript==

(function() {
window.onscroll=function(){
        document.querySelectorAll(".viewsource").forEach((a)=>{
            var b=a.parentElement;
            if(b.lastChild.className=="hideCode"||b.lastChild.className=="showCode"){
                    return;
            }
            var c = document.createElement('em');
            c.setAttribute("class","hideCode");
            c.style="cursor:pointer;font-size:12px;color:#369 !important;";
            c.innerHTML=" 隐藏代码";
                c.onclick=function(){
                        var a=this;
                        if(a.className=="hideCode"){
                                a.parentElement.parentElement.lastChild.style.height="0";
                                a.parentElement.parentElement.lastChild.style.overflow="hidden";
                            a.setAttribute("class","showCode");
                            a.innerHTML=" 显示代码";
                    }else if(a.className=="showCode"){
                                a.parentElement.parentElement.lastChild.style.height="";
                                a.parentElement.parentElement.lastChild.style.overflow=""
                            a.setAttribute("class","hideCode");
                            a.innerHTML=" 隐藏代码";
                    }
                };
            b.appendChild(c);
        });
        document.querySelectorAll("pre").forEach((a)=>{
            if(a.firstChild.className=="hideCode"||a.firstChild.className=="CopyMyCode"||a.firstChild.className=="showCode"){
                    return;
            }else{
                    var c = document.createElement('em');
                    c.setAttribute("class","hideCode");
                    c.style="cursor:pointer;font-size:12px;color:#369 !important;";
                    c.innerHTML=" 隐藏代码";
                    a.insertBefore(c,a.firstChild);
                        c.onclick=function(){
                                var a=this;
                                if(a.className=="hideCode"){
                                        a.parentElement.lastChild.style.height="0";
                                        a.parentElement.lastChild.style.overflow="hidden";
                                    a.setAttribute("class","showCode");
                                    a.innerHTML=" 显示代码";
                            }else if(a.className=="showCode"){
                                        a.parentElement.lastChild.style.height="";
                                        a.parentElement.lastChild.style.overflow="";
                                    a.setAttribute("class","hideCode");
                                    a.innerHTML=" 隐藏代码";
                            }
                        };
                    c = document.createElement('em');
                    c.setAttribute("class","CopyMyCode");
                    c.style="cursor:pointer;font-size:12px;color:#369 !important;";
                    c.innerHTML=" 复制代码";
                    a.insertBefore(c,a.firstChild);
                        c.onclick=function(){
                    var container = this.parentElement.lastChild;
                    var lines = container.childNodes;
                    var code = [];
                    for (var i = 0; i

下面是DeepSeek 改的

[JavaScript] *纯文本查看* *复制代码*
// ==UserScript==
// @name         吾爱代码块支持（修复版·带诊断日志·可拖动）
// @namespace    wuai_copy_fixed
// @version      0.7.2
// @description  吾爱代码块折叠/展开切换+md复制按钮支持。带完整诊断日志，一键定位按钮不可见问题。
// @author       涛之雨 (修复 by AI)
// @match        https://www.52pojie.cn/*
// @grant        none
// @icon         https://www.52pojie.cn/favicon.ico
// ==/UserScript==

(function() {
    'use strict';

    const POS_KEY_ALL_BTN = "52pojie_fold_all_btn_pos";
    const MIN_COUNT = 2;
    const VERSION = '0.7.2';

    // ============ 日志 ============
    const LOGS = [];
    const T0 = Date.now();
    function log(tag, ...args) {
        const msg = args.map(a => {
            if (typeof a === 'string') return a;
            if (a instanceof Element) {
                return ``;
            }
            try { return JSON.stringify(a); } catch { return String(a); }
        }).join(' ');
        const elapsed = String(Date.now() - T0).padStart(5, ' ');
        const line = `[+${elapsed}ms][${tag}] ${msg}`;
        LOGS.push(line);
        console.log(`%c[吾爱代码块][${tag}]`, 'color:#0a0', ...args);
    }
    window.__wuaCodeLogs = LOGS;

    // ============ 折叠按钮收集 ============
    function getFoldButtons() {
        const btns = [];
        document.querySelectorAll('.viewsource[data-wua-btn-added="1"]').forEach(vs => {
            const header = vs.parentElement;
            if (!header) return;
            const btn = header.querySelector('em.hideCode, em.showCode');
            if (btn) btns.push(btn);
        });
        document.querySelectorAll('pre[data-wua-btn-added="1"]').forEach(pre => {
            const btn = pre.querySelector(':scope > em.hideCode, :scope > em.showCode');
            if (btn) btns.push(btn);
        });
        return btns;
    }

    // ============ 折叠目标 ============
    function findCodeBody(viewsourceEl) {
        const header = viewsourceEl.parentElement;
        if (!header) return null;
        const wrapper = header.parentElement;
        if (!wrapper) return null;
        const sh = wrapper.querySelector('.syntaxhighlighter');
        if (sh) return sh;
        const pre = wrapper.querySelector('pre');
        if (pre) return pre;
        for (let i = wrapper.children.length - 1; i >= 0; i--) {
            const c = wrapper.children[i];
            if (c === header) continue;
            if (c.tagName === 'EM') continue;
            return c;
        }
        return null;
    }

    function setCollapsed(body, collapsed) {
        if (!body) return;
        if (collapsed) {
            body.dataset.wuaPrevDisplay = body.style.display || '';
            body.style.display = 'none';
        } else {
            body.style.display = body.dataset.wuaPrevDisplay || '';
        }
    }

    // ============ 单块按钮 ============
    function initViewsourceButtons() {
        let added = 0;
        document.querySelectorAll('.viewsource').forEach(function(vs) {
            if (vs.dataset.wuaBtnAdded === '1') return;
            const header = vs.parentElement;
            if (!header) return;
            vs.dataset.wuaBtnAdded = '1';

            const btn = document.createElement('em');
            btn.className = 'hideCode';
            btn.style.cssText = 'cursor:pointer;font-size:12px;color:#369 !important;';
            btn.textContent = ' 折叠代码';
            btn.dataset.collapsed = '0';

            btn.addEventListener('click', function(ev) {
                ev.preventDefault();
                ev.stopPropagation();
                log('CLICK', 'viewsource 折叠按钮');
                const body = findCodeBody(vs);
                if (!body) {
                    log('ERROR', '未找到代码正文');
                    return;
                }
                const collapsed = this.dataset.collapsed === '1';
                setCollapsed(body, !collapsed);
                if (!collapsed) {
                    this.dataset.collapsed = '1';
                    this.textContent = ' 展开代码';
                    this.className = 'showCode';
                } else {
                    this.dataset.collapsed = '0';
                    this.textContent = ' 折叠代码';
                    this.className = 'hideCode';
                }
                updateAllToggleBtnText();
            });

            header.appendChild(btn);
            added++;
        });
        if (added > 0) log('INIT', `新增 ${added} 个 viewsource 折叠按钮`);
    }

    function initBarePreButtons() {
        let added = 0;
        document.querySelectorAll('pre').forEach(function(pre) {
            if (pre.dataset.wuaBtnAdded === '1') return;
            const grandparent = pre.parentElement && pre.parentElement.parentElement;
            if (grandparent && grandparent.querySelector && grandparent.querySelector('.viewsource')) return;
            if (pre.parentElement && pre.parentElement.classList &&
                pre.parentElement.classList.contains('syntaxhighlighter')) return;
            pre.dataset.wuaBtnAdded = '1';

            let body = null;
            for (const c of pre.children) {
                if (c.tagName !== 'EM') { body = c; break; }
            }
            if (!body) {
                const div = document.createElement('div');
                div.style.cssText = 'white-space:pre;font-family:monospace;';
                Array.from(pre.childNodes).forEach(n => {
                    if (n.nodeType === 1 && n.tagName === 'EM') return;
                    div.appendChild(n);
                });
                pre.appendChild(div);
                body = div;
            }

            const btn = document.createElement('em');
            btn.className = 'hideCode';
            btn.style.cssText = 'cursor:pointer;font-size:12px;color:#369 !important;';
            btn.textContent = ' 折叠代码';
            btn.dataset.collapsed = '0';

            btn.addEventListener('click', function(ev) {
                ev.preventDefault();
                ev.stopPropagation();
                log('CLICK', '裸 pre 折叠按钮');
                const collapsed = this.dataset.collapsed === '1';
                setCollapsed(body, !collapsed);
                if (!collapsed) {
                    this.dataset.collapsed = '1';
                    this.textContent = ' 展开代码';
                    this.className = 'showCode';
                } else {
                    this.dataset.collapsed = '0';
                    this.textContent = ' 折叠代码';
                    this.className = 'hideCode';
                }
                updateAllToggleBtnText();
            });

            pre.insertBefore(btn, pre.firstChild);
            added++;
        });
        if (added > 0) log('INIT', `新增 ${added} 个裸 pre 折叠按钮`);
    }

    // ============ 拖拽引擎 ============
    const dragState = {
        el: null, active: false, moved: false,
        offsetX: 0, offsetY: 0, dragW: 0, dragH: 0,
        posKey: null
    };

    function startDrag(el, clientX, clientY, posKey) {
        const rect = el.getBoundingClientRect();
        el.style.right = "auto";
        el.style.bottom = "auto";
        el.style.left = rect.left + "px";
        el.style.top = rect.top + "px";
        el.style.transform = "none";

        dragState.el = el;
        dragState.active = true;
        dragState.moved = false;
        dragState.dragW = rect.width;
        dragState.dragH = rect.height;
        dragState.offsetX = clientX - rect.left;
        dragState.offsetY = clientY - rect.top;
        dragState.posKey = posKey;
        log('DRAG', '开始拖动');
    }

    function moveDrag(clientX, clientY) {
        if (!dragState.active || !dragState.el) return;
        const curLeft = parseFloat(dragState.el.style.left) || 0;
        const curTop = parseFloat(dragState.el.style.top) || 0;
        if (Math.abs(clientX - dragState.offsetX - curLeft) > 3 ||
            Math.abs(clientY - dragState.offsetY - curTop) > 3) {
            dragState.moved = true;
        }
        const maxX = Math.max(0, window.innerWidth - dragState.dragW);
        const maxY = Math.max(0, window.innerHeight - dragState.dragH);
        dragState.el.style.left = Math.max(0, Math.min(clientX - dragState.offsetX, maxX)) + "px";
        dragState.el.style.top = Math.max(0, Math.min(clientY - dragState.offsetY, maxY)) + "px";
    }

    function endDrag() {
        if (!dragState.active) return;
        dragState.active = false;
        if (dragState.moved && dragState.el && dragState.posKey) {
            const rect = dragState.el.getBoundingClientRect();
            localStorage.setItem(dragState.posKey, JSON.stringify({ x: rect.left, y: rect.top }));
            log('DRAG', '位置已保存:', { x: Math.round(rect.left), y: Math.round(rect.top) });
        }
    }

    document.addEventListener('mousemove', (e) => moveDrag(e.clientX, e.clientY));
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchmove', (e) => {
        if (!dragState.active) return;
        const t = e.touches[0];
        if (!t) return;
        e.preventDefault();
        moveDrag(t.clientX, t.clientY);
    }, { passive: false });
    document.addEventListener('touchend', endDrag, { passive: true });

    window.addEventListener('resize', () => {
        if (!allToggleBtn || !allToggleBtn.isConnected) return;
        const rect = allToggleBtn.getBoundingClientRect();
        const maxX = Math.max(0, window.innerWidth - rect.width);
        const maxY = Math.max(0, window.innerHeight - rect.height);
        allToggleBtn.style.right = 'auto';
        allToggleBtn.style.bottom = 'auto';
        allToggleBtn.style.transform = 'none';
        allToggleBtn.style.left = Math.max(0, Math.min(rect.left, maxX)) + 'px';
        allToggleBtn.style.top = Math.max(0, Math.min(rect.top, maxY)) + 'px';
    });

    function attachDrag(el, posKey) {
        el.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            startDrag(el, e.clientX, e.clientY, posKey);
            e.preventDefault();
        });
        el.addEventListener('touchstart', (e) => {
            const t = e.touches[0];
            if (!t) return;
            startDrag(el, t.clientX, t.clientY, posKey);
        }, { passive: true });
    }

    // ============ 位置恢复（详细日志版）============
    function restorePos(el, posKey) {
        const raw = localStorage.getItem(posKey);
        log('POS', 'localStorage 原始数据:', raw);

        let saved = null;
        try { saved = JSON.parse(raw || "null"); } catch (err) {
            log('POS', '&#10060; JSON 解析失败:', err.message);
        }

        // 脏数据校验
        if (saved) {
            const bad =
                typeof saved.x !== 'number' || typeof saved.y !== 'number' ||
                !isFinite(saved.x) || !isFinite(saved.y) ||
                saved.x  5000 || saved.y > 5000;
            if (bad) {
                log('POS', '&#9888;&#65039; 数据异常，丢弃:', saved);
                localStorage.removeItem(posKey);
                saved = null;
            }
        }

        if (!saved) {
            el.style.left = '16px';
            el.style.top = 'auto';
            el.style.right = 'auto';
            el.style.bottom = '16px';
            el.style.transform = 'none';
            log('POS', '&#9989; 使用默认位置（左下角）');
            return;
        }

        // 有数据：rAF 延迟计算
        requestAnimationFrame(() => {
            if (!el.isConnected) {
                log('POS', '&#10060; 元素已被移除，跳过位置恢复');
                return;
            }
            const rect = el.getBoundingClientRect();
            const w = rect.width || 120;
            const h = rect.height || 36;
            const maxX = Math.max(0, window.innerWidth - w);
            const maxY = Math.max(0, window.innerHeight - h);

            log('POS', '视口/尺寸:', {
                vw: window.innerWidth, vh: window.innerHeight,
                w: Math.round(w), h: Math.round(h),
                maxX: Math.round(maxX), maxY: Math.round(maxY),
                savedX: Math.round(saved.x), savedY: Math.round(saved.y)
            });

            // 越界自修复
            if (saved.x  window.innerWidth || saved.y > window.innerHeight) {
                log('POS', '&#9888;&#65039; 保存位置超出当前视口，重置到左下角');
                localStorage.removeItem(posKey);
                el.style.left = '16px';
                el.style.top = 'auto';
                el.style.right = 'auto';
                el.style.bottom = '16px';
                el.style.transform = 'none';
                return;
            }

            const nx = Math.max(0, Math.min(saved.x, maxX));
            const ny = Math.max(0, Math.min(saved.y, maxY));
            el.style.right = 'auto';
            el.style.bottom = 'auto';
            el.style.transform = 'none';
            el.style.left = nx + 'px';
            el.style.top = ny + 'px';
            log('POS', '&#9989; 位置已恢复:', { x: Math.round(nx), y: Math.round(ny) });
        });
    }

    // ============ 「折叠所有代码」按钮 ============
    let allToggleBtn = null;
    let lastBtnsCount = -1;

    function ensureAllToggleBtn() {
        const btns = getFoldButtons();
        const countChanged = btns.length !== lastBtnsCount;
        if (countChanged) {
            log('ENSURE', `代码块数量: ${lastBtnsCount} → ${btns.length}`);
            lastBtnsCount = btns.length;
        }

        if (btns.length  0 && btns.length  {
            if (!dragState.active) allToggleBtn.style.background = '#40a9ff';
        });
        allToggleBtn.addEventListener('mouseleave', () => {
            allToggleBtn.style.background = '#1890ff';
        });

        attachDrag(allToggleBtn, POS_KEY_ALL_BTN);

        allToggleBtn.addEventListener('click', (e) => {
            if (dragState.moved && dragState.el === allToggleBtn) {
                dragState.moved = false;
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            const list = getFoldButtons();
            if (list.length === 0) return;
            const collapsedCount = list.filter(b => b.dataset.collapsed === '1').length;
            const allCollapsed = collapsedCount === list.length;
            const target = !allCollapsed;
            log('CLICK', `折叠所有: ${collapsedCount}/${list.length} 已折叠 → 目标: ${target ? '全部折叠' : '全部展开'}`);
            list.forEach(b => {
                if (b.dataset.collapsed === (target ? '1' : '0')) return;
                b.click();
            });
            updateAllToggleBtnText();
        });

        document.body.appendChild(allToggleBtn);
        log('ENSURE', '按钮已 appendChild 到 body，初始 style:', allToggleBtn.getAttribute('style'));

        restorePos(allToggleBtn, POS_KEY_ALL_BTN);

        // 500ms 二次校验
        setTimeout(() => {
            if (!allToggleBtn || !allToggleBtn.isConnected) {
                log('VERIFY', '&#10060; 500ms 后按钮已不在 DOM');
                return;
            }
            const r = allToggleBtn.getBoundingClientRect();
            const inView = r.right > 0 && r.bottom > 0 &&
                           r.left  0 && r.height > 0;
            log('VERIFY', '500ms 校验:', {
                rect: { left: Math.round(r.left), top: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) },
                inViewport: inView
            });
            if (!inView) {
                log('VERIFY', '&#9888;&#65039; 不在视口内，强制重置');
                allToggleBtn.style.left = '16px';
                allToggleBtn.style.top = 'auto';
                allToggleBtn.style.right = 'auto';
                allToggleBtn.style.bottom = '16px';
                allToggleBtn.style.transform = 'none';
                localStorage.removeItem(POS_KEY_ALL_BTN);
            }
        }, 500);

        updateAllToggleBtnText();
    }

    function updateAllToggleBtnText() {
        if (!allToggleBtn || !allToggleBtn.isConnected) return;
        const btns = getFoldButtons();
        if (btns.length === 0) return;
        const collapsedCount = btns.filter(b => b.dataset.collapsed === '1').length;
        const allCollapsed = collapsedCount === btns.length;
        const newText = allCollapsed ? '展开所有代码' : '折叠所有代码';
        if (allToggleBtn.textContent !== newText) {
            allToggleBtn.textContent = newText;
            allToggleBtn.dataset.collapsed = allCollapsed ? '1' : '0';
            log('TEXT', `按钮文案更新为: ${newText}`);
        }
    }

    // ============ 状态快照（避免刷屏）============
    let lastSnap = null;
    function takeSnap() {
        const btn = document.getElementById('wua-toggle-all');
        const btns = getFoldButtons();
        let inView = false, rect = null;
        if (btn) {
            rect = btn.getBoundingClientRect();
            inView = rect.right > 0 && rect.bottom > 0 &&
                     rect.left  0 && rect.height > 0;
        }
        return {
            btnsCount: btns.length,
            btnExists: !!btn,
            btnInViewport: inView,
            btnPos: rect ? { x: Math.round(rect.left), y: Math.round(rect.top) } : null,
        };
    }
    function snapChanged(a, b) {
        if (!a || !b) return true;
        return a.btnsCount !== b.btnsCount ||
               a.btnExists !== b.btnExists ||
               a.btnInViewport !== b.btnInViewport;
    }

    // ============ 触发 ============
    let scheduled = false;
    function scheduleInit() {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(() => {
            try {
                initViewsourceButtons();
                initBarePreButtons();
                ensureAllToggleBtn();
                const snap = takeSnap();
                if (snapChanged(lastSnap, snap)) {
                    log('SNAP', '状态变化:', snap);
                    lastSnap = snap;
                }
            } catch (e) {
                log('ERROR', '初始化异常:', e && e.message, e && e.stack);
                console.error(e);
            }
            scheduled = false;
        });
    }

    window.addEventListener('scroll', scheduleInit, { passive: true });
    scheduleInit();
    const mo = new MutationObserver(scheduleInit);
    mo.observe(document.body, { childList: true, subtree: true });

    setTimeout(scheduleInit, 500);
    setTimeout(scheduleInit, 1500);
    setTimeout(scheduleInit, 3000);

    // ============ 3 秒心跳检查 ============
    setTimeout(() => {
        const snap = takeSnap();
        log('HEARTBEAT', '3 秒心跳:', snap);
        if (!snap.btnExists && snap.btnsCount >= MIN_COUNT) {
            log('HEARTBEAT', '&#128680; 严重：代码块 ≥ 2 但按钮不存在！请执行 __copyDiagnostics() 反馈');
        } else if (snap.btnExists && !snap.btnInViewport) {
            log('HEARTBEAT', '&#128680; 严重：按钮存在但不在视口内！建议 __resetAllBtnPos()');
        } else if (snap.btnExists && snap.btnInViewport) {
            log('HEARTBEAT', '&#9989; 按钮正常显示');
        }
    }, 3000);

    // ============ 诊断命令 ============
    window.__debugAllBtn = function() {
        console.group('&#128269; 折叠所有按钮诊断');
        console.log('localStorage:', localStorage.getItem(POS_KEY_ALL_BTN));
        const btn = document.getElementById('wua-toggle-all');
        console.log('按钮存在:', !!btn);
        if (btn) {
            const rect = btn.getBoundingClientRect();
            const cs = getComputedStyle(btn);
            const inView = rect.right > 0 && rect.bottom > 0 &&
                           rect.left  0 && cy > 0 && cx  {
                console.log('%c&#9989; 诊断信息已复制到剪贴板，直接粘贴给开发者即可', 'color:green;font-weight:bold;font-size:14px');
            }).catch(() => {
                console.log('%c&#9888;&#65039; 剪贴板复制失败，请手动从上方复制', 'color:orange');
            });
        } else {
            console.log('%c&#9888;&#65039; 浏览器不支持剪贴板 API，请手动从上方复制', 'color:orange');
        }
    };

    window.__dumpWuaCodeLogs = function() {
        console.log('%c===== 吾爱代码块 · 完整日志 =====', 'color:#0a0;font-weight:bold;font-size:14px');
        LOGS.forEach(l => console.log(l));
        if (navigator.clipboard) {
            navigator.clipboard.writeText(LOGS.join('\n')).then(() => {
                console.log('%c&#9989; 日志已复制到剪贴板', 'color:green;font-weight:bold');
            }).catch(() => {});
        }
    };

    log('BOOT', `&#9989; v${VERSION} 已加载。诊断命令：__copyDiagnostics() / __debugAllBtn() / __resetAllBtnPos()`);
})();

---

[查看原文](https://www.52pojie.cn/thread-2138095-1-1.html)
