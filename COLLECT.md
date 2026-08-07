# 采集模块速查

## 分工

| 类别 | 目录 | 你改什么 |
| --- | --- | --- |
| **页面** | `src/pages/collect/`、`src/layouts/CollectDeskLayout.astro`、`src/config/collectPageConfig.ts` | 六宫格、监控台壳、入口文案 |
| **前台静态** | `public/collect-assets/`（`desk.js` / `style.css` / catalog 镜像） | 监控台交互与样式 |
| **自动化** | `scripts/{sync-*,classify,monitor,lib,catalog}.mjs`、`mcp/`、`.github/workflows/collect-*.yml` | 入库、分类、巡检、定时任务 |
| **数据** | **`docs/catalog.json`**（真源）、`data/`（快照） | 一般由脚本写，不要手改路径 |

## 数据流

```
多源同步 / 巡检脚本
        ↓
  docs/catalog.json          ← 唯一真源（与旧仓库相同）
        ↓ writeData 自动同步
  public/collect-assets/catalog.json
        ↓ 浏览器 fetch
  /collect/desk/ 监控台页面
```

## 命令

```bash
pnpm collect:yszzq
pnpm collect:ziyuanzu
pnpm collect:github
pnpm collect:classify
pnpm collect:health
pnpm collect:mcp
node scripts/verify-collect.mjs
```

## GitHub Actions

- `collect-maintenance.yml` → 写 `docs/catalog.json` + 同步 public 镜像 + `data/`
- `collect-health.yml` → 同上（巡检）
- `pages.yml` → 校验 docs → 同步 public → `pnpm build` → 发布

Pages 项目站 base：`/Years--Collect/`（`GITHUB_PAGES=1`）。
