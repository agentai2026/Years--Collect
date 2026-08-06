#!/usr/bin/env node
/**
 * Automation #5 — detect CMS type hints + content categories for each API
 */
import {
  GAP_MS,
  buildProbeUrl,
  sleep,
  TIMEOUT_MS,
  readData,
  writeData,
} from './lib.mjs';

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

function classNames(json) {
  const rows = json?.class || json?.type || [];
  if (!Array.isArray(rows)) return [];
  return rows
    .map((c) => c.type_name || c.name || c.title || '')
    .map((s) => String(s).trim())
    .filter(Boolean);
}

function detectKind(api, json) {
  if (/json\.php/i.test(api)) return 'jsonapi';
  if (json?.class || /provide\/vod/i.test(api)) return 'maccms10';
  if (Array.isArray(json?.list)) return 'maccms10';
  return null;
}

async function main() {
  const data = readData();
  const cmsByCode = new Map((data.cms || []).map((c) => [c.code, c]));
  console.log(`Classify #5 · ${data.apis.length} endpoints`);

  let ok = 0;
  let fail = 0;
  for (let i = 0; i < data.apis.length; i++) {
    const api = data.apis[i];
    const cms = cmsByCode.get(api.cms);
    // Prefer list endpoint for MacCMS category payload
    let url = buildProbeUrl(api.api, cms);
    if (/provide\/vod/i.test(api.api) && !/[?&]ac=/.test(url)) {
      url += (url.includes('?') ? '&' : '?') + 'ac=list';
    }
    const result = await fetchJson(url);
    if (result.json) {
      const cats = classNames(result.json);
      if (cats.length) {
        api.categories = cats;
        // top-level tags: parent-ish names first 12
        api.tags = cats.filter((c) => !/片$/.test(c) || ['电影', '连续剧', '电视剧', '综艺', '动漫'].includes(c)).slice(0, 12);
        if (!api.tags.length) api.tags = cats.slice(0, 8);
      }
      const kind = detectKind(api.api, result.json);
      if (kind) api.cms = kind;
      if (result.json.total != null) api.total = Number(result.json.total) || api.total;
      api.http = result.status;
      ok += 1;
      console.log(`  OK   ${api.id} cats=${(api.categories || []).length} cms=${api.cms}`);
    } else {
      fail += 1;
      console.log(`  FAIL ${api.id} ${result.error || result.status}`);
    }
    if (i < data.apis.length - 1) await sleep(GAP_MS);
  }

  writeData(data);
  console.log(`classify done · ok=${ok} fail=${fail} total=${data.apis.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
