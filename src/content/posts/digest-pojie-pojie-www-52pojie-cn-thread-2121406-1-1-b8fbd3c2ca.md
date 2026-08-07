---
title: "C23RISC-V模拟器 支持(USM, Sv32) IMAFDQZ** 已经运行OpenSBI"
published: 2026-08-05
description: "[md]## 【原创C&C++】一个使用C23编写的RISC-V模拟器。支持IMAFDQZncsrZnfenceiZncondZhf以及不断增加的ISA扩展。现已支持 OpenSBI/操作系统引导和完整的设备树。【长期更新项目】 ### 0x00. 为了防止上一个帖子过长 这里是第二弹 传送门: https://www"
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "Jar36"
sourceLink: "https://www.52pojie.cn/thread-2121406-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2121406-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

### 【原创C&C++】一个使用C23编写的RISC-V模拟器。支持IMAFDQZncsrZnfenceiZncondZhf以及不断增加的ISA扩展。现已支持 OpenSBI/操作系统引导和完整的设备树。【长期更新项目】

#### 0x00. 为了防止上一个帖子过长 这里是第二弹 传送门: [https://www.52pojie.cn/thread-2119162-1-1.html](https://www.52pojie.cn/thread-2119162-1-1.html)

RISCVemu 是我用 C23 写的一个 RV32IMA(U) 指令集模拟器，目标是：

- **干净**：代码结构清晰，模块化设计，易于阅读和修改 （用了AI全部写好注释以后更不清晰了 只能说AI看不懂一些magic code）

- **可测试**：完整通过 `riscv-tests` 全部 117 个用例 （还会马上写一些无聊了ZaZb）

- **可用**：自带交互式调试器，支持单步、断点、反汇编、寄存器/内存读写 （CSR不支持debugger 马上修复）

- **长期更新**： 还在肝V P Za Zb扩展中 （这个肝完就不长期更新了 懒得写设备模拟 之前编写386OS被USB搞疯了）

- **最后**： 跑一下OpenSBI和Linux （OpenSBI已经可以了 linux还会远吗）

项目地址：[https://github.com/Phi-Lia093/RISCVemu](https://github.com/Phi-Lia093/RISCVemu)

#### 0x01. 整体架构 （这个没变 但是插入很多MMU 和异常）

`┌─────────────────────────────────────────────────────────────┐
│                        RISCVemu                            │
├─────────────┬─────────────┬─────────────┬─────────────────┤
│   emu.c     │   exec.c    │   mem.c     │   debugger.c    │
│  (主循环)    │ (指令执行)   │ (内存管理)   │   (调试器)      │
├─────────────┴─────────────┴─────────────┴─────────────────┤
│                    disasm.c (反汇编器)                      │
├─────────────────────────────────────────────────────────────┤
│              extension/ (M/A/Zicsr/Zifencei/Zicond/FDQ/C)   │
└─────────────────────────────────────────────────────────────┘`
核心数据结构 `machine_state`：

`struct machine_state
{
    uint32_t gpr[32];        // 32个通用寄存器
    uint32_t pc;             // 程序计数器
    uint8_t *main_memory;    // 4GB 内存空间（按需分配）
    int terminated;          // 终止标志
#ifdef CONFIG_ENABLE_A_EXTENSION
    struct hashmap mmu_flags; // A扩展用到的内存标志
#endif
#ifdef CONFIG_ENABLE_DEBUGGER
    int single_step;         // 单步模式
    uint32_t breakpoint;     // 断点地址
    uint32_t breakpoint_enabled;
    int break_requested; // 现在支持^C进入debugger了 （只要启动扩展编译就行 不一定要-d）
#endif
    uint32_t privilege;      // 特权级
    int just_trapped;  // 中断系统内部的
};`
聪明的观众可能会发现 fpr和csr呢 其实如果全部打进去 L1-D会爆炸114514（bushi）倍 所以全部拆开了

**C23 特性应用**：

- `__maybe_unused` / `__always_inline`：更清晰的编译器提示 （主要是堵住Clang的嘴）

- `constexpr` 风格的宏配置 （用了一次也是用）

- `static_assert` 用于编译时检查（虽然这里没用但项目里有用到）

#### 0x02. 指令解码与执行引擎

**核心设计思路**：按 opcode 分发，再按 funct3/funct7 细分。 （一坨 还好RISCV指令不多 IA32这么干exec.c大概比ELF输出还大）

`void exec(uint32_t ins)
{
    uint32_t opcode = get_opcode(ins);
    uint32_t funct3 = get_funct3(ins);
    uint32_t funct7 = get_funct7(ins);
    uint32_t rs1 = get_rs1(ins);
    uint32_t rs2 = get_rs2(ins);
    uint32_t rd = get_rd(ins);

    switch (opcode)
    {
    // R格式：算术/逻辑运算
    case 0b0110011:
    {
        // M扩展指令（乘除）
        if (unlikely(funct7 == 0b0000001))
        {
            m_ins_optable[funct3][funct7](rs2, rs1, rd);
        }
        else
        {
            switch (funct3)
            {
            case 0: // ADD / SUB
                if (likely(funct7 == 0b0000000))
                    insi_r_add(rs2, rs1, rd);
                else if (funct7 == 0b0100000)
                    insi_r_sub(rs2, rs1, rd);
                // ...
            // ...
            }
        }
        break;
    }
    // I格式：立即数运算 / Load
    case 0b0010011: // 算术立即数
    {
        uint32_t imm = sign_extend_12((ins >> 20) & 0xFFF);
        // ...
        break;
    }
    // ... 更多 opcode
    }
}`
**C扩展**：直接魔法设置PC AI完全看不懂乱注释 （反正这玩意没内联 否则依旧爆L1-I）

`#ifdef CONFIG_ENABLE_C_EXTENSION
    if (likely(misa_c_enabled() && (opcode & 3) != 3))
    {
        exec_c_insn((uint16_t)(ins & 0xFFFF));
        return;
    }
#endif`
（魔力被分散了 这个不是魔法）

**M扩展指令表**：用二维函数指针数组实现，简洁高效。（L1-D 爆炸）

`static void (*m_ins_optable[8][128])(uint32_t, uint32_t, uint32_t) = {
    [0] = { [0b0000001] = &insm_r_mul },
    [1] = { [0b0000001] = &insm_r_mulh },
    [2] = { [0b0000001] = &insm_r_mulsu },
    // ...
};`
**A扩展（原子操作）**：支持 LR/SC 和全部 AMO 指令。 （hashmap reserved）

`case 0b0101111: // AMO
{
    if (likely(funct3 == 0x2))
    {
        uint32_t funct5 = (ins >> 27) & 0x1F;
        switch (funct5)
        {
        case 0x00: insa_r_amoadd_w(rs1, rs2, rd); break;
        case 0x01: insa_r_amoswap_w(rs1, rs2, rd); break;
        case 0x02: insa_r_lr_w(rs1, rd); break;
        case 0x03: insa_r_sc_w(rs1, rs2, rd); break;
        // ... 全部 AMO 操作
        }
    }
    break;
}`
**性能优化**：`exec()`函数大小内联7.1KB 保证可以置入L1-I缓存 perf实测miss率`

#### 0x03. 内存管理：按需分配，支持原子操作标志

内存管理采用**按需分配**策略，并非一开始就分配完整的 4GB 空间：

`void init_mem(void)
{
    g_state.main_memory = (uint8_t *)calloc(MEM_SIZE, sizeof(uint8_t));
    // MEM_SIZE = 0x100000000 (4GB) 但 calloc 是虚拟的，物理页按需分配
#ifdef CONFIG_ENABLE_A_EXTENSION
    hashmap_init(&g_state.mmu_flags);
#endif
}`
**UART 模拟**：现在是真的16550UART了

#### 0x04. 交互式调试器

调试器是让这个模拟器**可用**的关键。支持的命令包括单步、断点、寄存器修改、反汇编等。

**命令分发核心逻辑**：

`void tick_debugger(void)
{
    // 显示当前指令
    uint32_t ins = mem_read32_unsigned(g_state.pc);
    if (show_disasm) {
        char *disasm_str = disasm(ins);
        printf("0x%08x:  %08x  %s\n", g_state.pc, ins, disasm_str);
    }

    while (1) {
        printf("DEBUG> ");
        fgets(line, sizeof(line), stdin);
        // 解析命令...
        switch (cmd) {
        case 's': case 'n': cmd_single_step(); return;
        case 'c': cmd_continue(); return;
        case 'r': cmd_registers(); break;
        case 'R': cmd_set_register(args); break;
        case 'u': cmd_disasm(args); break;
        case 'b': cmd_breakpoint_set(args); break;
        // ...
        }
    }
}`
**寄存器设置支持数字或名称**，比如 `R a0 0x1234` 或 `R 10 0x1234` 都可以。

**断点实现**：简单地在每次执行前检查 `g_state.pc == breakpoint`。（你也可以硬件断点）

#### 0x05. 测试与验证

**测试结果**：运行 `make run_tests`，全部 117 个测试通过：

`==========================================
  TEST COMPLETED！
  TOTAL: 117
  PASSED: 117
  FAILED: 0
  SKIPPED: 0
==========================================`
测试覆盖：

- **rv32ui-p-***：基础整数指令（add、sub、lui、auipc、分支、跳转、加载/存储等）

- **rv32um-p-***：M扩展（mul、div、rem 等）

- **rv32ua-p-***：A扩展（LR/SC、全部 AMO 指令）

- **rv32uf-p-***：F扩展

- **rv32ud-p-***：当然还有D扩展 （强烈吐槽官方没有Q测试 我的PR也没有回复）

- **rv32si-p-***：S模式 覆盖率极差

-

### **rv32mi-p-***：S模式 覆盖率更差 官方甚至不愿意写CLINT测试 （我自己在run/里面搞了一个）

#### 0x06. 运行效果

**正常运行OpenSBI**：

`14:34:33 [INFO] RISC-V Emulator starting...
14:34:33 [INFO] Program: fw_jump.bin
14:34:33 [INFO] Base address: 0x80000000
14:34:33 [INFO] loaded 533496 bytes to 0x80000000
14:34:33 [INFO] built 4512-byte device tree at 0x87f00000 (a0/a1 supplied)
14:34:33 [INFO] loaded extra 8404 bytes to 0x80400000 (from kernel.bin)
14:34:33 [INFO] starting execution at PC=0x80000000

OpenSBI v1.9-16-g337c23dd
   ____                    _____ ____ _____
  / __ \                  / ____|  _ \_   _|
 | |  | |_ __   ___ _ __ | (___ | |_) || |
 | |  | | '_ \ / _ \ '_ \ \___ \|  _
**调试模式**：（加了一点 可以看README）

`0x00001000:  ff010113  addi sp, sp, -16
DEBUG> s
0x00001004:  00112623  sw ra, 12(sp)
DEBUG> r
PC=0x00001004
REGISTERS:
 zero=0x00000000    ra=0x00000000    sp=0xfffffff0    gp=0x00000000
   tp=0x00000000    t0=0x00000000    t1=0x00000000    t2=0x00000000
   s0=0x00000000    s1=0x00000000    a0=0x00000000    a1=0x00000000
   ...
DEBUG> b 0x100c
Breakpoint set at 0x0000100c
DEBUG> c
15:59:34 [INFO] breakpoint hit at PC=0x100c
0x0000100c:  01010413  addi s0, sp, 16`

#### 0x07. 构建与使用

**依赖**：

- C23 兼容编译器（GCC 13+ / Clang 16+）

- CMake 3.10+

- （测试用）RISC-V GNU Toolchain

- Softfloat （反正要有libsoftfloat.a, softfloat.h）

- OpenSBI （开generic fw_jump rv32g）

- Linux （我还没试过 大概率飞出去）

**构建**：

`git clone --recursive https://github.com/你的用户名/RISCVemu
cd RISCVemu
mkdir build && cd build
cmake .. && make`
**运行**：

`./RISCVemu run.bin 0x1000        # 正常运行
./RISCVemu run.bin 0x1000 -d     # 调试模式
./RISCVemu run.bin 0x1000 -d -b 0x1200  # 带断点启动
./RISCVemu fw_jump.bin 0x80000000 --fdt --load kernel.bin@0x80400000  # 加载多个image`
（话说回来 下次一定加一个初始PC设置）

**CMake 配置选项**（可在 `ccmake ..` 中调整）：

选项
说明
默认

`CONFIG_ENABLE_DEBUGGER`

---

[查看原文](https://www.52pojie.cn/thread-2121406-1-1.html)
