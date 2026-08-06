#!/usr/bin/env node
/**
 * Sync collect APIs from ziyuanzu.com sitemap into docs/data.json.
 * By default syncs ALL active (/source/<slug>) pages; skips /source/defunct/*.
 * SYNC_LIMIT>0 caps the count; INCLUDE_DEFUNCT=1 also pulls defunct pages.
 */
import {
  DATA_PATH,
  GAP_MS,
  INCLUDE_DEFUNCT,
  SYNC_LIMIT,
  ZIYUANZU_SITEMAP,
  domainOf,
  normalizeApi,
  readData,
  sleep,
  writeData,
} from './lib.mjs';

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Years-Collect-SignalDesk/1.0 (+https://github.com/agentai2026/Years--Collect)',
      Accept: 'text/html,application/xml,*/*',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function parseSourceUrls(sitemapXml) {
  return [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1].trim())
    .filter((u) => {
      if (/\/source\/defunct\//i.test(u)) return INCLUDE_DEFUNCT;
      return /\/source\/[a-zA-Z0-9\-]+\/?$/.test(u);
    });
}

function slugFromUrl(url) {
  const m = url.match(/\/source\/(?:defunct\/)?([a-zA-Z0-9\-]+)\/?$/);
  return m ? m[1] : `src-${Date.now()}`;
}

function nameFromPage(html, slug) {
  const h1 = (html.match(/<h1[^>]*>([^<]+)<\/h1>/i) || [])[1];
  if (h1) return h1.split(/[-—|]/)[0].trim().slice(0, 32);
  const title = (html.match(/<title>([^<]+)<\/title>/i) || [])[1];
  if (title) return title.split(/[_\-—|]/)[0].trim().slice(0, 32);
  return slug;
}

function extractApis(html) {
  const patterns = [
    /https?:\/\/[a-zA-Z0-9.\-_/]+(?:api\.php[^\s"'<>]*|provide\/vod[^\s"'<>]*)/gi,
    /https?:\/\/[a-zA-Z0-9.\-_/]+\/api\/json\.php[^\s"'<>]*/gi,
    /https?:\/\/[a-zA-Z0-9.\-_/]+\/api\.php[^\s"'<>]*/gi,
  ];
  const found = [];
  for (const re of patterns) {
    for (const m of html.matchAll(re)) found.push(m[0].replace(/[),.;]+$/, ''));
  }
  const uniq = [];
  const seen = new Set();
  for (const raw of found) {
    if (/example\.com|ziyuanzu\.com/i.test(raw)) continue;
    const n = normalizeApi(raw);
    if (seen.has(n)) continue;
    seen.add(n);
    uniq.push(n);
  }
  // Prefer MacCMS provide/vod style when multiple candidates exist
  uniq.sort((a, b) => {
    const score = (u) => (/provide\/vod/i.test(u) ? 0 : /api\.php/i.test(u) ? 1 : 2);
    return score(a) - score(b);
  });
  return uniq;
}

function guessCms(api) {
  if (/provide\/vod/i.test(api)) return 'maccms10';
  if (/json\.php/i.test(api)) return 'jsonapi';
  return 'maccms10';
}

function ensureCms(data) {
  if (!Array.isArray(data.cms)) data.cms = [];
  if (!data.cms.some((c) => c.code === 'jsonapi')) {
    data.cms.push({
      type: '通用 JSON API',
      code: 'jsonapi',
      param: '',
      tip: '直接使用接口地址，按站点文档接入',
    });
  }
}

function makeApiEntry({ id, name, api, site, source }) {
  return {
    id,
    name,
    cms: guessCms(api),
    contributor: '@ziyuanzu',
    api,
    domain: domainOf(api),
    site,
    source,
    http: 0,
    total: 0,
    tags: [],
    categories: [],
    restricted: false,
    note: 'synced from ziyuanzu.com',
    history: [],
  };
}

async function main() {
  if (process.env.SKIP_SYNC === '1') {
    console.log('SKIP_SYNC=1 · sync skipped');
    return;
  }

  const limitLabel = SYNC_LIMIT > 0 ? SYNC_LIMIT : 'all';
  console.log(`Sync ziyuanzu sources · limit=${limitLabel} defunct=${INCLUDE_DEFUNCT ? 'yes' : 'no'}`);
  const sitemap = await fetchText(ZIYUANZU_SITEMAP);
  const sourceUrls = parseSourceUrls(sitemap);
  console.log(`sitemap active sources: ${sourceUrls.length}`);

  const picked = SYNC_LIMIT > 0 ? sourceUrls.slice(0, SYNC_LIMIT) : sourceUrls;
  const synced = [];
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < picked.length; i++) {
    const pageUrl = picked[i];
    const slug = slugFromUrl(pageUrl);
    try {
      const html = await fetchText(pageUrl);
      const apis = extractApis(html);
      if (!apis.length) {
        skipped += 1;
        console.log(`  skip ${slug} (no api)`);
      } else {
        const api = apis[0];
        const name = nameFromPage(html, slug);
        synced.push({
          id: `zy-${slug}`,
          name,
          api,
          site: pageUrl,
          source: 'ziyuanzu.com',
        });
        console.log(`  ok   ${slug} -> ${api}`);
      }
    } catch (err) {
      failed += 1;
      console.log(`  fail ${slug}: ${err.message}`);
    }
    if (i < picked.length - 1) await sleep(GAP_MS);
  }

  const data = readData();
  ensureCms(data);
  const byApi = new Map(data.apis.map((a) => [normalizeApi(a.api), a]));
  const byId = new Map(data.apis.map((a) => [a.id, a]));
  let added = 0;
  let updated = 0;

  if (synced.length) {
    const before = data.apis.length;
    data.apis = data.apis.filter((a) => !/example-\d+\.com|api\.example\.com/i.test(a.api));
    if (data.apis.length !== before) {
      console.log(`removed demo endpoints: ${before - data.apis.length}`);
    }
  }

  for (const item of synced) {
    const key = normalizeApi(item.api);
    const existing = byApi.get(key) || byId.get(item.id);
    if (existing) {
      existing.name = item.name;
      existing.api = key;
      existing.domain = domainOf(key);
      existing.site = item.site;
      existing.source = item.source;
      existing.cms = guessCms(key);
      if (!existing.contributor) existing.contributor = '@ziyuanzu';
      updated += 1;
    } else {
      const entry = makeApiEntry({ ...item, api: key });
      data.apis.push(entry);
      byApi.set(key, entry);
      byId.set(entry.id, entry);
      added += 1;
    }
  }

  writeData(data);
  console.log(
    `sync done · pages=${picked.length} ok=${synced.length} skip=${skipped} fail=${failed} `
    + `added=${added} updated=${updated} total=${data.apis.length} -> ${DATA_PATH}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
