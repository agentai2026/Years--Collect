---
title: "WinCmd.Key 验证器 (Total Commander 许可证验证器)"
published: 2026-09-04
description: "分析wincm.key，提取信息，分析结构，验证黑名单，需要11.58版本的TOTALCMD64.EXE放在同一目录。[mw_shl_code=python,true]#!/usr/bin/env python3 # -*- coding: utf-8 -*- \\\"\\\"\\\" WinCmd.Key 验证器 (Total "
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "shieep"
sourceLink: "https://www.52pojie.cn/thread-2126403-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2126403-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

分析wincm.key，提取信息，分析结构，验证黑名单，需要11.58版本的TOTALCMD64.EXE放在同一目录。[Python] *纯文本查看* *复制代码*
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
WinCmd.Key 验证器 (Total Commander 许可证验证器)
基于 [url]https://www.cnblogs.com/DirWang/p/21385528[/url] 文章分析实现

功能:
  - 解析 wincmd.key 文件结构
  - LUC 签名验证 (Lucas 序列 Montgomery ladder)
  - License_Cipher 对称加解密
  - custom_md5 哈希校验
  - 提取并显示注册信息: 用户名、订单号、用户数量、日期、地区代码等
  - 自动从脚本目录下的 TOTALCMD64.EXE 读取内置 LUC 模数 N
"""

import os
import sys
import struct
import math
import tkinter as tk
from tkinter import ttk, filedialog, messagebox, scrolledtext

# ============================================================
# 常量定义 (与文章一致)
# ============================================================
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BINARY = os.path.join(SCRIPT_DIR, "TOTALCMD64.EXE")

IMAGE_BASE = 0x400000

# wincmd.key 文件结构
PART0_OFF, PART0_LEN = 0x000, 0x080
PART1_OFF, PART1_LEN = 0x080, 0x080
PART2_OFF, PART2_LEN = 0x100, 0x100
PART3_OFF, PART3_LEN = 0x200, 0x100
PART4_OFF, PART4_LEN = 0x300, 0x080
PART5_OFF, PART5_LEN = 0x380, 0x070
PART6_OFF, PART6_LEN = 0x3F0, 0x010

LUC_SIG_OFF, LUC_SIG_LEN = 0x080, 0x68
LUC_RESULT_LEN = 0x67
LUC_HASH_OFF, LUC_HASH_LEN = 0x00, 0x10
LUC_DATA_OFF, LUC_DATA_LEN = 0x10, 0x57

CIPHER_LEN = 0xFF
CIPHER_ROUNDS = 0x14
CIPHER_SEED_1 = 0x5862CF
CIPHER_SEED_2 = 0x1E0F5
CIPHER_SEED_LUC = 0x20A4BC
CIPHER_SEED_PART6 = 0x8800
LCG_MUL = 0x8088405
LCG_INC = 1
LCG_MASK = 0xFFFFFFFF

LUC_N_VA = 0xC500F8
LUC_N_HEX_LEN = 208
LUC_E = 65537

# 黑名单列表 VA
PIRATED_KEYS_LIST1_VA = 0xC4ECB0
PIRATED_KEYS_LIST1_COUNT = 209
PIRATED_KEYS_LIST2_VA = 0xC4EE60
PIRATED_KEYS_LIST2_COUNT = 528
VALID_MASTER_KEYS_VA = 0xC4F6A0
VALID_MASTER_KEYS_COUNT = 29
REVOKED_KEYS_BLACKLIST_VA = 0xC4F720
REVOKED_KEYS_BLACKLIST_COUNT = 549

# Part 5 固定版权字符串
PART5_CONTENT = (
    b'Copyright \xa9 1999 by Christian Ghisler, C. Ghisler & Co., '
    b'all rights reserved. Unauthorized copying prohibited!\x00\x88'
)

# ============================================================
# PE 区段映射: VA -> 文件偏移
# ============================================================
def _read_pe_sections(f):
    f.seek(0x3C)
    pe_off = struct.unpack('> 32
    return state, value

def ror_byte(val, n):
    n &= 7
    return ((val >> n) | (val > (8 - n))) & 0xFF

def cipher_encrypt(buf, seed, length=CIPHER_LEN):
    buf = bytearray(buf[:length + 1])
    state = seed & LCG_MASK
    for _ in range(CIPHER_ROUNDS):
        for i in range(length + 1):
            state, pos = lcg_next(state, length + 1)
            buf[i], buf[pos] = buf[pos], buf[i]
        for i in range(length + 1):
            state, rot = lcg_next(state, 8)
            buf[i] = ror_byte(buf[i], rot)
            state, xor_val = lcg_next(state, 0x100)
            buf[i] ^= xor_val
    return bytes(buf)

def cipher_decrypt(buf, seed, length=CIPHER_LEN):
    buf = bytearray(buf[:length + 1])
    state = seed & LCG_MASK
    rounds = []
    for _ in range(CIPHER_ROUNDS):
        p1 = []
        for i in range(length + 1):
            state, pos = lcg_next(state, length + 1)
            p1.append(pos)
        p2 = []
        for i in range(length + 1):
            state, rot = lcg_next(state, 8)
            state, xor_val = lcg_next(state, 0x100)
            p2.append((rot, xor_val))
        rounds.append((p1, p2))
    for p1, p2 in reversed(rounds):
        for i in reversed(range(length + 1)):
            rot, xor_val = p2[i]
            buf[i] ^= xor_val
            buf[i] = rol_byte(buf[i], rot)
        for i in reversed(range(length + 1)):
            pos = p1[i]
            buf[i], buf[pos] = buf[pos], buf[i]
    return bytes(buf)

# ============================================================
# custom_md5 (非标准 MD5)
# ============================================================
_MD5_EXTRA_PADDING = bytes((3 * i) & 0xFF for i in range(64))

def _md5_compress(state, block):
    a, b, c, d = state
    M = struct.unpack('> (32 - n))) & 0xFFFFFFFF

    for i in range(16):
        f = (b & c) | (~b & d)
        g = i
        a = rol((a + f + T[i] + M[g]) & 0xFFFFFFFF, S[i])
        a = (a + b) & 0xFFFFFFFF
        a, b, c, d = d, a, b, c
    for i in range(16, 32):
        f = (d & b) | (~d & c)
        g = (5 * i + 1) % 16
        a = rol((a + f + T[i] + M[g]) & 0xFFFFFFFF, S[i])
        a = (a + b) & 0xFFFFFFFF
        a, b, c, d = d, a, b, c
    for i in range(32, 48):
        f = b ^ c ^ d
        g = (3 * i + 5) % 16
        a = rol((a + f + T[i] + M[g]) & 0xFFFFFFFF, S[i])
        a = (a + b) & 0xFFFFFFFF
        a, b, c, d = d, a, b, c
    for i in range(48, 64):
        f = c ^ (b | (~d & 0xFFFFFFFF))
        g = (7 * i) % 16
        a = rol((a + f + T[i] + M[g]) & 0xFFFFFFFF, S[i])
        a = (a + b) & 0xFFFFFFFF
        a, b, c, d = d, a, b, c

    return [(state[0] + a) & 0xFFFFFFFF, (state[1] + b) & 0xFFFFFFFF,
            (state[2] + c) & 0xFFFFFFFF, (state[3] + d) & 0xFFFFFFFF]

def custom_md5(data):
    state = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476]
    msg_len = len(data)
    bit_count = msg_len * 8
    padding = bytes([0x80])
    pad_len = (56 - (msg_len + 1) % 64) % 64
    padding += bytes(pad_len)
    padding += struct.pack('> 5) & 0x0F
    year = (date_field >> 9) + 1980
    if month == 0 or day == 0:
        return None
    try:
        import datetime
        datetime.date(year, month, day)
        return f"{year:04d}-{month:02d}-{day:02d}"
    except ValueError:
        return None

def grace_period_range(date_str):
    try:
        import datetime
        d = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
        lower = d - datetime.timedelta(days=1)
        upper = d + datetime.timedelta(days=31)
        return f"{lower.strftime('%Y-%m-%d')} ~ {upper.strftime('%Y-%m-%d')}"
    except (ValueError, TypeError):
        return None

# ============================================================
# 核心解析函数
# ============================================================
def parse_license(key_path, binary_path=None):
    with open(key_path, "rb") as f:
        data = f.read()

    if len(data) != 0x400:
        raise ValueError(f"密钥文件大小应为 0x400 字节, 实际为 0x{len(data):X}")

    part0 = data[PART0_OFF:PART0_OFF + PART0_LEN]
    part1 = data[PART1_OFF:PART1_OFF + PART1_LEN]
    part2 = data[PART2_OFF:PART2_OFF + PART2_LEN]
    part3 = data[PART3_OFF:PART3_OFF + PART3_LEN]
    part4 = data[PART4_OFF:PART4_OFF + PART4_LEN]
    part5 = data[PART5_OFF:PART5_OFF + PART5_LEN]
    part6 = data[PART6_OFF:PART6_OFF + PART6_LEN]

    luc_sig_bytes = data[LUC_SIG_OFF:LUC_SIG_OFF + LUC_SIG_LEN]
    luc_sig_int = int.from_bytes(luc_sig_bytes, 'little')

    buf1 = cipher_encrypt(data[0x100:0x200], CIPHER_SEED_1)
    elgamal_hash_data = buf1[0x20:0x20 + 0x78]
    elgamal_r_bytes = buf1[0x98:0x98 + 0x68]
    buf2 = cipher_encrypt(data[0x200:0x300], CIPHER_SEED_2)
    elgamal_s_bytes = buf2[0x00:0x00 + 0x68]
    elgamal_r_int = int.from_bytes(elgamal_r_bytes, 'little')
    elgamal_s_int = int.from_bytes(elgamal_s_bytes, 'little')

    part5_md5 = custom_md5(part5)
    part6_decrypted = cipher_encrypt(part6, CIPHER_SEED_PART6, 0xF)
    hash2_valid = (part5_md5 == part6_decrypted)

    luc_result_bytes = None
    luc_result_encrypted = None
    hash1_valid = None
    license_num = None
    user_count = None
    user_info = None
    region_code = None
    date_field = None
    license_type_str = None
    V_e_S = None
    blacklist_check = None
    special_invalid = None
    final_valid = False
    N = None

    binary_exists = binary_path and os.path.exists(binary_path)

    try:
        if binary_exists:
            N_hex = parse_public_key(binary_path)
            N = N_hex + 2
            V_e_S = lucas_v(LUC_E, luc_sig_int, N)
            mask = (1  1:
                license_type_str = f"{user_count} User licence"
            else:
                license_type_str = f"(invalid user_count={user_count})"

            lists = read_license_lists(binary_path)
            blacklist_check = check_license_lists(license_num, lists, user_count)
            special_invalid = (user_count == 0xFFFF or license_num == 0xFFFFFF)

            final_valid = hash1_valid and hash2_valid
            if blacklist_check["license_invalid"]:
                final_valid = False
            if special_invalid:
                final_valid = False
        else:
            final_valid = False

    except Exception as e:
        import traceback
        traceback.print_exc()

    return {
        "part0": part0, "part1": part1, "part2": part2,
        "part3": part3, "part4": part4, "part5": part5, "part6": part6,
        "luc_sig_bytes": luc_sig_bytes, "luc_sig_int": luc_sig_int,
        "V_e_S": V_e_S, "luc_result_bytes": luc_result_bytes,
        "luc_result_encrypted": luc_result_encrypted,
        "hash1_valid": hash1_valid, "hash2_valid": hash2_valid,
        "part5_md5": part5_md5, "part6_decrypted": part6_decrypted,
        "license_num": license_num, "user_count": user_count,
        "user_info": user_info, "region_code": region_code,
        "date_field": date_field, "license_type_str": license_type_str,
        "elgamal_hash_data": elgamal_hash_data,
        "elgamal_r_int": elgamal_r_int, "elgamal_s_int": elgamal_s_int,
        "blacklist_check": blacklist_check,
        "special_invalid": special_invalid,
        "final_valid": final_valid,
        "N": N,
        "binary_exists": binary_exists,
    }

# ============================================================
# GUI 界面
# ============================================================
class WinCmdKeyValidator(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("WinCmd.Key 验证器 - Total Commander 许可证分析")
        self.geometry("900x700")
        self.minsize(800, 600)

        self.key_path = tk.StringVar()
        self.result_data = None

        self._build_ui()

    def _build_ui(self):
        # 文件选择区
        file_frame = ttk.LabelFrame(self, text="文件选择", padding=10)
        file_frame.pack(fill=tk.X, padx=10, pady=5)

        ttk.Label(file_frame, text="wincmd.key:").grid(row=0, column=0, sticky=tk.W, pady=3)
        ttk.Entry(file_frame, textvariable=self.key_path, width=70).grid(row=0, column=1, padx=5, pady=3)
        ttk.Button(file_frame, text="浏览...", command=self._browse_key).grid(row=0, column=2, pady=3)

        # 显示自动检测的 exe 路径
        ttk.Label(file_frame, text=f"TOTALCMD64.EXE: {BINARY}").grid(row=1, column=0, columnspan=3, sticky=tk.W, pady=3)

        ttk.Button(file_frame, text="开始验证", command=self._validate).grid(row=2, column=0, columnspan=3, pady=10)

        # 结果摘要
        self.summary_frame = ttk.LabelFrame(self, text="验证结果摘要", padding=10)
        self.summary_frame.pack(fill=tk.X, padx=10, pady=5)
        self.summary_label = ttk.Label(self.summary_frame, text="请选择 wincmd.key 并点击「开始验证」", font=("Microsoft YaHei", 12))
        self.summary_label.pack(anchor=tk.W)

        # Notebook 标签页
        self.notebook = ttk.Notebook(self)
        self.notebook.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)

        # 标签页 1: 注册信息
        self.tab_info = ttk.Frame(self.notebook)
        self.notebook.add(self.tab_info, text="注册信息")
        self._build_info_tab()

        # 标签页 2: 验证详情
        self.tab_verify = ttk.Frame(self.notebook)
        self.notebook.add(self.tab_verify, text="验证详情")
        self._build_verify_tab()

        # 标签页 3: 文件结构
        self.tab_struct = ttk.Frame(self.notebook)
        self.notebook.add(self.tab_struct, text="文件结构")
        self._build_struct_tab()

        # 标签页 4: 黑名单
        self.tab_blacklist = ttk.Frame(self.notebook)
        self.notebook.add(self.tab_blacklist, text="黑名单检查")
        self._build_blacklist_tab()

        # 状态栏
        self.status = ttk.Label(self, text="就绪", relief=tk.SUNKEN, anchor=tk.W)
        self.status.pack(fill=tk.X, side=tk.BOTTOM)

    def _build_info_tab(self):
        frame = ttk.Frame(self.tab_info, padding=10)
        frame.pack(fill=tk.BOTH, expand=True)

        fields = [
            ("注册状态", "final_valid"),
            ("用户名", "user_info"),
            ("许可证号", "license_num"),
            ("用户数量", "user_count"),
            ("许可证类型", "license_type_str"),
            ("日期字段", "date_field"),
            ("地区代码", "region_code"),
            ("显示格式", "display_str"),
        ]
        self.info_vars = {}
        for i, (label, key) in enumerate(fields):
            ttk.Label(frame, text=f"{label}:", font=("Microsoft YaHei", 10, "bold")).grid(row=i, column=0, sticky=tk.W, pady=4, padx=5)
            var = tk.StringVar(value="-")
            self.info_vars[key] = var
            ttk.Label(frame, textvariable=var, font=("Consolas", 10)).grid(row=i, column=1, sticky=tk.W, pady=4, padx=5)
        frame.columnconfigure(1, weight=1)

    def _build_verify_tab(self):
        frame = ttk.Frame(self.tab_verify, padding=10)
        frame.pack(fill=tk.BOTH, expand=True)

        self.verify_text = scrolledtext.ScrolledText(frame, wrap=tk.WORD, font=("Consolas", 10))
        self.verify_text.pack(fill=tk.BOTH, expand=True)
        self.verify_text.insert(tk.END, "等待验证...")
        self.verify_text.config(state=tk.DISABLED)

    def _build_struct_tab(self):
        frame = ttk.Frame(self.tab_struct, padding=10)
        frame.pack(fill=tk.BOTH, expand=True)

        self.struct_text = scrolledtext.ScrolledText(frame, wrap=tk.WORD, font=("Consolas", 9))
        self.struct_text.pack(fill=tk.BOTH, expand=True)
        self.struct_text.insert(tk.END, "等待验证...")
        self.struct_text.config(state=tk.DISABLED)

    def _build_blacklist_tab(self):
        frame = ttk.Frame(self.tab_blacklist, padding=10)
        frame.pack(fill=tk.BOTH, expand=True)

        self.blacklist_text = scrolledtext.ScrolledText(frame, wrap=tk.WORD, font=("Consolas", 10))
        self.blacklist_text.pack(fill=tk.BOTH, expand=True)
        self.blacklist_text.insert(tk.END, "等待验证...")
        self.blacklist_text.config(state=tk.DISABLED)

    def _browse_key(self):
        path = filedialog.askopenfilename(title="选择 wincmd.key", filetypes=[("Key files", "*.key"), ("All files", "*.*")])
        if path:
            self.key_path.set(path)

    def _set_text(self, widget, text):
        widget.config(state=tk.NORMAL)
        widget.delete(1.0, tk.END)
        widget.insert(tk.END, text)
        widget.config(state=tk.DISABLED)

    def _validate(self):
        key_path = self.key_path.get().strip()

        if not key_path:
            messagebox.showerror("错误", "请选择 wincmd.key 文件")
            return
        if not os.path.exists(key_path):
            messagebox.showerror("错误", f"找不到文件: {key_path}")
            return

        try:
            self.status.config(text="正在解析...")
            self.update_idletasks()

            info = parse_license(key_path, BINARY)
            self.result_data = info

            if info["binary_exists"]:
                if info["final_valid"]:
                    self.summary_label.config(text="&#9989; 许可证验证通过", foreground="green")
                else:
                    self.summary_label.config(text="&#10060; 许可证验证失败", foreground="red")
            else:
                self.summary_label.config(text=f"&#9888;&#65039; 未找到 {BINARY}，仅解析文件结构（无法验证签名）", foreground="orange")

            # 注册信息
            self.info_vars["final_valid"].set("有效" if info["final_valid"] else "无效" if info["binary_exists"] else "未验证")
            self.info_vars["user_info"].set(info["user_info"] if info["user_info"] else "-")
            self.info_vars["license_num"].set(str(info["license_num"]) if info["license_num"] is not None else "-")
            self.info_vars["user_count"].set(str(info["user_count"]) if info["user_count"] is not None else "-")
            self.info_vars["license_type_str"].set(info["license_type_str"] if info["license_type_str"] else "-")
            date_str = fat_date_to_string(info["date_field"]) if info["date_field"] is not None else None
            self.info_vars["date_field"].set(f"{info['date_field']} ({date_str})" if date_str else str(info["date_field"]) if info["date_field"] is not None else "-")
            self.info_vars["region_code"].set(info["region_code"] if info["region_code"] else "-")
            display = ""
            if info["user_info"] and info["region_code"] and info["license_type_str"]:
                display = f"Total Commander (x64) - {info['user_info']} ({info['region_code']})\n\n#{info['license_num']} {info['license_type_str']}"
            self.info_vars["display_str"].set(display)

            # 验证详情
            verify_lines = []
            verify_lines.append("=" * 60)
            verify_lines.append("LUC 签名验证")
            verify_lines.append("=" * 60)
            if info["binary_exists"]:
                verify_lines.append(f"LUC 模数 N: {info['N']}")
                verify_lines.append(f"LUC 签名 S 位长度: {info['luc_sig_int'].bit_length()}")
                verify_lines.append(f"V_65537(S) mod N 位长度: {info['V_e_S'].bit_length() if info['V_e_S'] else 'N/A'}")
                verify_lines.append("")
                verify_lines.append("第一次哈希校验 (LUC 路径)")
                verify_lines.append("-" * 40)
                if info["luc_result_encrypted"] is not None:
                    scr = info["luc_result_encrypted"]
                    expected_hash = bytes(scr[0x00:0x10])
                    hash_input = bytes(scr[0x10:0x67])
                    computed_hash = custom_md5(hash_input)
                    verify_lines.append(f"期望哈希: {expected_hash.hex()}")
                    verify_lines.append(f"计算哈希: {computed_hash.hex()}")
                    verify_lines.append(f"结果: {'通过 &#9989;' if info['hash1_valid'] else '失败 &#10060;'}")
                else:
                    verify_lines.append("无法计算 (LUC 结果为空)")
            else:
                verify_lines.append(f"未找到 {BINARY}，跳过 LUC 验证")
            verify_lines.append("")
            verify_lines.append("第二次哈希校验 (反篡改)")
            verify_lines.append("-" * 40)
            verify_lines.append(f"custom_md5(Part 5):     {info['part5_md5'].hex()}")
            verify_lines.append(f"cipher_encrypt(Part 6): {info['part6_decrypted'].hex()}")
            verify_lines.append(f"结果: {'通过 &#9989;' if info['hash2_valid'] else '失败 &#10060;'}")
            verify_lines.append("")
            verify_lines.append("ElGamal 验证数据 (条件性遗留路径)")
            verify_lines.append("-" * 40)
            verify_lines.append(f"hash_data: {len(info['elgamal_hash_data'])} 字节")
            verify_lines.append(f"签名 r 位长度: {info['elgamal_r_int'].bit_length()}")
            verify_lines.append(f"签名 s 位长度: {info['elgamal_s_int'].bit_length()}")
            verify_lines.append("注: ElGamal 仅在特定时区触发 (Bias>240 或 Bias 32:
                    hex_preview += " ..."
                struct_lines.append(f"\n[{name}] 偏移 0x{off:03X} ~ 0x{off+length:03X} ({length} 字节)")
                struct_lines.append(f"  说明: {desc}")
                struct_lines.append(f"  Hex:  {hex_preview}")
            self._set_text(self.struct_text, "\n".join(struct_lines))

            # 黑名单
            bl_lines = []
            bl_lines.append("=" * 60)
            bl_lines.append("黑名单检查 (4 个列表均为黑名单)")
            bl_lines.append("=" * 60)
            if info["blacklist_check"]:
                bl = info["blacklist_check"]
                bl_lines.append(f"盗版列表1 (g_PiratedKeysList1, {PIRATED_KEYS_LIST1_COUNT}条): {'匹配! &#10060;' if bl['in_pirated_list1'] else '未匹配 &#9989;'}")
                bl_lines.append(f"盗版列表2 (g_PiratedKeysList2, {PIRATED_KEYS_LIST2_COUNT}条): {'匹配! &#10060;' if bl['in_pirated_list2'] else '未匹配 &#9989;'}")
                bl_lines.append(f"预注册列表 (g_ValidMasterKeys, {VALID_MASTER_KEYS_COUNT}条): {'匹配! &#10060;' if bl['in_valid_master_keys'] else '未匹配 &#9989;'}")
                bl_lines.append(f"吊销黑名单 (g_RevokedKeysBlacklist, {REVOKED_KEYS_BLACKLIST_COUNT}条): {'匹配! &#10060;' if bl['in_revoked_blacklist'] else '未匹配 &#9989;'}")
                bl_lines.append(f"特殊值检查 (user_count==0xFFFF || license_num==0xFFFFFF): {'是 → 无效! &#10060;' if bl['special_invalid'] else '否 &#9989;'}")
                bl_lines.append("")
                bl_lines.append(f"注册状态: {bl['state_str']}")
                bl_lines.append(f"许可证是否无效: {'是 &#10060;' if bl['license_invalid'] else '否 &#9989;'}")
            else:
                bl_lines.append(f"未找到 {BINARY}，无法检查黑名单")
            self._set_text(self.blacklist_text, "\n".join(bl_lines))

            self.status.config(text="验证完成")

        except Exception as e:
            import traceback
            self.status.config(text="验证失败")
            messagebox.showerror("验证错误", f"解析失败:\n{str(e)}\n\n{traceback.format_exc()}")

def main():
    app = WinCmdKeyValidator()
    app.mainloop()

if __name__ == "__main__":
    main()

---

[查看原文](https://www.52pojie.cn/thread-2126403-1-1.html)
