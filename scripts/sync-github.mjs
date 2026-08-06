#!/usr/bin/env node
/**
 * Automation #3 — discover collect APIs from public GitHub code search
 * Requires GITHUB_TOKEN (Actions provides one automatically).
 */
import { createHash } from 'node:crypto';
import { GAP_MS, sleep } from './lib.mjs';
import { mergeEntries, preferCollectApi } from './catalog.mjs';

const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const LIMIT = Number(process.env.GITHUB_SYNC_LIMIT || 40);
const QUERIES = [
  '"api.php/provide/vod"',
  '"provide/vod/" extension:json',
  '"provide/vod" maccms',
];

async function gh(path) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'Years-Collect-SignalDesk',
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub API ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

function extractFromText(text) {
  const found = [...text.matchAll(/https?:\/\/[a-zA-Z0-9.\-_/]+(?:api\.php[^\s"'<>\\]*|provide\/vod[^\s"'<>\\]*)/gi)]
    .map((m) => m[0].replace(/[),.;\\]+$/, ''));
  return found;
}

function idFor(api) {
  const h = createHash('sha1').update(api).digest('hex').slice(0, 10);
  return `gh-${h}`;
}

async function main() {
  console.log(`Sync #3 GitHub · limit=${LIMIT} token=${TOKEN ? 'yes' : 'no'}`);
  if (!TOKEN) {
    console.warn('No GITHUB_TOKEN — code search may be rate-limited or forbidden.');
  }

  const items = [];
  const seenHtml = new Set();
  for (const q of QUERIES) {
    try {
      const data = await gh(`/search/code?q=${encodeURIComponent(q)}&per_page=30`);
      console.log(`query "${q}" -> ${data.total_count || 0} hits, got ${(data.items || []).length}`);
      for (const it of data.items || []) {
        const key = it.html_url;
        if (seenHtml.has(key)) continue;
        seenHtml.add(key);
        items.push(it);
      }
    } catch (err) {
      console.log(`  search fail: ${err.message}`);
    }
    await sleep(1200);
  }

  const entries = [];
  const seenApi = new Set();
  for (let i = 0; i < items.length && entries.length < LIMIT; i++) {
    const it = items[i];
    try {
      // Prefer raw download when available via git_url / or contents API
      const repo = it.repository?.full_name;
      const path = it.path;
      if (!repo || !path) continue;
      const content = await gh(
        `/repos/${repo}/contents/${path.split('/').map(encodeURIComponent).join('/')}`,
      );
      let text = '';
      if (content.content && content.encoding === 'base64') {
        text = Buffer.from(content.content, 'base64').toString('utf8');
      } else if (content.download_url) {
        text = await fetch(content.download_url).then((r) => r.text());
      }
      // also use text_matches snippets if present
      const snippet = (it.text_matches || []).map((m) => m.fragment || '').join('\n');
      const api = preferCollectApi([...extractFromText(text), ...extractFromText(snippet)]);
      if (!api || seenApi.has(api)) continue;
      seenApi.add(api);
      entries.push({
        id: idFor(api),
        name: (it.name || repo || 'github-source').replace(/\.[^.]+$/, '').slice(0, 32),
        api,
        site: it.html_url || `https://github.com/${repo}`,
        source: 'github',
        contributor: `@${it.repository?.owner?.login || 'github'}`,
      });
      console.log(`  ok   ${repo} -> ${api}`);
    } catch (err) {
      console.log(`  fail ${it.repository?.full_name || '?'}: ${err.message}`);
    }
    await sleep(GAP_MS + 400);
  }

  const result = mergeEntries(entries);
  console.log(
    `github done · candidates=${items.length} ok=${entries.length} `
    + `added=${result.added} updated=${result.updated} total=${result.total}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
