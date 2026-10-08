---
title: "【国庆节第三弹】 咕噜小天使 Steam 23项属性内存修改器源码"
published: 2026-10-07
description: "这是国庆节最后一弹了，暂时没有了，新的东西还在创造中… 国庆节前两弹： 这回按照那次的讨论帖，重新写了一遍适配Steam版的 特别注意：本修改器仅适配Steam版V1.4版本的游戏（包括民间汉化版），日文 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "烟99"
sourceLink: "https://www.52pojie.cn/thread-2131256-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2131256-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

这是国庆节最后一弹了，暂时没有了，新的东西还在创造中…

国庆节前两弹：

> 《血战上海滩》九项属性修改器 源代码分享

https://www.52pojie.cn/thread-2130653-1-1.html

【吾爱首发】游戏《Sora No Kiseki the 2nd》打包解包工具FPACTool V2.1源代码

https://www.52pojie.cn/thread-2130872-1-1.html

这回按照那次的讨论帖，重新写了一遍适配Steam版的

**特别注意：本修改器仅适配Steam版V1.4版本的游戏（包括民间汉化版），日文原版、YLT代理的汉化版均不适用！因为EXE偏移不一样！用了后游戏会崩溃闪退！**

### 郑重声明

本源码（含成品）仅供技术学习与交流讨论使用！严禁任何非法用途！

### 基本信息

源码名称：GuruminTrainerSteam

源码版本：1.0.0

源码语言：C#

.NET Framework框架版本：4.0

### 基本介绍

本修改器仅适配Steam版Ver 1.4版本，日文原版、YLT代理的汉化版均不适用！

修改器启动后会自动扫描游戏进程，激活成功后可操作以下23项属性修改。

※ 一、基本属性修改 ※

1) 主角无敌 [Shift+F1]

2) 无限跳跃 [Shift+F2]

3) 一击必杀 [Shift+F3]

4) 快速移动 [Shift+F4]

5) 清零总游戏时间 [Shift+F5]

6) 修改游戏难度

※ 二、战斗属性修改 ※

7) 敌人数/宝壶/宝箱全清 [Shift+F10]

8) 迷宫结算不累计GameOver [Shift+F11]

9) 耐久油时间不减 [Shift+F12]

10) 修改必杀技

※ 三、资源装备修改 ※

11) 突破资源上限 [Shift+F6]

12) 给我1000块钱 [Shift+F7]

13) 给我100碎片 [Shift+F8]

14) 消耗类道具加满 [Shift+F9]

15) 修改持有装备及等级

※ 四、钻头属性修改 ※

16) 强化油、钻头挑土能量增量20% [Ctrl+F1]

17) 激活四级钻头 [Ctrl+F2]

18) 钻头能量加满 [Ctrl+F3]

※ 五、小游戏修改 ※

19) 敌方碎石头我方得分 [Alt+F1]

20) 打地鼠连击不中断 [Alt+F2]

21) 无限躲激光 [Alt+F3]

22) 敌方进球我方得分 [Alt+F6]

23) 打地鼠/足球赛时间暂停 [Alt+F5]

### 软件截图

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(440.96 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4MzkwNHw0MjRkYzg4ZXwxNzkxNDI1MDY4fDB8MjEzMTI1Ng%3D%3D&nothumb=yes)

2026-10-7 13:45 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(85.13 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4MzkwNXxiY2RjMDhiNHwxNzkxNDI1MDY4fDB8MjEzMTI1Ng%3D%3D&nothumb=yes)

2026-10-7 13:45 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(35.25 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4MzkwNnxlMDIzYTk2OXwxNzkxNDI1MDY4fDB8MjEzMTI1Ng%3D%3D&nothumb=yes)

2026-10-7 13:46 上传

### 部分源码预览

这是实现主角基本属性修改的一小部分

'''

`    ///
    /// 作弊功能1：主角无敌
    /// (逻辑型 欲设置的开启状态)
    ///
    public void God(bool enable)
    {
        // 安全判定
        if (!IsActivated || ProcessHandle == IntPtr.Zero || TextSectionBase == IntPtr.Zero) return;

        // 补丁1:无敌状态触发位
        IntPtr addr1 = IntPtr.Add(TextSectionBase, OFFSET_GOD1);
        byte[] buf1 = enable ? BYTES_GOD_PATCHED1 : BYTES_GOD_ORIGINAL1;
        WriteProcessMemory(ProcessHandle, addr1, buf1, buf1.Length, out _);

        // 补丁2:无敌判定逻辑
        IntPtr addr2 = IntPtr.Add(TextSectionBase, OFFSET_GOD2);
        byte[] buf2 = enable ? BYTES_GOD_PATCHED2 : BYTES_GOD_ORIGINAL2;
        WriteProcessMemory(ProcessHandle, addr2, buf2, buf2.Length, out _);
    }

    ///
    /// 作弊功能2：无限跳跃
    /// (逻辑型 欲设置的开启状态)
    ///
    public void FreeJump(bool enable)
    {
        // 安全判定:如果没有激活成功,直接退出
        if (!IsActivated || ProcessHandle == IntPtr.Zero || TextSectionBase == IntPtr.Zero) return;

        // 核心寻址算法:.text 区段基址 + 无限跳跃偏移
        IntPtr targetAddress = IntPtr.Add(TextSectionBase, OFFSET_FREEJUMP);

        // 根据传入的布尔值,决定写入哪一套字节码
        byte[] bufferToWrite = enable ? BYTES_FREEJUMP_PATCHED : BYTES_FREEJUMP_ORIGINAL;

        // 将字节码强行写入游戏内存
        WriteProcessMemory(ProcessHandle, targetAddress, bufferToWrite, bufferToWrite.Length, out _);
    }

    ///
    /// 作弊功能3：一击必杀
    ///
    /// (逻辑型 欲设置的开启状态)
    public void SuperKill(bool enable)
    {
        // 安全判定
        if (!IsActivated || ProcessHandle == IntPtr.Zero || TextSectionBase == IntPtr.Zero) return;

        // 核心寻址:.text 基址 + 一击必杀偏移
        IntPtr targetAddress = IntPtr.Add(TextSectionBase, OFFSET_SUPERKILL);

        // 选字节:开启时写入 patched,关闭时还原 original
        byte[] bufferToWrite = enable ? BYTES_SUPERKILL_PATCHED : BYTES_SUPERKILL_ORIGINAL;

        // 写入游戏内存
        WriteProcessMemory(ProcessHandle, targetAddress, bufferToWrite, bufferToWrite.Length, out _);
    }

    ///
    /// 作弊功能4：设置快速移动速度
    /// (整数型 欲设置的速度等级)
    /// 0=关闭并还原注入点;1~6=对应 FLOAT_SPEEDLEVEL 的预设倍率
    ///
    public void FastMove(int speedLevel)
    {
        // 安全判定:如果没有激活成功,直接退出
        if (!IsActivated || ProcessHandle == IntPtr.Zero || TextSectionBase == IntPtr.Zero) return;

        // 档位越界直接退出(0=不加速,1~6=映射到数组下标 0~5)
        if (speedLevel  FLOAT_SPEEDLEVEL.Length) return;

        // 核心寻址算法:.text 区段基址 + 快速移动注入点偏移
        IntPtr targetAddress = IntPtr.Add(TextSectionBase, OFFSET_FASTMOVE);

        // 档位0:把注入点还原成原始5字节 movss xmm0,[ebp+08],执行流不再进入我们的内存块
        // 注意:这里只还原注入点,不释放内存块,重新开启时就不用再申请一次内存了
        if (speedLevel == 0)
        {
            ApplyPatch(ProcessHandle, targetAddress, BYTES_FASTMOVE_ORIGINAL, "快速移动-还原");
            return;
        }

        // 档位1~6:内存块还没准备好就先初始化,初始化失败直接退出
        if (OFFSET_FASTMOVE_PATCHED == 0 && !FastMoveInit()) return;

        // Step1: 先把倍率写进内存块的 gmCoordFactor,再挂钩子
        //        顺序不能反,否则挂上去的那一瞬间会先用到上一档的旧倍率
        float speedFactor = FLOAT_SPEEDLEVEL[speedLevel - 1];
        IntPtr factorAddress = (IntPtr)(OFFSET_FASTMOVE_PATCHED + GM_DATA_FACTOR);
        WriteProcessMemory(ProcessHandle, factorAddress, BitConverter.GetBytes(speedFactor), 4, out _);

        // Step2: 拼 jmp 指令 = 0xE9 + rel32,rel32 = 内存块地址 - (注入点地址 + 5)
        byte[] bufferToWrite = new byte[5];
        bufferToWrite[0] = 0xE9;
        int jmpRelative = OFFSET_FASTMOVE_PATCHED - (targetAddress.ToInt32() + 5);
        Buffer.BlockCopy(BitConverter.GetBytes(jmpRelative), 0, bufferToWrite, 1, 4);

        // Step3: 写入注入点。已经是同一条 jmp 时重复写是无害的,所以切换档位不必先还原
        ApplyPatch(ProcessHandle, targetAddress, bufferToWrite, "快速移动-注入");
    }

    ///
    /// 快速移动功能初始化
    /// 内存块已就绪返回真，申请或写入失败返回假
    ///
    public bool FastMoveInit()
    {
        // 安全判定:如果没有激活成功,直接退出
        if (!IsActivated || ProcessHandle == IntPtr.Zero || TextSectionBase == IntPtr.Zero)
        {
            LastMessage = "修改器未激活,无法初始化快速移动";
            return false;
        }

        // 已经申请过就直接复用,重复申请会造成游戏进程内存泄漏
        if (OFFSET_FASTMOVE_PATCHED != 0) return true;

        // Step1: 在游戏进程里申请 0x1000 字节,权限为可读可写可执行
        // 说明:游戏是32位进程,jmp rel32 的目标是按 2^32 取模算出来的,内存申请在哪都够得着,不必就近分配
        IntPtr codeCaveBase = VirtualAllocEx(ProcessHandle, IntPtr.Zero, FASTMOVE_CAVE_SIZE,
                                             MEM_COMMIT | MEM_RESERVE, PAGE_EXECUTE_READWRITE);
        if (codeCaveBase == IntPtr.Zero)
        {
            LastMessage = $"快速移动:申请内存失败 (err={Marshal.GetLastWin32Error()})";
            return false;
        }

        int caveAddress = codeCaveBase.ToInt32();
        int baseAddress = TextSectionBase.ToInt32();

        // Step2: 复制一份模板再回填,不要直接改常量数组,否则二次初始化会拿到上一次的脏地址
        byte[] bufferToWrite = (byte[])BYTES_FASTMOVE_PATCHED.Clone();

        // Step3: 回填7处指向内存块内部数据区的绝对地址(CE脚本里的 gmXXX 标签)
        WriteInt32ToBuffer(bufferToWrite, GM_REF_PLAYERTRANSFORM, caveAddress + GM_DATA_PLAYERTRANSFORM);
        WriteInt32ToBuffer(bufferToWrite, GM_REF_MAXDELTA_1, caveAddress + GM_DATA_MAXDELTA);
        WriteInt32ToBuffer(bufferToWrite, GM_REF_NEGMAXDELTA_1, caveAddress + GM_DATA_NEGMAXDELTA);
        WriteInt32ToBuffer(bufferToWrite, GM_REF_MAXDELTA_2, caveAddress + GM_DATA_MAXDELTA);
        WriteInt32ToBuffer(bufferToWrite, GM_REF_NEGMAXDELTA_2, caveAddress + GM_DATA_NEGMAXDELTA);
        WriteInt32ToBuffer(bufferToWrite, GM_REF_FACTOR_1, caveAddress + GM_DATA_FACTOR);
        WriteInt32ToBuffer(bufferToWrite, GM_REF_FACTOR_2, caveAddress + GM_DATA_FACTOR);

        // Step4: 回填返回用的 jmp rel32,公式 = 返回点地址 - (rel32字段地址 + 4)
        int returnAddress = baseAddress + OFFSET_FASTMOVE_RETURN;
        WriteInt32ToBuffer(bufferToWrite, GM_REF_RETURN_REL32,
                           returnAddress - (caveAddress + GM_REF_RETURN_REL32 + 4));

        // Step5: 回填数据区里的玩家transform运行时绝对地址 = .text基址 + transform偏移
        WriteInt32ToBuffer(bufferToWrite, GM_DATA_PLAYERTRANSFORM, baseAddress + RVA_FASTMOVE_TRANSFORM);

        // Step6: 把整块作弊字节码写进申请到的内存
        if (!WriteProcessMemory(ProcessHandle, codeCaveBase, bufferToWrite, bufferToWrite.Length, out int bytesWritten)
            || bytesWritten != bufferToWrite.Length)
        {
            LastMessage = $"快速移动:字节码写入失败 (written={bytesWritten}, err={Marshal.GetLastWin32Error()})";
            VirtualFreeEx(ProcessHandle, codeCaveBase, 0, MEM_RELEASE);
            return false;
        }

        // Step7: 记录内存块地址,后续开关与调速全部以它为准
        OFFSET_FASTMOVE_PATCHED = caveAddress;
        LastMessage = $"快速移动初始化完成,内存块地址: 0x{caveAddress:X8}";
        Console.WriteLine(LastMessage);
        return true;
    }

    ///
    /// 把一个32位整数按小端序回填到字节集的指定偏移
    /// (字节集 欲回填的字节集,
    /// 整数型 欲回填的偏移,
    /// 整数型 欲回填的字节量)
    ///
    private static void WriteInt32ToBuffer(byte[] buffer, int offset, int value)
    {
        Buffer.BlockCopy(BitConverter.GetBytes(value), 0, buffer, offset, 4);
    }

    ///
    /// 作弊功能5：游戏总时间清零
    /// 清零成功返回真，修改器未激活或写入失败返回假
    ///
    public bool TimeClear()
    {
        // 安全判定
        if (!IsActivated || ProcessHandle == IntPtr.Zero || TextSectionBase == IntPtr.Zero) return false;

        // 核心寻址:.text 基址 + 游戏总时间偏移
        IntPtr targetAddress = IntPtr.Add(TextSectionBase, RVA_GAMETIME);

        // 写入 4 字节零值,清零游戏总时间
        byte[] zeroBytes = new byte[] { 0x00, 0x00, 0x00, 0x00 };
        return WriteProcessMemory(ProcessHandle, targetAddress, zeroBytes, 4, out _);
    }

    ///
    /// 作弊功能6：修改游戏难度
    /// (整数型 欲修改的游戏难度)
    /// 0=初学者, 1=普通, 2=困难, 3=娱乐, 4=疯狂
    /// 修改成功返回真，无效参数或未激活返回假
    ///
    public bool ChangeDifficulty(int difficultyCode)
    {
        // 安全判定
        if (!IsActivated || ProcessHandle == IntPtr.Zero || TextSectionBase == IntPtr.Zero) return false;

        // 根据传入的难度编号选择对应的字节
        byte targetByte;
        switch (difficultyCode)
        {
            case 0: targetByte = BYTES_DIFFICULTY_BEGINNER; break;
            case 1: targetByte = BYTES_DIFFICULTY_NORMAL; break;
            case 2: targetByte = BYTES_DIFFICULTY_HARD; break;
            case 3: targetByte = BYTES_DIFFICULTY_PLEASURE; break;
            case 4: targetByte = BYTES_DIFFICULTY_CRAZY; break;
            default: return false;
        }

        // 写入单字节到目标地址
        IntPtr targetAddress = IntPtr.Add(TextSectionBase, RVA_DIFFICULTY);
        byte[] bufferToWrite = new byte[] { targetByte };
        WriteProcessMemory(ProcessHandle, targetAddress, bufferToWrite, 1, out _);
        return true;
    }

    ///
    /// 取游戏难度
    /// 0=初学者, 1=普通, 2=困难, 3=娱乐, 4=疯狂
    /// 返回的异常：无法读取游戏内存或遇到未知难度值时抛出
    ///
    public int GetDifficulty()
    {
        // 安全判定
        if (!IsActivated || ProcessHandle == IntPtr.Zero || TextSectionBase == IntPtr.Zero)
            throw new InvalidOperationException("修改器未激活,无法读取游戏难度。");

        // 读取目标地址的单字节
        IntPtr targetAddress = IntPtr.Add(TextSectionBase, RVA_DIFFICULTY);
        byte[] buffer = new byte[1];
        ReadProcessMemory(ProcessHandle, targetAddress, buffer, 1, out _);
        byte rawValue = buffer[0];

        // 根据字节值匹配对应的难度编号
        if (rawValue == BYTES_DIFFICULTY_BEGINNER) return 0;
        if (rawValue == BYTES_DIFFICULTY_NORMAL) return 1;
        if (rawValue == BYTES_DIFFICULTY_HARD) return 2;
        if (rawValue == BYTES_DIFFICULTY_PLEASURE) return 3;
        if (rawValue == BYTES_DIFFICULTY_CRAZY) return 4;

        throw new InvalidOperationException($"未知的游戏难度值: 0x{rawValue:X2},当心存档损坏!");
    }`
'''

### 更新日志

;--------------------------------------------

2026.10.07 -- v1.0.0

;--------------------------------------------

1、修改器正式发布。

### 如何编译

本项目依赖于.NET Framework V4.0运行，原则上Visual Studio 2010就可以编译，但是本人是在Visual Studio 2022中编译的，因此建议在Visual Studio 2022中编译。不过值得注意的是，Visual Studio 2026版本的IDE已经移除了.NET Framework V4.0的SDK，要么自己去下载它的SDK，要么自己到Properties配置项里改成较高版本的.NET Framework。

### 致谢

[52pojie@Coxxs](https://www.52pojie.cn/home.php?mod=space&uid=176235) ：帮我理清了重要属性绕过防篡改校验的思路，相关讨论帖：

>
[https://www.52pojie.cn/thread-2112391-1-1.html](https://www.52pojie.cn/thread-2112391-1-1.html)

### 意见或建议

可通过论坛回帖留言的方式反馈，也可私信该帖楼主也就是我来反馈。禁止留QQ、微信等联系方式，对利用私信留联系方式的行为将从重处罚！

修改器技术讨论帖请移步到这里：

>
[https://www.52pojie.cn/thread-2112391-1-1.html](https://www.52pojie.cn/thread-2112391-1-1.html)

### 源码链接

游客，如果您要查看本帖隐藏内容请[回复](forum.php?mod=post&action=reply&fid=24&tid=2131256)

---

[查看原文](https://www.52pojie.cn/thread-2131256-1-1.html)
