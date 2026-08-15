---
title: "MFC动态创建Demo"
published: 2026-08-14
description: "[mw_shl_code=C++,true]#include #include class Object; // ============================================================ // RuntimeClass // ======================="
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "lrj2025kernel"
sourceLink: "https://www.52pojie.cn/thread-2122983-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2122983-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

[] *纯文本查看* *复制代码*
#include
#include

class Object;

// ============================================================
// RuntimeClass
// ============================================================

struct RuntimeClass
{
        const char* name;

        // 父类的 RuntimeClass
        RuntimeClass* base;

        // 动态创建函数
        Object* (*createObject)();

        // 所有 RuntimeClass 组成一个链表
        RuntimeClass* next;

        // 链表头
        static RuntimeClass* first;

        // --------------------------------------------------------
        // 根据 RuntimeClass 创建对象
        // --------------------------------------------------------
        Object* CreateObject()
        {
                if (createObject == nullptr)
                {
                        std::cout name, className) == 0)
                        {
                                return current;
                        }

                        current = current->next;
                }

                return nullptr;
        }
};

// RuntimeClass 的静态成员必须在类外定义
RuntimeClass* RuntimeClass::first = nullptr;

// ============================================================
// Object
// ============================================================

class Object
{
public:

        virtual ~Object()
        {
        }

        // 返回当前对象真正的 RuntimeClass
        virtual RuntimeClass* GetRuntimeClass() const = 0;

        // --------------------------------------------------------
        // 判断：当前对象是不是 target 类型
        // --------------------------------------------------------
        bool IsKindOf(RuntimeClass* target)
        {
                RuntimeClass* current = GetRuntimeClass();

                while (current != nullptr)
                {
                        if (current == target)
                        {
                                return true;
                        }

                        // 沿着继承关系向父类走
                        current = current->base;
                }

                return false;
        }

        virtual void SayHello()
        {
                std::cout next = RuntimeClass::first;
        RuntimeClass::first = runtimeClass;
}

// ============================================================
// main
// ============================================================

int main()
{
        // --------------------------------------------------------
        // 1. 注册类
        // --------------------------------------------------------

        RegisterRuntimeClass(&View::runtimeClass);
        RegisterRuntimeClass(&MyView::runtimeClass);

        // --------------------------------------------------------
        // 2. 测试 IsKindOf
        // --------------------------------------------------------

        MyView* p = new MyView;

        std::cout IsKindOf(&MyView::runtimeClass)
                IsKindOf(&View::runtimeClass)
                CreateObject();

        if (pObj != nullptr)
        {
                pObj->SayHello();
        }

        // --------------------------------------------------------
        // 5. 释放对象
        // --------------------------------------------------------

        delete p;
        delete pObj;
        getchar();
        return 0;
}

---

[查看原文](https://www.52pojie.cn/thread-2122983-1-1.html)
