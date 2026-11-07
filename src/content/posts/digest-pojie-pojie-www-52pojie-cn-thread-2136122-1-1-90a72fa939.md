---
title: "微信读书自动答题工具"
published: 2026-11-06
description: "[md]## 项目介绍 最近用AI折腾了一个微信读书每日一答辅助工具（需要配置模型），平时玩微信读书每日一答，常常被一些题目难住，奈何才疏学浅，只能借助工具来弥补一下了。 主要用到：RapidOCR、OpenCV、mss、pyaut ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "StrayRabbit"
sourceLink: "https://www.52pojie.cn/thread-2136122-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2136122-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

### 项目介绍

最近用AI折腾了一个微信读书每日一答辅助工具（需要配置模型），平时玩微信读书每日一答，常常被一些题目难住，奈何才疏学浅，只能借助工具来弥补一下了。

主要用到：RapidOCR、OpenCV、mss、pyautogui、httpx。

### 实现思路

`截取窗口 → 本地 OCR 读题 → 模型判断选项 → 本地定位按钮 → 复核后点击`

- 本地先检查 OCR 置信度、选项完整性和按钮数量，不完整的题目不直接交给文本模型。

- 模型主要返回选项下标，按钮坐标由本地程序计算。

- 本地识别不可靠时，可在模型支持识图、剩余时间足够的情况下走图片路径兜底。

- PK 的文本与图片路径共用截止时间，避免文本超时后又重新计时，错过点击窗口。

- 支持 Esc 中止，也可以先用 `--dry-run` 只识别、不点击。

### 关键代码：校验 OCR 选项并请求模型答案

节选自 `src/weread_quiz/recognition.py`。本地 OCR 得到题干、选项和按钮数量后，先检查选项是否完整，再向模型请求答案。

`def answer_from_read(vision, read: OcrRead, prompt: str, *,
                     timeout: float | None = None,
                     deadline: float | None = None,
                     log: Callable[[str], None] | None = None) -> VisionQuestion | None:
    """完整选项才请求一次文本模型；下标始终对应原按钮槽位。"""
    if (not read.options or len(read.options) != read.button_count
            or any(not text.strip() for text in read.options)):
        if log is not None:
            log("本地 OCR 选项不完整，不请求文本答案")
        return None
    options = "\n".join(f"{index}. {text}" for index, text in enumerate(read.options))
    _check_deadline(deadline)
    request_options = {"timeout": timeout}
    if deadline is not None:
        request_options["deadline"] = deadline
    index = _ask_index(vision, read, prompt, options, **request_options)
    _check_deadline(deadline)
    if index is None or not (0
这里的 `read` 是本地 OCR 的读取结果，`_ask_index` 封装了模型求答。选项数量必须与按钮数量一致、每个选项都必须有文字；返回的答案从 0 开始编号，也必须落在合法范围内。任一检查不通过就返回 `None`，不把残缺选项或越界下标当作有效答案。通过检查只代表格式有效，不代表模型一定答对。

下面的函数负责在文本路径没有有效结果时，判断是否还有时间走图片路径。两段代码都依赖项目中的类型和辅助函数，完整实现见源码。

### 关键代码：限制图片兜底的时间预算

下面节选自 `src/weread_quiz/recognition.py`。依赖项目中的类型、异常和辅助函数，不是独立运行示例。

`def text_then_image(answer: Callable[[], VisionQuestion | None],
                    visual: Callable[[], VisionQuestion], *,
                    deadline: float | None = None,
                    minimum_image_budget: float,
                    log: Callable[[str], None] | None = None) -> VisionQuestion:
    """文本只试一次；图片只消费原 deadline 的余量，不续期、不重试 OCR。

    answer 的异常是否可回退由模式 adapter 决定，这里不混淆本地判否和模型失败。
    """
    question = answer()
    if question is not None:
        return question
    _check_deadline(deadline)
    if deadline is not None:
        remaining = deadline - time.monotonic()
        if remaining
文本路径有结果就直接返回；没有结果时，检查原截止时间。剩余时间不够就结束本次识别，而不是继续堆重试。

### 关键代码：本地执行点击

节选自 `src/weread_quiz/click.py`。外层完成按钮定位与点击前复核后，才调用这个函数；它负责检查中止状态、转换坐标并点击，不负责识题或判断页面是否可以点击。

`def click_box(box: Rect, region: Rect, pause: float = 0.3) -> None:
    """点击截图里的框。坐标由 dpi.box_center_to_screen 从标定坐标换算到屏幕。"""
    # 按了 Esc 就不再点 —— 中止必须赶在这一次点击之前生效。
    abort.check()
    x, y = box_center_to_screen(region, box)
    pyautogui.click(x, y)
    time.sleep(pause)`
`box` 是截图中的按钮框，`region` 是截图区域，`box_center_to_screen` 负责把按钮中心转换为屏幕坐标。执行点击前先调用 `abort.check()`，若已收到 Esc 中止请求，就不再执行这次点击。

### 使用说明

填写模型接口地址、API Key 和模型名称。打开小程序并保持窗口可见，再运行对应启动脚本。

程序需要联网调用模型，可能产生费用；文本题目或兜底截图会发送给所配置的服务商。存在识别错误、答错和误操作风险，不保证收益或账号安全，使用前请确认平台规则。PK 默认开启失败后尝试选第一个选项，不需要可设置 `GUESS_ON_FAILURE=0`。

### 源码与下载

- 项目源码：[https://github.com/StrayRabbit/weread-quiz](https://github.com/StrayRabbit/weread-quiz)

---

[查看原文](https://www.52pojie.cn/thread-2136122-1-1.html)
