---
title: "追踪类成员变量生命周期"
published: 2026-08-26
description: "一、演示代码 [mw_shl_code=cpp,true]#include \\\"stdio.h\\\" /* =================================================================== * [日期]: 2026年8月26日11时33分15秒 * [功能]:"
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "lrj2025kernel"
sourceLink: "https://www.52pojie.cn/thread-2124827-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2124827-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

一、演示代码

[C++] *纯文本查看* *复制代码*
#include "stdio.h"
/* ===================================================================
 * [日期]:    2026年8月26日11时33分15秒
 * [功能]:    追踪类成员变量生命周期
 * =================================================================== */
class Trace {
public:
        Trace(const char* name) :m_name(name) {
                printf("%s\n", m_name);
        }
        ~Trace() {
                printf("%s\n", m_name);
        }
private:
        const char* m_name;
};
class CPerson {
public:
        CPerson():pid("CPerson::pid") {
                printf("%s\n", "CPerson::CPerson()");
        }
        virtual ~CPerson() {
                printf("%s\n", "CPerson::~CPerson()");
        }
private:
        Trace pid;
};
class Lesson {
public:
        Lesson():count("Lesson::count")
        {
                printf("%s\n", "Lesson::Lesson()");
        }
        ~Lesson()
        {
                printf("%s\n", "Lesson::~Lesson()");
        }
private:
        Trace count;
};
class CStudent : public CPerson {
public:
        CStudent() :weight("CStudent::weight"), height("CStudent::height")
        {
                printf("%s\n", "CStudent::CStudent()");
        }
        ~CStudent()
        {
                printf("%s\n", "CStudent::~CStudent()");
        };
private:
        Trace    height;
        Trace    weight;
        Lesson   lesson;
};
int main(int argc, char* argv[]) {
        {
                CStudent one;
        }
        return 0;
}

二、运行结果

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(8.55 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3NDcwNXxkNmQ0ODljNHwxNzg3ODIxMzUxfDB8MjEyNDgyNw%3D%3D&nothumb=yes)

运行结果

2026-8-26 11:37 上传

三、注意事项

1、即便CPerson类中的成员pid是私有成员，CStudent one；执行完毕后的子类CStudent内存模型中包含它，私有只是代码不能类外部访问(one->pid编译错误)并不代表子类内存模型中没有它，通过偏移仍可访问到

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(16.31 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3NDcwNnwzNTM4MjY0MnwxNzg3ODIxMzUxfDB8MjEyNDgyNw%3D%3D&nothumb=yes)

子类内存模型中

2026-8-26 11:42 上传

2、内存模型中成员排布顺序与类成员变量声明顺序一致，与初始化列表中的出现先后顺序无关

---

[查看原文](https://www.52pojie.cn/thread-2124827-1-1.html)
