---
title: "歌曲宝在线音乐下载跳过排队直接给出下载链接"
published: 2026-08-27
description: "歌曲宝在线音乐下载跳过排队直接给出下载链接"
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "pxhzai"
sourceLink: "https://www.52pojie.cn/thread-2124942-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2124942-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

歌曲宝在线音乐下载跳过排队直接给出下载链接

原贴https://www.52pojie.cn/thread-2119173-1-1.html

油猴脚本

[JavaScript] *纯文本查看* *复制代码*
// ==UserScript==
// @name         歌曲宝直链下载（高清+普通）
// @namespace    gequbao.com
// @version      5.4
// @description  在歌曲宝页面添加高清和普通两个下载按钮，跳过排队，修正下载文件名，支持验证码
// @author       TeleAgent
// @match        *://*.gequbao.com/*
// @match        *://gequbao.com/*
// @grant        GM_download
// @connect      kuwo.cn
// @connect      *
// ==/UserScript==

(function () {
    'use strict';

    var win = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;

    function init() {
        if (!win.appData || !win.appData.play_id) {
            setTimeout(init, 300);
            return;
        }
        if (document.getElementById('gm-btn-normal')) return;

        var appData = win.appData;
        var hasHD = appData.mp3_extra_urls && appData.mp3_extra_urls.length > 0;
        var fileName = getFileName(appData);

        // ====== 右上角标记 ======
        var badge = document.createElement('div');
        badge.id = 'gm-badge';
        badge.textContent = hasHD ? '\u26A1 \u9AD8\u6E05 + \u666E\u901A \u5DF1\u5C31\u7EEA' : '\u26A1 \u666E\u901A\u4E0B\u8F7D\u5DF1\u5C31\u7EEA';
        badge.style.cssText =
            'position:fixed;top:70px;right:16px;z-index:99999;' +
            'background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;' +
            'padding:6px 16px;border-radius:20px;font-size:13px;' +
            'font-weight:bold;box-shadow:0 2px 8px rgba(0,0,0,0.2);';
        document.body.appendChild(badge);

        // ====== 按钮容器 ======
        var container = document.createElement('div');
        container.id = 'gm-btn-container';
        container.style.cssText = 'margin-top:8px;';

        // ====== 高清下载按钮 ======
        if (hasHD) {
            var btnHD = document.createElement('button');
            btnHD.id = 'gm-btn-hd';
            btnHD.innerHTML = '\uD83C\uDFAF \u9AD8\u6E05\u4E0B\u8F7D\uFF08\u5938\u514B\u7F51\u76D8\uFF09';
            btnHD.style.cssText =
                'display:block;width:100%;padding:10px 16px;margin-bottom:8px;' +
                'background:linear-gradient(135deg,#ee5a5a,#e74c3c);' +
                'color:#fff;border:none;border-radius:8px;font-size:15px;' +
                'font-weight:bold;cursor:pointer;box-shadow:0 2px 8px rgba(231,76,60,0.4);' +
                'transition:all 0.2s;';
            btnHD.onmouseenter = function () { btnHD.style.transform = 'translateY(-2px)'; };
            btnHD.onmouseleave = function () { btnHD.style.transform = ''; };
            btnHD.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (appData.mp3_extra_urls && appData.mp3_extra_urls.length > 0) {
                    try {
                        win.open(atob(appData.mp3_extra_urls[0].share_link), '_blank');
                        toast('\u6B63\u5728\u6253\u5F00\u9AD8\u6E05\u7F51\u76D8\u94FE\u63A5', 'success');
                    } catch (err) {
                        toast('\u7F51\u76D8\u94FE\u63A5\u89E3\u6790\u5931\u8D25', 'error');
                    }
                } else {
                    toast('\u8BE5\u6B4C\u66F2\u65E0\u9AD8\u6E05\u7248\u672C', 'error');
                }
            });
            container.appendChild(btnHD);
        }

        // ====== 普通下载按钮 ======
        var btnNormal = document.createElement('button');
        btnNormal.id = 'gm-btn-normal';
        btnNormal.innerHTML = '\u26A1 \u666E\u901A\u4E0B\u8F7D\uFF08\u76F4\u94FE\u8DF3\u8FC7\u6392\u961F\uFF09';
        btnNormal.style.cssText =
            'display:block;width:100%;padding:10px 16px;' +
            'background:linear-gradient(135deg,#667eea,#764ba2);' +
            'color:#fff;border:none;border-radius:8px;font-size:15px;' +
            'font-weight:bold;cursor:pointer;box-shadow:0 2px 8px rgba(102,126,234,0.4);' +
            'transition:all 0.2s;';
        btnNormal.onmouseenter = function () { btnNormal.style.transform = 'translateY(-2px)'; };
        btnNormal.onmouseleave = function () { btnNormal.style.transform = ''; };
        btnNormal.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (appData.mp3_type === 1) {
                toast('\u8BE5\u6B4C\u66F2\u4E3A\u4ED8\u8D39\u7C7B\u578B\uFF0C\u4E0D\u652F\u6301\u76F4\u94FE\u4E0B\u8F7D', 'error');
                return;
            }
            doDownload();
        });
        container.appendChild(btnNormal);

        // ====== 获取文件名（实时读取 + 兜底拼接） ======
        function getFileName(data) {
            // 优先用 mp3_name
            if (data.mp3_name && data.mp3_name !== 'undefined') {
                return data.mp3_name + '.mp3';
            }
            // 兜底：用标题和作者拼接
            var title = data.mp3_title || '';
            var author = data.mp3_author || '';
            if (title && author) {
                return title + '-' + author + '.mp3';
            }
            // 再兜底：用页面标题
            var pageTitle = document.title.replace(/-MP3.*$/i, '').replace(/\s*-.*/g, function (m, idx) { return idx > 0 ? m : ''; });
            if (pageTitle) {
                return pageTitle.trim() + '.mp3';
            }
            // 最终兜底
            return 'download.mp3';
        }

        // ====== 下载流程（含验证码处理） ======
        function doDownload(captchaCode, captchaKey) {
            btnNormal.innerHTML = '\u23F3 \u6B63\u5728\u89E3\u6790...';
            btnNormal.style.pointerEvents = 'none';

            var data = 'id=' + encodeURIComponent(appData.play_id);
            if (captchaCode) data += '&captchaCode=' + encodeURIComponent(captchaCode);
            if (captchaKey) data += '&key=' + encodeURIComponent(captchaKey);

            var x = new XMLHttpRequest();
            x.open('POST', '/member/common-play-url', true);
            x.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            x.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            x.onreadystatechange = function () {
                if (x.readyState !== 4) return;
                btnNormal.innerHTML = '\u26A1 \u666E\u901A\u4E0B\u8F7D\uFF08\u76F4\u94FE\u8DF3\u8FC7\u6392\u961F\uFF09';
                btnNormal.style.pointerEvents = '';
                if (x.status === 200) {
                    try {
                        var r = JSON.parse(x.responseText);
                        if (r.code === 1 && r.data && r.data.url) {
                            // 下载时实时获取文件名，避免页面未初始化时为 undefined
                            var dlName = getFileName(appData);
                            startDownload(r.data.url, dlName);
                        } else if (r.code === 2 || r.code === 3) {
                            // 需要验证码
                            console.log('[\u76F4\u94FE\u4E0B\u8F7D] \u9700\u8981\u9A8C\u8BC1\u7801, code=' + r.code);
                            showCaptcha(r.msg || '\u8BF7\u8F93\u5165\u9A8C\u8BC1\u7801\u4EE5\u7EE7\u7EED');
                        } else {
                            toast('\u89E3\u6790\u5931\u8D25: ' + (r.msg || '\u672A\u77E5\u9519\u8BEF'), 'error');
                        }
                    } catch (err) {
                        toast('\u89E3\u6790\u5F02\u5E38', 'error');
                    }
                } else if (x.status === 429) {
                    toast('\u8BF7\u6C42\u8FC7\u4E8E\u9891\u7E41\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD15', 'error');
                } else {
                    toast('\u8BF7\u6C42\u5931\u8D25: ' + x.status, 'error');
                }
            };
            x.send(data);
        }

        // ====== 验证码弹窗 ======
        function showCaptcha(promptMsg) {
            // 移除已有弹窗
            var old = document.getElementById('gm-captcha-modal');
            if (old) old.remove();

            var overlay = document.createElement('div');
            overlay.id = 'gm-captcha-modal';
            overlay.style.cssText =
                'position:fixed;top:0;left:0;width:100%;height:100%;' +
                'background:rgba(0,0,0,0.5);z-index:999999;display:flex;' +
                'align-items:center;justify-content:center;';

            var box = document.createElement('div');
            box.style.cssText =
                'background:#fff;border-radius:12px;padding:24px;width:320px;' +
                'box-shadow:0 8px 32px rgba(0,0,0,0.3);text-align:center;';

            var title = document.createElement('div');
            title.textContent = promptMsg;
            title.style.cssText = 'font-size:14px;color:#666;margin-bottom:16px;font-weight:bold;';
            box.appendChild(title);

            // 验证码图片
            var imgBox = document.createElement('div');
            imgBox.style.cssText = 'display:flex;align-items:center;justify-content:center;margin-bottom:12px;';
            var img = document.createElement('img');
            img.style.cssText = 'height:40px;border:1px solid #ddd;border-radius:4px;cursor:pointer;vertical-align:middle;';
            img.title = '\u770B\u4E0D\u6E05\uFF1F\u70B9\u6362\u4E00\u5F20';
            var refreshBtn = document.createElement('span');
            refreshBtn.textContent = '\u21BB';
            refreshBtn.style.cssText = 'font-size:20px;margin-left:8px;cursor:pointer;color:#999;';
            imgBox.appendChild(img);
            imgBox.appendChild(refreshBtn);
            box.appendChild(imgBox);

            // 输入框
            var input = document.createElement('input');
            input.type = 'text';
            input.placeholder = '\u8BF7\u8F93\u5165\u9A8C\u8BC1\u7801';
            input.maxLength = 10;
            input.style.cssText =
                'width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;' +
                'font-size:16px;text-align:center;letter-spacing:2px;margin-bottom:12px;box-sizing:border-box;';
            box.appendChild(input);

            // 按钮行
            var btnRow = document.createElement('div');
            btnRow.style.cssText = 'display:flex;gap:8px;';
            var cancelBtn = document.createElement('button');
            cancelBtn.textContent = '\u53D6\u6D88';
            cancelBtn.style.cssText = 'flex:1;padding:10px;border:none;border-radius:6px;background:#f0f0f0;cursor:pointer;font-size:14px;';
            var submitBtn = document.createElement('button');
            submitBtn.textContent = '\u63D0\u4EA4\u9A8C\u8BC1';
            submitBtn.style.cssText = 'flex:1;padding:10px;border:none;border-radius:6px;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;cursor:pointer;font-size:14px;font-weight:bold;';
            btnRow.appendChild(cancelBtn);
            btnRow.appendChild(submitBtn);
            box.appendChild(btnRow);
            overlay.appendChild(box);
            document.body.appendChild(overlay);

            // 加载验证码
            var currentKey = '';
            function loadCaptcha() {
                img.style.opacity = '0.5';
                var cx = new XMLHttpRequest();
                cx.open('GET', '/api/captcha?' + Math.random(), true);
                cx.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                cx.onreadystatechange = function () {
                    if (cx.readyState !== 4) return;
                    img.style.opacity = '1';
                    if (cx.status === 200) {
                        try {
                            var cr = JSON.parse(cx.responseText);
                            if (cr.code === 1 && cr.data) {
                                img.src = cr.data.img;
                                currentKey = cr.data.key;
                                input.value = '';
                                input.focus();
                            } else {
                                toast('\u9A8C\u8BC1\u7801\u52A0\u8F7D\u5931\u8D25', 'error');
                            }
                        } catch (e) {
                            toast('\u9A8C\u8BC1\u7801\u52A0\u8F7D\u5F02\u5E38', 'error');
                        }
                    }
                };
                cx.send();
            }
            loadCaptcha();
            img.onclick = loadCaptcha;
            refreshBtn.onclick = loadCaptcha;

            // 提交
            function submit() {
                var code = input.value.trim();
                if (!code) { input.focus(); return; }
                overlay.remove();
                doDownload(code, currentKey);
            }
            submitBtn.onclick = submit;
            input.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
            cancelBtn.onclick = function () { overlay.remove(); };
            input.focus();
        }

        // ====== 开始下载 ======
        function startDownload(url, name) {
            try {
                GM_download({
                    url: url,
                    name: name,
                    saveAs: false,
                    onload: function () { toast('\u4E0B\u8F7D\u5B8C\u6210: ' + name, 'success'); },
                    onerror: function (err) {
                        console.log('[\u76F4\u94FE\u4E0B\u8F7D] GM_download \u5931\u8D25, \u56DE\u9000:', err);
                        fallbackDownload(url, name);
                    }
                });
            } catch (gmErr) {
                console.log('[\u76F4\u94FE\u4E0B\u8F7D] GM_download \u5F02\u5E38, \u56DE\u9000:', gmErr);
                fallbackDownload(url, name);
            }
        }

        // ====== 回退下载 ======
        function fallbackDownload(url, name) {
            try {
                GM_download(url, name);
                toast('\u4E0B\u8F7D\u5DF2\u5F00\u59CB: ' + name, 'success');
            } catch (e1) {
                try {
                    fetch(url)
                        .then(function (resp) { return resp.blob(); })
                        .then(function (blob) {
                            var a = document.createElement('a');
                            a.href = URL.createObjectURL(blob);
                            a.download = name;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
                            toast('\u4E0B\u8F7D\u5DF2\u5F00\u59CB: ' + name, 'success');
                        })
                        .catch(function () {
                            win.open(url, '_blank');
                            toast('\u8BF7\u624B\u52A8\u91CD\u547D\u540D\u4E3A: ' + name, 'info');
                        });
                } catch (e2) {
                    win.open(url, '_blank');
                    toast('\u8BF7\u624B\u52A8\u91CD\u547D\u540D\u4E3A: ' + name, 'info');
                }
            }
        }

        // ====== 插入页面 ======
        var target = document.querySelector('#btn-download-mp3');
        if (target) {
            var inputGroup = target.closest('.input-group');
            if (inputGroup && inputGroup.parentNode) {
                inputGroup.parentNode.insertBefore(container, inputGroup.nextSibling);
            } else {
                target.parentNode.appendChild(container);
            }
        } else {
            document.body.appendChild(container);
        }

        // ====== Toast ======
        function toast(msg, type) {
            type = type || 'success';
            var colors = { success: '#28a745', error: '#dc3545', info: '#17a2b8' };
            var div = document.createElement('div');
            div.textContent = msg;
            div.style.cssText =
                'position:fixed;top:20px;left:50%;transform:translateX(-50%);' +
                'background:' + (colors[type] || colors.success) + ';color:#fff;' +
                'padding:10px 24px;border-radius:24px;font-size:14px;z-index:99999;' +
                'box-shadow:0 4px 12px rgba(0,0,0,0.15);font-weight:bold;transition:opacity 0.3s';
            document.body.appendChild(div);
            setTimeout(function () {
                div.style.opacity = '0';
                setTimeout(function () { if (div.parentNode) div.parentNode.removeChild(div); }, 300);
            }, 2500);
        }

        console.log('%c[\u76F4\u94FE\u4E0B\u8F7D] \u811A\u672C\u5DF2\u52A0\u8F7D v5.3', 'color:#667eea;font-weight:bold;font-size:14px;');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

---

[查看原文](https://www.52pojie.cn/thread-2124942-1-1.html)
