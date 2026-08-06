/**
 * Shared catalog merge helpers for docs/catalog.json
 */
import {
  DATA_PATH,
  domainOf,
  normalizeApi,
  readData,
  writeData,
} from './lib.mjs';

export function ensureCms(data) {
  if (!Array.isArray(data.cms)) data.cms = [];
  const need = [
    {
      type: '通用 JSON API',
      code: 'jsonapi',
      param: '',
      tip: '直接使用接口地址，按站点文档接入',
    },
  ];
  for (const c of need) {
    if (!data.cms.some((x) => x.code === c.code)) data.cms.push(c);
  }
}

export function guessCms(api) {
  if (/provide\/vod/i.test(api)) return 'maccms10';
  if (/json\.php/i.test(api)) return 'jsonapi';
  return 'maccms10';
}

export function makeApiEntry({ id, name, api, site = '', source = '', contributor = '', cms }) {
  return {
    id,
    name,
    cms: cms || guessCms(api),
    contributor: contributor || `@${source || 'sync'}`,
    api,
    domain: domainOf(api),
    site,
    source,
    http: 0,
    total: 0,
    tags: [],
    categories: [],
    restricted: false,
    note: source ? `synced from ${source}` : '',
    history: [],
  };
}

export function preferCollectApi(apis) {
  const list = [...new Set(apis.map(normalizeApi))]
    .filter((a) => a && !/localhost|127\.0\.0\.1|example\.com|yszzq\.com|ziyuanzu\.com/i.test(a));
  list.sort((a, b) => score(b) - score(a));
  return list[0] || null;
}

function score(u) {
  let s = 0;
  if (/provide\/vod\/?$/i.test(u.replace(/\/$/, ''))) s += 14;
  if (/provide\/vod\/?\?ac=list/i.test(u)) s += 13;
  if (/\/at\/jos?n\/?/i.test(u)) s += 12;
  if (/provide\/vod/i.test(u) && !/from\//i.test(u) && !/\/at\/xml/i.test(u)) s += 8;
  if (/\/at\/xml/i.test(u)) s -= 2;
  if (/from\//i.test(u)) s -= 4;
  if (/^http:\/\//i.test(u)) s -= 1;
  return s;
}

/**
 * Upsert entries into catalog. Returns {added, updated, total}.
 */
export function mergeEntries(entries, { dropDemo = true } = {}) {
  const data = readData();
  ensureCms(data);
  if (dropDemo) {
    data.apis = data.apis.filter((a) => !/example-\d+\.com|api\.example\.com/i.test(a.api));
  }
  const byApi = new Map(data.apis.map((a) => [normalizeApi(a.api), a]));
  const byId = new Map(data.apis.map((a) => [a.id, a]));
  let added = 0;
  let updated = 0;

  for (const item of entries) {
    const key = normalizeApi(item.api);
    if (!key) continue;
    const existing = byApi.get(key) || byId.get(item.id);
    if (existing) {
      existing.name = item.name || existing.name;
      existing.api = key;
      existing.domain = domainOf(key);
      if (item.site) existing.site = item.site;
      if (item.source) existing.source = item.source;
      if (item.cms) existing.cms = item.cms;
      else existing.cms = guessCms(key);
      if (item.contributor) existing.contributor = item.contributor;
      if (Array.isArray(item.categories) && item.categories.length) {
        existing.categories = item.categories;
      }
      if (Array.isArray(item.tags) && item.tags.length) existing.tags = item.tags;
      updated += 1;
    } else {
      const entry = makeApiEntry({ ...item, api: key });
      if (Array.isArray(item.categories)) entry.categories = item.categories;
      if (Array.isArray(item.tags)) entry.tags = item.tags;
      data.apis.push(entry);
      byApi.set(key, entry);
      byId.set(entry.id, entry);
      added += 1;
    }
  }

  writeData(data);
  return { added, updated, total: data.apis.length, path: DATA_PATH };
}

export async function fetchText(url, { accept = 'text/html,application/xml,*/*' } = {}) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Years-Collect-SignalDesk/1.0 (+https://github.com/agentai2026/Years--Collect)',
      Accept: accept,
    },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

export function extractApisFromHtml(html) {
  const patterns = [
    /https?:\/\/[a-zA-Z0-9.\-_/]+(?:api\.php[^\s"'<>]*|provide\/vod[^\s"'<>]*)/gi,
    /https?:\/\/[a-zA-Z0-9.\-_/]+\/api\/json\.php[^\s"'<>]*/gi,
  ];
  const found = [];
  for (const re of patterns) {
    for (const m of html.matchAll(re)) found.push(m[0].replace(/[),.;]+$/, ''));
  }
  return [...new Set(found.map(normalizeApi))];
}
