---
title: "分享一个通过浏览器自动化输入抖音短信验证码的方法"
published: 2026-09-22
description: "抖音网页登录自动化：XPath 找不到验证码输入框的解决方法 最近在给一个客户端程序增加抖音自动化搜索功能，登录流程大致是： [*] 客户端打开浏览器并进入抖音； [*] 获取登录二维码； [*] 将二维码发送到个人微信； [*] 用户在手机微信中查看二维码，再使 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "wangsir9527"
sourceLink: "https://www.52pojie.cn/thread-2129421-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2129421-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

**抖音网页登录自动化：XPath 找不到验证码输入框的解决方法**

最近在给一个客户端程序增加抖音自动化搜索功能，登录流程大致是：

客户端打开浏览器并进入抖音；

获取登录二维码；

将二维码发送到个人微信；

用户在手机微信中查看二维码，再使用抖音 App 扫码；

如果抖音要求身份验证，用户在微信中选择短信验证；

用户收到短信后，再把验证码发给客户端；

客户端自动填写验证码并完成登录。

整体流程并不复杂，但卡在了最后一步：验证码输入框怎么都填不进去。**一开始使用 XPath**

最初的写法类似这样：input_box = page.locator(    '//input[@placeholder="请输入验证码"]')input_box.fill(code)

或者：input_box = page.locator(    '//input[contains(@placeholder, "验证码")]')input_box.fill(code)

但是实际运行时经常出现以下情况：

找不到元素；

找到元素但无法输入；

fill() 没有报错，但页面没有变化；

输入内容填到了错误的输入框；

扫码后页面结构发生变化，之前的 XPath 失效。

**实际页面中有多个验证码输入框**

后来通过页面结构发现，抖音登录页面并不只有一个验证码输入框。

普通登录弹窗本身就存在一个：请输入验证码

扫码后，抖音又会弹出一个身份验证窗口，里面同样存在：请输入验证码

也就是说，全页面直接查找时，可能会命中后面那个隐藏的输入框，而不是当前显示的身份验证输入框。

这也是之前 XPath 一直失败的主要原因。

问题不是验证码内容不对，而是定位到了错误的 DOM 元素。**改用 Playwright 的可访问性定位

[Python] *纯文本查看* *复制代码*
#!/usr/bin/env python3
"""通过扫码和短信验证码登录抖音。

二维码由用户在抖音 App 中扫描，短信验证码由用户输入。脚本不会读取、绕过或自动
处理验证码/人脸验证，也不会默认保存会话。
"""

from __future__ import annotations

import argparse
import re
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

class DouyinLoginError(RuntimeError):
    """抖音登录流程失败。"""

@dataclass(frozen=True)
class LoginOptions:
    """登录流程配置。"""

    url: str = "https://www.douyin.com/"
    browser_channel: str = "chrome"
    executable_path: Optional[str] = None
    headless: bool = False
    timeout_ms: int = 30_000
    qr_timeout_seconds: int = 600
    storage_state: Optional[Path] = None
    keep_open: bool = False
    pause_on_error: bool = False

def _is_visible(locator, timeout_ms: int = 500) -> bool:
    """判断元素是否可见，并把超时转换为 False。"""

    try:
        return locator.is_visible(timeout=timeout_ms)
    except Exception:
        return False

def _wait_for(locator, timeout_seconds: float) -> bool:
    """轮询等待元素出现。"""

    deadline = time.monotonic() + timeout_seconds
    while time.monotonic()  bool:
    """判断页面顶部是否仍显示未登录入口。"""

    login = page.get_by_text("登录", exact=True)
    for index in range(login.count()):
        if _is_visible(login.nth(index), timeout_ms=300):
            return True
    return False

def _wait_for_login_success(page, verification_article, timeout_seconds: float) -> bool:
    """等待验证弹窗消失或页面顶部切换为已登录状态。"""

    deadline = time.monotonic() + timeout_seconds
    while time.monotonic()  None:
    """确保首页的登录弹窗已打开。"""

    if _is_visible(page.get_by_text("扫码登录", exact=True)):
        return

    login = page.get_by_text("登录", exact=True)
    if login.count() == 0:
        raise DouyinLoginError("未找到抖音登录入口")
    login.last.click()

    if not _wait_for(page.get_by_text("扫码登录", exact=True), 10):
        raise DouyinLoginError("抖音登录弹窗未出现")

def _wait_for_scan_or_login(page, timeout_seconds: int) -> None:
    """等待用户扫码后进入验证步骤。"""

    error = page.get_by_text("错误次数过多或验证码过期，请稍后重试", exact=True)

    deadline = time.monotonic() + timeout_seconds
    while time.monotonic()  str:
    """从终端读取短信验证码，不记录到日志。"""

    code = input("请输入抖音短信验证码（不会保存）：").strip()
    if not re.fullmatch(r"\d{4,8}", code):
        raise DouyinLoginError("验证码应为 4 至 8 位数字")
    return code

def login_douyin(options: LoginOptions = LoginOptions()):
    """打开隔离浏览器上下文并完成抖音登录。

    返回 ``(playwright, browser, context, page)``，调用方负责关闭这些对象。
    """

    try:
        from playwright.sync_api import TimeoutError as PlaywrightTimeoutError
        from playwright.sync_api import sync_playwright
    except ImportError as exc:
        raise DouyinLoginError(
            "缺少 Playwright，请先安装：pip install 'douyin-mcp-server[browser]'"
        ) from exc

    pw = sync_playwright().start()
    launch_args = {"headless": options.headless}
    if options.browser_channel:
        launch_args["channel"] = options.browser_channel
    if options.executable_path:
        launch_args["executable_path"] = options.executable_path

    try:
        browser = pw.chromium.launch(**launch_args)
        context = browser.new_context()
        context.set_default_timeout(options.timeout_ms)
        page = context.new_page()
        page.goto(options.url, wait_until="domcontentloaded")
        _ensure_login_dialog(page)
        print("请用抖音 App 扫描浏览器中的二维码。")
        _wait_for_scan_or_login(page, options.qr_timeout_seconds)
        otp, verification_article = _select_sms_verification(page)

        code = _read_code()
        otp.fill(code)
        page.get_by_text("验证", exact=True).last.click()

        error = page.get_by_text("错误次数过多或验证码过期，请稍后重试", exact=True)
        if _wait_for(error, 3):
            raise DouyinLoginError("验证码已过期或错误次数过多，请稍后重试")

        # 抖音验证成功后会先执行动画和状态刷新，不能用“立即可见”判断失败。
        if not _wait_for_login_success(page, verification_article, 15):
            raise DouyinLoginError("验证码验证未完成，请检查抖音页面提示")

        if options.storage_state:
            options.storage_state.parent.mkdir(parents=True, exist_ok=True)
            context.storage_state(path=str(options.storage_state))
            print(f"登录会话已保存到：{options.storage_state}")

        print("抖音登录成功。")
        return pw, browser, context, page
    except PlaywrightTimeoutError as exc:
        if options.pause_on_error:
            input("浏览器仍保持打开，按 Enter 后关闭……")
        pw.stop()
        raise DouyinLoginError("抖音页面操作超时，请检查网络或稍后重试") from exc
    except Exception:
        if options.pause_on_error:
            input("浏览器仍保持打开，按 Enter 后关闭……")
        pw.stop()
        raise

def _parse_args(argv: Optional[list[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="抖音扫码 + 短信验证码登录")
    parser.add_argument("--url", default="https://www.douyin.com/", help="抖音入口 URL")
    parser.add_argument(
        "--browser-channel",
        default="chrome",
        help="Playwright 浏览器 channel，默认使用已安装的 Google Chrome",
    )
    parser.add_argument("--executable-path", help="自定义 Chrome/Chromium 可执行文件路径")
    parser.add_argument("--qr-timeout", type=int, default=600, help="等待扫码秒数，默认 10 分钟")
    parser.add_argument(
        "--storage-state",
        type=Path,
        help="可选：保存登录 cookies 的 JSON 文件（请妥善保护）",
    )
    parser.add_argument(
        "--keep-open",
        action="store_true",
        help="登录成功后保持浏览器窗口，按 Enter 后退出",
    )
    return parser.parse_args(argv)

def main(argv: Optional[list[str]] = None) -> int:
    args = _parse_args(argv)
    options = LoginOptions(
        url=args.url,
        browser_channel=args.browser_channel,
        executable_path=args.executable_path,
        qr_timeout_seconds=args.qr_timeout,
        storage_state=args.storage_state,
        keep_open=args.keep_open,
        pause_on_error=True,
    )

    try:
        pw, browser, context, _page = login_douyin(options)
    except (DouyinLoginError, KeyboardInterrupt) as exc:
        print(f"登录失败：{exc}", file=sys.stderr)
        return 1

    try:
        if options.keep_open:
            input("按 Enter 关闭浏览器并结束程序……")
    finally:
        context.close()
        browser.close()
        pw.stop()
    return 0

if __name__ == "__main__":
    raise SystemExit(main())

****最终效果**

目前这套流程已经可以稳定完成：打开 Chrome    ↓进入抖音    ↓显示二维码    ↓二维码发送到微信    ↓用户使用抖音 App 扫码    ↓等待身份验证弹窗    ↓点击“接收短信验证码”    ↓等待短信验证码输入框    ↓用户通过微信发送验证码    ↓客户端填写验证码    ↓点击“验证”    ↓等待登录状态完成**总结**

这次问题的核心并不是 XPath 语法错误，而是页面存在多个相同输入框，并且扫码后 DOM 会动态变化。

相比直接写 XPath，比较稳妥的方式是：先定位语义明确的弹窗    ↓再在弹窗内部查找控件    ↓使用 role、label、placeholder 等语义定位    ↓等待元素真正可见    ↓最后再执行输入操作

最终使用的关键代码是：verification_article = find_verification_article(page)otp = verification_article.get_by_role(    "textbox",    name="请输入验证码").lastotp.fill(code)

这比直接对整个页面使用 XPath 稳定很多，也更容易应对抖音页面结构变化。

---

[查看原文](https://www.52pojie.cn/thread-2129421-1-1.html)
