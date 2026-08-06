# AGENTS.md

Guidance for coding agents working on Years--Collect.

## Project shape

- Static site at repo root (`index.html`, `app.js`, `style.css`, pages).
- Canonical catalog + 30-day history: `data.json`.
- Run snapshots: `data/latest.json` and `data/archives/monitor_*.json`.
- Monitor pipeline: `scripts/sync.mjs` → `scripts/monitor.mjs` via `.github/workflows/monitor.yml`.

## Do

- Keep the frontend driven by `data.json` (`apis[].history` daily samples).
- When changing probe logic, update both `scripts/lib.mjs` helpers and archive shape in `monitor.mjs`.
- Prefer Node built-ins; avoid adding runtime dependencies for the monitor path.
- Keep `SYNC_LIMIT` modest (default 60) so Actions stay under timeout.

## Don't

- Don't regenerate the whole UI from the monitor script (pages are hand-authored).
- Don't commit secrets.
- Don't scrape more than `SYNC_LIMIT` sources unless the workflow timeout is raised.

## Common commands

```bash
node scripts/sync.mjs
node scripts/monitor.mjs
node mcp_server.mjs
```

## Data notes

- Synced entries use ids like `zy-<slug>` and `contributor: @ziyuanzu`.
- Demo `api.example-*.com` rows are removed after a successful sync.
- Archives prune to `ARCHIVE_KEEP` (default 120).
