# 采集站信号台 · Years--Collect

纯静态的采集接口监控目录：定时巡检、30 日可用率、历史快照、一键配置、CMS 对接教程，并提供 MCP 供 AI 查询。

## 目录说明

| 目录 / 文件 | 分类 | 说明 |
|-------------|------|------|
| [`docs/`](docs/) | **页面** | 站点 HTML / CSS / JS，以及页面读取的 `data.json`（GitHub Pages 发布目录） |
| [`scripts/`](scripts/) | **自动化** | 同步源、探测接口脚本 |
| [`.github/workflows/`](.github/workflows/) | **自动化** | 每 2 小时定时跑同步 + 探测并提交 |
| [`data/`](data/) | **巡检数据** | 每次探测的 `latest.json` 与 `archives/monitor_*.json` 快照 |
| [`mcp/`](mcp/) | **MCP** | AI 查询服务器与配置示例 |
| `README.md` / `AGENTS.md` / `LICENSE` | **文档** | 说明与协议 |

## 在线访问

https://agentai2026.github.io/Years--Collect/

## 功能

- **定时监测**：每 2 小时自动同步 + 探测（可手动触发）
- **外部同步**：从 [ziyuanzu.com](https://www.ziyuanzu.com/) sitemap 拉取采集接口写入 `docs/data.json`
- **实时数据**：HTTP 状态、响应时间、在线/离线、资源量
- **历史存档**：`data/latest.json` + `data/archives/monitor_*.json`
- **静态页面**：`docs/` 信号台 UI + GitHub Pages（`/docs`）
- **MCP 服务器**：查询在线、离线、最快接口与统计

## 本地预览

页面在 `docs/`，需起静态服务：

```bash
npx --yes serve -p 8080 docs
```

打开 http://localhost:8080/

## 巡检与同步

```bash
node scripts/sync.mjs
node scripts/monitor.mjs
```

| 变量 | 说明 |
|------|------|
| `SYNC_LIMIT` | 同步数量上限；`0` 表示同步全部活跃站（默认） |
| `ARCHIVE_KEEP` | 归档保留份数（默认 120） |
| `SKIP_SYNC=1` | 跳过同步 |
| `INCLUDE_DEFUNCT=1` | 同时同步 `/source/defunct/` 失效站（默认不同步） |

工作流：[Monitor endpoints](https://github.com/agentai2026/Years--Collect/actions/workflows/monitor.yml)

## MCP

```bash
node mcp/mcp_server.mjs
```

配置见 [`mcp/mcp.json`](mcp/mcp.json)。

## 投稿

- [新接口投稿](https://github.com/agentai2026/Years--Collect/issues/new?template=submit.md)
- [接口失效报障](https://github.com/agentai2026/Years--Collect/issues/new?template=bug.md)

## 免责声明

本项目为第三方开源监测与目录工具；从 ziyuanzu.com 同步的数据仅供学习与技术交流，请自行确认接口授权与内容合规。与 ziyuanzu.com 官方无关。

## License

MIT
