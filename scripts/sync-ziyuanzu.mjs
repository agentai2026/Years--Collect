#!/usr/bin/env node
/**
 * Automation #2 — sync collect APIs from ziyuanzu.com
 */
import {
  GAP_MS,
  INCLUDE_DEFUNCT,
  SYNC_LIMIT,
  ZIYUANZU_SITEMAP,
  sleep,
} from './lib.mjs';
import { extractApisFromHtml, fetchText, mergeEntries, preferCollectApi } from './catalog.mjs';

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

function parseSourceUrls(sitemapXml) {
  return [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1].trim())
    .filter((u) => {
      if (/\/source\/defunct\//i.test(u)) return INCLUDE_DEFUNCT;
      return /\/source\/[a-zA-Z0-9\-]+\/?$/.test(u);
    });
}

async function main() {
  if (process.env.SKIP_SYNC === '1') {
    console.log('SKIP_SYNC=1');
    return;
  }
  const limitLabel = SYNC_LIMIT > 0 ? SYNC_LIMIT : 'all';
  console.log(`Sync #2 ziyuanzu.com · limit=${limitLabel}`);
  const sitemap = await fetchText(ZIYUANZU_SITEMAP);
  const sourceUrls = parseSourceUrls(sitemap);
  const picked = SYNC_LIMIT > 0 ? sourceUrls.slice(0, SYNC_LIMIT) : sourceUrls;
  console.log(`active sources: ${sourceUrls.length}, picking ${picked.length}`);

  const entries = [];
  let skip = 0;
  let fail = 0;
  for (let i = 0; i < picked.length; i++) {
    const pageUrl = picked[i];
    const slug = slugFromUrl(pageUrl);
    try {
      const html = await fetchText(pageUrl);
      const api = preferCollectApi(extractApisFromHtml(html));
      if (!api) {
        skip += 1;
        console.log(`  skip ${slug} (no api)`);
      } else {
        const name = nameFromPage(html, slug);
        entries.push({
          id: `zy-${slug}`,
          name,
          api,
          site: pageUrl,
          source: 'ziyuanzu.com',
          contributor: '@ziyuanzu',
        });
        console.log(`  ok   ${slug} -> ${api}`);
      }
    } catch (err) {
      fail += 1;
      console.log(`  fail ${slug}: ${err.message}`);
    }
    if (i < picked.length - 1) await sleep(GAP_MS);
  }

  const result = mergeEntries(entries);
  console.log(
    `ziyuanzu done · ok=${entries.length} skip=${skip} fail=${fail} `
    + `added=${result.added} updated=${result.updated} total=${result.total}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
