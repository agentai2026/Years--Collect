---
title: "MFC命令路由机制"
published: 2026-08-14
description: "[mw_shl_code=cpp,true]#include using namespace std; #define ID_OPEN 100 #define ID_SAVE 101 #define ID_EXIT 102 class CCmdTarget { public:"
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "lrj2025kernel"
sourceLink: "https://www.52pojie.cn/thread-2123013-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2123013-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

[C++] *纯文本查看* *复制代码*
#include
using namespace std;

#define ID_OPEN  100
#define ID_SAVE  101
#define ID_EXIT  102

class CCmdTarget
{
public:
	//要声明为虚函数，形成多态
	virtual bool OnCmdMsg(int id)
	{
		return false;
	}
};

class CDocument : public CCmdTarget
{
public:
	bool OnCmdMsg(int id) override
	{
		if (id == ID_SAVE)
		{
			cout OnCmdMsg(id))
			return true;

		return CCmdTarget::OnCmdMsg(id);
	}
};

class CWinApp : public CCmdTarget
{
public:
	bool OnCmdMsg(int id) override
	{
		if (id == ID_EXIT)
		{
			cout OnCmdMsg(id))
			return true;

		// ② Frame 自己
		if (CCmdTarget::OnCmdMsg(id))
			return true;

		// ③ App
		if (m_pApp->OnCmdMsg(id))
			return true;

		return false;
	}
};

int main()
{
	CWinApp app;
	CDocument doc;
	CView view(&doc);
	//这里暂时传入CView,实际中很可能是CView的派生类
	CFrameWnd frame(&view, &app);

	cout

---

[查看原文](https://www.52pojie.cn/thread-2123013-1-1.html)
