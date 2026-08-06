/* 采集站信号台 —— 纯静态，无后端，数据来自 data.json */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

function statOf(a) {
  const h = a.history, last = h[h.length - 1];
  const up = h.filter(x => x.ok).length / h.length;
  const ms = h.filter(x => x.ok && x.ms).map(x => x.ms);
  const avg = ms.length ? Math.round(ms.reduce((p, c) => p + c, 0) / ms.length) : null;
  let st = 'ok', label = '在线';
  if (!last.ok) { st = 'fail'; label = '离线'; }
  else if (up < 0.9) { st = 'warn'; label = '波动'; }
  return { st, label, up, avg, lastMs: last.ok ? last.ms : null };
}
function stBadge(s) { return `<span class="st ${s.st}"><i></i>${s.label}</span>`; }
function copyText(t, btn) {
  navigator.clipboard.writeText(t).then(() => {
    const old = btn.textContent; btn.textContent = '已复制 ✓'; btn.classList.add('done');
    setTimeout(() => { btn.textContent = old; btn.classList.remove('done'); }, 1500);
  });
}
function spark(h) {
  return `<div class="spark" title="近30日可用率 ${(h.filter(x=>x.ok).length/30*100).toFixed(1)}%">` + h.map(x => {
    if (!x.ok) return `<i class="fail" style="height:100%"></i>`;
    const pct = Math.max(12, Math.min(100, 100 - (x.ms - 150) / 18));
    return `<i class="${x.ms > 1200 ? 'warn' : ''}" style="height:${pct}%"></i>`;
  }).join('') + `</div>`;
}
const issueNo = d => { const s = new Date('2026-01-01'); return Math.floor((new Date(d) - s) / 864e5) + 1; };

async function boot() {
  const res = await fetch('data.json'); const DATA = await res.json();
  const withStat = DATA.apis.map(a => ({ ...a, s: statOf(a) }));

  /* 报头 */
  $('#hdr').innerHTML = `
    <div class="container mast-top">
      <span class="live"><i></i>LIVE</span>
      <span>SIGNAL DESK · 第 ${issueNo(DATA.updated)} 期</span>
      <span style="margin-left:auto">巡检日期 ${DATA.updated} · 数据：data.json</span>
    </div>
    <div class="container mast-brand">
      <div>
        <a class="brand-name" href="index.html">${DATA.brand}</a>
        <div class="brand-sub">CaiJiZhan Signal Desk — 每日巡检 · 公开透明 · 网友共建</div>
      </div>
      <nav class="main-nav">
        <a href="index.html" data-p="index">首页</a>
        <a href="category.html" data-p="category">分类</a>
        <a href="download.html" data-p="download">一键配置</a>
        <a href="guide.html" data-p="guide">对接教程</a>
        <a href="submit.html" data-p="submit">投稿</a>
      </nav>
    </div>`;
  const cur = document.body.dataset.page;
  $$('nav.main-nav a').forEach(a => a.classList.toggle('on', a.dataset.p === cur));

  /* 走马灯 */
  const items = withStat.map(a => {
    const cls = a.s.st === 'ok' ? 'ok' : a.s.st === 'fail' ? 'bad' : 'warn';
    return `<span>${a.name} <b class="${cls}">${a.s.label}${a.s.lastMs ? ' ' + a.s.lastMs + 'ms' : ''}</b></span>`;
  }).join('');
  $('#tick').innerHTML = `<div class="ticker-label">SIGNAL</div><div style="overflow:hidden;flex:1;display:flex;align-items:center"><div class="ticker-track">${items}${items}</div></div>`;

  $('#ftr').innerHTML = `
  <div class="container foot-grid">
    <div class="foot-brand">
      <a class="foot-name serif" href="index.html">${DATA.brand}</a>
      <p>每日巡检网友投稿的采集接口，如实刊出谁在岗、谁告病、谁失联。本站无后端，数据全部存于 <code>data.json</code>。</p>
      <p class="foot-fine">接口均来自网友投稿，请自行甄别合规性与授权范围。</p>
    </div>
    <div class="foot-col">
      <h5>站内导航</h5>
      <a href="index.html">信号目录</a>
      <a href="category.html">内容分类</a>
      <a href="download.html">一键配置下载</a>
      <a href="guide.html">对接教程</a>
      <a href="submit.html">投稿接口</a>
    </div>
    <div class="foot-col">
      <h5>联系与共建</h5>
      <a href="${DATA.repo}/issues/new?template=submit.md" target="_blank" rel="noopener">投稿新接口 → Issue</a>
      <a href="${DATA.repo}/issues/new?template=bug.md" target="_blank" rel="noopener">接口失效报障</a>
      <a href="${DATA.repo}" target="_blank" rel="noopener">GitHub 仓库</a>
      <a href="mailto:desk@signal.example">desk@signal.example</a>
    </div>
    <div class="foot-col">
      <h5>本刊信息</h5>
      <span class="mono">第 ${issueNo(DATA.updated)} 期</span>
      <span class="mono">巡检日期 ${DATA.updated}</span>
      <span class="mono">收录 ${DATA.apis.length} 个接口</span>
      <span class="mono">每 2 小时巡检</span>
    </div>
  </div>
  <div class="container foot-base">
    <span>© ${new Date().getFullYear()} ${DATA.brand} · CAIJIZHAN SIGNAL DESK</span>
    <span>检测结果仅代表最后探测时刻 · 使用前请确认服务条款</span>
  </div>`;

  if (cur === 'index') pageIndex(DATA, withStat);
  if (cur === 'detail') pageDetail(DATA);
  if (cur === 'category') pageCategory(DATA, withStat);
  if (cur === 'download') pageDownload(DATA, withStat);
}

/* ---------------- 首页 ---------------- */
function pageIndex(DATA, apis) {
  const iss = $('#heroIssue'); if (iss) iss.textContent = issueNo(DATA.updated);
  const visible = apis.filter(a => !a.restricted);
  const online = apis.filter(a => a.s.st === 'ok').length;
  const warn = apis.filter(a => a.s.st === 'warn').length;
  const fail = apis.filter(a => a.s.st === 'fail').length;
  const msAll = visible.filter(a => a.s.avg).map(a => a.s.avg);
  const avgAll = msAll.length ? Math.round(msAll.reduce((p, c) => p + c, 0) / msAll.length) : 0;
  const hidden = apis.filter(a => a.restricted).length;

  /* 今日信号卡 */
  $('#scDate').textContent = DATA.updated;
  countUp($('#scPct'), Math.round(online / apis.length * 100), '%', 1200);
  countUp($('#scTotal'), apis.length);
  countUp($('#scOnline'), online);
  countUp($('#scWarn'), warn);
  countUp($('#scFail'), fail);
  countUp($('#scAvg'), avgAll);
  $('#scAvg').insertAdjacentHTML('beforeend', '<small style="font-size:.4em;color:#9a947f;font-weight:400"> ms</small>');
  countUp($('#scHidden'), hidden);
  $('#scHidden').insertAdjacentHTML('beforeend', '<small style="font-size:.4em;color:#9a947f;font-weight:400"> 个</small>');
  drawWave($('#wave'), apis);

  /* 筛选下拉选项 */
  const cmsSet = [...new Set(apis.map(a => DATA.cms.find(c => c.code === a.cms)?.type || a.cms))];
  $('#fCms').innerHTML = '<option value="all">全部格式</option>' + cmsSet.map(c => `<option>${c}</option>`).join('');
  const catSet = [...new Set(apis.filter(a => !a.restricted).flatMap(a => a.tags || []))].sort();
  $('#fCat').innerHTML = '<option value="all">全部分类</option>' + catSet.map(c => `<option>${c}</option>`).join('');

  const top = visible.filter(a => a.s.avg && a.s.st !== 'fail')
    .sort((a, b) => a.s.avg - b.s.avg).slice(0, 10);
  $('#top10').innerHTML = top.map((a, i) => `
    <li><span class="no">${i + 1}</span>
      <span class="nm"><a href="detail.html?id=${a.id}">${a.name}</a></span>
      <span class="ms">${a.s.avg}ms</span></li>`).join('');

  let q = '', f = 'all', fCms = 'all', fCat = 'all', showRes = false;
  const rows = () => {
    let list = apis.filter(a => showRes || !a.restricted);
    if (f !== 'all') list = list.filter(a => a.s.st === f);
    if (fCms !== 'all') list = list.filter(a => (DATA.cms.find(c => c.code === a.cms)?.type || a.cms) === fCms);
    if (fCat !== 'all') list = list.filter(a => (a.tags || []).includes(fCat));
    if (q) list = list.filter(a => (a.name + a.api + a.domain + a.cms + (a.tags || []).join('') + (a.categories || []).join('')).toLowerCase().includes(q));
    $('#cnt').textContent = `${list.length} 个接口`;
    $('#tbody').innerHTML = list.length ? list.map(a => `
      <tr>
        <td class="name"><a href="detail.html?id=${a.id}">${a.name}</a>${a.restricted ? ' <span class="st mute"><i></i>受限</span>' : ''}</td>
        <td>${stBadge(a.s)}</td>
        <td class="mono">${a.s.lastMs ? a.s.lastMs + 'ms' : '—'}</td>
        <td><div class="bar ${a.s.st}"><b style="width:${(a.s.up * 100).toFixed(0)}%"></b></div></td>
        <td class="mono">${(a.s.up * 100).toFixed(1)}%</td>
        <td>${DATA.cms.find(c => c.code === a.cms)?.type || a.cms}</td>
        <td>${a.contributor}</td>
      </tr>`).join('') : `<tr><td colspan="7"><div class="empty">没有匹配的接口，换个条件试试</div></td></tr>`;
  };
  $('#q').addEventListener('input', e => { q = e.target.value.trim().toLowerCase(); rows(); });
  $('#fStatus').addEventListener('change', e => { f = e.target.value; rows(); });
  $('#fCms').addEventListener('change', e => { fCms = e.target.value; rows(); });
  $('#fCat').addEventListener('change', e => { fCat = e.target.value; rows(); });
  $('#showRes').addEventListener('change', e => { showRes = e.target.checked; rows(); });
  rows();
  initRadar(apis.filter(a => !a.restricted));
}

/* 今日信号波形（动态）：呼吸律动 + 扫描亮点 + 悬停读数 */
function drawWave(cv, apis) {
  const COL = { ok: '#3ecf8e', warn: '#e8c96a', fail: '#ff8f96' };
  const dpr = window.devicePixelRatio || 1;
  let W, H;
  const fit = () => {
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
  };
  fit(); window.addEventListener('resize', fit);
  cv.addEventListener('click', () => { if (hoverApi) location.href = 'detail.html?id=' + hoverApi.id; });
  let hoverApi = null;

  const ms = apis.map(a => a.s.lastMs || 1800);
  const max = Math.max(...ms);
  const bars = apis.map((a, i) => ({
    a, phase: i * 0.7,
    base: a.s.lastMs ? Math.max(10, (1 - a.s.lastMs / max) * 0.72 + 0.16) : 0.5
  }));
  const tip = document.createElement('div');
  tip.style.cssText = 'position:absolute;pointer-events:none;background:var(--paper);color:var(--ink);font-family:var(--mono);font-size:11px;padding:4px 9px;white-space:nowrap;display:none;z-index:5;transform:translate(-50%,-150%)';
  cv.parentElement.appendChild(tip);
  let mx = -1, my = -1;
  cv.addEventListener('mousemove', e => { const b = cv.getBoundingClientRect(); mx = e.clientX - b.left; my = e.clientY - b.top; });
  cv.addEventListener('mouseleave', () => { mx = my = -1; tip.style.display = 'none'; });

  let t0 = performance.now();
  function frame(now) {
    const c = cv.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, W, H);
    const t = (now - t0) / 1000;
    const n = bars.length, slot = W / n;
    const bw = Math.max(3, slot * 0.42);
    let hover = null;

    /* 扫描亮点 */
    const scanX = ((t * 0.12) % 1.3 - 0.15) * W;
    const sg = c.createLinearGradient(scanX - 60, 0, scanX + 60, 0);
    sg.addColorStop(0, 'rgba(62,207,142,0)');
    sg.addColorStop(0.5, 'rgba(62,207,142,.08)');
    sg.addColorStop(1, 'rgba(62,207,142,0)');
    c.fillStyle = sg; c.fillRect(scanX - 60, 0, 120, H);

    bars.forEach((b, i) => {
      const breathe = b.a.s.st === 'ok'
        ? Math.sin(t * 2.2 + b.phase) * 0.10
        : b.a.s.st === 'warn' ? Math.sin(t * 3.4 + b.phase) * 0.16
        : (Math.sin(t * 1.6 + b.phase) + 1) * 0.14; /* 离线：低频脉动 */
      const bh = (b.base + breathe) * (H - 20);
      const x = i * slot + (slot - bw) / 2, y = (H - bh) / 2;
      const near = Math.abs(i * slot + slot / 2 - scanX) < 50;
      c.globalAlpha = near ? 1 : 0.85;
      c.fillStyle = COL[b.a.s.st];
      c.fillRect(x, y, bw, bh);
      if (near) { /* 扫过发光 */
        c.shadowColor = COL[b.a.s.st]; c.shadowBlur = 12;
        c.fillRect(x, y, bw, bh);
        c.shadowBlur = 0;
      }
      c.globalAlpha = 1;
      if (mx >= x - slot / 2 && mx < x + bw + slot / 2 && my > 0) hover = { b, x: x + bw / 2, y };
    });

    if (hover) {
      c.strokeStyle = 'rgba(251,251,248,.7)'; c.lineWidth = 1;
      c.strokeRect(hover.x - bw / 2 - 3, hover.y - 3, bw + 6, (hover.b.base + 0) * (H - 20) + 6);
      tip.style.display = 'block';
      tip.style.left = hover.x + 'px'; tip.style.top = hover.y + 'px';
      tip.textContent = `${hover.b.a.name} · ${hover.b.a.s.label}${hover.b.a.s.lastMs ? ' · ' + hover.b.a.s.lastMs + 'ms' : ''} · 点击查看`;
      hoverApi = hover.b.a;
      cv.style.cursor = 'pointer';
    } else { tip.style.display = 'none'; hoverApi = null; cv.style.cursor = 'default'; }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* 数字滚动 */
function countUp(el, target, suffix = '', dur = 900) {
  if (!el) return;
  const t0 = performance.now();
  const step = now => {
    const p = Math.min(1, (now - t0) / dur);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * e) + suffix;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ---------------- 信号雷达 ---------------- */
function initRadar(apis) {
  const cv = $('#radar'), tip = $('#radarTip');
  if (!cv) return;
  const box = cv.parentElement;
  let W, H, cx, cy, R;
  const fit = () => {
    const dpr = window.devicePixelRatio || 1;
    W = box.clientWidth; H = box.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = W / 2; cy = H / 2; R = Math.min(W, H) / 2 - 8;
  };
  fit(); window.addEventListener('resize', fit);

  /* 固定光点：角度随机、半径按速度（快→外圈）、大小按速度 */
  const msList = apis.map(a => a.s.avg || 2000);
  const lo = Math.min(...msList), hi = Math.max(...msList), span = (hi - lo) || 1;
  const pts = apis.map((a, i) => {
    const ang = (i * 2.39996) + (i % 3) * 0.35; /* 黄金角铺开 */
    const speed = a.s.avg ? 1 - (a.s.avg - lo) / span : 0;
    const rad = R * (0.28 + 0.68 * (0.35 + 0.65 * speed) * (0.75 + (i % 5) * 0.06));
    return { a, ang, rad, r: 2.5 + 5 * speed, glow: 0 };
  });
  const COL = { ok: '#1a7f37', warn: '#b56a00', fail: '#d42a3d' };

  let sweep = 0, hover = null, mx = -1, my = -1;
  cv.addEventListener('mousemove', e => {
    const b = cv.getBoundingClientRect(); mx = e.clientX - b.left; my = e.clientY - b.top;
  });
  cv.addEventListener('mouseleave', () => { mx = my = -1; hover = null; tip.style.display = 'none'; });
  cv.addEventListener('click', () => { if (hover) location.href = 'detail.html?id=' + hover.a.id; });

  function frame() {
    const c = cv.getContext('2d');
    c.clearRect(0, 0, W, H);
    /* 同心环 + 十字线 */
    c.strokeStyle = 'rgba(24,21,16,.22)'; c.lineWidth = 1;
    for (let k = 1; k <= 4; k++) { c.beginPath(); c.arc(cx, cy, R * k / 4, 0, 7); c.stroke(); }
    c.beginPath(); c.moveTo(cx - R, cy); c.lineTo(cx + R, cy); c.moveTo(cx, cy - R); c.lineTo(cx, cy + R); c.stroke();
    c.strokeStyle = 'rgba(24,21,16,.5)'; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.stroke();
    /* 刻度字 */
    c.fillStyle = 'rgba(24,21,16,.45)'; c.font = '9px Menlo,monospace';
    ['FAST', '', '', 'SLOW'].forEach((t, k) => { if (t) c.fillText(t, cx + 4, cy - R * (k + 1) / 4 + 3); });

    /* 扫描扇面 */
    sweep = (sweep + 0.014) % (Math.PI * 2);
    const grad = c.createConicGradient ? null : null;
    for (let s = 0; s < 26; s++) {
      const a0 = sweep - s * 0.022;
      c.beginPath(); c.moveTo(cx, cy);
      c.arc(cx, cy, R, a0 - 0.024, a0);
      c.closePath();
      c.fillStyle = `rgba(26,127,55,${0.10 * (1 - s / 26)})`;
      c.fill();
    }
    c.beginPath(); c.moveTo(cx, cy);
    c.lineTo(cx + Math.cos(sweep) * R, cy + Math.sin(sweep) * R);
    c.strokeStyle = 'rgba(26,127,55,.85)'; c.lineWidth = 1.5; c.stroke();

    /* 光点 */
    hover = null;
    pts.forEach(p => {
      const x = cx + Math.cos(p.ang) * p.rad, y = cy + Math.sin(p.ang) * p.rad;
      /* 被扫过则发亮衰减 */
      let d = (sweep - p.ang) % (Math.PI * 2); if (d < 0) d += Math.PI * 2;
      if (d < 0.05) p.glow = 1;
      p.glow *= 0.985;
      const col = COL[p.a.s.st];
      if (p.glow > 0.02) {
        c.beginPath(); c.arc(x, y, p.r + 7 * p.glow, 0, 7);
        c.fillStyle = col + '2e'; c.fill();
      }
      c.beginPath(); c.arc(x, y, p.r, 0, 7); c.fillStyle = col; c.fill();
      if (p.a.s.st === 'fail') { /* 离线点呼吸 */
        c.beginPath(); c.arc(x, y, p.r + 3 + 2 * Math.sin(Date.now() / 300), 0, 7);
        c.strokeStyle = col; c.lineWidth = 1; c.stroke();
      }
      /* 悬停检测 */
      if (mx >= 0 && Math.hypot(mx - x, my - y) < p.r + 6) { hover = p; p.hx = x; p.hy = y; }
    });
    if (hover) {
      c.beginPath(); c.arc(hover.hx, hover.hy, hover.r + 5, 0, 7);
      c.strokeStyle = '#181510'; c.lineWidth = 1.5; c.stroke();
      tip.style.display = 'block';
      tip.style.left = hover.hx + 'px'; tip.style.top = hover.hy + 'px';
      tip.textContent = `${hover.a.name} · ${hover.a.s.label}${hover.a.s.avg ? ' · ' + hover.a.s.avg + 'ms' : ''}`;
      cv.style.cursor = 'pointer';
    } else { tip.style.display = 'none'; cv.style.cursor = 'crosshair'; }

    requestAnimationFrame(frame);
  }
  frame();
}

/* ---------------- 分类页 ---------------- */
function pageCategory(DATA, apis) {
  /* 聚合：分类 → 接口列表 */
  const map = new Map();
  apis.filter(a => !a.restricted).forEach(a => (a.categories || []).forEach(c => {
    if (!map.has(c)) map.set(c, []);
    map.get(c).push(a);
  }));
  const cats = [...map.entries()].sort((x, y) => y[1].length - x[1].length);
  const total = cats.reduce((p, [, l]) => p + l.length, 0);

  /* 顶部索引 */
  $('#catIndex').innerHTML = cats.map(([c, l]) =>
    `<a class="tag" href="#cat-${encodeURIComponent(c)}" data-c="${c}">${c}<span class="mono" style="color:var(--ink2);margin-left:5px">${l.length}</span></a>`).join('');
  $('#catSum').innerHTML = `${cats.length}<small> 个分类 · ${total} 条收录</small>`;

  /* 分组区块 */
  $('#catList').innerHTML = cats.map(([c, list]) => {
    const online = list.filter(a => a.s.st === 'ok').length;
    const best = list.filter(a => a.s.avg).sort((x, y) => x.s.avg - y.s.avg)[0];
    return `
    <section class="cat-sec" id="cat-${encodeURIComponent(c)}">
      <div class="cat-head">
        <h3>${c}</h3>
        <span class="mono cat-meta">${list.length} 个接口 · 在线 ${online} · 最快 ${best ? best.s.avg + 'ms' : '—'}</span>
      </div>
      <table class="t">
        <thead><tr><th>名称</th><th>状态</th><th>最新耗时</th><th>30日在线率</th><th>好心人</th></tr></thead>
        <tbody>${list.sort((x, y) => (x.s.avg || 9999) - (y.s.avg || 9999)).map(a => `
          <tr>
            <td class="name"><a href="detail.html?id=${a.id}">${a.name}</a></td>
            <td>${stBadge(a.s)}</td>
            <td class="mono">${a.s.lastMs ? a.s.lastMs + 'ms' : '—'}</td>
            <td class="mono">${(a.s.up * 100).toFixed(1)}%</td>
            <td>${a.contributor}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </section>`;
  }).join('');

  /* 索引筛选 */
  $('#catQ').addEventListener('input', e => {
    const q = e.target.value.trim();
    $$('.cat-sec').forEach(s => s.style.display = s.querySelector('h3').textContent.includes(q) ? '' : 'none');
    $$('#catIndex .tag').forEach(t => t.style.display = t.dataset.c.includes(q) ? '' : 'none');
  });
}
/* ---------------- 一键配置下载页 ---------------- */
function pageDownload(DATA, apis) {
  /* 仅收录在线且可用率 >= 95% 的非受限接口 */
  const good = apis.filter(a => !a.restricted && a.s.st === 'ok' && a.s.up >= 0.95);
  const avgUp = good.length ? good.reduce((p, a) => p + a.s.up, 0) / good.length * 100 : 0;
  const totalRes = good.reduce((p, a) => p + (a.total || 0), 0);
  const fmtWan = n => n >= 1e4 ? (n / 1e4).toFixed(0) + '万' : n.toLocaleString();

  $('#dlCount').innerHTML = `${good.length}<small> 采集站数量</small>`;
  $('#dlRate').innerHTML = `${avgUp.toFixed(1)}%<small> 平均可用率</small>`;
  $('#dlRes').innerHTML = `${fmtWan(totalRes)}<small> 总资源量</small>`;
  $('#dlMeta').textContent = `更新时间: ${DATA.updated} · 包含 ${good.length} 个采集站接口`;
  $('#lead').textContent = `${new Date(DATA.updated).getFullYear()} 最新苹果CMS V10 一键采集全接口配置，收录 ${good.length} 个高可用采集站，平均可用率 ${avgUp.toFixed(1)}%，涵盖 ${totalRes.toLocaleString()} 部影视资源。支持苹果CMS、海洋CMS等主流影视CMS系统一键导入。`;

  /* 预览前10 */
  $('#dlPreview').innerHTML = good.slice(0, 10).map(a => `
    <tr>
      <td class="name"><a href="detail.html?id=${a.id}">${a.name}</a></td>
      <td><span class="fmt">JSON</span></td>
      <td class="mono" style="color:var(--green);font-weight:700">${(a.s.up * 100).toFixed(0)}%</td>
      <td>${a.s.avg && a.s.avg < 800 ? '<span style="color:var(--green);font-weight:600">快速</span>' : '一般'}</td>
      <td class="mono">${(a.total || 0).toLocaleString()}</td>
    </tr>`).join('');
  $('#dlMore').textContent = `仅展示前 ${Math.min(10, good.length)} 个采集站，完整列表请下载配置文件`;

  /* 生成下载 */
  const buildJSON = () => JSON.stringify({
    name: DATA.brand + ' 一键采集配置', updated: DATA.updated, count: good.length,
    sites: good.map(a => ({ name: a.name, api: a.api, type: 'json', cms: a.cms, uptime: +(a.s.up * 100).toFixed(1), speed_ms: a.s.avg, total: a.total, categories: a.categories }))
  }, null, 2);
  const buildTXT = () => good.map(a => `${a.name}|${a.api}at/json/|json|${(a.s.up * 100).toFixed(1)}%`).join('\n');
  const dl = (content, fname, mime) => {
    const url = URL.createObjectURL(new Blob([content], { type: mime }));
    const el = Object.assign(document.createElement('a'), { href: url, download: fname });
    el.click(); URL.revokeObjectURL(url);
  };
  $('#btnJson').addEventListener('click', () => dl(buildJSON(), `maccms-collect-${DATA.updated}.json`, 'application/json'));
  $('#btnTxt').addEventListener('click', () => dl(buildTXT(), `maccms-collect-${DATA.updated}.txt`, 'text/plain'));
}

function pageDetail(DATA) {
  const id = new URLSearchParams(location.search).get('id');
  const a = DATA.apis.find(x => x.id === id);
  if (!a) { $('#main').innerHTML = '<div class="container prose"><div class="empty">未找到该接口，<a href="index.html">返回目录</a></div></div>'; return; }
  const s = statOf(a);
  document.title = `${a.name} · 接口详情 · ${DATA.brand}`;
  const cms = DATA.cms.find(c => c.code === a.cms);
  const h = a.history, last = h[h.length - 1];
  const fails = h.filter(x => !x.ok).length;
  const upPct = (s.up * 100).toFixed(1).replace(/\.0$/, '');
  const rateCls = s.st === 'ok' ? 'g' : s.st === 'warn' ? 'w' : 'r';

  $('#main').innerHTML = `
  <div class="container">
    <div class="crumb"><a href="index.html">信号目录</a> / 采集站详情</div>

    <div class="d-top">
      <div class="d-title">
        <h1>${a.name}</h1>
        <div class="d-match">${stBadge(s)} ${a.restricted ? '<span class="st mute"><i></i>受限 · ' + (a.note || '需授权') + '</span>' : '<span style="margin-left:10px">已匹配公开采集接口</span>'}</div>
        <div class="tagrow">${(a.tags || []).map(t => `<span class="tag${t === '受限内容' ? ' hot' : ''}">${t}</span>`).join('')}</div>
      </div>
      <div class="rate-card">
        <div class="lab">${s.label === '在线' ? '在线' : s.label} · 30日可用率</div>
        <div class="big ${rateCls}">${upPct}%</div>
        <div class="sm">最近 30 次日检 · ${DATA.variants.length} 条可填接口</div>
      </div>
    </div>

    <div class="d-section grid2">
      <div class="box">
        <h4>接口身份 · IDENTITY</h4>
        <div class="ident-head">
          <b>${cms ? cms.type : 'MacCMS'} 风格点播采集接口（provide/vod）</b>
          <p>同一根地址可派生 JSON / XML / 海洋CMS / 多米CMS 等多种填写方式，见下方「采集接口地址」表。</p>
        </div>
        <div class="ident-grid">
          <div class="ident-cell"><div class="k">接口类型</div><div class="v">${cms ? cms.type : 'MacCMS'} 采集源</div></div>
          <div class="ident-cell"><div class="k">检测格式</div><div class="v">JSON</div></div>
          <div class="ident-cell"><div class="k">HTTP 状态</div><div class="v mono">${a.http}</div></div>
          <div class="ident-cell"><div class="k">响应时间</div><div class="v mono">${last.ok ? last.ms + ' ms' : '—'}</div></div>
          <div class="ident-cell"><div class="k">资源数量</div><div class="v mono">${a.total.toLocaleString()}</div></div>
          <div class="ident-cell"><div class="k">接口域名</div><div class="v mono">${a.domain}</div></div>
          <div class="ident-cell"><div class="k">数据来源</div><div class="v">${a.source}</div></div>
          <div class="ident-cell"><div class="k">好心人</div><div class="v">${a.contributor} 投稿维护</div></div>
        </div>
        <div class="copy-row" style="margin-top:14px"><code>${a.api}</code><button class="btn" data-c="${a.api}">复制根地址</button></div>
        <div style="font-size:12.5px;margin-top:6px"><a href="guide.html" style="border-bottom:1px solid var(--ink2)">查看采集对接教程 →</a></div>
      </div>
      <div class="box">
        <h4>内容分类 · CATEGORIES</h4>
        <div class="cat-cloud">${(a.categories || []).map(c => `<span class="tag">${c}</span>`).join('')}</div>
        <p class="cat-note">分类来自接口公开的 class 元数据；未下载具体影视内容。共 ${(a.categories || []).length} 个分类。</p>
        <h4 style="margin-top:22px">使用说明 · NOTES</h4>
        <p style="font-size:13px;color:#33301f">优先复制与你的程序匹配的那一行：苹果CMS 常用 JSON 或 XML；海洋 / 飞飞 / 赞片常用 xmlsea；多米CMS 常用 at/xml。</p>
        <p style="font-size:13px;color:#33301f;margin-top:8px">检测状态不代表接口获得授权。请在使用前自行确认服务方条款。</p>
      </div>
    </div>

    <div class="d-section">
      <h2 class="sec-title">采集接口地址 <span class="count-tip">${DATA.variants.length} 条</span></h2>
      <p style="font-size:13px;color:var(--ink2);margin-bottom:12px">按程序类型展开的常用填写地址。根地址在线时，这些派生地址通常可直接复制到对应 CMS。</p>
      <table class="addr-table">
        <tr><th style="width:34%">程序</th><th>接口</th><th style="width:70px">格式</th><th style="width:90px"></th></tr>
        ${DATA.variants.map(v => `<tr>
          <td class="addr-prog"><b>${v.prog}</b><span>${v.note}</span></td>
          <td><div class="addr-url">${a.api}${v.suffix}</div></td>
          <td><span class="fmt">${v.fmt}</span></td>
          <td><button class="btn" data-c="${a.api}${v.suffix}">复制</button></td>
        </tr>`).join('')}
      </table>
    </div>

    <div class="d-section grid2">
      <div class="chart-wrap">
        <h4 style="font-family:var(--mono);font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:var(--red);font-weight:700">最近检测信号 · SIGNAL</h4>
        <canvas class="chart" id="chart"></canvas>
        <div class="chart-ax"><span>${h[0].date}</span><span>${h[h.length - 1].date}</span></div>
      </div>
      <div class="box">
        <h4>近 10 日明细 · LOG</h4>
        ${spark(h)}
        <table class="t" style="margin-top:16px">
          <tr><th>日期</th><th>状态</th><th>耗时</th></tr>
          ${[...h].reverse().slice(0, 10).map(x => `<tr><td class="mono">${x.date}</td>
            <td>${x.ok ? '<span class="st ok"><i></i>正常</span>' : '<span class="st fail"><i></i>失败</span>'}</td>
            <td class="mono">${x.ok ? x.ms + 'ms' : '—'}</td></tr>`).join('')}
        </table>
      </div>
    </div>

    <div class="tip" style="margin-top:26px">${cms ? '对接提示：' + cms.tip : ''} 发现接口失效？欢迎到 <a href="${DATA.repo}">GitHub Issue</a> 反馈。</div>
    <div class="foot-note"><span>检测结果仅代表最后检测时刻</span><span>使用接口前请确认服务条款与授权范围</span></div>
  </div>`;
  $$('#main [data-c]').forEach(b => b.addEventListener('click', () => copyText(b.dataset.c, b)));
  drawChart($('#chart'), h);
}

/* 30 日响应时间折线 + 失败红点 */
function drawChart(cv, h) {
  const dpr = window.devicePixelRatio || 1;
  const w = cv.clientWidth, hh = cv.clientHeight;
  cv.width = w * dpr; cv.height = hh * dpr;
  const c = cv.getContext('2d'); c.scale(dpr, dpr);
  const okMs = h.filter(x => x.ok).map(x => x.ms);
  const max = Math.max(...okMs, 200), min = Math.min(...okMs, 0);
  const pad = 8, span = (max - min) || 1;
  const px = i => pad + i * (w - pad * 2) / (h.length - 1);
  const py = ms => hh - 14 - ((ms - min) / span) * (hh - 34);
  /* grid */
  c.strokeStyle = '#d9d2bf'; c.lineWidth = 1;
  for (let g = 0; g <= 3; g++) {
    const y = 10 + g * (hh - 34) / 3;
    c.beginPath(); c.moveTo(pad, y); c.lineTo(w - pad, y); c.stroke();
    c.fillStyle = '#6b6455'; c.font = '10px Menlo,monospace';
    c.fillText(Math.round(max - g * span / 3) + 'ms', w - pad - 42, y - 3);
  }
  /* line */
  c.strokeStyle = '#1a7f37'; c.lineWidth = 2; c.beginPath();
  let started = false;
  h.forEach((x, i) => {
    if (!x.ok) { started = false; return; }
    if (!started) { c.moveTo(px(i), py(x.ms)); started = true; }
    else c.lineTo(px(i), py(x.ms));
  });
  c.stroke();
  /* points */
  h.forEach((x, i) => {
    c.beginPath();
    if (x.ok) { c.arc(px(i), py(x.ms), 2.5, 0, 7); c.fillStyle = '#1a7f37'; }
    else { c.arc(px(i), hh - 14, 3.5, 0, 7); c.fillStyle = '#d42a3d'; }
    c.fill();
  });
}

boot();
