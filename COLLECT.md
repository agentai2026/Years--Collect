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
pnpm collect:articles   # 文章摘要 → src/content/posts/
pnpm collect:mcp
node scripts/verify-collect.mjs
```

## GitHub Actions（页面----功能）

- `影视源页面----同步入库` — 每 6 小时抓影视接口并分类
- `影视源页面----在线巡检` — 每 2 小时测接口是否在线
- `文章页面----采集发布` — 每天采 WinDiscover / CoderNav / 吾爱技术向，**尽量转载全文**到文章页（采不全时保留原文链接）
- `全站页面----发布上线` — 把网站重新打包发上网

Pages 项目站 base：`/Years--Collect/`（`GITHUB_PAGES=1`）。
