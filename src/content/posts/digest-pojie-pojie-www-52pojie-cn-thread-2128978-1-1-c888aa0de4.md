---
title: "（PC端）末世：我有一辆房车存档修改器"
published: 2026-09-20
description: "最近末世生存类游戏很火，现实都过得那么艰苦了，还要在游戏天天捡破烂度日，反正是单机写个修改器娱乐一下就好，吃用提示： 1：只对PC版有效，需要有本地单机的存档，如若涉及侵权烦请版主删除。 2：双击蓝色字体部分 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "flashgetme"
sourceLink: "https://www.52pojie.cn/thread-2128978-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2128978-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

最近末世生存类游戏很火，现实都过得那么艰苦了，还要在游戏天天捡破烂度日，反正是单机写个修改器娱乐一下就好，吃用提示：

1：只对PC版有效，需要有本地单机的存档，如若涉及侵权烦请版主删除。

2：双击蓝色字体部分，进行修改，建议只修改钱和晶核，物品数量也可以改，生存/战斗数值改了不生效，估计是和装备、等级绑定有计算的关系。

3：懒得搞无中生有功能了（物品ID修改），那样练级打怪捡装备的最后一点期待也没了，当然想改的自行修改程序。

4：用python写的程序都特别大上传不 了，自行编译吧。

程序开发注意事项：

1：存档是带有 SHA256校验的。(网上大神说的），直接改存档里的数值可能会让存档失效（事实上给我搞崩过N次）

2：开发中发现最初的版本有bug,整数样式键的排序 ：游戏里废墟商人等数据用`"10".."100"` 这种数字字符串做键。V8 引擎无视字典序排序，

     强制按数字大小（10,11,…,100）输出；Python 按字典序（"10","100","11"…）。

     整数值浮点 ：`1.0` 在 JS 序列化成`"1"` ，Python 却写成`"1.0"` ，存档里正好有 2 个这样的值。

     两处叠加导致修改器算出的校验码与游戏不一致，游戏就把存档移入`corrupt` 判废,所以要注意进行限制。

程序界面：

程序界面

![](https://attach.52pojie.cn/forum/202609/20/084921xskjj2e20l0n2j0j.png)

[Python] *纯文本查看* *复制代码*
import os
import re
import json
import math
import shutil
import hashlib
import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from datetime import datetime

DEFAULT_SAVE_PATH = r"C:\Users\Administrator\AppData\Roaming\Rebirth Hoarder\steam-cloud\saves\progress-current.json"

PAGES = [
    ("player", "玩家概况"),
    ("inventory", "库存与仓库"),
    ("survival", "生存 / 战斗"),
    ("stocks", "股票与投资组合"),
]

PLAYER_FIELDS = [
    ("playerName", "玩家名"),
    ("selectedCharacterId", "当前角色"),
    ("cash", "现金"),
    ("creditScore", "信用分"),
    ("backpackLevel", "背包等级"),
    ("vehicleLevel", "载具等级"),
    ("mood", "情绪"),
    ("daysSurvived", "生存天数"),
    ("difficultyMode", "难度模式"),
    ("totalRuns", "总局数"),
    ("bestSurvivalDays", "最佳生存天数"),
    ("sourceCrystals", "源晶体"),
    ("crystalCores", "晶体核心"),
    ("gameOver", "游戏状态"),
    ("savedAt", "存档时间"),
    ("revision", "存档版本"),
]

# (path, type) for editable player fields (savedAt/revision are metadata -> read-only)
PLAYER_EDIT = {
    "playerName": (["payload", "progress", "profile", "playerName"], "str"),
    "selectedCharacterId": (["payload", "progress", "profile", "selectedCharacterId"], "str"),
    "cash": (["payload", "progress", "activeRun", "gameState", "cash"], "int"),
    "creditScore": (["payload", "progress", "activeRun", "gameState", "creditScore"], "int"),
    "backpackLevel": (["payload", "progress", "activeRun", "gameState", "backpackLevel"], "int"),
    "vehicleLevel": (["payload", "progress", "activeRun", "gameState", "vehicleLevel"], "int"),
    "mood": (["payload", "progress", "activeRun", "gameState", "mood"], "int"),
    "daysSurvived": (["payload", "progress", "activeRun", "gameState", "p2", "daysSurvived"], "int"),
    "difficultyMode": (["payload", "progress", "activeRun", "gameState", "difficultyMode"], "str"),
    "totalRuns": (["payload", "progress", "profile", "stats", "totalRuns"], "int"),
    "bestSurvivalDays": (["payload", "progress", "profile", "stats", "bestSurvivalDays"], "int"),
    "sourceCrystals": (["payload", "progress", "profile", "sourceCrystals"], "int"),
    "crystalCores": (["payload", "progress", "activeRun", "gameState", "p2", "crystalCores"], "int"),
    "gameOver": (["payload", "progress", "activeRun", "gameState", "gameOver"], "bool"),
}

SURVIVAL_SECTIONS = [
    ("生存状态", [
        ("hp", "生命 (HP)"),
        ("attack", "攻击"),
        ("defense", "防御"),
        ("hunger", "饥饿"),
        ("thirst", "口渴"),
        ("mood", "情绪"),
        ("indoorTemp", "室内温度"),
        ("outdoorTemp", "室外温度"),
        ("fuel", "燃料"),
        ("ammo", "弹药"),
        ("power", "电力"),
        ("rvDurability", "房车耐久"),
        ("comfort", "舒适度"),
        ("daysSurvived", "生存天数"),
        ("killCount", "击杀数"),
    ]),
    ("战斗属性", [
        ("combat_maxHp", "最大生命"),
        ("combat_atk", "攻击"),
        ("combat_def", "防御"),
        ("critRate", "暴击率"),
        ("critDmg", "暴击伤害"),
        ("evasion", "闪避"),
        ("accuracy", "命中"),
        ("dmgReduction", "伤害减免"),
        ("armorPen", "破甲"),
        ("lifeSteal", "吸血"),
        ("speed", "速度"),
    ]),
    ("生存 / 其他属性", [
        ("luck", "幸运"),
        ("coldResist", "抗寒"),
        ("charisma", "魅力"),
    ]),
    ("武器工坊装备槽", [
        ("main", "主武器"),
        ("secondary", "副武器"),
        ("tactical", "战术"),
    ]),
]

P2 = ["payload", "progress", "activeRun", "gameState", "p2"]
SURVIVAL_EDIT = {
    "hp": (P2 + ["hp"], "int"),
    "attack": (P2 + ["attack"], "int"),
    "defense": (P2 + ["defense"], "int"),
    "hunger": (P2 + ["hunger"], "int"),
    "thirst": (P2 + ["thirst"], "int"),
    "mood": (P2 + ["mood"], "int"),
    "indoorTemp": (P2 + ["indoorTemp"], "int"),
    "outdoorTemp": (P2 + ["outdoorTemp"], "int"),
    "fuel": (P2 + ["fuel"], "int"),
    "ammo": (P2 + ["ammo"], "int"),
    "power": (P2 + ["power"], "int"),
    "rvDurability": (P2 + ["rvDurability"], "int"),
    "comfort": (P2 + ["comfortLevel"], "int"),
    "daysSurvived": (P2 + ["daysSurvived"], "int"),
    "killCount": (P2 + ["killCount"], "int"),
    "combat_maxHp": (P2 + ["combatAttributes", "maxHp"], "int"),
    "combat_atk": (P2 + ["combatAttributes", "atk"], "int"),
    "combat_def": (P2 + ["combatAttributes", "def"], "int"),
    "critRate": (P2 + ["combatAttributes", "critRate"], "int"),
    "critDmg": (P2 + ["combatAttributes", "critDmg"], "int"),
    "evasion": (P2 + ["combatAttributes", "evasion"], "int"),
    "accuracy": (P2 + ["combatAttributes", "accuracy"], "int"),
    "dmgReduction": (P2 + ["combatAttributes", "dmgReduction"], "int"),
    "armorPen": (P2 + ["combatAttributes", "armorPen"], "int"),
    "lifeSteal": (P2 + ["combatAttributes", "lifeSteal"], "int"),
    "speed": (P2 + ["combatAttributes", "speed"], "int"),
    "luck": (P2 + ["survivalAttributes", "luck"], "int"),
    "coldResist": (P2 + ["survivalAttributes", "coldResist"], "int"),
    "charisma": (P2 + ["survivalAttributes", "charisma"], "int"),
    "main": (P2 + ["weaponWorkshop", "equippedSlots", "main"], "str"),
    "secondary": (P2 + ["weaponWorkshop", "equippedSlots", "secondary"], "str"),
    "tactical": (P2 + ["weaponWorkshop", "equippedSlots", "tactical"], "str"),
}

EDIT_COLOR = "#1a5fb4"

def ts_to_str(ms):
    if not ms:
        return "-"
    try:
        return datetime.fromtimestamp(ms / 1000).strftime("%Y-%m-%d %H:%M:%S")
    except Exception:
        return str(ms)

def get(d, *keys, default=None):
    for k in keys:
        if isinstance(d, dict):
            d = d.get(k, default)
        else:
            return default
    return d

def get_path(d, path, default=None):
    for k in path:
        if isinstance(d, dict):
            d = d.get(k, default)
        else:
            return default
    return d

def set_path(d, path, value):
    for k in path[:-1]:
        nxt = d.get(k)
        if not isinstance(nxt, dict):
            nxt = {}
            d[k] = nxt
        d = nxt
    d[path[-1]] = value

# ---- 存档校验（与游戏 desktop/electron/saveCodecV2.cjs 完全一致；用游戏自带 Node 对拍验证）----
# 游戏校验 = sha256(JSON.stringify(stable(normalizePayloadV2(payload))))
# 两个 V8 与 Python 默认 JSON 行为不同、必须模拟的点：
#   1) “规范整数索引”键（如楼层 "10".."100"）在 V8 中永远按数字序枚举，普通键按字典序；
#   2) 整数值浮点序列化为整数（1.0 -> "1"），科学计数法阈值为 1e-7 / 1e21。
_ARRAY_INDEX_RE = re.compile(r"^(0|[1-9][0-9]*)$")
_ARRAY_INDEX_MAX = 2 ** 32 - 2

def _is_obj(v):
    return isinstance(v, dict)

def _clone(v):
    return json.loads(json.dumps(v, ensure_ascii=False))

def _es_number(x):
    """模拟 V8 Number.toString / JSON.stringify 的数字文本"""
    if isinstance(x, bool):
        return "true" if x else "false"
    if isinstance(x, int):
        return str(x)
    if x != x or x in (math.inf, -math.inf) or x == 0:
        return "null" if (x != x or x in (math.inf, -math.inf)) else "0"
    neg = x  1 else "")
        exp = n - 1
        s = f"{mant}e{'+' if exp >= 0 else '-'}{abs(exp)}"
    return ("-" if neg else "") + s

def _js_key_order(keys):
    idx, other = [], []
    for k in keys:
        m = _ARRAY_INDEX_RE.match(k)
        if m and int(k)  0):
        raise ValueError("progress.activeRun.startedAt is invalid")
    if not _is_obj(value.get("gameState")):
        raise ValueError("progress.activeRun.gameState must be an object")
    if not _is_obj(value.get("tutorialState")):
        raise ValueError("progress.activeRun.tutorialState must be an object")
    return _clone(value)

def _normalize_progress(value):
    if not _is_obj(value):
        raise ValueError("progress must be an object")
    if not _is_obj(value.get("profile")):
        raise ValueError("progress.profile must be an object")
    pr = value.get("pendingRun")
    if pr is not None and not _is_obj(pr):
        raise ValueError("progress.pendingRun must be an object or null")
    return {
        "profile": _clone(value["profile"]),
        "pendingRun": None if pr is None else _clone(pr),
        "activeRun": _normalize_active_run(value.get("activeRun")),
    }

def normalize_payload(payload):
    """对应游戏 normalizePayloadV2：丢弃未知顶层键、账本条目过滤、数组去重排序"""
    if not _is_obj(payload):
        raise ValueError("V2 payload must be an object")
    return {
        "progress": _normalize_progress(payload.get("progress")),
        "accountLedger": _normalize_ledger(payload.get("accountLedger")),
    }

def _stable(v):
    if isinstance(v, list):
        return [_stable(x) for x in v]
    if not _is_obj(v):
        return v
    return {k: _stable(v[k]) for k in _js_key_order(list(v.keys()))}

def serialize_payload(payload):
    return _js_dumps(_stable(normalize_payload(payload)))

def compute_checksum(payload):
    return hashlib.sha256(serialize_payload(payload).encode("utf-8")).hexdigest()

class ViewerApp:
    def __init__(self, root):
        self.root = root
        root.title("末世：我有一辆房车 存档修改器")
        root.geometry("1000x660")
        root.minsize(820, 520)
        self.data = None
        self.path = None
        self.name_map = {}
        self._modified = False
        self.player_labels = {}
        self.surv_labels = {}
        self._player_label_text = dict(PLAYER_FIELDS)
        self._surv_label_text = {k: lbl for _, fields in SURVIVAL_SECTIONS for k, lbl in fields}
        self._build_sidebar()
        self._build_content()
        self.root.after(200, self.open_file)

    # ---------------- Sidebar ----------------
    def _build_sidebar(self):
        sidebar = ttk.Frame(self.root, width=190, padding=8)
        sidebar.pack(side=tk.LEFT, fill=tk.Y)
        sidebar.pack_propagate(False)
        ttk.Label(sidebar, text="功能导航", font=("", 12, "bold")).pack(pady=(4, 10))
        ttk.Button(sidebar, text="打开存档", command=self.open_file).pack(fill=tk.X, pady=(0, 6))
        self.save_btn = ttk.Button(sidebar, text="保存回写", command=self._save, state="disabled")
        self.save_btn.pack(fill=tk.X, pady=(0, 10))
        for key, text in PAGES:
            ttk.Button(sidebar, text=text, command=lambda k=key: self.show_page(k)).pack(fill=tk.X, pady=4)
        ttk.Label(sidebar, text="蓝色数值可双击编辑", foreground=EDIT_COLOR).pack(pady=(10, 0))
        ttk.Label(sidebar, text="末世：我有一辆房车\n存档修改器 v1.1", foreground="gray",
                  justify="center").pack(side=tk.BOTTOM, pady=8)

    def _build_content(self):
        self.container = ttk.Frame(self.root)
        self.container.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        self.container.grid_rowconfigure(0, weight=1)
        self.container.grid_columnconfigure(0, weight=1)
        self.pages = {}
        for key, text in PAGES:
            page = self._create_page(key)
            page.grid(row=0, column=0, sticky="nsew")
            self.pages[key] = page
        self.status = ttk.Label(self.container, text="尚未加载存档", anchor="w", foreground="gray")
        self.status.grid(row=1, column=0, sticky="ew", padx=8, pady=4)

    def _create_page(self, key):
        if key == "player":
            return self._create_player_page()
        if key == "inventory":
            return self._create_inventory_page()
        if key == "survival":
            return self._create_survival_page()
        if key == "stocks":
            return self._create_stocks_page()
        return ttk.Frame(self.container)

    def show_page(self, key):
        self.pages[key].tkraise()

    def open_file(self):
        initdir = os.path.dirname(DEFAULT_SAVE_PATH) if os.path.exists(DEFAULT_SAVE_PATH) else None
        initfile = os.path.basename(DEFAULT_SAVE_PATH) if os.path.exists(DEFAULT_SAVE_PATH) else ""
        path = filedialog.askopenfilename(
            title="选择存档文件",
            initialdir=initdir,
            initialfile=initfile,
            filetypes=[("JSON 存档", "*.json"), ("所有文件", "*.*")],
        )
        if not path:
            if self.data is None and os.path.exists(DEFAULT_SAVE_PATH):
                path = DEFAULT_SAVE_PATH
            else:
                return
        self.load(path)

    def load(self, path):
        try:
            with open(path, "r", encoding="utf-8-sig") as f:
                self.data = json.load(f)
        except Exception as e:
            messagebox.showerror("加载失败", f"无法读取存档文件：\n{path}\n\n{e}")
            return
        self.path = path
        self._modified = False
        # 按游戏真实算法自检 checksum
        self._checksum_ok = True
        try:
            expected = compute_checksum(self.data.get("payload", {}))
            self._checksum_ok = (self.data.get("checksum") == expected)
        except Exception as e:
            self._checksum_ok = False
            self._checksum_error = str(e)
        self._build_name_map()
        self._update_player()
        self._update_inventory()
        self._update_survival()
        self._update_stocks()
        self.show_page("player")
        self.save_btn.config(state="normal")
        self.root.title(f"末世：我有一辆房车 存档修改器 - {os.path.basename(path)}")
        if self._checksum_ok:
            self.status.config(text=f"已加载：{path}", foreground="gray")
        else:
            self.status.config(
                text=f"已加载：{path}    &#9888; 该文件 checksum 无效，保存回写后将自动修正",
                foreground="#c01c28")
            messagebox.showwarning(
                "存档校验异常",
                "该文件的 checksum 与游戏校验规则不一致，游戏可能拒绝加载它。\n\n"
                "直接在修改器中编辑并“保存回写”，即可按游戏规则重新生成正确的校验码。")

    def _build_name_map(self):
        self.name_map = {}
        for t in get(self.data, "payload", "progress", "activeRun", "gameState",
                     "transactionHistory", default=[]):
            if isinstance(t, dict) and t.get("itemId") and t.get("itemName"):
                self.name_map[t["itemId"]] = t["itemName"]

    def _mark_modified(self):
        self._modified = True
        self.save_btn.config(state="normal")
        self.status.config(text=f"已加载：{self.path}（有未保存修改）")

    # ---------------- Edit helpers ----------------
    def _parse(self, raw, vtype):
        try:
            if vtype == "int":
                return int(raw)
            if vtype == "float":
                return float(raw)
            if vtype == "bool":
                low = raw.lower()
                if low in ("true", "1", "yes", "是", "y"):
                    return True
                if low in ("false", "0", "no", "否", "n"):
                    return False
                return None
            if vtype == "str":
                return raw
        except ValueError:
            return None
        return raw

    def _display_value(self, vtype, current):
        if vtype == "bool":
            return "是" if current else "否"
        return str(current)

    def _ask_value(self, title, prompt, current, vtype):
        win = tk.Toplevel(self.root)
        win.title(title)
        win.transient(self.root)
        win.grab_set()
        res = {}
        ttk.Label(win, text=prompt).grid(row=0, column=0, padx=10, pady=(12, 0), sticky="w")
        entry = ttk.Entry(win, width=32)
        entry.grid(row=0, column=1, padx=10, pady=(12, 0))
        entry.insert(0, current)
        entry.focus_set()
        entry.select_range(0, "end")

        def ok():
            raw = entry.get().strip()
            val = self._parse(raw, vtype)
            if val is None:
                messagebox.showerror("输入无效", f"请输入有效的 {vtype} 值", parent=win)
                return
            res["value"] = val
            win.destroy()

        def cancel():
            win.destroy()

        ttk.Button(win, text="确定", command=ok).grid(row=1, column=0, padx=10, pady=10)
        ttk.Button(win, text="取消", command=cancel).grid(row=1, column=1, padx=10, pady=10)
        win.bind("", lambda e: ok())
        win.bind("", lambda e: cancel())
        win.wait_window()
        return res.get("value")

    def _edit_label(self, key, edit_map, label_text):
        info = edit_map.get(key)
        if not info:
            return
        path, vtype = info
        current = get_path(self.data, path, default="")
        new = self._ask_value(f"修改 - {label_text[key]}", f"{label_text[key]}：",
                              self._display_value(vtype, current), vtype)
        if new is not None:
            set_path(self.data, path, new)
            self._mark_modified()
            self._update_player()
            self._update_survival()

    def _edit_inventory_quantity(self, which, def_id, new_total):
        gs = get(self.data, "payload", "progress", "activeRun", "gameState", default={})
        items = get(gs, which, default=[])
        instances = [it for it in items if it.get("defId") == def_id]
        if not instances:
            return
        n = len(instances)
        base, rem = divmod(max(0, new_total), n)
        for i, it in enumerate(instances):
            it["quantity"] = base + (1 if i ",
                         lambda e, k=key: self._edit_label(k, PLAYER_EDIT, self._player_label_text))
            val.grid(row=row, column=1, sticky="w", padx=12)
            self.player_labels[key] = val
            row += 1
        return page

    def _set_player(self, key, val):
        lbl = self.player_labels.get(key)
        if lbl:
            lbl.config(text=str(val))

    def _update_player(self):
        d = self.data or {}
        profile = get(d, "payload", "progress", "profile", default={})
        gs = get(d, "payload", "progress", "activeRun", "gameState", default={})
        p2 = get(gs, "p2", default={})
        stats = get(profile, "stats", default={})
        self._set_player("playerName", get(profile, "playerName", default="-"))
        self._set_player("selectedCharacterId", get(profile, "selectedCharacterId", default="-"))
        self._set_player("cash", f"{get(gs, 'cash', default=0):,}")
        self._set_player("creditScore", get(gs, "creditScore", default=0))
        self._set_player("backpackLevel", get(gs, "backpackLevel", default=0))
        self._set_player("vehicleLevel", get(gs, "vehicleLevel", default=0))
        self._set_player("mood", get(gs, "mood", default=0))
        self._set_player("daysSurvived", get(p2, "daysSurvived", default=0))
        self._set_player("difficultyMode", get(gs, "difficultyMode", default="-"))
        self._set_player("totalRuns", get(stats, "totalRuns", default=0))
        self._set_player("bestSurvivalDays", get(stats, "bestSurvivalDays", default=0))
        self._set_player("sourceCrystals", get(profile, "sourceCrystals", default=0))
        self._set_player("crystalCores", get(p2, "crystalCores", default=0))
        self._set_player("gameOver", "是" if get(gs, "gameOver", default=False) else "进行中")
        self._set_player("savedAt", ts_to_str(get(d, "savedAt", default=None)))
        self._set_player("revision", get(d, "revision", default="-"))

    # ---------------- Inventory page ----------------
    def _create_inventory_page(self):
        page = ttk.Frame(self.container, padding=10)
        page.columnconfigure(0, weight=1)
        page.columnconfigure(1, weight=1)
        page.rowconfigure(1, weight=1)
        ttk.Label(page, text="背包 (inventory) - 双击数量可改", font=("", 11, "bold")).grid(row=0, column=0, sticky="w")
        ttk.Label(page, text="仓库 (stash) - 双击数量可改", font=("", 11, "bold")).grid(row=0, column=1, sticky="w")
        self.inv_tree = self._make_tree(page, ["名称", "数量", "X", "Y"], 1, 0)
        self.stash_tree = self._make_tree(page, ["名称", "数量", "X", "Y"], 1, 1)
        self.inv_tree.bind("", self._on_tree_double)
        self.stash_tree.bind("", self._on_tree_double)
        return page

    def _make_tree(self, parent, columns, row, col):
        frame = ttk.Frame(parent)
        frame.grid(row=row, column=col, sticky="nsew", padx=5, pady=5)
        tree = ttk.Treeview(frame, columns=columns, show="headings", height=16)
        for c in columns:
            tree.heading(c, text=c)
            tree.column(c, width=90, anchor="center")
        vsb = ttk.Scrollbar(frame, orient="vertical", command=tree.yview)
        tree.configure(yscrollcommand=vsb.set)
        tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        vsb.pack(side=tk.RIGHT, fill=tk.Y)
        return tree

    def _clear_tree(self, tree):
        for i in tree.get_children():
            tree.delete(i)

    def _aggregate(self, items):
        agg = {}
        for it in items:
            d = it.get("defId")
            q = it.get("quantity", 0)
            if d not in agg:
                agg[d] = {"name": self.name_map.get(d, d), "qty": 0,
                          "pos": (it.get("x", "-"), it.get("y", "-"))}
            agg[d]["qty"] += q
        return agg

    def _update_inventory(self):
        self._clear_tree(self.inv_tree)
        self._clear_tree(self.stash_tree)
        gs = get(self.data, "payload", "progress", "activeRun", "gameState", default={})
        for d, info in sorted(self._aggregate(get(gs, "inventory", default=[])).items(),
                              key=lambda kv: kv[1]["name"]):
            self.inv_tree.insert("", "end", iid=d, values=(info["name"], info["qty"],
                                                           info["pos"][0], info["pos"][1]))
        for d, info in sorted(self._aggregate(get(gs, "stash", default=[])).items(),
                              key=lambda kv: kv[1]["name"]):
            self.stash_tree.insert("", "end", iid=d, values=(info["name"], info["qty"],
                                                             info["pos"][0], info["pos"][1]))

    # ---------------- Survival page ----------------
    def _scrollable(self, parent):
        canvas = tk.Canvas(parent, highlightthickness=0)
        vsb = ttk.Scrollbar(parent, orient="vertical", command=canvas.yview)
        frame = ttk.Frame(canvas)
        win = canvas.create_window((0, 0), window=frame, anchor="nw")
        frame.bind("", lambda e: canvas.configure(scrollregion=canvas.bbox("all")))
        canvas.bind("", lambda e: canvas.itemconfigure(win, width=e.width))
        canvas.configure(yscrollcommand=vsb.set)
        canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        vsb.pack(side=tk.RIGHT, fill=tk.Y)
        return frame

    def _create_survival_page(self):
        page = ttk.Frame(self.container, padding=10)
        page.rowconfigure(0, weight=1)
        page.columnconfigure(0, weight=1)
        body = self._scrollable(page)
        body.columnconfigure(1, weight=1)
        row = 0
        for section, fields in SURVIVAL_SECTIONS:
            ttk.Label(body, text=section, font=("", 12, "bold"),
                      foreground="#1a4a8a").grid(row=row, column=0, columnspan=2,
                                                 sticky="w", pady=(12, 2))
            row += 1
            for key, label in fields:
                ttk.Label(body, text=label).grid(row=row, column=0, sticky="w",
                                                 pady=2, padx=(4, 20))
                val = ttk.Label(body, text="-", font=("", 11, "bold"))
                if key in SURVIVAL_EDIT:
                    val.config(foreground=EDIT_COLOR, cursor="hand2")
                    val.bind("",
                             lambda e, k=key: self._edit_label(k, SURVIVAL_EDIT, self._surv_label_text))
                val.grid(row=row, column=1, sticky="w")
                self.surv_labels[key] = val
                row += 1
        return page

    def _set_surv(self, key, val):
        lbl = self.surv_labels.get(key)
        if lbl:
            lbl.config(text=str(val))

    def _update_survival(self):
        gs = get(self.data, "payload", "progress", "activeRun", "gameState", default={})
        p2 = get(gs, "p2", default={})
        ca = get(p2, "combatAttributes", default={})
        sa = get(p2, "survivalAttributes", default={})
        eq = get(p2, "weaponWorkshop", "equippedSlots", default={})
        self._set_surv("hp", f"{get(p2, 'hp', default='-')} / {get(p2, 'maxHp', default='-')}")
        self._set_surv("attack", get(p2, "attack", default="-"))
        self._set_surv("defense", get(p2, "defense", default="-"))
        self._set_surv("hunger", f"{get(p2, 'hunger', default='-')} / {get(p2, 'maxHunger', default='-')}")
        self._set_surv("thirst", f"{get(p2, 'thirst', default='-')} / {get(p2, 'maxThirst', default='-')}")
        self._set_surv("mood", get(p2, "mood", default="-"))
        self._set_surv("indoorTemp", get(p2, "indoorTemp", default="-"))
        self._set_surv("outdoorTemp", get(p2, "outdoorTemp", default="-"))
        self._set_surv("fuel", f"{get(p2, 'fuel', default='-')} / {get(p2, 'maxFuel', default='-')}")
        self._set_surv("ammo", f"{get(p2, 'ammo', default='-')} / {get(p2, 'maxAmmo', default='-')}")
        self._set_surv("power", f"{get(p2, 'power', default='-')} / {get(p2, 'maxPower', default='-')}")
        self._set_surv("rvDurability",
                       f"{get(p2, 'rvDurability', default='-')} / {get(p2, 'rvMaxDurability', default='-')}")
        self._set_surv("comfort", get(p2, "comfortLevel", default="-"))
        self._set_surv("daysSurvived", get(p2, "daysSurvived", default="-"))
        self._set_surv("killCount", get(p2, "killCount", default="-"))
        self._set_surv("combat_maxHp", get(ca, "maxHp", default="-"))
        self._set_surv("combat_atk", get(ca, "atk", default="-"))
        self._set_surv("combat_def", get(ca, "def", default="-"))
        self._set_surv("critRate", get(ca, "critRate", default="-"))
        self._set_surv("critDmg", get(ca, "critDmg", default="-"))
        self._set_surv("evasion", get(ca, "evasion", default="-"))
        self._set_surv("accuracy", get(ca, "accuracy", default="-"))
        self._set_surv("dmgReduction", get(ca, "dmgReduction", default="-"))
        self._set_surv("armorPen", get(ca, "armorPen", default="-"))
        self._set_surv("lifeSteal", get(ca, "lifeSteal", default="-"))
        self._set_surv("speed", get(ca, "speed", default="-"))
        self._set_surv("luck", get(sa, "luck", default="-"))
        self._set_surv("coldResist", get(sa, "coldResist", default="-"))
        self._set_surv("charisma", get(sa, "charisma", default="-"))
        self._set_surv("main", get(eq, "main", default="-"))
        self._set_surv("secondary", get(eq, "secondary", default="-"))
        self._set_surv("tactical", get(eq, "tactical", default="-"))

    # ---------------- Stocks page ----------------
    def _create_stocks_page(self):
        page = ttk.Frame(self.container, padding=10)
        page.columnconfigure(0, weight=1)
        page.rowconfigure(1, weight=1)
        page.rowconfigure(3, weight=1)
        ttk.Label(page, text="股票行情（双击现价/昨收可改）", font=("", 11, "bold")).grid(row=0, column=0, sticky="w")
        self.stock_tree = self._make_tree(page, ["代码", "名称", "分类", "现价", "昨收", "涨跌", "波动"], 1, 0)
        ttk.Label(page, text="我的持仓（双击数量/均价可改）", font=("", 11, "bold")).grid(row=2, column=0, sticky="w", pady=(10, 0))
        self.portfolio_tree = self._make_tree(page, ["代码", "名称", "数量", "均价", "市值", "盈亏"], 3, 0)
        self.stock_tree.bind("", self._on_tree_double)
        self.portfolio_tree.bind("", self._on_tree_double)
        return page

    def _update_stocks(self):
        self._clear_tree(self.stock_tree)
        self._clear_tree(self.portfolio_tree)
        gs = get(self.data, "payload", "progress", "activeRun", "gameState", default={})
        stocks = get(gs, "stocks", default=[])
        portfolio = get(gs, "portfolio", default={})
        stock_by_id = {}
        for s in stocks:
            stock_by_id[s.get("id")] = s
            price = s.get("price", 0)
            last = s.get("lastPrice", 0) or 0
            chg = (price - last) / last * 100 if last else 0
            self.stock_tree.insert("", "end", iid=s.get("id"), values=(
                s.get("symbol", "-"), s.get("name", "-"), s.get("category", "-"),
                f"{price:,.2f}", f"{last:,.2f}", f"{chg:+.2f}%", s.get("volatility", "-")))
        for stock_id, h in portfolio.items():
            s = stock_by_id.get(stock_id, {})
            qty = h.get("quantity", 0)
            avg = h.get("avgBuyPrice", 0)
            price = s.get("price", 0)
            value = qty * price
            profit = value - qty * avg
            self.portfolio_tree.insert("", "end", iid=stock_id, values=(
                s.get("symbol", "-"), s.get("name", "-"), qty,
                f"{avg:.2f}", f"{value:,.2f}", f"{profit:+,.2f}"))

def main():
    root = tk.Tk()
    try:
        ttk.Style().theme_use("vista")
    except tk.TclError:
        pass
    ViewerApp(root)
    root.mainloop()

if __name__ == "__main__":
    main()

---

[查看原文](https://www.52pojie.cn/thread-2128978-1-1.html)
