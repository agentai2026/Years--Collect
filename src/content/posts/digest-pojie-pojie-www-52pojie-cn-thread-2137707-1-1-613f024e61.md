---
title: "新人作死の直接对52动手，油猴脚本-弹窗显示回复内容"
published: 2026-11-14
description: "惴惴不安的发表一下脚本 是以弹窗的形式显示回复内容的，效果如下 1 按钮位置，随意拖拽移动 2 左侧的红色序号，点击可以直接到达该楼层 [mw_shl_code=javascript,true]// ==UserScript== // @name ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "haswill"
sourceLink: "https://www.52pojie.cn/thread-2137707-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2137707-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

惴惴不安的发表一下脚本

是以弹窗的形式显示回复内容的，效果如下

![](https://static.52pojie.cn/static/image/common/none.gif)

**Screenshot_2026-11-14-19-41-46-80_82b10d9f3584360f08225ddcebbb4f6d.jpg** *(363.8 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg5NDc3M3wwNDc2M2FlOXwxNzk0ODAxNzA2fDB8MjEzNzcwNw%3D%3D&nothumb=yes)

2026-11-14 20:56 上传

1 按钮位置，随意拖拽移动

2 左侧的红色序号，点击可以直接到达该楼层

[JavaScript] *纯文本查看* *复制代码*
// ==UserScript==
// @name         吾爱回帖正文 - 弹窗版
// @namespace    http://tampermonkey.net/
// @version      8.7
// @description  将回帖内容提取到干净的弹窗中查看，支持连续读取下一页，修复超宽表格，极致压缩间距。悬浮按钮智能切换打开/关闭，支持记忆打开状态。点击序号跳转原楼层。
// @AuThor       haswill
// @match        https://www.52pojie.cn/*thread*
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    const LS_KEY_REMEMBER = "52pojie_modal_remember";
    const LS_KEY_MODE = "52pojie_modal_mode";
    const POS_KEY = "52pojie_btn_pos";

    let isHideOther = false;
    let modalBox = null;
    let currentPage = 1;
    let totalPages = 1;
    let loadedPostCount = 0;

    const styleAll = `
/* 悬浮按钮（弹窗/关闭） */
#toggleMaskBtn {
    position: fixed; right: 16px; top: 50%; transform: translateY(-50%);
    z-index: 999999; /* 确保在遮罩之上 */
    padding: 6px 12px; background: #ff8800; color: #fff;
    border: none; border-radius: 8px; cursor: move; box-shadow: 0 2px 10px #00000040;
    user-select: none; -webkit-user-select: none; box-sizing: border-box;
    white-space: nowrap; font-size: 16px; font-weight: bold;
    transition: background 0.2s;
}
#toggleMaskBtn.is-close-btn { background: #d82626; } /* 弹窗打开时变成红色关闭 */
#toggleMaskBtn:active { filter: brightness(0.9); }

/* 弹窗遮罩 */
#my_extract_modal {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.6); z-index: 999990;
    opacity: 0; visibility: hidden; transition: opacity 0.2s;
}
#my_extract_modal.show { opacity: 1; visibility: visible; }

/* 弹窗主体：上1vh、左右2%、下1vh */
#my_extract_modal .modal-content {
    position: absolute;
    top: 1vh;
    left: 2%;
    right: 2%;
    bottom: 1vh;
    width: auto;
    height: auto;
    max-width: none;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    display: flex; flex-direction: column; overflow: hidden;
    transform: scale(0.95); transition: transform 0.2s;
}
#my_extract_modal.show .modal-content { transform: scale(1); }

/* 头部：压缩行高和内边距 */
#my_extract_modal .modal-header {
    padding: 4px 6px 4px 12px;
    background: #fafafa;
    border-bottom: 1px solid #eee;
    display: flex; justify-content: space-between; align-items: center;
    font-weight: bold; color: #333; font-size: 14px; line-height: 1.2;
    flex-shrink: 0;
}
#my_extract_modal .modal-header .header-title {
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
#my_extract_modal .modal-header .header-actions {
    display: flex; align-items: center; gap: 2px; flex-shrink: 0;
}

/* 头部小按钮：设置 */
#my_extract_modal .modal-settings-btn {
    background: transparent; border: none; color: #888;
    cursor: pointer; font-size: 13px; line-height: 1;
    padding: 4px 6px; border-radius: 4px;
}
#my_extract_modal .modal-settings-btn:hover { color: #333; background: #eee; }

/* 右上角关闭 ×：无大背景色 */
#my_extract_modal .modal-close {
    background: transparent; border: none; color: #999;
    cursor: pointer; font-size: 22px; line-height: 1;
    padding: 0 6px; border-radius: 4px;
    display: flex; align-items: center; justify-content: center;
    width: 28px; height: 28px; box-sizing: border-box;
}
#my_extract_modal .modal-close:hover { color: #e53935; background: #f0f0f0; }

/* 设置面板 */
#my_extract_modal .modal-settings-panel {
    position: absolute; right: 10px; top: 38px;
    background: #fff; border: 1px solid #ddd; border-radius: 8px;
    box-shadow: 0 6px 20px rgba(0,0,0,0.18);
    padding: 8px 12px; z-index: 20; font-size: 14px; color: #333;
    display: none; min-width: 210px;
}
#my_extract_modal .modal-settings-panel.show { display: block; }
#my_extract_modal .modal-settings-panel label {
    display: flex; align-items: center; gap: 8px;
    cursor: pointer; user-select: none; line-height: 1.9;
}
#my_extract_modal .modal-settings-panel input[type="checkbox"] {
    width: 16px; height: 16px; margin: 0; cursor: pointer;
}

/* 滚动区域：压缩顶部/底部间距 */
#my_extract_modal .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 4px 10px 20px 8px; /* 底部由60px减小到20px，因为左下角按钮移除了 */
    box-sizing: border-box;
    font-size: 15px;
    color: #333;
    scrollbar-width: thin;
    scrollbar-color: #888 #f1f1f1;
}
#my_extract_modal .modal-body::-webkit-scrollbar { width: 6px; display: block !important; }
#my_extract_modal .modal-body::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
#my_extract_modal .modal-body::-webkit-scrollbar-thumb { background: #888; border-radius: 4px; }
#my_extract_modal .modal-body::-webkit-scrollbar-thumb:hover { background: #555; }

/* ======== 帖子排版 ======== */
.my-msg-item-wrap {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    padding: 6px 0;
    border-bottom: 1px dashed #ddd;
}
.my-msg-item-wrap:last-child { border-bottom: none; }

.my-circle-num {
    flex-shrink: 0; width: 22px; height: 22px;
    border-radius: 50%; background: #d82626; color: #fff;
    display: flex; justify-content: center; align-items: center;
    font-size: 12px; font-weight: bold; margin-top: 2px;
    cursor: pointer;
    transition: transform 0.1s, background 0.2s;
}
.my-circle-num:hover { background: #b71c1c; transform: scale(1.1); }

.my-msg-content {
    flex: 1; min-width: 0;
    line-height: 1.4;
    overflow-wrap: break-word;
    display: flow-root;
}
.my-msg-content img { display: inline-block; vertical-align: top; margin: 3px 0; border-radius: 4px; max-width: 100% !important; height: auto !important; }

/* 极强效压缩，干掉段落和换行引起的空隙 */
.my-msg-content p {
    margin: 0 0 1px 0 !important;
    padding: 0 !important;
}
.my-msg-content br {
    display: block !important;
    content: "" !important;
    margin-top: -6px !important;
    line-height: 0 !important;
}
.my-msg-content div:empty,
.my-msg-content p:empty {
    display: none !important;
}
.my-msg-content div {
    margin-bottom: 1px !important;
}

/* 引用修复 */
.my-msg-content blockquote, .my-msg-content .quote {
    margin: 2px 0 3px 0 !important;
    padding: 5px 8px !important;
    background: #f7f7f7 !important;
    border: 1px dashed #ccc !important;
    border-left: 3px solid #369 !important;
    border-radius: 4px !important;
    color: #666 !important;
    font-size: 13px !important;
    display: block !important;
    width: 100% !important;
    box-sizing: border-box !important;
    background-image: none !important;
    float: none !important;
}
.my-msg-content blockquote p,
.my-msg-content .quote p {
    margin-bottom: 0 !important;
}
.my-msg-content blockquote *, .my-msg-content .quote * { float: none !important; max-width: 100% !important; }

/* 针对超宽表格的修复（弹窗内） */
.my-msg-content table {
    max-width: 100% !important;
    width: 100% !important;
    display: block !important;
    overflow-x: auto !important;
    white-space: normal !important;
    border-collapse: collapse !important;
    font-size: 13px !important;
    margin: 6px 0 !important;
}
.my-msg-content table th,
.my-msg-content table td {
    padding: 3px 5px !important;
    word-break: break-all !important;
    border: 1px solid #e0e0e0 !important;
}

/* 针对原网页本体的超宽表格修复 */
[id*="postmessage_"] table {
    max-width: 100% !important;
    display: block !important;
    overflow-x: auto !important;
}
[id*="postmessage_"] table th,
[id*="postmessage_"] table td {
    word-break: break-all !important;
}

/* 代码块折叠 */
.my-code-toggle {
    cursor: pointer !important; font-size: 12px !important; color: #369 !important;
    font-style: normal !important; text-decoration: none !important;
    margin: 0 8px !important; user-select: none !important; -webkit-user-select: none !important;
}
.my-code-collapsed { display: none !important; }

/* 加载更多按钮 */
.btn-load-more {
    display: block; width: 100%; padding: 8px; margin: 8px 0;
    background: #1890ff; color: #fff; border: none; border-radius: 8px;
    font-size: 14px; font-weight: bold; cursor: pointer; transition: 0.2s;
}
.btn-load-more:hover { background: #40a9ff; }
.btn-load-more:disabled { background: #ccc; cursor: not-allowed; }

/* 原页面楼层高亮 */
.my-post-highlight {
    animation: myPostFlash 1.6s ease-out 1;
}
@keyframes myPostFlash {
    0% { background-color: #fff3cd; }
    50% { background-color: #ffe08a; }
    100% { background-color: transparent; }
}
`;

    GM_addStyle(styleAll);

    const btn = document.createElement('button');
    btn.id = "toggleMaskBtn";
    btn.innerText = "弹窗";
    document.body.appendChild(btn);

    function getRememberMode(){
        return localStorage.getItem(LS_KEY_REMEMBER) === "1";
    }
    function setRememberMode(remember){
        localStorage.setItem(LS_KEY_REMEMBER, remember ? "1" : "0");
        if(!remember){
            localStorage.removeItem(LS_KEY_MODE);
        }
    }
    function setModeOpened(){
        if(getRememberMode()) localStorage.setItem(LS_KEY_MODE, "1");
    }
    function setModeClosed(){
        if(getRememberMode()) localStorage.setItem(LS_KEY_MODE, "0");
    }

    function initPageInfo() {
        const params = new URLSearchParams(window.location.search);
        currentPage = parseInt(params.get("page"), 10) || 1;
        const pageText = document.body.innerHTML.match(/共\s*(\d+)\s*页/);
        totalPages = pageText ? parseInt(pageText[1], 10) : 1;
        const pgEls = document.querySelectorAll('.pg a');
        pgEls.forEach(el => {
            const p = parseInt(el.innerText, 10);
            if (!isNaN(p) && p > totalPages) totalPages = p;
        });
    }

    function fixLinks(container, baseUrl) {
        container.querySelectorAll('a').forEach(a => {
            if(a.getAttribute('href') && !a.getAttribute('href').startsWith('http')) {
                a.href = new URL(a.getAttribute('href'), baseUrl).href;
            }
            a.target = "_blank";
        });
        container.querySelectorAll('img').forEach(img => {
            if(img.getAttribute('src') && !img.getAttribute('src').startsWith('http')) {
                img.src = new URL(img.getAttribute('src'), baseUrl).href;
            }
        });
    }

    function foldCodeBlocks(root){
        if(!root) return;
        root.querySelectorAll('div').forEach(wrap=>{
            if(wrap.style.paddingTop !== '15px' || wrap.style.paddingBottom !== '15px') return;
            const body = wrap.querySelector(':scope > pre, :scope > .syntaxhighlighter') || wrap.lastElementChild;
            if(!body || !body.classList.contains('syntaxhighlighter') && !body.tagName.match(/PRE/i)) return;

            if(wrap.dataset.myFolded === "1") return;
            const toggle = document.createElement('em');
            toggle.className = 'my-code-toggle';
            toggle.textContent = ' [展开代码] ';
            toggle.onclick = (ev) => {
                ev.stopPropagation();
                const collapsed = body.classList.toggle('my-code-collapsed');
                toggle.textContent = collapsed ? ' [展开代码] ' : ' [收起代码] ';
            };
            wrap.insertBefore(toggle, body);
            body.classList.add('my-code-collapsed');
            wrap.dataset.myFolded = "1";
        });
    }

    function extractPostsFromDoc(doc, pageNum) {
        const postList = doc.querySelector("#postlist");
        if(!postList) return [];

        const postDivArr = Array.from(postList.querySelectorAll('div[id^="post_"]'));
        const skipIndex = pageNum === 1 ? 1 : 0;
        const results = [];

        for(let i = skipIndex; i  {
            const wrap = document.createElement("div");
            wrap.className = "my-msg-item-wrap";

            const numSpan = document.createElement("span");
            numSpan.className = "my-circle-num";
            numSpan.textContent = String(++loadedPostCount);
            numSpan.title = item.postId ? `跳转到 ${item.postId}` : "跳转到原楼层";

            numSpan.addEventListener("click", (e) => {
                e.stopPropagation();
                jumpToPost(item.postId, item.pageNum);
            });

            const contentDiv = document.createElement("div");
            contentDiv.className = "my-msg-content";

            const parser = new DOMParser();
            const doc = parser.parseFromString(item.html, 'text/html');
            while(doc.body.firstChild) {
                contentDiv.appendChild(doc.body.firstChild);
            }
            fixLinks(contentDiv, baseUrl);

            wrap.appendChild(numSpan);
            wrap.appendChild(contentDiv);

            const btnLoadMore = bodyArea.querySelector('.btn-load-more');
            if(btnLoadMore) bodyArea.insertBefore(wrap, btnLoadMore);
            else bodyArea.appendChild(wrap);
        });

        foldCodeBlocks(bodyArea);
    }

    function jumpToPost(postId, pageNum) {
        hideModal();

        if(!postId) return;

        setTimeout(() => {
            const targetPage = pageNum || 1;
            const currentUrl = new URL(window.location.href);
            const nowPage = parseInt(currentUrl.searchParams.get("page"), 10) || 1;

            if(targetPage === nowPage) {
                const el = document.getElementById(postId);
                if(el) {
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                    flashPost(el);
                }
            } else {
                currentUrl.searchParams.set("page", targetPage);
                window.location.href = currentUrl.toString() + "#" + postId;
            }
        }, 220);
    }

    function flashPost(el) {
        el.classList.remove("my-post-highlight");
        void el.offsetWidth;
        el.classList.add("my-post-highlight");
        setTimeout(() => el.classList.remove("my-post-highlight"), 1800);
    }

    function loadNextPage() {
        if(currentPage >= totalPages) return;

        const nextPage = currentPage + 1;
        const btnLoadMore = modalBox.querySelector('.btn-load-more');
        btnLoadMore.innerText = `正在静默读取第 ${nextPage} 页...`;
        btnLoadMore.disabled = true;

        const url = new URL(window.location.href);
        url.searchParams.set('page', nextPage);

        GM_xmlhttpRequest({
            method: "GET",
            url: url.toString(),
            onload: (res) => {
                try {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(res.responseText, 'text/html');
                    const posts = extractPostsFromDoc(doc, nextPage);

                    appendPostsToModal(posts, url.origin + url.pathname);

                    currentPage = nextPage;
                    if(currentPage >= totalPages) {
                        btnLoadMore.innerText = "已经是最后一页了";
                        btnLoadMore.style.background = "#ccc";
                        btnLoadMore.style.cursor = "not-allowed";
                    } else {
                        btnLoadMore.innerText = `继续读取第 ${currentPage + 1} 页`;
                        btnLoadMore.disabled = false;
                    }
                } catch(e) {
                    btnLoadMore.innerText = "读取失败，点击重试";
                    btnLoadMore.disabled = false;
                    console.error(e);
                }
            },
            onerror: () => {
                btnLoadMore.innerText = "网络错误，点击重试";
                btnLoadMore.disabled = false;
            }
        });
    }

    function showModal(){
        initPageInfo();
        const postList = document.querySelector("#postlist");
        if(!postList) return;

        if(modalBox) modalBox.remove();
        modalBox = document.createElement('div');
        modalBox.id = "my_extract_modal";

        const contentPanel = document.createElement('div');
        contentPanel.className = "modal-content";

        const header = document.createElement('div');
        header.className = "modal-header";

        const titleSpan = document.createElement('span');
        titleSpan.className = "header-title";
        titleSpan.textContent = `只看回帖正文 (当前阅读: 第 ${currentPage} 页)`;

        const actions = document.createElement('div');
        actions.className = "header-actions";

        // 设置按钮
        const settingsBtn = document.createElement('button');
        settingsBtn.className = "modal-settings-btn";
        settingsBtn.type = "button";
        settingsBtn.textContent = "设置";

        // 右上角关闭 ×
        const closeBtn = document.createElement('button');
        closeBtn.className = "modal-close";
        closeBtn.type = "button";
        closeBtn.textContent = "×";
        closeBtn.title = "关闭";
        closeBtn.onclick = hideModal;

        actions.appendChild(settingsBtn);
        actions.appendChild(closeBtn);
        header.appendChild(titleSpan);
        header.appendChild(actions);

        // 设置面板
        const settingsPanel = document.createElement('div');
        settingsPanel.className = "modal-settings-panel";

        // 记忆打开状态选项
        const labelRemember = document.createElement('label');
        const chkRemember = document.createElement('input');
        chkRemember.type = "checkbox";
        chkRemember.checked = getRememberMode();
        const chkRememberText = document.createElement('span');
        chkRememberText.textContent = "记忆打开状态";
        labelRemember.appendChild(chkRemember);
        labelRemember.appendChild(chkRememberText);
        settingsPanel.appendChild(labelRemember);

        chkRemember.onchange = () => {
            const remember = chkRemember.checked;
            setRememberMode(remember);
            if(remember){
                if(modalBox) localStorage.setItem(LS_KEY_MODE, "1");
            }
        };

        settingsBtn.onclick = (e) => {
            e.stopPropagation();
            settingsPanel.classList.toggle("show");
        };

        // 点面板外收起设置面板
        modalBox.addEventListener("click", (e) => {
            if(settingsPanel.classList.contains("show") &&
               !settingsPanel.contains(e.target) &&
               e.target !== settingsBtn) {
                settingsPanel.classList.remove("show");
            }
        });

        const bodyArea = document.createElement('div');
        bodyArea.className = "modal-body";

        const posts = extractPostsFromDoc(document, currentPage);
        loadedPostCount = 0;

        const btnLoadMore = document.createElement('button');
        btnLoadMore.className = "btn-load-more";

        if(currentPage  boxToRemove.remove(), 200);
        isHideOther = false;

        // 悬浮按钮变成弹窗状态
        btn.innerText = "弹窗";
        btn.classList.remove("is-close-btn");

        setModeClosed();
    }

    function toggleView(){
        if(isHideOther) hideModal();
        else showModal();
    }

    // ==================== 拖拽逻辑 ====================
    let draging = false, dragMoved = false, offsetX = 0, offsetY = 0, dragW = 0, dragH = 0;

    function fixPositionToLeftTop(){
        const rect = btn.getBoundingClientRect();
        btn.style.right = "auto"; btn.style.left = rect.left + "px";
        btn.style.top = rect.top + "px"; btn.style.transform = "none";
        return rect;
    }

    function clampAndApply(x, y){
        const maxX = Math.max(0, window.innerWidth - dragW);
        const maxY = Math.max(0, window.innerHeight - dragH);
        btn.style.left = Math.max(0, Math.min(x, maxX)) + "px";
        btn.style.top  = Math.max(0, Math.min(y, maxY)) + "px";
    }

    function startDrag(clientX, clientY){
        const rect = fixPositionToLeftTop();
        dragW = rect.width; dragH = rect.height;
        draging = true; dragMoved = false;
        offsetX = clientX - rect.left; offsetY = clientY - rect.top;
    }

    function moveDrag(clientX, clientY){
        if(!draging) return;
        if(Math.abs(clientX - (offsetX + btn.getBoundingClientRect().left)) > 3 ||
           Math.abs(clientY - (offsetY + btn.getBoundingClientRect().top)) > 3){
            dragMoved = true;
        }
        clampAndApply(clientX - offsetX, clientY - offsetY);
    }

    function endDrag(){
        if(!draging) return;
        draging = false;
        if(dragMoved){
            const rect = btn.getBoundingClientRect();
            localStorage.setItem(POS_KEY, JSON.stringify({ x: rect.left, y: rect.top }));
        }
    }

    btn.addEventListener('mousedown', (e)=>{
        if(e.button !== 0) return;
        startDrag(e.clientX, e.clientY); e.preventDefault();
    });
    document.addEventListener('mousemove', (e)=> moveDrag(e.clientX, e.clientY));
    document.addEventListener('mouseup', endDrag);

    btn.addEventListener('touchstart', (e)=>{
        const t = e.touches[0];
        if(!t) return;
        startDrag(t.clientX, t.clientY);
    }, { passive: true });

    document.addEventListener('touchmove', (e)=>{
        if(!draging) return;
        const t = e.touches[0];
        if(!t) return;
        e.preventDefault();
        moveDrag(t.clientX, t.clientY);
    }, { passive: false });

    document.addEventListener('touchend', endDrag, { passive: true });

    btn.addEventListener('click', (e)=>{
        if(dragMoved){
            dragMoved = false;
            e.preventDefault(); e.stopPropagation();
            return;
        }
        toggleView();
    });

    window.addEventListener('resize', ()=>{
        const rect = btn.getBoundingClientRect();
        btn.style.right = "auto"; btn.style.transform = "none";
        dragW = rect.width; dragH = rect.height;
        clampAndApply(rect.left, rect.top);
    });

    function restoreBtnPos(){
        let saved = null;
        try{ saved = JSON.parse(localStorage.getItem(POS_KEY) || "null"); }catch(err){}
        if(!saved || typeof saved.x !== "number" || typeof saved.y !== "number") return;
        btn.style.right = "auto"; btn.style.transform = "none";
        dragW = btn.offsetWidth; dragH = btn.offsetHeight;
        clampAndApply(saved.x, saved.y);
    }
    restoreBtnPos();

    let pollCount = 0;
    function pollPostlist(){
        pollCount++;
        if(document.querySelector("#postlist")){
            if(getRememberMode() && localStorage.getItem(LS_KEY_MODE) === "1"){
                showModal();
            }
            return;
        }
        if(pollCount

---

[查看原文](https://www.52pojie.cn/thread-2137707-1-1.html)
