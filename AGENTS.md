# AGENTS.md

Guidance for coding agents working on Years--Collect.

## Layout

| Path | Role |
|------|------|
| `docs/` | **Pages** — static site + `docs/data.json` (GitHub Pages `/docs`) |
| `scripts/` | **Automation** — `sync.mjs`, `monitor.mjs`, shared `lib.mjs` |
| `.github/workflows/` | **Automation** — scheduled probe / commit |
| `data/` | **Probe snapshots** — `latest.json`, `archives/` |
| `mcp/` | **MCP** — `mcp_server.mjs`, `mcp.json` |

## Do

- Keep the frontend driven by `docs/data.json` (`apis[].history` daily samples).
- Write run archives only under `data/`.
- Prefer Node built-ins for monitor/sync; keep `SYNC_LIMIT` modest.

## Don't

- Don't put HTML outside `docs/` (Pages source is `/docs`).
- Don't commit secrets.
- Don't scrape more than `SYNC_LIMIT` without raising the workflow timeout.

## Commands

```bash
npx --yes serve -p 8080 docs
node scripts/sync.mjs
node scripts/monitor.mjs
node mcp/mcp_server.mjs
```
