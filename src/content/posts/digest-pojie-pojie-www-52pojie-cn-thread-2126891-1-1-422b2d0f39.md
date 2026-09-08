---
title: "鸦码通 v3.6.6（适用于小白利用 AI 开发程序的代码编辑器）"
published: 2026-09-08
description: "一、前言 2026年3月，我还是一名编程小白，代码对我而言如同天书。从2026年3月到2026年9月，我借助AI辅助编写代码，陆续完成多款自用工具软件开发： 1、信息系统：文件传阅信息系统v2.7.2 2、小工具：Excel图表生成工 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "wuya1214"
sourceLink: "https://www.52pojie.cn/thread-2126891-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2126891-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

一、前言

2026年3月，我还是一名编程小白，代码对我而言如同天书。从2026年3月到2026年9月，我借助AI辅助编写代码，陆续完成多款自用工具软件开发：

1、信息系统：文件传阅信息系统v2.7.2

2、小工具：Excel图表生成工具v3.7.6【精品软件区】

3、小工具：U盘读写权限锁 v1.9.1【精品软件区】

4、小工具：网页表格抓取助手v1.5.2【精品软件区】

5、小工具：内网文件互传通v1.5【精品软件区】

6、小工具：Excel数据统计助手v1.3

7、小工具：鸦码通v3.6.6

在实际开发过程中，需要反复和AI沟通、迭代修改代码，踩过非常多坑，因此打磨出这款专为AI辅助开发设计的代码编辑器——鸦码通v3.6.6。它源自真实开发实战，专门解决小白用AI写代码时遇到的各类痛点。

二、软件布局

![](https://static.52pojie.cn/static/image/common/none.gif)

**鸦码通v3.6.6.jpg** *(275.09 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3NzQ1N3w4MGY5MGVjOHwxNzg4ODMyMTM1fDB8MjEyNjg5MQ%3D%3D&nothumb=yes)

2026-9-8 00:14 上传

软件界面划分为4个功能分区

1、**左上**：完整代码编辑区：加载、编辑源代码，支持多编码，可运行调试脚本

2、**右上**：控制面板区：缩进/行号输入、代码定位、代码检查、AI话术、PyInstaller一键打包全部功能

3、**左下**：旧代码片段区：粘贴AI给到的旧代码，用来在主代码中定位查找目标代码块；支持普通整行搜索、【忽略中间空行】模糊搜索

4、**右下**：新代码片段区：粘贴AI给到的新代码，用来替换旧代码；支持整行替换、字符替换、整行插入、新旧代码对比

完整工作流程：复制AI给的旧代码→左下框搜索定位 →复制AI给的新代码→右下框执行替换 →运行调试测试 →迭代修改 →最后一键打包生成exe程序。

三、支持编辑文件类型

".py": "Python",".c": "C/C++",".cpp": "C/C++",".h": "C/C++",".hpp": "C/C++",".au3": "AutoIt",".bat": "Batch批处理",".cmd": "Batch批处理",".vbs": "VBScript",".ps1": "PowerShell",".html": "HTML",".htm": "HTML",".js": "JavaScript",".css": "CSS",".json": "JSON",".xml": "XML",".ini": "INI配置",".conf": "配置文件",".reg": "注册表脚本",".csv": "CSV表格",".md": "Markdown",".sql": "SQL脚本",".yaml": "YAML配置",".yml": "YAML配置",".toml": "TOML配置",".txt": "普通文本"

四、软件核心亮点（小白向）

**1、智能查找旧代码，兼容代码中间空行**

把AI返回的旧代码粘贴至左下旧代码片段框，开启忽略中间空行，就算原始代码中间夹杂空行，依然可以精准定位匹配代码块，自动选中对应代码。

**2、智能替换算法，自动维护缩进，不会乱格式**

AI复制出来的代码缩进经常错乱。替换时软件自动剥离新代码的公共缩进，适配目标位置的空格层级，替换完成不会出现缩进报错；禁止缩进小于0，防止代码向左越界。支持整行替换、局部字符替换、整行插入。

**3、AI累计剪贴板话术，和AI沟通一键搞定**

内置开发小白和AI沟通高频话术按钮。点击按钮，文字累计追加到剪贴板，可以一次性把多条提示复制发给AI，不用手动反复复制粘贴。外部软件复制新内容会自动清空累计缓存，避免旧文字混入。

**4、新旧代码对比弹窗，差异字符标红，差异块上下分割线包裹**

将AI给的旧、新两段代码分别粘贴到底部左右输入框，点击【新旧代码对比】，弹窗展示对比结果；只展示差异内容，过滤完全一致的行；差异字符红色高亮，每一处差异块使用上下分割横线完整包裹；支持一键复制全部对比结果，方便直接发给AI。

**5、一站式代码检查，找出常见问题**

集成多项代码检测：Python语法报错检测、行尾多余空格、Tab/空格混合缩进、零宽隐形特殊字符、全角空格；还可以扫描未安装导入模块、裸except、硬编码路径等风险代码；支持一键清理行尾空白。

**6、文件管理与调试：加载、保存、另存为、调试运行**

自动识别文件编码；保存时对Python的“UTF&#8209;8&#8209;BOM”做风险提示；调试运行模式打开CMD黑框，程序报错不会一闪而过，可以完整看到报错信息，方便反馈给AI排查BUG。

**7、函数/类快速定位**

光标放在函数/类内部，一键定位整块def函数、class类，支持逐级向上跳转外层父函数、父类，快速浏览大块代码。

**8、内置可视化一键打包exe（PyInstaller）**

不用手写复杂的pyinstaller命令，图形界面填写主脚本、资源文件、ico图标、单文件/文件夹模式、是否隐藏黑框；自动生成bat脚本，自动pip安装依赖，CMD窗口输出完整打包日志。

五、小白最简工作流程（AI辅助开发标准流程）

推荐固定流程，大幅减少踩坑

1、用鸦码通打开你的.py源码；

2、AI给出修改方案，会同时提供【旧代码】和【新代码】；

3、旧代码复制 →粘贴左下【旧代码片段框】，点击整行搜索，软件在主编辑区自动定位并选中目标代码；

4、新代码复制 →粘贴右下【新代码片段框】，点击整行替换，软件自动处理缩进完成替换；

5、点击【调试运行】，查看CMD窗口有无报错；

6、如果报错，复制报错信息，配合AI话术按钮发给AI继续修复；

7、反复迭代，全部功能完成，使用右侧一键打包，生成exe给别人使用。

六、运行环境与依赖

运行系统：Windows

Python版本：Python3.8 ~ Python3.14

安装依赖命令：

pip install chardet pyinstaller

tkinter为Python自带库，精简版Python缺失，需要重装完整版Python。

七、重要避坑提示

1、新旧代码对比功能：默认隐藏全部内容一致行，只展示差异；每个差异块上下都有分割横线包裹；可以一键复制全部对比结果发给AI。

2、模糊搜索【忽略中间空行】：只会跳过片段中间的空行，片段开头、结尾空行必须严格匹配。

3、打包exe时，-i图标参数仅仅修改exe文件本身图标；软件窗口左上角、任务栏图标，需要你的目标程序代码内手动调用iconbitmap加载打包进去的ico资源。

4、Python脚本不要保存为UTF&#8209;8 BOM编码，会引发运行报错，软件会弹窗提醒。

5、累计剪贴板：切换回鸦码通窗口，如果在别的地方复制了文字，累计剪贴板会自动清空，防止上一轮话术残留。

6、替换操作会自动生成撤销快照，改错直接点左下角&#11013;撤销按钮恢复代码。

八、重要的核心功能代码：①查找并选中旧代码、②替换新代码并保持缩进正确

**【查找并选中旧代码】功能的核心代码**

[Python] *纯文本查看* *复制代码*
    # ========== 整行代码搜索（支持【模糊整行搜索】开关） ==========
    def full_block_search(self):
        # 重置模糊搜索游标
        self.fuzzy_search_line = 0
        self.fuzzy_search_word = ""
        #清空全部搜索类高亮，保留手动hl_line高亮
        self.text_content.tag_remove("search_hit", "1.0", tk.END)
        self.text_content.tag_remove("fuzzy_hit", "1.0", tk.END)
        self.text_content.tag_remove("green_hit", "1.0", tk.END)

        needle_raw = self.text_search.get("1.0", tk.END).rstrip("\n")
        if not needle_raw:
            messagebox.showwarning("提示", "旧代码片段不能为空")
            return
        needle_all = needle_raw.splitlines()
        editor_all = self.text_content.get("1.0", tk.END).splitlines()
        use_fuzzy = self.var_fuzzy_block.get()

        if not use_fuzzy:
            # ============原始精确模式（原有逻辑完全保留）============
            needle_strip = [line.strip() for line in needle_all]
            n = len(needle_strip)
            for i in range(len(editor_all) - n + 1):
                window = [line.strip() for line in editor_all[i:i + n]]
                if window == needle_strip:
                    start_line = i + 1
                    end_line = i + n
                    self.text_content.tag_add("search_hit", f"{start_line}.0", f"{end_line}.end")
                    self.entry_start.delete(0, tk.END)
                    self.entry_start.insert(0, str(start_line))
                    self.entry_end.delete(0, tk.END)
                    self.entry_end.insert(0, str(end_line))
                    first_line = editor_all[start_line - 1]
                    indent_len = len(first_line) - len(first_line.lstrip())
                    self.entry_indent.delete(0, tk.END)
                    self.entry_indent.insert(0, str(indent_len))
                    self.text_content.see(f"{start_line}.0")
                    self.text_content.mark_set(tk.INSERT, f"{start_line}.0")
                    return
            messagebox.showinfo("未找到", "未在完整代码区中找到匹配的整块代码")
            return
        else:
            # =================模糊整行搜索模式=================
            # 规则：
            # 1.旧片段首尾空行必须原样匹配，只允许跳过【片段内部两行有效代码中间】的纯空行
            # 2.比对时忽略中间空行；匹配成功取编辑器真实原始行范围，包含中间所有空行
            # 3.缩进、行尾空格严格校验，仅跳过完全空白行

            # 第一步：预处理旧片段，拆出【有效代码序列】，同时记录首尾是否为空行
            src_lines = needle_all
            # 判断旧片段第一行是否是空行
            src_first_is_empty = (src_lines[0].strip() == "")
            # 判断旧片段最后一行是否是空行
            src_last_is_empty = (src_lines[-1].strip() == "")
            # 提取旧片段去掉内部中间空行之后的有效代码列表
            src_effective = [ln for ln in src_lines if ln.strip() != ""]
            if len(src_effective) == 0:
                messagebox.showwarning("提示", "模糊模式：旧代码片段没有有效代码行")
                return
            src_eff_count = len(src_effective)

            editor_len = len(editor_all)
            # 在编辑器全文滑动查找
            for scan_start in range(editor_len):
                # 规则：如果旧片段首行是空行，则编辑器scan_start位置必须是空行；否则不能是空行
                editor_first_line = editor_all[scan_start]
                editor_first_empty = (editor_first_line.strip() == "")
                if src_first_is_empty != editor_first_empty:
                    continue

                # 从scan_start开始，收集编辑器有效代码行，直到凑够src_eff_count条
                editor_effective = []
                map_origin_row = []   # 有效代码 -> 编辑器真实行号(从0开始)
                ptr = scan_start
                while ptr = editor_len:
                        continue
                    tail_line = editor_all[end_eff_editor_row + 1]
                    if tail_line.strip() != "":
                        continue
                    real_end_0 = end_eff_editor_row + 1
                else:
                    real_end_0 = end_eff_editor_row

                real_start_0 = scan_start
                # 转成tk行号（+1）
                tk_start = real_start_0 + 1
                tk_end = real_end_0 + 1

                # 高亮【编辑器真实整块，包含中间所有空行】
                self.text_content.tag_add("search_hit", f"{tk_start}.0", f"{tk_end}.end")
                self.entry_start.delete(0, tk.END)
                self.entry_start.insert(0, str(tk_start))
                self.entry_end.delete(0, tk.END)
                self.entry_end.insert(0, str(tk_end))

                first_line_text = editor_all[real_start_0]
                indent_len = len(first_line_text) - len(first_line_text.lstrip())
                self.entry_indent.delete(0, tk.END)
                self.entry_indent.insert(0, str(indent_len))

                self.text_content.see(f"{tk_start}.0")
                self.text_content.mark_set(tk.INSERT, f"{tk_start}.0")
                return

            # 循环结束没有命中
            messagebox.showinfo("未找到", "模糊模式下未匹配到目标代码块")

希望和大家共同交流

---

[查看原文](https://www.52pojie.cn/thread-2126891-1-1.html)
