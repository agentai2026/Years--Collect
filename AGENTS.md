# Years--Collect agent notes

## 分类（改代码前先对号）

1. **页面** → `src/pages`、`src/layouts`、`src/components`、`src/config`
2. **前台静态** → `public/collect-assets`
3. **自动化** → `scripts`（sync/classify/monitor/lib）、`mcp`、`.github/workflows/collect-*`
4. **数据真源** → `docs/catalog.json`（禁止把自动化主写路径改成 `public/`）
5. **发布** → `.github/workflows/pages.yml` → `dist/`

## 硬规则

- Catalog **source of truth**: `docs/catalog.json`
- `scripts/lib.mjs` `writeData()` 会同步镜像到 `public/collect-assets/catalog.json`
- GitHub Pages base：`/Years--Collect/` when `GITHUB_PAGES=1`
- 站内链接用 `url()`（`src/utils/url-utils.ts`），不要写死根路径 `/collect/...`

详见 `README.md`、`COLLECT.md`。
