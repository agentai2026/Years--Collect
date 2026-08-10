---
title: "[暴力猴脚本]恢复B站全屏滚轮音量(AI生成)"
published: 2026-08-09
description: "原因：差不多两周前，VideoSpeedController这个视频倍速插件启用的情况下，B站网页端全屏滚轮无法调节音量了，禁用插件后正常，所以借助ChatGPT写了个脚本。 过程：本人无基础，只会改一些bat/ps1，和ChatGPT互相引导，最初是模拟方向键，但最小分度只能10%，原生功 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "7s3b"
sourceLink: "https://www.52pojie.cn/thread-2122136-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2122136-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

原因：差不多两周前，VideoSpeedController这个视频倍速插件启用的情况下，B站网页端全屏滚轮无法调节音量了，禁用插件后正常，所以借助ChatGPT写了个脚本。

过程：本人无基础，只会改一些bat/ps1，和ChatGPT互相引导，最初是模拟方向键，但最小分度只能10%，原生功能大概2.5%，后来通过浏览器F12抓了Player.SetVolume()这个API，基本大功告成，但只能调节，音量提示的OSD搞不定，ChatGPT执着于逆向，我被他带了1小时，最后提出自己画一个，秒成功，最终差不多耗时2小时，弯路多得有点离谱但还好成了。

代码：`// ==UserScript==// @name         Bilibili 全屏滚轮音量控制// @namespace    http://tampermonkey.net/// @version      1.0// @description  B站全屏滚轮精细音量控制// @match        https://www.bilibili.com/*// @run-at       document-start// @grant        none// ==/UserScript==(function () {'use strict';let currentVolume = null;let osdTimer = null;function isBiliFullscreen(){    return (        document.fullscreenElement &&        document.fullscreenElement.classList.contains(            'bpx-player-container'        )    );}function showVolumeOSD(v){    const parent =        document.fullscreenElement ||        document.querySelector('.bpx-player-container');    if(!parent){        return;    }    let osd=document.getElementById(        'custom-volume-osd'    );    if(!osd){        osd=document.createElement('div');        osd.id='custom-volume-osd';        Object.assign(osd.style,{            position:'absolute',            left:'50%',            top:'50%',            transform:'translate(-50%,-50%)',            zIndex:'999999999',            padding:'12px 26px',            borderRadius:'12px',            background:'rgba(255,255,255,0.92)',            color:'#111',            boxShadow:'0 2px 10px rgba(0,0,0,0.15)',            fontSize:'28px',            fontWeight:'400',            pointerEvents:'none',            opacity:'0',            transition:'opacity .2s'        });        parent.appendChild(osd);    }    // 如果全屏元素变化，重新挂载    if(osd.parentElement !== parent){        parent.appendChild(osd);    }    if(v{        osd.style.opacity='0';    },1000);}function changeVolume(dir){    const player=window.player;    if(!player){        return;    }    if(currentVolume===null){        currentVolume=player.getVolume();    }    currentVolume += dir*0.025;    currentVolume=Math.max(        0,        Math.min(1,currentVolume)    );    player.setVolume(currentVolume);    showVolumeOSD(currentVolume);}document.addEventListener('wheel',function(e){    if(!isBiliFullscreen()){        return;    }    if(Math.abs(e.deltaY)
备注：只测试暴力猴，篡改猴未测，字体由于不喜欢粗体改得比较细，同时把喇叭图标去掉了，因为ChatGPT用的是emoji太粗了，各位有需要可以自己改回去，或者改成音符字符。

PS：应该是倍速播放动了B站利益，暗地里制造冲突了，出问题的时候B站反馈区只看到有人吐槽3倍速没了，没人说全屏音量的问题，而我这个VideoSpeedController最高可以16倍速跳广告。

---

[查看原文](https://www.52pojie.cn/thread-2122136-1-1.html)
