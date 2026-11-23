---
title: "【油猴脚本】知乎秒变 DeepSeek？一个摸鱼伪装脚本"
published: 2026-11-22
description: "[md]## 脚本介绍 打开知乎，入眼是 DeepSeek 对话界面，点开一条对话，认真阅读——假装在用 AI 干活，气质拿捏得死死的。先说清楚：它不喂数据、不联网调模型，**只是把知乎原有内容换层皮重新排版**，你看到的技术 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "PJlay"
sourceLink: "https://www.52pojie.cn/thread-2139076-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2139076-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

### 脚本介绍

打开知乎，入眼是 DeepSeek 对话界面，点开一条对话，认真阅读——假装在用 AI 干活，气质拿捏得死死的。先说清楚：它不喂数据、不联网调模型，**只是把知乎原有内容换层皮重新排版**，你看到的技术方案是真的，只是外壳"借"了一下。

![](https://static.52pojie.cn/static/image/common/none.gif)

**1.jpg** *(56.74 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg5NzEwMHwxNDc0MGJlYXwxNzk1NDEzNTE0fDB8MjEzOTA3Ng%3D%3D&nothumb=yes)

2026-11-22 11:20 上传

### 它能干什么

- **一键换皮**：`Alt + 1` 启用 DeepSeek 工作台，`Alt + 2` 还原知乎，深藏功与名。

- **会话内联重命名**：左侧的历史会话名双击即可改，改成啥都行，只存在本地，刷新重排都不会乱。

- **内容照常读**：首页推荐流、回答、专栏文章、视频，全部重排成对话气泡样式，图片视频以卡片呈现。

- **原文一键回**：点开原文新标签页，那边干干净净，不套任何伪装。

- **菜单可操作**：油猴菜单里也有「启用 / 还原」入口，键盘党和点菜单党都照顾到了。

![](https://static.52pojie.cn/static/image/common/none.gif)

**2.jpg** *(138.38 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg5NzEwMnxkYjdhODk0ZXwxNzk1NDEzNTE0fDB8MjEzOTA3Ng%3D%3D&nothumb=yes)

2026-11-22 11:22 上传

### 技术原理

实现上没有走歪路，核心就一句话：**读取页面上已经显示出来的内容，在浏览器里重新排版**，全程只读。

- **只读不写**：脚本只读取你当前能看到的内容（标题、正文、回答），不点赞、不关注、不评论、不提交任何表单；你的开关状态、会话名这些设置只存在自己浏览器里，不会上传。

- **换个地方读文章**：知乎专栏的正文只能在专栏页面里看到，所以脚本会悄悄开一个你看不见的后台窗口，先把文章读出来再显示到当前页面。

- **回答同理**：问题页的回答也用类似的后台窗口加载，自动展开全文后读取，最多攒 120 条。

- **自动跟上翻页**：知乎切换页面时脚本会自动识别，把新内容照样重新排版。

一句话总结：**它是浏览器本地的阅读视图皮肤，不是爬虫、不是外挂，不联网、不上传。**

### 安装与使用

- 浏览器装好油猴管理器（Tampermonkey / Violentmonkey 均可）。

- 将 `zhihu-deepseek-skin.user.js` 拖进浏览器安装，或在油猴面板中"导入脚本"选择该文件。

- 打开 `www.zhihu.com`，按 `Alt + 1` 启用，`Alt + 2` 还原。

首次使用如无反应，刷新页面即可。

### 免责声明

**关于技术边界：**

- 本脚本纯前端本地运行，通过油猴脚本改写页面呈现，只读取你当前浏览器已能看到的内容。

- 不修改、不写入任何知乎服务器数据，不调用任何写接口，不收集、不上传你的任何个人信息或浏览数据。

- 所有状态仅保存在本机浏览器中，卸载脚本即完全消失。

**关于使用规范：**

- 本脚本仅供个人学习与技术交流使用，请勿用于任何商业用途或非法场景。

- 使用第三方网站时请遵守其服务条款；因使用本脚本产生的任何账号风险或后果，由使用者自行承担。

- 作者不对脚本造成的任何直接或间接损失负责，[b]最后，如果脚本对你有点用，感谢各位彦祖亦菲们的支持与回复。

[JavaScript] *纯文本查看* *复制代码*

// ==UserScript==
// [url=home.php?mod=space&uid=170990]@name[/url]         知乎工作台 · DeepSeek
// [url=home.php?mod=space&uid=467642]@namespace[/url]    zhihu-work-skin
// [url=home.php?mod=space&uid=1248337]@version[/url]      1.2.1
// @description  把知乎伪装成 DeepSeek 工作台，支持会话内联重命名，按 Alt+1 启用，Alt+2 还原。只读，不写知乎接口。
// [url=home.php?mod=space&uid=686208]@AuThor[/url]       PJlay
// [url=home.php?mod=space&uid=195849]@match[/url]        https://www.zhihu.com/*
// @match        https://zhihu.com/*
// @match        https://zhuanlan.zhihu.com/*
// @run-at       document-start
// [url=home.php?mod=space&uid=609072]@grant[/url]        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
  'use strict';

  const DSQ_BRIDGE = 'dsq-article-frame';

  // 专栏正文只能在 zhuanlan 域名下读：主页面起一个隐藏 iframe，
  // 由 iframe 把文章 HTML 通过 postMessage 回传给父页，避免跨域直接抓取。
  function dsqStartBridge() {
    const parentOrigin = (location.ancestorOrigins && location.ancestorOrigins[0]) ||
      'https://www.zhihu.com';
    const started = Date.now();
    let sent = false;
    const send = (payload) => {
      if (sent) return;
      sent = true;
      try {
        window.parent.postMessage(payload, parentOrigin);
      } catch (err) {
      }
    };
    const tick = () => {
      if (sent) return;
      const body = document.querySelector(
        '.Post-RichText, .RichText.ztext.Post-RichText, article .RichText, .PostIndex-content'
      );
      if (body) {
        const title = document.querySelector('.Post-Title, .PostHeader-title, h1');
        send({
          type: 'dsq-article',
          url: location.href,
          title: title ? title.textContent : document.title,
          detailHtml: body.innerHTML
        });
        return;
      }
      if (Date.now() - started > 20000) {
        send({ type: 'dsq-article', url: location.href, error: 'timeout' });
        return;
      }
      setTimeout(tick, 400);
    };
    setTimeout(tick, 400);
  }

  if (window.top !== window.self) {
    if (window.name === DSQ_BRIDGE && location.hostname === 'zhuanlan.zhihu.com') {
      dsqStartBridge();
    }
    return;
  }
  if (location.hostname === 'zhuanlan.zhihu.com') return;

  const HOST_ID = 'dsq-skin-host';
  const PAGE_STYLE_ID = 'dsq-page-style';
  const HTML_CLASS = 'dsq-skin-active';
  const STORAGE_KEY = 'dsq.skin.v1';
  const NAMES_KEY = 'dsq.names.v1';
  const HINT_KEY = 'dsq.hint.v1';
  const LOADER_ID = 'dsq-answer-loader';
  const FOREIGN_HOST_ID = 'zhq-skin-host';
  const CACHE_TTL = 10 * 60 * 1000;
  const ANSWER_BATCH = 20;
  const ANSWER_MAX = 120;
  const ANSWER_TIMEOUT = 20000;
  const ANSWER_MARK = 48;
  const MODULE_TITLES = /^(等你来答|广告|直播|推广|热榜|热搜|为你推荐|推荐关注|圆桌|专题)$/;

  const PAGE_TITLE = 'DeepSeek - 探索未至之境';
  const TASK_GROUP_TODAY = 3;
  const TASK_LABELS = [
    '线上 502 排查思路',
    'Docker 容器时区不一致',
    'Redis 缓存击穿处理',
    'MySQL 慢查询索引建议',
    'Python 协程和线程区别',
    'Git rebase 冲突处理',
    'K8s Pod 重启原因',
    '单元测试 mock 写法',
    '日志轮转配置',
    '接口幂等设计方案',
    '发布回滚检查清单',
    'Nginx 转发丢 Header',
    'SSE 连接频繁断开',
    'Celery 任务重复执行',
    'Postgres 连接池耗尽',
    '前端构建缓存失效',
    '对象存储签名过期',
    '定时任务时区偏移',
    '网关限流误伤回调',
    '灰度流量串号排查',
    '监控告警风暴收敛',
    '数据库主从延迟',
    '回滚后数据不一致',
    '发布窗口冲突处理',
    'Elasticsearch 集群脑裂',
    'Kafka 消费积压排查',
    '分布式锁失效排查',
    '缓存与数据库一致性',
    '接口超时重试策略',
    '服务雪崩防护设计',
    '链路追踪采样配置',
    '前端资源加载失败',
    'WebSocket 断线重连',
    '跨域请求预检失败',
    '数据库死锁排查',
    '大事务拆分方案',
    '分库分表迁移方案',
    '消息重复消费处理',
    'TLS 证书更新流程',
    '蓝绿发布切换方案',
    '配置中心热更新',
    '日志采集链路排查',
    '应用内存泄漏定位',
    'CPU 飙高排查步骤',
    '磁盘 IO 瓶颈分析',
    '全链路压测方案',
    '熔断降级阈值设计',
    '多活架构数据同步',
    '告警降噪规则设计',
    '容器健康检查配置'
  ];
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function txt(el) {
    return el ? (el.textContent || '').replace(/\s+/g, ' ').trim() : '';
  }

  function attr(el, name) {
    return el ? (el.getAttribute(name) || '') : '';
  }

  function metaContent(root, sel) {
    const el = root.querySelector(sel);
    return el ? (el.getAttribute('content') || '') : '';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (ch) => ({
      '&': '&',
      '': '>',
      '"': '"',
      "'": '''
    }[ch]));
  }

  function pickOne(root, selectors) {
    for (const sel of selectors) {
      try {
        const found = root.querySelector(sel);
        if (found) return found;
      } catch (err) {
      }
    }
    return null;
  }

  function pickAll(root, selectors) {
    const out = [];
    const seen = new Set();
    for (const sel of selectors) {
      try {
        root.querySelectorAll(sel).forEach((el) => {
          if (!seen.has(el)) {
            seen.add(el);
            out.push(el);
          }
        });
      } catch (err) {
      }
    }
    return out;
  }

  function dropNested(nodes) {
    const set = new Set(nodes);
    return nodes.filter((node) => {
      let parent = node.parentElement;
      while (parent) {
        if (set.has(parent)) return false;
        parent = parent.parentElement;
      }
      return true;
    });
  }

  function absUrl(href, base) {
    if (!href) return '';
    try {
      const url = new URL(href, base || location.href);
      if (url.protocol === 'http:' || url.protocol === 'https:') return url.href;
    } catch (err) {
    }
    return '';
  }

  function firstText(root, selectors) {
    for (const sel of selectors) {
      let el = null;
      try {
        el = root.querySelector(sel);
      } catch (err) {
      }
      const value = txt(el);
      if (value) return value;
    }
    return '';
  }

  function debounce(fn, wait) {
    let timer = 0;
    return function debounced() {
      clearTimeout(timer);
      timer = setTimeout(fn, wait);
    };
  }

  function scrollRoot() {
    const page = document.scrollingElement || document.documentElement;
    if (page && page.scrollHeight - page.clientHeight > 80) return page;
    const candidates = ['.Topstory-mainColumn', '#TopstoryContent', '.TopstoryContent'];
    for (let i = 0; i  80) return el;
    }
    return page;
  }

  function storeGet(key, fallback) {
    try {
      if (typeof GM_getValue === 'function') return GM_getValue(key, fallback);
      const raw = localStorage.getItem(key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch (err) {
      return fallback;
    }
  }

  function storeSet(key, value) {
    try {
      if (typeof GM_setValue === 'function') GM_setValue(key, value);
      else localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
    }
  }

  const ICONS = {
    docs: '',
    file: '',
    video: '',
    search: '',
    more: '',
    image: '',
    copy: '',
    globe: '',
    think: '',
    paperclip: '',
    panel: '',
    plusCircle: '',
    share: '',
    arrowUp: '',
    refresh: '',
    thumbUp: '',
    thumbDown: '',
    speaker: '',
    sort: '',
    user: ''
  };

  function icon(name, size, cls) {
    const body = ICONS[name];
    if (!body) return '';
    const s = size || 16;
    return '' +
      body + '';
  }

  function svgData(svg) {
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
  }

  const DS_WHALE_SVG = '';
  const DS_LOGO_SVG = '                  ';
  const FAVICONS = { deepseek: svgData(DS_WHALE_SVG) };

  const Title = {
    applied: false,
    snapshot: null,

    apply(skinId) {
      if (!this.applied) {
        this.snapshot = {
          title: document.title,
          icons: $$('link[rel~="icon"]').map((link) => ({
            el: link,
            href: link.getAttribute('href')
          }))
        };
        this.applied = true;
      }
      let link = $('#dsq-favicon');
      if (!link) {
        link = document.createElement('link');
        link.id = 'dsq-favicon';
        link.rel = 'icon';
        link.type = 'image/svg+xml';
        (document.head || document.documentElement).appendChild(link);
      }
      link.href = FAVICONS[skinId] || FAVICONS.deepseek;
    },

    setTitle(value) {
      if (this.applied && value) document.title = value;
    },

    restore() {
      if (!this.applied) return;
      this.applied = false;
      if (this.snapshot) {
        if (this.snapshot.title) document.title = this.snapshot.title;
        this.snapshot.icons.forEach((item) => {
          if (item.el && item.el.isConnected && item.href != null) {
            item.el.setAttribute('href', item.href);
          }
        });
      }
      const link = $('#dsq-favicon');
      if (link) link.remove();
      this.snapshot = null;
    }
  };

  const RICH_TAGS = new Set([
    'P', 'BR', 'B', 'STRONG', 'I', 'EM', 'U', 'S', 'DEL', 'INS', 'MARK',
    'BLOCKQUOTE', 'UL', 'OL', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
    'PRE', 'CODE', 'FIGURE', 'FIGCAPTION', 'A', 'SPAN', 'DIV',
    'TABLE', 'THEAD', 'TBODY', 'TFOOT', 'TR', 'TH', 'TD', 'HR',
    'SUP', 'SUB', 'DL', 'DT', 'DD'
  ]);

  const DROP_TAGS = new Set([
    'SCRIPT', 'STYLE', 'IFRAME', 'VIDEO', 'AUDIO', 'SOURCE', 'TRACK',
    'LINK', 'META', 'NOSCRIPT', 'OBJECT', 'EMBED', 'FORM', 'INPUT',
    'TEXTAREA', 'SELECT', 'BUTTON', 'SVG', 'CANVAS', 'TEMPLATE'
  ]);

  function mediaChip(kind, seq, url) {
    const name = (kind === 'image' ? 'image-' : 'video-') + String(seq).padStart(2, '0') +
      (kind === 'image' ? '.png' : '.mp4');
    const el = document.createElement(url ? 'a' : 'span');
    el.className = 'zhq-media';
    if (url) {
      el.setAttribute('href', url);
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
      el.setAttribute('title', '打开附件');
    }
    el.innerHTML = icon(kind === 'image' ? 'image' : 'video', 13) +
      '' + escapeHtml(name) + '';
    return el;
  }

  function mediaUrl(node, baseUrl) {
    const src = attr(node, 'data-original') || attr(node, 'data-actualsrc') ||
      attr(node, 'data-src') || attr(node, 'src') || attr(node, 'poster');
    if (src) return absUrl(src, baseUrl);
    const source = pickOne(node, ['source[src]']);
    return source ? absUrl(attr(source, 'src'), baseUrl) : '';
  }

  function sanitizeRich(html, baseUrl) {
    const out = document.createDocumentFragment();
    if (!html) return out;
    const template = document.createElement('template');
    template.innerHTML = String(html);
    let mediaSeq = 0;

    const clean = (node) => {
      const fragment = document.createDocumentFragment();
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          fragment.appendChild(document.createTextNode(child.data));
          return;
        }
        if (child.nodeType !== Node.ELEMENT_NODE) return;

        const tag = child.tagName;

        if (tag === 'IMG') {
          fragment.appendChild(mediaChip('image', ++mediaSeq, mediaUrl(child, baseUrl)));
          return;
        }
        if (tag === 'VIDEO' || tag === 'IFRAME' || tag === 'AUDIO') {
          fragment.appendChild(mediaChip('video', ++mediaSeq, mediaUrl(child, baseUrl)));
          return;
        }
        if (DROP_TAGS.has(tag)) return;

        const children = clean(child);
        if (!RICH_TAGS.has(tag)) {
          fragment.appendChild(children);
          return;
        }

        const el = document.createElement(tag);
        if (tag === 'A') {
          const href = absUrl(attr(child, 'href'), baseUrl);
          if (href) {
            el.setAttribute('href', href);
            el.setAttribute('target', '_blank');
            el.setAttribute('rel', 'noopener noreferrer');
          }
          const title = attr(child, 'title');
          if (title) el.setAttribute('title', title);
        }
        el.appendChild(children);
        fragment.appendChild(el);
      });
      return fragment;
    };

    out.appendChild(clean(template.content));
    return out;
  }

  function htmlToPlain(html, baseUrl) {
    const fragment = sanitizeRich(html, baseUrl);
    const box = document.createElement('div');
    box.appendChild(fragment);
    return (box.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function detectPage() {
    const path = location.pathname;
    if (/^\/p\/\d+/.test(path)) return 'article';
    if (/^\/question\/\d+/.test(path) || /^\/question\/\d+\/answer\/\d+/.test(path)) return 'question';
    if (path === '/' || path === '/home') return 'home';
    return 'other';
  }

  function contentKindOf(url) {
    const value = String(url || '');
    if (/\/question\/\d+/.test(value) || /\/answer\/\d+/.test(value)) return 'question';
    if (/\/p\/\d+/.test(value)) return 'article';
    if (/\/zvideo\//.test(value)) return 'video';
    return '';
  }

  function canonicalContentUrl(url) {
    const match = String(url || '').match(/\/(question|p)\/(\d+)/);
    if (!match) return '';
    if (match[1] === 'p') {
      // 专栏文章只在 zhuanlan 域名下可读，www.zhihu.com/p/ 会返回 404 页
      const zhihu = /(^|\.)zhihu\.com$/i.test(location.hostname);
      return (zhihu ? 'https://zhuanlan.zhihu.com' : location.origin) + '/p/' + match[2];
    }
    return location.origin + '/question/' + match[2];
  }

  function canonicalQuestionUrl(url) {
    const match = String(url || '').match(/\/question\/(\d+)/);
    return match ? location.origin + '/question/' + match[1] : '';
  }

  function collectFeedNodes(root) {
    return dropNested(pickAll(root, [
      '#TopstoryContent .TopstoryItem',
      '#TopstoryContent [data-za-detail-view-path-module="FeedItem"]',
      '.Topstory-mainColumn .TopstoryItem',
      '.TopstoryContent .Card',
      '[data-za-detail-view-path-module="FeedItem"]',
      '.Feed-item'
    ]).filter((node) => !node.closest('#' + HOST_ID)));
  }

  function findTitleLink(node) {
    return pickOne(node, [
      'h2.ContentItem-title a',
      '.ContentItem-title a',
      'h1.ContentItem-title a',
      'a[data-za-detail-view-path-module="Title"]',
      'h2 a[href*="/question/"]',
      'a[href*="/question/"]',
      'a[href*="/answer/"]',
      'a[href*="/zvideo/"]',
      'a[href*="/p/"]'
    ]);
  }

  function extractFeed(root) {
    const scope = root || document;
    const nodes = collectFeedNodes(scope);
    const items = [];
    const seen = new Set();

    const pushItem = (node, link) => {
      if (items.length >= 60) return;
      const url = absUrl(attr(link, 'href'));
      if (!url || seen.has(url)) return;
      const kind = contentKindOf(url);
      if (kind !== 'question' && kind !== 'article') return;
      if (!canonicalContentUrl(url)) return;
      if (node.querySelector('.Advert, [data-ad], [data-za-detail-view-path-module="AdItem"]')) return;

      const title = (txt(link) ||
        firstText(node, ['h2.ContentItem-title', '.ContentItem-title']) || '').trim();
      if (!title || title.length  {
      const link = findTitleLink(node);
      if (link) pushItem(node, link);
    });

    if (!items.length) {
      const anchors = pickAll(scope, [
        '#root a[href*="/question/"]',
        'main a[href*="/question/"]',
        'a[href*="/question/"]'
      ]).slice(0, 80);
      anchors.forEach((link) => {
        if (items.length >= 40) return;
        let box = link.closest('div, article, section');
        for (let depth = 0; box && depth  30 && box.querySelector('img, .RichText, .RichContent-inner')) break;
          box = box.parentElement;
        }
        if (box) pushItem(box, link);
      });
    }

    return items;
  }

  function extractQuestion(root, url) {
    const scope = root || document;
    const baseUrl = url || location.href;

    const title = firstText(scope, [
      'h1.QuestionHeader-title',
      '.QuestionHeader-title',
      '.QuestionPage h1',
      '.QuestionHeader h1'
    ]) || metaContent(scope, 'meta[itemprop="name"]');

    const detailEl = pickOne(scope, [
      '.QuestionRichText',
      '.QuestionHeader-detail .RichText',
      '.QuestionHeader-detail',
      'meta[itemprop="text"]'
    ]);
    let detailHtml = '';
    if (detailEl) {
      detailHtml = detailEl.tagName === 'META'
        ? attr(detailEl, 'content')
        : detailEl.innerHTML;
    }

    let answerNodes = dropNested(pickAll(scope, [
      '.AnswerItem',
      '[data-za-detail-view-path-module="AnswerItem"]',
      '.Answers .List-item',
      '.List-item.AnswerItem'
    ]));

    if (!answerNodes.length) {
      const boxes = new Set();
      pickAll(scope, ['.RichContent-inner', '.AnswerItem .RichText', '[itemprop="text"]'])
        .forEach((rich) => {
          if (rich.closest('.QuestionHeader, .QuestionRichText, .QuestionHeader-detail')) return;
          const box = rich.closest('.AnswerItem, .List-item, article') || rich.parentElement;
          if (box) boxes.add(box);
        });
      answerNodes = Array.from(boxes);
    }

    const answers = [];
    const seenText = new Set();
    answerNodes.some((node) => {
      if (answers.length >= ANSWER_MAX) return true;
      const rich = pickOne(node, ['.RichContent-inner', '.RichText', '[itemprop="text"]']);
      if (!rich) return false;
      const html = rich.innerHTML;
      const text = htmlToPlain(html, baseUrl);
      if (!text) return false;
      const marker = text.slice(0, 48);
      if (seenText.has(marker)) return false;
      seenText.add(marker);
      const linkEl = pickOne(node, ['a[href*="/answer/"]']);
      answers.push({
        html: html,
        text: text,
        votes: firstText(node, ['.VoteButton--up', '[class*="VoteButton"]']),
        url: absUrl(attr(linkEl, 'href'), baseUrl) || baseUrl
      });
      return false;
    });

    if (!title && !answers.length) return null;

    return {
      kind: 'question',
      title: title || '未命名问题',
      detailHtml: detailHtml,
      url: canonicalQuestionUrl(baseUrl) || baseUrl,
      answers: answers
    };
  }

  function questionFromItem(item) {
    return {
      kind: item.contentKind || '',
      title: item.title,
      detailHtml: item.excerptHtml || '',
      url: item.contentUrl || item.url || '',
      answers: []
    };
  }

  function extractArticle(root, url) {
    const scope = root || document;
    const baseUrl = url || location.href;
    const title = firstText(scope, [
      '.Post-Title',
      'h1.Post-Title',
      '.ArticleItem .Post-Title',
      '.PostHeader-title'
    ]) || metaContent(scope, 'meta[property="og:title"]') ||
      metaContent(scope, 'meta[name="title"]');

    const body = pickOne(scope, [
      '.Post-RichText',
      '.RichText.ztext.Post-RichText',
      '.ArticleItem .RichText',
      'article .RichText',
      '.PostIndex-content',
      'article'
    ]);

    if (!title && !body) return null;

    return {
      kind: 'article',
      title: title || '未命名文档',
      detailHtml: body ? body.innerHTML : '',
      url: canonicalContentUrl(baseUrl) || baseUrl,
      answers: []
    };
  }

  function loadArticleFrame(url) {
    if (!/(^|\.)zhihu\.com$/i.test(location.hostname)) {
      return Promise.reject(new Error('bridge unavailable'));
    }
    return new Promise((resolve, reject) => {
      const frame = document.createElement('iframe');
      frame.name = DSQ_BRIDGE;
      frame.setAttribute('aria-hidden', 'true');
      frame.setAttribute('tabindex', '-1');
      frame.style.cssText =
        'position:fixed;left:-16000px;top:0;width:1280px;height:2000px;border:0;opacity:0;pointer-events:none;';
      let settled = false;
      let timer = null;
      const finish = (err, data) => {
        if (settled) return;
        settled = true;
        window.removeEventListener('message', onMessage);
        clearTimeout(timer);
        try {
          frame.remove();
        } catch (err2) {
        }
        if (err) reject(err);
        else resolve(data);
      };
      const onMessage = (event) => {
        if (event.source !== frame.contentWindow) return;
        if (!/^https:\/\/([a-z0-9-]+\.)?zhihu\.com$/.test(event.origin)) return;
        const payload = event.data;
        if (!payload || payload.type !== 'dsq-article') return;
        if (payload.error) {
          finish(new Error(payload.error));
          return;
        }
        const detailHtml = String(payload.detailHtml || '');
        if (!detailHtml) {
          finish(new Error('文章未识别'));
          return;
        }
        finish(null, {
          kind: 'article',
          title: String(payload.title || '').trim() || '未命名文档',
          detailHtml: detailHtml,
          url: canonicalContentUrl(payload.url) || url,
          answers: []
        });
      };
      timer = setTimeout(() => finish(new Error('文章加载超时')), 25000);
      window.addEventListener('message', onMessage);
      frame.src = url;
      (document.body || document.documentElement).appendChild(frame);
    });
  }

  const contentCache = new Map();

  function fetchContent(url) {
    const target = canonicalContentUrl(url);
    const kind = contentKindOf(url);
    if (!target || (kind !== 'question' && kind !== 'article')) {
      return Promise.reject(new Error('不支持的内容链接'));
    }

    const key = kind + ':' + target;
    const cached = contentCache.get(key);
    if (cached && cached.data && Date.now() - cached.t  {
      if (kind === 'article') {
        try {
          const bridged = await loadArticleFrame(target);
          contentCache.set(key, { t: Date.now(), data: bridged });
          return bridged;
        } catch (err) {
        }
      }
      const response = await fetch(target, {
        credentials: 'include',
        headers: { Accept: 'text/html,application/xhtml+xml' }
      });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const html = await response.text();
      const parsed = new DOMParser().parseFromString(html, 'text/html');
      const data = kind === 'article'
        ? extractArticle(parsed, target)
        : extractQuestion(parsed, target);
      if (!data) throw new Error('页面结构未识别');
      contentCache.set(key, { t: Date.now(), data: data });
      return data;
    })().catch((err) => {
      contentCache.delete(key);
      console.warn('[DeepSeek skin] content sync failed:', target, err);
      throw err;
    });

    contentCache.set(key, { promise: promise });
    return promise;
  }

  function fetchContentFresh(url) {
    const target = canonicalContentUrl(url);
    const kind = contentKindOf(url);
    if (target) contentCache.delete(kind + ':' + target);
    return fetchContent(url);
  }

  const answerLoader = (() => {
    let frame = null;
    let frameKey = '';
    let ready = null;

    function frameDoc() {
      try {
        return frame && frame.contentDocument ? frame.contentDocument : null;
      } catch (err) {
        return null;
      }
    }

    function wait(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function countAnswers(doc) {
      if (!doc) return 0;
      return dropNested(pickAll(doc, [
        '.AnswerItem',
        '[data-za-detail-view-path-module="AnswerItem"]',
        '.Answers .List-item',
        '.List-item.AnswerItem'
      ])).length;
    }

    function expandBodies(doc) {
      if (!doc) return;
      const re = /^(展开阅读全文|阅读全文|展开)$/;
      $$('button, [role="button"], a', doc).forEach((el) => {
        if (el.disabled) return;
        if (!re.test(txt(el))) return;
        try {
          el.click();
        } catch (err) {
        }
      });
    }

    function scrollToEnd() {
      if (!frame) return;
      try {
        const doc = frameDoc();
        const win = frame.contentWindow;
        if (!doc || !win) return;
        win.scrollTo(0, doc.documentElement.scrollHeight || doc.body.scrollHeight || 0);
      } catch (err) {
      }
    }

    function destroy() {
      if (frame) {
        try {
          frame.remove();
        } catch (err) {
        }
      }
      frame = null;
      frameKey = '';
      ready = null;
    }

    function open(url) {
      const key = canonicalQuestionUrl(url) || url;
      if (frame && frameKey === key && ready) return ready;
      destroy();
      frameKey = key;
      const el = document.createElement('iframe');
      el.id = LOADER_ID;
      el.setAttribute('aria-hidden', 'true');
      el.setAttribute('tabindex', '-1');
      el.style.cssText =
        'position:fixed;left:-16000px;top:0;width:1280px;height:2000px;border:0;opacity:0;pointer-events:none;';
      el.src = key;
      (document.body || document.documentElement).appendChild(el);
      // 屏幕外 iframe 复用登录态加载问题页，自动展开回答后从 DOM 抽取，全程不调用写接口。
      frame = el;
      ready = new Promise((resolve, reject) => {
        const started = Date.now();
        const tick = () => {
          if (frame !== el) {
            reject(new Error('loader reset'));
            return;
          }
          const doc = frameDoc();
          if (doc && countAnswers(doc) > 0) {
            resolve(doc);
            return;
          }
          if (Date.now() - started > ANSWER_TIMEOUT) {
            destroy();
            reject(new Error('加载超时'));
            return;
          }
          setTimeout(tick, 400);
        };
        setTimeout(tick, 600);
      });
      return ready;
    }

    async function load(url, target) {
      const doc = await open(url);
      const want = Math.min(ANSWER_MAX, Math.max(ANSWER_BATCH, target || ANSWER_BATCH));
      let previous = countAnswers(doc);
      for (let round = 0; round = want) break;
        const more = findMoreControl(doc);
        if (!more) {
          let grown = countAnswers(doc);
          for (let idle = 0; idle  {
      const marker = String((answer && answer.text) || '').slice(0, ANSWER_MARK);
      if (!marker) return;
      const at = seen.get(marker);
      if (at === undefined) {
        seen.set(marker, answers.length);
        answers.push(answer);
        return;
      }
      if (String(answer.text || '').length > String(answers[at].text || '').length) {
        answers[at] = answer;
      }
    };
    ((base && base.answers) || []).forEach(push);
    ((full && full.answers) || []).forEach(push);
    return {
      kind: 'question',
      title: (full && full.title) || (base && base.title) || '未命名问题',
      detailHtml: (full && full.detailHtml) || (base && base.detailHtml) || '',
      url: (full && full.url) || (base && base.url) || '',
      answers: answers,
      fullMore: full ? Boolean(full.fullMore) : Boolean(base && base.fullMore)
    };
  }

  function rememberQuestion(question) {
    const target = canonicalContentUrl(question && question.url);
    const kind = contentKindOf(question && question.url);
    if (!target || (kind !== 'question' && kind !== 'article')) return;
    contentCache.set(kind + ':' + target, { t: Date.now(), data: question });
  }

  function nextTarget(question, currentTarget) {
    const loaded = (question && question.answers ? question.answers.length : 0);
    if (!currentTarget) {
      return Math.min(ANSWER_MAX, loaded >= ANSWER_BATCH ? loaded + ANSWER_BATCH : ANSWER_BATCH);
    }
    return Math.min(ANSWER_MAX, currentTarget + ANSWER_BATCH);
  }

  function shouldAutoLoad(question, kind) {
    if (!question || kind !== 'question' || !question.url) return false;
    if (question.fullMore === false) return false;
    return (question.answers || []).length  {
          if (typeof saved.defaults[key] === 'string') {
            const clean = saved.defaults[key].replace(/ · \d+$/, '');
            if (clean !== saved.defaults[key]) migrated = true;
            nameStore.defaults[key] = clean;
          }
        });
      }
      if (saved.custom && typeof saved.custom === 'object') {
        Object.keys(saved.custom).forEach((key) => {
          if (typeof saved.custom[key] === 'string') nameStore.custom[key] = saved.custom[key];
        });
      }
    }
    if (migrated) saveNames();
    return nameStore;
  }

  function saveNames() {
    storeSet(NAMES_KEY, namesState());
  }

  function nameKeyForUrl(url) {
    return canonicalContentUrl(url) || String(url || '');
  }

  function nameKeyForTask(task) {
    if (!task) return '';
    if (task.kind === 'live') return nameKeyForUrl(task.question && task.question.url);
    if (task.item) return nameKeyForUrl(task.item.contentUrl || task.item.url);
    return '';
  }

  function defaultNameFor(key) {
    if (!key) return TASK_LABELS[0];
    const store = namesState();
    if (store.defaults[key]) return store.defaults[key];
    const ids = Object.keys(store.defaults);
    const used = new Set(ids.map((id) => store.defaults[id]));
    const label = TASK_LABELS.find((item) => !used.has(item)) ||
      TASK_LABELS[ids.length % TASK_LABELS.length];
    store.defaults[key] = label;
    saveNames();
    return label;
  }

  function displayNameFor(key) {
    const store = namesState();
    return store.custom[key] || defaultNameFor(key);
  }

  function setCustomName(key, value) {
    if (!key) return false;
    const name = String(value || '').replace(/\s+/g, ' ').trim().slice(0, 40);
    if (!name) return false;
    const store = namesState();
    if (name === defaultNameFor(key)) delete store.custom[key];
    else store.custom[key] = name;
    saveNames();
    return true;
  }

  function clearCustomName(key) {
    if (!key) return;
    const store = namesState();
    if (!store.custom[key]) return;
    delete store.custom[key];
    saveNames();
  }

  function hasCustomName(key) {
    return Boolean(key && namesState().custom[key]);
  }

---

[查看原文](https://www.52pojie.cn/thread-2139076-1-1.html)
