---
title: "MFC调用链学习"
published: 2026-08-14
description: "一、文件注释： MFC.h与MFC.cpp属于框架代码 MY.h与MY.cpp属于自定义类 MFC.H文件： [mw_shl_code=cpp,true]#define BOOL int #define TRUE 1 #define FALSE 0 #include using namespace std; class"
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "lrj2025kernel"
sourceLink: "https://www.52pojie.cn/thread-2122905-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2122905-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

**一、文件注释：**

MFC.h与MFC.cpp属于框架代码

MY.h与MY.cpp属于自定义类

MFC.H文件：

[C++] *纯文本查看* *复制代码*
#define BOOL int
#define TRUE 1
#define FALSE 0

#include
using namespace std;
class CObject
{
public:
        CObject() {
        }
        ~CObject() {
        }
};

class CCmdTarget : public CObject
{
public:
        CCmdTarget() {
        }
        ~CCmdTarget() {
        }
};
class CWinThread : public CCmdTarget
{
public:
        CWinThread() {
        }
        ~CWinThread() {
        }

        virtual BOOL InitInstance() {
                cout

MFC.cpp文件

[C++] *纯文本查看* *复制代码*
#include "mfc.h"

BOOL CWnd::Create()
{
  cout

MY.h文件

[C++] *纯文本查看* *复制代码*

#include
#include "mfc.h"

class CMyWinApp : public CWinApp
{
public:
        CMyWinApp() {
        }
        ~CMyWinApp() {
        }

        virtual BOOL InitInstance();
};

class CMyFrameWnd : public CFrameWnd
{
public:
        CMyFrameWnd();
        ~CMyFrameWnd() {
        }
};

MY.cpp文件

[C++] *纯文本查看* *复制代码*
#include "my.h"

CMyWinApp myApp;

CWinApp* AfxGetApp()
{
        return myApp.m_pCurrentWinApp;
}

BOOL CMyWinApp::InitInstance()
{
        cout InitApplication();
        pApp->InitInstance();
        pApp->Run();
        system("pause");
}

**二、框架的稳定性：**

框架代码提供虚接口以使用户继承父类并改写功能

框架代码提供调用流程

**三、调用链条：**

在末端子类构造CMyFrameWnd中通过调用父类Create()方法层层上调直至到根类，产生调用链条，根类存在虚接口再多态调用回子类改写的虚方法

链条

![](https://attach.52pojie.cn/forum/202608/14/075208p6h16lx5w8zw7x6k.png)

---

[查看原文](https://www.52pojie.cn/thread-2122905-1-1.html)
