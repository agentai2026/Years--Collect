---
title: "PHP+易语言邮箱通知代码"
published: 2026-11-24
description: "最近找不到用易语言发送邮箱代码，自己写了一个"
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "xohbiz"
sourceLink: "https://www.52pojie.cn/thread-2139361-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2139361-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

**最近找不到用易语言发送邮箱代码，自己写了一个PHP+易语言邮箱通知代码，主要用途设置定时完成任务后任务结果直接推送到邮箱方便查看随时可查看任务状态！**

**PHP代码直接挂到****phpstudy可以本地用也可以放到服务器上，可以参考修改用。**

[PHP] *纯文本查看* *复制代码*
 0, "msg" => "连接失败：{$errstr} ({$errno})"];
    }
    stream_set_timeout($socket, 15);
    $read = function () use ($socket) {
        $data = '';
        while ($line = fgets($socket, 512)) {
            $data .= $line;
            if (substr($line, 3, 1) == ' ') break;
        }
        return $data;
    };
    $write = function ($cmd) use ($socket) {
        fwrite($socket, $cmd . "\r\n");
    };
    $read();
    $write("EHLO localhost");
    $read();
    $write("AUTH LOGIN");
    $read();
    $write(base64_encode($smtp_user));
    $read();
    $write(base64_encode($smtp_pwd));
    $read();
    $write("MAIL FROM:");
    $read();
    $write("RCPT TO:");
    $read();
    $write("DATA");
    $read();
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=utf-8\r\n";
    $headers .= "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=\r\n";
    $headers .= "From: 任务提醒系统 \r\n";
    $headers .= "To: \r\n";
    $write($headers . "\r\n" . $html_body . "\r\n.");
    $resp = $read();
    $write("QUIT");
    fclose($socket);
    if (strpos($resp, '250') !== false) {
        return ["code" => 1, "msg" => "发送成功"];
    } else {
        return ["code" => 0, "msg" => "SMTP返回：{$resp}"];
    }
}

// 优先json，其次POST，最后GET
$raw = file_get_contents('php://input');
$jsonData = json_decode($raw, true);
if(is_array($jsonData)){
    $p = $jsonData;
}elseif(!empty($_POST)){
    $p = $_POST;
}else{
    $p = $_GET;
}

$qq_str     = isset($p['qq']) ? trim($p['qq']) : '';
$task_id    = isset($p['task_id']) ? trim($p['task_id']) : '';
$title      = isset($p['title']) ? trim($p['title']) : '';
$content    = isset($p['content']) ? trim($p['content']) : '';
$finish     = isset($p['finish']) ? trim($p['finish']) : '';
$account    = isset($p['account']) ? trim($p['account']) : '';
$gold       = isset($p['gold']) ? trim($p['gold']) : '0';
$level      = isset($p['level']) ? trim($p['level']) : '0';
$checkin    = isset($p['checkin']) ? trim($p['checkin']) : '0';
$points     = isset($p['points']) ? trim($p['points']) : '0';
$visit      = isset($p['visit']) ? trim($p['visit']) : '0';
$vip_level  = isset($p['vip_level']) ? trim($p['vip_level']) : '0';

$miss = [];
if(empty($qq_str)) $miss[] = 'qq';
if(empty($task_id)) $miss[] = 'task_id';
if(empty($title)) $miss[] = 'title';
if(empty($content)) $miss[] = 'content';
if(empty($finish)) $miss[] = 'finish';
if(empty($account)) $miss[] = 'account';

if(!empty($miss)){
    echo json_encode([
        "code"=>-1,
        "msg"=>"缺少必填参数",
        "missing"=>$miss,
        "data"=>[]
    ],JSON_UNESCAPED_UNICODE);
    exit;
}

$qq_arr = explode(',', $qq_str);
$toList = [];
foreach ($qq_arr as $qq) {
    $qq = trim($qq);
    if($qq !== ''){
        $toList[] = $qq . '@qq.com';
    }
}
if(empty($toList)){
    echo json_encode([
        "code"=>-1,
        "msg"=>"解析不到有效收件QQ",
        "data"=>[]
    ],JSON_UNESCAPED_UNICODE);
    exit;
}

$smtp_host = 'smtp.qq.com';
$smtp_port = 465;
$smtp_user = '输入自己的[email]QQ@qq.com[/email]';
$smtp_pwd = '16位授权码';

$subject = "【任务提醒】{$title}";
$time = date('Y-m-d H:i:s');

// 自动判断完成状态class
$finishClass = ($finish === '是') ? 'status-done' : '';

$htmlBody = 提醒时间
                {$time}

            -
                任务内容
                {$content}

            -
                金币
                {$gold}

            -
                等级
                {$level}

            -
                打卡
                {$checkin}

            -
                点券
                {$points}

            -
                访问量
                {$visit}

            -
                VIP等级
                {$vip_level}

            -
                是否完成

                    {$finish}

            -
                账号信息
                {$account}

        本邮件由任务提醒系统自动发送，请及时处理。

HTML;

$result = [];
foreach ($toList as $email) {
    $sendRet = sendSmtpMail($smtp_host, $smtp_port, $smtp_user, $smtp_pwd, $email, $subject, $htmlBody);
    $result[$email] = $sendRet;
}

echo json_encode([
    "code"=>1,
    "msg"=>"发送完成",
    "data"=>["result"=>$result]
],JSON_UNESCAPED_UNICODE);
exit;
?>

**GET完整系列展示效果**

![](https://static.52pojie.cn/static/image/common/none.gif)

**98.png** *(31.82 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg5NzY4OHw2Yzg4MjNjYnwxNzk1NDk1NzM3fDB8MjEzOTM2MQ%3D%3D&nothumb=yes)

2026-11-24 01:49 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**微信提示.png** *(17.04 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg5NzY4OXwwZjM1M2IxNHwxNzk1NDk1NzM3fDB8MjEzOTM2MQ%3D%3D&nothumb=yes)

2026-11-24 01:53 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**邮箱数据.png** *(85.46 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg5NzY5MHxjOWM4MzQ4NHwxNzk1NDk1NzM3fDB8MjEzOTM2MQ%3D%3D&nothumb=yes)

2026-11-24 01:54 上传

易语言代码不怎么熟悉，希望大佬可以改进改进易语言代码，是设定时间执行完成任务，然后读取数据发送到邮箱。

![](https://static.52pojie.cn/static/image/common/none.gif)

**易语言界面.png** *(20.75 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg5NzY5MXwzZGIxOTdkMHwxNzk1NDk1NzM3fDB8MjEzOTM2MQ%3D%3D&nothumb=yes)

2026-11-24 01:58 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**代码界面.png** *(55.08 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg5NzY5Mnw5MWI0OTE1YnwxNzk1NDk1NzM3fDB8MjEzOTM2MQ%3D%3D&nothumb=yes)

2026-11-24 01:59 上传

![](https://static.52pojie.cn/static/image/filetype/rar.gif)

[发送邮箱代码.rar](forum.php?mod=attachment&aid=Mjg5NzY5M3w1MTBmOGIxOXwxNzk1NDk1NzM3fDB8MjEzOTM2MQ%3D%3D)

*(231.35 KB, 下载次数: 0)*

2026-11-24 02:01 上传

点击文件名下载附件

下载积分: 吾爱币 -1 CB

---

[查看原文](https://www.52pojie.cn/thread-2139361-1-1.html)
