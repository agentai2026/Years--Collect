# 采集站信号台 · Years--Collect

纯静态的采集接口监控目录：每日巡检状态、30 日可用率、一键配置下载与 CMS 对接教程。

## 在线访问

GitHub Pages：

https://agentai2026.github.io/Years--Collect/

## 本地预览

本站通过 `fetch('data.json')` 加载数据，**不能直接双击打开 HTML**，需要本地 HTTP 服务：

```bash
# PowerShell（Python 可用时）
python -m http.server 8080

# 或 Node
npx --yes serve -p 8080
```

浏览器打开：http://localhost:8080/

## 定时巡检

GitHub Actions 每天 **北京时间 06:00** 自动探测 `data.json` 中全部接口，回写当日 `history`（保留 30 天）并提交到 `main`，Pages 随之更新。

| 项 | 说明 |
|----|------|
| 工作流 | [Monitor endpoints](https://github.com/agentai2026/Years--Collect/actions/workflows/monitor.yml) |
| 脚本 | `scripts/monitor.mjs` |
| 手动触发 | Actions → Monitor endpoints → Run workflow |

本地手动跑一次：

```bash
node scripts/monitor.mjs
```

当前演示数据里的 `api.example-*.com` 无法真正连通，巡检会记为离线；把 `data.json` 里的 `api` 换成真实地址后即可正常出绿。

## 目录结构

| 文件 | 说明 |
|------|------|
| `index.html` | 首页：雷达、今日信号、接口目录 |
| `detail.html` | 接口详情 |
| `category.html` | 内容分类 |
| `download.html` | 一键配置下载 |
| `guide.html` | CMS 对接教程 |
| `submit.html` | 投稿说明 |
| `data.json` | 全部接口与巡检数据 |
| `scripts/monitor.mjs` | 定时巡检脚本 |
| `app.js` / `style.css` | 逻辑与样式 |

## 投稿

通过 GitHub Issue 投稿新接口或报障：

- [新接口投稿](https://github.com/agentai2026/Years--Collect/issues/new?template=submit.md)
- [接口失效报障](https://github.com/agentai2026/Years--Collect/issues/new?template=bug.md)

维护者审核后合并进 `data.json`。

## 技术说明

无后端、无构建步骤。部署到任意静态托管即可；本仓库使用 GitHub Pages（`main` 分支根目录）。巡检由 GitHub Actions 定时写入 `data.json`。
