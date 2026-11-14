---
title: "PHP环境全面检测脚本"
published: 2026-11-13
description: "环境全面检测脚本（安全加固版） 适用于受限虚拟主机（如 InfinityFree） 用完后请立即删除！ [mw_shl_code=php,true] 环境检测报告 * { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: \\'Seg"
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "EDUCN"
sourceLink: "https://www.52pojie.cn/thread-2137493-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2137493-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

环境全面检测脚本（安全加固版）

适用于受限虚拟主机（如 InfinityFree）

用完后请立即删除！

[PHP] *纯文本查看* *复制代码*
 $cat, 'name' => $name, 'ok' => $ok, 'detail' => $detail, 'level' => $level];
    if ($ok) $passed++;
    elseif ($level === 'warn') $warned++;
    else $failed++;
}

function h($s) { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }

/** 安全调用可能被禁用的函数 */
function safe_call($fn, $args = [], $default = null) {
    if (!function_exists($fn)) return $default;
    try { return @call_user_func_array($fn, $args); }
    catch (\Throwable $e) { return $default; }
}

/* ========== 1. PHP 基本信息 ========== */
$cat = 'PHP 基本信息';
check($cat, 'PHP 版本', version_compare(PHP_VERSION, '7.4.0', '>='), '当前：' . PHP_VERSION);
check($cat, '运行方式', true, 'php_sapi=' . PHP_SAPI);
check($cat, '时区', true, '当前时间：' . date('Y-m-d H:i:s') . '（Asia/Shanghai）');
check($cat, 'max_execution_time', true, ini_get('max_execution_time') . ' 秒');
check($cat, 'memory_limit', true, ini_get('memory_limit'));
check($cat, 'upload_max_filesize', true, ini_get('upload_max_filesize'));
check($cat, 'post_max_size', true, ini_get('post_max_size'));
check($cat, 'display_errors', true, ini_get('display_errors') ? 'On' : 'Off');

/* ========== 2. PHP 扩展 ========== */
$cat = 'PHP 扩展';
$exts = [
    'openssl'  => ['SSL/TLS 加密（SMTP 必需）', 'normal'],
    'curl'     => ['cURL HTTP/SMTP 客户端（邮件回退必需）', 'normal'],
    'mbstring' => ['多字节字符串处理', 'warn'],
    'json'     => ['JSON 编解码（核心）', 'normal'],
    'session'  => ['Session 支持', 'normal'],
    'fileinfo' => ['文件类型检测', 'warn'],
    'gd'       => ['GD 图像处理（可选）', 'warn'],
    'exif'     => ['EXIF 读取（可选）', 'warn'],
    'zip'      => ['ZIP 压缩', 'warn'],
    'iconv'    => ['字符编码转换', 'warn'],
    'ctype'    => ['字符类型检测', 'warn'],
    'filter'   => ['过滤器（FILTER_VALIDATE_EMAIL）', 'normal'],
];
foreach ($exts as $ext => [$desc, $level]) {
    $loaded = extension_loaded($ext);
    check($cat, $ext, $loaded, $desc . ' — ' . ($loaded ? '已加载&#10003;' : '未加载&#10007;'), $level);
}

/* ========== 3. 关键函数可用性 ========== */
$cat = '关键函数';
$funcs = [
    'stream_socket_client' => 'SMTP socket 连接',
    'stream_socket_enable_crypto' => 'TLS 加密升级',
    'stream_context_create' => '流上下文',
    'fsockopen' => '网络连接',
    'curl_init' => 'cURL 初始化',
    'curl_setopt' => 'cURL 设置',
    'mail' => 'PHP mail() 函数',
    'json_encode' => 'JSON 编码',
    'base64_encode' => 'Base64 编码',
    'chunk_split' => '分块分割',
    'password_hash' => '密码哈希',
    'mb_encode_mimeheader' => '邮件头编码',
    'move_uploaded_file' => '文件上传',
    'fopen' => '文件打开',
    'file_get_contents' => '文件读取',
    'file_put_contents' => '文件写入',
    'is_writable' => '可写检测',
    'mkdir' => '创建目录',
    'glob' => '文件搜索',
    'gethostbynamel' => 'DNS 解析',
    'disk_free_space' => '磁盘空间检测',
    'disk_total_space' => '磁盘总量检测',
    'apache_get_modules' => 'Apache 模块列表',
];
foreach ($funcs as $fn => $desc) {
    $exists = function_exists($fn);
    $lvl = in_array($fn, ['mail', 'gethostbynamel', 'disk_free_space', 'disk_total_space', 'apache_get_modules', 'mb_encode_mimeheader', 'glob']) ? 'warn' : 'normal';
    check($cat, $fn, $exists, $desc . ' — ' . ($exists ? '可用&#10003;' : '不可用&#10007;'), $lvl);
}

/* ========== 4. 被禁用的函数 ========== */
$cat = '禁用函数检测';
$disabled = ini_get('disable_functions');
if (empty($disabled)) {
    check($cat, '禁用函数', true, 'disable_functions 为空');
} else {
    $disabled_list = array_filter(array_map('trim', explode(',', $disabled)));
    $critical = ['fsockopen', 'stream_socket_client', 'curl_init', 'mail', 'file_get_contents', 'file_put_contents', 'fopen', 'mkdir', 'unlink', 'disk_total_space', 'disk_free_space', 'gethostbynamel'];
    foreach ($critical as $fn) {
        $is_disabled = in_array($fn, $disabled_list);
        check($cat, $fn, !$is_disabled, $is_disabled ? "已禁用&#10007;" : '未禁用&#10003;', $is_disabled ? 'normal' : 'warn');
    }
    check($cat, '完整禁用列表', true, count($disabled_list) . ' 个：' . implode(', ', $disabled_list));
}

/* ========== 5. SSL/TLS 传输检测 ========== */
$cat = 'SSL/TLS 传输';
if (function_exists('stream_get_transports')) {
    $transports = stream_get_transports();
    check($cat, 'ssl 传输', in_array('ssl', $transports), in_array('ssl', $transports) ? '可用&#10003;' : '不可用&#10007;（需 OpenSSL）');
    check($cat, 'tls 传输', in_array('tls', $transports), in_array('tls', $transports) ? '可用&#10003;' : '不可用&#10007;');
    check($cat, 'tcp 传输', in_array('tcp', $transports), in_array('tcp', $transports) ? '可用&#10003;' : '不可用&#10007;');
    check($cat, '可用传输列表', true, implode(', ', $transports) ?: '（空）');
} else {
    check($cat, 'stream_get_transports', false, '函数不可用', 'warn');
}

/* ========== 6. cURL 能力检测 ========== */
$cat = 'cURL 能力';
if (function_exists('curl_version')) {
    $cv = @curl_version();
    if ($cv) {
        check($cat, 'cURL 版本', true, $cv['version']);
        check($cat, 'SSL 版本', !empty($cv['ssl_version']), $cv['ssl_version'] ?: '（无 SSL）');
        $features = [];
        $feat_map = ['CURL_VERSION_SSL' => 'SSL', 'CURL_VERSION_HTTP' => 'HTTP', 'CURL_VERSION_SMTP' => 'SMTP', 'CURL_VERSION_SMTPS' => 'SMTPS'];
        foreach ($feat_map as $const => $label) {
            if (defined($const) && ($cv['features'] & constant($const))) $features[] = $label;
        }
        check($cat, '支持特性', true, empty($features) ? '（无）' : implode(', ', $features));
        // 关键 SMTP 常量
        $smtp_opts = ['CURLOPT_MAIL_FROM', 'CURLOPT_MAIL_RCPT', 'CURLOPT_USERNAME', 'CURLOPT_PASSWORD', 'CURLOPT_USE_SSL'];
        foreach ($smtp_opts as $const_name) {
            $defined = defined($const_name);
            check($cat, $const_name, $defined, $defined ? '常量值=' . constant($const_name) : '未定义&#10007;', 'warn');
        }
    }
} else {
    check($cat, 'cURL 扩展', false, 'cURL 未安装', 'warn');
}

/* ========== 7. 读取站点 SMTP 配置 ========== */
$cfg = [];
$config_files = [__DIR__ . '/data/config.json', __DIR__ . '/config.json'];
foreach ($config_files as $cf) {
    if (is_file($cf) && function_exists('file_get_contents')) {
        $raw = @file_get_contents($cf);
        if ($raw) {
            $json = @json_decode($raw, true);
            if (is_array($json)) { $cfg = array_merge($cfg, $json); }
        }
    }
}
// 也尝试 conf/local.php
$local_php = __DIR__ . '/conf/local.php';
if (is_file($local_php) && function_exists('file_get_contents')) {
    $raw = @file_get_contents($local_php);
    if ($raw && function_exists('preg_match_all')) {
        preg_match_all("/\\\$conf\['(\w+)'\]\s*=\s*'([^']*)'/", $raw, $m);
        if (!empty($m[1])) for ($i = 0; $i  ['verify_peer' => false, 'verify_peer_name' => false, 'allow_self_signed' => true]]);
    $ssl_fp = @stream_socket_client($remote, $errno, $errstr, 10, STREAM_CLIENT_CONNECT, $ctx);
    check($cat2, "stream_socket 连接", $ssl_fp !== false, $ssl_fp ? '成功&#10003;（OpenSSL 可用）' : "失败&#10007; [{$errno}] {$errstr}");

    if ($ssl_fp) {
        @stream_set_timeout($ssl_fp, 5);
        $welcome = @fgets($ssl_fp, 515);
        check($cat2, 'SMTP 欢迎语', true, trim($welcome));

        // EHLO
        @fwrite($ssl_fp, "EHLO env.test\r\n");
        $ehlo = '';
        while ($line = @fgets($ssl_fp, 515)) { $ehlo .= $line; if (isset($line[3]) && $line[3] === ' ') break; }
        $ehlo_code = (int)substr(trim($ehlo), 0, 3);
        $features = [];
        foreach (explode("\n", $ehlo) as $l) {
            if (preg_match('/^(\d+)-?(\S+)\s*(.*)/', trim($l), $m)) $features[] = $m[2];
        }
        check($cat2, 'EHLO', $ehlo_code === 250, "code={$ehlo_code} 特性：" . implode(', ', $features));

        // STARTTLS（仅 tls/587 需要）
        $tls_done = true; // ssl:// 直连不需要 STARTTLS
        if ($smtp_crypto === 'tls' || $smtp_port == 587) {
            @fwrite($ssl_fp, "STARTTLS\r\n");
            $stls = @fgets($ssl_fp, 515);
            $stls_code = (int)substr($stls, 0, 3);
            if ($stls_code === 220) {
                if (function_exists('stream_socket_enable_crypto')) {
                    $tls_ok = @stream_socket_enable_crypto($ssl_fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
                    check($cat2, 'STARTTLS 握手', $tls_ok, $tls_ok ? '成功&#10003;' : '失败&#10007;（OpenSSL 扩展问题）');
                    $tls_done = $tls_ok;
                    if ($tls_ok) {
                        // 重新 EHLO
                        @fwrite($ssl_fp, "EHLO env.test\r\n");
                        $ehlo2 = '';
                        while ($line = @fgets($ssl_fp, 515)) { $ehlo2 .= $line; if (isset($line[3]) && $line[3] === ' ') break; }
                    }
                } else {
                    check($cat2, 'STARTTLS 握手', false, 'stream_socket_enable_crypto 函数不可用');
                    $tls_done = false;
                }
            } else {
                check($cat2, 'STARTTLS 请求', false, "服务器拒绝 code={$stls_code}", 'warn');
                $tls_done = false;
            }
        }

        // AUTH LOGIN 测试（ssl:// 直连和 tls:// STARTTLS 后都测）
        if ($tls_done && $ehlo_code === 250) {
            @fwrite($ssl_fp, "AUTH LOGIN\r\n");
            $auth = @fgets($ssl_fp, 515);
            $auth_code = (int)substr($auth, 0, 3);
            check($cat2, 'AUTH LOGIN', $auth_code === 334, "code={$auth_code}（期望334）");

            if ($auth_code === 334 && !empty($smtp_user)) {
                @fwrite($ssl_fp, base64_encode($smtp_user) . "\r\n");
                $r1 = @fgets($ssl_fp, 515);
                $r1_code = (int)substr($r1, 0, 3);
                check($cat2, '用户名验证', $r1_code === 334, "code={$r1_code}");

                if ($r1_code === 334 && !empty($smtp_pass)) {
                    @fwrite($ssl_fp, base64_encode($smtp_pass) . "\r\n");
                    $r2 = @fgets($ssl_fp, 515);
                    $r2_code = (int)substr($r2, 0, 3);
                    check($cat2, '密码/授权码', $r2_code === 235, "code={$r2_code}" . ($r2_code === 235 ? ' 认证成功&#10003;' : ' → ' . trim($r2)));
                }
            }
        }
        @fwrite($ssl_fp, "QUIT\r\n");
        @fclose($ssl_fp);
    }
} else {
    check($cat2, 'stream_socket', false, 'stream_socket_client 不可用', 'warn');
}

/* ========== 9. cURL SMTP 连接测试 ========== */
$cat = 'cURL SMTP 测试';
if (function_exists('curl_init') && !empty($smtp_user)) {
    $curl_ports = [];
    if ($smtp_port == 465 || $smtp_crypto === 'ssl') {
        $curl_ports[] = ['scheme' => 'smtps', 'port' => 465, 'use_ssl' => false];
        $curl_ports[] = ['scheme' => 'smtp', 'port' => 587, 'use_ssl' => true];
    } else {
        $curl_ports[] = ['scheme' => 'smtp', 'port' => 587, 'use_ssl' => true];
        $curl_ports[] = ['scheme' => 'smtps', 'port' => 465, 'use_ssl' => false];
    }
    foreach ($curl_ports as $tp) {
        $url = $tp['scheme'] . '://' . $smtp_host . ':' . $tp['port'];
        $ch = curl_init();
        $opts = [
            CURLOPT_URL => $url,
            CURLOPT_CONNECT_ONLY => true,
            CURLOPT_USERNAME => $smtp_user,
            CURLOPT_PASSWORD => $smtp_pass,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => 0,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_TIMEOUT => 15,
        ];
        if ($tp['use_ssl'] && defined('CURLUSE_ALL')) $opts[CURLOPT_USE_SSL] = CURLUSE_ALL;
        curl_setopt_array($ch, $opts);
        $result = @curl_exec($ch);
        $errno = curl_errno($ch);
        $error = curl_error($ch);
        curl_close($ch);
        check($cat, "cURL {$url}", $errno === 0 && $result, $errno === 0 ? '连接+认证成功&#10003;' : "失败&#10007; [{$errno}] {$error}", 'warn');
    }
} else {
    check($cat, 'cURL SMTP', false, 'cURL 不可用或 SMTP 未配置', 'warn');
}

/* ========== 10. 文件系统权限 ========== */
$cat = '文件系统权限';
$check_dirs = [
    'data/', 'data/uploads/', 'data/uploads/talk/', 'data/uploads/bottle/', 'data/uploads/capsule/',
    'data/tmp/', 'data/user_shard/', 'data/bottle_shard/', 'data/capsule_shard/',
    'data/notify_shard/', 'data/mail_log_shard/', 'data/mail_retry_shard/', 'data/session/',
];
$dir_names = [
    'data/' => '数据目录', 'data/uploads/' => '上传目录', 'data/uploads/talk/' => '聊天图片',
    'data/uploads/bottle/' => '漂流瓶图片', 'data/uploads/capsule/' => '胶囊图片',
    'data/tmp/' => '临时文件', 'data/user_shard/' => '用户数据', 'data/bottle_shard/' => '漂流瓶数据',
    'data/capsule_shard/' => '胶囊数据', 'data/notify_shard/' => '通知数据',
    'data/mail_log_shard/' => '邮件日志', 'data/mail_retry_shard/' => '邮件重试', 'data/session/' => '会话',
];
foreach ($check_dirs as $dir) {
    $path = __DIR__ . '/' . $dir;
    $desc = $dir_names[$dir] ?? $dir;
    if (is_dir($path)) {
        $w = function_exists('is_writable') ? @is_writable($path) : false;
        check($cat, $dir, $w, $desc . ' — ' . ($w ? '可写&#10003;' : '不可写&#10007;'), $w ? 'normal' : 'warn');
    } else {
        $created = function_exists('mkdir') ? @mkdir($path, 0755, true) : false;
        check($cat, $dir, $created, $desc . ' — ' . ($created ? '已创建&#10003;' : '不存在&#10007;'), 'warn');
    }
}

/* ========== 11. 磁盘空间 ========== */
$cat = '磁盘空间';
$free = function_exists('disk_free_space') ? @disk_free_space(__DIR__) : false;
$total = function_exists('disk_total_space') ? @disk_total_space(__DIR__) : false;
if ($free !== false && $total !== false && $total > 0) {
    check($cat, '磁盘空间', $free > 10 * 1048576, "总：" . round($total/1048576,1) . "MB 可用：" . round($free/1048576,1) . "MB 已用：" . round(($total-$free)/$total*100,1) . "%");
} else {
    check($cat, '磁盘空间', false, 'disk_free_space/disk_total_space 不可用', 'warn');
}

// data 目录大小
$data_size = 0;
$data_path = __DIR__ . '/data';
if (is_dir($data_path) && class_exists('RecursiveIteratorIterator')) {
    try {
        $iter = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($data_path, FilesystemIterator::SKIP_DOTS));
        foreach ($iter as $file) { if ($file->isFile()) $data_size += $file->getSize(); }
    } catch (\Throwable $e) {}
}
check($cat, 'data/ 目录大小', true, round($data_size / 1048576, 2) . ' MB');

/* ========== 12. Web 服务器 ========== */
$cat = 'Web 服务器';
check($cat, '服务器软件', true, $_SERVER['SERVER_SOFTWARE'] ?? '未知');
check($cat, 'Document Root', true, $_SERVER['DOCUMENT_ROOT'] ?? '未知');
check($cat, 'HTTPS', !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off', $_SERVER['HTTPS'] ?? 'off');
check($cat, '协议', true, $_SERVER['SERVER_PROTOCOL'] ?? '未知');

if (function_exists('apache_get_modules')) {
    $mods = apache_get_modules();
    $mod_list = ['mod_rewrite', 'mod_deflate', 'mod_expires', 'mod_headers', 'mod_filter'];
    foreach ($mod_list as $m) {
        check($cat, $m, in_array($m, $mods), in_array($m, $mods) ? '已加载&#10003;' : '未加载&#10007;', 'warn');
    }
} else {
    check($cat, 'Apache 模块', false, 'apache_get_modules 不可用（可能是 CGI/FPM 模式）', 'warn');
}

check($cat, '.htaccess 存在', is_file(__DIR__ . '/.htaccess'), is_file(__DIR__ . '/.htaccess') ? '存在&#10003;' : '不存在&#10007;', 'warn');
check($cat, 'data/.htaccess 存在', is_file(__DIR__ . '/data/.htaccess'), is_file(__DIR__ . '/data/.htaccess') ? '存在&#10003;' : '不存在&#10007;', 'warn');

/* ========== 13. 配置文件检测 ========== */
$cat = '配置文件';
$files = [
    'data/config.json' => '站点主配置', 'mail_smtp.php' => 'SMTP 邮件类',
    'common.php' => '公共函数库', 'shard_json.php' => '分片存储引擎',
    'cron_task.php' => '定时任务', '.htaccess' => 'Apache 重写规则',
];
foreach ($files as $file => $desc) {
    $path = __DIR__ . '/' . $file;
    $exists = is_file($path);
    $size = $exists ? @filesize($path) : 0;
    $perms = ($exists && function_exists('fileperms')) ? substr(sprintf('%o', @fileperms($path)), -4) : '-';
    check($cat, $file, $exists, $desc . ' — ' . ($exists ? "{$size}B 权限{$perms}" : '不存在'), $exists ? 'normal' : 'warn');
}

/* ========== 14. Session 配置 ========== */
$cat = 'Session 配置';
check($cat, 'save_handler', true, ini_get('session.save_handler') ?: '(默认)');
check($cat, 'save_path', true, ini_get('session.save_path') ?: '(系统临时目录)');
check($cat, 'cookie_httponly', true, ini_get('session.cookie_httponly') ? 'On&#10003;' : 'Off（建议 On）');
check($cat, 'use_strict_mode', true, ini_get('session.use_strict_mode') ? 'On' : 'Off');

/* ========== 15. 上传配置 ========== */
$cat = '上传配置';
check($cat, 'file_uploads', (bool)ini_get('file_uploads'), ini_get('file_uploads') ? 'On&#10003;' : 'Off&#10007;');
check($cat, 'max_input_time', true, ini_get('max_input_time') . ' 秒');
check($cat, 'max_file_uploads', true, ini_get('max_file_uploads') . ' 个');

/* ========== 16. 网络与 DNS ========== */
$cat = '网络与 DNS';
if (function_exists('gethostbynamel')) {
    $dns = @gethostbynamel('smtp.qq.com');
    check($cat, 'DNS 解析 smtp.qq.com', !empty($dns), $dns ? '解析到：' . implode(', ', $dns) : '解析失败');
} else {
    check($cat, 'DNS 解析', false, 'gethostbynamel 不可用', 'warn');
}

/* ========== 17. OPcache ========== */
$cat = 'OPcache';
if (function_exists('opcache_get_status')) {
    $op = @opcache_get_status(false);
    if ($op && !empty($op['opcache_statistics'])) {
        check($cat, 'OPcache 启用', true, "缓存 {$op['opcache_statistics']['num_cached_keys']} 个脚本");
        check($cat, '命中率', true, round($op['opcache_statistics']['opcache_hit_rate'], 2) . '%');
    } else {
        check($cat, 'OPcache', false, '已加载但无法获取状态', 'warn');
    }
} else {
    check($cat, 'OPcache', false, '未加载', 'warn');
}

/* ========== 输出 ========== */
?>

环境检测报告

# 环境全面检测报告

总检测项

通过

失败

警告

（原文含表格，请查看原文链接）

### 安全提醒

    本脚本包含 SMTP 密码等敏感信息，**检测结果后请立即删除此文件！**

    生成时间：（上海时区）| PHP

> 最终效果如下

**环境全面检测报告**

107总检测项

96

通过

2

失败

9

警告
分类
状态
检测项
详情

PHP 基本信息

PHP 基本信息&#10003;
PHP 版本当前：8.3.29

PHP 基本信息&#10003;
运行方式php_sapi=apache2handler

PHP 基本信息&#10003;
时区当前时间：2026-11-13 17:00:39（Asia/Shanghai）

PHP 基本信息&#10003;
max_execution_time30 秒

PHP 基本信息&#10003;
memory_limit128M

PHP 基本信息&#10003;
upload_max_filesize2M

PHP 基本信息&#10003;
post_max_size8M

PHP 基本信息&#10003;
display_errorsOn

PHP 扩展

PHP 扩展&#10003;
opensslSSL/TLS 加密（SMTP 必需） — 已加载&#10003;

PHP 扩展&#10003;
curlcURL HTTP/SMTP 客户端（邮件回退必需） — 已加载&#10003;

PHP 扩展&#10003;
mbstring多字节字符串处理 — 已加载&#10003;

PHP 扩展&#10003;
jsonJSON 编解码（核心） — 已加载&#10003;

PHP 扩展&#10003;
sessionSession 支持 — 已加载&#10003;

PHP 扩展&#10003;
fileinfo文件类型检测 — 已加载&#10003;

PHP 扩展&#10003;
gdGD 图像处理（可选） — 已加载&#10003;

PHP 扩展&#10003;
exifEXIF 读取（可选） — 已加载&#10003;

PHP 扩展&#10003;
zipZIP 压缩 — 已加载&#10003;

PHP 扩展&#10003;
iconv字符编码转换 — 已加载&#10003;

PHP 扩展&#10003;
ctype字符类型检测 — 已加载&#10003;

PHP 扩展&#10003;
filter过滤器（FILTER_VALIDATE_EMAIL） — 已加载&#10003;

关键函数

关键函数&#10003;
stream_socket_clientSMTP socket 连接 — 可用&#10003;

关键函数&#10003;
stream_socket_enable_cryptoTLS 加密升级 — 可用&#10003;

关键函数&#10003;
stream_context_create流上下文 — 可用&#10003;

关键函数&#10003;
fsockopen网络连接 — 可用&#10003;

关键函数&#10003;
curl_initcURL 初始化 — 可用&#10003;

关键函数&#10003;
curl_setoptcURL 设置 — 可用&#10003;

关键函数&#10003;
mailPHP mail() 函数 — 可用&#10003;

关键函数&#10003;
json_encodeJSON 编码 — 可用&#10003;

关键函数&#10003;
base64_encodeBase64 编码 — 可用&#10003;

关键函数&#10003;
chunk_split分块分割 — 可用&#10003;

关键函数&#10003;
password_hash密码哈希 — 可用&#10003;

关键函数&#10003;
mb_encode_mimeheader邮件头编码 — 可用&#10003;

关键函数&#10003;
move_uploaded_file文件上传 — 可用&#10003;

关键函数&#10003;
fopen文件打开 — 可用&#10003;

关键函数&#10003;
file_get_contents文件读取 — 可用&#10003;

关键函数&#10003;
file_put_contents文件写入 — 可用&#10003;

关键函数&#10003;
is_writable可写检测 — 可用&#10003;

关键函数&#10003;
mkdir创建目录 — 可用&#10003;

关键函数&#10003;
glob文件搜索 — 可用&#10003;

关键函数&#10003;
gethostbynamelDNS 解析 — 可用&#10003;

关键函数&#10003;
disk_free_space磁盘空间检测 — 可用&#10003;

关键函数&#10003;
disk_total_space磁盘总量检测 — 可用&#10003;

关键函数&#10003;
apache_get_modulesApache 模块列表 — 可用&#10003;

禁用函数检测

禁用函数检测&#10003;
禁用函数disable_functions 为空

SSL/TLS 传输

SSL/TLS 传输&#10003;
ssl 传输可用&#10003;

SSL/TLS 传输&#10003;
tls 传输可用&#10003;

SSL/TLS 传输&#10003;
tcp 传输可用&#10003;

SSL/TLS 传输&#10003;
可用传输列表tcp, udp, ssl, tls, tlsv1.0, tlsv1.1, tlsv1.2, tlsv1.3

cURL 能力

cURL 能力&#10003;
cURL 版本8.21.0

cURL 能力&#10003;
SSL 版本OpenSSL/3.0.21

cURL 能力&#10003;
支持特性SSL

cURL 能力&#10003;
CURLOPT_MAIL_FROM常量值=10186

cURL 能力&#10003;
CURLOPT_MAIL_RCPT常量值=10187

cURL 能力&#10003;
CURLOPT_USERNAME常量值=10173

cURL 能力&#10003;
CURLOPT_PASSWORD常量值=10174

cURL 能力&#10003;
CURLOPT_USE_SSL常量值=119

SMTP 配置与连通

SMTP 配置与连通&#10007;
SMTP 配置host=smtp.qq.com port=465 crypto=ssl user=(空) pass=(空)

SMTP 配置与连通&#10003;
端口 465可连接&#10003; —

SMTP 配置与连通&#10003;
端口 587可连接&#10003; — 220 newxmesmtplogicsvrszc43-0.qq.com XMail Esmtp QQ Mail Server.

SMTP 配置与连通&#10003;
端口 25可连接&#10003; — 220 newxmesmtplogicsvrszb43-0.qq.com XMail Esmtp QQ Mail Server.

SMTP Socket 测试

SMTP Socket 测试&#10003;
stream_socket 连接成功&#10003;（OpenSSL 可用）

SMTP Socket 测试&#10003;
SMTP 欢迎语220 newxmesmtplogicsvrszc50-0.qq.com XMail Esmtp QQ Mail Server.

SMTP Socket 测试&#10003;
EHLOcode=250 特性：newxmesmtplogicsvrszc50-0.qq.com, PIPELINING, SIZE, AUTH, AUTH=LOGIN, MAILCOMPRESS, SMTPUTF8, 0

SMTP Socket 测试&#10003;
AUTH LOGINcode=334（期望334）

cURL SMTP 测试

cURL SMTP 测试&#9888;
cURL SMTPcURL 不可用或 SMTP 未配置

文件系统权限

文件系统权限&#10003;
data/数据目录 — 可写&#10003;

文件系统权限&#10003;
data/uploads/上传目录 — 可写&#10003;

文件系统权限&#10003;
data/uploads/talk/聊天图片 — 可写&#10003;

文件系统权限&#10003;
data/uploads/bottle/漂流瓶图片 — 可写&#10003;

文件系统权限&#10003;
data/uploads/capsule/胶囊图片 — 可写&#10003;

文件系统权限&#10003;
data/tmp/临时文件 — 可写&#10003;

文件系统权限&#10003;
data/user_shard/用户数据 — 可写&#10003;

文件系统权限&#10003;
data/bottle_shard/漂流瓶数据 — 可写&#10003;

文件系统权限&#10003;
data/capsule_shard/胶囊数据 — 可写&#10003;

文件系统权限&#10003;
data/notify_shard/通知数据 — 可写&#10003;

文件系统权限&#10003;
data/mail_log_shard/邮件日志 — 可写&#10003;

文件系统权限&#10003;
data/mail_retry_shard/邮件重试 — 可写&#10003;

文件系统权限&#10003;
data/session/会话 — 可写&#10003;

磁盘空间

磁盘空间&#10003;
磁盘空间总：122879MB 可用：118858.5MB 已用：3.3%

磁盘空间&#10003;
data/ 目录大小0 MB

Web 服务器

Web 服务器&#10003;
服务器软件Apache/2.4.57 (Win64) OpenSSL/1.1.1t PHP/8.3.29

Web 服务器&#10003;
Document RootX:/www

Web 服务器&#10007;
HTTPSoff

Web 服务器&#10003;
协议HTTP/1.1

Web 服务器&#10003;
mod_rewrite已加载&#10003;

Web 服务器&#10003;
mod_deflate已加载&#10003;

Web 服务器&#10003;
mod_expires已加载&#10003;

Web 服务器&#10003;
mod_headers已加载&#10003;

Web 服务器&#10003;
mod_filter已加载&#10003;

Web 服务器&#9888;
.htaccess 存在不存在&#10007;

Web 服务器&#9888;
data/.htaccess 存在不存在&#10007;

配置文件

配置文件&#9888;
data/config.json站点主配置 — 不存在

配置文件&#9888;
mail_smtp.phpSMTP 邮件类 — 不存在

配置文件&#9888;
common.php公共函数库 — 不存在

配置文件&#9888;
shard_json.php分片存储引擎 — 不存在

配置文件&#9888;
cron_task.php定时任务 — 不存在

配置文件&#9888;
.htaccessApache 重写规则 — 不存在

Session 配置

Session 配置&#10003;
save_handlerfiles

Session 配置&#10003;
save_path(系统临时目录)

Session 配置&#10003;
cookie_httponlyOff（建议 On）

Session 配置&#10003;
use_strict_modeOff

上传配置

上传配置&#10003;
file_uploadsOn&#10003;

上传配置&#10003;
max_input_time60 秒

上传配置&#10003;
max_file_uploads20 个

网络与 DNS

网络与 DNS&#10003;
DNS 解析 smtp.qq.com解析到：120.241.140.18, 120.233.23.191

OPcache

OPcache&#10003;
OPcache 启用缓存 2 个脚本

OPcache&#10003;
命中率50%

**安全提醒**本脚本包含 SMTP 密码等敏感信息，**检测结果后请立即删除此文件！**

生成时间：2026-11-13 17:00:42（上海时区）| PHP 8.3.29

---

[查看原文](https://www.52pojie.cn/thread-2137493-1-1.html)
