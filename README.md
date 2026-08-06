# 采集站信号台 · Years--Collect

纯静态的采集接口监控目录：定时巡检、30 日可用率、历史快照、一键配置、CMS 对接教程，并提供 MCP 供 AI 查询。

参考同类项目能力对齐：[mylazily/ziyuanzhan](https://github.com/mylazily/ziyuanzhan)。

## 在线访问

https://agentai2026.github.io/Years--Collect/

## 功能

- **定时监测**：每 2 小时自动同步 + 探测（可手动触发）
- **外部同步**：从 [ziyuanzu.com](https://www.ziyuanzu.com/) sitemap 拉取采集接口写入 `data.json`（默认最多 60 个，可用 `SYNC_LIMIT` 调整）
- **实时数据**：HTTP 状态、响应时间、在线/离线、资源量
- **历史存档**：`data/latest.json` + `data/archives/monitor_*.json`（默认保留 120 份）
- **静态页面**：信号台 UI（雷达、目录、投稿、教程）+ GitHub Pages
- **MCP 服务器**：给 Cursor / Claude 等查询在线、离线、最快接口与统计

## 本地预览

本站通过 `fetch('data.json')` 加载数据，**不能直接双击打开 HTML**：

```bash
npx --yes serve -p 8080
```

打开 http://localhost:8080/

## 巡检与同步

| 项 | 说明 |
|----|------|
| 工作流 | [Monitor endpoints](https://github.com/agentai2026/Years--Collect/actions/workflows/monitor.yml) |
| 频率 | 每 2 小时（`0 */2 * * *` UTC） |
| 同步 | `node scripts/sync.mjs` |
| 探测 | `node scripts/monitor.mjs` |
| 跳过同步 | `SKIP_SYNC=1 node scripts/monitor.mjs` |

```bash
# 完整跑一遍（同步 + 探测 + 写归档）
node scripts/sync.mjs
node scripts/monitor.mjs
```

环境变量：

- `SYNC_LIMIT`：同步源数量上限（默认 60）
- `ARCHIVE_KEEP`：归档保留份数（默认 120）
- `SKIP_SYNC=1`：工作流/本地跳过同步

## MCP

```bash
node mcp_server.mjs
```

配置示例见 [`mcp.json`](mcp.json)。可用工具：

- `get_all_resources` / `get_online_resources` / `get_offline_resources`
- `get_statistics` / `search_resource` / `get_fastest_resources`

## 目录结构

```
Years--Collect/
├── .github/workflows/monitor.yml
├── data/
│   ├── latest.json
│   └── archives/monitor_*.json
├── scripts/
│   ├── lib.mjs
│   ├── sync.mjs
│   └── monitor.mjs
├── mcp_server.mjs
├── mcp.json
├── data.json
├── index.html / detail.html / ...
└── app.js / style.css
```

## 投稿

- [新接口投稿](https://github.com/agentai2026/Years--Collect/issues/new?template=submit.md)
- [接口失效报障](https://github.com/agentai2026/Years--Collect/issues/new?template=bug.md)

## 免责声明

本项目为第三方开源监测与目录工具；从 ziyuanzu.com 同步的数据仅供学习与技术交流，请自行确认接口授权与内容合规。与 ziyuanzu.com 官方无关。

## License

MIT
