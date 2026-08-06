# 采集站信号台 · Years--Collect

纯静态的采集接口监控目录：多源自动同步、可用性探测、分类识别、历史快照，并提供 MCP 查询。

## 自动化工作流

| 工作流 | 脚本 / 入口 | 作用 | 默认频率 |
|--------|-------------|------|----------|
| [Collect maintenance](https://github.com/agentai2026/Years--Collect/actions/workflows/collect-maintenance.yml) | `sync-yszzq` / `sync-ziyuanzu` / `sync-github` / `classify` | 多源入库 + 分类；手动 Run 时选 `task` | 每 6 小时（定时跑 yszzq / ziyuanzu / github / classify） |
| [Health probe](https://github.com/agentai2026/Years--Collect/actions/workflows/collect-health.yml) | `scripts/monitor.mjs` | 探测接口可用性，写 history + 归档 | 每 2 小时 |
| [Deploy Pages](https://github.com/agentai2026/Years--Collect/actions/workflows/pages.yml) | — | 发布 `docs/` 到 GitHub Pages | 文档变更 / 上列成功后自动 |

均可在 Actions 里手动 **Run workflow**（maintenance 需选择 `task`：`yszzq` / `ziyuanzu` / `github` / `classify` / `health`）。

### GitHub 搜索说明（maintenance → github）

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
| `.github/workflows/` | Collect maintenance / Health / Pages |
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

- [新接口投稿](https://github.com/agentai2026/Years--Collect/issues/new?template=submit.yml)
- [接口失效报障](https://github.com/agentai2026/Years--Collect/issues/new?template=bug.yml)

## 免责声明

本项目为第三方开源监测与目录工具；同步自各公开站点 / GitHub 的数据仅供学习与技术交流，请自行确认接口授权与内容合规。

## License

MIT
