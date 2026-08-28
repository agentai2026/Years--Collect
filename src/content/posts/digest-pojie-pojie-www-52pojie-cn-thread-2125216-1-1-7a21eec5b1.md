---
title: "关于调教AI写游戏绕路思路的参考"
published: 2026-08-28
description: "首先俺上WC时思考了一下活人的思考过程： AI坦克寻路。障碍的解决(输出思考日志到文件，不知Godot是如何做的) 1.去哪儿？干啥？ 检测我方基地防护是否完整？ 如果不完整，在基地附近溜达 基地周围是否有敌人？ ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "冥界3大法王"
sourceLink: "https://www.52pojie.cn/thread-2125216-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2125216-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

首先俺上WC时思考了一下活人的思考过程：

     AI坦克寻路。障碍的解决(输出思考日志到文件，不知Godot是如何做的)

1.去哪儿？干啥？

检测我方基地防护是否完整？

如果不完整，在基地附近溜达

基地周围是否有敌人？具体追杀哪个目标？

给敌人加标识，加代号儿，加追踪印记。

判断坐标。此敌人是否还活着。

行进过程中是否有道具？

如果有的话，记住坐标，过去吃掉，括号撞击或者重合。

这条儿放在最前面。

 A得到自身坐标。记录一下最后一次走过的坐标，排除掉。

 B向目标坐标前进。

前进过程中不断判定自身坐标是否变化。判断自身坐标周围有哪些障碍。

左侧如果有，那就向右一步。

右侧如果有就向左一步

上面如果有就向下一步，

下边儿如果有就往上一步，

如此循环比较。

2.检测自身状态。武器是否满级？

没有敌人时，不能朝着自己的基地开炮

被定身，敌人吃到秒表时自毁。

3.助攻

得到我方基地的坐标

得到我方基地防护墙的坐标。

得到自身坦克的坐标。

得到追踪目标坦克的坐标。

得到道具的坐标。

判定离哪个坐标最近？

玩家基地的防护一旦被破坏意味着游戏Game Over

所以护家显得很重要（所以优先级最高）

![](https://static.52pojie.cn/static/image/hrline/2.gif)

然后使用gemini去加工整理了一下：

AI坦克寻路。障碍的解决(输出思考日志到文件，不知Godot是如何做的，我感觉输出到日志更科学)

1.去哪儿？干啥？

- 检测我方基地防护是否完整？

如果不完整，在基地附近消灭敌人

- 基地周围是否有敌人？具体追杀哪个目标？

给敌人加标识，加代号儿，加追踪印记。

判断坐标。此敌人是否还活着。

行进过程中是否有道具？

如果有的话，记住坐标，过去吃掉(撞击或者重合)

A.得到自身坐标。记录一下最后一次走过的坐标，排除掉。

B.向目标坐标前进。

前进过程中不断判定自身坐标是否变化。判断自身坐标周围有哪些障碍。

左侧如果有，那就向右一步。

右侧如果有就向左一步,

上面如果有就向下一步，

下边儿如果有就往上一步，

如此循环比较。

2.检测自身状态。武器是否满级？

没有敌人时，不能朝着自己的基地开炮

被定身，敌人吃到秒表时自毁。

3.助攻

- 得到我方基地的坐标

- 得到我方基地防护墙的坐标。

- 得到自身坦克的坐标。

- 得到追踪目标坦克的坐标。

- 得到道具的坐标。

- 判定离哪个坐标最近？

之后。。
这里是用 Godot (GDScript) 实现的坦克 AI 核心逻辑代码框架。代码采用了模块化的结构，包含了**日志记录、目标选择、简单的碰撞避障、防友伤开火**等逻辑。你可以将其挂载到 AI 坦克的 `CharacterBody2D` (Godot 4) 节点上。

#### AI 坦克主控代码 (`tank_ai.gd`)

GDScript

`extends CharacterBody2D

# ----------------- 基础配置与属性 -----------------
@export var move_speed: float = 150.0
@export var weapon_level: int = 1
@export var max_weapon_level: int = 3
@export var log_to_file_enabled: bool = true

# 节点引用 (根据项目实际节点路径调整)
@onready var ray_cast_forward: RayCast2D = $RayCastForward
@onready var ray_cast_left: RayCast2D = $RayCastLeft
@onready var ray_cast_right: RayCast2D = $RayCastRight

# 历史轨迹记录（防止在两格之间抽搐）
var position_history: Array[Vector2] = []
const MAX_HISTORY_SIZE: int = 5

# 日志文件句柄
var log_file: FileAccess

func _ready() -> void:
    if log_to_file_enabled:
        # Godot 标准写日志方式：写入 user:// 目录
        log_file = FileAccess.open("user://ai_debug.log", FileAccess.WRITE)
        _write_log("AI Tank Initialized.")

func _physics_process(_delta: float) -> void:
    # 0. 检测极端状态 (例如敌方使用了定身道具)
    if is_frozen():
        _write_log("Status: Frozen. Skipping frame.")
        return

    # 1. 获取全局节点与坐标信息
    var base_node = get_tree().get_first_node_in_group("Base")
    var enemies = get_tree().get_nodes_in_group("Enemies")
    var items = get_tree().get_nodes_in_group("Items")

    # 2. 核心决策：去哪儿？干啥？
    var target_position: Vector2 = Vector2.ZERO
    var current_state: String = "IDLE"

    if _is_base_in_danger(base_node, enemies):
        current_state = "DEFEND_BASE"
        target_position = _get_closest_node(enemies, base_node.global_position).global_position
    elif items.size() > 0 and weapon_level  0:
        current_state = "ATTACK_ENEMY"
        target_position = _get_closest_node(enemies, global_position).global_position
    else:
        current_state = "PATROL"
        target_position = global_position

    _write_log("State: %s | Target Pos: %s | Current Pos: %s" % [current_state, target_position, global_position])

    # 3. 路径规划与碰撞避障
    var move_direction = _calculate_avoidance_direction(target_position)
    velocity = move_direction * move_speed
    move_and_slide()

    # 4. 更新历史轨迹
    _update_position_history(global_position)

    # 5. 开火控制 (含防友伤检测)
    _try_shoot(target_position)

# ----------------- 逻辑函数与避障 -----------------

# 检查基地防护与周边威胁
func _is_base_in_danger(base_node: Node2D, enemies: Array) -> bool:
    if not is_instance_valid(base_node):
        return false
    # 如果基地墙体受损，或 300 像素内有敌人，判定基地危险
    for enemy in enemies:
        if enemy.global_position.distance_to(base_node.global_position)  Vector2:
    var desired_dir = (target_pos - global_position).normalized()
    if desired_dir == Vector2.ZERO:
        return Vector2.ZERO

    # 设置向前射线的方向为目标方向
    ray_cast_forward.target_position = desired_dir * 32.0
    ray_cast_forward.force_raycast_update()

    # 前方无障碍，直接前进
    if not ray_cast_forward.is_colliding():
        return desired_dir

    # 前方有障碍：尝试寻找左侧或右侧可用路径
    var left_dir = desired_dir.rotated(deg_to_rad(-90))
    var right_dir = desired_dir.rotated(deg_to_rad(90))

    ray_cast_left.target_position = left_dir * 32.0
    ray_cast_right.target_position = right_dir * 32.0
    ray_cast_left.force_raycast_update()
    ray_cast_right.force_raycast_update()

    if not ray_cast_left.is_colliding():
        return left_dir
    elif not ray_cast_right.is_colliding():
        return right_dir
    else:
        # 三面受阻，反向倒退避障
        return -desired_dir

# 射线防友伤开火控制
func _try_shoot(target_pos: Vector2) -> void:
    if ray_cast_forward.is_colliding():
        var collider = ray_cast_forward.get_collider()
        # 防背叛：如果前方撞击到的物体属于“基地”或“队友”，严禁开火！
        if collider.is_in_group("Base") or collider.is_in_group("Allies"):
            _write_log("Shoot blocked: Ally or Base in line of sight.")
            return

    # 执行射击逻辑 (示例)
    # shoot_bullet()

# ----------------- 辅助工具 -----------------

func _get_closest_node(nodes: Array, from_pos: Vector2) -> Node2D:
    var closest_node: Node2D = null
    var min_dist: float = INF
    for node in nodes:
        var dist = from_pos.distance_to(node.global_position)
        if dist  void:
    position_history.append(pos)
    if position_history.size() > MAX_HISTORY_SIZE:
        position_history.pop_front()

func is_frozen() -> bool:
    return false # 可接入状态机的定身判定

func _write_log(message: String) -> void:
    if log_file and log_to_file_enabled:
        var time_str = Time.get_time_string_from_system()
        log_file.store_line("[%s] %s" % [time_str, message])`

然后在调试过程中: 我让它把 去哪？干什么？ 坐标，是否存在？ 行动路线 都输出到日志文件

> [17:14:02] [AI_P2] [DECISION] ATTACK_ENEMY | Pos:(272,400) | 目标=enemy#127087414048(t90)(存活) | 目标格(16,0) 距离=392

[17:14:03] [AI_P2] [ACTION] 打墙开炮(第1炮) | Pos:(289,399) | 锁定墙#113900521487 前方=WALL

[17:14:03] [AI_P2] [ACTION] 打墙开炮(第2炮) | Pos:(289,399) | 锁定墙#113900521487 前方=WALL

[17:14:03] [AI_P2] [ACTION] 打墙成功：目标墙已清除 | Pos:(289,399) | 尝试=2次

[17:14:03] [AI_P2] [ACTION] 打墙开炮(第1炮) | Pos:(289,383) | 锁定墙#113363650543 前方=WALL

[17:14:03] [AI_P2] [ACTION] 打墙开炮(第2炮) | Pos:(289,383) | 锁定墙#113363650543 前方=WALL

[17:14:03] [AI_P2] [ACTION] 打墙成功：目标墙已清除 | Pos:(289,383) | 尝试=2次

[17:14:04] [AI_P2] [ACTION] 打墙开炮(第1炮) | Pos:(289,367) | 锁定墙#112826779599 前方=WALL

[17:14:04] [AI_P2] [ACTION] 打墙开炮(第2炮) | Pos:(289,367) | 锁定墙#112826779599 前方=WALL

[17:14:04] [AI_P2] [ACTION] 打墙成功：目标墙已清除 | Pos:(289,367) | 尝试=2次

[17:14:04] [AI_P2] [ACTION] 打墙开炮(第1炮) | Pos:(289,351) | 锁定墙#112289908655 前方=WALL

[17:14:04] [AI_P2] [ACTION] 打墙开炮(第2炮) | Pos:(289,351) | 锁定墙#112289908655 前方=WALL

[17:14:04] [AI_P2] [ACTION] 打墙成功：目标墙已清除 | Pos:(289,351) | 尝试=2次

[17:14:05] [AI_P2] [ACTION] 打墙开炮(第1炮) | Pos:(289,335) | 锁定墙#111484602239 前方=WALL

[17:14:05] [AI_P2] [ACTION] 打墙开炮(第2炮) | Pos:(289,335) | 锁定墙#111484602239 前方=WALL

[17:14:05] [AI_P2] [ACTION] 打墙成功：目标墙已清除 | Pos:(289,335) | 尝试=2次

[17:14:05] [AI_P2] [ACTION] 打墙开炮(第1炮) | Pos:(289,319) | 锁定墙#110679295823 前方=WALL

[17:14:06] [AI_P2] [ACTION] 打墙开炮(第2炮) | Pos:(289,319) | 锁定墙#110679295823 前方=WALL

[17:14:06] [AI_P2] [ACTION] 打墙失败：目标墙仍存在→放弃并绕路 | Pos:(289,319) | 尝试=3次

[17:14:06] [AI_P2] [ACTION] 强制绕路(打墙验证失败) | Pos:(289,319) | 绕向=2 目标格(18,1)

[17:14:06] [AI_P2] [ACTION] 打墙开炮(第1炮) | Pos:(271,319) | 锁定墙#111417493371 前方=WALL

[17:14:06] [AI_P2] [ACTION] 打墙开炮(第2炮) | Pos:(271,319) | 锁定墙#111417493371 前方=WALL

[17:14:06] [AI_P2] [ACTION] 打墙成功：目标墙已清除 | Pos:(271,319) | 尝试=2次

[17:14:07] [AI_P2] [ACTION] 打墙开炮(第1炮) | Pos:(337,319) | 锁定墙#112424126391 前方=WALL

[17:14:08] [AI_P2] [ACTION] 打墙开炮(第2炮) | Pos:(337,319) | 锁定墙#112424126391 前方=WALL

[17:14:08] [AI_P2] [ACTION] 打墙成功：目标墙已清除 | Pos:(337,319) | 尝试=2次

[17:14:08] [AI_P2] [ACTION] 打墙开炮(第1炮) | Pos:(353,319) | 锁定墙#111685928843 前方=WALL

[17:14:08] [AI_P2] [ACTION] 打墙开炮(第2炮) | Pos:(353,319) | 锁定墙#111685928843 前方=WALL

[17:14:08] [AI_P2] [ACTION] 打墙成功：目标墙已清除 | Pos:(353,319) | 尝试=2次

[17:14:09] [AI_P2] [ACTION] 打墙开炮(第1炮) | Pos:(384,319) | 锁定墙#110880622427 前方=WALL

[17:14:09] [AI_P2] [ACTION] 打墙开炮(第2炮) | Pos:(384,319) | 锁定墙#110880622427 前方=WALL

[17:14:09] [AI_P2] [ACTION] 打墙成功：目标墙已清除 | Pos:(384,319) | 尝试=2次

[17:14:10] [AI_P2] [OBSTACLE] 前方=HARD(不可打穿) | Pos:(384,255) | 障坐标(23,14)(24,14)

[17:14:18] [AI_P2] [STATE_CHANGE] ATTACK_ENEMY Pos:(367,237) | 绕路避障 dir=3

[17:14:18] [AI_P2] [STATE_CHANGE] ATTACK_ENEMY Pos:(369,237) | 绕路避障 dir=2

[17:14:18] [AI_P2] [ACTION] 打墙开炮(第1炮) | Pos:(367,237) | 锁定墙#115444025451 前方=WALL

[17:14:18] [AI_P2] [ACTION] 打墙开炮(第2炮) | Pos:(367,237) | 锁定墙#115444025451 前方=WALL

[17:14:18] [AI_P2] [ACTION] 打墙失败：目标墙仍存在→放弃并绕路 | Pos:(367,237) | 尝试=3次

[17:14:18] [AI_P2] [ACTION] 强制绕路(打墙验证失败) | Pos:(367,237) | 绕向=3 目标格(16,19)

[17:14:19] [AI_P2] [OBSTACLE] 前方=HARD(不可打穿) | Pos:(369,237) | 障坐标(24,14)

[17:14:19] [AI_P2] [DECISION] DEFEND_BASE | Pos:(369,237) | 目标=enemy#127422958388(t92)(存活) | 目标格(12,24) 距离=229

[17:14:19] [AI_P2] [STATE_CHANGE] DEFEND_BASE Pos:(369,237) | 绕路避障 dir=2

[17:14:19] [AI_P2] [ACTION] 打墙开炮(第1炮) | Pos:(367,237) | 锁定墙#116249331867 前方=WALL

[17:14:19] [AI_P2] [ACTION] 打墙开炮(第2炮) | Pos:(367,237) | 锁定墙#116249331867 前方=WALL

[17:14:20] [AI_P2] [ACTION] 打墙成功：目标墙已清除 | Pos:(367,237) | 尝试=2次

[17:14:20] [AI_P2] [ACTION] 打墙开炮(第1炮) | Pos:(367,257) | 锁定墙#110008207143 前方=WALL

[17:14:20] [AI_P2] [ACTION] 打墙开炮(第2炮) | Pos:(367,257) | 锁定墙#110008207143 前方=WALL

[17:14:20] [AI_P2] [ACTION] 打墙成功：目标墙已清除 | Pos:(367,257) | 尝试=2次

[17:14:20] [AI_P2] [DECISION] ATTACK_ENEMY | Pos:(367,273) | 目标=enemy#127758502728(t90)(存活) | 目标格(23,9) 距离=122

[17:14:23] [AI_P2] [ACTION] 打墙开炮(第1炮) | Pos:(367,232) | 锁定墙#116249331867 前方=WALL

[17:14:23] [AI_P2] [STATE_CHANGE] ATTACK_ENEMY Pos:(367,232) | 绕路避障 dir=3

[17:14:23] [AI_P2] [ACTION] 打墙成功：目标墙已清除 | Pos:(367,232) | 尝试=1次

[17:14:24] [AI_P2] [STATE_CHANGE] ATTACK_ENEMY Pos:(402,232) | 绕路避障 dir=0

[17:14:27] [AI_P2] [ACTION] 打墙开炮(第1炮) | Pos:(367,127) | 锁定墙#120678517155 前方=WALL

[17:14:27] [AI_P2] [ACTION] 打墙成功：目标墙已清除 | Pos:(367,127) | 尝试=1次

[17:14:28] [AI_P2] [ACTION] 打墙开炮(第1炮) | Pos:(367,111) | 锁定墙#121416714703 前方=WALL

[17:14:28] [AI_P2] [ACTION] 打墙开炮(第2炮) | Pos:(367,111) | 锁定墙#121416714703 前方=WALL

[17:14:28] [AI_P2] [ACTION] 打墙成功：目标墙已清除 | Pos:(367,111) | 尝试=2次

统统输出出来，再让它给AI分析 .LOG

之后我又提出守株待兔 ，伏击敌人，而不是追着打。

![](https://attach.52pojie.cn/forum/202608/28/174009h8bcbgpxg6cobe8z.png)

---

[查看原文](https://www.52pojie.cn/thread-2125216-1-1.html)
