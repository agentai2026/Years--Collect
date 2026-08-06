#!/usr/bin/env node
/**
 * Probe every API in data.json, update 30-day history, and write run archives.
 */
import {
  GAP_MS,
  buildProbeUrl,
  probe,
  readData,
  shanghaiDate,
  shanghaiDateTime,
  sleep,
  upsertHistory,
  writeData,
  writeSnapshot,
} from './lib.mjs';

async function main() {
  const data = readData();
  const today = shanghaiDate();
  const timestamp = shanghaiDateTime();
  const cmsByCode = new Map((data.cms || []).map((c) => [c.code, c]));

  let online = 0;
  let offline = 0;
  const failures = [];
  const resources = [];

  console.log(`Signal desk monitor · ${timestamp} · ${data.apis.length} endpoints`);

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

    const health = {
      url,
      status_code: result.http || null,
      response_time_ms: result.ok ? result.ms : result.ms,
      is_alive: result.ok,
      error: result.error,
    };

    resources.push({
      id: api.id,
      name: api.name,
      link: api.api,
      site: api.site || '',
      description: api.note || api.source || '',
      cms: api.cms,
      total: api.total,
      uptime: api.history.length
        ? `${((api.history.filter((h) => h.ok).length / api.history.length) * 100).toFixed(1)}%`
        : '-',
      health,
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
  writeData(data);

  const snapshot = {
    timestamp,
    source: data.repo || 'https://github.com/agentai2026/Years--Collect',
    resources,
    stats: {
      total: resources.length,
      alive: online,
      offline,
      online_rate: resources.length ? Number(((online / resources.length) * 100).toFixed(1)) : 0,
    },
  };
  const archiveName = writeSnapshot(snapshot);

  console.log(`\nSummary: online=${online} offline=${offline} updated=${today}`);
  console.log(`Snapshot: data/latest.json + data/archives/${archiveName}`);
  if (failures.length) {
    console.log('Failures:');
    for (const line of failures) console.log(`  - ${line}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
