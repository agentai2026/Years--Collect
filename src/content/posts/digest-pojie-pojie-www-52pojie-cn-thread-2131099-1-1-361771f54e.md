---
title: "【加密算法】神人加密算法"
published: 2026-10-06
description: "[md]# 神人加密算法（loonyEncrypt） **深受BrainFuck语言的毒害，神人加密算法诞生了。** 作者是高中生，在这里浅浅地分享一下最近突发奇想想出来的加密算法。 ## 加密原理 说实话当时我自己想出来这个加密算法的时候，还是觉得和现有的有点相似之处，这个**神人加 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "Pumpkin888666"
sourceLink: "https://www.52pojie.cn/thread-2131099-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2131099-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

## 神人加密算法（loonyEncrypt）

**深受BrainFuck语言的毒害，神人加密算法诞生了。**

作者是高中生，在这里浅浅地分享一下最近突发奇想想出来的加密算法。

### 加密原理

说实话当时我自己想出来这个加密算法的时候，还是觉得和现有的有点相似之处，这个**神人加密的核心就是：查表+算数**。

首先**程序将输入的原始数据，使用`ord()`函数将每一个字符转换Unicode码**。

此时我们得到了一个**码点数组**，如**`hello`**转换为码点我们就得到**`[104,101,108,108,111]`**。

然后是定义一个**密码表**，说简单点，**这里说的密码表就是定义不同的字符所代表的数字。**，比如**`a`这个字符代表数字`1`。它的大小就是1，相当于变量定义了**。

接下来，使用随机算法，**生成一串无意义且随机的字符，但是最后计算出的结果刚好可以转化为我们刚刚得到的码点数组**。

关键就在这，只要**最后计算的结果正确即可，不关心密文的长度与内容**。

这样就得到了密文。

### 那怎么计算密文呢？

既然密文需要计算，那么我们就要使用**关键字**。

我定义了一下关键字：

` . ( ) / + -

 同理

+ 表示加
- 表示减
. 表示乘
/ 表示除
【2026.10.6弃用】( 表示加上后面块的平方
【2026.10.6弃用】) 表示减去后面块的平方
()现在成对出现，用于递归【请见后文】`
密文的格式由**n个组**构成，每个组由**【``组成的前缀】+【密码表内存在的字符+关键词组成的可计算后缀】**组成。

**在每个组的位置基础上，使用前缀计算进行偏移，决定后缀计算出的结果应该在第几位**。（2026.10.6修改**此方法会导致<>字符膨胀**）

**使用前缀计算进行偏移，决定后缀计算出的结果应该在第几位**

如演示：

`hello`其中一个加密结果是：`>ag.ag.t/t+o-o.l/l.t/t+&-&.m/m+s-s+%-%.m/m+f-f+f-f.$/$.5/5.o/o.@/@<>>naeda.z/z.f/f.d/d+y-y+e-e+c-c+d-d.f/f.j/j.r/r.8/8+y-y+n-n>>>faba(baac.i/i+6-6+h-h+2-2<>>>bb+q-q+s-s.z/z+c-c.x/x+m-m+o-o.h/h.w/w+4-4.a/a.5/5.3/3>>>>>><>l.i/i.b/b>>><>b.y/y+x-x.d/d+b-b.h/h+3-3+i-i+t-t.z/z+n-n+w-w+@-@.4/4>><>>ad(ag+s-s+q-q.5/5+0-0+4-4.8/8+%-%+z-z.c/c+f-f+x-x+a-a+%-%+j-j><>>>rb.r/r+!-!.3/3+s-s+y-y+h-h.z/z+&-&.7/7+r-r+j-j.p/p+@-@><>>>eaaai+&-&+t-t+5-5+w-w+p-p+g-g+j-j.*/*.5/5.e/e.q/q.o/o+*-*+2-2>>>>>>>>>
>>><>jiic.q/q<>>>>>1mb.5/5+9-9+5-5+&-&+j-j+f-f+l-l.5/5+7-7+*-*.!/!.#/#+p-p.0/0.t/t`。

为什么叫其中呢？因为只要结果对就行了，内容是什么不重要。

### （）的详细解释

>
一开始，为了解决中文码点数字大而造成字符太多，用他表示加后面的平方。但是我发现原有的就可以解决，所以又弃用了。

我先尝试解释一下：

**(）成对出现，中间括起来的内容相当于独立的密文，可以解析出单独的码点对，但是个数不固定。（）的内容计算出来后，在前缀的作用下，指明0这个point在第几位，然后顺位将（）解析的数组和父级数组对齐，并相加。

如父级数组算出来[1,2,3,4,5]

但是（）的内容算出来了[8,7]并且（）前面的前缀point指向2，

那么应该8(括号的第一个)->3（原数组的第三个），7->4，这样相加。

允许（）嵌套，结果加到父级上。**

Deepseek解释一下：

**在密文中，( 与 ) 总是成对出现，它们把中间的内容包裹成一段独立的子密文块；解析时，先把这个子密文块当作一段完整密文单独解析，得到一个长度不固定的码点数组，然后根据紧挨在 ( 前面的前缀所计算出的目标位置，把这个子数组从该位置开始逐位与父级数组对齐并相加，若父级数组不够长就自动向后扩展补零，若目标位置为负则忽略该子数组；括号内部允许再嵌套括号，嵌套时同样按上述规则递归处理，先解析最内层，得到数组后合并到上一层，再逐层向外合并，最终所有括号块产生的数组都会按各自前缀指定的起点叠加到父级数组的对应位置上，从而参与整体码点的还原。**

### 源代码

#### 2026.10.6版本

`"""
Title : loonyEncrypt - 神人加密
Description : 顾名思义，神人加密，加密出来的东西很神。
Author : Pumpkin888666
Email : 响应论坛号召，抹去
"""
import random
import re
import math

default_key_map = {
    "a": 1, "b": 2, "c": 3, "d": 4, "e": 5, "f": 6, "g": 7, "h": 8,
    "i": 9, "j": 10, "k": 11, "l": 12, "m": 13, "n": 14, "o": 15,
    "p": 16, "q": 17, "r": 18, "s": 19, "t": 20, "u": 21, "v": 22,
    "w": 23, "x": 24, "y": 25, "z": 26,
    "1": 27, "2": 28, "3": 29, "4": 30, "5": 31, "6": 32, "7": 33,
    "8": 34, "9": 35, "0": 36,
    "!": 37, "@": 38, "#": 39, "$": 40, "%": 41, "^": 42, "&": 43, "*": 44,
}

# ============================================================
#                       解密端
# ============================================================

def evaluate_expression(expr, key_map):
    """
    对表达式字符串求值。
    支持的运算符：+ - . /
    从左到右求值，无优先级。
    （( 和 ) 不再是运算符，它们是结构性字符）
    """
    if not expr:
        return 0
    parts = [p for p in re.split(r"([+\-./])", expr) if p != ""]
    if not parts:
        return 0
    if parts[0] in '+-./':
        parts = ["0"] + parts

    def block_value(s):
        v = 0
        for ch in s:
            v += key_map.get(ch, 0)
        return v

    result = block_value(parts[0])
    i = 1
    while i + 1 '
    - kind: 'expr' 或 'paren'
    - body: 表达式字符串（expr）或子密文字符串（paren）
    """
    groups = []
    i = 0
    n = len(cipher)
    while i ':
            i += 1
        if i == p1_start:
            raise Exception(f"位置 {i} 处期望 ''，得到 {cipher[i]!r}")
        p1 = cipher[p1_start:i]

        if i >= n:
            raise Exception("前缀后缺少内容")

        if cipher[i] == '(':
            # 括号块：匹配到对应的 )
            depth = 0
            j = i
            while j = n:
                raise Exception("括号不匹配")
            inner = cipher[i + 1:j]
            groups.append((p1, 'paren', inner))
            i = j + 1
        else:
            # 表达式块：读到下一个  或 ( 为止
            j = i
            while j (':
                j += 1
            expr = cipher[i:j]
            groups.append((p1, 'expr', expr))
            i = j

    return groups

def _compute_index(p1):
    """根据  前缀计算净索引。"""
    idx = 0
    for c in p1:
        if c == '':
            idx += 1
    return idx

def _add_at(arr, idx, v):
    """把值 v 加到 arr[idx]，自动扩展数组长度。负索引忽略。"""
    if idx ，按  加 1 得到 net
    - 基准索引为 0，所以组目标位置 = net
    - body 为表达式：求值后加到 calc[net]
    - body 为 (inner)：递归解析 inner 得到子数组，
      从 net 开始逐位与父数组对齐相加
    - 允许任意深度嵌套
    """
    if not value:
        return []
    groups = _parse_groups(value)
    calc = []
    for p1, kind, body in groups:
        idx = _compute_index(p1)
        if kind == 'expr':
            v = evaluate_expression(body, key_map)
            _add_at(calc, idx, v)
        else:  # paren
            sub = s_calculate(body, key_map)
            for k, v in enumerate(sub):
                _add_at(calc, idx + k, v)
    return calc

# ============================================================
#                       加密端
# ============================================================

def _make_block(v, rev_map):
    """生成字符块，值之和恰为 v。均匀随机选值，块内字符打乱。"""
    if v  0:
        candidates = [x for x in values if x  串。
    必须非空。使用最短必要形式。
    """
    if net > 0:
        base = ['>'] * (net + 1) + ['']
    else:
        base = ['']
    random.shuffle(base)
    return ''.join(base)

def _split_value(value, num_parts):
    """把正整数 value 随机拆成 num_parts 个正整数。"""
    if num_parts  0)

# ============================================================
#                       测试
# ============================================================
if __name__ == "__main__":
    import time
    print("52pj - Pumpkin888666  [括号重定义版]")

    # 1. 括号对齐测试
    print("\n== 括号对齐测试 ==")
    key_map = dict(default_key_map)
    # 构造：[1,2,3,4,5] 基础值，位置2处加 [8,7]
    test_cipher = "<>a" + ">b" + ">>c" + ">>>d" + ">>>>e" + ">>(<>h>g)"
    calc = s_calculate(test_cipher, key_map)
    print(f"  密文: {test_cipher}")
    print(f"  解析: {calc}")
    print(f"  期望: [1, 2, 11, 11, 5]")
    print(f"  通过: {calc == [1, 2, 11, 11, 5]}")

    # 2. 嵌套括号测试
    print("\n== 嵌套括号测试 ==")
    inner2 = "<>h"                        # 解析为 [8]
    inner1 = "<>(" + inner2 + ")>g"       # 解析为 [8,7]
    nested = ">>(" + inner1 + ")"         # 加到父数组位置2
    calc2 = s_calculate(nested, key_map)
    print(f"  密文: {nested}")
    print(f"  解析: {calc2}")
    print(f"  期望: [0, 0, 8, 7]")
    print(f"  通过: {calc2 == [0, 0, 8, 7]}")

    # 3. 端到端加密解密
    print("\n== 端到端测试 ==")
    for original in ["hello", "你好世界", "这是一段测试文本，包含中文和English。"]:
        t0 = time.time()
        encrypted = s_encrypt(original, _random=10, max_groups=3, paren_prob=0.5)
        t1 = time.time()
        decrypted = s_decrypt(encrypted)
        t2 = time.time()

        n_lt = encrypted.count('')
        n_lp = encrypted.count('(')
        n_rp = encrypted.count(')')

        print(f"原文: {original}")
        print(f"密文: {encrypted}")
        print(f"解密: {decrypted}")
        print(f"成功: {decrypted == original}")
        print(f"密文长度: {len(encrypted)}  '':{n_gt}  '(':{n_lp}  ')':{n_rp}")
        print(f"加密: {t1-t0:.4f}s  解密: {t2-t1:.4f}s")
        print("-" * 60)`

先前的版本，因为效果不及此帖的，我就不一一贴出来了，如有感兴趣的，可以前往Github查看。

（）不知道吾爱能不能贴github，先不贴了，如果能贴的话麻烦提醒，有需要再补到评论区

遇到问题优先在吾爱留言！Github不常登！

---

[查看原文](https://www.52pojie.cn/thread-2131099-1-1.html)
