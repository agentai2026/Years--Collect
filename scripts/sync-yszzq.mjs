#!/usr/bin/env node
/**
 * Automation #1 — sync collect APIs from yszzq.com (影视站长圈)
 */
import { GAP_MS, INCLUDE_DEFUNCT, sleep } from './lib.mjs';
import { extractApisFromHtml, fetchText, mergeEntries, preferCollectApi } from './catalog.mjs';

const SITEMAP = 'https://www.yszzq.com/sitemap/sitemap.xml';
const LIMIT = Number(process.env.YSZZQ_LIMIT || 0); // 0 = all api pages

function nameFromTitle(title, fallback) {
  if (!title) return fallback;
  return title
    .replace(/_?采集接口.*$/i, '')
    .replace(/大全.*$/i, '')
    .replace(/\s*-\s*影视站长圈.*$/i, '')
    .trim()
    .slice(0, 32) || fallback;
}

async function main() {
  console.log('Sync #1 yszzq.com');
  const sm = await fetchText(SITEMAP);
  let pages = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1].trim())
    .filter((u) => /\/ziyuan\/api\/\d+\.html$/i.test(u));
  console.log(`api detail pages: ${pages.length}`);
  if (LIMIT > 0) pages = pages.slice(0, LIMIT);

  const entries = [];
  let skip = 0;
  let fail = 0;
  for (let i = 0; i < pages.length; i++) {
    const pageUrl = pages[i];
    const idNum = (pageUrl.match(/\/(\d+)\.html$/i) || [])[1] || String(i);
    try {
      const html = await fetchText(pageUrl);
      const title = (html.match(/<title>([^<]+)<\/title>/i) || [])[1];
      const api = preferCollectApi(extractApisFromHtml(html));
      if (!api) {
        skip += 1;
        console.log(`  skip ys-${idNum} (no api)`);
      } else {
        const name = nameFromTitle(title, `yszzq-${idNum}`);
        entries.push({
          id: `ys-${idNum}`,
          name,
          api,
          site: pageUrl,
          source: 'yszzq.com',
          contributor: '@yszzq',
        });
        console.log(`  ok   ys-${idNum} ${name} -> ${api}`);
      }
    } catch (err) {
      fail += 1;
      console.log(`  fail ys-${idNum}: ${err.message}`);
    }
    if (i < pages.length - 1) await sleep(GAP_MS);
  }

  const result = mergeEntries(entries);
  console.log(
    `yszzq done · pages=${pages.length} ok=${entries.length} skip=${skip} fail=${fail} `
    + `added=${result.added} updated=${result.updated} total=${result.total}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
