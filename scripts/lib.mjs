import { mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
/** Site catalog consumed by docs/*.html */
export const DATA_PATH = join(ROOT, 'docs', 'catalog.json');
/** Timed probe snapshots (latest + archives) */
export const DATA_DIR = join(ROOT, 'data');
export const LATEST_PATH = join(DATA_DIR, 'latest.json');
export const ARCHIVE_DIR = join(DATA_DIR, 'archives');

export const TIMEOUT_MS = 12_000;
export const HISTORY_LIMIT = 30;
export const GAP_MS = 200;
export const ARCHIVE_KEEP = Number(process.env.ARCHIVE_KEEP || 120);
/** 0 or unset negative => sync all active sources */
export const SYNC_LIMIT = process.env.SYNC_LIMIT === undefined
  ? 0
  : Number(process.env.SYNC_LIMIT);
export const ZIYUANZU_SITEMAP = 'https://www.ziyuanzu.com/sitemap-sources.xml';
export const INCLUDE_DEFUNCT = process.env.INCLUDE_DEFUNCT === '1';

export function shanghaiDate(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

export function shanghaiStamp(d = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(d);
  const get = (t) => parts.find((p) => p.type === t)?.value || '00';
  return `${get('year')}${get('month')}${get('day')}_${get('hour')}${get('minute')}${get('second')}`;
}

export function shanghaiDateTime(d = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(d).replace('T', ' ');
}

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export function readData() {
  return JSON.parse(readFileSync(DATA_PATH, 'utf8'));
}

export function writeData(data) {
  writeFileSync(DATA_PATH, `${JSON.stringify(data, null, 1)}\n`, 'utf8');
}

export function ensureDataDirs() {
  mkdirSync(ARCHIVE_DIR, { recursive: true });
}

export function buildProbeUrl(apiUrl, cmsMeta) {
  // Non-MacCMS JSON endpoints are probed as-is
  if (/\.php(?:$|\?)/i.test(apiUrl) && !/provide\/vod|api\.php\/provide/i.test(apiUrl)) {
    return apiUrl.replace(/\/$/, '');
  }
  const param = cmsMeta?.param;
  if (!param) return apiUrl;
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

export function extractTotal(body) {
  if (!body || typeof body !== 'object') return null;
  const candidates = [
    body.total,
    body.pagecount && body.limit ? Number(body.pagecount) * Number(body.limit) : null,
    body.data?.total,
    Array.isArray(body.list) ? body.list.length : null,
  ];
  for (const n of candidates) {
    const v = Number(n);
    if (Number.isFinite(v) && v >= 0) return Math.round(v);
  }
  return null;
}

export function looksOk(status, text) {
  if (status < 200 || status >= 300) return false;
  const trimmed = (text || '').trim();
  if (!trimmed) return false;
  try {
    const json = JSON.parse(trimmed);
    if (json && typeof json === 'object') return true;
  } catch {
    if (trimmed.length > 32 && (trimmed.startsWith('<') || trimmed.includes('<'))) return true;
  }
  return false;
}

export async function probe(url) {
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

export function upsertHistory(history, entry) {
  const list = Array.isArray(history) ? [...history] : [];
  const idx = list.findIndex((h) => h.date === entry.date);
  if (idx >= 0) list[idx] = entry;
  else list.push(entry);
  list.sort((a, b) => a.date.localeCompare(b.date));
  return list.slice(-HISTORY_LIMIT);
}

export function normalizeApi(url) {
  try {
    const u = new URL(url.trim());
    u.hash = '';
    let path = u.pathname;
    // keep .php endpoints without forced trailing slash
    if (!/\.php$/i.test(path) && !path.endsWith('/')) path += '/';
    if (/\.php\/$/i.test(path)) path = path.slice(0, -1);
    return `${u.origin}${path}${u.search}`;
  } catch {
    return url.trim();
  }
}

export function domainOf(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

export function pruneArchives(keep = ARCHIVE_KEEP) {
  ensureDataDirs();
  const files = readdirSync(ARCHIVE_DIR)
    .filter((f) => /^monitor_\d{8}_\d{6}\.json$/.test(f))
    .sort();
  const extra = files.length - keep;
  for (let i = 0; i < extra; i++) {
    unlinkSync(join(ARCHIVE_DIR, files[i]));
  }
}

export function writeSnapshot(snapshot) {
  ensureDataDirs();
  writeFileSync(LATEST_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  const name = `monitor_${shanghaiStamp()}.json`;
  writeFileSync(join(ARCHIVE_DIR, name), `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  pruneArchives();
  return name;
}
