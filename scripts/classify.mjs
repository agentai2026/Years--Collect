#!/usr/bin/env node
/**
 * Automation #5 — detect CMS type hints + content categories for each API.
 * MacCMS category metadata lives in `class` and is returned by `ac=list`
 * (NOT `ac=videolist`, which health probes use).
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

async function fetchJson(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        'User-Agent': 'Years-Collect-SignalDesk/1.0',
        Accept: 'application/json,text/plain,*/*',
      },
    });
    const text = await res.text();
    try {
      return { ok: res.ok, status: res.status, json: JSON.parse(text) };
    } catch {
      return { ok: false, status: res.status, json: null };
    }
  } catch (err) {
    return { ok: false, status: 0, json: null, error: err.message };
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

function classNames(json) {
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
  // Fallback: unique type_name from list page
  if (!names.length && Array.isArray(json?.list)) {
    for (const item of json.list) {
      const s = String(item?.type_name || '').trim();
      if (s) names.push(s);
    }
  }
  return [...new Set(names)];
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
  if (/AV资源|色情|成人|里番|伦理站|色站/i.test(name || '')) return true;
  const list = cats || [];
  const strong = list.filter((c) => ADULT_STRONG.test(c));
  if (strong.length >= 3) return true;
  if (list.length && strong.length / list.length >= 0.3) return true;
  return false;
}

function detectKind(api, json) {
  if (/json\.php/i.test(api)) return 'jsonapi';
  if (classRows(json).length || /provide\/vod/i.test(api)) return 'maccms10';
  if (Array.isArray(json?.list)) return 'maccms10';
  return null;
}

async function main() {
  const data = readData();
  console.log(`Classify #5 · ${data.apis.length} endpoints (ac=list for MacCMS)`);

  let ok = 0;
  let fail = 0;
  let withCats = 0;
  for (let i = 0; i < data.apis.length; i++) {
    const api = data.apis[i];
    const url = classifyUrl(api.api);
    const result = await fetchJson(url);
    if (result.json) {
      const cats = classNames(result.json);
      if (cats.length) {
        api.categories = cats;
        api.tags = topTags(result.json, cats);
        withCats += 1;
      }
      if (looksRestricted(api.name, api.categories || cats)) {
        api.restricted = true;
        if (!api.note || /synced from/i.test(api.note)) {
          api.note = '分类含受限内容，默认隐藏';
        }
        if (!(api.tags || []).includes('受限内容')) {
          api.tags = ['受限内容', ...(api.tags || [])].slice(0, 12);
        }
      }
      const kind = detectKind(api.api, result.json);
      if (kind) api.cms = kind;
      if (result.json.total != null) api.total = Number(result.json.total) || api.total;
      api.http = result.status;
      ok += 1;
      console.log(`  OK   ${api.id} cats=${(api.categories || []).length} cms=${api.cms}${api.restricted ? ' [R]' : ''}`);
    } else {
      fail += 1;
      console.log(`  FAIL ${api.id} ${result.error || result.status}`);
    }
    if (i < data.apis.length - 1) await sleep(GAP_MS);
  }

  writeData(data);
  console.log(`classify done · ok=${ok} fail=${fail} withCats=${withCats} total=${data.apis.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
