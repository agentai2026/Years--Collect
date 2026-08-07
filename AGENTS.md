# Years--Collect agent notes

- Catalog **source of truth**: `docs/catalog.json` (same as legacy).
- Astro serves a mirror at `public/collect-assets/catalog.json`; `scripts/lib.mjs` `writeData()` syncs it.
- Do not point automation at `public/` as the primary write path.
- Site base on GitHub Pages: `/Years--Collect/` when `GITHUB_PAGES=1`.
- Details: `COLLECT.md`, `README.md`.
