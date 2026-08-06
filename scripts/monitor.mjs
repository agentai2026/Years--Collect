#!/usr/bin/env node
/**
 * Probe every API in data.json and append/update today's history entry.
 * Keeps the last 30 daily samples. No third-party dependencies.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA_PATH = join(ROOT, 'data.json');
const TIMEOUT_MS = 12_000;
const HISTORY_LIMIT = 30;
const GAP_MS = 200;

function shanghaiDate(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function buildProbeUrl(apiUrl, cmsMeta) {
  const param = cmsMeta?.param || '?ac=list';
  if (param.startsWith('?') || param.startsWith('&')) {
    const base = apiUrl.replace(/\?.*$/, '');
    const q = param.startsWith('?') ? param.slice(1) : param.slice(1);
    const sep = base.includes('?') ? '&' : '?';
    return `${base}${sep}${q}`;
  }
  if (param.startsWith('/')) {
    try {
      return new URL(param, new URL(apiUrl).origin).href;
    } catch {
      return apiUrl;
    }
  }
  const base = apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`;
  return `${base}${param}`;
}

function extractTotal(body) {
  if (!body || typeof body !== 'object') return null;
  const candidates = [
    body.total,
    body.pagecount && body.limit ? Number(body.pagecount) * Number(body.limit) : null,
    body.data?.total,
    body.list?.length,
    Array.isArray(body.list) ? body.list.length : null,
  ];
  for (const n of candidates) {
    const v = Number(n);
    if (Number.isFinite(v) && v >= 0) return Math.round(v);
  }
  return null;
}

function looksOk(status, text) {
  if (status < 200 || status >= 300) return false;
  const trimmed = (text || '').trim();
  if (!trimmed) return false;
  try {
    const json = JSON.parse(trimmed);
    if (json && typeof json === 'object') {
      if ('code' in json && Number(json.code) === 0) return true;
      if ('list' in json || 'data' in json || 'total' in json || 'page' in json) return true;
      return true;
    }
  } catch {
    // XML / HTML list endpoints still count if status is OK and body is non-trivial
    if (trimmed.length > 32 && (trimmed.startsWith('<') || trimmed.includes('<'))) return true;
  }
  return false;
}

async function probe(url) {
  const started = Date.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: ctrl.signal,
      headers: {
        'User-Agent': 'Years-Collect-SignalDesk/1.0 (+https://github.com/agentai2026/Years--Collect)',
        Accept: 'application/json, application/xml, text/xml, */*',
      },
    });
    const text = await res.text();
    const ms = Math.max(1, Date.now() - started);
    let total = null;
    try {
      total = extractTotal(JSON.parse(text));
    } catch {
      /* ignore */
    }
    return {
      ok: looksOk(res.status, text),
      ms,
      http: res.status,
      total,
      error: null,
    };
  } catch (err) {
    return {
      ok: false,
      ms: Math.max(1, Date.now() - started),
      http: 0,
      total: null,
      error: err.name === 'AbortError' ? 'timeout' : String(err.message || err),
    };
  } finally {
    clearTimeout(timer);
  }
}

function upsertHistory(history, entry) {
  const list = Array.isArray(history) ? [...history] : [];
  const idx = list.findIndex((h) => h.date === entry.date);
  if (idx >= 0) list[idx] = entry;
  else list.push(entry);
  list.sort((a, b) => a.date.localeCompare(b.date));
  return list.slice(-HISTORY_LIMIT);
}

async function main() {
  const raw = readFileSync(DATA_PATH, 'utf8');
  const data = JSON.parse(raw);
  const today = shanghaiDate();
  const cmsByCode = new Map((data.cms || []).map((c) => [c.code, c]));

  let online = 0;
  let offline = 0;
  const failures = [];

  console.log(`Signal desk monitor · ${today} · ${data.apis.length} endpoints`);

  for (let i = 0; i < data.apis.length; i++) {
    const api = data.apis[i];
    const cms = cmsByCode.get(api.cms);
    const url = buildProbeUrl(api.api, cms);
    const result = await probe(url);

    api.http = result.http;
    if (result.ok && result.total != null) api.total = result.total;
    api.history = upsertHistory(api.history, {
      date: today,
      ok: result.ok,
      ms: result.ok ? result.ms : null,
    });

    if (result.ok) {
      online += 1;
      console.log(`  OK   ${api.id} ${api.name} ${result.ms}ms http=${result.http}`);
    } else {
      offline += 1;
      failures.push(`${api.id} ${api.name} http=${result.http} ${result.error || ''}`.trim());
      console.log(`  FAIL ${api.id} ${api.name} http=${result.http} ${result.error || ''}`.trim());
    }

    if (i < data.apis.length - 1) await sleep(GAP_MS);
  }

  data.updated = today;
  writeFileSync(DATA_PATH, `${JSON.stringify(data, null, 1)}\n`, 'utf8');

  console.log(`\nSummary: online=${online} offline=${offline} updated=${today}`);
  if (failures.length) {
    console.log('Failures:');
    for (const line of failures) console.log(`  - ${line}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
