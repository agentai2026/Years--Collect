# 采集站信号台（Years--Collect 已并入本仓库）

## 前台
- `/collect/` 六宫格入口
- `/collect/desk/` 监控台（目录 / 分类 / 详情 / 下载 / 教程 / 投稿）
- 前台读取：`public/collect-assets/catalog.json`（镜像）

## 数据位置（与原 22222 一致）
- **自动化读写唯一真源：`docs/catalog.json`**
- 写入后脚本会同步镜像到 `public/collect-assets/catalog.json`（供 Astro 静态站使用）
- 快照：`data/latest.json`、`data/archives/`

## 自动化
```bash
pnpm collect:yszzq      # 同步 yszzq → docs/catalog.json
pnpm collect:ziyuanzu   # 同步 ziyuanzu
pnpm collect:github     # GitHub 搜索入库（建议 Secrets: GH_SEARCH_TOKEN）
pnpm collect:classify    # 分类
pnpm collect:health     # 健康探测 → 写 docs/catalog.json + data/
pnpm collect:mcp        # MCP 查询服务（stdio，读 docs/catalog.json）
```

脚本目录：`scripts/*.mjs`  
MCP：`mcp/mcp_server.mjs`（Cursor 可引用 `mcp/mcp.json`）

## GitHub Actions
- `Collect maintenance` — 每 6 小时同步/分类，提交 `docs/catalog.json`（及 public 镜像）+ `data/`
- `Health probe` — 每 2 小时巡检，同上
- `Deploy Pages` — 校验 `docs/catalog.json` → 同步 public → `pnpm build` 发布 `dist/`

覆盖原 Years--Collect 仓库后：
1. `pnpm install && pnpm dev` 本地预览
2. `node scripts/verify-collect.mjs` 自检对接
3. 打开 GitHub Actions / Pages 权限
4. 可选 Secrets：`GH_SEARCH_TOKEN`（GitHub 全站搜源）
5. 项目站 Pages 会带 `GITHUB_PAGES=1`，base 为 `/Years--Collect/`
