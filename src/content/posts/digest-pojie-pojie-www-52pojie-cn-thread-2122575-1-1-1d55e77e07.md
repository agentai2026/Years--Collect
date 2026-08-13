---
title: "【分享】用 Python + PyQt6 写了一个 PHP 启动器（单文件）"
published: 2026-08-12
description: "[md]#"
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "52628975"
sourceLink: "https://www.52pojie.cn/thread-2122575-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2122575-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

## 【分享】用 Python + PyQt6 写了一个 PHP 启动器（单文件）

### 起因

做 PHP 开发（ThinkPHP 为主）时最烦两件事：

- **不想把 PHP / Composer 写进系统环境变量**，每次切换 PHP 版本都得去改系统变量、重启终端，特别麻烦；

- 命令行里每次都要敲一长串绝对路径，或者装一堆工具。

所以用 **Python + PyQt6** 写了个小工具，图形界面一键搞定：**启动 PHP 服务 + 跑 Composer 命令**，并且**版本随意切换，不污染系统环境变量**。

### 配合 phpStudy 使用

如果你装了 phpStudy（比如 `D:\phpstudy_pro`），可以直接在"设置"里填 phpStudy 根目录，点一下"扫描"，软件会自动读取：

- `Extensions\php\*\php.exe` —— 所有已安装的 PHP 版本（如 `php8.0.2nts`、`php8.2.9nts`）

- `Extensions\composer*\composer.phar` —— Composer

扫描结果保存后，随时可以在下拉框里**一键切换 PHP 版本**。不用 phpStudy 也可以手动指定路径。

### 功能

#### PHP 启动

- 选择项目目录（默认就是软件所在目录，丢到项目根目录即可）

- 选择 PHP 版本 + 设置端口

- **自动识别 ThinkPHP**：有 `think` 文件就执行 `php think run -p 端口`，否则 `php -S localhost:端口 -t 项目目录`

- 停止时会杀掉整个进程树，**端口真正释放**（修过这个 bug，一开始停止后页面还能访问，其实是子进程没杀干净）

#### Composer

- 选择项目目录 + Composer 版本

- 输入命令**不用带 composer 前缀**，比如 `require topthink/think-queue:^3.0`

- 实际执行 `php.exe composer.phar 命令`

#### 设置

- phpStudy 一键扫描

- 手动指定 PHP / Composer 路径

- 配置自动保存到 `settings.json`

### 运行方式

`pip install PyQt6
python main.py`
打包成单文件 exe（可选）：

`pip install pyinstaller
pyinstaller -F -w --name PHP启动器 main.py`

### 完整代码（main.py）

`import json
import os
import subprocess
import sys
from pathlib import Path

from PyQt6.QtCore import QProcess, Qt
from PyQt6.QtWidgets import (
    QApplication,
    QComboBox,
    QFileDialog,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QMainWindow,
    QMessageBox,
    QPushButton,
    QSpinBox,
    QWidget,
    QVBoxLayout,
    QTextEdit,
    QTabWidget,
    QGroupBox,
    QListWidget,
)

APP_DIR = Path(__file__).resolve().parent
SETTINGS_FILE = APP_DIR / "settings.json"

def load_settings():
    if SETTINGS_FILE.exists():
        try:
            return json.loads(SETTINGS_FILE.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {}

def save_settings(data):
    SETTINGS_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

class PhpLauncher(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("PHP 启动器")
        self.resize(800, 600)

        self.settings = load_settings()
        self.php_process = QProcess(self)
        self.composer_process = QProcess(self)

        self.php_process.readyReadStandardOutput.connect(self._read_php_stdout)
        self.php_process.readyReadStandardError.connect(self._read_php_stderr)
        self.php_process.finished.connect(self._php_finished)

        self.composer_process.readyReadStandardOutput.connect(self._read_composer_stdout)
        self.composer_process.readyReadStandardError.connect(self._read_composer_stderr)
        self.composer_process.finished.connect(self._composer_finished)

        tabs = QTabWidget()
        tabs.addTab(self._build_php_tab(), "PHP 启动")
        tabs.addTab(self._build_composer_tab(), "Composer")
        tabs.addTab(self._build_settings_tab(), "设置")
        self.setCentralWidget(tabs)

        self._refresh_version_lists()

    # ---------- helpers ----------
    def _browse_dir(self, line_edit):
        path = QFileDialog.getExistingDirectory(self, "选择目录", line_edit.text())
        if path:
            line_edit.setText(path)

    def _browse_file(self, line_edit, filter_="可执行文件 (*.exe);;所有文件 (*.*)"):
        path, _ = QFileDialog.getOpenFileName(self, "选择文件", line_edit.text(), filter_)
        if path:
            line_edit.setText(path)

    def _append_output(self, widget, text):
        widget.moveCursor(widget.textCursor().MoveOperation.End)
        widget.insertPlainText(text)
        widget.moveCursor(widget.textCursor().MoveOperation.End)

    def _get_php_path(self):
        idx = self.php_version_combo.currentIndex()
        if idx   {item['path']}")

        for item in composer_versions:
            name = item.get("name", Path(item["path"]).name)
            self.composer_version_combo.addItem(name, item["path"])
            self.composer_list.addItem(f"{name}  ->  {item['path']}")

        default_php = self.settings.get("default_php")
        if default_php:
            for i in range(self.php_version_combo.count()):
                if self.php_version_combo.itemData(i) == default_php:
                    self.php_version_combo.setCurrentIndex(i)
                    break

        default_composer = self.settings.get("default_composer")
        if default_composer:
            for i in range(self.composer_version_combo.count()):
                if self.composer_version_combo.itemData(i) == default_composer:
                    self.composer_version_combo.setCurrentIndex(i)
                    break

    # ---------- PHP tab ----------
    def _build_php_tab(self):
        widget = QWidget()
        layout = QVBoxLayout(widget)

        # 项目目录
        dir_layout = QHBoxLayout()
        dir_layout.addWidget(QLabel("项目目录："))
        self.php_project_dir = QLineEdit(str(APP_DIR))
        dir_layout.addWidget(self.php_project_dir)
        btn_browse = QPushButton("浏览...")
        btn_browse.clicked.connect(lambda: self._browse_dir(self.php_project_dir))
        dir_layout.addWidget(btn_browse)
        layout.addLayout(dir_layout)

        # PHP 版本 + 端口
        row = QHBoxLayout()
        row.addWidget(QLabel("PHP 版本："))
        self.php_version_combo = QComboBox()
        self.php_version_combo.setMinimumWidth(200)
        row.addWidget(self.php_version_combo)
        row.addStretch()
        row.addWidget(QLabel("端口："))
        self.port_spin = QSpinBox()
        self.port_spin.setRange(1, 65535)
        self.port_spin.setValue(8000)
        row.addWidget(self.port_spin)
        layout.addLayout(row)

        # 命令预览
        self.php_preview = QLabel("命令：")
        self.php_preview.setWordWrap(True)
        self.php_preview.setStyleSheet("color: gray;")
        layout.addWidget(self.php_preview)
        self.port_spin.valueChanged.connect(self._update_php_preview)
        self.php_version_combo.currentIndexChanged.connect(self._update_php_preview)
        self.php_project_dir.textChanged.connect(self._update_php_preview)

        # 输出
        self.php_output = QTextEdit()
        self.php_output.setReadOnly(True)
        self.php_output.setPlaceholderText("PHP 服务输出...")
        layout.addWidget(self.php_output)

        # 按钮
        btns = QHBoxLayout()
        self.php_run_btn = QPushButton("启动")
        self.php_run_btn.clicked.connect(self._run_php)
        btns.addWidget(self.php_run_btn)
        self.php_stop_btn = QPushButton("停止")
        self.php_stop_btn.clicked.connect(self._stop_php)
        self.php_stop_btn.setEnabled(False)
        btns.addWidget(self.php_stop_btn)
        btns.addStretch()
        layout.addLayout(btns)

        self._update_php_preview()
        return widget

    def _update_php_preview(self):
        php = self._get_php_path()
        port = self.port_spin.value()
        project = self.php_project_dir.text().strip()
        think_file = Path(project) / "think" if project else None
        if think_file and think_file.exists():
            cmd = f'"{php}" think run -p {port}'
        else:
            cmd = f'"{php}" -S localhost:{port} -t "{project}"'
        self.php_preview.setText(f"命令：{cmd}")

    def _run_php(self):
        if self.php_process.state() != QProcess.ProcessState.NotRunning:
            QMessageBox.information(self, "提示", "PHP 服务已经在运行中")
            return

        php = self._get_php_path()
        if not php or not Path(php).exists():
            QMessageBox.critical(self, "错误", "请选择有效的 PHP 可执行文件，先在“设置”里扫描或手动配置。")
            return

        project = self.php_project_dir.text().strip()
        if not project or not Path(project).is_dir():
            QMessageBox.critical(self, "错误", "项目目录不存在")
            return

        port = self.port_spin.value()
        think_file = Path(project) / "think"
        self.php_output.clear()
        self.php_process.setWorkingDirectory(project)

        if think_file.exists():
            self.php_process.start(php, ["think", "run", "-p", str(port)])
        else:
            self.php_process.start(php, ["-S", f"localhost:{port}", "-t", project])

        self.php_run_btn.setEnabled(False)
        self.php_stop_btn.setEnabled(True)
        self._append_output(self.php_output, f"[启动] {self.php_preview.text()}\n\n")

    def _stop_php(self):
        # 停止内嵌进程（连子进程整棵进程树一起杀掉，避免端口还被占用）
        if self.php_process.state() != QProcess.ProcessState.NotRunning:
            pid = self.php_process.processId()
            if pid:
                try:
                    subprocess.run(
                        ["taskkill", "/pid", str(pid), "/T", "/F"],
                        creationflags=subprocess.CREATE_NO_WINDOW,
                    )
                except Exception:
                    pass
            self.php_process.kill()
            if not self.php_process.waitForFinished(2000):
                self.php_process.kill()

    def _read_php_stdout(self):
        text = bytes(self.php_process.readAllStandardOutput()).decode("utf-8", errors="replace")
        self._append_output(self.php_output, text)

    def _read_php_stderr(self):
        text = bytes(self.php_process.readAllStandardError()).decode("utf-8", errors="replace")
        self._append_output(self.php_output, text)

    def _php_finished(self):
        self.php_run_btn.setEnabled(True)
        self.php_stop_btn.setEnabled(False)
        self._append_output(self.php_output, "\n[PHP 服务已停止]\n")

    # ---------- Composer tab ----------
    def _build_composer_tab(self):
        widget = QWidget()
        layout = QVBoxLayout(widget)

        dir_layout = QHBoxLayout()
        dir_layout.addWidget(QLabel("项目目录："))
        self.composer_project_dir = QLineEdit(str(APP_DIR))
        dir_layout.addWidget(self.composer_project_dir)
        btn_browse = QPushButton("浏览...")
        btn_browse.clicked.connect(lambda: self._browse_dir(self.composer_project_dir))
        dir_layout.addWidget(btn_browse)
        layout.addLayout(dir_layout)

        row = QHBoxLayout()
        row.addWidget(QLabel("Composer："))
        self.composer_version_combo = QComboBox()
        self.composer_version_combo.setMinimumWidth(200)
        row.addWidget(self.composer_version_combo)
        row.addStretch()
        layout.addLayout(row)

        layout.addWidget(QLabel("命令（不需要带 composer 前缀）："))
        self.composer_cmd = QLineEdit()
        self.composer_cmd.setPlaceholderText("require topthink/think-queue:^3.0")
        layout.addWidget(self.composer_cmd)

        self.composer_output = QTextEdit()
        self.composer_output.setReadOnly(True)
        self.composer_output.setPlaceholderText("Composer 输出...")
        layout.addWidget(self.composer_output)

        btns = QHBoxLayout()
        self.composer_run_btn = QPushButton("执行")
        self.composer_run_btn.clicked.connect(self._run_composer)
        btns.addWidget(self.composer_run_btn)
        btns.addStretch()
        layout.addLayout(btns)

        return widget

    def _run_composer(self):
        if self.composer_process.state() != QProcess.ProcessState.NotRunning:
            QMessageBox.information(self, "提示", "Composer 正在执行中")
            return

        php = self._get_php_path()
        if not php or not Path(php).exists():
            QMessageBox.critical(self, "错误", "请选择有效的 PHP 可执行文件，先在“设置”里扫描或手动配置。")
            return

        composer = self._get_composer_path()
        if not composer or not Path(composer).exists():
            QMessageBox.critical(self, "错误", "请选择有效的 composer.phar，先在“设置”里扫描或手动配置。")
            return

        project = self.composer_project_dir.text().strip()
        if not project or not Path(project).is_dir():
            QMessageBox.critical(self, "错误", "项目目录不存在")
            return

        cmd_text = self.composer_cmd.text().strip()
        if not cmd_text:
            QMessageBox.warning(self, "提示", "请输入要执行的 composer 命令")
            return

        args = cmd_text.split()
        self.composer_output.clear()
        self.composer_process.setWorkingDirectory(project)
        self.composer_process.start(php, [composer] + args)
        self._append_output(self.composer_output, f"[执行] {php} {composer} {cmd_text}\n\n")

    def _read_composer_stdout(self):
        text = bytes(self.composer_process.readAllStandardOutput()).decode("utf-8", errors="replace")
        self._append_output(self.composer_output, text)

    def _read_composer_stderr(self):
        text = bytes(self.composer_process.readAllStandardError()).decode("utf-8", errors="replace")
        self._append_output(self.composer_output, text)

    def _composer_finished(self):
        self._append_output(self.composer_output, "\n[Composer 执行结束]\n")

    # ---------- Settings tab ----------
    def _build_settings_tab(self):
        widget = QWidget()
        layout = QVBoxLayout(widget)

        group_study = QGroupBox("phpStudy 目录扫描")
        study_layout = QVBoxLayout(group_study)
        row = QHBoxLayout()
        self.study_root = QLineEdit(self.settings.get("phpstudy_root", "D:\\phpstudy_pro"))
        row.addWidget(self.study_root)
        btn_browse = QPushButton("浏览...")
        btn_browse.clicked.connect(lambda: self._browse_dir(self.study_root))
        row.addWidget(btn_browse)
        study_layout.addLayout(row)
        btn_scan = QPushButton("扫描已安装的 PHP / Composer")
        btn_scan.clicked.connect(self._scan_phpstudy)
        study_layout.addWidget(btn_scan)
        layout.addWidget(group_study)

        group_php = QGroupBox("已发现的 PHP 版本")
        php_layout = QVBoxLayout(group_php)
        self.php_list = QListWidget()
        php_layout.addWidget(self.php_list)
        layout.addWidget(group_php)

        group_composer = QGroupBox("已发现的 Composer 版本")
        composer_layout = QVBoxLayout(group_composer)
        self.composer_list = QListWidget()
        composer_layout.addWidget(self.composer_list)
        layout.addWidget(group_composer)

        group_manual = QGroupBox("手动路径（可选，会加入下拉框）")
        manual_layout = QVBoxLayout(group_manual)
        row = QHBoxLayout()
        row.addWidget(QLabel("PHP exe："))
        self.manual_php = QLineEdit(self.settings.get("manual_php", ""))
        row.addWidget(self.manual_php)
        btn_mp = QPushButton("浏览...")
        btn_mp.clicked.connect(lambda: self._browse_file(self.manual_php, "php.exe (*.exe)"))
        row.addWidget(btn_mp)
        manual_layout.addLayout(row)
        row = QHBoxLayout()
        row.addWidget(QLabel("Composer phar："))
        self.manual_composer = QLineEdit(self.settings.get("manual_composer", ""))
        row.addWidget(self.manual_composer)
        btn_mc = QPushButton("浏览...")
        btn_mc.clicked.connect(lambda: self._browse_file(self.manual_composer, "composer.phar (*.phar);;所有文件 (*.*)"))
        row.addWidget(btn_mc)
        manual_layout.addLayout(row)
        layout.addWidget(group_manual)

        btns = QHBoxLayout()
        btn_save = QPushButton("保存设置")
        btn_save.clicked.connect(self._save_settings)
        btns.addWidget(btn_save)
        btns.addStretch()
        layout.addLayout(btns)

        layout.addStretch()
        return widget

    def _scan_phpstudy(self):
        root = self.study_root.text().strip()
        if not root or not Path(root).is_dir():
            QMessageBox.critical(self, "错误", "phpStudy 目录不存在")
            return

        php_dir = Path(root) / "Extensions" / "php"
        composer_base = Path(root) / "Extensions"

        php_versions = []
        if php_dir.is_dir():
            for sub in sorted(php_dir.iterdir()):
                exe = sub / "php.exe"
                if sub.is_dir() and exe.exists():
                    php_versions.append({"name": sub.name, "path": str(exe)})

        composer_versions = []
        if composer_base.is_dir():
            for sub in sorted(composer_base.iterdir()):
                if sub.is_dir() and sub.name.lower().startswith("composer"):
                    phar = sub / "composer.phar"
                    if phar.exists():
                        composer_versions.append({"name": sub.name, "path": str(phar)})

        self.settings["phpstudy_root"] = root
        self.settings["php_versions"] = php_versions
        self.settings["composer_versions"] = composer_versions
        if php_versions:
            self.settings["default_php"] = php_versions[0]["path"]
        if composer_versions:
            self.settings["default_composer"] = composer_versions[0]["path"]

        self._refresh_version_lists()
        QMessageBox.information(
            self,
            "扫描完成",
            f"发现 {len(php_versions)} 个 PHP 版本，{len(composer_versions)} 个 Composer 版本",
        )

    def _save_settings(self):
        # 合并手动路径
        manual_php = self.manual_php.text().strip()
        manual_composer = self.manual_composer.text().strip()
        self.settings["manual_php"] = manual_php
        self.settings["manual_composer"] = manual_composer

        php_versions = [v for v in self.settings.get("php_versions", []) if not v.get("name", "").startswith("手动:")]
        composer_versions = [v for v in self.settings.get("composer_versions", []) if not v.get("name", "").startswith("手动:")]

        if manual_php and Path(manual_php).exists():
            php_versions.insert(0, {"name": f"手动: {Path(manual_php).name}", "path": manual_php})
        if manual_composer and Path(manual_composer).exists():
            composer_versions.insert(0, {"name": f"手动: {Path(manual_composer).name}", "path": manual_composer})

        self.settings["php_versions"] = php_versions
        self.settings["composer_versions"] = composer_versions

        if php_versions:
            self.settings["default_php"] = php_versions[0]["path"]
        if composer_versions:
            self.settings["default_composer"] = composer_versions[0]["path"]

        save_settings(self.settings)
        self._refresh_version_lists()
        QMessageBox.information(self, "提示", "设置已保存")

    def closeEvent(self, event):
        if self.php_process.state() != QProcess.ProcessState.NotRunning:
            self.php_process.terminate()
            if not self.php_process.waitForFinished(2000):
                self.php_process.kill()
        if self.composer_process.state() != QProcess.ProcessState.NotRunning:
            self.composer_process.terminate()
            if not self.composer_process.waitForFinished(2000):
                self.composer_process.kill()
        event.accept()

def main():
    app = QApplication(sys.argv)
    win = PhpLauncher()
    win.show()
    sys.exit(app.exec())

if __name__ == "__main__":
    main()`

### 说明

- 依赖：`pip install PyQt6`

- 把 `main.py` 放到 PHP 项目根目录，运行后"项目目录"默认就是软件所在目录

- 配置保存在 `settings.json`，随时删除即可重置

- 打包成 exe 后整个程序只有一个文件，绿色免安装

有问题欢迎留言讨论。

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(315.55 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3MTcwM3w1MzMzMjc5ZXwxNzg2NTgwOTgxfDB8MjEyMjU3NQ%3D%3D&nothumb=yes)

2026-8-12 12:07 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(24.26 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3MTcwNHxlMmRiMTU5ZnwxNzg2NTgwOTgxfDB8MjEyMjU3NQ%3D%3D&nothumb=yes)

2026-8-12 12:07 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(36.62 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3MTcwNXxjZmU3NGUwMHwxNzg2NTgwOTgxfDB8MjEyMjU3NQ%3D%3D&nothumb=yes)

2026-8-12 12:07 上传

---

[查看原文](https://www.52pojie.cn/thread-2122575-1-1.html)
