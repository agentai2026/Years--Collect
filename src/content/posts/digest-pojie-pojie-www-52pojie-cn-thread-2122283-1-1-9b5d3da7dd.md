---
title: "绿蛙seo软件（开源）从入门到精通最后干脆放弃"
published: 2026-08-10
description: "由Py+PyQt6开发的桌面版本SEO软件，我使用了3天时间，都无法解决在采集中途，遇到卡顿问题，最后得出了一个结论，Py+PyQt6开发的桌面爬虫就是一种垃圾产物，所以开源了，全部代码使用ai编程。 [mw_shl_code=asm,true]im ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "呱呱生"
sourceLink: "https://www.52pojie.cn/thread-2122283-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2122283-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

由Py+PyQt6开发的桌面版本SEO软件，我使用了3天时间，都无法解决在采集中途，遇到卡顿问题，最后得出了一个结论，Py+PyQt6开发的桌面爬虫就是一种垃圾产物，所以开源了，全部代码使用ai编程。

[Asm] *纯文本查看* *复制代码*
import sys
import os
import logging
import traceback
import gc
from PyQt6.QtWidgets import QApplication, QMessageBox
from PyQt6.QtGui import QFont, QColor, QPalette
from main_window import WebScraperGUI

def setup_logging():
    log_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'logs')
    os.makedirs(log_dir, exist_ok=True)
    log_path = os.path.join(log_dir, 'scraper.log')

    if os.path.exists(log_path):
        try:
            os.remove(log_path)
        except Exception:
            pass

    logging.basicConfig(
        level=logging.DEBUG,
        format='%(asctime)s [%(levelname)s] %(module)s:%(lineno)d - %(message)s',
        handlers=[
            logging.FileHandler(log_path, encoding='utf-8', mode='w'),
            logging.StreamHandler(sys.stdout)
        ]
    )
    return log_path

def main():
    log_path = setup_logging()
    logging.info('='*50)
    logging.info('程序启动')
    logging.info(f'Python版本: {sys.version}')
    logging.info(f'日志文件: {log_path}')

    try:
        app = QApplication(sys.argv)
        logging.info('QApplication 创建成功')

        _f = QFont()
        _f.setFamily('Microsoft YaHei')
        _f.setPointSize(12)
        _f.setHintingPreference(QFont.HintingPreference.PreferNoHinting)
        _f.setStyleStrategy(QFont.StyleStrategy.PreferAntialias)
        app.setFont(_f)
        logging.info('字体设置完成')

        _pal = app.palette()
        _pal.setColor(QPalette.ColorRole.Highlight,         QColor('#DDEAFC'))
        _pal.setColor(QPalette.ColorRole.HighlightedText,   QColor('#17365D'))
        _pal.setColor(QPalette.ColorGroup.Inactive, QPalette.ColorRole.Highlight,       QColor('#DDEAFC'))
        _pal.setColor(QPalette.ColorGroup.Inactive, QPalette.ColorRole.HighlightedText, QColor('#17365D'))
        _pal.setColor(QPalette.ColorGroup.Disabled, QPalette.ColorRole.Highlight,       QColor('#A9BFD6'))
        _pal.setColor(QPalette.ColorGroup.Disabled, QPalette.ColorRole.HighlightedText, QColor('#17365D'))
        app.setPalette(_pal)
        logging.info('调色板设置完成')

        app.setStyleSheet(
            'QWidget, QDialog, QMessageBox, QMainWindow, QMenu {'
            'font-family: "Microsoft YaHei", "微软雅黑", "PingFang SC", "Segoe UI", sans-serif;'
            '}'
            'QLabel, QPushButton, QCheckBox, QRadioButton, QLineEdit, QComboBox, QMenu, QAction, QTabBar, QToolButton {'
            'font-size: 11pt;'
            '}'
            'QPlainTextEdit, QTextEdit, QListWidget, QTableWidget, QAbstractItemView {'
            'font-size: 10pt;'
            '}'
            'QGroupBox { font-size: 11pt; font-weight: 600; }'
            'QSpinBox, QDoubleSpinBox, QDateTimeEdit, QDateEdit { font-size: 11pt; }'
            'QHeaderView::section { font-size: 10pt; padding: 6px 10px; }'
            'QLineEdit, QTextEdit, QPlainTextEdit, QListWidget, QAbstractItemView, QComboBox, QMenu, QDialog, QDialogButtonBox, QMessageBox {'
            'selection-background-color: #DDEAFC;'
            'selection-color: #17365D;'
            '}'
            'QDialog, QMessageBox { background: #FFFFFF; color: #1F2A44; }'
        )
        logging.info('样式表设置完成')

        window = WebScraperGUI()
        logging.info('WebScraperGUI 创建成功')

        window.showMaximized()
        logging.info('窗口显示成功，进入事件循环')

        sys.exit(app.exec())

    except Exception as e:
        error_msg = f'程序启动失败: {str(e)}\n\n详细错误:\n{traceback.format_exc()}'
        logging.error(error_msg)
        try:
            msg_box = QMessageBox()
            msg_box.setIcon(QMessageBox.Critical)
            msg_box.setWindowTitle('启动失败')
            msg_box.setText(f'程序启动失败，请查看日志文件:\n{log_path}\n\n错误信息:\n{str(e)}')
            msg_box.exec()
        except Exception:
            print(error_msg)
        sys.exit(1)
    finally:
        logging.info('程序退出，清理资源')
        gc.collect()

if __name__ == '__main__':
    main()

![](https://static.52pojie.cn/static/image/common/none.gif)

**2.jpg** *(349.45 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3MTEwMHxmNTJhZDVkNXwxNzg2NDAxMTY4fDB8MjEyMjI4Mw%3D%3D&nothumb=yes)

2026-8-10 19:56 上传

下面这个seo软件也是我开发的，使用Rust+Tauri 2.11 框架桌面版，要是哪天发布了，大家**不要[破解](https://www.52pojie.cn)**啊

![](https://static.52pojie.cn/static/image/smiley/default/31.gif)

![](https://static.52pojie.cn/static/image/common/none.gif)

**3.jpg** *(370.15 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3MTA5OHxhNzYzZTMzOHwxNzg2NDAxMTY4fDB8MjEyMjI4Mw%3D%3D&nothumb=yes)

2026-8-10 19:54 上传

py版本开源

![](https://static.52pojie.cn/static/image/filetype/zip.gif)

[绿蛙seo.zip](forum.php?mod=attachment&aid=Mjg3MTEwMXwzNDFkZDc0MHwxNzg2NDAxMTY4fDB8MjEyMjI4Mw%3D%3D)

*(480.39 KB, 下载次数: 20, 售价: 10 CB吾爱币)*

2026-8-10 19:57 上传

点击文件名下载附件

售价: 10 CB吾爱币	 [[记录]](forum.php?mod=misc&action=viewattachpayments&aid=2871101)

下载积分: 吾爱币 -1 CB

---

[查看原文](https://www.52pojie.cn/thread-2122283-1-1.html)
