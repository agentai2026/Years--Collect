---
title: "开源cinterp：一个小型(约100KB)、跨平台、C 代码编译成字节码、支持FFI的解释器"
published: 2026-11-19
description: "[md]## 一、简介 `cinterp` 在构建期把 C 源码编译成紧凑的栈式字节码和 FFI 调用计划，运行时用一个小型 Zig VM 执行。原生调用由固定汇编 ABI 引擎完成，不使用 libffi，也不生成 JIT或可执行内存。 - **编译器**：Zig + `zig cc`，支持 C17 常用子集、结构体 "
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "HOWMP"
sourceLink: "https://www.52pojie.cn/thread-2138600-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2138600-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

### 一、简介

`cinterp` 在构建期把 C 源码编译成紧凑的栈式字节码和 FFI 调用计划，运行时用一个小型 Zig VM 执行。原生调用由固定汇编 ABI 引擎完成，不使用 libffi，也不生成 JIT或可执行内存。

- **编译器**：Zig + `zig cc`，支持 C17 常用子集、结构体 FFI、varargs 和 callback。

- **运行时**：Zig 0.13，栈式 VM + 线性内存；提供 `cinterp-run` 和 C 嵌入库。

- **目标平台**：Linux x86-64、Linux AArch64、Windows x86-64、Windows x86。

- **包格式**：`CIPKG` v4（trusted），由 CIVM v2、CIPL、CIPI 和 CIPC 常量/字符串池组成。0.1.2 已发布，但仍不保证 CIB 格式兼容，可能随实现直接调整。

换句话说：**C 只在构建期编译一次**，发布物是一个约 100 KiB 的运行时加上若干字节码包。

没有 JIT，没有运行时可写可执行内存，也没有 libffi 的运行时桩。

### 二、特性

- **不需要动态申请可执行内存**：VM 和固定汇编 ABI 引擎不生成 JIT/stub 代码， callback 使用进程级固定 256 槽的静态 trampoline 池；显式

`ci_callback_acquire`/`ci_callback_release` 槽可复用，这是进程级硬上限。

- **支持 FFI 和 callback**：编译期生成调用计划，支持结构体、varargs，以及 cdecl/stdcall/fastcall/thiscall 和 AArch64 AAPCS64 上的原生调用与 callback； `CI_NATIVE_PLAN(T)` 可为 dlsym 等动态函数指针声明可调用的 native 计划。

- **运行时紧凑**，约 100 KiB（ReleaseSmall，各目标略有差异）。

- **可用于替代 BOF 场景**：直接编译普通 C 源文件（包括直接 `#include `）， 不再需要手动声明 WinAPI 函数原型。

- **CIPC 常量/名称池默认 XOR 混淆**：编译时使用每包随机 16 字节 key，运行时加载时 解密名称池、每次 run 时解密 data；`cinterp-cc --no-xor-const-pool` 可输出明文以便调试。key 随包分发，只用于避免 `strings` 直接读出字符串，**不是安全/完整性边界**。

### 三、原理：编译 → 执行

`C 源码
  → cinterp-cc（构建期）
       → zig cc -S -emit-llvm -O0
       → typed LLVM IR parser / AST / 子集校验
       → CIVM 字节码 + CIPL FFI 调用计划 + CIPC 常量/名称池
       → CIPKG v4（CIVM + CIPL + CIPI + CIPC）

CIPKG
  → cinterp-run / libcinterp（运行时）
       → 事务性加载与 CIPC/计划/导入校验
       → 栈式 VM + 线性内存
       → 固定汇编 ABI 引擎 → 原生函数 / callback`

- 编译期知道完整的 C 函数签名，提前生成寄存器、栈和 sret 布局；运行时只按计划搬运参数。

- 原生符号通过 CIPI provider、宿主 C API `ci_vm_load_library` 或进程/CRT 回退解析。

- callback 使用进程级静态 trampoline 池，不生成可执行内存。

- 一个 VM 一次持有一个 CIB；同一进程可通过 `ci_process_*` 持有多个 VM 并行运行。

### 四、现状

- **测试**：完整上游（TCC, chibicc, libc-test、 gcc-torture(+compile)、 gcc-ieee, CompCert）

manifest 基线 **4331/4522 通过，191 跳过**；本地 c-testsuite18/18；交叉测试覆盖 Win64/Win32/ARM64 共 62 个示例。另有 `make differential`、多路 fuzz（loader/执行/字节码/FFI/sanitizer）和结构化报告校验。

- **不支持**：macOS、musl、Windows ARM64、Linux i386/ARM32；向量类型、`_Complex`、

Win64 `__vectorcall`/COM、SysV `i128`、内联汇编、`_Atomic`/`_Thread_local`；CIB 到 CIB 的链接。

- **非目标**：不做沙箱、不做执行超时/取消、不做宿主内存限额。CIB 安全等价于原生C 代码，只能运行可信包；格式也不保证向后兼容。

### 五、KeyGenMe

仓库里附带一个 KeyGenMe 示例，把 C 源码编译成 CIB 字节码，再由 Zig 宿主在编译期

嵌入，生成不依赖外部 `.cib` 文件的独立可执行程序。

代码位置: [`examples/keygenme`](https://github.com/howmp/cinterp/tree/main/examples/keygenme)

**已被攻破**

挑战贴昨天(2026-11-18)发布，论坛 ID `killerzeno` 于 2026-11-19 01:03

提交了完整的逆向分析报告并完成挑战，包括常量池解密、VM 语义还原、全部 11 个 VM

函数的重建和 Feistel 逆变换推导，并以 200/200 随机用例通过真实程序验证。

- 挑战贴：[一个小型(约100KB)、跨平台、C 代码编译成字节码的解释器的KeyGenMe](https://www.52pojie.cn/thread-2138468-1-1.html)

- 攻破报告：[https://www.52pojie.cn/forum.php?mod=redirect&goto=findpost&ptid=2138468&pid=56209641](https://www.52pojie.cn/forum.php?mod=redirect&goto=findpost&ptid=2138468&pid=56209641)

### 最后

如果这篇文章对你有帮助，欢迎在论坛帖里为我**免费评分**——你的评分是我继续维护这个项目的动力。项目采用 MIT 许可，可以自由使用和修改。

>
项目地址：[https://github.com/howmp/cinterp](https://github.com/howmp/cinterp)

---

[查看原文](https://www.52pojie.cn/thread-2138600-1-1.html)
