---
title: "用 PHP 8.3 手搓一个定时任务调度面板：麒麟 ql 开源了"
published: 2026-10-27
description: "[md]#"
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "wumingshit"
sourceLink: "https://www.52pojie.cn/thread-2134467-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2134467-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

## 用 PHP 8.3 手搓一个定时任务调度面板：麒麟 ql 开源了

>
一个跑在虚拟主机上、由 cron-job.org 驱动的轻量任务调度系统。

### 为什么又造一个轮子

事情的起点很具体：我手上有一个项目，需要依赖一个定时服务来触发，而且这个服务不是随便就能调的——它需要**比较复杂的鉴权**才能访问。

之前一直用青龙面板来跑这些定时任务，稳定、顺手。但问题来了：跑青龙的那台服务器到期了。续费吧，为了几个定时任务再养一台服务器，成本不太划算；不续吧，任务又不能停。

刚好手上有一个 **PHP 虚拟主机**，平时基本闲着。于是就想：能不能不依赖 Docker、不额外买服务器，直接在这个虚拟主机上跑一套调度系统？

青龙依赖 Docker，虚拟主机跑不起来；市面上的方案大多也要独立进程或常驻服务。既然需求不复杂——**定时触发 + Token 鉴权 + 执行脚本 + 看日志**——那就自己写一个。

于是有了 **ql（麒麟）**：PHP 8.3 + MySQL，调度器和执行器由外部 Cron 每分钟触发，后台和 API 用 Token 鉴权。它不追求功能大而全，只解决一个具体问题：**在没有 Docker、没有独立服务器的虚拟主机上，也能稳定跑定时任务，并且带鉴权**。

目前已在虚拟主机环境完成部署验证，正好接替了原来青龙面板的位置。

仓库地址：[https://gitee.com/deshuofa/ql](https://gitee.com/deshuofa/ql)

### 整体架构

ql 分三层，职责很清晰：

- **调度器 `scheduler.php`**：每分钟触发，判断任务是否到期，写入执行队列 `task_queue`，并定期清理日志与历史记录。

- **执行器 `executor.php`**：每分钟触发，从队列取 `pending` 任务，交给 `TaskRunner` 执行，写日志、按失败次数重试。

- **后台 `admin/` 与接口 `api/`**：任务增删改查、脚本管理、环境变量、日志查看、Token 管理。

调度器和执行器都带**文件锁**（`data/*.lock`），并通过 **API Token** 鉴权，避免重复运行和未授权访问。

`ql/
├── admin/              # 后台页面
├── api/                # 接口
├── lib/                # 公共类库（Db / Cron / Auth / TaskRunner 等）
├── scripts/            # 被调度的脚本
├── config.php          # 全局配置
├── scheduler.php       # 调度器
├── executor.php        # 执行器
└── install.sql         # 数据库初始化`

### 核心设计

#### 1. 多 Cron 表达式

一个任务可以配置多个 Cron，存成 JSON 数组（`tasks.cron_exprs`）。调度器用 `lib/Cron.php` 的 `findDue()` 判断是否到期，命中就插一条 `task_queue`。

#### 2. 执行队列 + 失败重试

队列消费与重试的实现在 `executor.php`，核心是「**原子抢占 + 批量 + 时间预算**」，见下节代码。

#### 3. 并发控制

调度器和执行器都用 `flock` 文件锁，重复触发直接跳过。代码里还做了 `fastcgi_finish_request()` 判断，Web 调用时先返回再后台执行，CLI 下不受影响。

#### 4. 鉴权

- 后台：登录密码存 `settings`，bcrypt 哈希，带失败次数限制和锁定（`login_max_fail` / `login_lock_seconds`）。

- API：`api_tokens` 表，带 `scopes` 和 `status`，调度器/执行器各自用独立 Token。

### 调度器实现

调度器 `scheduler.php` 是整个系统的入口：拉取启用中的任务，用 Cron 解析判断是否到期，到期就写一条 `pending` 到 `task_queue`，并顺手做日志和队列的定期清理。

` 'scheduler already running']);
}

if (function_exists('fastcgi_finish_request')) {
    fastcgi_finish_request();
}

$now = time();

// ============ 调度逻辑 ============

$stmt = $db->query("SELECT * FROM tasks WHERE status = 1");
$tasks = $stmt->fetchAll();

$inserted = 0;

foreach ($tasks as $task) {
    $exprs = json_decode($task['cron_exprs'], true);
    if (!is_array($exprs) || empty($exprs)) {
        continue;
    }

    $dueAt = Cron::findDue($exprs, (int)$task['last_run_at'], $now);
    if ($dueAt === null) {
        continue;
    }

    // 只要到期就插队列，不检查队列状态
    $db->beginTransaction();
    try {
        $stmt = $db->prepare("
            INSERT INTO task_queue (task_id, scheduled_at, status)
            VALUES (?, ?, 'pending')
        ");
        $stmt->execute([$task['id'], $dueAt]);

        $stmt = $db->prepare("UPDATE tasks SET last_run_at = ? WHERE id = ?");
        $stmt->execute([$dueAt, $task['id']]);

        $db->commit();
        $inserted++;
    } catch (Exception $e) {
        $db->rollBack();
        error_log("scheduler insert failed for task {$task['id']}: " . $e->getMessage());
    }
}

// ============ 清理逻辑 ============

$lastCleanup = (int)Setting::get($db, 'last_cleanup_at', 0);
if (time() - $lastCleanup > 86400) {
    $logKeepDays   = (int)Setting::get($db, 'log_keep_days', 7);
    $queueKeepDays = (int)Setting::get($db, 'queue_keep_days', 30);

    if ($logKeepDays > 0) {
        cleanupLogs(__DIR__ . '/logs', $logKeepDays);
    }
    if ($queueKeepDays > 0) {
        cleanupQueue($db, $queueKeepDays);
    }

    Setting::set($db, 'last_cleanup_at', time());
}

$db->exec("DELETE FROM admin_tokens WHERE expires_at isFile()) {
            if ($file->getMTime() getPathname());
                $deleted++;
            }
        } elseif ($file->isDir()) {
            $dirs[] = $file->getPathname();
        }
    }

    rsort($dirs);
    foreach ($dirs as $dir) {
        if (is_dir($dir)) {
            $files = @scandir($dir);
            if ($files !== false && count($files) prepare("
        DELETE FROM task_queue
        WHERE finished_at > 0 AND finished_at execute([$cutoff]);
    return $stmt->rowCount();
}`
几个值得说的点：

- **Token 鉴权在锁之前**：`Auth::verify($db, 'scheduler')` 先校验，未授权直接拒绝，避免外部随意触发。

- **文件锁防重入**：`flock(LOCK_EX | LOCK_NB)` 拿不到锁就返回 `already running`，cron 触发再频繁也不会并发跑两份。

- **`fastcgi_finish_request()`**：Web 方式调用时先结束请求，后续调度在后台继续，避免 cron-job.org 30 秒超时影响执行。

- **事务写队列**：插 `task_queue` 和更新 `tasks.last_run_at` 放在同一事务，避免重复调度。

- **清理有频率限制**：日志和队列清理每天最多一次，用 `settings.last_cleanup_at` 记录，避免每次都扫目录。

### 执行器实现

调度器只管「到期就入队」，真正跑脚本的是执行器 `executor.php`：从 `task_queue` 取 `pending` 任务，**原子抢占**后交给 `TaskRunner` 执行，按结果更新状态、处理重试。

` 'executor already running']);
}

if (function_exists('fastcgi_finish_request')) {
    fastcgi_finish_request();
}

$startTime = time();
$maxTime   = $config['max_execution_time'];
$batchSize = $config['executor_batch_size'];
$maxRetry  = $config['max_retry'];

$now = time();

$stmt = $db->prepare("
    SELECT q.*, t.script_file, t.params, t.log_dir, t.name AS task_name, t.cron_exprs
    FROM task_queue q
    JOIN tasks t ON t.id = q.task_id
    WHERE q.status = 'pending' AND q.scheduled_at execute([$now]);
$jobs = $stmt->fetchAll();

foreach ($jobs as $job) {
    if (time() - $startTime > $maxTime - 10) {
        break;
    }

    // 先生成日志路径
    $logDir = __DIR__ . '/logs/' . $job['log_dir'];
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    $logFileName = date('Ymd_His') . '_' . $job['id'] . '.log';
    $logRelPath  = $job['log_dir'] . '/' . $logFileName;

    // 原子抢占，同时写入 log_file
    $stmt = $db->prepare("
        UPDATE task_queue
        SET status = 'running', started_at = ?, log_file = ?
        WHERE id = ? AND status = 'pending'
    ");
    $stmt->execute([time(), $logRelPath, $job['id']]);

    if ($stmt->rowCount() === 0) {
        continue;
    }

    $job['trigger_type'] = 'queue';
    $job['log_file']     = $logRelPath;

    $result = TaskRunner::run($db, $job);

    if ($result['status'] === 'success') {
        $stmt = $db->prepare("
            UPDATE task_queue
            SET status = 'success', finished_at = ?
            WHERE id = ?
        ");
        $stmt->execute([time(), $job['id']]);
    } else {
        $retryCount = (int)$job['retry_count'];
        if ($retryCount prepare("
                UPDATE task_queue
                SET status = 'pending', retry_count = retry_count + 1,
                    error_msg = ?
                WHERE id = ?
            ");
            $stmt->execute([$result['error'], $job['id']]);
        } else {
            $stmt = $db->prepare("
                UPDATE task_queue
                SET status = 'failed', finished_at = ?,
                    error_msg = ?
                WHERE id = ?
            ");
            $stmt->execute([time(), $result['error'], $job['id']]);
        }
    }
}

flock($fp, LOCK_UN);
fclose($fp);`
几个关键设计：

- **原子抢占**：`UPDATE ... WHERE id = ? AND status = 'pending'`，用 `rowCount()` 判断是否抢到。即使多个执行器实例同时跑（比如主机 Cron 和 cron-job.org 都触发），同一任务也只会被一个执行器处理。

- **批量 + 时间预算**：一次取 `executor_batch_size` 条，循环里判断 `time() - $startTime > $maxTime - 10` 就提前退出，给 PHP 进程留 10 秒余量，避免被 FPM 或 cron-job.org 硬杀。

- **日志路径先落库**：抢占时就把 `log_file` 写进去，任务中途挂掉也能知道日志在哪。

- **失败重试**：`retry_count getMessage();
                self::writeLog($logFile, '异常: ' . $e->getMessage());
                self::writeLog($logFile, '文件: ' . $e->getFile() . ':' . $e->getLine());
            }
        }

        // ============ 失败时发送通知 ============

        if ($status === 'failed') {
            $errorPush = $params['errorPush'] ?? false;

            self::writeLog($logFile, '[DEBUG] errorPush=' . var_export($errorPush, true));

            if ($errorPush === true || $errorPush === 'true' || $errorPush === 1 || $errorPush === '1') {
                self::sendErrorNotification($job, $errorMsg);
            }
        }

        self::writeLog($logFile, '===== 任务结束: ' . $status . ' =====');

        return [
            'status'   => $status,
            'error'    => $errorMsg,
            'log_file' => $logRelPath,
        ];
    }

    /**
     * 发送失败通知
     */
    public static function sendErrorNotification($job, $errorMsg)
    {
        $logFile = $GLOBALS['__task_log_file'] ?? null;

        self::writeLog($logFile, '📤 准备发送失败通知');

        require_once __DIR__ . '/QingLongApi.php';
        require_once __DIR__ . '/Setting.php';

        try {
            $db = Db::getInstance();

            $webhookUrl = Setting::get($db, 'QiYe_WEBHOOK_URL', '');
            if (!$webhookUrl) {
                self::writeLog($logFile, '⚠️ QiYe_WEBHOOK_URL 未配置，跳过发送');
                return false;
            }

            self::writeLog($logFile, '📤 Webhook URL: ' . substr($webhookUrl, 0, 50) . '...');

            $qlApi = new QingLongApi();

            $content = "任务执行失败\n"
                     . "任务名: " . ($job['task_name'] ?? '') . "\n"
                     . "错误: " . ($errorMsg ?? '未知错误') . "\n"
                     . "时间: " . date('Y-m-d H:i:s');

            self::writeLog($logFile, '📤 通知内容: ' . str_replace("\n", ' | ', $content));

            $result = $qlApi->sendMessage([
                'msgtype' => 'text',
                'text'    => ['content' => $content],
            ]);

            self::writeLog($logFile, '✅ 失败通知已发送，响应: ' . json_encode($result, JSON_UNESCAPED_UNICODE));

            return true;
        } catch (Exception $e) {
            self::writeLog($logFile, '❌ 发送失败通知失败: ' . $e->getMessage());
            return false;
        } catch (Throwable $e) {
            self::writeLog($logFile, '❌ 发送失败通知异常: ' . $e->getMessage());
            return false;
        }
    }

    private static function writeLog($file, $msg)
    {
        if (!$file) return;
        file_put_contents($file, date('Y-m-d H:i:s') . ' ' . $msg . "\n", FILE_APPEND);
    }
}`
几个值得说的设计：

- **复用**：队列消费和手动触发都调 `TaskRunner::run`，执行逻辑只有一份。

- **脚本以 `include` 方式执行**：脚本运行在同一个 PHP 进程内，可直接用 `$params`、`task_log()`。好处是无需 fork、虚拟主机友好；代价是脚本异常会影响执行器进程，所以用 `try/catch (Throwable)` 兜住。

- **注入 `_is_last_of_cron` / `_is_last_of_today`**：这是给脚本用的两个布尔变量，让脚本知道「这是本周期最后一次」「这是今天最后一次」，适合做日报、收尾类任务。由 `params.push` 控制是否计算。

- **日志双写**：框架用 `writeLog()` 写，脚本里用 `task_log()` 写，都落到同一个日志文件。

- **失败通知**：`errorPush` 为真时，通过 `QingLongApi` 发企业微信 Webhook，发送失败不影响主流程。

>
注：`QingLongApi` 是通知模块的类名（历史上对接过青龙的通知接口），和调度系统本身无关；如果你觉得名字容易混淆，可以改名为 `Notifier`。

### 后台功能一览

ql 的后台是纯 PHP + 原生 JS，无前端框架依赖，按页面分：

#### 仪表盘 `dashboard.php`

- **四张统计卡**：总任务（启用/禁用）、今日执行（成功/失败）、成功率、平均耗时。

- **近 7 日趋势**：堆叠柱状图，蓝色成功、红色失败，纯 CSS 绘制，无图表库。

- **Top 5 轮播**：耗时 Top 5、执行次数 Top 5，各带「今日 / 昨日」两个页签，自动轮播，可手动切换。

- **实时运行态**：运行中 / 排队中数量，以及运行中任务的已运行时长、排队任务的计划时间。

- **系统资源**：服务器时间（前端按服务端时间戳每秒 tick）、堆内存、1 分钟负载。

- 每 30 秒自动刷新，服务端时间在前端平滑走动。

#### 任务列表 `index.php`

- 按任务名搜索，分页（每页 20 条）。

- **按脚本分组页签**：顶部按 `script_file` 聚合，显示每个脚本下的任务数，点击筛选。

- 列表列：ID、任务名、脚本、Cron 表达式、状态、上次调度、上次执行状态、预计下次执行、操作。

- 操作：详情、编辑、**日志（弹框实时拉取）**、立即执行、启用/禁用、删除。

- **日志弹框**：打开后每 3 秒增量拉取最新日志，任务结束自动停止轮询。

- 移动端自动切换为卡片布局。

#### 任务详情 `task_detail.php`

- 左侧任务信息：脚本、参数 JSON、Cron 列表、日志目录、状态、上次调度、预计下次执行、创建/更新时间。

- 右侧执行历史：队列 ID、计划/开始/结束时间、耗时、状态、重试次数、查看日志，分页。

- **增量渲染**：刷新时按 `id` 做 diff，只替换状态变化的行，避免整表重绘。

- 每 10 秒自动刷新执行历史。

- 顶部「立即执行」「编辑」按钮，移动端折叠为图标。

#### 任务编辑 `task_edit.php`

- 任务名（唯一）、脚本下拉（只列 `task` / `system` 类型）、JSON 参数、**多行 Cron 表达式**（一行一个）、日志目录、状态。

- 保存前校验 JSON 格式、Cron 非空、日志目录合法。

- 从详情页进入保存后跳回详情页，从列表进入则回列表。

#### 脚本管理 `script_list.php`

- 列出脚本：文件名、类型（系统/任务/工具）、描述、大小、修改时间、**引用数**。

- 系统脚本不可编辑/重命名/删除；**被任务引用的脚本禁止删除**。

- 支持重命名、删除。

#### 脚本编辑 `script_edit.php`

- 内置 **Ace Editor**（PHP 模式），支持自动补全、查找、行/块注释快捷键。

- 左编辑右调试：右侧填 JSON 参数，点「调试运行」直接执行当前代码，返回输出、日志、错误和耗时。

- 快捷键：`Ctrl+S` 保存、`Ctrl+Enter` 调试运行、`Ctrl+F` 查找、`Ctrl+/` 行注释、`Ctrl+Shift+/` 块注释。

- 任务脚本有默认模板（`run($params, $env)` 入口），工具文件原样保存、不自动执行。

- 系统脚本只读。

#### 设置 `settings.php`

手风琴式四块：

- **修改账号**：验证当前密码后改用户名，改完强制重新登录。

- **修改密码**：旧密码 + 新密码（≥6 位）+ 确认，改完强制重新登录。

- **环境变量管理**：增删改查、搜索、一键复制键和值，带备注和更新时间。

- **API Token 管理**：新建/编辑/禁用/删除，Token 可复制；**Scope 勾选**（调度器、执行器、推送任务、获取任务、删除任务、读/写环境变量、读/写脚本），不选表示不限制。

#### 登录 `login.php`

- 账号 + 密码登录，成功后 Token 存 `localStorage`，跳转仪表盘。

- 失败提示；登录失败次数限制在服务端（`login_max_fail` / `login_lock_seconds`）。

#### 日志查看 `log_view.php`

- 按 `queue_id` 读取日志文件，支持**增量读取**（`offset`），可勾选「自动刷新（2 秒）」实时跟踪。

- 显示文件大小和已读取字节数。

#### 公共导航 `nav.php`

- 顶部固定导航：仪表盘、任务列表、脚本管理、设置、退出。

- 移动端折叠为汉堡菜单。

#### 前端整体特点

- **零框架**：原生 JS + CSS，无构建步骤，虚拟主机直接跑。

- **响应式**：桌面表格 + 移动端卡片双布局，按 768px 断点切换。

- **增量更新**：仪表盘、详情页、日志弹框都做了轮询 + 增量渲染，避免整页刷新。

- **统一交互**：`apiGet` / `apiPost` 封装、`toast` 提示、`confirmDialog` 确认框、`esc` 转义，各页面复用。

### 部署：虚拟主机也能跑

#### 1. 初始化

`git clone https://gitee.com/deshuofa/ql.git
cd ql
mkdir -p data
mysql -u  -p
然后改 `config.php` 里的数据库配置。

#### 2. 定时触发

**有主机 Cron 权限**，用 CLI：

`* * * * * /usr/bin/php /path/to/ql/scheduler.php >> /path/to/ql/data/scheduler.log 2>&1
* * * * * /usr/bin/php /path/to/ql/executor.php  >> /path/to/ql/data/executor.log  2>&1`
**没有 Cron 权限**，用 [cron-job.org](https://console.cron-job.org/) 建两个 Job，URL 指向：

`https:///ql/scheduler.php?token=
https:///ql/executor.php?token=`

>
注意：cron-job.org 免费版单次请求 **30 秒超时**。执行器默认 `max_execution_time` 是 250 秒，长任务要么拆分，要么把 `max_execution_time` 调到 25 秒左右，要么升级会员。

#### 3. 加固

`.htaccess` 禁止访问敏感文件：

`
    Require all denied

    RewriteRule ^data/ - [F,L]
`
Nginx 则用：

`location ~ ^/(data|config\.php|install\.sql) { deny all; }`

### PHP 8.3 兼容性

项目在 PHP 8.3 下开发运行。从旧版本迁移时注意：

- 8.2+ 弃用动态属性，类里显式声明属性或加 `#[AllowDynamicProperties]`

- 弃用 `${var}` 插值，改用 `{$var}`

- 弃用 `utf8_encode` / `utf8_decode`，改用 `mb_convert_encoding`

- 内置函数传 `null` 到非 nullable 参数会告警，注意判空

### 安全提醒

- 部署后**立即修改后台初始密码**，替换 `install.sql` 里的占位 Token

- 生产环境 `debug` 设为 `false`

- 限制 `admin/`、`api/` 访问来源，启用 HTTPS

- 用 cron-job.org 时，URL 里的 Token 会进第三方日志，建议用独立 Token 并定期轮换

### 最后

ql（麒麟）的目标很简单：**让没有 Docker 的虚拟主机也能跑定时任务调度**。代码量不大，结构清晰，适合二次开发。

仓库：[https://gitee.com/deshuofa/ql](https://gitee.com/deshuofa/ql)

CSDN：[https://blog.csdn.net/u013659623/article/details/169261367](https://blog.csdn.net/u013659623/article/details/169261367)

采用 MIT License 开源，欢迎 issue 和 PR。

如果你也在虚拟主机上折腾过定时任务，欢迎交流你的方案。

---

[查看原文](https://www.52pojie.cn/thread-2134467-1-1.html)
