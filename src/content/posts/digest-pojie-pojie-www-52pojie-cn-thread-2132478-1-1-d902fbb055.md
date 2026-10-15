---
title: "仅根据BMI反推身高和体重？还真能做到！只需要简单的数论知识~"
published: 2026-10-14
description: "[md]## 引言 [本文视频版传送门](https://www.bilibili.com/video/BV12HpC64E3M) 视频封面： 今天在castelu大佬评论区看到这样一条评论： 我们不禁要问：能否仅根据BMI反推身高和体重？答案是肯定的 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "hans7"
sourceLink: "https://www.52pojie.cn/thread-2132478-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2132478-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

### 引言

[本文视频版传送门](https://www.bilibili.com/video/BV12HpC64E3M)

视频封面：

![](https://static.52pojie.cn/static/image/common/none.gif)

**261013-封面.png** *(756.63 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4NTkzMHxlNmRhOWFiNXwxNzkyMDIyNDk3fDB8MjEzMjQ3OA%3D%3D&nothumb=yes)

2026-10-14 16:07 上传

今天在castelu大佬评论区看到这样一条评论：

![](https://static.52pojie.cn/static/image/common/none.gif)

**通过BMI逆向出身高体重的评论.png** *(77.61 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4NTkzMXwzYzMzMWJlMXwxNzkyMDIyNDk3fDB8MjEzMjQ3OA%3D%3D&nothumb=yes)

2026-10-14 16:07 上传

我们不禁要问：能否仅根据BMI反推身高和体重？答案是肯定的，但有没有更优雅的做法？

本文 52pojie： [https://www.52pojie.cn/thread-2132478-1-1.html](https://www.52pojie.cn/thread-2132478-1-1.html)

本文 博客园： [https://www.cnblogs.com/hans77/articles/23302334](https://www.cnblogs.com/hans77/articles/23302334)

本文 juejin： [https://juejin.cn/post/7696335699613450249](https://juejin.cn/post/7696335699613450249)

**作者：[hans774882968](https://blog.csdn.net/hans774882968)以及[hans774882968](https://juejin.cn/user/1464964842528888)以及[hans774882968](https://www.52pojie.cn/home.php?mod=space&uid=1906177)以及[hans77](https://www.cnblogs.com/hans77)**

### 建模前的约定

我们知道BMI的计算公式：

$$
B=\frac{w}{h^2}
$$

为了方便数学建模，不妨先结合现实生活进行一些约定：

- 体重的单位是kg，所以精确到1位小数，比如114.5kg

- BMI使用的身高的单位是米，所以身高精确到3位小数，比如1.919米

- 有了前两条约定，B显然是有理数，不妨设为 $\frac{P}{Q}$

### 初步思路

进行上述约定后，凭Hans多年的算法竞赛经验（金（dǎ）牌（tiě）水平），一瞬间就想到，约定一个身高上限（因为很难见到3米以上的人类），便能直接枚举范围内所有可能的身高，用公式 $w=Bh^2$ 看何时能得到一位小数的体重即可。

虽然能解决问题，但局限性有点强啊……有没有更好的方法呢？有的。

### Hans的想法：质因数分解

回顾BMI的计算公式，令 $W=10w,\ H=1000h$ ，则W和H都为正整数，代入BMI公式：

$$
\frac{P}{Q}=\frac{w}{h^2}=\frac{\frac{W}{10}}{\left( \frac{H}{1000} \right)^2}=10^5 \frac{W}{H^2} \implies W=\frac{PH^2}{10^5Q} \tag{1}
$$

这里同学们不妨思考一下：为什么不变形为 $H^2$ 等于xxx，而是这样变形呢？

也就是说，我们希望**找到最小的正整数H，使得 $PH^2$ 是 $10^5Q$ 的倍数**，这就是道数论题了。为了方便，不妨设BMI已经是最简分数，即P和Q互素，于是P对倍数关系没有影响，问题转化为：

>
求最小的正整数H，使得 $H^2$ 是 $10^5Q$ 的倍数

这时，等式的分子只剩H，足够纯净，我们便不难想到：考虑 $D=10^5Q$ 的质因数分解

$$
D = p_1^{\alpha_1} p_2^{\alpha_2} \cdots p_k^{\alpha_k}
$$

为了让 $H^2$ 包含 $D$ 的所有质因数，$H$ 至少要包含 $\lceil \alpha_i / 2 \rceil$ 个 $p_i$ ，因此，最小的

$$
H = \prod_{i=1}^{k} p_i^{\lceil \alpha_i / 2 \rceil}
$$

对D质因数分解后立刻就能求出H，进而求出W。数据范围不太大的情况下，直接用试除法对D质因数分解即可，时间复杂度 $O(\sqrt{ D })$ 。最后，我们把P和Q互素的假设去掉，1式只需稍作修改：

$$
W=\frac{\frac{P}{g}H^2}{10^5 \frac{Q}{g}},\ g=gcd(P,Q)
$$

因为 $\frac{P}{g}$ 和 $\frac{Q}{g}$ 互素，所以只需要把上面假设的D改成 $D=10^5 \frac{Q}{g}$

完整代码：

`import math
from fractions import Fraction

def prime_factors(n):
    """对整数 n 进行质因数分解，返回字典 {素数: 幂次}"""
    factors = {}
    while n % 2 == 0:
        factors[2] = factors.get(2, 0) + 1
        n //= 2
    d = 3
    while d * d  1:
        factors[n] = factors.get(n, 0) + 1
    return factors

def find_exact_hw(bmi_value):
    """
    根据精确的有理数 BMI，构造出最小的一组
    身高精确到3位小数、体重精确到1位小数的 (h, w)
    """
    if isinstance(bmi_value, float):
        bmi_frac = Fraction(bmi_value).limit_denominator(10**9)
    else:
        bmi_frac = Fraction(bmi_value)

    P = bmi_frac.numerator
    Q = bmi_frac.denominator

    if P
输出：

`目标 BMI: 25 | 最小解: h=0.2  米, w=1.0  千克 | 验证: 1.0 / 0.2^2 = 25.00000
目标 BMI: 18.5 | 最小解: h=1.0  米, w=18.5 千克 | 验证: 18.5 / 1.0^2 = 18.50000
目标 BMI: 3.14159 | 最小解: h=100.0米, w=31415.9千克 | 验证: 31415.9 / 100.0^2 = 3.14159
目标 BMI: 1/3 | 最小解: h=3.0  米, w=3.0  千克 | 验证: 3.0 / 3.0^2 = 0.33333
目标 BMI: 22/7 | 最小解: h=3.5  米, w=38.5 千克 | 验证: 38.5 / 3.5^2 = 3.14286
目标 BMI: 560000/29241 | 最小解: h=0.855米, w=14.0 千克 | 验证: 14.0 / 0.855^2 = 19.15119
目标 BMI: 565000/29241 | 最小解: h=1.71 米, w=56.5 千克 | 验证: 56.5 / 1.71^2 = 19.32218
目标 BMI: 65000/3249 | 最小解: h=0.57 米, w=6.5  千克 | 验证: 6.5 / 0.57^2 = 20.00616
目标 BMI: 30625/1681 | 最小解: h=1.64 米, w=49.0 千克 | 验证: 49.0 / 1.64^2 = 18.21832
目标 BMI: 5952000/104329 | 最小解: h=1.615米, w=148.8千克 | 验证: 148.8 / 1.615^2 = 57.05029
目标 BMI: 28625000/1846881 | 最小解: h=2.718米, w=114.5千克 | 验证: 114.5 / 2.718^2 = 15.49910
目标 BMI: 114.514 | 最小解: h=10.0 米, w=11451.4千克 | 验证: 11451.4 / 10.0^2 = 114.51400
目标 BMI: 810.1919 | 最小解: h=100.0米, w=8101919.0千克 | 验证: 8101919.0 / 100.0^2 = 810.19190`
最后公布前面思考题的答案：

- 为什么不变形为 $H^2$ 等于xxx，而是这样变形呢？因为**验证一个分式是完全平方数**虽然可行（同学们不妨动手试试），但相比于**验证一个分式是正整数**，更为困难

---

[查看原文](https://www.52pojie.cn/thread-2132478-1-1.html)
