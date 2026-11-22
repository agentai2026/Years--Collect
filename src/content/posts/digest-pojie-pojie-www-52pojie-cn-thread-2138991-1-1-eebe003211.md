---
title: "C/C++ 特征码 Sunday、SSE2、AVX 搜索"
published: 2026-11-21
description: "自己使用的，Sunday、SSE2、AVX 搜索单独写在一个方法里，只使用一个方法，复制出来即可使用 也可下载附件使用，代码一样的 调用： [mw_shl_code=cpp,true]#include #include \\\"TyHijack.h\\\" int main() {"
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "wtujoxk"
sourceLink: "https://www.52pojie.cn/thread-2138991-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2138991-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

自己使用的，Sunday、SSE2、AVX 搜索单独写在一个方法里，只使用一个方法，复制出来即可使用

也可下载附件使用，代码一样的

**调用：**

[C++] *纯文本查看* *复制代码*
#include
#include "TyHijack.h"

int main()
{
	BYTE pMemBuffer[] = { 0xD5, 0xB4, 0x67, 0x92, 0x77, 0x67, 0x92, 0x77, 0x67 , 0x67, 0x92, 0x77, 0x67,0x58, 0x58,0x67, 0x92, 0x77, 0x67 , };
	std::string pattern = "67 92 77 67";

	ULONG_PTR startAddress = (ULONG_PTR)pMemBuffer; //起始地址
	ULONG_PTR endAddress = startAddress + sizeof(pMemBuffer); //结束地址

	printf("startAddress:%IX--endSize：%d\n", startAddress, sizeof(pMemBuffer));

	// 调用内存搜索算法
	std::vector
 resultList;
	clock_t nBeginTime = clock();
	//PatternFindEx(resultList, (HANDLE)-1, 0, pattern, 0);
	//SundayPatternFind(resultList, (HANDLE)-1, startAddress, endAddress, pattern, 0);
	//SSE2PatternFind(resultList, (HANDLE)-1, startAddress, endAddress, pattern, 0);
	AVX2PatternFind(resultList, (HANDLE)-1, startAddress, endAddress, pattern, 0);

	printf("共搜到：%d个地址-->搜索时间：%d ms\n", resultList.size(), clock() - nBeginTime);
	for (ULONG_PTR i = 0; i

[C++] *纯文本查看* *复制代码*
///
/// 开发者：ご听雨づ
/// TyHijack 特征码搜索
///
#include
#include
#include
#include
#include
#include

/*************************************************************************************
函数名称: PatternFindEx
函数功能: 通用特征码搜索 根据CPU自动选择Sunday、SSE2、AVX2进行搜索
输入参数: resultList   保存搜索结果的集合
		  hProcess   进程句柄 HANDLE hProcess = GetCurrentProcess();
		  module     0或者NULL全进程搜索（支持堆内存），否则搜索模块 HMODULE hModule = GetModuleHandle(L"模块名称");
		  pattern    搜索特征码，支持通配符??或8?或?8 格式为：std::string pattern = "?5 ?? 77 ?8 ?? AA BB";
		  searchNum  搜索个数，0为搜索整个模块
返    回: 找到地址的集合
调    用: std::vector
 resultList; PatternFindEx(resultList，hProcess, hModule, pattern, 0);
调    用: std::vector
 resultList; SundayPatternFind(resultList，hProcess, 0x1000, 0x2000, pattern, 0);
*************************************************************************************/

// Sunday特征码搜索
inline bool SundayPatternFind(std::vector
& resultList, HANDLE hProcess, ULONG_PTR startAddress, ULONG_PTR endAddress, std::string& pattern, int searchNum)
{
	// 进程句柄不能为空，起始地址必须小于结束地址，特征码不能为空
	if (!hProcess || startAddress > endAddress || pattern.empty())
	{
		MessageBoxA(NULL, "The input parameters are incorrect.", "Error", MB_OK);
		return false;
	}
	int index = 0;
	while ((index = pattern.find(' ', index)) >= 0) pattern.erase(index, 1); // 去除特征码所有空格
	if (pattern.length() & 1)	 // 特征码长度不能为单数
	{
		MessageBoxA(NULL, "The feature code is singular.", "Error", MB_OK);
		return false;
	}
	ULONG_PTR len = pattern.length() / 2; // 计算特征码长度
	ULONG_PTR nSundayLen = len;			  // 记录首次出现半?和??的位置
	ULONG_PTR nFirstMatch = len;		  // 跳过头部??，记录首次全码或半码位置
	BYTE* pMarkCode = new BYTE[len];	  // 存储转换后的特征码字节
	BYTE* pWildcard = new BYTE[len];	  // 存储特征字符串中??、?(??=FF、?=F、非?=0) 通配符
	BYTE* pMemBuffer = NULL;			  // 存放内存数据

	// 处理特征码字符串，转换成字节数组
	for (ULONG_PTR i = 0; i  (ULONG_PTR)mbi.BaseAddress ? startAddress : (ULONG_PTR)mbi.BaseAddress;
		ULONG_PTR tempEndAddress = endAddress = endSize) break;
					// 这里将暴力匹配算法和Sunday算法结合，判断是否使用Sunday算法
					// 当头部是??、半字节时，使用暴力匹配算法，否则使用Sunday算法
					// 判断Sunday模板数组 里有没有 内存偏移后的值，有则回溯
					if (nSundayLen && Shift[pMemBuffer[nOffset]])
						m = nOffset - Shift[pMemBuffer[nOffset]] + nFirstMatch;
					else m = nOffset + nFirstMatch;
					n = nFirstMatch - 1;
				}

				if (n + 1 == len)
				{
					if ((ULONG_PTR)pMarkCode != startAddress + m - n) // 排除特征码本身
						resultList.push_back(startAddress + m - n);
					if (resultList.size() >= searchNum && searchNum != 0) goto endSearchMemory; // 限制搜索数量
					m = m - n + nFirstMatch;
					n = nFirstMatch - 1;
				}
			}
			startAddress += endSize;
		}
		// 读取失败，整段跳过（按区域末尾推进，避免起始地址在区域中间时漏掉下一区域开头）
		else startAddress = (ULONG_PTR)mbi.BaseAddress + mbi.RegionSize;
	}
endSearchMemory:
	if (pMarkCode) { delete[] pMarkCode; pMarkCode = NULL; }
	if (pWildcard) { delete[] pWildcard; pWildcard = NULL; }
	if (pMemBuffer) { delete[] pMemBuffer; pMemBuffer = NULL; }
	return true;
}
// SSE2特征码搜索
inline bool SSE2PatternFind(std::vector
& resultList, HANDLE hProcess, ULONG_PTR startAddress, ULONG_PTR endAddress, std::string& pattern, int searchNum)
{
	// 进程句柄不能为空，起始地址必须小于结束地址，特征码不能为空
	if (!hProcess || startAddress > endAddress || pattern.empty())
	{
		MessageBoxA(NULL, "The input parameters are incorrect.", "Error", MB_OK);
		return false;
	}
	int index = 0;
	while ((index = pattern.find(' ', index)) >= 0) pattern.erase(index, 1); // 去除特征码所有空格
	if (pattern.length() & 1)	 // 特征码长度不能为单数
	{
		MessageBoxA(NULL, "The feature code is singular.", "Error", MB_OK);
		return false;
	}
	ULONG_PTR len = pattern.length() / 2; // 计算特征码长度
	ULONG_PTR nSundayLen = len;			  // 记录首次出现半?和??的位置
	ULONG_PTR nFirstMatch = len;		  // 跳过头部??，记录首次全码或半码位置
	BYTE* pMarkCode = new BYTE[len];	  // 存储转换后的特征码字节
	BYTE* pWildcard = new BYTE[len];	  // 存储特征字符串中??、?(??=FF、?=F、非?=0) 通配符
	BYTE* pMemBuffer = NULL;			  // 存放内存数据

	// 处理特征码字符串，转换成字节数组
	for (ULONG_PTR i = 0; i  (ULONG_PTR)mbi.BaseAddress ? startAddress : (ULONG_PTR)mbi.BaseAddress;
		ULONG_PTR tempEndAddress = endAddress = endSize) break;
					if (pWildcard[j] == 0xFF && j + 1 != len) continue;			   // 跳过??通配符；末字节??不跳过
					curHead = _mm_loadu_si128((__m128i*) & pMemBuffer[i + j]);	   // 取出16字节
					curHead = _mm_or_si128(curHead, _mm_set1_epi8(pWildcard[j]));  // 将对应特征码中'?'位置替换为F
					curCmp = _mm_cmpeq_epi8(curHead, _mm_set1_epi8(pMarkCode[j])); // 比较特征码
					bitComp = _mm_movemask_epi8(curCmp);					       // 得到比对结果
					bitComp = bitComp & cmpBit;							           // 与上次比对结果取交集
					if (bitComp == 0) break;                                       // 没有匹配上
					cmpBit = bitComp;
					if (j + 1 == len) // 匹配正确
					{
						ULONG tempBitComp = bitComp;
						while (_BitScanForward(&idxComp, tempBitComp))
						{
							// 清除已处理的位不会改变其余位的下标，所以 idxComp 本身就是相对 i 的偏移
							nOffset = i + idxComp; // 内存偏移位置
							if (nOffset + len > endSize)
								break; // 特征码必须完整落在本区域内，排除尾部补 0 凑出的假匹配
							// 排除特征码本身
							if ((ULONG_PTR)pMarkCode != startAddress + nOffset)
								resultList.push_back(startAddress + nOffset);
							//  限制个数，不全部搜索
							if (resultList.size() >= searchNum && searchNum != 0) goto endSearchMemory;

							tempBitComp &= ~(1UL  endAddress || pattern.empty())
	{
		MessageBoxA(NULL, "The input parameters are incorrect.", "Error", MB_OK);
		return false;
	}
	int index = 0;
	while ((index = pattern.find(' ', index)) >= 0) pattern.erase(index, 1); // 去除特征码所有空格
	if (pattern.length() & 1)	 // 特征码长度不能为单数
	{
		MessageBoxA(NULL, "The feature code is singular.", "Error", MB_OK);
		return false;
	}
	ULONG_PTR len = pattern.length() / 2; // 计算特征码长度
	ULONG_PTR nSundayLen = len;			  // 记录首次出现半?和??的位置
	ULONG_PTR nFirstMatch = len;		  // 跳过头部??，记录首次全码或半码位置
	BYTE* pMarkCode = new BYTE[len];	  // 存储转换后的特征码字节
	BYTE* pWildcard = new BYTE[len];	  // 存储特征字符串中??、?(??=FF、?=F、非?=0) 通配符
	BYTE* pMemBuffer = NULL;			  // 存放内存数据

	// 处理特征码字符串，转换成字节数组
	for (ULONG_PTR i = 0; i  (ULONG_PTR)mbi.BaseAddress ? startAddress : (ULONG_PTR)mbi.BaseAddress;
		ULONG_PTR tempEndAddress = endAddress = endSize) break;
					if (pWildcard[j] == 0xFF && j + 1 != len) continue;			         // 跳过??通配符；末字节??不跳过
					curHead = _mm256_loadu_si256((__m256i*) & pMemBuffer[i + j]);		 // 取出32字节
					curHead = _mm256_or_si256(curHead, _mm256_set1_epi8(pWildcard[j]));	 // 将对应特征码中'?'位置替换为F
					curCmp = _mm256_cmpeq_epi8(curHead, _mm256_set1_epi8(pMarkCode[j])); // 比较特征码
					bitComp = _mm256_movemask_epi8(curCmp);							     // 得到比对结果
					cmpBit = cmpBit & bitComp;									         // 与上次比对结果取交集
					if (cmpBit == 0) break;                                              // 没有匹配上
					if (j + 1 == len) // 匹配正确
					{
						ULONG tempBitComp = cmpBit;
						while (_BitScanForward(&idxComp, tempBitComp))
						{
							// 清除已处理的位不会改变其余位的下标，所以 idxComp 本身就是相对 i 的偏移，不能再累加
							nOffset = i + idxComp; // 内存偏移位置
							if (nOffset + len > endSize)
								break; // 特征码必须完整落在本区域内，排除尾部补 0 凑出的假匹配
							// 排除特征码本身
							if ((ULONG_PTR)pMarkCode != startAddress + nOffset)
								resultList.push_back(startAddress + nOffset);
							//  限制个数，不全部搜索
							if (resultList.size() >= searchNum && searchNum != 0) goto endSearchMemory;

							// 修复32位系统位操作问题：用清位代替移位，避免移位数等于32时的未定义行为（x86 上移位计数按 mod 32 生效会死循环）
							tempBitComp &= ~(1UL

![](https://static.52pojie.cn/static/image/filetype/zip.gif)

[TyHijack特征码搜索.zip](forum.php?mod=misc&action=attachpay&aid=2897047&tid=2138991)

*(5.77 KB, 下载次数: 0, 售价: 15 CB吾爱币)*

2026-11-22 10:21 上传

点击文件名下载附件

阅读权限: 20

售价: 15 CB吾爱币	 [[记录]](forum.php?mod=misc&action=viewattachpayments&aid=2897047)

 [[购买](forum.php?mod=misc&action=attachpay&aid=2897047&tid=2138991)]

下载积分: 吾爱币 -1 CB

---

[查看原文](https://www.52pojie.cn/thread-2138991-1-1.html)
