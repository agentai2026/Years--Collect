# 岁月 · Years--Collect

个人站点 + 采集站信号台。基于 Astro 7 / Svelte 5，采集自动化与原仓库一致。

在线访问：<https://agentai2026.github.io/Years--Collect/>

## 站点入口

| 路径 | 说明 |
| --- | --- |
| `/` | 个人主页 |
| `/collect/` | 采集六宫格入口 |
| `/collect/desk/` | 监控台（目录 / 分类 / 详情 / 下载 / 教程 / 投稿） |
| `/all/` | 全部文章 |
| `/projects/` | 我的项目 |

## 数据位置（勿改错）

| 路径 | 角色 |
| --- | --- |
| **`docs/catalog.json`** | 自动化读写真源（与旧版相同） |
| `public/collect-assets/catalog.json` | Astro 静态站镜像（写入真源后自动同步） |
| `data/` | 巡检快照 `latest.json` / `archives/` |

## 自动化工作流

| 工作流 | 作用 | 默认频率 |
| --- | --- | --- |
| [Collect maintenance](https://github.com/agentai2026/Years--Collect/actions/workflows/collect-maintenance.yml) | 多源入库 + 分类 | 每 6 小时 |
| [Health probe](https://github.com/agentai2026/Years--Collect/actions/workflows/collect-health.yml) | 探测可用性，写 history + 归档 | 每 2 小时 |
| [Deploy Pages](https://github.com/agentai2026/Years--Collect/actions/workflows/pages.yml) | `pnpm build` 后发布 `dist/` | 变更 / 上列成功后 |

GitHub 全站搜源建议在 Secrets 配置 `GH_SEARCH_TOKEN`（classic PAT，`public_repo`）。

## 本地命令

```bash
pnpm install
pnpm dev                 # http://localhost:4321

pnpm collect:yszzq       # → docs/catalog.json
pnpm collect:ziyuanzu
pnpm collect:github
pnpm collect:classify
pnpm collect:health
pnpm collect:mcp

node scripts/verify-collect.mjs
```

需要 Node.js ≥ 22，包管理器用 **pnpm**。

## 投稿

- [新接口投稿](https://github.com/agentai2026/Years--Collect/issues/new?template=submit.yml)
- [接口失效报障](https://github.com/agentai2026/Years--Collect/issues/new?template=bug.yml)

## 免责声明

本项目为第三方开源监测与目录工具；同步自各公开站点 / GitHub 的数据仅供学习与技术交流，请自行确认接口授权与内容合规。

## License

MIT
