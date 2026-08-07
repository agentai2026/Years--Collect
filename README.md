# 岁月 · Years--Collect

个人站点 + 采集站信号台。基于 Astro 7 / Svelte 5。

在线：<https://agentai2026.github.io/Years--Collect/>

---

## 仓库怎么分（先看这里）

整仓只有 **四块**：页面、静态资源、自动化、站点配置。

### 1. 页面（给人看的）

| 路径 | 是什么 |
| --- | --- |
| `src/pages/` | 路由页面：主页、文章、采集六宫格、监控台 Astro 壳、关于… |
| `src/layouts/` | 页面骨架（博客壳 / 监控台壳） |
| `src/components/` | UI 组件 |
| `src/styles/` | 样式 |
| `src/content/` | 文章 / 关于等 Markdown 内容 |
| `src/i18n/` | 多语言文案 |

浏览器地址对应关系：

| 打开 | 对应文件 |
| --- | --- |
| `/` | `src/pages/index.astro` |
| `/collect/` | `src/pages/collect/index.astro` |
| `/collect/desk/` | `src/pages/collect/desk/*.astro` |
| `/all/` | `src/pages/all/[...page].astro` |
| `/projects/` | `src/pages/projects.astro` |

改外观、导航、文案 → 只动 **`src/`**。

### 2. 静态资源（构建时原样拷进站点）

| 路径 | 是什么 |
| --- | --- |
| `public/collect-assets/` | 监控台 JS/CSS + **catalog 镜像**（前台实际 fetch 这份） |
| `public/favicon/` 等 | 图标等静态文件 |
| `src/assets/` | 需经 Astro 处理的图片（头像、壁纸） |

### 3. 自动化（定时跑、写数据，不负责排版）

| 路径 | 是什么 |
| --- | --- |
| `scripts/sync-*.mjs` | 多源入库 |
| `scripts/classify.mjs` | 分类 |
| `scripts/monitor.mjs` | 健康探测 |
| `scripts/lib.mjs` / `catalog.mjs` | 公共读写（**真源路径在这里定**） |
| `scripts/git-push-catalog.sh` | Actions 里提交 catalog |
| `mcp/` | 给 AI 工具查 catalog / 快照 |
| `.github/workflows/collect-*.yml` | 定时同步 / 巡检 |
| `data/` | 巡检快照（`latest.json`、`archives/`） |
| **`docs/catalog.json`** | **自动化唯一真源**（与旧 Years--Collect 相同） |

改采集逻辑、巡检、入库 → 只动 **`scripts/` + `mcp/` + `.github/workflows/collect-*`**。  
自动化写完 `docs/catalog.json` 后，会同步一份到 `public/collect-assets/catalog.json` 给页面用。

### 4. 站点配置 / 构建 / 发布

| 路径 | 是什么 |
| --- | --- |
| `src/config/` | 站名、导航、采集页文案、主题开关 |
| `astro.config.mjs` / `package.json` | 构建与命令 |
| `.github/workflows/pages.yml` | `pnpm build` → 发布 GitHub Pages（出 `dist/`） |
| `COLLECT.md` / `AGENTS.md` | 采集对接说明（给人 / 给 Agent） |

本地预览页面：`pnpm install && pnpm dev`  
只跑自动化：`pnpm collect:health` 等（见下）

---

## 数据位置（勿改错）

| 路径 | 角色 |
| --- | --- |
| **`docs/catalog.json`** | 自动化读写真源 |
| `public/collect-assets/catalog.json` | 页面前台镜像 |
| `data/` | 巡检快照 |

---

## 自动化工作流（页面----功能）

| 名字 | 干什么 | 多久跑一次 |
| --- | --- | --- |
| [影视源页面----同步入库](https://github.com/agentai2026/Years--Collect/actions/workflows/collect-maintenance.yml) | 抓影视接口、分类进目录 | 每 6 小时 |
| [影视源页面----在线巡检](https://github.com/agentai2026/Years--Collect/actions/workflows/collect-health.yml) | 测接口还在不在、快不快 | 每 2 小时 |
| [全站页面----发布上线](https://github.com/agentai2026/Years--Collect/actions/workflows/pages.yml) | 把站点打包发到网上 | 有改动 / 上面跑完后 |

（旁边若还有「页面构建部署」，那是 GitHub 自己的发布步骤，不用管。）

可选 Secrets：`GH_SEARCH_TOKEN`（GitHub 全站搜源）。

## 本地命令

```bash
pnpm install
pnpm dev                 # 页面：http://localhost:4321

pnpm collect:yszzq       # 自动化 → docs/catalog.json
pnpm collect:ziyuanzu
pnpm collect:github
pnpm collect:classify
pnpm collect:health
pnpm collect:mcp

node scripts/verify-collect.mjs
```

Node.js ≥ 22，包管理器用 **pnpm**。

## 投稿

- [新接口投稿](https://github.com/agentai2026/Years--Collect/issues/new?template=submit.yml)
- [接口失效报障](https://github.com/agentai2026/Years--Collect/issues/new?template=bug.yml)

## 免责声明

本项目为第三方开源监测与目录工具；同步自各公开站点 / GitHub 的数据仅供学习与技术交流，请自行确认接口授权与内容合规。

## License

MIT
