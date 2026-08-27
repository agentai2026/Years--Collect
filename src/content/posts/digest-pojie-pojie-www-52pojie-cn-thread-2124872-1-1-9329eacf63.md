---
title: "PotPlayer播放器在线字幕翻译-ArgosAI翻译-本地部署离线翻译插件"
published: 2026-08-26
description: "在我 [md][之前的帖子](https://www.52pojie.cn/thread-2035294-1-1.html)[/md] 有位同志(@whsyr77 )问“有没有本地翻译功能”。 然后我就想到了现在AI模型那么多，那多半有能本地部署的翻译模型，然后我让deepseek推 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "XiaoPeng45"
sourceLink: "https://www.52pojie.cn/thread-2124872-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2124872-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

在我 [之前的帖子](https://www.52pojie.cn/thread-2035294-1-1.html)

有位同志(@whsyr77  )问“有没有本地翻译功能”。

![](https://attach.52pojie.cn/forum/202608/26/162232azupauz4j4f4zwwt.png)

然后我就想到了现在AI模型那么多，那多半有能本地部署的翻译模型，然后我让deepseek推荐了几个，我为了图方便选择了Argos Translate。然后就写了一个新的插件。

翻译逻辑没有变，增加了本地后端的py文件，也就是说您需要安装python以及相应的库。然后通过运行run.py后便可在本地翻译了。

我的运行环境：i5-12400、16G运行内存、以及Intel 730集成显卡

**相关使用教程都在我的github或gitee中已说明

github: **https://github.com/lp20010415/PotPlayer_Subtitle_Translate_Argos

**gitee: **https://gitee.com/lp20010415/PotPlayer_Subtitle_Translate_Argos

run.py 代码如下:

[Python] *纯文本查看* *复制代码*
"""
支持的语言
Arabic, Azerbaijani, Basque, Catalan, Chinese, Czech, Danish, Dutch, English, Esperanto, Finnish, French, Galician, German,
Greek, Hebrew, Hindi, Hungarian, Indonesian, Irish, Italian, Japanese, Kyrgyz, Korean, Malay, Persian, Polish, Portuguese,
Portuguese (Brazil), Russian, Slovak, Spanish, Swahili, Swedish, Turkish, Ukrainian, Urdu
"""
from langdetect import detect_langs

"""
Argos Translate Package Index
https://www.argosopentech.com/argospm/index/
"""

from flask import Flask, request, jsonify
import argostranslate.translate

supported_languages = [
    "auto", # 自动检测
    "en", # 英语
    "zh", # 中文
    "zt", # 繁体中文
    "ja", # 日文
    "ko", # 韩文
    "fr", # 法文
    "es", # 西班牙文
    "th", # 泰文
    "ar", # 阿拉伯文
    "ru", # 俄文
    "pt", # 葡萄牙文
    "de", # 德文
    "it", # 意大利文
    "el", # 希腊文
    "nl", # 荷兰文
    "pl", # 波兰文
    "bg", # 保加利亚文
    "et", # 爱沙尼亚文
    "da", # 丹麦文
    "fi", # 芬兰文
    "cs", # 捷克文
    "ro", # 罗马尼亚文
    "sk", # 斯洛伐克文
    "sv", # 瑞典文
    "hu", # 匈牙利文
    "vi", # 越南文
]

# langdetect 到 Argos 的语言映射（与 AS 脚本的 GetLang 对应）
LANG_DETECT_TO_ARGOS = {
    'zh-cn': 'zh',      # 简体中文
    'zh-tw': 'zt',      # 繁体中文
    'zh': 'zh',         # 中文（默认简体）
    'ja': 'ja',         # 日语
    'ko': 'ko',         # 韩语
    'fr': 'fr',         # 法语
    'es': 'es',         # 西班牙语
    'th': 'th',         # 泰语
    'ar': 'ar',         # 阿拉伯语
    'ru': 'ru',         # 俄语
    'pt': 'pt',         # 葡萄牙语
    'de': 'de',         # 德语
    'it': 'it',         # 意大利语
    'el': 'el',         # 希腊语
    'nl': 'nl',         # 荷兰语
    'pl': 'pl',         # 波兰语
    'bg': 'bg',         # 保加利亚语
    'et': 'et',         # 爱沙尼亚语
    'da': 'da',         # 丹麦语
    'fi': 'fi',         # 芬兰语
    'cs': 'cs',         # 捷克语
    'ro': 'ro',         # 罗马尼亚语
    'sk': 'sk',         # 斯洛伐克语
    'sv': 'sv',         # 瑞典语
    'hu': 'hu',         # 匈牙利语
    'vi': 'vi',         # 越南语
    'en': 'en',         # 英语
}

app = Flask(__name__)

def detect_language(text):
    """
    检测文本语言，返回 Argos 支持的语言代码
    """
    try:
        # langdetect 返回检测结果列表，按概率排序
        detections = detect_langs(text)
        if detections:
            detected_lang = detections[0].lang  # 取最可能的语言
            # 映射到 Argos 支持的语言代码
            argos_lang = LANG_DETECT_TO_ARGOS.get(detected_lang, 'en')
            return argos_lang
    except Exception as e:
        print(f"语言检测失败: {e}")
        return 'en'  # 默认返回英语
    return 'en'

def translate_text(from_code, to_code, text):

    return argostranslate.translate.translate(text, from_code, to_code)

def handle_translation_request(from_code, to_code, text):
    if from_code.strip() == "" or to_code.strip() == "":
        return jsonify({
            'message': f'源语言或目标语言为空',
            'status': 'error'
        })

    if from_code == "auto":
        from_code = detect_language(text)

    if from_code not in supported_languages or to_code not in supported_languages:
        return jsonify({
            'message': f'不支持的语言: {from_code} 或 {to_code}',
            'status': 'error'
        })

    translated_text = translate_text(from_code, to_code, text)
    print(translated_text)

    if translated_text is not None:
        return jsonify({
            'message': translated_text,
            'status': 'success'
        })
    else:
        return jsonify({
            'message': f'无法找到从 {from_code} 到 {to_code} 的翻译器',
            'status': 'error'
        })

@app.route('/api/translate', methods=['GET'])
def handle_translate():

    fromCode = request.args.get('fromCode') # 源语言
    toCode = request.args.get('toCode')     # 目标语言
    text = request.args.get('text')         # 待翻译文本
    print(text)

    return handle_translation_request(fromCode, toCode, text)

@app.route('/api/status', methods=['GET'])
def handle_status():
    return jsonify({
        'message': 'API is running',
        'status': 'success'
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8989)

**最后，感谢您使用我做的插件，感恩！**&#128591;&#128591;&#128591;

---

[查看原文](https://www.52pojie.cn/thread-2124872-1-1.html)
