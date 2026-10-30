---
title: "C/C++ 高性能特征码定位 findpattern 更新"
published: 2026-10-29
description: "旧版链接：https://www.52pojie.cn/thread-1623689-1-1.html 更新说明： 1、SSE2 增加边界处理。 2、增加AVX2支持 3、不会用问AI。 4、读远程进程需要自己简单封装一下问AI。 6、读200个特征码仅需0.01秒，实测。 以下是新版代码：[mw_shl_code=c"
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "小小随"
sourceLink: "https://www.52pojie.cn/thread-2134785-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2134785-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

旧版链接：[https://www.52pojie.cn/thread-1623689-1-1.html](https://www.52pojie.cn/thread-1623689-1-1.html)

更新说明：

1、SSE2 增加边界处理。

2、增加AVX2支持

3、不会用问AI。

4、读远程进程需要自己简单封装一下问AI。

6、读200个特征码仅需0.01秒，实测。

以下是新版代码：[C++] *纯文本查看* *复制代码*
#ifndef __HEXMATCH_H__
#define __HEXMATCH_H__

#if defined(_MSC_VER) && (_MSC_VER >= 1200)
#	pragma once
#endif

#include
#include
#include
#include
#include
#include
#include
#include

#ifndef CastSet
#   define CastSet(t, x) *std::bit_cast(x)
#endif

#ifndef CastGet
#   define CastGet(t, x) *std::bit_cast(x)
#endif

#ifndef CastBit
#   define CastBit(t, x) std::bit_cast(x)
#endif

#ifndef CastRef
#   define CastRef(t, x) (*std::bit_cast(std::bit_cast(x)))
#endif

#if defined(DEBUG) || defined(_DEBUG)
#   pragma optimize("gt", on)
#endif

enum math_type
{
    math_constant,
    math_imm,
    math_address
};

static constexpr char charhexset[] = "0123456789ABCDEFabcdef";

static bool StringReplace(std::string& source, const std::string& delimiters, const std::string& dispose = "", const std::size_t offset = 1)
{
    if (source.empty()) {
        return false;
    }

    if (delimiters.empty()) {
        return true;
    }

    for (std::string::size_type pos = source.find(delimiters); pos != std::string::npos; pos = source.find(delimiters)) {
        if (source.replace(pos, offset, dispose).size()) {
            continue;
        }
        return false;
    }

    return true;
}

static bool Hexadec2xdigit(const std::string& data, std::string& buffer, std::size_t offset)
{
    if (data.empty()) {
        return false;
    }

    for (std::size_t i = 0; i (std::stoul(data.substr(i, offset), nullptr, 16));
        } else {
            buffer += 'X';
        }
    }

    return true;
}

static bool Hexadec2xdigitEx(const std::string& data, std::string& buffer, std::uint32_t checkxdigit = 0, std::uint32_t transform = 1)
{
    if (data.empty()) {
        return false;
    }

    std::string masks(data);
    {
        // 去掉 空格
        if (StringReplace(masks, " ")) {
            // 大小写转换
            if (masks.end() == (1 == transform ? std::transform(masks.begin(), masks.end(), masks.begin(), [] (unsigned char ch) { return toupper(ch); }) : std::transform(masks.begin(), masks.end(), masks.begin(), [] (unsigned char ch) { return tolower(ch); }))) {
                // 检查是否是完整的十六进制数
                if (checkxdigit) {
                    if (std::string::npos != masks.find_first_not_of(charhexset)) {
                        return false;
                    }
                }

                return Hexadec2xdigit(static_cast(masks), buffer, 2);
            }
        }
    }

    return false;
}

static bool SearchPattern(const std::uint8_t* pos, const std::string_view& chars)
{
    for (std::string_view::const_iterator xdigit = chars.cbegin(); xdigit != chars.cend(); ++xdigit, ++pos) {
        if (*pos != static_cast(*xdigit) &&           // no match
            'X' != static_cast(*xdigit))              // filter out arbitrary characters
        {
            return false;
        }
        // else hit character
    }

    return true;
}

static bool SearchPattern(const std::uint8_t* start,                      // start address
                          const std::uint8_t* end,                        // end address
                          const std::string& keyword,                     // characteristic code
                          std::size_t index,                              // take out the serial number
                          std::size_t offset,                             // pointer offset
                          std::size_t size,
                          math_type type,						          // is call
                          void*& address)                                 // return to address
{
    if (keyword.empty()) {
        return true;
    }

    if (start != end && end > start && static_cast(end - start) > keyword.size()) {
        std::string chars;
        {
            if (Hexadec2xdigitEx(keyword, chars, 0)) {
                for (auto [pos, i] = std::make_tuple(start, static_cast(0)); pos != end; ++pos) {
                    if (SearchPattern(pos, chars)) {
                        if (++i != index) {
                            continue;
                        }

                        switch (type) {
                            case math_constant:
                                switch (size) {
                                    case 1: address = reinterpret_cast(CastGet(std::uint8_t, reinterpret_cast(pos) + offset));  break;
                                    case 2: address = reinterpret_cast(CastGet(std::uint16_t, reinterpret_cast(pos) + offset)); break;
                                    case 4: address = reinterpret_cast(CastGet(std::uint32_t, reinterpret_cast(pos) + offset)); break;
                                    case 8: address = reinterpret_cast(CastGet(std::uint64_t, reinterpret_cast(pos) + offset)); break;
                                    default: break;
                                }
                                break;
                            case math_imm:
                                address = reinterpret_cast(reinterpret_cast(CastGet(void*, reinterpret_cast(pos) + offset)) + reinterpret_cast(pos + (offset - 1) + 5));
                                break;
                            case math_address:
                                address = reinterpret_cast(reinterpret_cast(pos) + offset);
                                break;
                            default: break;
                        }

                        return false;
                    }
                }
            }
        }
    }

    return true;
}

template
static bool SearchPattern(const std::intptr_t start,                     // start address
                          const std::intptr_t end,                        // end address
                          const std::string& keyword,                     // characteristic code
                          std::size_t index,                              // take out the serial number
                          std::size_t offset,                             // pointer offset
                          std::size_t size,
                          math_type type,						          // is call
                          Type& address)                                  // return to address
{
    return SearchPattern(reinterpret_cast(start), reinterpret_cast(end), keyword, index, offset, size, type, reinterpret_cast(address));
}

static bool SearchPatternSSE2(const std::uint8_t* start,                    // start address
                              const std::uint8_t* end,                      // end address
                              const std::string& chars,                     // characteristic code
                              std::size_t index,                            // take out the serial number
                              std::size_t offset,                           // pointer offset
                              void*& address,                               // return to address
                              std::size_t size,
                              math_type type,						        // is call
                              std::size_t count,                            // number of characteristic multiples
                              std::size_t prefetch_size = 128

)
{
    for (auto [masks, i, n, k, pos] = std::make_tuple(std::array{}, static_cast(0), static_cast(0), static_cast(0), start); i (chars.c_str() + i * 16)[j]) {
                masks[i] |= static_cast(1) (chars.c_str() + i * 16)), static_cast(0));
             pos (pos + prefetch_size), _MM_HINT_NTA);
            }
            // block check
            if (pos + (i * 16) + 16 > end) {
                break;
            }

            if (static_cast(static_cast(_mm_movemask_epi8(_mm_cmpeq_epi8(_mm_loadu_si128(reinterpret_cast(pos + (i * 16))), pattern))) & masks[i]) == masks[i]) {
                if (n (CastGet(std::uint8_t, reinterpret_cast(pos) + offset));  break;
                            case 2: address = reinterpret_cast(CastGet(std::uint16_t, reinterpret_cast(pos) + offset)); break;
                            case 4: address = reinterpret_cast(CastGet(std::uint32_t, reinterpret_cast(pos) + offset)); break;
                            case 8: address = reinterpret_cast(CastGet(std::uint64_t, reinterpret_cast(pos) + offset)); break;
                            default: break;
                        }
                        break;
                    case math_imm:
                        address = reinterpret_cast(reinterpret_cast(CastGet(void*, reinterpret_cast(pos) + offset)) + reinterpret_cast(pos + (offset - 1) + 5));
                        break;
                    case math_address:
                        address = reinterpret_cast(reinterpret_cast(pos) + offset);
                        break;
                    default: break;
                }

                return false;
            }
        }
    }

    return true;
}

static bool SearchPatternSSE2(const std::uint8_t* start,                    // start address
                              const std::uint8_t* end,                      // end address
                              const std::string& keyword,                   // characteristic code
                              std::size_t index,                            // take out the serial number
                              std::size_t offset,                           // pointer offset
                              std::size_t size,
                              math_type type,						          // is call
                              void*& address,                               // return to address
                              std::size_t prefetch_size = 128
)
{
    if (keyword.empty()) {
        return true;
    }

    if (start != end && end > start && static_cast(end - start) > keyword.size()) {
        std::string chars;
        {
            if (Hexadec2xdigitEx(keyword, chars, 0)) {
                return SearchPatternSSE2(start,
                                         end,
                                         chars,
                                         index,
                                         offset,
                                         address,
                                         size,
                                         type,
                                         static_cast((((chars.size()) + (16 - 1)) & ~(16 - 1)) >> 4));
            }
        }
    }

    return true;
}

template
static bool SearchPatternSSE2(std::intptr_t start,                          // start address
                              std::intptr_t end,                            // end address
                              const std::string& keyword,                   // characteristic code
                              std::size_t index,                            // take out the serial number
                              std::size_t offset,                           // pointer offset
                              std::size_t size,
                              math_type type,						          // is call
                              Type& address,                                // return to address
                              std::size_t prefetch_size = 128
)
{
    return SearchPatternSSE2(reinterpret_cast(start),
                             reinterpret_cast(end),
                             keyword,
                             index,
                             offset,
                             size,
                             type,
                             reinterpret_cast(address));
}

static bool SearchPatternAVX2(const std::uint8_t* start,                  // start address
                              const std::uint8_t* end,                    // end address
                              const std::string& chars,                   // characteristic code (already processed)
                              std::size_t index,                          // take out the serial number
                              std::size_t offset,                         // pointer offset
                              void*& address,                             // return to address
                              std::size_t size,
                              math_type type,                             // is call
                              std::size_t count,                          // number of 32-byte blocks
                              std::size_t prefetch_size = 128
)
{
    for (auto [masks, i, n, k, pos] = std::make_tuple(std::array{}, static_cast(0), static_cast(0), static_cast(0), start); i (chars.c_str() + i * 32)[j]) {
                masks[i] |= (static_cast(1) (chars.c_str() + i * 32)), static_cast(0));
             pos (pos + prefetch_size), _MM_HINT_NTA);
            }

            if (pos + (i * 32) + 32 > end) {
                break;
            }

            if ((static_cast(static_cast(_mm256_movemask_epi8(_mm256_cmpeq_epi8(_mm256_loadu_si256(reinterpret_cast(pos + (i * 32))), pattern)))) & masks[i]) == masks[i]) {
                if (n (CastGet(std::uint8_t, reinterpret_cast(pos) + offset));  break;
                            case 2: address = reinterpret_cast(CastGet(std::uint16_t, reinterpret_cast(pos) + offset)); break;
                            case 4: address = reinterpret_cast(CastGet(std::uint32_t, reinterpret_cast(pos) + offset)); break;
                            case 8: address = reinterpret_cast(CastGet(std::uint64_t, reinterpret_cast(pos) + offset)); break;
                            default: break;
                        }
                        break;
                    case math_imm:
                        address = reinterpret_cast(reinterpret_cast(CastGet(void*, reinterpret_cast(pos) + offset)) + reinterpret_cast(pos + (offset - 1) + 5));
                        break;
                    case math_address:
                        address = reinterpret_cast(reinterpret_cast(pos) + offset);
                        break;
                    default: break;
                }

                return false;
            }
        }
    }

    return true;
}

static bool SearchPatternAVX2(const std::uint8_t* start,                  // start address
                              const std::uint8_t* end,                    // end address
                              const std::string& keyword,                 // characteristic code
                              std::size_t index,                          // take out the serial number
                              std::size_t offset,                         // pointer offset
                              std::size_t size,
                              math_type type,                             // is call
                              void*& address,                             // return to address
                              std::size_t prefetch_size = 128
)
{
    if (keyword.empty()) {
        return true;
    }

    if (start != end && end > start && static_cast(end - start) > keyword.size()) {
        std::string chars;
        {
            if (Hexadec2xdigitEx(keyword, chars, 0)) {
                return SearchPatternAVX2(start,
                                         end,
                                         chars,
                                         index,
                                         offset,
                                         address,
                                         size,
                                         type,
                                         static_cast((((chars.size()) + (32 - 1)) & ~(32 - 1)) >> 5));
            }
        }
    }

    return true;
}

template
static bool SearchPatternAVX2(std::intptr_t start,                        // start address
                              std::intptr_t end,                          // end address
                              const std::string& keyword,                 // characteristic code
                              std::size_t index,                          // take out the serial number
                              std::size_t offset,                         // pointer offset
                              std::size_t size,
                              math_type type,                             // is call
                              Type& address,                              // return to address
                              std::size_t prefetch_size = 128
)
{
    return SearchPatternAVX2(reinterpret_cast(start),
                             reinterpret_cast(end),
                             keyword,
                             index,
                             offset,
                             size,
                             type,
                             reinterpret_cast(address));
}

#if defined(DEBUG) || defined(_DEBUG)
#   pragma optimize("gt", off)
#endif

#endif // __HEXMATCH_H__

## hexmatch.hpp - 高性能模式匹配库

### 概述

`hexmatch.hpp` 是一个用于内存扫描、逆向工程和游戏修改的高性能字节模式匹配库。它提供了三种使用不同 SIMD 指令集优化的实现：

- **SearchPattern**: 基线实现（逐字节扫描）

- **SearchPatternSSE2**: SSE2 优化（16 字节 SIMD 块）

- **SearchPatternAVX2**: AVX2 优化（32 字节 SIMD 块）

### 特性

✅ 通配符支持（`??` 或任何非十六进制字符）

✅ 多重匹配索引（查找第 N 个匹配项）

✅ 灵活的地址提取模式

✅ SIMD 加速扫描（SSE2/AVX2）

✅ 可配置的预取以优化缓存

✅ 仅头文件库（需要 C++20）

### 快速开始

#### 基本用法

`#include "hexmatch.hpp"

// 在内存中搜索模式
void* result = nullptr;
bool not_found = SearchPatternSSE2(
    reinterpret_cast(0x400000),  // 起始地址
    reinterpret_cast(0x500000),  // 结束地址
    "48 8B 05 ?? ?? ?? ?? 48 85 C0",            // 模式（十六进制字符串）
    1,                                           // 查找第 1 个匹配
    3,                                           // 匹配内的偏移量
    4,                                           // 大小（4 字节）
    math_constant,                               // 提取模式
    result                                       // 输出地址
);

if (!not_found) {
    printf("找到位置: 0x%p\n", result);
}`

### API 参考

#### 函数签名

三个函数共享相同的 API：

`template
bool SearchPattern[SSE2|AVX2](
    std::intptr_t start,           // 搜索范围的起始地址
    std::intptr_t end,             // 搜索范围的结束地址
    const std::string& keyword,    // 十六进制模式字符串
    std::size_t index,             // 匹配索引（1 = 第一个，2 = 第二个，等等）
    std::size_t offset,            // 匹配模式内的字节偏移量
    std::size_t size,              // 要提取的值的大小（1/2/4/8 字节）
    math_type type,                // 提取模式
    Type& address,                 // 输出：提取的地址/值
    std::size_t prefetch_size = 128 // 预取距离（字节）
);`

#### 参数说明

`start` / `end` (std::intptr_t)

- **描述**: 要搜索的内存范围（包含起始，不包含结束）

- **示例**: `0x400000` 到 `0x500000` 搜索 1MB

- **注意**: 必须是有效的可读内存，否则会崩溃

`keyword` (const std::string&)

- **描述**: 带可选通配符的十六进制模式字符串

- **格式**: 空格分隔的十六进制字节（例如 `"48 8B 05 ?? ?? ?? ??"`）

- **通配符**: `??` 或任何非十六进制字符（例如 `XX`、`__`）

- **示例**:
`"48 8B 05 ?? ?? ?? ??"     // 有效
"488B05 ?? ?? ?? ??"        // 有效（空格可选）
"48 8b 05 XX XX XX XX"      // 有效（XX = 通配符）`

`index` (std::size_t)

- **描述**: 返回第几个匹配（从 1 开始）

- **示例**:

`1` → 第一个匹配

- `2` → 第二个匹配

- `10` → 第十个匹配

- **注意**: 函数会扫描直到找到 `index` 个匹配或到达结束

`offset` (std::size_t)

- **描述**: 匹配模式内值所在的字节偏移量

- **示例**: 对于模式 `"48 8B 05 [AA BB CC DD]"`，偏移 `3` 指向 `AA`

- **用途**: 提取嵌入在指令中的立即数或指针

`size` (std::size_t)

- **描述**: 在 `offset` 位置读取的值的大小

- **值**: `1`（字节）、`2`（字）、`4`（双字）、`8`（四字）

- **配合使用**: `math_constant` 模式

`type` (math_type)

- **描述**: 如何解释 `offset` 处的值

- **值**:

`math_constant`: 读取原始值（1/2/4/8 字节）

- `math_imm`: 从 x86 相对立即数计算绝对地址（RIP 相对）

- `math_address`: 返回偏移位置的指针

-
**示例**:

`// math_constant: 读取 4 字节整数
// 模式: "B8 [12 34 56 78]" → 返回 0x78563412

// math_imm: 解析 x86_64 RIP 相对地址
// 模式: "48 8B 05 [AA BB CC DD]" (LEA 指令)
// 计算: matched_pos + offset - 1 + 5 + *(int32_t*)(matched_pos + offset)

// math_address: 返回偏移位置的地址
// 模式: "48 8B 05 [?? ?? ?? ??]"
// 返回: &(matched_pos[offset])`

`address` (Type&)

- **描述**: 接收提取值的输出参数

- **类型**: 模板参数（默认 `void*`）

-
**示例**:

`void* ptr = nullptr;
int32_t value = 0;
uint64_t addr = 0;

SearchPatternSSE2(..., ptr);      // 提取指针
SearchPatternSSE2(..., value);    // 提取整数
SearchPatternSSE2(..., addr);     // 提取地址`

`prefetch_size` (std::size_t, 可选)

- **描述**: 提前预取数据到缓存的距离（字节）

- **默认值**: `128`（大多数情况下推荐）

- **调优**:

`64`: 数据已在 L2/L3 缓存中

- `128`: 平衡（推荐）

- `256`: 用于重循环或冷数据

- **注意**: 影响性能但不影响正确性

#### 返回值

- **类型**: `bool`

- **语义**:

`false` → **成功**（找到匹配，`address` 有效）

- `true` → **失败**（未找到匹配）

- **警告**: 与典型布尔约定相反！

`if (!SearchPatternSSE2(...)) {
    // 成功路径
} else {
    // 失败路径
}`

### 性能对比

#### 基准测试结果

在 Intel Core i7-8700K（6 核心，3.7 GHz）上测试，16 MB 搜索范围，32 字节模式：

函数
SIMD 宽度
吞吐量
速度
相对性能

SearchPattern

---

[查看原文](https://www.52pojie.cn/thread-2134785-1-1.html)
