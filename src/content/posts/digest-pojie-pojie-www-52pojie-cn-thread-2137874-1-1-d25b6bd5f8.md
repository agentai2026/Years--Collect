---
title: "WindowsiOS —— 在 iPhone 上运行完整 Windows 11 ARM64"
published: 2026-11-16
description: "[md]#"
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "132465798a"
sourceLink: "https://www.52pojie.cn/thread-2137874-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2137874-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

## WindowsiOS —— 在 iPhone 上运行完整 Windows 11 ARM64（iOS 26/27）

### 介绍

WindowsiOS 是一个在非越狱 iPhone 上运行原版 Windows 11 24H2 ARM64 的虚拟机项目。它绕开苹果的 Hypervisor.framework，自己写了 ARM64→ARM64 动态二进制翻译（JIT）、4KB 页表的软件 MMU，以及 UEFI/ACPI、NVMe、USB 3.0、Intel HD Audio、VirtIO 网卡一整套虚拟 PC 硬件，让 Windows 11 以接近原生的速度运行。作者是在折叠屏 iPhone Duo（A20 Pro）上完成端到端验证的。

- 运行原版 Windows 11 24H2 ARM64，可开 Edge、Electron 应用，并通过 Prism 兼容 x86-64 程序

- 自带虚拟硬件：NVMe 硬盘、USB 键盘鼠标与触屏、双向声卡、NAT 联网

- 折叠屏设备上有「笔记本模式」：上半屏当显示器，下半屏是键盘和触控板

- 通过 iOS 原生 Safari 弹层桥接 Google / Passkey 登录

需要注意：这是**源码项目，不是安装包**。要用起来必须有 Apple Silicon Mac + Xcode 自行编译，还要自备微软官方 Windows 11 24H2 ARM64 镜像和 UEFI 固件，仓库里不含任何系统镜像或现成 IPA。

![](

" alt="WindowsiOS 在 iPhone 上运行" target="_blank" rel="noopener noreferrer nofollow" />

### 主要代码片段

**1. 用 ASID 合成用户地址空间键**（`core/mmu.c`）

`uint64_t hv_mmu_ukey(const HvCpu *cpu) {
    int asid = current_asid((HvCpu *)cpu);
    uint64_t pa = cpu->ttbr0_el1 & OA_MASK;
    if (asid
Windows 把进程 ASID 放在 `TTBR1`，上下文切换时 ASID 会瞬时变成 0。只按 `TTBR0` 或者按 ASID 0 建键，要么每次切进程冲掉整个用户 TLB，要么残留别的进程的映射，所以这里同时取 ASID 和 `TTBR0` 的物理地址。

**2. 非对齐访存跳慢路径**（`core/translate.c`）

`int host_align = (op.align || op.kind == HV_MEM_ORDERED) && op.bytes > 1;
if (host_align) {
    uint32_t k = __builtin_ctz(op.bytes);
    put(e, 0xd1000000u | HV_TLB_ADJ  HV_TLB_ADJ + 1) put_add_imm(e, U, U, op.bytes - 1 - HV_TLB_ADJ);
    put(e, UBFM_X(U, U, HV_TLB_PAGE_BITS, 63));
}
put(e, CBNZ_X(U));`
Windows 的 Prism 会发非对齐的 `LDAPUR` / `STLUR`，在 Darwin 上直接 `SIGBUS`。所以翻译器在生成机器码时顺手判断跨页与对齐：对齐的走内联快路径，非对齐的跳到 C 层的软件 helper。

**3. USB 传输事件带累积长度**（`devices/xhci.c`）

`static void transfer_event_ed(HvXhci *x, int target, uint64_t ev_data, int cc,
                              uint32_t edtla, int slot, int dci) {
    event_to(x, target, ev_data,
             (uint32_t)cc
Windows 的 `USBXHCI.SYS` 要求传输事件带累积长度（`ED=1` + `EDTLA`），否则键盘、触屏这类 HID 事件会被直接丢弃。

### 使用方法

环境要求：Apple Silicon Mac（M1 及以上）、Xcode、xcodegen、meson、ninja、pkg-config、libslirp、llvm/lld、Python 3；一台 iOS 26/27 的 iPhone。Windows 镜像与固件需自备：微软官方 Windows 11 24H2 ARM64 ESD、EDK2 `QEMU_EFI.fd`、virtio-win 的 NetKVM 驱动。

`# 1. 编译依赖、引擎与测试
./scripts/build_ios_deps.sh
make -j8 all ios-lib test-core

# 2. 制作并精简 Windows 镜像（先把 ESD、固件、驱动放进 work/downloads 与 work/）
python3 scripts/provision_windows_arm64.py
python3 scripts/optimize_windows_lite.py
./build/hvsparse pack work/windows11_lite.img work/windows11.hvsparse

# 3. 先在 Mac 上试跑
HV_OAUTH_BRIDGE=1 ./build/winvm --cpus 4 --ram 4608 \
  --bios work/code.fd --vars work/vars.fd --disk work/windows11_lite.img

# 4. 构建并安装到 iPhone（需设备 UDID 与有效签名）
xcodegen generate --spec ios/project.yml
xcodebuild -project ios/WindowsiOS.xcodeproj -scheme WindowsiOS -configuration Release -sdk iphoneos build
xcrun devicectl device install app --device  build/DerivedData/Build/Products/Release-iphoneos/WindowsiOS.app
./scripts/launch_on_duo.sh  me.ammaar.windowsios`
安装后需要用脚本里的 LLDB 流程给应用赋予 JIT 权限，否则无法启动；没有 Mac 的话这套流程走不通。

### 开源地址

本项目转载自 GitHub 开源项目，非本人开发，未做任何修改或破解，遵循 **GPL-2.0** 协议：

- 主项目：[https://github.com/ammaarreshi/WindowsiOS](https://github.com/ammaarreshi/WindowsiOS)

### 我们的下载地址

- 百度网盘（免提取码，点开自动填充）：[https://pan.baidu.com/s/1ewXgfPLBAVYTa2G2tWxa1Q?pwd=my1y](https://pan.baidu.com/s/1ewXgfPLBAVYTa2G2tWxa1Q?pwd=my1y)

- 迅雷云盘（免提取码，点开自动填充）：https://pan.xunlei.com/s/VP6VAKK2Tq3YTqldOWPpPxJhA1?pwd=c65p

---

[查看原文](https://www.52pojie.cn/thread-2137874-1-1.html)
