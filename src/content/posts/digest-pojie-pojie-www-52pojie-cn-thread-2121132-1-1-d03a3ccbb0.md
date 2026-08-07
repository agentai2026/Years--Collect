---
title: "【PHP】个人简易网盘，简单上手，没有数据库！"
published: 2026-08-04
description: "【PHP】个人简易网盘，简单上手，没有数据库，供大家研究研究，直接放到网站目录下就可以使用！自己有空时随便写的，这是原型，大家可以自由编改使用。 1、可以上传下载单个文件，也可以批量上传文件夹，一般基础网盘功 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "linxingzhi"
sourceLink: "https://www.52pojie.cn/thread-2121132-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2121132-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

【PHP】个人简易网盘，简单上手，没有数据库，供大家研究研究，直接放到网站目录下就可以使用！自己有空时随便写的，这是原型，大家可以自由编改使用。

1、可以上传下载单个文件，也可以批量上传文件夹，一般基础网盘功能都有。分享功能，压缩下载，移动等。其他功能可以自行完善，比如登录加多个动态验证码，添加多用户区分管理员和普通用户等权限。

2、以下是部分代码。

[PHP] *纯文本查看* *复制代码*
:"\/\\|?*]/','_',$name);
}

// 安全路径：清除../防止目录穿越
function safePath($path){
    $path = preg_replace('/\.\.\//','',$path);
    $path = trim($path, '/');
    return $path;
}

// 遍历所有子目录（移动文件下拉框使用）
function scanAllDirs($base,$rel=""){
    $res=[];
    $basePath = $base.($rel?"/".$rel:"");
    if(!is_dir($basePath))return [];
    $dh=opendir($basePath);
    while($f=readdir($dh)){
        if($f=='.'||$f=='..')continue;
        $full=$basePath."/".$f;
        if(is_dir($full)){
            $subRel = $rel?($rel."/".$f):$f;
            $res[]=$subRel;
            $res = array_merge($res,scanAllDirs($base,$subRel));
        }
    }
    closedir($dh);
    return $res;
}

// 【修复版全局搜索函数】修复路径、增加安全过滤、session权限校验前置
function globalSearchFiles($baseDir, $keyword, $relPath = ""){
    global $_SESSION;
    // 未登录直接返回空
    if(!isset($_SESSION['login']) || !$_SESSION['login']) return [];
    $result = [];
    $currentFull = rtrim($baseDir,"/") . ($relPath ? "/".$relPath : "");
    if(!is_dir($currentFull)) return [];
    $dh = opendir($currentFull);
    while($f = readdir($dh)){
        if($f == '.' || $f == '..') continue;
        $fileFull = $currentFull . "/" . $f;
        $subRel = ($relPath === "") ? $f : $relPath."/".$f;
        // 关键词匹配
        if(stripos($f, $keyword) !== false){
            $ext = strtolower(pathinfo($f,PATHINFO_EXTENSION));
            $result[] = [
                "full_rel" => $subRel,
                "name" => $f,
                "parent_dir" => $relPath,
                "is_dir" => is_dir($fileFull),
                "size" => is_dir($fileFull) ? 0 : filesize($fileFull),
                "mtime" => date("Y-m-d H:i",filemtime($fileFull)),
                "ext" => $ext
            ];
        }
        // 递归子目录
        if(is_dir($fileFull)){
            $childList = globalSearchFiles($baseDir, $keyword, $subRel);
            $result = array_merge($result, $childList);
        }
    }
    closedir($dh);
    return $result;
}

// 文件夹打包工具
function zipFolder($src,$zipFile){
    if(!class_exists("ZipArchive"))return false;
    $zip=new ZipArchive();
    if(!$zip->open($zipFile,ZipArchive::CREATE|ZipArchive::OVERWRITE))return false;
    $files=new RecursiveIteratorIterator(new RecursiveDirectoryIterator($src,RecursiveDirectoryIterator::SKIP_DOTS),RecursiveIteratorIterator::SELF_FIRST);
    foreach($files as $f){
        $rel = substr($f->getRealPath(),strlen(realpath($src))+1);
        $f->isDir()?$zip->addEmptyDir($rel):$zip->addFile($f,$rel);
    }
    $zip->close();
    return true;
}
// 登录处理
$login_err = "";
if(isset($_POST['login'])){
    $pwd = trim($_POST['pwd']);
    if($pwd === $admin_pwd)$_SESSION['login']=true;
    else $login_err="密码错误";
}
// 退出登录
if(isset($_GET['logout'])){
    session_destroy();
    header("Location: index.php");
    exit;
}
// 未登录展示登录页
if(!isset($_SESSION['login'])||!$_SESSION['login']){
?>

集团内部网盘

## 集团内部网盘

        登录

[]],JSON_UNESCAPED_UNICODE);
        exit;
    }
    $resultList = globalSearchFiles($storage_dir, $kw);
    echo json_encode(["list"=>$resultList],JSON_UNESCAPED_UNICODE);
    exit;
}

// AJAX 创建分享
if(isset($_POST['ajax_create_share'])){
    header("Content-Type:application/json;charset=utf-8");
    $shareFile = safePath($_POST['share_file']);
    $isDirShare = isset($_POST['is_dir_share']) && $_POST['is_dir_share'] === '1';
    $exp = (int)$_POST['share_expire'];
    $pwd = trim($_POST['share_pwd']);
    $token = md5(uniqid().time());
    $expireTime = $exp === 0 ? 0 : time() + $exp * 3600;
    $data = json_encode([
        "token"=>$token,
        "path"=>$current_folder,
        "file"=>$shareFile,
        "is_dir"=>$isDirShare,
        "pwd"=>$pwd,
        "expire"=>$expireTime,
        "create_time"=>time()
    ],JSON_UNESCAPED_UNICODE);
    file_put_contents($share_dir."/".$token.".txt",$data);
    $shareUrl = $siteRoot."index.php?share=".$token;
    echo json_encode([
        "code"=>1,
        "url"=>$shareUrl,
        "pwd"=>$pwd,
        "token"=>$token
    ],JSON_UNESCAPED_UNICODE);
    exit;
}

// AJAX 获取分享列表
if(isset($_POST['ajax_get_share_list'])){
    header("Content-Type:application/json;charset=utf-8");
    $list = [];
    $dh = opendir($share_dir);
    while($f = readdir($dh)){
        if($f == '.' || $f == '..') continue;
        if(pathinfo($f,PATHINFO_EXTENSION) !== 'txt') continue;
        $token = pathinfo($f,PATHINFO_FILENAME);
        $filePath = $share_dir."/".$f;
        $raw = file_get_contents($filePath);
        $info = json_decode($raw,true);
        if(!is_array($info)) continue;
        $now = time();
        $isExpire = ($info['expire'] !== 0) && ($now > $info['expire']);
        $shareUrl = $siteRoot."index.php?share=".$token;
        $list[] = [
            "token"=>$token,
            "url"=>$shareUrl,
            "name"=>$info['file'],
            "parent_path"=>$info['path'],
            "is_dir"=>$info['is_dir'],
            "pwd"=>$info['pwd'],
            "expire"=>$info['expire'],
            "create_time"=>$info['create_time'],
            "is_expire"=>$isExpire,
            "expire_text"=>$info['expire']===0?"永久有效":date("Y-m-d H:i",$info['expire'])
        ];
    }
    closedir($dh);
    usort($list,function($a,$b){
        return $b['create_time'] - $a['create_time'];
    });
    echo json_encode(["list"=>$list],JSON_UNESCAPED_UNICODE);
    exit;
}

// AJAX 删除分享
if(isset($_POST['ajax_del_share'])){
    header("Content-Type:application/json;charset=utf-8");
    $token = safePath($_POST['token']);
    $file = $share_dir."/".$token.".txt";
    if(file_exists($file)){
        unlink($file);
        echo json_encode(["code"=>1,"msg"=>"删除成功"]);
    }else{
        echo json_encode(["code"=>0,"msg"=>"分享不存在"]);
    }
    exit;
}

// 文件流预览（图片/视频/PDF）
if(isset($_GET['stream'])){
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET,OPTIONS");
    if($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;
    $fileRel = safePath($_GET['stream']);
    $full = $storage_dir . "/" . $fileRel;
    if(!file_exists($full))die("文件不存在");
    $ext = strtolower(pathinfo($full,PATHINFO_EXTENSION));
    if(isImage($ext))header("Content-Type:image/*");
    elseif(isVideo($ext))header("Content-Type:video/*");
    elseif(isPdf($ext))header("Content-Type:application/pdf");
    else header("Content-Type:application/octet-stream");
    readfile($full);
    exit;
}

// AJAX 创建文件夹
if(isset($_POST['ajax_mkdir'])){
    header("Content-Type:application/json;charset=utf-8");
    $target_sub = trim($_POST['target_dir'] ?? '');
    $target_sub = safePath($target_sub);
    if(empty($target_sub)){
        echo json_encode(["code"=>0,"msg"=>"目录名称不能为空"]);
        exit;
    }
    $full_mk = rtrim($real_folder, '/') . '/' . $target_sub;
    $storageReal = realpath($storage_dir);
    $parentReal = realpath(rtrim($real_folder, '/'));
    if(!$parentReal || strpos($parentReal, $storageReal) !== 0){
        echo json_encode(["code"=>0,"msg"=>"非法目录路径"]);
        exit;
    }
    if(!file_exists($full_mk)){
        $res = mkdir($full_mk, 0755, true);
        if($res){
            echo json_encode(["code"=>1,"msg"=>"目录创建成功"]);
        }else{
            echo json_encode(["code"=>0,"msg"=>"目录创建失败，服务器权限不足"]);
        }
    }else{
        echo json_encode(["code"=>1,"msg"=>"目录已存在"]);
    }
    exit;
}

// AJAX 分片/拖拽上传
if(isset($_POST['ajax_upload'])){
    header("Content-Type:application/json;charset=utf-8");
    if(empty($_FILES['file'])){
        echo json_encode(["code"=>0,"msg"=>"未检测到文件"]);
        exit;
    }
    $file = $_FILES['file'];
    $oriName = $file['name'];
    $tmpPath = $file['tmp_name'];
    $fileSize = $file['size'];
    if($fileSize 0,"msg"=>"文件为空"]);
        exit;
    }
    $safeName = safeFileName($oriName);
    $relPath = trim($_POST['relative_path'] ?? '');
    $relPath = safePath($relPath);
    if(!empty($relPath)){
        $subDir = dirname($relPath);
        $targetDir = rtrim($real_folder, '/') . '/' . $subDir;
        if(!file_exists($targetDir)){
            mkdir($targetDir, 0755, true);
        }
        $saveFull = $targetDir . '/' . $safeName;
    }else{
        $saveFull = rtrim($real_folder, '/') . '/' . $safeName;
    }
    if(move_uploaded_file($tmpPath, $saveFull)){
        echo json_encode(["code"=>1,"msg"=>"上传成功"]);
    }else{
        echo json_encode(["code"=>0,"msg"=>"服务器写入失败，检查目录权限0755"]);
    }
    exit;
}

// 表单批量上传文件
if(!empty($_FILES['upfiles'])){
    $files = $_FILES['upfiles'];
    $cnt = count($files['name']);
    for($i=0;$igetRealPath();
                if(is_dir($filePath)){
                    rmdir($filePath);
                }else{
                    unlink($filePath);
                }
            }
            rmdir($p);
        }elseif(file_exists($p)){
            unlink($p);
        }
    }
    $redirectUrl = "index.php?dir=".urlencode($current_folder);
    if($sortby)$redirectUrl.="&sortby=".urlencode($sortby);
    if($sortorder)$redirectUrl.="&sortorder=".urlencode($sortorder);
    header("Location: ".$redirectUrl);exit;
}

// 重命名
if(isset($_POST['rename'])){
    $old = safePath($_POST['old_name']);
    $new = safeFileName(trim($_POST['new_name']));
    $oldP = $real_folder."/".$old;
    $newP = $real_folder."/".$new;
    if(file_exists($oldP)&&!file_exists($newP))rename($oldP,$newP);
    $redirectUrl = "index.php?dir=".urlencode($current_folder);
    if($sortby)$redirectUrl.="&sortby=".urlencode($sortby);
    if($sortorder)$redirectUrl.="&sortorder=".urlencode($sortorder);
    header("Location: ".$redirectUrl);exit;
}

// 移动文件/文件夹
if(isset($_POST['move_file'])){
    $src = safePath($_POST['src_name']);
    $dstDir = safePath($_POST['dst_dir']);
    $srcP = $real_folder."/".$src;
    $dstP = $storage_dir.($dstDir?"/".$dstDir:"")."/".$src;
    if(file_exists($srcP)&&!file_exists($dstP))rename($srcP,$dstP);
    $redirectUrl = "index.php?dir=".urlencode($current_folder);
    if($sortby)$redirectUrl.="&sortby=".urlencode($sortby);
    if($sortorder)$redirectUrl.="&sortorder=".urlencode($sortorder);
    header("Location: ".$redirectUrl);exit;
}

// 打包文件夹下载
if(isset($_GET['zip'])){
    $zipName = safePath($_GET['zip']);
    $srcDir = $real_folder."/".$zipName;
    $zipFile = $zip_temp."/".uniqid().".zip";
    if(zipFolder($srcDir,$zipFile)){
        header("Content-Type:application/zip;charset=utf-8");
        header("Content-Disposition:attachment;filename=".rawurlencode($zipName).".zip");
        readfile($zipFile);
        unlink($zipFile);
        exit;
    }
    die("打包失败，请开启ZipArchive");
}

// 单文件下载
if(isset($_GET['download'])){
    $fn = safePath($_GET['download']);
    $full = $real_folder."/".$fn;
    if(!file_exists($full))die("文件不存在");
    header("Content-Type:application/octet-stream;charset=utf-8");
    header("Content-Disposition:attachment;filename=".rawurlencode($fn));
    readfile($full);exit;
}

// 分享提取密码页面
if(isset($_GET['share'])){
    $tk = safePath($_GET['share']);
    $sf = $share_dir."/".$tk.".txt";
    if(!file_exists($sf))die("链接失效");
    $data = json_decode(file_get_contents($sf),true);
    if($data['expire'] != 0 && time() > $data['expire']){
        unlink($sf);
        die("已过期");
    }
    if(!isset($_POST['share_pwd_check'])){
?>

输入提取密码

### 文件提取密码

        确认访问

$f,
            "is_dir"=>is_dir($full),
            "size"=>is_dir($full)?0:filesize($full),
            "mtime"=>date("Y-m-d H:i",filemtime($full)),
            "ext"=>$ext
        ];
    }
    closedir($dh);
}

// 文件列表排序
usort($list,function($a,$b) use ($sortby,$sortorder){
    $dirA = $a['is_dir'] ? 1 : 0;
    $dirB = $b['is_dir'] ? 1 : 0;
    if($dirA != $dirB){
        return $dirB - $dirA;
    }
    if(empty($sortby)){
        return strcmp($a['name'],$b['name']);
    }
    if($sortby == 'name'){
        $cmp = strcmp($a['name'],$b['name']);
        return $sortorder == 'desc' ? -$cmp : $cmp;
    }
    if($sortby == 'mtime'){
        $t1 = strtotime($a['mtime']);
        $t2 = strtotime($b['mtime']);
        if($t1 == $t2) return 0;
        $cmp = $t1 > $t2 ? 1 : -1;
        return $sortorder == 'desc' ? -$cmp : $cmp;
    }
    return strcmp($a['name'],$b['name']);
});

// 获取全部目录（移动文件下拉）
$allDirs = scanAllDirs($storage_dir);

// 面包屑导航
$crumbs = [];
$temp = "";
$crumbs[] = ["name"=>"根目录","url"=>"index.php"];
$seg = explode("/",$current_folder);
foreach($seg as $s){
    if(trim($s)=="")continue;
    $temp .= ($temp?"/":"").$s;
    $crumbs[] = ["name"=>$s,"url"=>"index.php?dir=".urlencode($temp)];
}

// 排序链接生成函数
function buildSortUrl($targetSortBy,$currentDir,$currSortBy,$currSortOrder){
    $params = [];
    if($currentDir)$params['dir'] = $currentDir;
    if($targetSortBy == $currSortBy){
        $newOrder = ($currSortOrder == 'asc') ? 'desc' : 'asc';
    }else{
        $newOrder = 'asc';
    }
    $params['sortby'] = $targetSortBy;
    $params['sortorder'] = $newOrder;
    $qs = http_build_query($params);
    return "index.php?".$qs;
}
function getSortArrow($field,$currSortBy,$currSortOrder){
    if($currSortBy != $field) return '';
    return $currSortOrder == 'asc' ? ' ▲' : ' ▼';
}
$url_name_sort = buildSortUrl('name',$current_folder,$sortby,$sortorder);
$url_mtime_sort = buildSortUrl('mtime',$current_folder,$sortby,$sortorder);
$arrow_name = getSortArrow('name',$sortby,$sortorder);
$arrow_mtime = getSortArrow('mtime',$sortby,$sortorder);
?>

集团内部网盘

# 集团内部网盘

        [分享管理](javascript:openShareManageModal())
        [修改密码](javascript:openPwdModal())
        [退出登录](?logout=1)

    搜索

        [">]( /

### 文件/文件夹上传管理

    &#9989; 批量多文件夹上传：Ctrl多选文件夹拖拽；
&#9888;&#65039; 按钮单次仅选1个文件夹，可多次追加

    拖拽多个文件夹/文件批量上传

        选择多个文件

        选择文件夹（单次1个）

        上传单个文件夹

            新建

        0%

    批量删除选中

（原文含表格，请查看原文链接）

（原文含表格，请查看原文链接）

×

### 全部分享管理

            刷新列表

（原文含表格，请查看原文链接）

×

    ×

            上一页
            1/1
            下一页

×

### 修改登录密码

            确认修改

×

### 生成带密码分享

            提取密码
            " required>
            有效期

                永久有效
                1小时
                6小时
                24小时
                3天
                7天

            生成链接

            分享链接：

            提取密码：

                一键复制链接
                一键复制密码
                复制链接+密码

×

### 重命名

            确认

×

### 移动文件

                根目录

                ">

            确认移动

链接: https://pan.baidu.com/s/1W7MjFYJ1fXxaSraISutA-g?pwd=8888 提取码: 8888

---

[查看原文](https://www.52pojie.cn/thread-2121132-1-1.html)
