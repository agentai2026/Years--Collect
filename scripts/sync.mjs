#!/usr/bin/env node
/**
 * Sync collect APIs from ziyuanzu.com sitemap into data.json.
 * Caps at SYNC_LIMIT (default 60) to keep Actions runtime reasonable.
 */
import {
  DATA_PATH,
  GAP_MS,
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
    .filter((u) => /\/source\/[a-zA-Z0-9\-]+\/?$/.test(u));
}

function slugFromUrl(url) {
  const m = url.match(/\/source\/([a-zA-Z0-9\-]+)\/?$/);
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
  const found = [...html.matchAll(/https?:\/\/[a-zA-Z0-9.\-_/]+(?:api\.php[^\s"'<>]*|provide\/vod[^\s"'<>]*)/gi)]
    .map((m) => m[0].replace(/[),.;]+$/, ''));
  const uniq = [];
  const seen = new Set();
  for (const raw of found) {
    if (/example\.com/i.test(raw)) continue;
    const n = normalizeApi(raw);
    if (seen.has(n)) continue;
    seen.add(n);
    uniq.push(n);
  }
  return uniq;
}

function blankHistory() {
  return [];
}

function makeApiEntry({ id, name, api, site, source }) {
  return {
    id,
    name,
    cms: 'maccms10',
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
    history: blankHistory(),
  };
}

async function main() {
  if (process.env.SKIP_SYNC === '1') {
    console.log('SKIP_SYNC=1 · sync skipped');
    return;
  }

  console.log(`Sync ziyuanzu sources · limit=${SYNC_LIMIT}`);
  const sitemap = await fetchText(ZIYUANZU_SITEMAP);
  const sourceUrls = parseSourceUrls(sitemap);
  console.log(`sitemap sources: ${sourceUrls.length}`);

  const picked = sourceUrls.slice(0, Math.max(1, SYNC_LIMIT));
  const synced = [];

  for (let i = 0; i < picked.length; i++) {
    const pageUrl = picked[i];
    const slug = slugFromUrl(pageUrl);
    try {
      const html = await fetchText(pageUrl);
      const apis = extractApis(html);
      if (!apis.length) {
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
      console.log(`  fail ${slug}: ${err.message}`);
    }
    if (i < picked.length - 1) await sleep(GAP_MS);
  }

  const data = readData();
  const byApi = new Map(data.apis.map((a) => [normalizeApi(a.api), a]));
  const byId = new Map(data.apis.map((a) => [a.id, a]));
  let added = 0;
  let updated = 0;

  // Drop demo example.com entries once we have real sync data
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
  console.log(`sync done · added=${added} updated=${updated} total=${data.apis.length} -> ${DATA_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
