---
title: "程序定时启停,自动窗口最小化工具"
published: 2026-09-03
description: "核心功能 1. EXE 程序管理 - 浏览选择 EXE 程序路径，后台自动提取程序进程名，界面不展示进程名； 2. 窗口自动最小化处理 - 程序启动后等待设定延时（默认 8 秒，可 1&#8209;30 秒调节）； - 自动把该程序弹出 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "chh322"
sourceLink: "https://www.52pojie.cn/thread-2126162-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2126162-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

![](https://static.52pojie.cn/static/image/common/none.gif)

**ScreenShot_2026-09-03_151156_649.png** *(16.45 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3NjQ2NHw1ZmJjNTFlOXwxNzg4NDkzODA4fDB8MjEyNjE2Mg%3D%3D&nothumb=yes)

2026-9-3 15:17 上传

核心功能

1. EXE 程序管理

- 浏览选择 EXE 程序路径，后台自动提取程序进程名，界面不展示进程名；

2. 窗口自动最小化处理

- 程序启动后等待设定延时（默认 8 秒，可 1&#8209;30 秒调节）；

- 自动把该程序弹出的全部窗口最小化，不抢占前台焦点；

- 无关键词、动作选择，固定最小化逻辑。

3. 每日定时任务

- 设置每日启动时间、每日关闭时间；

- 通过复选框【启用定时服务】控制定时开关；

- 勾选则后台线程运行定时，到点自动启动 / 关闭目标 EXE；取消勾选停止定时；

- 定时勾选状态会保存到配置；软件打开如果配置里勾选启用，会自动启动定时服务。

4. 配置持久化

- 保存配置：把 EXE 路径、进程名、弹窗延时、启动 / 关闭时间、定时启用状态全部保存到 D 盘 wxwqdpz.json；

- 程序打开自动读取 D 盘配置，恢复全部参数与定时勾选状态；无手动加载按钮。

5. 运行日志

- 界面日志框记录启动、关闭、定时状态、报错信息，只读展示。

`import sysimport osimport jsonimport subprocessimport psutilimport scheduleimport timeimport win32guiimport win32conimport win32processfrom PyQt5.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,                             QPushButton, QLineEdit, QLabel, QFileDialog, QTextEdit, QTimeEdit,                             QGroupBox, QSpinBox, QCheckBox, QMessageBox)from PyQt5.QtCore import QThread, pyqtSignal, QTime, QtCONFIG_PATH = r"D:\wxwqdpz.json"def enum_windows_by_pid(target_pid):    hwnd_list = []    def callback(hwnd, param):        if win32gui.IsWindowVisible(hwnd):            _, pid = win32process.GetWindowThreadProcessId(hwnd)            if pid == target_pid:                hwnd_list.append((hwnd, win32gui.GetWindowText(hwnd).strip()))        return True    win32gui.EnumWindows(callback, 0)    return hwnd_listdef minimize_all_window_by_pid(pid):    cnt = 0    hwnds = enum_windows_by_pid(pid)    for hwnd, _ in hwnds:        win32gui.ShowWindow(hwnd, win32con.SW_SHOWMINNOACTIVE)        cnt += 1    return cntdef save_config_to_disk(cfg):    try:        with open(CONFIG_PATH, "w", encoding="utf-8") as f:            json.dump(cfg, f, ensure_ascii=False, indent=2)        return True, f"配置已保存至 {CONFIG_PATH}"    except Exception as e:        return False, f"保存失败:{str(e)}"def load_config_from_disk():    if not os.path.exists(CONFIG_PATH):        return None, "配置文件不存在，使用默认设置"    try:        with open(CONFIG_PATH, "r", encoding="utf-8") as f:            data = json.load(f)        return data, "自动加载配置成功"    except Exception as e:        return None, f"读取配置异常:{str(e)}"class ScheduleThread(QThread):    log_signal = pyqtSignal(str)    def __init__(self, exe_path, proc_name, start_t, stop_t, popup_delay):        super().__init__()        self.exe_path = exe_path        self.proc_name = proc_name        self.start_time = start_t        self.stop_time = stop_t        self.popup_delay = popup_delay        self._running = True    def silent_start_exe(self):        try:            startupinfo = subprocess.STARTUPINFO()            startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW            startupinfo.wShowWindow = subprocess.SW_HIDE            p = subprocess.Popen(                self.exe_path,                startupinfo=startupinfo,                creationflags=subprocess.CREATE_NO_WINDOW,                shell=False            )            self.log_signal.emit(f"✅ {time.strftime('%Y-%m-%d %H:%M:%S')} 静默启动 pid={p.pid} {self.proc_name}")            time.sleep(self.popup_delay)            c = minimize_all_window_by_pid(p.pid)            self.log_signal.emit(f"🔧 弹窗处理：全部最小化窗口 {c} 个，不抢占前台焦点")            return ""        except Exception as e:            return f"❌ 启动异常: {str(e)}"    def stop_target_exe(self):        cnt = 0        for proc in psutil.process_iter(["name"]):            try:                if proc.info["name"].lower() == self.proc_name.lower():                    proc.terminate()                    cnt += 1            except (psutil.NoSuchProcess, psutil.AccessDenied):                continue        return f"✅ {time.strftime('%Y-%m-%d %H:%M:%S')} 关闭进程，共 {cnt} 个"    def run(self):        schedule.clear()        schedule.every().day.at(self.start_time).do(lambda: self.log_signal.emit(self.silent_start_exe()))        schedule.every().day.at(self.stop_time).do(lambda: self.log_signal.emit(self.stop_target_exe()))        self.log_signal.emit(f"📅 定时已加载：每日 {self.start_time} 启动 | {self.stop_time} 关闭；弹窗等待{self.popup_delay}s，动作=全部最小化")        while self._running:            schedule.run_pending()            time.sleep(1)    def stop(self):        self._running = False        schedule.clear()        self.wait()class MainWindow(QMainWindow):    def __init__(self):        super().__init__()        self.setWindowTitle("EXE定时启停工具")        self.resize(520, 520)        self.schedule_thread = None        self.inner_proc_name = ""  # 后台保存进程名，UI不显示        central = QWidget()        self.setCentralWidget(central)        layout = QVBoxLayout(central)        layout.setSpacing(10)        # EXE程序设置        file_group = QGroupBox("EXE程序设置")        file_layout = QHBoxLayout(file_group)        self.le_exe_path = QLineEdit()        self.le_exe_path.setPlaceholderText("点击浏览选择exe文件")        btn_browse = QPushButton("浏览...")        btn_browse.clicked.connect(self.select_exe)        file_layout.addWidget(self.le_exe_path)        file_layout.addWidget(btn_browse)        layout.addWidget(file_group)        # 弹窗延时设置        popup_group = QGroupBox("弹窗处理设置")        pop_layout = QHBoxLayout(popup_group)        pop_layout.addWidget(QLabel("弹窗等待延时(秒)"))        self.sp_delay = QSpinBox()        self.sp_delay.setRange(1, 30)        self.sp_delay.setValue(8)        pop_layout.addWidget(self.sp_delay)        pop_layout.addStretch()        pop_layout.addWidget(QLabel("固定模式：全部窗口最小化"))        layout.addWidget(popup_group)        # 每日定时设置        time_group = QGroupBox("每日定时设置")        time_layout = QHBoxLayout(time_group)        time_layout.addWidget(QLabel("启动时间"))        self.time_start = QTimeEdit(QTime(8, 30))        self.time_start.setDisplayFormat("HH:mm")        time_layout.addWidget(self.time_start)        time_layout.addSpacing(30)        time_layout.addWidget(QLabel("关闭时间"))        self.time_stop = QTimeEdit(QTime(18, 0))        self.time_stop.setDisplayFormat("HH:mm")        time_layout.addWidget(self.time_stop)        time_layout.addStretch()        self.chk_timer_run = QCheckBox("启用定时服务")        self.chk_timer_run.clicked.connect(self.on_checkbox_timer_change)        time_layout.addWidget(self.chk_timer_run)        layout.addWidget(time_group)        # 操作按钮组（保存配置、立即启动、立即关闭）        btn_layout = QHBoxLayout()        self.btn_save_cfg = QPushButton("💾保存配置")        self.btn_save_cfg.clicked.connect(self.ui_save_config)        self.btn_manual_run = QPushButton("⚡立即启动EXE")        self.btn_manual_run.clicked.connect(self.manual_start)        self.btn_manual_kill = QPushButton("🛑立即关闭EXE")        self.btn_manual_kill.clicked.connect(self.manual_stop)        btn_layout.addWidget(self.btn_save_cfg)        btn_layout.addWidget(self.btn_manual_run)        btn_layout.addWidget(self.btn_manual_kill)        layout.addLayout(btn_layout)        # 日志输出框        self.log_box = QTextEdit()        self.log_box.setReadOnly(True)        layout.addWidget(self.log_box)        # 软件打开自动加载配置        self.ui_load_config()    def log(self, msg):        self.log_box.append(msg)    def select_exe(self):        path, _ = QFileDialog.getOpenFileName(self, "选择可执行程序", "", "EXE文件 (*.exe)")        if path:            self.le_exe_path.setText(path)            self.inner_proc_name = os.path.basename(path)    def get_current_ui_config(self):        return {            "exe_path": self.le_exe_path.text().strip(),            "proc_name": self.inner_proc_name,            "popup_delay": self.sp_delay.value(),            "start_time": self.time_start.time().toString("HH:mm"),            "stop_time": self.time_stop.time().toString("HH:mm"),            "timer_enable": self.chk_timer_run.isChecked()        }    def ui_save_config(self):        cfg = self.get_current_ui_config()        ok, msg = save_config_to_disk(cfg)        self.log(msg)        if not ok:            QMessageBox.warning(self, "保存错误", msg)    def ui_load_config(self):        cfg, msg = load_config_from_disk()        self.log(msg)        if cfg is None:            return        self.le_exe_path.setText(cfg.get("exe_path", ""))        self.inner_proc_name = cfg.get("proc_name", "")        self.sp_delay.setValue(cfg.get("popup_delay", 8))        t_start = cfg.get("start_time", "08:30")        t_stop = cfg.get("stop_time", "18:00")        self.time_start.setTime(QTime.fromString(t_start, "HH:mm"))        self.time_stop.setTime(QTime.fromString(t_stop, "HH:mm"))        self.chk_timer_run.setChecked(cfg.get("timer_enable", False))        # 如果配置记录勾选启用，自动开启定时        if self.chk_timer_run.isChecked():            self.start_schedule_core()    def on_checkbox_timer_change(self):        if self.chk_timer_run.isChecked():            self.start_schedule_core()        else:            self.stop_schedule_core()    def start_schedule_core(self):        cfg = self.get_current_ui_config()        exe_path = cfg["exe_path"]        proc_name = cfg["proc_name"]        if not os.path.exists(exe_path):            self.log("❌ EXE路径不存在，请重新选择，取消勾选定时")            self.chk_timer_run.setChecked(False)            return        if self.schedule_thread and self.schedule_thread.isRunning():            self.log("⚠️定时服务已经在运行中")            return        self.schedule_thread = ScheduleThread(exe_path, proc_name, cfg["start_time"], cfg["stop_time"], cfg["popup_delay"])        self.schedule_thread.log_signal.connect(self.log)        self.schedule_thread.start()    def stop_schedule_core(self):        if self.schedule_thread:            self.schedule_thread.stop()            self.log("■ 定时服务已停止")    def manual_start(self):        exe_path = self.le_exe_path.text().strip()        proc_name = self.inner_proc_name        if not os.path.exists(exe_path):            self.log("❌ EXE路径无效")            return        delay = self.sp_delay.value()        try:            startupinfo = subprocess.STARTUPINFO()            startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW            startupinfo.wShowWindow = subprocess.SW_HIDE            p = subprocess.Popen(                exe_path,                startupinfo=startupinfo,                creationflags=subprocess.CREATE_NO_WINDOW,                shell=False            )            self.log(f"⚡手动启动 pid={p.pid} {proc_name}")            time.sleep(delay)            c = minimize_all_window_by_pid(p.pid)            self.log(f"🔧手动处理弹窗：最小化 {c} 个窗口")        except Exception as e:            self.log(f"❌手动启动失败：{e}")    def manual_stop(self):        proc_name = self.inner_proc_name        cnt = 0        for proc in psutil.process_iter(["name"]):            try:                if proc.info["name"].lower() == proc_name.lower():                    proc.terminate()                    cnt += 1            except (psutil.NoSuchProcess, psutil.AccessDenied):                continue        self.log(f"🛑手动关闭进程，数量 {cnt}")    def closeEvent(self, event):        if self.schedule_thread:            self.schedule_thread.stop()        event.accept()if __name__ == "__main__":    app = QApplication(sys.argv)    win = MainWindow()    win.show()    sys.exit(app.exec_())`

---

[查看原文](https://www.52pojie.cn/thread-2126162-1-1.html)
