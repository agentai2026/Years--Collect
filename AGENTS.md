# AGENTS.md

## Automations (5)

1. `sync-yszzq.mjs` ← yszzq.com API pages  
2. `sync-ziyuanzu.mjs` ← ziyuanzu.com active sources  
3. `sync-github.mjs` ← GitHub code search (`GH_SEARCH_TOKEN` recommended)  
4. `monitor.mjs` ← health probe + archives  
5. `classify.mjs` ← categories / CMS type  

Shared merge helpers: `scripts/catalog.mjs`  
Shared HTTP/history helpers: `scripts/lib.mjs`  
Catalog path: `docs/catalog.json`

## Do

- Keep frontend reading `docs/catalog.json`.
- Prefer upsert-by-API-URL when merging sources.
- Keep Actions schedules staggered to reduce push conflicts.

## Commands

```bash
node scripts/sync-yszzq.mjs
node scripts/sync-ziyuanzu.mjs
node scripts/sync-github.mjs
node scripts/monitor.mjs
node scripts/classify.mjs
```
