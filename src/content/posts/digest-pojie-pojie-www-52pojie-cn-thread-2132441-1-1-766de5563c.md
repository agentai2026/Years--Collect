---
title: "钉钉考勤一键审批"
published: 2026-10-14
description: "我单位用钉钉考勤，单位人员比较多，还允许每人每月4次补卡，所以到月底负责审批的领导不厌其烦，她是用手机在钉钉上点的，平时又不怎么用，到月底办公室要统计考勤时才会催她去审批，手机一个一个地去点太麻烦，而且还会 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "风子是我"
sourceLink: "https://www.52pojie.cn/thread-2132441-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2132441-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

我单位用钉钉考勤，单位人员比较多，还允许每人每月4次补卡，所以到月底负责审批的领导不厌其烦，她是用手机在钉钉上点的，平时又不怎么用，到月底办公室要统计考勤时才会催她去审批，手机一个一个地去点太麻烦，而且还会漏掉，有时候一个人提交四条，领导只看到的条要审批的，教她也学不会，于时有了这个钉钉考勤一键审批的小工具，我们是事业单位，考勤相对轻松，所以用一键审批问题不大，主要是对“补卡、外出、出差、请假”类的进行。

我做了两个版本，一个是电脑版 ，要在单位服务器上常驻运行，审批者手机要连上单位局域网才用，领导说不方便，要求可以随时随地都能用的，于是又做了个安卓手机版的。

![](https://static.52pojie.cn/static/image/common/none.gif)

**手机截图.png** *(131.23 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4NTgyNXw4NmEwN2NkM3wxNzkyMDMzNTYxfDB8MjEzMjQ0MQ%3D%3D&nothumb=yes)

2026-10-14 14:04 上传

下面是用 Kotlin开发，DingTalkApi.kt的完整源码：

[Java] *纯文本查看* *复制代码*
package com.school.dingtalkapprove

import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.net.URLEncoder
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.concurrent.TimeUnit

class DingTalkApi(
    private val appKey: String,
    private val appSecret: String,
    private val approver: String
) {
    private val http = OkHttpClient.Builder()
        .connectTimeout(20, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build()
    private val jsonType = "application/json; charset=utf-8".toMediaType()
    private var token = ""
    private var tokenExp = 0L
    private val names = mutableMapOf()

    private val allowBiz = mapOf(
        "attendance.supply" to "补卡",
        "leave" to "请假",
        "attendance.leave" to "请假",
        "alitrip.business" to "出差",
        "attendance.goout" to "外出"
    )

    fun pending(): List {
        val todos = listAllTodos()
        val details = todos.mapNotNull { it.optString("instance_id").ifBlank { null } }
            .distinct()
            .associateWith { runCatching { instanceDetail(it) }.getOrDefault(JSONObject()) }
        val seen = mutableSetOf()
        val out = mutableListOf()
        for (raw in todos) {
            val inst = details[raw.optString("instance_id")] ?: JSONObject()
            toItem(raw, inst)?.let {
                val k = it.instanceId + "/" + it.taskId
                if (seen.add(k)) out += it
            }
        }
        for (it in fromInstances()) {
            val k = it.instanceId + "/" + it.taskId
            if (seen.add(k)) out += it
        }
        return out.sortedBy { it.createdAt }
    }

    fun execute(item: TaskItem, result: String, remark: String) {
        val inst = instanceDetail(item.instanceId)
        val st = inst.optString("status").uppercase()
        if (st in setOf("COMPLETED", "TERMINATED", "CANCELED", "CANCELLED")) {
            throw RuntimeException("审批单已结束，无法操作")
        }
        val body = JSONObject()
            .put("processInstanceId", item.instanceId)
            .put("taskId", item.taskId.toLongOrNull() ?: item.taskId)
            .put("actionerUserId", approver)
            .put("result", result)
            .put("remark", remark)
        val req = Request.Builder()
            .url("https://api.dingtalk.com/v1.0/workflow/processInstances/execute")
            .addHeader("x-acs-dingtalk-access-token", accessToken())
            .post(body.toString().toRequestBody(jsonType))
            .build()
        http.newCall(req).execute().use { resp ->
            val t = resp.body?.string().orEmpty()
            val jo = runCatching { JSONObject(t) }.getOrDefault(JSONObject())
            if (!resp.isSuccessful || jo.has("code") && jo.optString("code").isNotBlank() && jo.optString("code") != "0") {
                throw RuntimeException(jo.optString("message").ifBlank { t.ifBlank { "execute failed" } })
            }
        }
    }

    private fun accessToken(): String {
        val now = System.currentTimeMillis() / 1000
        if (token.isNotBlank() && now
            val jo = JSONObject(resp.body?.string().orEmpty().ifBlank { "{}" })
            if (jo.optInt("errcode") != 0) throw RuntimeException(jo.optString("errmsg", path))
            return jo
        }
    }

    private fun get(url: String): JSONObject {
        val req = Request.Builder().url(url).get().build()
        http.newCall(req).execute().use { resp ->
            return JSONObject(resp.body?.string().orEmpty().ifBlank { "{}" })
        }
    }

    private fun listAllTodos(): List {
        val all = mutableListOf()
        var offset = 0
        repeat(30) {
            val r = postOapi(
                "/topapi/process/workrecord/task/query",
                JSONObject().put("userid", approver).put("offset", offset).put("count", 20).put("status", 0)
            ).optJSONObject("result") ?: JSONObject()
            val list = r.optJSONArray("list") ?: JSONArray()
            if (list.length() == 0) return all
            for (i in 0 until list.length()) all += list.getJSONObject(i)
            when {
                r.optBoolean("has_more", false) -> offset += 20
                r.has("next_cursor") && r.optInt("next_cursor") > 0 -> offset = r.optInt("next_cursor")
                else -> return all
            }
        }
        return all
    }

    private fun instanceDetail(id: String): JSONObject {
        return postOapi(
            "/topapi/processinstance/get",
            JSONObject().put("process_instance_id", id)
        ).optJSONObject("process_instance") ?: JSONObject()
    }

    private fun fromInstances(): List {
        val now = System.currentTimeMillis()
        val start = now - 60L * 24 * 3600 * 1000
        val codes = linkedSetOf()
        runCatching {
            val r = postOapi(
                "/topapi/process/listbyuserid",
                JSONObject().put("userid", approver).put("offset", 0).put("size", 100)
            )
            val result = r.optJSONObject("result") ?: r
            val list = result.optJSONArray("process_list") ?: result.optJSONArray("list") ?: JSONArray()
            val ok = listOf("补卡", "请假", "出差", "外出", "考勤")
            for (i in 0 until list.length()) {
                val p = list.getJSONObject(i)
                val name = p.optString("name")
                val code = p.optString("process_code")
                if (code.isNotBlank() && ok.any { it in name }) codes += code
            }
        }
        val ids = linkedSetOf()
        for (code in codes) {
            var cursor = 0
            repeat(8) {
                val r = runCatching {
                    postOapi(
                        "/topapi/processinstance/listids",
                        JSONObject()
                            .put("process_code", code)
                            .put("start_time", start)
                            .put("end_time", now)
                            .put("size", 20)
                            .put("cursor", cursor)
                    ).optJSONObject("result") ?: JSONObject()
                }.getOrNull() ?: return@repeat
                val list = r.optJSONArray("list") ?: JSONArray()
                if (list.length() == 0) return@repeat
                for (i in 0 until list.length()) ids += list.get(i).toString()
                cursor = r.optInt("next_cursor", -1)
                if (cursor ()
        ids.take(120).forEach { id ->
            val inst = runCatching { instanceDetail(id) }.getOrDefault(JSONObject())
            val st = inst.optString("status").uppercase()
            if (st.isNotBlank() && st !in setOf("RUNNING", "NEW")) return@forEach
            val tasks = inst.optJSONArray("tasks") ?: JSONArray()
            for (i in 0 until tasks.length()) {
                val t = tasks.getJSONObject(i)
                if (t.optString("userid") != approver) continue
                val ts = t.optString("status").uppercase()
                if (ts.isNotBlank() && ts !in setOf("RUNNING", "NEW", "PENDING")) continue
                val raw = JSONObject()
                    .put("task_id", t.opt("taskid") ?: t.opt("task_id") ?: "")
                    .put("instance_id", id)
                    .put("title", inst.optString("title"))
                toItem(raw, inst)?.let { out += it }
            }
        }
        return out
    }

    private fun toItem(raw: JSONObject, inst: JSONObject): TaskItem? {
        val title = raw.optString("title").ifBlank { inst.optString("title") }
        if (!isAttend(title, inst)) return null
        val st = inst.optString("status").uppercase()
        if (st in setOf("COMPLETED", "TERMINATED", "CANCELED", "CANCELLED")) return null
        val created = inst.optString("create_time").ifBlank { inst.optString("createTime") }
        if (tooOld(created)) return null
        val form = formMap(inst, raw.optJSONArray("forms"))
        val kind = classify(title, inst)
        val uid = inst.optString("originator_userid")
        val applicant = pick(form, listOf("姓名", "申请人"))
            .ifBlank { title.substringBefore("提交的", "").trim() }
            .ifBlank { userName(uid) }
            .ifBlank { "未知同事" }
            .let { if (it.all { c -> c.isDigit() }) userName(uid).ifBlank { "未知同事" } else it }
        var punch = pick(form, listOf("补卡时间", "缺卡时间", "打卡时间", "补卡日期", "请假时间", "出差时间", "外出时间", "开始时间", "时间"))
        var reason = pick(form, listOf("补卡原因", "缺卡原因", "请假原因", "出差事由", "外出事由", "申请理由", "理由", "原因", "说明", "事由"))
        if (reason.isBlank()) {
            val m = Regex("(?:补卡原因|原因|理由)\\s*[：:]\\s*([^；;]+)").find(form.values.joinToString("；"))
            reason = m?.groupValues?.getOrNull(1)?.trim().orEmpty()
        }
        if ("原因" in punch) punch = punch.split(Regex("原因\\s*[：:]")).first().trim('；', ';', ' ')
        return TaskItem(
            taskId = raw.optString("task_id"),
            instanceId = raw.optString("instance_id"),
            title = title,
            applicant = applicant,
            kind = kind ?: "补卡",
            punchTime = punch,
            reason = reason,
            createdAt = created
        )
    }

    private fun classify(title: String, inst: JSONObject): String? {
        val biz = inst.optString("biz_category_id").ifBlank { inst.optString("bizCategoryId") }
        allowBiz[biz]?.let { return it }
        val blob = title + " " + inst.optString("title") + " " + formMap(inst, null).keys.joinToString()
        return when {
            "补卡" in blob || "忘记打卡" in blob || "缺卡" in blob -> "补卡"
            "请假" in blob -> "请假"
            "出差" in blob -> "出差"
            "外出" in blob -> "外出"
            else -> null
        }
    }

    private fun isAttend(title: String, inst: JSONObject) = classify(title, inst) != null

    private fun tooOld(created: String): Boolean {
        if (created.isBlank()) return false
        val s = created.replace("T", " ").take(19)
        val fmt = listOf("yyyy-MM-dd HH:mm:ss", "yyyy-MM-dd HH:mm", "yyyy-MM-dd")
        for (f in fmt) {
            runCatching {
                val d = SimpleDateFormat(f, Locale.CHINA).parse(s) ?: return@runCatching
                return Date().time - d.time > 60L * 24 * 3600 * 1000
            }
        }
        return false
    }

    private fun formMap(inst: JSONObject, extra: JSONArray?): Map {
        val out = mutableMapOf()
        fun put(n: String, v: Any?) {
            val name = n.trim()
            val text = plain(v)
            if (name.isNotBlank() && text.isNotBlank()) out[name] = text
        }
        val arr = inst.optJSONArray("form_component_values") ?: inst.optJSONArray("formComponentValues")
        if (arr != null) for (i in 0 until arr.length()) {
            val it = arr.getJSONObject(i)
            put(it.optString("name").ifBlank { it.optString("id") }, it.opt("value") ?: it.opt("ext_value"))
        }
        if (extra != null) for (i in 0 until extra.length()) {
            val it = extra.optJSONObject(i) ?: continue
            put(it.optString("title").ifBlank { it.optString("name") }, it.opt("content") ?: it.opt("value"))
        }
        return out
    }

    private fun plain(v: Any?): String {
        if (v == null || v == JSONObject.NULL) return ""
        when (v) {
            is Number -> return v.toString()
            is Boolean -> return ""
            is String -> {
                val s = v.trim()
                if (s.isEmpty() || s in setOf("null", "[]", "{}")) return ""
                if ((s.startsWith("[") && s.endsWith("]")) || (s.startsWith("{") && s.endsWith("}"))) {
                    runCatching {
                        return if (s.startsWith("[")) {
                            val a = JSONArray(s)
                            (0 until a.length()).joinToString("；") { plain(a.get(it)) }.trim('；')
                        } else plainObj(JSONObject(s))
                    }
                }
                return s
            }
            is JSONArray -> return (0 until v.length()).joinToString("；") { plain(v.get(it)) }.trim('；')
            is JSONObject -> return plainObj(v)
        }
        return v.toString()
    }

    private fun plainObj(o: JSONObject): String {
        val start = plain(o.opt("start") ?: o.opt("startTime"))
        val end = plain(o.opt("end") ?: o.opt("endTime"))
        if (start.isNotBlank() || end.isNotBlank()) return listOf(start, end).filter { it.isNotBlank() }.joinToString(" ~ ")
        val prefer = mutableListOf()
        o.keys().forEach { k ->
            if (listOf("时间", "日期", "班次", "原因", "说明", "事由", "理由").any { it in k }) {
                val pv = plain(o.opt(k))
                if (pv.isNotBlank()) prefer += if ("原因" in k || "说明" in k) "$k：$pv" else pv
            }
        }
        if (prefer.isNotEmpty()) return prefer.joinToString("；")
        return o.keys().asSequence().map { plain(o.opt(it)) }.filter { it.isNotBlank() }.joinToString("；")
    }

    private fun pick(form: Map, keys: List): String {
        form.forEach { (k, v) ->
            if (v.isBlank() || v.all { it.isDigit() }) return@forEach
            if (listOf("提交", "创建", "附件").any { it in k }) return@forEach
            if (keys.any { it in k }) return v
        }
        return ""
    }

    private fun userName(uid: String): String {
        if (uid.isBlank()) return ""
        names[uid]?.let { return it }
        val n = runCatching {
            postOapi("/topapi/v2/user/get", JSONObject().put("userid", uid))
                .optJSONObject("result")?.optString("name").orEmpty()
        }.getOrDefault("")
        names[uid] = n
        return n
    }

    private fun enc(s: String) = URLEncoder.encode(s, "UTF-8")
}

界面上有三个参数要从钉钉开发者后台复制：

请见下图

![](https://static.52pojie.cn/static/image/common/none.gif)

**取密钥.png** *(44.71 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4NTgyNnwxYmM1ZWIyMnwxNzkyMDMzNTYxfDB8MjEzMjQ0MQ%3D%3D&nothumb=yes)

2026-10-14 14:05 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**取人员ID.png** *(94.33 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4NTgyN3w4OWQxZGUwY3wxNzkyMDMzNTYxfDB8MjEzMjQ0MQ%3D%3D&nothumb=yes)

2026-10-14 14:05 上传

还要创建应用，并给应用开始权限

![](https://static.52pojie.cn/static/image/common/none.gif)

**开通权限.png** *(86.54 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4NTgyOHxkZGIxY2UxYXwxNzkyMDMzNTYxfDB8MjEzMjQ0MQ%3D%3D&nothumb=yes)

2026-10-14 14:06 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**开通权限2.png** *(85.17 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4NTgyOXxiNzg3YTJiN3wxNzkyMDMzNTYxfDB8MjEzMjQ0MQ%3D%3D&nothumb=yes)

2026-10-14 14:06 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**开通权限3.png** *(89.42 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4NTgzMHw1ZDAzYzljNnwxNzkyMDMzNTYxfDB8MjEzMjQ0MQ%3D%3D&nothumb=yes)

2026-10-14 14:06 上传

---

[查看原文](https://www.52pojie.cn/thread-2132441-1-1.html)
