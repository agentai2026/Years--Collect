---
title: "豆包新出炉的四窗口鼠标同步点击器适合网游四开"
published: 2026-09-26
description: "[mw_shl_code=python,true]#!/usr/bin/env python3 # -*- coding: utf-8 -*- \\\"\\\"\\\" 多窗口同步点击模拟器 功能：在主窗口点击时，同时向多个窗口后台发送点击，不抢焦点 版本：v1.0 \\\"\\\"\\\" import tkinter as tk ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "omar111"
sourceLink: "https://www.52pojie.cn/thread-2129915-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2129915-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

![](https://static.52pojie.cn/static/image/common/none.gif)

**360截图20260926110303962.jpg** *(341.17 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4MTc1NnwxOTgyNzc3MHwxNzkwNDg0NTU1fDB8MjEyOTkxNQ%3D%3D&nothumb=yes)

2026-9-26 11:07 上传

[Python] *纯文本查看* *复制代码*
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
多窗口同步点击模拟器
功能：在主窗口点击时，同时向多个窗口后台发送点击，不抢焦点
版本：v1.0
"""

import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import threading
import time
import sys

# 尝试导入Windows相关库
try:
    import win32gui
    import win32con
    import win32api
    HAS_WIN32 = True
except ImportError:
    HAS_WIN32 = False

try:
    from pynput import mouse
    HAS_PYNPUT = True
except ImportError:
    HAS_PYNPUT = False

class ClickSimulatorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("多窗口同步点击模拟器 v1.0")
        self.root.geometry("750x650")
        self.root.resizable(False, False)

        # 运行状态
        self.running = False
        self.mouse_listener = None
        self.is_simulating = False

        # 窗口配置：[(hwnd, 标题, dx, dy, 启用), ...]
        self.window_configs = []

        # 初始化UI
        self._setup_ui()
        self._check_dependencies()

        # 刷新窗口列表
        self.refresh_windows()

    def _check_dependencies(self):
        """检查依赖是否安装"""
        missing = []
        if not HAS_WIN32:
            missing.append("pywin32")
        if not HAS_PYNPUT:
            missing.append("pynput")

        if missing:
            self.log(f"&#9888; 缺少依赖库: {', '.join(missing)}")
            self.log(f"  请运行: pip install {' '.join(missing)}")
            messagebox.showwarning(
                "缺少依赖",
                f"缺少以下依赖库：\n{', '.join(missing)}\n\n请运行:\npip install {' '.join(missing)}"
            )

    def _setup_ui(self):
        """构建界面"""
        # 主框架
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))

        # ===== 标题 =====
        title_label = ttk.Label(
            main_frame,
            text="多窗口同步点击模拟器",
            font=("微软雅黑", 16, "bold")
        )
        title_label.grid(row=0, column=0, columnspan=4, pady=(0, 10))

        # ===== 窗口选择区 =====
        window_frame = ttk.LabelFrame(main_frame, text="窗口配置", padding="10")
        window_frame.grid(row=1, column=0, columnspan=4, sticky=(tk.W, tk.E), pady=(0, 10))

        # 表头
        headers = ["启用", "窗口标题", "偏移X", "偏移Y"]
        col_widths = [60, 300, 80, 80]

        for i, (header, width) in enumerate(zip(headers, col_widths)):
            ttk.Label(window_frame, text=header, font=("微软雅黑", 9, "bold")).grid(
                row=0, column=i, padx=5, pady=(0, 5)
            )

        # 创建4行窗口配置
        self.window_vars = []  # 启用复选框变量
        self.window_hwnd_vars = []  # 窗口选择下拉框
        self.offset_x_vars = []  # X偏移
        self.offset_y_vars = []  # Y偏移

        self.all_windows = []  # 所有窗口列表 [(hwnd, title), ...]

        for row in range(4):
            # 启用复选框
            var_enabled = tk.BooleanVar(value=True if row == 0 else False)
            self.window_vars.append(var_enabled)
            ttk.Checkbutton(window_frame, variable=var_enabled).grid(
                row=row+1, column=0, padx=5, pady=2
            )

            # 窗口选择下拉框
            var_hwnd = tk.StringVar()
            self.window_hwnd_vars.append(var_hwnd)
            combo = ttk.Combobox(
                window_frame,
                textvariable=var_hwnd,
                width=40,
                state="readonly"
            )
            combo.grid(row=row+1, column=1, padx=5, pady=2)

            # X偏移
            var_x = tk.StringVar(value="0" if row == 0 else str(100 if row in [1, 3] else 0))
            self.offset_x_vars.append(var_x)
            ttk.Entry(window_frame, textvariable=var_x, width=8).grid(
                row=row+1, column=2, padx=5, pady=2
            )

            # Y偏移
            var_y = tk.StringVar(value="0" if row in [0, 1] else "100")
            self.offset_y_vars.append(var_y)
            ttk.Entry(window_frame, textvariable=var_y, width=8).grid(
                row=row+1, column=3, padx=5, pady=2
            )

        # 刷新窗口按钮
        refresh_btn = ttk.Button(
            window_frame,
            text="刷新窗口列表",
            command=self.refresh_windows
        )
        refresh_btn.grid(row=5, column=0, columnspan=4, pady=(8, 0))

        # ===== 控制区 =====
        control_frame = ttk.Frame(main_frame)
        control_frame.grid(row=2, column=0, columnspan=4, pady=(0, 10))

        self.start_btn = ttk.Button(
            control_frame,
            text="&#9654; 启动监听",
            command=self.start_listening,
            width=15
        )
        self.start_btn.grid(row=0, column=0, padx=5)

        self.stop_btn = ttk.Button(
            control_frame,
            text="■ 停止监听",
            command=self.stop_listening,
            state="disabled",
            width=15
        )
        self.stop_btn.grid(row=0, column=1, padx=5)

        self.status_label = ttk.Label(
            control_frame,
            text="● 未启动",
            foreground="red",
            font=("微软雅黑", 10, "bold")
        )
        self.status_label.grid(row=0, column=2, padx=20)

        # ===== 说明区 =====
        help_frame = ttk.LabelFrame(main_frame, text="使用说明", padding="10")
        help_frame.grid(row=3, column=0, columnspan=4, sticky=(tk.W, tk.E), pady=(0, 10))

        help_text = (
            "1. 点击「刷新窗口列表」获取当前所有打开的窗口\n"
            "2. 在下拉框中选择要同步点击的窗口，设置X/Y偏移量\n"
            "3. 勾选「启用」来决定该窗口是否参与同步\n"
            "4. 点击「启动监听」后，在第一个勾选的窗口中点击即可同步到其他窗口\n"
            "5. 偏移量表示：相对点击位置的横向/纵向偏移像素"
        )
        ttk.Label(help_frame, text=help_text, justify=tk.LEFT, font=("微软雅黑", 9)).grid(
            row=0, column=0, sticky=tk.W
        )

        # ===== 日志区 =====
        log_frame = ttk.LabelFrame(main_frame, text="运行日志", padding="10")
        log_frame.grid(row=4, column=0, columnspan=4, sticky=(tk.W, tk.E, tk.N, tk.S), pady=(0, 5))

        self.log_text = scrolledtext.ScrolledText(
            log_frame,
            width=85,
            height=10,
            font=("Consolas", 9),
            state="disabled"
        )
        self.log_text.grid(row=0, column=0)

        # 底部说明
        ttk.Label(
            main_frame,
            text="提示：本工具通过 PostMessage 后台发送点击，不会激活其他窗口",
            foreground="gray",
            font=("微软雅黑", 8)
        ).grid(row=5, column=0, columnspan=4)

    def log(self, message):
        """添加日志"""
        timestamp = time.strftime("%H:%M:%S")
        self.log_text.configure(state="normal")
        self.log_text.insert(tk.END, f"[{timestamp}] {message}\n")
        self.log_text.see(tk.END)
        self.log_text.configure(state="disabled")

    def refresh_windows(self):
        """刷新窗口列表"""
        if not HAS_WIN32:
            self.log("&#10007; 未安装 pywin32，无法获取窗口列表")
            return

        self.all_windows = []

        def callback(hwnd, _):
            if win32gui.IsWindowVisible(hwnd):
                title = win32gui.GetWindowText(hwnd)
                if title.strip() and len(title.strip()) > 1:
                    self.all_windows.append((hwnd, title.strip()))

        win32gui.EnumWindows(callback, None)

        # 更新下拉框选项
        window_titles = [f"[{hwnd}] {title[:40]}" for hwnd, title in self.all_windows]

        for combo_var in self.window_hwnd_vars:
            # 找到对应的下拉框控件
            combo_index = self.window_hwnd_vars.index(combo_var)
            # 遍历找到对应的combobox
            for child in self.root.winfo_children():
                self._find_and_update_combo(child, combo_var, window_titles)

        self.log(f"&#10003; 刷新窗口列表，共找到 {len(self.all_windows)} 个可见窗口")

    def _find_and_update_combo(self, widget, var, values):
        """递归查找并更新下拉框"""
        if isinstance(widget, ttk.Combobox) and str(widget.cget("textvariable")) == str(var):
            widget['values'] = values
            return True
        for child in widget.winfo_children():
            if self._find_and_update_combo(child, var, values):
                return True
        return False

    def _get_selected_hwnd(self, index):
        """获取选中的窗口句柄"""
        selection = self.window_hwnd_vars[index].get()
        if not selection:
            return None

        # 从 "[hwnd] title" 格式中提取 hwnd
        try:
            hwnd_str = selection.split("]")[0].strip("[")
            return int(hwnd_str)
        except:
            return None

    def start_listening(self):
        """启动鼠标监听"""
        if not HAS_PYNPUT:
            messagebox.showerror("错误", "未安装 pynput，请运行: pip install pynput")
            return

        if not HAS_WIN32:
            messagebox.showerror("错误", "未安装 pywin32，请运行: pip install pywin32")
            return

        # 检查配置
        enabled_count = sum(1 for v in self.window_vars if v.get())
        if enabled_count == 0:
            messagebox.showwarning("提示", "请至少启用一个窗口")
            return

        # 检查是否都选择了窗口
        for i, var in enumerate(self.window_vars):
            if var.get() and not self._get_selected_hwnd(i):
                messagebox.showwarning("提示", f"第 {i+1} 行已启用但未选择窗口")
                return

        self.running = True
        self.is_simulating = False

        # 更新按钮状态
        self.start_btn.configure(state="disabled")
        self.stop_btn.configure(state="normal")
        self.status_label.configure(text="● 监听中", foreground="green")

        # 启动监听线程
        self.mouse_listener = mouse.Listener(on_click=self._on_mouse_click)
        self.mouse_listener.start()

        self.log("=" * 50)
        self.log("&#10003; 鼠标监听已启动")

        # 显示配置信息
        for i, var in enumerate(self.window_vars):
            if var.get():
                hwnd = self._get_selected_hwnd(i)
                title = win32gui.GetWindowText(hwnd)[:30] if hwnd else "未知"
                dx = self.offset_x_vars[i].get()
                dy = self.offset_y_vars[i].get()
                self.log(f"  窗口{i+1}: [{title}] 偏移({dx}, {dy})")

        self.log("等待鼠标点击...")

    def stop_listening(self):
        """停止鼠标监听"""
        self.running = False

        if self.mouse_listener:
            self.mouse_listener.stop()
            self.mouse_listener = None

        # 更新按钮状态
        self.start_btn.configure(state="normal")
        self.stop_btn.configure(state="disabled")
        self.status_label.configure(text="● 未启动", foreground="red")

        self.log("&#10003; 鼠标监听已停止")

    def _on_mouse_click(self, x, y, button, pressed):
        """鼠标点击回调"""
        # 跳过模拟事件
        if self.is_simulating:
            return

        # 只响应左键按下
        if not pressed or button != mouse.Button.left:
            return

        # 在后台线程执行
        threading.Thread(
            target=self._do_sync_click,
            args=(x, y),
            daemon=True
        ).start()

    def _do_sync_click(self, real_x, real_y):
        """执行同步点击"""
        self.is_simulating = True

        try:
            self.log(f"\n[点击] 屏幕坐标: ({real_x}, {real_y})")

            for i, var in enumerate(self.window_vars):
                if not var.get():
                    continue

                hwnd = self._get_selected_hwnd(i)
                if not hwnd:
                    continue

                try:
                    dx = int(self.offset_x_vars[i].get())
                    dy = int(self.offset_y_vars[i].get())
                except ValueError:
                    self.log(f"  &#10007; 窗口{i+1} 偏移量格式错误")
                    continue

                click_x = real_x + dx
                click_y = real_y + dy

                # 发送后台点击
                self._post_click(hwnd, click_x, click_y, i+1)

                time.sleep(0.03)

            self.log("  &#10003; 同步点击完成")

        finally:
            time.sleep(0.1)
            self.is_simulating = False

    def _post_click(self, hwnd, screen_x, screen_y, window_index):
        """向窗口后台发送点击"""
        try:
            # 转换为客户区坐标
            rect = win32gui.GetWindowRect(hwnd)
            client_x = screen_x - rect[0]
            client_y = screen_y - rect[1]

            # 打包 lParam
            lparam = win32api.MAKELONG(client_x, client_y)

            # 发送按下消息
            win32gui.PostMessage(hwnd, win32con.WM_LBUTTONDOWN, win32con.MK_LBUTTON, lparam)
            time.sleep(0.02)
            # 发送抬起消息
            win32gui.PostMessage(hwnd, win32con.WM_LBUTTONUP, 0, lparam)

            title = win32gui.GetWindowText(hwnd)[:20]
            self.log(f"  → 窗口{window_index}: [{title}] 点击({client_x}, {client_y})")

        except Exception as e:
            self.log(f"  &#10007; 窗口{window_index} 发送失败: {e}")

def main():
    root = tk.Tk()
    app = ClickSimulatorApp(root)

    # 窗口关闭时清理
    def on_closing():
        app.stop_listening()
        root.destroy()

    root.protocol("WM_DELETE_WINDOW", on_closing)
    root.mainloop()

if __name__ == "__main__":
    main()
#（注：内容由AI生成）

---

[查看原文](https://www.52pojie.cn/thread-2129915-1-1.html)
