#!/usr/bin/env node
/**
 * Automation #5 — detect CMS type hints + content categories for each API.
 * MacCMS category metadata lives in `class` / XML `<ty>` and is returned by
 * `ac=list` (NOT `ac=videolist`, which health probes use).
 */
import {
  GAP_MS,
  sleep,
  TIMEOUT_MS,
  readData,
  writeData,
} from './lib.mjs';

/** Strong adult markers only — weak words like 福利/美女 cause false positives. */
const ADULT_STRONG =
  /无码|有码|中文字幕|麻豆|里番|伦理|情色|色情|成人|禁片|口交|强奸|乱伦|人妻|骑兵|步兵|换脸|女同|男同|制服诱惑|三级|黄网|R18|18\+|AV专|AV片|日本AV|欧美AV|SM调教/;

async function fetchBody(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; Years-Collect-SignalDesk/1.0; +https://github.com/agentai2026/Years--Collect)',
        Accept: 'application/json,application/xml,text/xml,text/plain,*/*',
      },
      redirect: 'follow',
    });
    const text = await res.text();
    return { ok: res.ok, status: res.status, text };
  } catch (err) {
    return { ok: false, status: 0, text: '', error: err.message };
  } finally {
    clearTimeout(timer);
  }
}

/** Prefer list endpoint so MacCMS returns the `class` array. */
function classifyUrl(apiUrl) {
  const raw = String(apiUrl || '').trim();
  if (!raw) return raw;
  if (/provide\/vod/i.test(raw)) {
    const base = raw.replace(/\?.*$/, '').replace(/\/?$/, '/');
    return `${base}?ac=list`;
  }
  if (/[?&]ac=/.test(raw)) return raw;
  if (/\/inc\/api\.php/i.test(raw) || /\/api\.php\/?$/i.test(raw)) {
    const base = raw.replace(/\?.*$/, '');
    return `${base}${base.includes('?') ? '&' : '?'}ac=list`;
  }
  if (/json\.php/i.test(raw)) return raw.replace(/\?.*$/, '');
  if (/\.php\/?$/i.test(raw) || /\/api\.php/i.test(raw)) {
    const base = raw.replace(/\/?$/, '/');
    return `${base}?ac=list`;
  }
  return raw;
}

function classRows(json) {
  if (!json || typeof json !== 'object') return [];
  for (const key of ['class', 'classes', 'type', 'types', 'typelist', 'class_list', 'category', 'categories']) {
    const v = json[key];
    if (Array.isArray(v) && v.length) return v;
    if (v && typeof v === 'object') {
      const nested = v.list || v.data;
      if (Array.isArray(nested) && nested.length) return nested;
    }
  }
  return [];
}

function classNamesFromJson(json) {
  const rows = classRows(json);
  const names = [];
  for (const c of rows) {
    if (typeof c === 'string') {
      const s = c.trim();
      if (s) names.push(s);
      continue;
    }
    if (!c || typeof c !== 'object') continue;
    const s = String(c.type_name || c.class_name || c.name || c.title || '').trim();
    if (s) names.push(s);
  }
  if (!names.length && Array.isArray(json?.list)) {
    for (const item of json.list) {
      const s = String(item?.type_name || item?.vod_class || '').trim();
      if (s) names.push(...s.split(/[,，|/]/).map((x) => x.trim()).filter(Boolean));
    }
  }
  return [...new Set(names)];
}

function classNamesFromXml(text) {
  if (!text || !/<class[\s>]|<\/ty>|<ty[\s>]/i.test(text)) return [];
  const names = [...text.matchAll(/<ty\b[^>]*>([^<]+)<\/ty>/gi)].map((m) => m[1].trim()).filter(Boolean);
  return [...new Set(names)];
}

function extractTotal(json, text) {
  if (json?.total != null) {
    const n = Number(json.total);
    if (Number.isFinite(n)) return n;
  }
  const m = String(text || '').match(/\brecordcount\s*=\s*["']?(\d+)/i);
  if (m) return Number(m[1]);
  return null;
}

function isHtmlTrap(text) {
  const t = (text || '').trim();
  if (!t) return false;
  if (/^<!DOCTYPE html|<html[\s>]/i.test(t)) return true;
  if (/<script[\s>][^>]*src=/i.test(t) && !/<rss|<list|<class|^\s*\{/i.test(t)) return true;
  return false;
}

function topTags(json, cats) {
  const rows = classRows(json);
  const parents = rows
    .filter((c) => c && typeof c === 'object' && Number(c.type_pid || 0) === 0)
    .map((c) => String(c.type_name || c.name || '').trim())
    .filter(Boolean);
  const pool = parents.length ? parents : cats;
  const preferred = pool.filter(
    (c) =>
      ['电影', '连续剧', '电视剧', '综艺', '动漫', '纪录片', '短剧', '体育', '资讯'].includes(c) ||
      !/片$/.test(c),
  );
  const tags = (preferred.length ? preferred : pool).slice(0, 12);
  return tags.length ? tags : cats.slice(0, 8);
}

function looksRestricted(name, cats) {
  if (/AV资源|色情|成人|里番|伦理站|色站|美少女|X色/i.test(name || '')) return true;
  const list = cats || [];
  const strong = list.filter((c) => ADULT_STRONG.test(c));
  if (strong.length >= 3) return true;
  if (list.length && strong.length / list.length >= 0.3) return true;
  return false;
}

function applyRestricted(api, cats) {
  if (!looksRestricted(api.name, cats)) return;
  api.restricted = true;
  if (!(api.categories || []).length && /未公开 class/i.test(api.note || '')) {
    // keep “未公开” note when there are no category names to show
  } else if (!api.note || /synced from|分类含受限|防爬|返回网页/i.test(api.note)) {
    api.note = '分类含受限内容，默认隐藏';
  }
  if (!(api.tags || []).includes('受限内容')) {
    api.tags = ['受限内容', ...(api.tags || [])].slice(0, 12);
  }
}

function detectKind(api, json, text) {
  if (/json\.php/i.test(api)) return 'jsonapi';
  if (/\/inc\/api\.php/i.test(api) || /<rss[\s>]/i.test(text || '')) return 'maccmsv8';
  if (classRows(json).length || /provide\/vod/i.test(api)) return 'maccms10';
  if (Array.isArray(json?.list)) return 'maccms10';
  return null;
}

async function main() {
  const data = readData();
  const onlyEmpty = process.env.ONLY_EMPTY === '1';
  const targets = onlyEmpty
    ? data.apis.filter((a) => !(a.categories && a.categories.length))
    : data.apis;
  console.log(`Classify #5 · ${targets.length}/${data.apis.length} endpoints${onlyEmpty ? ' (empty only)' : ''}`);

  let ok = 0;
  let fail = 0;
  let withCats = 0;
  for (let i = 0; i < targets.length; i++) {
    const api = targets[i];
    const url = classifyUrl(api.api);
    const result = await fetchBody(url);
    if (result.error || !result.text) {
      fail += 1;
      console.log(`  FAIL ${api.id} ${result.error || result.status}`);
      if (i < targets.length - 1) await sleep(GAP_MS);
      continue;
    }

    if (isHtmlTrap(result.text)) {
      fail += 1;
      api.http = result.status;
      if (!(api.categories || []).length) {
        api.note = '接口被防爬/返回网页，暂无分类元数据';
      }
      console.log(`  HTML ${api.id} blocked interstitial`);
      if (i < targets.length - 1) await sleep(GAP_MS);
      continue;
    }

    let json = null;
    try {
      json = JSON.parse(result.text);
    } catch {
      json = null;
    }

    let cats = json ? classNamesFromJson(json) : [];
    if (!cats.length) cats = classNamesFromXml(result.text);

    if (cats.length) {
      api.categories = cats;
      api.tags = json ? topTags(json, cats) : cats.slice(0, 12);
      withCats += 1;
    } else if (json && /json\.php/i.test(api.api)) {
      // Reachable JSON API but no class metadata published
      api.note = '接口未公开 class 分类';
    }

    applyRestricted(api, api.categories || cats);
    const kind = detectKind(api.api, json, result.text);
    if (kind) api.cms = kind;
    const total = extractTotal(json, result.text);
    if (total != null) api.total = total;
    api.http = result.status;
    ok += 1;
    console.log(
      `  OK   ${api.id} cats=${(api.categories || []).length} cms=${api.cms}${api.restricted ? ' [R]' : ''}${cats.length ? '' : json ? ' (no class)' : ' (xml/empty)'}`,
    );
    if (i < targets.length - 1) await sleep(GAP_MS);
  }

  writeData(data);
  console.log(`classify done · ok=${ok} fail=${fail} withCats+=${withCats} total=${data.apis.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
