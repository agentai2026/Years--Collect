# 采集站信号台 · Years--Collect

纯静态的采集接口监控目录：多源自动同步、可用性探测、分类识别、历史快照，并提供 MCP 查询。

## 五条自动化

| # | 工作流 | 脚本 | 作用 | 默认频率 |
|---|--------|------|------|----------|
| 1 | [1 - Sync yszzq.com](https://github.com/agentai2026/Years--Collect/actions/workflows/sync-yszzq.yml) | `scripts/sync-yszzq.mjs` | 从 [yszzq.com](https://www.yszzq.com/) 采集接口页入库 | 每 6 小时 |
| 2 | [2 - Sync ziyuanzu.com](https://github.com/agentai2026/Years--Collect/actions/workflows/sync-ziyuanzu.yml) | `scripts/sync-ziyuanzu.mjs` | 从 [ziyuanzu.com](https://www.ziyuanzu.com/) 活跃源站入库 | 每 6 小时 |
| 3 | [3 - Sync GitHub sources](https://github.com/agentai2026/Years--Collect/actions/workflows/sync-github.yml) | `scripts/sync-github.mjs` | 在 GitHub 代码里搜索 `provide/vod` 等接口并入库 | 每天 |
| 4 | [4 - Health probe](https://github.com/agentai2026/Years--Collect/actions/workflows/health-probe.yml) | `scripts/monitor.mjs` | 检测本项目全部接口是否可用，写 30 日 history + 归档 | 每 2 小时 |
| 5 | [5 - Classify categories](https://github.com/agentai2026/Years--Collect/actions/workflows/classify-categories.yml) | `scripts/classify.mjs` | 探测各站类型，拉取 `class` 分类写入 `categories`/`tags` | 每 6 小时 |
| 6 | [Deploy Pages](https://github.com/agentai2026/Years--Collect/actions/workflows/pages.yml) | — | 发布 `docs/` 到 GitHub Pages | 文档变更 / 上列成功后自动 |

均可在 Actions 里手动 **Run workflow**。

### GitHub 搜索说明（第 3 条）

跨仓库代码搜索建议在仓库 Secrets 里配置 `GH_SEARCH_TOKEN`（classic PAT，勾选 `public_repo`）。未配置时会回退到 `github.token`，可能搜不到全站代码。

## 在线访问

https://agentai2026.github.io/Years--Collect/

站点由 [Deploy Pages](https://github.com/agentai2026/Years--Collect/actions/workflows/pages.yml) 发布（GitHub Actions，不是旧版 Jekyll）。  
同步 / 巡检 / 分类工作流成功后会自动再部署；部署前会校验 `docs/catalog.json` 可读。

## 目录说明

| 路径 | 分类 |
|------|------|
| `docs/` | 页面 + `catalog.json` |
| `scripts/` | 自动化脚本 |
| `.github/workflows/` | 五条 Actions |
| `data/` | 巡检快照 `latest.json` / `archives/` |
| `mcp/` | MCP 查询服务 |

## 本地命令

```bash
npx --yes serve -p 8080 docs

node scripts/sync-yszzq.mjs
node scripts/sync-ziyuanzu.mjs
node scripts/sync-github.mjs
node scripts/monitor.mjs
node scripts/classify.mjs
```

## 投稿

- [新接口投稿](https://github.com/agentai2026/Years--Collect/issues/new?template=submit.md)
- [接口失效报障](https://github.com/agentai2026/Years--Collect/issues/new?template=bug.md)

## 免责声明

本项目为第三方开源监测与目录工具；同步自各公开站点 / GitHub 的数据仅供学习与技术交流，请自行确认接口授权与内容合规。

## License

MIT
