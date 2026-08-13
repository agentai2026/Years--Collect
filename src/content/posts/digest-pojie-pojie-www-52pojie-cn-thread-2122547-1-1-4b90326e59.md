---
title: "速创文档、文件夹的 小工具 (tauri)"
published: 2026-08-12
description: "Windows 下，快速 创建文件/文件夹 小工具 现状: 要么手动 一个一个（虽然灵活 效率低），要么 python脚本化(效率是高，却无法兼顾自定义，灵活性)， 本软件 在两者之间，适合一次性新建很多 文本文档+空文件夹 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "pyjiujiu"
sourceLink: "https://www.52pojie.cn/thread-2122547-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2122547-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

Windows 下，快速 创建文件/文件夹 小工具

现状:

要么手动 一个一个（虽然灵活 效率低），要么 python脚本化(效率是高，却无法兼顾自定义，灵活性)，

本软件 在两者之间，适合一次性新建很多 文本文档+空文件夹，这样的场景。同时兼顾 键盘连续操作 的工作流。

个人来说，主要是 日常研究大模型，发现一直在频繁 新建和修改文档，遂想研究下 方便的窍门

目前是探索性的 实验性的，没完全想明白 这个项目的最终形态，可能仅适合少数群体（有什么看法意见，欢迎反馈）

---

AI 背景:

- deepseek-flash-0731，利用 opencode agent 模式完成 （不细说了，总之 大模型造这个项目很轻松（特别是前端部分），卡点也有 主要是 windows 的 字符解码问题(powershell5.1)，优化性能需要时间(按键延迟)）

(下面的 介绍图，由 qwen-image-3.0 绘制，（描述夸大部分，不必在意）)

---

软件截图:

![](https://static.52pojie.cn/static/image/common/none.gif)

**fileforge_0.0.1.JPG** *(40.9 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3MTU5OXw4OWE4MDc0YnwxNzg2NTc1NzQ3fDB8MjEyMjU0Nw%3D%3D&nothumb=yes)

2026-8-12 10:27 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**fileforge_说明.jpg** *(100.53 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3MTYwMnw0MWFjZGJlZnwxNzg2NTc1NzQ3fDB8MjEyMjU0Nw%3D%3D&nothumb=yes)

2026-8-12 10:27 上传

---

项目 维护在 github:        github.com/fun-tailor/tool_win_FileForge

打包的 exe(只有 3.2M)，github.com/fun-tailor/tool_win_FileForge/releases/download/latest/fileforge_260811.exe

---

源代码

(摘录后端  rust 部分 ‘src-tauri\src\lib.rs’)

`use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use tauri::{AppHandle, Manager};
#[cfg(windows)]
use std::os::windows::process::CommandExt;

#[derive(Serialize)]
pub struct EntryInfo {
    pub name: String,
    pub path: String,
    pub parent: String,
    pub kind: String,
    pub size: Option,
}

#[derive(Serialize, Deserialize)]
pub struct AppState {
    pub pins: Vec,
    pub last_path: Option,
    pub recent: Vec,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Shortcuts {
    pub toggle_kind: String,
    pub advance: String,
    pub create: String,
}

impl Default for Shortcuts {
    fn default() -> Self {
        Shortcuts {
            toggle_kind: "Tab".into(),
            advance: "Enter".into(),
            create: "Ctrl+Enter".into(),
        }
    }
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(default)]
pub struct Settings {
    pub shortcuts: Shortcuts,
    pub lang: String,
}

impl Default for Settings {
    fn default() -> Self {
        Settings {
            shortcuts: Shortcuts::default(),
            lang: "en".into(),
        }
    }
}

const ILLEGAL_CHARS: &str = r#"\/:*?"<>|"#;
const RESERVED: &[&str] = &[
    "CON", "PRN", "AUX", "NUL",
    "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
    "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9",
];

fn validate_name(raw: &str) -> Result {
    if raw.ends_with('.') || raw.ends_with(' ') {
        return Err("Name cannot end with a dot or a space".into());
    }
    let name = raw.trim();
    if name.is_empty() {
        return Err("Name is empty".into());
    }
    if name.len() > 240 {
        return Err("Name is too long (max 240 chars)".into());
    }
    if name.chars().any(|c| c.is_control() || ILLEGAL_CHARS.contains(c)) {
        return Err(format!(
            "Name contains characters not allowed on Windows:  \\ / : * ? \"  |"
        ));
    }
    let stem = name.split('.').next().unwrap_or(name).to_ascii_uppercase();
    if RESERVED.contains(&stem.as_str()) {
        return Err(format!("{stem} is a reserved name on Windows"));
    }
    Ok(name.to_string())
}

fn friendly_io(e: &std::io::Error) -> String {
    match e.kind() {
        std::io::ErrorKind::NotFound => "Target folder no longer exists".to_string(),
        std::io::ErrorKind::PermissionDenied => {
            "Access denied — the file may be open or locked by another app".to_string()
        }
        std::io::ErrorKind::AlreadyExists => "An entry with this name already exists".to_string(),
        _ => e.to_string(),
    }
}

fn is_dir(p: &Path) -> bool {
    fs::metadata(p).map(|m| m.is_dir()).unwrap_or(false)
}

#[tauri::command]
fn create_entry(
    parent: String,
    name: String,
    kind: String,
    content: Option,
) -> Result {
    let name = validate_name(&name)?;
    let parent_path = PathBuf::from(&parent);
    if !parent_path.is_dir() {
        return Err(format!(
            "Target folder does not exist: {}",
            parent_path.display()
        ));
    }
    let path = parent_path.join(&name);
    if path.exists() {
        return Err(format!("“{name}” already exists in {}", parent_path.display()));
    }
    match kind.as_str() {
        "folder" => fs::create_dir(&path).map_err(|e| friendly_io(&e))?,
        _ => fs::write(&path, content.unwrap_or_default()).map_err(|e| friendly_io(&e))?,
    }
    let size = fs::metadata(&path)
        .ok()
        .filter(|m| m.is_file())
        .map(|m| m.len());
    Ok(EntryInfo {
        name,
        path: path.to_string_lossy().to_string(),
        parent: parent,
        kind: kind,
        size,
    })
}

#[tauri::command]
fn rename_entry(path: String, new_name: String) -> Result {
    let new_name = validate_name(&new_name)?;
    let old = PathBuf::from(&path);
    if !old.exists() {
        return Err("Entry no longer exists".to_string());
    }
    let parent = old
        .parent()
        .ok_or_else(|| "Invalid path".to_string())?
        .to_path_buf();
    let new_path = parent.join(&new_name);

    if new_path.exists() && new_path != old {
        let same_case_only =
            new_path.to_string_lossy().to_lowercase() == old.to_string_lossy().to_lowercase();
        if !same_case_only {
            return Err(format!("“{new_name}” already exists"));
        }
    }

    if new_path.to_string_lossy() != old.to_string_lossy() {
        // case-only rename needs a temp hop on Windows
        if new_path.exists() {
            let tmp = parent.join(format!(".ff-rename-{}", std::process::id()));
            fs::rename(&old, &tmp).map_err(|e| friendly_io(&e))?;
            fs::rename(&tmp, &new_path).map_err(|e| friendly_io(&e))?;
        } else {
            fs::rename(&old, &new_path).map_err(|e| friendly_io(&e))?;
        }
    }

    let kind = if is_dir(&new_path) {
        "folder".to_string()
    } else {
        "file".to_string()
    };
    let size = if is_dir(&new_path) {
        None
    } else {
        fs::metadata(&new_path).ok().map(|m| m.len())
    };
    Ok(EntryInfo {
        name: new_name,
        path: new_path.to_string_lossy().to_string(),
        parent: parent.to_string_lossy().to_string(),
        kind,
        size,
    })
}

#[tauri::command]
fn delete_entry(path: String) -> Result {
    let p = PathBuf::from(&path);
    if !p.exists() {
        return Err("Entry no longer exists".to_string());
    }
    if is_dir(&p) {
        fs::remove_dir(&p).map_err(|e| match e.kind() {
            std::io::ErrorKind::DirectoryNotEmpty => {
                "Folder is not empty".to_string()
            }
            _ => friendly_io(&e),
        })?;
    } else {
        fs::remove_file(&p).map_err(|e| friendly_io(&e))?;
    }
    Ok(())
}

#[tauri::command]
fn read_file(path: String) -> Result {
    let p = PathBuf::from(&path);
    if !p.is_file() {
        return Err("Entry is not a file".to_string());
    }
    fs::read_to_string(&p).map_err(|e| friendly_io(&e))
}

#[tauri::command]
fn save_file(path: String, content: String) -> Result {
    let p = PathBuf::from(&path);
    if !p.is_file() {
        return Err("Entry is not a file".to_string());
    }
    fs::write(&p, content).map_err(|e| friendly_io(&e))?;
    fs::metadata(&p).map(|m| m.len()).map_err(|e| friendly_io(&e))
}

#[tauri::command]
fn reveal(path: String) -> Result {
    let p = PathBuf::from(&path);
    if !p.exists() {
        return Err("Entry no longer exists".to_string());
    }
    // If it's a folder, open it directly. For a file, use /select,.
    // Never embed quotes ourselves: Rust quotes args safely (spaces etc.),
    // and Explorer falls back to "This PC" on any parse problem.
    let mut target = p.to_string_lossy().to_string();
    while target.ends_with('\\') || target.ends_with('/') {
        target.pop();
    }
    let arg = if is_dir(&p) {
        target
    } else {
        format!("/select,{target}")
    };
    Command::new("explorer.exe")
        .arg(arg)
        .spawn()
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn normalize_path(path: String) -> Result {
    let trimmed = path.trim().trim_matches('"').trim();
    if trimmed.is_empty() {
        return Err("Path is empty".to_string());
    }
    let p = PathBuf::from(trimmed);
    if p.is_dir() {
        Ok(p.to_string_lossy().to_string())
    } else if p.is_file() {
        p.parent()
            .map(|d| d.to_string_lossy().to_string())
            .ok_or_else(|| "Invalid path".to_string())
    } else {
        Err(format!("Path not found: {trimmed}"))
    }
}

// Returns the path of the last-activated Explorer window
// (the topmost visible Explorer window in Z-order).
#[cfg(windows)]
#[link(name = "user32")]
extern "system" {
    fn EnumWindows(
        lpEnumFunc: Option i32>,
        lParam: isize,
    ) -> i32;
    fn IsWindowVisible(hWnd: isize) -> i32;
    fn IsIconic(hWnd: isize) -> i32;
    fn GetClassNameW(hWnd: isize, lpClassName: *mut u16, nMaxCount: i32) -> i32;
}

thread_local! {
    static TOP_HWNDS: std::cell::RefCell> = std::cell::RefCell::new(Vec::new());
}

unsafe extern "system" fn collect_top_windows(h: isize, _l: isize) -> i32 {
    TOP_HWNDS.with(|c| c.borrow_mut().push(h));
    1
}

/// Topmost visible, non-minimized Explorer (CabinetWClass) window by Z-order.
fn topmost_explorer_hwnd() -> Option {
    TOP_HWNDS.with(|c| c.borrow_mut().clear());
    unsafe { EnumWindows(Some(collect_top_windows), 0) };
    let mut buf: [u16; 64] = [0; 64];
    TOP_HWNDS.with(|c| {
        let tops = c.borrow();
        for &h in tops.iter() {
            unsafe {
                if IsWindowVisible(h) == 0 || IsIconic(h) != 0 {
                    continue;
                }
                let n = GetClassNameW(h, buf.as_mut_ptr(), buf.len() as i32);
                if n  Option {
    for line in report.lines() {
        let line = line.trim();
        if line.is_empty() {
            continue;
        }
        let (hw, url) = line.split_once('|')?;
        let h = hw.trim().parse::().ok()?;
        if h == target_hwnd {
            let p = url_to_path(url.trim())?;
            if !p.is_empty() {
                return Some(p);
            }
        }
    }
    None
}

fn explorer_path_impl() -> Result {
    let target = topmost_explorer_hwnd()
        .ok_or_else(|| "No Explorer window found — open a folder first".to_string())?;
    let script = r#"
$ErrorActionPreference = 'Stop'
try {
  [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
  $shell = New-Object -ComObject Shell.Application
  foreach ($w in $shell.Windows()) {
    if (-not $w) { continue }
    $u = [string]$w.LocationURL
    if ($u -and $u.StartsWith('file:')) {
      Write-Output ("{0}|{1}" -f $w.HWND, $u)
    }
  }
} catch {
  Write-Error $_.Exception.Message
  exit 1
}
"#;
    let out = Command::new("powershell.exe")
        .args([
            "-NoProfile",
            "-NonInteractive",
            "-ExecutionPolicy",
            "Bypass",
            "-Command",
            script,
        ])
        .creation_flags(0x0800_0000) // CREATE_NO_WINDOW
        .output()
        .map_err(|e| e.to_string())?;
    if !out.status.success() {
        return Err("No Explorer window found — open a folder first".to_string());
    }
    let stdout = String::from_utf8(out.stdout)
        .map_err(|_| "explorer_path: bad utf8 output".to_string())?;
    pick_path_from_report(&stdout, target as u64)
        .ok_or_else(|| "No Explorer window found — open a folder first".to_string())
}

/// Convert a `file:` URL (as reported by Explorer's LocationURL) to a Windows path.
/// Handles percent-encoding, raw UTF-8 passthrough, drive letters and UNC hosts.
fn url_to_path(url: &str) -> Option {
    let body = url.strip_prefix("file://")?;
    let (host, rel) = match body.split_once('/') {
        Some((h, p)) => (h, p),
        None => return None,
    };
    let bytes = percent_decode(rel.as_bytes());
    let s = String::from_utf8(bytes).ok()?;
    let slashed = s.replace('/', "\\");
    let mut path = if host.is_empty() {
        slashed
    } else {
        format!("\\\\{host}\\{slashed}")
    };
    while path.ends_with('\\') {
        path.pop();
    }
    if path.is_empty() {
        None
    } else {
        Some(path)
    }
}

fn percent_decode(input: &[u8]) -> Vec {
    fn hex(b: u8) -> Option {
        match b {
            b'0'..=b'9' => Some(b - b'0'),
            b'a'..=b'f' => Some(b - b'a' + 10),
            b'A'..=b'F' => Some(b - b'A' + 10),
            _ => None,
        }
    }
    let mut out = Vec::with_capacity(input.len());
    let mut i = 0;
    while i  Result {
    explorer_path_impl()
}

fn config_file(app: &AppHandle) -> Result {
    let dir = app
        .path()
        .app_config_dir()
        .map_err(|e| e.to_string())?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir.join("state.json"))
}

fn load_state(app: &AppHandle) -> Result {
    let f = config_file(app)?;
    if !f.exists() {
        return Ok(AppState {
            pins: Vec::new(),
            last_path: None,
            recent: Vec::new(),
        });
    }
    let s = fs::read_to_string(&f).map_err(|e| e.to_string())?;
    Ok(serde_json::from_str::(&s).unwrap_or(AppState {
        pins: Vec::new(),
        last_path: None,
        recent: Vec::new(),
    }))
}

#[tauri::command]
fn get_state(app: AppHandle) -> Result {
    load_state(&app)
}

#[tauri::command]
fn save_state(
    app: AppHandle,
    pins: Vec,
    last_path: Option,
    recent: Vec,
) -> Result {
    let state = AppState {
        pins,
        last_path,
        recent,
    };
    let s = serde_json::to_string_pretty(&state).map_err(|e| e.to_string())?;
    fs::write(config_file(&app)?, s).map_err(|e| e.to_string())
}

fn settings_file(app: &AppHandle) -> Result {
    if let Ok(dir) = app.path().executable_dir() {
        if dir.is_dir() {
            return Ok(dir.join("settings.json"));
        }
    }
    let dir = app.path().app_config_dir().map_err(|e| e.to_string())?;
    Ok(dir.join("settings.json"))
}

#[tauri::command]
fn get_settings(app: AppHandle) -> Result {
    let f = settings_file(&app)?;
    if !f.exists() {
        return Ok(Settings::default());
    }
    let s = fs::read_to_string(&f).map_err(|e| e.to_string())?;
    Ok(serde_json::from_str::(&s).unwrap_or_default())
}

#[tauri::command]
fn save_settings(app: AppHandle, settings: Settings) -> Result {
    let s = serde_json::to_string_pretty(&settings).map_err(|e| e.to_string())?;
    fs::write(settings_file(&app)?, s).map_err(|e| e.to_string())
}

#[tauri::command]
fn settings_path(app: AppHandle) -> Result {
    settings_file(&app).map(|p| p.to_string_lossy().to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            create_entry,
            rename_entry,
            delete_entry,
            read_file,
            save_file,
            reveal,
            normalize_path,
            explorer_path,
            get_state,
            save_state,
            get_settings,
            save_settings,
            settings_path,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;

    fn tmpdir(tag: &str) -> PathBuf {
        let d = std::env::temp_dir().join(format!("ff-test-{tag}-{}", std::process::id()));
        let _ = fs::remove_dir_all(&d);
        fs::create_dir_all(&d).unwrap();
        d
    }

    #[test]
    fn validate_names() {
        assert!(validate_name("").is_err());
        assert!(validate_name("   ").is_err());
        assert!(validate_name("a/b").is_err());
        assert!(validate_name("a:b").is_err());
        assert!(validate_name("a

---

[查看原文](https://www.52pojie.cn/thread-2122547-1-1.html)
