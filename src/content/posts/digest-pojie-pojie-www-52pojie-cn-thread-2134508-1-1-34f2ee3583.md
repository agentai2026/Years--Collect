---
title: "安卓局域网互传"
published: 2026-10-27
description: "安卓局域网互传"
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "再贱就再见"
sourceLink: "https://www.52pojie.cn/thread-2134508-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2134508-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

**转载个小工具局域网传 —— 同一 Wi&#8209;Fi 互传文件，不走公网**

手机对手机：打开 App 就能发现附近设备，点一下发文件。

手机对 电脑：手机打开「网页互传」，电脑浏览器访问显示的网址（端口 38766），就能上传到手机，也能从手机下载。

电脑要下手机文件时：手机点「选择文件给电脑下载」选好文件 → 电脑刷新网页 → 点文件即可下载。

适合传照片、安装包、文档，局域网内直传，不用数据线、不用网盘。

![](https://static.52pojie.cn/static/image/common/none.gif)

**11111.png** *(135.81 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4OTA4OHw3MGFhOGFmMHwxNzkzMTYzOTA1fDB8MjEzNDUwOA%3D%3D&nothumb=yes)

2026-10-27 19:33 上传

https://wwbmj.lanzouu.com/ibW3p4dlp4oh

密码:2gna

觉得有用的请给与支持！！！

觉得有用的请给与支持！！！

觉得有用的请给与支持！！！:lol

[Java] *纯文本查看* *复制代码*

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
    id("org.jetbrains.kotlin.plugin.serialization")
}

android {
    namespace = "com.lanchuan.app"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.lanchuan.app"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro",
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }

    testOptions {
        unitTests.isReturnDefaultValues = true
    }
}

dependencies {
    val composeBom = platform("androidx.compose:compose-bom:2024.10.01")
    implementation(composeBom)

    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.activity:activity-compose:1.9.2")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.6")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.6")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.6")
    implementation("androidx.navigation:navigation-compose:2.8.2")
    implementation("androidx.datastore:datastore-preferences:1.1.1")
    implementation("androidx.documentfile:documentfile:1.0.1")

    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-core")
    implementation("androidx.compose.foundation:foundation")

    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")

    debugImplementation("androidx.compose.ui:ui-tooling")

    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.9.0")
}

========== app/src/main/AndroidManifest.xml ==========

========== app/src/main/java/com/lanchuan/app/data/AndroidReceiveStore.kt ==========
package com.lanchuan.app.data

import android.content.ContentValues
import android.content.Context
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import androidx.documentfile.provider.DocumentFile
import com.lanchuan.app.protocol.Protocol
import com.lanchuan.app.protocol.SharedFile
import com.lanchuan.app.protocol.sanitizeFileName
import com.lanchuan.app.protocol.sanitizeMime
import com.lanchuan.app.transfer.ReceiveSink
import com.lanchuan.app.transfer.ReceiveStore
import kotlinx.serialization.Serializable
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.io.OutputStream
import java.util.UUID
import java.util.concurrent.atomic.AtomicBoolean

class AndroidReceiveStore(
    private val context: Context,
    private val saveTreeUri: () -> String?,
) : ReceiveStore {
    private val metaDir = File(context.filesDir, "incoming").apply { mkdirs() }

    override fun open(file: SharedFile): ReceiveSink {
        val metaFile = File(metaDir, "${file.id}.json")
        val existing = readMeta(metaFile)
        if (existing != null && existing.name == file.name && existing.size == file.size) {
            reopen(file, existing, metaFile)?.let { return it }
        }
        if (existing != null) deleteDestination(existing)
        metaFile.delete()
        ensureSpace(file.size)
        return create(file, metaFile)
    }

    fun beginUpload(rawName: String, rawMime: String): StreamUpload {
        ensureSomeSpace()
        val name = sanitizeFileName(rawName)
        val mime = sanitizeMime(rawMime)
        val id = UUID.randomUUID().toString()
        val file = SharedFile(id = id, name = name, size = 0L, mime = mime)
        val metaFile = File(metaDir, "$id.json")
        val tree = saveTreeUri()?.takeIf { it.isNotBlank() }
        val created = when {
            tree != null -> createSaf(file, tree)
            Build.VERSION.SDK_INT >= 29 -> createDownload(file)
            else -> createAppFile(file)
        }
        writeMeta(metaFile, created)
        val stream = openNew(created) ?: throw IOException("无法写入「$name」")
        return StreamUpload(
            id = id,
            name = name,
            mime = mime,
            output = stream,
            commitAction = { written ->
                try {
                    stream.flush()
                } catch (_: Exception) {
                }
                try {
                    stream.close()
                } catch (_: Exception) {
                }
                val done = created.copy(size = written, received = written, done = true)
                publish(done)
                writeMeta(metaFile, done)
                done.uri
            },
            abortAction = {
                try {
                    stream.close()
                } catch (_: Exception) {
                }
                deleteDestination(created)
                metaFile.delete()
            },
        )
    }

    override fun discard(fileId: String) {
        val metaFile = File(metaDir, "$fileId.json")
        val existing = readMeta(metaFile) ?: return
        if (!existing.done) deleteDestination(existing)
        metaFile.delete()
    }

    private fun reopen(file: SharedFile, meta: PartialMeta, metaFile: File): ReceiveSink? {
        val length = destinationLength(meta) ?: return null
        if (length > file.size) {
            deleteDestination(meta)
            return null
        }
        if (length == file.size || meta.done) {
            if (!meta.done) publish(meta)
            writeMeta(metaFile, meta.copy(received = file.size, done = true))
            return sink(
                meta = meta.copy(received = file.size, done = true),
                metaFile = metaFile,
                startOffset = file.size,
                stream = null,
                preexisting = true,
                complete = true,
            )
        }
        val output = append(meta) ?: return null
        return sink(
            meta = meta.copy(received = length),
            metaFile = metaFile,
            startOffset = length,
            stream = output,
            preexisting = true,
            complete = false,
        )
    }

    private fun create(file: SharedFile, metaFile: File): ReceiveSink {
        val tree = saveTreeUri()?.takeIf { it.isNotBlank() }
        val created = when {
            tree != null -> createSaf(file, tree)
            Build.VERSION.SDK_INT >= 29 -> createDownload(file)
            else -> createAppFile(file)
        }
        writeMeta(metaFile, created)
        val output = openNew(created) ?: throw IOException("无法写入「${file.name}」")
        return sink(created, metaFile, startOffset = 0, stream = output, preexisting = false, complete = false)
    }

    private fun createDownload(file: SharedFile): PartialMeta {
        if (Build.VERSION.SDK_INT  FileOutputStream(File(meta.uri), false)
            else -> context.contentResolver.openOutputStream(Uri.parse(meta.uri), "w")
        }
    }

    private fun append(meta: PartialMeta): OutputStream? {
        return try {
            when (meta.via) {
                VIA_FILE -> {
                    val file = File(meta.uri)
                    if (!file.exists()) null else FileOutputStream(file, true)
                }
                else -> context.contentResolver.openOutputStream(Uri.parse(meta.uri), "wa")
            }
        } catch (_: Exception) {
            null
        }
    }

    private fun destinationLength(meta: PartialMeta): Long? {
        return try {
            when (meta.via) {
                VIA_FILE -> {
                    val file = File(meta.uri)
                    if (!file.exists()) null else file.length()
                }
                else -> context.contentResolver.openFileDescriptor(Uri.parse(meta.uri), "r")?.use { it.statSize }
                    ?.takeIf { it >= 0L }
            }
        } catch (_: Exception) {
            null
        }
    }

    private fun publish(meta: PartialMeta) {
        if (meta.via != VIA_MEDIA || Build.VERSION.SDK_INT  0 && needed + 8L * 1024 * 1024 > free) {
                throw IOException("可用存储空间不足，无法接收")
            }
        } catch (error: IOException) {
            throw error
        } catch (_: Exception) {
        }
    }

    private fun appDownloadDir(): File {
        val base = context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS) ?: context.filesDir
        return File(base, "局域网传").apply { mkdirs() }
    }

    private fun uniqueFile(dir: File, name: String): File {
        val clean = name.ifBlank { "未命名" }
        val direct = File(dir, clean)
        if (!direct.exists()) return direct
        val dot = clean.lastIndexOf('.')
        val base = if (dot > 0) clean.substring(0, dot) else clean
        val ext = if (dot > 0) clean.substring(dot) else ""
        var index = 1
        while (true) {
            val candidate = File(dir, "$base ($index)$ext")
            if (!candidate.exists()) return candidate
            index++
        }
    }

    private fun readMeta(file: File): PartialMeta? {
        if (!file.exists()) return null
        return try {
            Protocol.json.decodeFromString(PartialMeta.serializer(), file.readText())
        } catch (_: Exception) {
            null
        }
    }

    private fun writeMeta(file: File, meta: PartialMeta) {
        file.parentFile?.mkdirs()
        file.writeText(Protocol.json.encodeToString(PartialMeta.serializer(), meta))
    }

    @Serializable
    private data class PartialMeta(
        val id: String,
        val name: String,
        val size: Long,
        val mime: String,
        val via: String,
        val uri: String,
        val received: Long,
        val done: Boolean,
    )

    private companion object {
        const val VIA_MEDIA = "mediastore"
        const val VIA_SAF = "saf"
        const val VIA_FILE = "file"
    }
}

class StreamUpload(
    val id: String,
    val name: String,
    val mime: String,
    val output: OutputStream,
    private val commitAction: (Long) -> String,
    private val abortAction: () -> Unit,
) {
    private val once = AtomicBoolean(false)

    fun commit(written: Long): String {
        if (!once.compareAndSet(false, true)) throw IOException("上传已结束")
        return commitAction(written)
    }

    fun abort() {
        if (!once.compareAndSet(false, true)) return
        abortAction()
    }
}

========== app/src/main/java/com/lanchuan/app/data/AndroidWebCatalog.kt ==========
package com.lanchuan.app.data

import android.content.ContentUris
import android.content.Context
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.webkit.MimeTypeMap
import androidx.documentfile.provider.DocumentFile
import com.lanchuan.app.transfer.TransferRecord
import com.lanchuan.app.web.WebBody
import com.lanchuan.app.web.WebCatalog
import com.lanchuan.app.web.WebIds
import com.lanchuan.app.web.WebItem
import com.lanchuan.app.web.WebUpload
import java.io.File
import java.io.FileInputStream
import java.util.UUID

class AndroidWebCatalog(
    private val context: Context,
    private val uploads: AndroidReceiveStore,
    private val shareOut: ShareOutStore,
    private val saveTreeUri: () -> String?,
    private val history: () -> List,
    private val onSaved: (TransferRecord) -> Unit,
) : WebCatalog {
    override fun list(): List = snapshot().map { it.item }

    override fun open(id: String): WebBody? {
        if (!id.matches(Regex("^[a-f0-9]{16}$"))) return null
        shareOut.open(id)?.let { (entry, stream) ->
            val size = try {
                when (entry.kind) {
                    ShareOutKind.FILE -> File(entry.key).length()
                    ShareOutKind.CONTENT -> context.contentResolver.openFileDescriptor(Uri.parse(entry.key), "r")?.use { descriptor ->
                        if (descriptor.statSize >= 0L) descriptor.statSize else entry.size
                    } ?: entry.size
                }
            } catch (_: Exception) {
                entry.size
            }
            return WebBody(entry.toWebItem().copy(size = size), stream)
        }
        val stored = snapshot().firstOrNull { it.item.id == id } ?: return null
        val stream = try {
            when (stored.kind) {
                Kind.FILE -> FileInputStream(stored.key)
                Kind.CONTENT -> context.contentResolver.openInputStream(Uri.parse(stored.key))
            }
        } catch (_: Exception) {
            null
        } ?: return null
        val size = storedSize(stored)
        return WebBody(stored.item.copy(size = size), stream)
    }

    override fun startUpload(name: String, mime: String): WebUpload {
        val handle = uploads.beginUpload(name, mime)
        return object : WebUpload {
            private var written = 0L
            private var finished = false

            override fun write(buffer: ByteArray, offset: Int, length: Int) {
                handle.output.write(buffer, offset, length)
                written += length
            }

            override fun commit() {
                if (finished) return
                finished = true
                val uri = handle.commit(written)
                onSaved(
                    TransferRecord(
                        id = UUID.randomUUID().toString(),
                        fileId = handle.id,
                        direction = "receive",
                        peerName = "电脑浏览器",
                        fileName = handle.name,
                        size = written,
                        status = "success",
                        message = "从电脑上传",
                        timeMillis = System.currentTimeMillis(),
                        savedUri = uri,
                        mime = handle.mime,
                    ),
                )
            }

            override fun abort() {
                if (finished) return
                finished = true
                handle.abort()
            }
        }
    }

    private fun snapshot(): List {
        val found = LinkedHashMap()
        fun add(key: String, kind: Kind, name: String, size: Long, mime: String, idOverride: String? = null) {
            if (key.isBlank() || name.isBlank()) return
            val id = idOverride ?: WebIds.of(key)
            if (found.containsKey(id)) return
            found[id] = Stored(
                key = key,
                kind = kind,
                item = WebItem(id = id, name = name, size = size.coerceAtLeast(0L), mime = mime.ifBlank { "application/octet-stream" }),
            )
        }

        for (entry in shareOut.snapshot()) {
            val kind = when (entry.kind) {
                ShareOutKind.FILE -> Kind.FILE
                ShareOutKind.CONTENT -> Kind.CONTENT
            }
            add(entry.key, kind, entry.name, entry.size, entry.mime, entry.webId)
        }
        try {
            val tree = saveTreeUri()?.takeIf { it.isNotBlank() }
            val folder = when {
                tree != null -> listSaf(tree)
                Build.VERSION.SDK_INT >= 29 -> listMedia()
                else -> listAppDir()
            }
            folder.forEach { add(it.key, it.kind, it.name, it.size, it.mime) }
        } catch (_: Exception) {
        }
        for (record in history()) {
            if (record.status != "success") continue
            val saved = record.savedUri?.takeIf { it.isNotBlank() } ?: continue
            val kind = when {
                saved.startsWith("content:") -> Kind.CONTENT
                saved.startsWith("/") -> Kind.FILE
                else -> continue
            }
            add(saved, kind, record.fileName, record.size, record.mime)
        }
        return found.values.take(100).toList()
    }

    private fun listMedia(): List {
        if (Build.VERSION.SDK_INT ()
        val collection = MediaStore.Downloads.EXTERNAL_CONTENT_URI
        val projection = arrayOf(
            MediaStore.Downloads._ID,
            MediaStore.Downloads.DISPLAY_NAME,
            MediaStore.Downloads.SIZE,
            MediaStore.Downloads.MIME_TYPE,
        )
        val selection = "${MediaStore.Downloads.RELATIVE_PATH} LIKE ? AND ${MediaStore.Downloads.IS_PENDING}=0"
        val args = arrayOf("${Environment.DIRECTORY_DOWNLOADS}/局域网传%")
        context.contentResolver.query(
            collection,
            projection,
            selection,
            args,
            "${MediaStore.MediaColumns.DATE_MODIFIED} DESC",
        )?.use { cursor ->
            val idColumn = cursor.getColumnIndexOrThrow(MediaStore.Downloads._ID)
            val nameColumn = cursor.getColumnIndexOrThrow(MediaStore.Downloads.DISPLAY_NAME)
            val sizeColumn = cursor.getColumnIndexOrThrow(MediaStore.Downloads.SIZE)
            val mimeColumn = cursor.getColumnIndexOrThrow(MediaStore.Downloads.MIME_TYPE)
            while (cursor.moveToNext() && result.size  {
        val root = DocumentFile.fromTreeUri(context, Uri.parse(tree)) ?: return emptyList()
        return root.listFiles()
            .filter { it.isFile }
            .sortedByDescending { it.lastModified() }
            .take(100)
            .map { doc ->
                Located(
                    key = doc.uri.toString(),
                    kind = Kind.CONTENT,
                    name = doc.name ?: "未命名",
                    size = doc.length().coerceAtLeast(0L),
                    mime = doc.type ?: "application/octet-stream",
                )
            }
    }

    private fun listAppDir(): List {
        val base = context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS) ?: context.filesDir
        val dir = File(base, "局域网传")
        val files = dir.listFiles()?.filter { it.isFile }.orEmpty()
        return files.sortedByDescending { it.lastModified() }.take(100).map { file ->
            Located(file.absolutePath, Kind.FILE, file.name, file.length(), mimeFromName(file.name))
        }
    }

    private fun storedSize(stored: Stored): Long {
        return try {
            when (stored.kind) {
                Kind.FILE -> File(stored.key).length()
                Kind.CONTENT -> context.contentResolver.openFileDescriptor(Uri.parse(stored.key), "r")?.use { descriptor ->
                    if (descriptor.statSize >= 0L) descriptor.statSize else stored.item.size
                } ?: stored.item.size
            }
        } catch (_: Exception) {
            stored.item.size
        }
    }

    private fun mimeFromName(name: String): String {
        val ext = name.substringAfterLast('.', "")
        if (ext.isBlank() || ext == name) return "application/octet-stream"
        return MimeTypeMap.getSingleton().getMimeTypeFromExtension(ext.lowercase()) ?: "application/octet-stream"
    }

    private enum class Kind { FILE, CONTENT }

    private data class Located(
        val key: String,
        val kind: Kind,
        val name: String,
        val size: Long,
        val mime: String,
    )

    private data class Stored(
        val key: String,
        val kind: Kind,
        val item: WebItem,
    )
}

========== app/src/main/java/com/lanchuan/app/data/FileProbes.kt ==========
package com.lanchuan.app.data

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.OpenableColumns
import com.lanchuan.app.protocol.sanitizeFileName
import com.lanchuan.app.protocol.sanitizeMime
import com.lanchuan.app.transfer.OutgoingSource
import com.lanchuan.app.transfer.Peer
import java.io.File
import java.io.FileInputStream
import java.io.IOException
import java.io.InputStream
import java.util.UUID

data class OutgoingFileModel(
    val id: String,
    val uri: String,
    val name: String,
    val size: Long,
    val mime: String,
    val tempPath: String? = null,
)

data class SendDraft(
    val target: Peer? = null,
    val files: List = emptyList(),
)

fun OutgoingFileModel.toSource(context: Context): OutgoingSource {
    val app = context.applicationContext
    val parsed = Uri.parse(uri)
    val temp = tempPath
    return object : OutgoingSource {
        override val id = this@toSource.id
        override val name = this@toSource.name
        override val size = this@toSource.size
        override val mime = this@toSource.mime

        override fun open(): InputStream {
            if (temp != null) return FileInputStream(temp)
            try {
                return app.contentResolver.openInputStream(parsed)
                    ?: throw IOException("无法打开「$name」。请重新选择该文件。")
            } catch (error: SecurityException) {
                throw IOException("权限被拒绝，无法读取「$name」。请重新选择。")
            }
        }
    }
}

object FileProbes {
    fun describe(context: Context, uri: Uri): OutgoingFileModel {
        var name = "未命名"
        var size = -1L
        try {
            context.contentResolver.query(
                uri,
                arrayOf(OpenableColumns.DISPLAY_NAME, OpenableColumns.SIZE),
                null,
                null,
                null,
            )?.use { cursor ->
                if (cursor.moveToFirst()) {
                    val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                    val sizeIndex = cursor.getColumnIndex(OpenableColumns.SIZE)
                    if (nameIndex >= 0) name = cursor.getString(nameIndex) ?: name
                    if (sizeIndex >= 0 && !cursor.isNull(sizeIndex)) size = cursor.getLong(sizeIndex)
                }
            }
        } catch (error: SecurityException) {
            throw IOException("权限被拒绝，无法读取所选文件。")
        }
        name = sanitizeFileName(name)
        val mime = sanitizeMime(context.contentResolver.getType(uri) ?: "application/octet-stream")
        var tempPath: String? = null
        if (size
                temp.outputStream().use { output -> input.copyTo(output, 256 * 1024) }
            } ?: throw IOException("无法读取「$name」")
            size = temp.length()
            tempPath = temp.absolutePath
        }
        try {
            context.contentResolver.takePersistableUriPermission(uri, Intent.FLAG_GRANT_READ_URI_PERMISSION)
        } catch (_: Exception) {

        }
        return OutgoingFileModel(
            id = UUID.randomUUID().toString(),
            uri = uri.toString(),
            name = name,
            size = size,
            mime = mime,
            tempPath = tempPath,
        )
    }
}

========== app/src/main/java/com/lanchuan/app/data/HistoryStore.kt ==========
package com.lanchuan.app.data

import android.content.Context
import com.lanchuan.app.protocol.Protocol
import com.lanchuan.app.transfer.TransferRecord
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import kotlinx.serialization.builtins.ListSerializer
import java.io.File

class HistoryStore(context: Context) {
    private val file = File(context.filesDir, "history.json")
    private val mutex = Mutex()
    private val _items = MutableStateFlow>(emptyList())
    val items: StateFlow> = _items.asStateFlow()

    init {
        runBlocking(Dispatchers.IO) { load() }
    }

    suspend fun add(record: TransferRecord) = withContext(Dispatchers.IO) {
        mutex.withLock {
            _items.value = (listOf(record) + _items.value).take(200)
            persist()
        }
    }

    suspend fun remove(id: String) = withContext(Dispatchers.IO) {
        mutex.withLock {
            _items.value = _items.value.filterNot { it.id == id }
            persist()
        }
    }

    suspend fun clear() = withContext(Dispatchers.IO) {
        mutex.withLock {
            _items.value = emptyList()
            persist()
        }
    }

    private fun load() {
        if (!file.exists()) return
        try {
            val text = file.readText()
            if (text.isBlank()) return
            _items.value = Protocol.json.decodeFromString(ListSerializer(TransferRecord.serializer()), text)
        } catch (_: Exception) {
            file.renameTo(File(file.parentFile, "history.json.bak"))
            _items.value = emptyList()
        }
    }

    private fun persist() {
        val text = Protocol.json.encodeToString(ListSerializer(TransferRecord.serializer()), _items.value)
        file.writeText(text)
    }
}

========== app/src/main/java/com/lanchuan/app/data/SettingsStore.kt ==========
package com.lanchuan.app.data

import android.content.Context
import android.os.Build
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.lanchuan.app.protocol.Protocol
import com.lanchuan.app.protocol.sanitizeDisplay
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeout
import java.util.UUID

private val Context.settingsDataStore by preferencesDataStore(name = "lanchuan_settings")

data class UserSettings(
    val displayName: String = "",
    val deviceId: String = "",
    val port: Int = Protocol.DEFAULT_PORT,
    val saveTreeUri: String? = null,
)

class SettingsStore(private val context: Context) {
    private val nameKey = stringPreferencesKey("display_name")
    private val idKey = stringPreferencesKey("device_id")
    private val portKey = intPreferencesKey("port")
    private val treeKey = stringPreferencesKey("save_tree")
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val _settings = MutableStateFlow(UserSettings())
    val settings: StateFlow = _settings.asStateFlow()

    init {
        scope.launch {
            context.settingsDataStore.data.map { prefs ->
                UserSettings(
                    displayName = prefs[nameKey] ?: "",
                    deviceId = prefs[idKey] ?: "",
                    port = prefs[portKey] ?: Protocol.DEFAULT_PORT,
                    saveTreeUri = prefs[treeKey],
                )
            }.collect { loaded ->
                _settings.value = loaded
                if (loaded.deviceId.isBlank() || loaded.displayName.isBlank()) {
                    context.settingsDataStore.edit { prefs ->
                        if (prefs[idKey].isNullOrBlank()) prefs[idKey] = UUID.randomUUID().toString()
                        if (prefs[nameKey].isNullOrBlank()) prefs[nameKey] = defaultName()
                    }
                }
            }
        }
    }

    suspend fun awaitReady(): UserSettings {
        val ready = try {
            withTimeout(5_000) { settings.first { it.deviceId.isNotBlank() && it.displayName.isNotBlank() } }
        } catch (_: Exception) {
            val fallback = _settings.value.copy(
                deviceId = _settings.value.deviceId.ifBlank { UUID.randomUUID().toString() },
                displayName = _settings.value.displayName.ifBlank { defaultName() },
            )
            _settings.value = fallback
            fallback
        }
        return ready
    }

    suspend fun setDisplayName(name: String) {
        val clean = sanitizeDisplay(name)
        if (clean == "未知设备" && name.isBlank()) return
        context.settingsDataStore.edit { it[nameKey] = clean }
    }

    suspend fun setPort(port: Int) {
        context.settingsDataStore.edit { it[portKey] = port }
    }

    suspend fun setSaveTree(uri: String?) {
        context.settingsDataStore.edit { prefs ->
            if (uri.isNullOrBlank()) prefs.remove(treeKey) else prefs[treeKey] = uri
        }
    }

    private fun defaultName(): String {
        val model = Build.MODEL?.trim().orEmpty()
        if (model.isBlank() || model.equals("unknown", ignoreCase = true)) return "Android 设备"
        return sanitizeDisplay(model)
    }
}

========== app/src/main/java/com/lanchuan/app/data/ShareOutStore.kt ==========
package com.lanchuan.app.data

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Environment
import com.lanchuan.app.web.WebIds
import com.lanchuan.app.web.WebItem
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.io.File
import java.io.FileInputStream
import java.io.InputStream
import java.util.UUID
import java.util.concurrent.CopyOnWriteArrayList

class ShareOutStore(private val context: Context) {
    private val entries = CopyOnWriteArrayList()
    private val _count = MutableStateFlow(0)
    val count: StateFlow = _count.asStateFlow()

    fun snapshot(): List = entries.toList()

    fun add(models: List) {
        if (models.isEmpty()) return
        for (model in models) {
            val existing = entries.firstOrNull { it.uri == model.uri || it.id == model.id }
            if (existing != null) continue
            val entry = materialize(model) ?: continue
            entries.add(0, entry)
        }
        while (entries.size > 100) {
            val removed = entries.removeAt(entries.lastIndex)
            cleanup(removed)
        }
        _count.value = entries.size
    }

    fun clear() {
        val old = entries.toList()
        entries.clear()
        _count.value = 0
        old.forEach { cleanup(it) }
    }

    fun open(id: String): Pair? {
        val entry = entries.firstOrNull { it.webId == id } ?: return null
        val stream = try {
            when (entry.kind) {
                ShareOutKind.FILE -> FileInputStream(entry.key)
                ShareOutKind.CONTENT -> context.contentResolver.openInputStream(Uri.parse(entry.key))
            }
        } catch (_: Exception) {
            null
        } ?: return null
        return entry to stream
    }

    private fun materialize(model: OutgoingFileModel): ShareOutEntry? {
        val temp = model.tempPath
        if (temp != null) {
            val copied = copyIntoShareDir(File(temp), model.name) ?: return null
            return ShareOutEntry(
                id = model.id,
                webId = WebIds.of("shareout:file:${copied.absolutePath}"),
                key = copied.absolutePath,
                uri = model.uri,
                kind = ShareOutKind.FILE,
                name = model.name,
                size = copied.length().coerceAtLeast(0L),
                mime = model.mime,
                ownedCopy = true,
            )
        }
        val uri = Uri.parse(model.uri)
        try {
            context.contentResolver.takePersistableUriPermission(uri, Intent.FLAG_GRANT_READ_URI_PERMISSION)
        } catch (_: Exception) {
        }

        val canOpen = try {
            context.contentResolver.openInputStream(uri)?.use { true } ?: false
        } catch (_: Exception) {
            false
        }
        if (!canOpen) {
            val copied = copyUriIntoShareDir(uri, model.name) ?: return null
            return ShareOutEntry(
                id = model.id,
                webId = WebIds.of("shareout:file:${copied.absolutePath}"),
                key = copied.absolutePath,
                uri = model.uri,
                kind = ShareOutKind.FILE,
                name = model.name,
                size = copied.length().coerceAtLeast(0L),
                mime = model.mime,
                ownedCopy = true,
            )
        }
        return ShareOutEntry(
            id = model.id.ifBlank { UUID.randomUUID().toString() },
            webId = WebIds.of("shareout:content:${model.uri}"),
            key = model.uri,
            uri = model.uri,
            kind = ShareOutKind.CONTENT,
            name = model.name,
            size = model.size.coerceAtLeast(0L),
            mime = model.mime,
            ownedCopy = false,
        )
    }

    private fun copyUriIntoShareDir(uri: Uri, name: String): File? {
        return try {
            val dir = shareDir()
            val target = uniqueFile(dir, name)
            context.contentResolver.openInputStream(uri)?.use { input ->
                target.outputStream().use { output -> input.copyTo(output, 256 * 1024) }
            } ?: return null
            target
        } catch (_: Exception) {
            null
        }
    }

    private fun copyIntoShareDir(source: File, name: String): File? {
        return try {
            if (!source.isFile) return null
            val dir = shareDir()
            val target = uniqueFile(dir, name)
            source.inputStream().use { input ->
                target.outputStream().use { output -> input.copyTo(output, 256 * 1024) }
            }
            target
        } catch (_: Exception) {
            null
        }
    }

    private fun shareDir(): File {
        val base = context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS) ?: context.filesDir
        val dir = File(base, "待电脑下载")
        if (!dir.exists()) dir.mkdirs()
        return dir
    }

    private fun uniqueFile(dir: File, name: String): File {
        val safe = name.ifBlank { "未命名" }
        var candidate = File(dir, safe)
        if (!candidate.exists()) return candidate
        val stem = safe.substringBeforeLast('.', missingDelimiterValue = safe)
        val ext = if (safe.contains('.')) ".${safe.substringAfterLast('.')}" else ""
        var index = 1
        while (true) {
            candidate = File(dir, "$stem ($index)$ext")
            if (!candidate.exists()) return candidate
            index += 1
        }
    }

    private fun cleanup(entry: ShareOutEntry) {
        if (!entry.ownedCopy) return
        runCatching { File(entry.key).delete() }
    }
}

enum class ShareOutKind { FILE, CONTENT }

data class ShareOutEntry(
    val id: String,
    val webId: String,
    val key: String,
    val uri: String,
    val kind: ShareOutKind,
    val name: String,
    val size: Long,
    val mime: String,
    val ownedCopy: Boolean,
) {
    fun toWebItem(): WebItem = WebItem(
        id = webId,
        name = name,
        size = size,
        mime = mime.ifBlank { "application/octet-stream" },
    )
}

========== app/src/main/java/com/lanchuan/app/data/TransferRepository.kt ==========
package com.lanchuan.app.data

import android.content.Context
import android.content.Intent
import android.net.ConnectivityManager
import android.net.Network
import android.net.Uri
import android.net.wifi.WifiManager
import android.os.PowerManager
import androidx.core.content.ContextCompat
import com.lanchuan.app.LLog
import com.lanchuan.app.discovery.NsdController
import com.lanchuan.app.net.NetInfo
import com.lanchuan.app.net.NetKind
import com.lanchuan.app.protocol.sanitizeDisplay
import com.lanchuan.app.service.ListenService
import com.lanchuan.app.service.Notifier
import com.lanchuan.app.web.WebShare
import com.lanchuan.app.web.WebShareServer
import com.lanchuan.app.transfer.ActiveTransfer
import com.lanchuan.app.transfer.Decision
import com.lanchuan.app.transfer.Direction
import com.lanchuan.app.transfer.Errors
import com.lanchuan.app.transfer.Identity
import com.lanchuan.app.transfer.Peer
import com.lanchuan.app.transfer.PendingOffer
import com.lanchuan.app.transfer.Phase
import com.lanchuan.app.transfer.TransferClient
import com.lanchuan.app.transfer.TransferEvents
import com.lanchuan.app.transfer.TransferRecord
import com.lanchuan.app.transfer.TransferServer
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.util.concurrent.atomic.AtomicReference

class TransferRepository(context: Context) {
    private val app = context.applicationContext
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
    private val settingsStore = SettingsStore(app)
    private val historyStore = HistoryStore(app)
    private val incoming = AndroidReceiveStore(app) { settingsStore.settings.value.saveTreeUri }
    private val shareOut = ShareOutStore(app)
    private val confirmSlot = AtomicReference?>(null)
    private var rawPeers: List = emptyList()
    private var discovering = false
    private var userWantsListen = false
    private var userWantsWeb = false
    private var transferWake = false
    private var webWake = false
    private var stopService: (() -> Unit)? = null
    private var sendJob: Job? = null

    @Volatile
    var uiVisible: Boolean = false
        private set

    val settings = settingsStore.settings
    val history = historyStore.items
    private val _peers = MutableStateFlow(emptyList())
    val peers: StateFlow = _peers.asStateFlow()
    private val _listening = MutableStateFlow(false)
    val listening: StateFlow = _listening.asStateFlow()
    private val _listenError = MutableStateFlow(null)
    val listenError: StateFlow = _listenError.asStateFlow()
    private val _webEnabled = MutableStateFlow(false)
    val webEnabled: StateFlow = _webEnabled.asStateFlow()
    private val _webError = MutableStateFlow(null)
    val webError: StateFlow = _webError.asStateFlow()
    private val _discoveryError = MutableStateFlow(null)
    val discoveryError: StateFlow = _discoveryError.asStateFlow()
    private val _primaryIp = MutableStateFlow(null)
    val primaryIp: StateFlow = _primaryIp.asStateFlow()
    private val _extraIps = MutableStateFlow>(emptyList())
    val extraIps: StateFlow> = _extraIps.asStateFlow()
    private val _netKind = MutableStateFlow(NetKind.NONE)
    val netKind: StateFlow = _netKind.asStateFlow()
    private val _pendingOffer = MutableStateFlow(null)
    val pendingOffer: StateFlow = _pendingOffer.asStateFlow()
    private val _active = MutableStateFlow(null)
    val active: StateFlow = _active.asStateFlow()
    private val _draft = MutableStateFlow(SendDraft())
    val draft: StateFlow = _draft.asStateFlow()
    private val _toasts = MutableSharedFlow(extraBufferCapacity = 8)
    val toasts = _toasts.asSharedFlow()
    val shareOutCount = shareOut.count

    private val events = object : TransferEvents {
        override fun onProgress(active: ActiveTransfer) {
            _active.value = active
            val moving = active.phase == Phase.WAITING || active.phase == Phase.TRANSFERRING
            transferWake = moving
            applyWake()
            if (moving) {
                Notifier.showProgress(app, active)
            } else {
                Notifier.clearProgress(app)
                if (!uiVisible) Notifier.showResult(app, active)
            }
        }

        override fun onFileFinished(record: TransferRecord) {
            scope.launch { historyStore.add(record) }
        }

        override fun onLog(message: String) {
            LLog.i(message)
        }
    }

    private val server = TransferServer(
        identity = { currentIdentity() },
        store = incoming,
        confirm = { offer -> confirm(offer) },
        events = events,
        log = { LLog.i(it) },
    )
    private val client = TransferClient(identity = { currentIdentity() }, events = events)
    private val webCatalog = AndroidWebCatalog(
        context = app,
        uploads = incoming,
        shareOut = shareOut,
        saveTreeUri = { settingsStore.settings.value.saveTreeUri },
        history = { historyStore.items.value },
        onSaved = { record -> scope.launch { historyStore.add(record) } },
    )
    private val webServer = WebShareServer(
        catalog = webCatalog,
        onBusy = { busy ->
            webWake = busy
            applyWake()
        },
        log = { LLog.i(it) },
    )

    private val nsd = NsdController(
        context = app,
        onPeers = { found ->
            rawPeers = found
            publishPeers()
        },
        onDiscoveryMessage = { message -> _discoveryError.value = message },
        onRegisterMessage = { message ->
            if (message != null) _listenError.value = message
        },
    )

    private val multicastLock: WifiManager.MulticastLock? = try {
        val wifi = app.getSystemService(WifiManager::class.java)
        wifi?.createMulticastLock("lanchuan")?.apply { setReferenceCounted(false) }
    } catch (error: Exception) {
        LLog.w("无法创建组播锁", error)
        null
    }

    private val wakeLock: PowerManager.WakeLock? = try {
        val power = app.getSystemService(PowerManager::class.java)
        power?.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "lanchuan:transfer")?.apply {
            setReferenceCounted(false)
        }
    } catch (error: Exception) {
        LLog.w("无法创建唤醒锁", error)
        null
    }

    init {
        refreshNetwork()
        val manager = app.getSystemService(ConnectivityManager::class.java)
        try {
            manager?.registerDefaultNetworkCallback(object : ConnectivityManager.NetworkCallback() {
                override fun onAvailable(network: Network) = refreshNetwork()
                override fun onLost(network: Network) = refreshNetwork()
                override fun onLinkPropertiesChanged(network: Network, linkProperties: android.net.LinkProperties) {
                    refreshNetwork()
                }
            })
        } catch (error: Exception) {
            LLog.w("无法监听网络变化", error)
        }
    }

    fun postMessage(message: String) {
        _toasts.tryEmit(message)
    }

    fun listenLabel(): String {
        val ip = _primaryIp.value
        val parts = ArrayList()
        if (userWantsListen || _listening.value) {
            val port = settings.value.port
            parts += if (ip.isNullOrBlank()) "手机端口 $port" else "手机 $ip:$port"
        }
        if (userWantsWeb || _webEnabled.value) {
            parts += if (ip.isNullOrBlank()) "网页端口 ${WebShare.PORT}" else "网页 http://$ip:${WebShare.PORT}/"
        }
        return parts.joinToString(" · ").ifBlank { "局域网传" }
    }

    fun webUrl(): String? {
        val ip = _primaryIp.value ?: return null
        return "http://$ip:${WebShare.PORT}/"
    }

    fun setUiVisible(visible: Boolean) {
        uiVisible = visible
        val offer = _pendingOffer.value
        if (!visible && offer != null) Notifier.showIncoming(app, offer)
        if (visible) Notifier.clearIncoming(app)
    }

    fun refreshNetwork() {
        val snapshot = NetInfo.snapshot(app)
        val changed = snapshot.primary != _primaryIp.value
        _primaryIp.value = snapshot.primary
        _extraIps.value = snapshot.extras
        _netKind.value = snapshot.kind
        publishPeers()
        if (changed && (userWantsListen || userWantsWeb)) {
            if (userWantsListen) {
                val current = settings.value
                if (current.deviceId.isNotBlank()) {
                    nsd.register(current.port, current.deviceId, current.displayName)
                }
            }
            Notifier.showListening(app, listenLabel())
        }
    }

    fun startDiscovery() {
        discovering = true
        updateMulticast()
        scope.launch(Dispatchers.IO) {
            val ready = settingsStore.awaitReady()
            nsd.startDiscovery(ready.deviceId)
        }
    }

    fun restartDiscovery() {
        discovering = true
        updateMulticast()
        scope.launch(Dispatchers.IO) {
            val ready = settingsStore.awaitReady()
            nsd.restartDiscovery(ready.deviceId)
        }
    }

    fun stopDiscovery() {
        discovering = false
        nsd.stopBrowsing()
        updateMulticast()
    }

    fun startListening() {
        userWantsListen = true
        _listening.value = true
        _listenError.value = null
        if (!ensureService()) {
            userWantsListen = false
            _listening.value = false
            _listenError.value = "无法启动接收服务，请重试。"
        }
    }

    fun stopListening() {
        userWantsListen = false
        confirmSlot.get()?.complete(Decision.Reject("已停止接收"))
        server.cancelSession()
        server.stop()
        nsd.unregister()
        _listening.value = false
        val current = _active.value
        if (current?.direction == Direction.RECEIVE &&
            (current.phase == Phase.WAITING || current.phase == Phase.TRANSFERRING)
        ) {
            _active.value = current.copy(phase = Phase.CANCELLED, message = "已停止接收")
        }
        Notifier.clearProgress(app)
        if (userWantsWeb) {
            Notifier.showListening(app, listenLabel())
        } else {
            app.stopService(Intent(app, ListenService::class.java))
        }
        updateMulticast()
    }

    fun startWeb() {
        userWantsWeb = true
        _webEnabled.value = true
        _webError.value = null
        if (!ensureService()) {
            userWantsWeb = false
            _webEnabled.value = false
            _webError.value = "无法启动网页互传，请重试。"
        }
    }

    fun stopWeb() {
        userWantsWeb = false
        webServer.stop()
        _webEnabled.value = false
        if (userWantsListen) {
            Notifier.showListening(app, listenLabel())
        } else {
            app.stopService(Intent(app, ListenService::class.java))
        }
    }

    fun stopFromNotification() {
        userWantsWeb = false
        webServer.stop()
        _webEnabled.value = false
        stopListening()
    }

    fun onListenServiceStarted(stop: () -> Unit) {
        stopService = stop
        if (userWantsListen) bindListener()
        if (userWantsWeb) bindWeb()
        if (!userWantsListen && !userWantsWeb) stop()
    }

    fun onListenServiceDestroyed() {
        stopService = null
        val wantedListen = userWantsListen
        val wantedWeb = userWantsWeb
        server.stop()
        webServer.stop()
        nsd.unregister()
        userWantsListen = false
        userWantsWeb = false
        _listening.value = false
        _webEnabled.value = false
        if (wantedListen) _listenError.value = "接收服务已停止。请重新打开接收。"
        if (wantedWeb) _webError.value = "网页互传已停止。请重新打开。"
        updateMulticast()
    }

    fun acceptPending() {
        confirmSlot.get()?.complete(Decision.Accept)
    }

    fun rejectPending() {
        confirmSlot.get()?.complete(Decision.Reject("用户拒绝接收"))
    }

    fun cancelTransfer() {
        confirmSlot.get()?.complete(Decision.Reject("已取消传输"))
        client.cancel()
        server.cancelSession()
    }

    fun dismissActive() {
        val current = _active.value ?: return
        if (current.phase == Phase.WAITING || current.phase == Phase.TRANSFERRING) return
        _active.value = null
    }

    fun selectTarget(peer: Peer) {
        _draft.value = _draft.value.copy(target = peer)
    }

    fun selectManual(host: String, port: Int) {
        _draft.value = _draft.value.copy(
            target = Peer(deviceId = "manual:$host:$port", name = host, host = host, port = port),
        )
    }

    fun onFilesPicked(uris: List) {
        if (uris.isEmpty()) return
        scope.launch(Dispatchers.IO) {
            val picked = ArrayList()
            var firstError: String? = null
            for (uri in uris) {
                try {
                    picked += FileProbes.describe(app, uri)
                } catch (error: Exception) {
                    if (firstError == null) firstError = Errors.humanize(error)
                }
            }
            if (picked.isNotEmpty()) replaceFiles(picked)
            if (firstError != null) postMessage(firstError)
            if (picked.isEmpty() && firstError == null) postMessage("没有选中文件")
        }
    }

    fun onShareOutPicked(uris: List) {
        if (uris.isEmpty()) return
        scope.launch(Dispatchers.IO) {
            val picked = ArrayList()
            var firstError: String? = null
            for (uri in uris) {
                try {
                    picked += FileProbes.describe(app, uri)
                } catch (error: Exception) {
                    if (firstError == null) firstError = Errors.humanize(error)
                }
            }
            if (picked.isNotEmpty()) {
                val before = shareOut.count.value
                shareOut.add(picked)
                val added = (shareOut.count.value - before).coerceAtLeast(0)

                picked.mapNotNull { it.tempPath }.forEach { path -> runCatching { File(path).delete() } }
                if (added > 0) {
                    postMessage("已加入 $added 个文件，电脑刷新网页即可下载")
                } else {
                    postMessage(firstError ?: "无法准备所选文件")
                }
            }
            if (firstError != null) postMessage(firstError)
            if (picked.isEmpty() && firstError == null) postMessage("没有选中文件")
        }
    }

    fun clearShareOut() {
        shareOut.clear()
        postMessage("已清空待电脑下载的文件")
    }

    fun removeFile(id: String) {
        val removed = _draft.value.files.firstOrNull { it.id == id }
        _draft.value = _draft.value.copy(files = _draft.value.files.filterNot { it.id == id })
        removed?.tempPath?.let { path -> runCatching { File(path).delete() } }
    }

    fun startSend() {
        val draft = _draft.value
        val target = draft.target
        if (target == null) {
            postMessage("请先选择设备，或输入 IP")
            return
        }
        if (draft.files.isEmpty()) {
            postMessage("请先选择文件")
            return
        }
        if (isBusy()) {
            postMessage("当前有传输正在进行")
            return
        }
        val models = draft.files
        sendJob?.cancel()
        sendJob = scope.launch(Dispatchers.IO) {
            try {
                val outcome = client.send(target, models.map { it.toSource(app) })
                if (outcome.phase == Phase.SUCCESS) {
                    models.mapNotNull { it.tempPath }.forEach { path -> runCatching { File(path).delete() } }
                    _draft.update { current ->
                        if (current.files.map { it.id } == models.map { it.id }) {
                            current.copy(files = emptyList())
                        } else {
                            current
                        }
                    }
                }
            } finally {
                transferWake = false
                applyWake()
            }
        }
    }

    fun updateName(name: String) {
        if (name.trim().isEmpty()) {
            postMessage("名称不能为空")
            return
        }
        scope.launch(Dispatchers.IO) {
            settingsStore.setDisplayName(name)
            val ready = settingsStore.awaitReady()
            if (_listening.value) nsd.register(ready.port, ready.deviceId, ready.displayName)
        }
    }

    fun updatePort(port: Int) {
        if (port !in 1024..65535) {
            postMessage("请使用 1024–65535 之间的端口")
            return
        }
        scope.launch(Dispatchers.IO) {
            settingsStore.setPort(port)
            if (userWantsListen) bindListener()
        }
    }

    fun setSaveTree(uri: Uri) {
        val flags = Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION
        try {
            app.contentResolver.takePersistableUriPermission(uri, flags)
        } catch (_: SecurityException) {
            postMessage("没有拿到文件夹权限，请重试")
            return
        }
        scope.launch(Dispatchers.IO) {
            settingsStore.setSaveTree(uri.toString())
            postMessage("已改用所选文件夹保存")
        }
    }

    fun clearSaveTree() {
        val old = settings.value.saveTreeUri
        scope.launch(Dispatchers.IO) {
            settingsStore.setSaveTree(null)
            if (!old.isNullOrBlank()) {
                val flags = Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION
                try {
                    app.contentResolver.releasePersistableUriPermission(Uri.parse(old), flags)
                } catch (_: Exception) {
                }
            }
            postMessage("已恢复默认保存位置")
        }
    }

    fun deleteRecord(id: String) {
        scope.launch { historyStore.remove(id) }
    }

    fun clearHistory() {
        scope.launch { historyStore.clear() }
    }

    fun discardPartial(fileId: String) {
        incoming.discard(fileId)
        postMessage("已删除未完成的临时文件")
    }

    private fun bindListener() {
        scope.launch(Dispatchers.IO) {
            val ready = settingsStore.awaitReady()
            val error = server.start(ready.port)
            if (error != null) {
                userWantsListen = false
                _listening.value = false
                _listenError.value = error
                nsd.unregister()
                if (!userWantsWeb) {
                    withContext(Dispatchers.Main) { stopService?.invoke() }
                } else {
                    Notifier.showListening(app, listenLabel())
                }
                updateMulticast()
                return@launch
            }
            nsd.register(ready.port, ready.deviceId, ready.displayName)
            _listening.value = true
            _listenError.value = null
            updateMulticast()
            Notifier.showListening(app, listenLabel())
        }
    }

    private suspend fun confirm(offer: PendingOffer): Decision {
        val deferred = CompletableDeferred()
        confirmSlot.set(deferred)
        _pendingOffer.value = offer
        if (!uiVisible) Notifier.showIncoming(app, offer)
        return try {
            deferred.await()
        } finally {
            confirmSlot.compareAndSet(deferred, null)
            _pendingOffer.value = null
            Notifier.clearIncoming(app)
        }
    }

    private fun currentIdentity(): Identity {
        val current = settings.value
        return Identity(
            id = current.deviceId.ifBlank { "device" },
            name = sanitizeDisplay(current.displayName.ifBlank { "Android 设备" }),
        )
    }

    private fun publishPeers() {
        val selfId = settings.value.deviceId
        val mine = buildSet {
            _primaryIp.value?.let { add(it) }
            addAll(_extraIps.value)
        }
        _peers.value = rawPeers
            .filter { peer -> peer.deviceId != selfId && peer.host !in mine }
            .distinctBy { peer -> peer.deviceId.ifBlank { "${peer.host}:${peer.port}" } }
            .sortedBy { it.name.lowercase() }
    }

    private fun replaceFiles(files: List) {
        val old = _draft.value.files
        _draft.value = _draft.value.copy(files = files)
        old.mapNotNull { it.tempPath }.forEach { path -> runCatching { File(path).delete() } }
    }

    private fun isBusy(): Boolean {
        val phase = _active.value?.phase ?: return false
        return phase == Phase.WAITING || phase == Phase.TRANSFERRING
    }

    private fun bindWeb() {
        scope.launch(Dispatchers.IO) {
            val error = webServer.start(WebShare.PORT)
            if (!userWantsWeb) {
                webServer.stop()
                return@launch
            }
            if (error != null) {
                userWantsWeb = false
                _webEnabled.value = false
                _webError.value = error
                if (!userWantsListen) {
                    withContext(Dispatchers.Main) { stopService?.invoke() }
                }
                return@launch
            }
            _webEnabled.value = true
            _webError.value = null
            Notifier.showListening(app, listenLabel())
        }
    }

    private fun ensureService(): Boolean {
        return try {
            ContextCompat.startForegroundService(app, Intent(app, ListenService::class.java))
            true
        } catch (error: Exception) {
            LLog.w("启动前台服务失败", error)
            false
        }
    }

    private fun updateMulticast() {
        val lock = multicastLock ?: return
        val need = discovering || _listening.value
        try {
            if (need && !lock.isHeld) lock.acquire()
            if (!need && lock.isHeld) lock.release()
        } catch (error: Exception) {
            LLog.w("组播锁失败", error)
        }
    }

    private fun applyWake() {
        val lock = wakeLock ?: return
        synchronized(lock) {
            val hold = transferWake || webWake
            try {
                if (hold && !lock.isHeld) lock.acquire(6L * 60L * 60L * 1000L)
                if (!hold && lock.isHeld) lock.release()
            } catch (error: Exception) {
                LLog.w("唤醒锁失败", error)
            }
        }
    }
}

========== app/src/main/java/com/lanchuan/app/discovery/NsdController.kt ==========
package com.lanchuan.app.discovery

import android.content.Context
import android.net.nsd.NsdManager
import android.net.nsd.NsdServiceInfo
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Base64
import com.lanchuan.app.protocol.Protocol
import com.lanchuan.app.protocol.sanitizeDisplay
import com.lanchuan.app.protocol.shortCode
import com.lanchuan.app.transfer.Peer
import java.net.Inet4Address

class NsdController(
    context: Context,
    private val onPeers: (List) -> Unit,
    private val onDiscoveryMessage: (String?) -> Unit,
    private val onRegisterMessage: (String?) -> Unit,
) {
    private val nsd = context.applicationContext.getSystemService(NsdManager::class.java)
    private val main = Handler(Looper.getMainLooper())
    private val peers = LinkedHashMap()
    private val resolveQueue = ArrayDeque()
    private var resolving = false
    private var discoveryListener: NsdManager.DiscoveryListener? = null
    private var registerListener: NsdManager.RegistrationListener? = null
    private var restartWhenStopped = false
    private var selfId: String = ""
    private var resolveGeneration = 0

    fun startDiscovery(deviceId: String) {
        main.post {
            selfId = deviceId
            if (discoveryListener != null) return@post
            startDiscoveryOnMain()
        }
    }

    fun restartDiscovery(deviceId: String) {
        main.post {
            selfId = deviceId
            val listener = discoveryListener
            if (listener == null || nsd == null) {
                startDiscoveryOnMain()
                return@post
            }
            restartWhenStopped = true
            try {
                haltDiscovery(nsd, listener)
            } catch (_: Exception) {
                restartWhenStopped = false
                discoveryListener = null
                startDiscoveryOnMain()
            }
        }
    }

    fun stopBrowsing() {
        main.post {
            restartWhenStopped = false
            val listener = discoveryListener ?: return@post
            discoveryListener = null
            try {
                val manager = nsd
                if (manager != null) haltDiscovery(manager, listener)
            } catch (_: Exception) {
            }
            peers.clear()
            resolveQueue.clear()
            resolving = false
            publish()
        }
    }

    fun register(port: Int, deviceId: String, displayName: String) {
        main.post {
            selfId = deviceId
            unregisterOnMain()
            val manager = nsd
            if (manager == null) {
                onRegisterMessage("这台设备不支持局域网发现，别人需要用 IP 连接你。")
                return@post
            }
            val listener = object : NsdManager.RegistrationListener {
                override fun onServiceRegistered(info: NsdServiceInfo) {
                    onRegisterMessage(null)
                }

                override fun onRegistrationFailed(info: NsdServiceInfo, errorCode: Int) {
                    onRegisterMessage("无法广播本机（错误 $errorCode）。别人可能搜不到你，但仍可以用 IP 连接。")
                }

                override fun onServiceUnregistered(info: NsdServiceInfo) = Unit

                override fun onUnregistrationFailed(info: NsdServiceInfo, errorCode: Int) = Unit
            }
            registerListener = listener
            val info = NsdServiceInfo().apply {
                serviceName = "LC-${shortCode(deviceId)}"
                serviceType = Protocol.SERVICE_TYPE
                this.port = port
            }
            try {
                info.setAttribute("id", deviceId.take(80))
                info.setAttribute("nm", encodeName(sanitizeDisplay(displayName)))
            } catch (_: Exception) {

            }
            try {
                manager.registerService(info, NsdManager.PROTOCOL_DNS_SD, listener)
            } catch (error: Exception) {
                registerListener = null
                onRegisterMessage("无法广播本机：${error.message ?: "未知错误"}。请改用 IP 连接。")
            }
        }
    }

    fun unregister() {
        main.post { unregisterOnMain() }
    }

    fun release() {
        main.post {
            restartWhenStopped = false
            val discovery = discoveryListener
            discoveryListener = null
            if (discovery != null) {
                try {
                    val manager = nsd
                    if (manager != null) haltDiscovery(manager, discovery)
                } catch (_: Exception) {
                }
            }
            unregisterOnMain()
            peers.clear()
            publish()
        }
    }

    private fun haltDiscovery(manager: NsdManager, listener: NsdManager.DiscoveryListener) {
        if (Build.VERSION.SDK_INT >= 34) {
            manager.stopServiceDiscovery(listener)
            return
        }
        val method = NsdManager::class.java.getMethod(
            "stopDiscovery",
            NsdManager.DiscoveryListener::class.java,
        )
        method.invoke(manager, listener)
    }

    private fun unregisterOnMain() {
        val listener = registerListener ?: return
        registerListener = null
        try {
            nsd?.unregisterService(listener)
        } catch (_: Exception) {
        }
    }

    private fun startDiscoveryOnMain() {
        val manager = nsd
        if (manager == null) {
            onDiscoveryMessage("这台设备不支持局域网发现，请用 IP 手动连接。")
            return
        }
        resolveGeneration++
        resolving = false
        resolveQueue.clear()
        peers.clear()
        publish()
        val listener = object : NsdManager.DiscoveryListener {
            override fun onDiscoveryStarted(serviceType: String) {
                onDiscoveryMessage(null)
            }

            override fun onServiceFound(serviceInfo: NsdServiceInfo) {
                if (serviceInfo.serviceType?.contains("_lanchuan._tcp") != true) return
                enqueue(serviceInfo)
            }

            override fun onServiceLost(serviceInfo: NsdServiceInfo) {
                peers.remove(serviceInfo.serviceName)
                publish()
            }

            override fun onDiscoveryStopped(serviceType: String) {
                discoveryListener = null
                if (restartWhenStopped) {
                    restartWhenStopped = false
                    startDiscoveryOnMain()
                }
            }

            override fun onStartDiscoveryFailed(serviceType: String, errorCode: Int) {
                discoveryListener = null
                onDiscoveryMessage(discoveryFailure(errorCode))
            }

            override fun onStopDiscoveryFailed(serviceType: String, errorCode: Int) {
                discoveryListener = null
                if (restartWhenStopped) {
                    restartWhenStopped = false
                    startDiscoveryOnMain()
                }
            }
        }
        discoveryListener = listener
        try {
            manager.discoverServices(Protocol.SERVICE_TYPE, NsdManager.PROTOCOL_DNS_SD, listener)
        } catch (error: Exception) {
            discoveryListener = null
            onDiscoveryMessage("无法开始搜索：${error.message ?: "未知错误"}。请用 IP 手动连接。")
        }
    }

    private fun enqueue(info: NsdServiceInfo) {
        resolveQueue.add(info)
        if (resolving) return
        resolving = true
        resolveNext(resolveGeneration)
    }

    @Suppress("DEPRECATION")
    private fun resolveNext(generation: Int) {
        if (generation != resolveGeneration) return
        val manager = nsd
        val next = resolveQueue.removeFirstOrNull()
        if (manager == null || next == null) {
            resolving = false
            return
        }
        try {
            manager.resolveService(next, object : NsdManager.ResolveListener {
                override fun onResolveFailed(serviceInfo: NsdServiceInfo, errorCode: Int) {
                    main.post { resolveNext(generation) }
                }

                override fun onServiceResolved(serviceInfo: NsdServiceInfo) {
                    if (generation == resolveGeneration) remember(serviceInfo)
                    main.post { resolveNext(generation) }
                }
            })
        } catch (_: Exception) {

            main.post { resolveNext(generation) }
        }
    }

    private fun remember(info: NsdServiceInfo) {
        val host = info.bestHost() ?: return
        if (info.port  "系统发现服务出错。可改用 IP 手动连接。"
        NsdManager.FAILURE_ALREADY_ACTIVE -> "设备发现已在进行。"
        NsdManager.FAILURE_MAX_LIMIT -> "发现请求过多，请稍后再试。也可改用 IP 手动连接。"
        else -> "设备发现失败（错误 $code）。如果路由器屏蔽了组播，请改用 IP 手动连接。"
    }

    private fun encodeName(name: String): String {
        return Base64.encodeToString(
            name.toByteArray(Charsets.UTF_8),
            Base64.URL_SAFE or Base64.NO_WRAP or Base64.NO_PADDING,
        )
    }

    private fun decodeName(raw: String?): String? {
        if (raw.isNullOrBlank()) return null
        return try {
            val bytes = Base64.decode(raw, Base64.URL_SAFE or Base64.NO_WRAP or Base64.NO_PADDING)
            val text = String(bytes, Charsets.UTF_8).trim()
            if (text.isBlank() || text.any { it.code = 34) {
        val addresses = hostAddresses
        val ipv4 = addresses.firstOrNull { it is Inet4Address && !it.isLoopbackAddress }
        val any = addresses.firstOrNull { !it.isLoopbackAddress }
        return (ipv4 ?: any)?.hostAddress?.substringBefore('%')
    }
    val resolved = host ?: return null
    if (resolved.isLoopbackAddress) return null
    return resolved.hostAddress?.substringBefore('%')
}

========== app/src/main/java/com/lanchuan/app/LanchuanApp.kt ==========
package com.lanchuan.app

import android.app.Application
import com.lanchuan.app.data.TransferRepository
import com.lanchuan.app.service.Notifier

class LanchuanApp : Application() {
    lateinit var repository: TransferRepository
        private set

    override fun onCreate() {
        super.onCreate()
        Notifier.ensureChannels(this)
        repository = TransferRepository(this)
    }
}

========== app/src/main/java/com/lanchuan/app/LLog.kt ==========
package com.lanchuan.app

import android.util.Log

internal object LLog {
    private const val TAG = "Lanchuan"

    fun i(message: String) {
        Log.i(TAG, message)
    }

    fun w(message: String, error: Throwable? = null) {
        if (error == null) Log.w(TAG, message) else Log.w(TAG, message, error)
    }
}

========== app/src/main/java/com/lanchuan/app/MainActivity.kt ==========
package com.lanchuan.app

import android.Manifest
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import com.lanchuan.app.ui.AppScaffold
import com.lanchuan.app.ui.LanchuanViewModel
import com.lanchuan.app.ui.UiEvent
import com.lanchuan.app.ui.theme.LanchuanTheme
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.launch
import kotlinx.coroutines.yield

class MainActivity : ComponentActivity() {
    private val viewModel: LanchuanViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            val snackbar = remember { SnackbarHostState() }
            val notifLauncher = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
                viewModel.onNotificationResult(granted)
            }
            val nearbyLauncher = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) {
                viewModel.refreshPermissions()
            }
            val treeLauncher = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocumentTree()) { uri ->
                if (uri != null) viewModel.setSaveTree(uri)
            }
            LaunchedEffect(Unit) {
                launch {
                    viewModel.toasts.collect { message -> snackbar.showSnackbar(message) }
                }
                launch {
                    viewModel.events.collect { event ->
                        when (event) {
                            UiEvent.RequestNotifications ->
                                notifLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
                            UiEvent.RequestNearby ->
                                if (Build.VERSION.SDK_INT >= 33) {
                                    nearbyLauncher.launch(Manifest.permission.NEARBY_WIFI_DEVICES)
                                }
                            UiEvent.PickSaveTree -> treeLauncher.launch(null)
                        }
                    }
                }
                yield()
                viewModel.onUiReady()
            }
            LanchuanTheme {
                AppScaffold(viewModel, snackbar)
            }
        }
    }

    override fun onStart() {
        super.onStart()
        viewModel.setUiVisible(true)
    }

    override fun onResume() {
        super.onResume()
        viewModel.refreshPermissions()
        viewModel.refreshNetwork()
    }

    override fun onStop() {
        viewModel.setUiVisible(false)
        super.onStop()
    }
}

========== app/src/main/java/com/lanchuan/app/net/NetInfo.kt ==========
package com.lanchuan.app.net

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import java.net.Inet4Address
import java.net.NetworkInterface

object NetInfo {
    data class Snapshot(
        val kind: NetKind,
        val primary: String?,
        val extras: List,
    )

    fun snapshot(context: Context): Snapshot {
        val kind = kindOf(context)
        val active = activeIpv4(context)
        val found = interfaceAddresses()
        if (found.isEmpty()) {
            return Snapshot(kind, active, emptyList())
        }
        val ranked = found.sortedByDescending { score(it, active) }
        val primary = ranked.first().ip
        val extras = ranked.drop(1).map { it.ip }.distinct().filter { it != primary }
        return Snapshot(kind, primary, extras)
    }

    private fun kindOf(context: Context): NetKind {
        val manager = context.getSystemService(ConnectivityManager::class.java) ?: return NetKind.NONE
        val network = manager.activeNetwork ?: return NetKind.NONE
        val caps = manager.getNetworkCapabilities(network) ?: return NetKind.NONE
        return when {
            caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> NetKind.WIFI
            caps.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET) -> NetKind.ETHERNET
            caps.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> NetKind.CELLULAR
            else -> NetKind.OTHER
        }
    }

    private fun activeIpv4(context: Context): String? {
        val manager = context.getSystemService(ConnectivityManager::class.java) ?: return null
        val link = manager.getLinkProperties(manager.activeNetwork) ?: return null
        return link.linkAddresses
            .map { it.address }
            .filterIsInstance()
            .firstOrNull { !it.isLoopbackAddress && it.hostAddress != "0.0.0.0" }
            ?.hostAddress
    }

    private fun interfaceAddresses(): List {
        val result = ArrayList()
        val interfaces = try {
            NetworkInterface.getNetworkInterfaces()?.toList().orEmpty()
        } catch (_: Exception) {
            emptyList()
        }
        for (nif in interfaces) {
            if (!nif.isUp || nif.isLoopback) continue
            val name = nif.name ?: continue
            if (name.startsWith("lo") || name.startsWith("dummy")) continue
            for (address in nif.inetAddresses) {
                if (address !is Inet4Address || address.isLoopbackAddress) continue
                val host = address.hostAddress ?: continue
                if (host == "0.0.0.0") continue
                result.add(LocalIp(host, name, isPrivate(host)))
            }
        }
        return result
    }

    private fun score(item: LocalIp, active: String?): Int {
        var score = 0
        if (item.privateAddr) score += 100
        if (item.ip == active && item.privateAddr) score += 40
        val name = item.iface.lowercase()
        score += when {
            name.startsWith("wlan") || name.startsWith("wifi") -> 30
            name.startsWith("ap") || name.startsWith("swlan") || name.startsWith("softap") -> 28
            name.startsWith("eth") || name.startsWith("en") -> 18
            else -> 0
        }
        return score
    }

    private fun isPrivate(host: String): Boolean {
        val parts = host.split('.')
        if (parts.size != 4) return false
        val numbers = parts.map { it.toIntOrNull() ?: return false }
        val a = numbers[0]
        val b = numbers[1]
        return a == 10 || (a == 192 && b == 168) || (a == 172 && b in 16..31) || (a == 169 && b == 254)
    }

    private data class LocalIp(val ip: String, val iface: String, val privateAddr: Boolean)
}

enum class NetKind {
    WIFI,
    ETHERNET,
    CELLULAR,
    OTHER,
    NONE,
}

fun NetKind.describe(): String = when (this) {
    NetKind.WIFI -> "已连接 Wi-Fi"
    NetKind.ETHERNET -> "已连接以太网"
    NetKind.CELLULAR -> "当前看起来是移动数据。请改连同一个 Wi-Fi 或热点。"
    NetKind.OTHER -> "已连接网络"
    NetKind.NONE -> "没有网络连接。请先连上 Wi-Fi。"
}

fun NetKind.needsWarning(): Boolean = this == NetKind.CELLULAR || this == NetKind.NONE

========== app/src/main/java/com/lanchuan/app/protocol/Protocol.kt ==========
@file:OptIn(kotlinx.serialization.ExperimentalSerializationApi::class)

package com.lanchuan.app.protocol

import kotlinx.serialization.EncodeDefault
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

object Protocol {
    const val VERSION = 1
    const val SERVICE_TYPE = "_lanchuan._tcp."
    const val DEFAULT_PORT = 38765
    const val MAX_LINE = 1_048_576
    const val MAX_FILES = 40
    const val CONFIRM_TIMEOUT_MS = 90_000L

    const val OP_HELLO = "hello"
    const val OP_BUSY = "busy"
    const val OP_MANIFEST = "manifest"
    const val OP_ACCEPT = "accept"
    const val OP_REJECT = "reject"
    const val OP_FILE = "file"
    const val OP_ACK = "ack"
    const val OP_BYE = "bye"
    const val OP_ERROR = "error"

    val json = Json {
        ignoreUnknownKeys = true
        encodeDefaults = false
        explicitNulls = false
    }

    fun encode(message: WireMessage): String = json.encodeToString(WireMessage.serializer(), message)

    fun decode(line: String): WireMessage = json.decodeFromString(WireMessage.serializer(), line)

    fun parseHello(message: WireMessage): Hello {
        if (message.v != VERSION) throw ProtocolException("对方协议版本不兼容")
        if (message.op != OP_HELLO) throw ProtocolException("对方没有正确握手")
        val id = message.id?.trim().orEmpty().ifBlank { "unknown" }.take(80)
        val name = sanitizeDisplay(message.name.orEmpty())
        return Hello(id, name)
    }

    fun parseManifest(message: WireMessage): List {
        if (message.op != OP_MANIFEST) throw ProtocolException("期望收到文件清单")
        val files = message.files ?: throw ProtocolException("文件清单为空")
        if (files.isEmpty()) throw ProtocolException("没有要接收的文件")
        if (files.size > MAX_FILES) throw ProtocolException("一次最多传输 $MAX_FILES 个文件")
        val ids = HashSet()
        val parsed = files.map { wire ->
            val id = requireToken(wire.id, "文件编号无效")
            if (!ids.add(id)) throw ProtocolException("文件编号重复")
            if (wire.size ): Long {
        var sum = 0L
        for (file in files) {
            if (file.size  Long.MAX_VALUE - file.size) {
                throw ProtocolException("文件总大小无效")
            }
            sum += file.size
        }
        return sum
    }
}

class ProtocolException(message: String) : java.io.IOException(message)

data class Hello(val id: String, val name: String)

data class FileHeader(val id: String, val offset: Long)

data class SharedFile(
    val id: String,
    val name: String,
    val size: Long,
    val mime: String,
)

@Serializable
data class WireMessage(
    @EncodeDefault(EncodeDefault.Mode.ALWAYS) val v: Int = Protocol.VERSION,
    val op: String,
    val id: String? = null,
    val name: String? = null,
    val sessionId: String? = null,
    val reason: String? = null,
    val files: List? = null,
    val offset: Long? = null,
    val received: Long? = null,
)

@Serializable
data class WireFile(
    val id: String,
    val name: String = "",
    val size: Long = 0,
    val mime: String = "application/octet-stream",
    val offset: Long = 0,
)

fun requireToken(raw: String, error: String): String {
    val value = raw.trim()
    if (!value.matches(Regex("^[A-Za-z0-9._:-]{1,80}$"))) throw ProtocolException(error)
    return value
}

fun sanitizeDisplay(name: String): String {
    return name.replace(Regex("[\u0000-\u001F]"), "")
        .trim()
        .take(32)
        .ifBlank { "未知设备" }
}

fun sanitizeFileName(raw: String): String {
    val cleaned = raw.trim()
        .replace(Regex("[\\\\/:*?\"<>|\u0000-\u001F]"), "_")
        .trim('.', ' ')
        .take(120)

    val usable = cleaned.any { it.isLetterOrDigit() }
    return if (usable) cleaned else "未命名"
}

fun sanitizeMime(mime: String): String {
    val value = mime.trim().lowercase()
    val ok = value.matches(Regex("^[a-z0-9!#\$&^_.+-]+/[a-z0-9!#\$&^_.+-]+$"))
    return if (ok) value else "application/octet-stream"
}

fun shortCode(deviceId: String): String {
    val compact = deviceId.replace("-", "").filter { it.isLetterOrDigit() }
    if (compact.length = Protocol.MAX_LINE) throw IOException("收到的协议消息过长")
            buffer.write(value)
        }
        return buffer.toString(Charsets.UTF_8.name())
    }

    fun readMessage(): WireMessage {
        val line = readLine()
        if (line.isBlank()) throw ProtocolException("收到空的协议消息")
        return try {
            Protocol.decode(line)
        } catch (e: ProtocolException) {
            throw e
        } catch (e: Exception) {
            throw ProtocolException("协议数据无法解析，请确认对方也安装了「局域网传」")
        }
    }

    fun writeLine(text: String) {
        val bytes = text.toByteArray(Charsets.UTF_8)
        if (bytes.size > Protocol.MAX_LINE) throw IOException("协议消息过长")
        output.write(bytes)
        output.write('\n'.code)
        output.flush()
    }

    fun writeMessage(message: WireMessage) {
        writeLine(Protocol.encode(message))
    }

    fun readExact(destination: OutputStream, count: Long, onProgress: (Long) -> Unit = {}) {
        if (count == 0L) {
            onProgress(0L)
            return
        }
        if (count  0L) {
            val toRead = minOf(buffer.size.toLong(), remaining).toInt()
            val read = input.read(buffer, 0, toRead)
            if (read = 200_000_000L) {
                lastTick = now
                destination.flush()
                onProgress(done)
            }
        }
    }

    fun writeFrom(source: InputStream, count: Long, onProgress: (Long) -> Unit = {}) {
        if (count == 0L) {
            onProgress(0L)
            output.flush()
            return
        }
        if (count  0L) {
            val toRead = minOf(buffer.size.toLong(), remaining).toInt()
            val read = source.read(buffer, 0, toRead)
            if (read = 200_000_000L) {
                lastTick = now
                output.flush()
                onProgress(done)
            }
        }
        output.flush()
    }
}

fun skipFully(input: InputStream, bytes: Long) {
    var left = bytes
    while (left > 0L) {
        val skipped = input.skip(left)
        if (skipped > 0L) {
            left -= skipped
            continue
        }
        if (input.read() = Build.VERSION_CODES.Q) {
            startForeground(Notifier.ID_LISTEN, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC)
        } else {
            startForeground(Notifier.ID_LISTEN, notification)
        }
        repository.onListenServiceStarted { stopSelf() }
        return START_STICKY
    }

    override fun onDestroy() {
        (application as LanchuanApp).repository.onListenServiceDestroyed()
        super.onDestroy()
    }
}

========== app/src/main/java/com/lanchuan/app/service/Notifier.kt ==========
package com.lanchuan.app.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.lanchuan.app.MainActivity
import com.lanchuan.app.R
import com.lanchuan.app.transfer.ActiveTransfer
import com.lanchuan.app.transfer.Direction
import com.lanchuan.app.transfer.PendingOffer
import com.lanchuan.app.transfer.formatBytes
import com.lanchuan.app.transfer.percentOf

object Notifier {
    const val ACTION_ACCEPT = "com.lanchuan.app.ACCEPT"
    const val ACTION_REJECT = "com.lanchuan.app.REJECT"
    const val ACTION_STOP = "com.lanchuan.app.STOP"

    const val ID_LISTEN = 10
    const val ID_PROGRESS = 11
    const val ID_INCOMING = 12
    const val ID_RESULT = 13

    private const val CH_LISTEN = "listen"
    private const val CH_PROGRESS = "progress"
    private const val CH_INCOMING = "incoming"
    private const val CH_RESULT = "result"

    fun ensureChannels(context: Context) {
        if (Build.VERSION.SDK_INT  repository.acceptPending()
            Notifier.ACTION_REJECT -> repository.rejectPending()
            Notifier.ACTION_STOP -> repository.stopFromNotification()
        }
    }
}

========== app/src/main/java/com/lanchuan/app/transfer/Errors.kt ==========
package com.lanchuan.app.transfer

import com.lanchuan.app.protocol.ProtocolException
import kotlinx.coroutines.CancellationException
import java.io.EOFException
import java.net.BindException
import java.net.ConnectException
import java.net.NoRouteToHostException
import java.net.SocketException
import java.net.SocketTimeoutException
import java.net.UnknownHostException

object Errors {
    fun humanize(throwable: Throwable): String {
        if (throwable is CancellationException) return "已取消传输"
        var current: Throwable? = throwable
        while (current != null) {
            when (current) {
                is ProtocolException -> return current.message ?: "协议错误"
                is SocketTimeoutException ->
                    return "连接超时。请确认两台设备在同一 Wi-Fi，并核对 IP 与端口。"
                is ConnectException ->
                    return "无法连接对方。请确认对方已开启接收，且 IP、端口正确。"
                is BindException ->
                    return "端口已被占用，请在设置里更换端口后重新开启接收。"
                is SecurityException ->
                    return "权限被拒绝，无法读取或保存文件。"
                is UnknownHostException ->
                    return "找不到该地址。请检查 IP 是否正确。"
                is NoRouteToHostException ->
                    return "无法到达对方。请确认在同一局域网，且路由器没有开启 AP 隔离。"
                is EOFException ->
                    return current.message?.takeIf { it.contains("无法") || it.contains("断开") || it.contains("截断") }
                        ?: "对方已断开连接。"
                is SocketException -> {
                    val text = current.message.orEmpty()
                    if (text.contains("ECONNRESET", true) || text.contains("Connection reset", true)) {
                        return "对方已断开连接。"
                    }
                    if (text.contains("Broken pipe", true) || text.contains("Software caused connection abort", true)) {
                        return "连接已中断。"
                    }
                    if (text.contains("EADDRINUSE", true) || text.contains("Address already in use", true)) {
                        return "端口已被占用，请在设置里更换端口后重新开启接收。"
                    }
                }
            }
            current = current.cause
        }
        val raw = throwable.message?.trim().orEmpty()
        if (raw.isBlank()) return "传输失败。"
        val looksChinese = raw.any { it.code > 127 } || raw.contains("无法") || raw.contains("请")
        return if (looksChinese) raw else "传输失败：$raw"
    }
}

========== app/src/main/java/com/lanchuan/app/transfer/Format.kt ==========
package com.lanchuan.app.transfer

import java.util.Locale

fun formatBytes(size: Long): String {
    if (size  0L) 100 else 0
    val safe = done.coerceIn(0L, total)
    return ((safe * 100L) / total).toInt()
}

object HostPort {
    private val ipv4 = Regex("""^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$""")
    private val hostName = Regex("""^[A-Za-z0-9][A-Za-z0-9.-]{0,252}$""")

    fun parse(hostRaw: String, portRaw: String, defaultPort: Int): Result> {
        val host = hostRaw.trim()
        if (host.isEmpty()) {
            return Result.failure(IllegalArgumentException("请输入 IP 地址"))
        }
        val port = if (portRaw.isBlank()) {
            defaultPort
        } else {
            portRaw.trim().toIntOrNull()
        }
        if (port == null || port !in 1..65535) {
            return Result.failure(IllegalArgumentException("端口需在 1–65535 之间"))
        }
        val match = ipv4.matchEntire(host)
        if (match != null) {
            val bad = match.groupValues.drop(1).any { octet -> octet.toInt() !in 0..255 }
            if (bad) return Result.failure(IllegalArgumentException("IP 地址无效"))
        } else if (!hostName.matches(host)) {
            return Result.failure(IllegalArgumentException("请输入有效的 IP 地址"))
        }
        return Result.success(host to port)
    }

    fun isPrivateIpv4(host: String): Boolean {
        val match = ipv4.matchEntire(host) ?: return false
        val a = match.groupValues[1].toInt()
        val b = match.groupValues[2].toInt()
        if (a == 10) return true
        if (a == 192 && b == 168) return true
        if (a == 172 && b in 16..31) return true
        if (a == 169 && b == 254) return true
        return false
    }
}

========== app/src/main/java/com/lanchuan/app/transfer/Models.kt ==========
package com.lanchuan.app.transfer

import com.lanchuan.app.protocol.SharedFile
import kotlinx.serialization.Serializable
import java.io.InputStream
import java.io.OutputStream

enum class Direction { SEND, RECEIVE }

enum class Phase { WAITING, TRANSFERRING, SUCCESS, FAILED, CANCELLED }

data class Identity(val id: String, val name: String)

data class Peer(
    val deviceId: String,
    val name: String,
    val host: String,
    val port: Int,
    val serviceName: String = "",
)

data class PendingOffer(
    val sessionId: String,
    val peerId: String,
    val peerName: String,
    val files: List,
)

sealed class Decision {
    data object Accept : Decision()
    data class Reject(val reason: String) : Decision()
}

data class ActiveTransfer(
    val direction: Direction,
    val peerName: String,
    val fileName: String,
    val fileIndex: Int,
    val fileCount: Int,
    val fileBytes: Long,
    val fileTotal: Long,
    val overallBytes: Long,
    val overallTotal: Long,
    val phase: Phase,
    val message: String,
)

@Serializable
data class TransferRecord(
    val id: String,
    val fileId: String,
    val direction: String,
    val peerName: String,
    val fileName: String,
    val size: Long,
    val status: String,
    val message: String,
    val timeMillis: Long,
    val savedUri: String? = null,
    val mime: String = "application/octet-stream",
) {
    fun isReceivePartial(): Boolean {
        return direction == "receive" && status != "success"
    }
}

interface OutgoingSource {
    val id: String
    val name: String
    val size: Long
    val mime: String
    fun open(): InputStream
}

interface ReceiveSink {
    val id: String
    val name: String
    val size: Long
    val mime: String
    val offset: Long
    val alreadyComplete: Boolean
    val output: OutputStream?
    fun mark(received: Long)
    fun finish(): String?
    fun abort(received: Long)
}

interface ReceiveStore {
    fun open(file: SharedFile): ReceiveSink
    fun discard(fileId: String)
}

interface TransferEvents {
    fun onProgress(active: ActiveTransfer) {}
    fun onFileFinished(record: TransferRecord) {}
    fun onLog(message: String) {}

    companion object {
        val NONE = object : TransferEvents {}
    }
}

data class SendOutcome(val phase: Phase, val message: String)

fun recordStatus(phase: Phase): String = when (phase) {
    Phase.SUCCESS -> "success"
    Phase.CANCELLED -> "cancelled"
    Phase.FAILED -> "failed"
    Phase.WAITING, Phase.TRANSFERRING -> "failed"
}

fun directionKey(direction: Direction): String = when (direction) {
    Direction.SEND -> "send"
    Direction.RECEIVE -> "receive"
}

========== app/src/main/java/com/lanchuan/app/transfer/TransferClient.kt ==========
package com.lanchuan.app.transfer

import com.lanchuan.app.protocol.Protocol
import com.lanchuan.app.protocol.StreamFramer
import com.lanchuan.app.protocol.WireFile
import com.lanchuan.app.protocol.WireMessage
import com.lanchuan.app.protocol.skipFully
import java.net.InetSocketAddress
import java.net.Socket
import java.util.UUID

class TransferClient(
    private val identity: () -> Identity,
    private val events: TransferEvents = TransferEvents.NONE,
) {
    @Volatile
    private var socket: Socket? = null

    @Volatile
    private var localCancel = false

    fun cancel() {
        localCancel = true
        try {
            socket?.close()
        } catch (_: Exception) {
        }
    }

    fun send(target: Peer, files: List): SendOutcome {
        localCancel = false
        if (files.isEmpty()) return SendOutcome(Phase.FAILED, "没有要发送的文件")
        if (files.size > Protocol.MAX_FILES) {
            return SendOutcome(Phase.FAILED, "一次最多发送 ${Protocol.MAX_FILES} 个文件")
        }
        val self = identity()
        val connection = Socket()
        socket = connection
        val finished = HashSet()
        return try {
            connection.sendBufferSize = 256 * 1024
            connection.receiveBufferSize = 256 * 1024
            connection.connect(InetSocketAddress(target.host, target.port), 8_000)
            val framer = StreamFramer(connection.getInputStream(), connection.getOutputStream())
            connection.soTimeout = 15_000
            framer.writeMessage(WireMessage(op = Protocol.OP_HELLO, id = self.id, name = self.name))
            val hello = framer.readMessage()
            when (hello.op) {
                Protocol.OP_BUSY -> throw SessionFailed(hello.reason ?: "对方正在接收其他传输", cancelled = false)
                Protocol.OP_ERROR -> throw SessionFailed(hello.reason ?: "对方返回错误", cancelled = false)
                Protocol.OP_HELLO -> Protocol.parseHello(hello)
                else -> throw SessionFailed("对方没有正确握手", cancelled = false)
            }
            val sessionId = UUID.randomUUID().toString()
            framer.writeMessage(
                WireMessage(
                    op = Protocol.OP_MANIFEST,
                    sessionId = sessionId,
                    files = files.map { WireFile(id = it.id, name = it.name, size = it.size, mime = it.mime) },
                ),
            )
            events.onProgress(banner(target.name, files, 0, 0L, Phase.WAITING, "等待对方确认"))
            connection.soTimeout = (Protocol.CONFIRM_TIMEOUT_MS + 15_000L).toInt()
            val decision = framer.readMessage()
            when (decision.op) {
                Protocol.OP_REJECT -> throw SessionFailed(decision.reason ?: "对方拒绝接收", cancelled = false)
                Protocol.OP_ERROR -> throw SessionFailed(decision.reason ?: "对方返回错误", cancelled = false)
                Protocol.OP_ACCEPT -> Unit
                else -> throw SessionFailed("对方响应无法识别", cancelled = false)
            }
            if (decision.sessionId != null && decision.sessionId != sessionId) {
                throw SessionFailed("会话编号不一致", cancelled = false)
            }
            val offsets = decision.files.orEmpty().associate { it.id to it.offset }
            if (files.any { it.id !in offsets }) throw SessionFailed("对方的接收响应不完整", cancelled = false)
            sendAll(connection, framer, target.name, files, offsets, finished)
            framer.writeMessage(WireMessage(op = Protocol.OP_BYE))
            val total = files.sumOf { it.size }
            events.onProgress(banner(target.name, files, files.lastIndex.coerceAtLeast(0), files.lastOrNull()?.size ?: 0L, Phase.SUCCESS, "发送完成").copy(
                overallBytes = total,
                overallTotal = total,
            ))
            SendOutcome(Phase.SUCCESS, "发送完成")
        } catch (error: Exception) {
            val cancelled = localCancel || (error is SessionFailed && error.cancelled)
            val message = when {
                cancelled -> "已取消传输"
                error is SessionFailed -> error.message ?: "发送失败"
                else -> Errors.humanize(error)
            }
            val phase = if (cancelled) Phase.CANCELLED else Phase.FAILED
            recordUnfinished(target.name, files, finished, phase, message)
            events.onProgress(banner(target.name, files, 0, 0L, phase, message))
            SendOutcome(phase, message)
        } finally {
            try {
                connection.close()
            } catch (_: Exception) {
            }
            if (socket === connection) socket = null
        }
    }

    private fun sendAll(
        connection: Socket,
        framer: StreamFramer,
        peerName: String,
        files: List,
        offsets: Map,
        finished: MutableSet,
    ) {
        val total = files.sumOf { it.size }
        connection.soTimeout = 60_000
        files.forEachIndexed { index, file ->
            if (localCancel) throw SessionFailed("已取消传输", cancelled = true)
            val offset = offsets[file.id] ?: 0L
            if (offset  file.size) throw SessionFailed("对方给出的续传位置无效", cancelled = false)
            framer.writeMessage(WireMessage(op = Protocol.OP_FILE, id = file.id, offset = offset))
            var sent = offset
            emit(peerName, files, index, sent, total, "正在发送")
            if (file.size > offset) {
                file.open().use { input ->
                    skipFully(input, offset)
                    framer.writeFrom(input, file.size - offset) { wrote ->
                        sent = offset + wrote
                        emit(peerName, files, index, sent, total, "正在发送")
                    }
                }
            }
            val ack = framer.readMessage()
            if (ack.op != Protocol.OP_ACK || ack.id != file.id || (ack.received ?: -1L) != file.size) {
                throw SessionFailed(ack.reason ?: "对方确认的大小不一致", cancelled = false)
            }
            finished += file.id
            events.onFileFinished(
                TransferRecord(
                    id = UUID.randomUUID().toString(),
                    fileId = file.id,
                    direction = directionKey(Direction.SEND),
                    peerName = peerName,
                    fileName = file.name,
                    size = file.size,
                    status = "success",
                    message = "发送完成",
                    timeMillis = System.currentTimeMillis(),
                    savedUri = null,
                    mime = file.mime,
                ),
            )
        }
    }

    private fun recordUnfinished(
        peerName: String,
        files: List,
        finished: Set,
        phase: Phase,
        message: String,
    ) {
        val status = if (message.contains("拒绝") || message.contains("超时") || message.contains("正忙") || message.contains("正在接收")) {
            "rejected"
        } else {
            recordStatus(phase)
        }
        files.filter { it.id !in finished }.forEachIndexed { index, file ->
            val note = if (index == 0) message else "上一个文件中断，未继续发送"
            events.onFileFinished(
                TransferRecord(
                    id = UUID.randomUUID().toString(),
                    fileId = file.id,
                    direction = directionKey(Direction.SEND),
                    peerName = peerName,
                    fileName = file.name,
                    size = file.size,
                    status = status,
                    message = note,
                    timeMillis = System.currentTimeMillis(),
                    mime = file.mime,
                ),
            )
        }
    }

    private fun emit(
        peerName: String,
        files: List,
        index: Int,
        fileBytes: Long,
        total: Long,
        message: String,
    ) {
        val prior = files.take(index).sumOf { it.size }
        val current = files[index]
        events.onProgress(
            ActiveTransfer(
                direction = Direction.SEND,
                peerName = peerName,
                fileName = current.name,
                fileIndex = index,
                fileCount = files.size,
                fileBytes = fileBytes,
                fileTotal = current.size,
                overallBytes = prior + fileBytes,
                overallTotal = total,
                phase = Phase.TRANSFERRING,
                message = message,
            ),
        )
    }

    private fun banner(
        peerName: String,
        files: List,
        index: Int,
        fileBytes: Long,
        phase: Phase,
        message: String,
    ): ActiveTransfer {
        val safeIndex = index.coerceIn(0, (files.size - 1).coerceAtLeast(0))
        val current = files.getOrNull(safeIndex)
        val total = files.sumOf { it.size }
        val prior = files.take(safeIndex).sumOf { it.size }
        return ActiveTransfer(
            direction = Direction.SEND,
            peerName = peerName,
            fileName = current?.name ?: "",
            fileIndex = safeIndex,
            fileCount = files.size,
            fileBytes = fileBytes,
            fileTotal = current?.size ?: 0L,
            overallBytes = prior + fileBytes,
            overallTotal = total,
            phase = phase,
            message = message,
        )
    }

    private class SessionFailed(message: String, val cancelled: Boolean) : Exception(message)
}

========== app/src/main/java/com/lanchuan/app/transfer/TransferServer.kt ==========
package com.lanchuan.app.transfer

import com.lanchuan.app.protocol.Protocol
import com.lanchuan.app.protocol.SharedFile
import com.lanchuan.app.protocol.StreamFramer
import com.lanchuan.app.protocol.WireFile
import com.lanchuan.app.protocol.WireMessage
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineExceptionHandler
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.TimeoutCancellationException
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeout
import java.net.InetSocketAddress
import java.net.ServerSocket
import java.net.Socket
import java.util.UUID
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicInteger

class TransferServer(
    private val identity: () -> Identity,
    private val store: ReceiveStore,
    private val confirm: suspend (PendingOffer) -> Decision,
    private val events: TransferEvents = TransferEvents.NONE,
    private val log: (String) -> Unit = {},
) {
    private val scope = CoroutineScope(
        SupervisorJob() + Dispatchers.IO + CoroutineExceptionHandler { _, error ->
            if (error is CancellationException) return@CoroutineExceptionHandler
            log("接收循环异常：${error.message}")
        },
    )

    private var serverSocket: ServerSocket? = null
    private var acceptJob: Job? = null

    @Volatile
    var boundPort: Int = -1
        private set

    @Volatile
    private var running = false

    @Volatile
    private var sessionSocket: Socket? = null

    private val inSession = AtomicBoolean(false)
    private val sessionGen = AtomicInteger(0)

    @Volatile
    private var cancelGen: Int = -1

    fun start(port: Int, host: String = "0.0.0.0"): String? {
        stop()
        return try {
            val socket = ServerSocket()
            socket.reuseAddress = true
            socket.bind(InetSocketAddress(host, port))
            serverSocket = socket
            boundPort = socket.localPort
            running = true
            acceptJob = scope.launch { acceptLoop(socket) }
            log("开始监听 $boundPort")
            null
        } catch (error: Exception) {
            running = false
            Errors.humanize(error)
        }
    }

    fun stop() {
        running = false
        cancelSession()
        try {
            serverSocket?.close()
        } catch (_: Exception) {
        }
        serverSocket = null
        boundPort = -1
        acceptJob?.cancel()
        acceptJob = null
    }

    fun cancelSession() {
        cancelGen = sessionGen.get()
        try {
            sessionSocket?.close()
        } catch (_: Exception) {
        }
    }

    private suspend fun CoroutineScope.acceptLoop(socket: ServerSocket) {
        while (isActive && running && !socket.isClosed) {
            val client = try {
                socket.accept()
            } catch (error: Exception) {
                if (socket.isClosed || !running) break
                log("接受连接失败：${error.message}")
                continue
            }
            launch { handle(client) }
        }
    }

    private suspend fun handle(socket: Socket) {
        socket.sendBufferSize = 256 * 1024
        socket.receiveBufferSize = 256 * 1024
        val framer = StreamFramer(socket.getInputStream(), socket.getOutputStream())
        if (!inSession.compareAndSet(false, true)) {
            replyBusy(socket, framer)
            return
        }
        val generation = sessionGen.incrementAndGet()
        sessionSocket = socket
        try {
            runSession(socket, framer, generation)
        } catch (error: CancellationException) {
            if (running && wasCancelled(generation)) {
                events.onProgress(
                    terminal(
                        peer = "对方",
                        files = emptyList(),
                        phase = Phase.CANCELLED,
                        message = "已取消传输",
                    ),
                )
            }
            throw error
        } finally {
            inSession.set(false)
            if (sessionSocket === socket) sessionSocket = null
            try {
                socket.close()
            } catch (_: Exception) {
            }
        }
    }

    private fun replyBusy(socket: Socket, framer: StreamFramer) {
        try {
            socket.soTimeout = 8_000
            framer.readMessage()
            framer.writeMessage(WireMessage(op = Protocol.OP_BUSY, reason = "正在接收其他传输"))
        } catch (_: Exception) {
        } finally {
            try {
                socket.close()
            } catch (_: Exception) {
            }
        }
    }

    private suspend fun runSession(socket: Socket, framer: StreamFramer, generation: Int) {
        val self = identity()
        socket.soTimeout = 15_000
        val hello = try {
            Protocol.parseHello(framer.readMessage())
        } catch (error: Exception) {
            writeQuiet(framer, WireMessage(op = Protocol.OP_ERROR, reason = Errors.humanize(error)))
            return
        }
        framer.writeMessage(WireMessage(op = Protocol.OP_HELLO, id = self.id, name = self.name))

        socket.soTimeout = 20_000
        val manifest = try {
            framer.readMessage()
        } catch (error: Exception) {
            events.onProgress(terminal(hello.name, emptyList(), Phase.FAILED, Errors.humanize(error)))
            return
        }
        val files = try {
            Protocol.parseManifest(manifest)
        } catch (error: Exception) {
            val reason = Errors.humanize(error)
            writeQuiet(framer, WireMessage(op = Protocol.OP_ERROR, reason = reason))
            events.onProgress(terminal(hello.name, emptyList(), Phase.FAILED, reason))
            return
        }
        val sessionId = manifest.sessionId?.takeIf { it.isNotBlank() } ?: "session"
        val offer = PendingOffer(sessionId, hello.id, hello.name, files)
        events.onProgress(waiting(offer))

        socket.soTimeout = 0
        val decision = try {
            withTimeout(Protocol.CONFIRM_TIMEOUT_MS) { confirm(offer) }
        } catch (error: TimeoutCancellationException) {
            Decision.Reject("等待确认超时")
        }

        if (wasCancelled(generation)) {
            finishRejected(framer, sessionId, hello.name, files, "已取消传输", Phase.CANCELLED)
            return
        }
        if (decision is Decision.Reject) {
            val phase = if (decision.reason.contains("取消")) Phase.CANCELLED else Phase.FAILED
            finishRejected(framer, sessionId, hello.name, files, decision.reason, phase)
            return
        }

        val opened = try {
            files.map { store.open(it) }
        } catch (error: Exception) {
            val reason = Errors.humanize(error)
            finishRejected(framer, sessionId, hello.name, files, reason, Phase.FAILED)
            return
        }

        try {
            framer.writeMessage(
                WireMessage(
                    op = Protocol.OP_ACCEPT,
                    sessionId = sessionId,
                    files = opened.map { WireFile(id = it.id, offset = it.offset) },
                ),
            )
            receiveAll(socket, framer, hello.name, opened, generation)
            socket.soTimeout = 4_000
            try {
                val bye = framer.readMessage()
                if (bye.op != Protocol.OP_BYE && bye.op != Protocol.OP_ERROR) {
                    log("忽略结束消息 ${bye.op}")
                }
            } catch (_: Exception) {

            }
            events.onProgress(
                terminal(hello.name, files, Phase.SUCCESS, "接收完成"),
            )
        } catch (error: CancellationException) {
            throw error
        } catch (error: SessionFailed) {
            events.onProgress(
                terminal(
                    hello.name,
                    files,
                    if (error.cancelled) Phase.CANCELLED else Phase.FAILED,
                    error.message ?: "接收失败",
                ),
            )
        } catch (error: Exception) {
            val cancelled = wasCancelled(generation)
            events.onProgress(
                terminal(
                    hello.name,
                    files,
                    if (cancelled) Phase.CANCELLED else Phase.FAILED,
                    if (cancelled) "已取消传输" else Errors.humanize(error),
                ),
            )
        }
    }

    private fun receiveAll(
        socket: Socket,
        framer: StreamFramer,
        peerName: String,
        opened: List,
        generation: Int,
    ) {
        val total = opened.sumOf { it.size }
        socket.soTimeout = 60_000
        var index = 0
        try {
            while (index  sink.offset) {
                    val output = sink.output ?: throw SessionFailed("无法写入文件", cancelled = false)
                    val remain = sink.size - sink.offset
                    framer.readExact(output, remain) { justWrote ->
                        received = sink.offset + justWrote
                        sink.mark(received)
                        emit(peerName, opened, index, received, total, "正在接收")
                    }
                }
                val saved = sink.finish()
                framer.writeMessage(WireMessage(op = Protocol.OP_ACK, id = sink.id, received = sink.size))
                events.onFileFinished(
                    makeRecord(peerName, sink.id, sink.name, sink.size, sink.mime, Phase.SUCCESS, "接收完成", saved),
                )
                index++
            }
        } catch (error: CancellationException) {
            failTail(peerName, opened, index, "已取消传输")
            throw error
        } catch (error: SessionFailed) {
            failTail(peerName, opened, index, error.message ?: "接收失败")
            throw error
        } catch (error: Exception) {
            val cancelled = wasCancelled(generation)
            val message = if (cancelled) "已取消传输" else Errors.humanize(error)
            failTail(peerName, opened, index, message)
            throw SessionFailed(message, cancelled)
        }
    }

    private fun failTail(peerName: String, opened: List, from: Int, message: String) {
        for (i in from until opened.size) {
            val sink = opened[i]
            val received = if (i == from) sink.offset else sink.offset
            sink.abort(received)
            val phase = if (message.contains("取消")) Phase.CANCELLED else Phase.FAILED
            val note = if (i == from) message else "上一个文件中断，未继续接收"
            events.onFileFinished(
                makeRecord(peerName, sink.id, sink.name, sink.size, sink.mime, phase, note, null),
            )
        }
    }

    private fun finishRejected(
        framer: StreamFramer,
        sessionId: String,
        peerName: String,
        files: List,
        reason: String,
        phase: Phase,
    ) {
        writeQuiet(framer, WireMessage(op = Protocol.OP_REJECT, sessionId = sessionId, reason = reason))
        files.forEach { file ->
            events.onFileFinished(
                makeRecord(peerName, file.id, file.name, file.size, file.mime, phase, reason, null),
            )
        }
        events.onProgress(terminal(peerName, files, phase, reason))
    }

    private fun emit(
        peerName: String,
        opened: List,
        index: Int,
        fileBytes: Long,
        total: Long,
        message: String,
    ) {
        val prior = opened.take(index).sumOf { it.size }
        val current = opened[index]
        events.onProgress(
            ActiveTransfer(
                direction = Direction.RECEIVE,
                peerName = peerName,
                fileName = current.name,
                fileIndex = index,
                fileCount = opened.size,
                fileBytes = fileBytes,
                fileTotal = current.size,
                overallBytes = prior + fileBytes,
                overallTotal = total,
                phase = Phase.TRANSFERRING,
                message = message,
            ),
        )
    }

    private fun waiting(offer: PendingOffer): ActiveTransfer {
        val total = offer.files.sumOf { it.size }
        val first = offer.files.first()
        return ActiveTransfer(
            direction = Direction.RECEIVE,
            peerName = offer.peerName,
            fileName = first.name,
            fileIndex = 0,
            fileCount = offer.files.size,
            fileBytes = 0,
            fileTotal = first.size,
            overallBytes = 0,
            overallTotal = total,
            phase = Phase.WAITING,
            message = "等待你确认接收",
        )
    }

    private fun terminal(
        peer: String,
        files: List,
        phase: Phase,
        message: String,
    ): ActiveTransfer {
        val total = files.sumOf { it.size }
        return ActiveTransfer(
            direction = Direction.RECEIVE,
            peerName = peer,
            fileName = files.firstOrNull()?.name ?: "",
            fileIndex = (files.size - 1).coerceAtLeast(0),
            fileCount = files.size,
            fileBytes = if (phase == Phase.SUCCESS) files.lastOrNull()?.size ?: 0L else 0L,
            fileTotal = files.lastOrNull()?.size ?: 0L,
            overallBytes = if (phase == Phase.SUCCESS) total else 0L,
            overallTotal = total,
            phase = phase,
            message = message,
        )
    }

    private fun makeRecord(
        peerName: String,
        fileId: String,
        name: String,
        size: Long,
        mime: String,
        phase: Phase,
        message: String,
        saved: String?,
    ) = TransferRecord(
        id = UUID.randomUUID().toString(),
        fileId = fileId,
        direction = directionKey(Direction.RECEIVE),
        peerName = peerName,
        fileName = name,
        size = size,
        status = if (message.contains("拒绝") || message.contains("超时")) "rejected" else recordStatus(phase),
        message = message,
        timeMillis = System.currentTimeMillis(),
        savedUri = saved,
        mime = mime,
    )

    private fun wasCancelled(generation: Int): Boolean = cancelGen == generation

    private fun writeQuiet(framer: StreamFramer, message: WireMessage) {
        try {
            framer.writeMessage(message)
        } catch (_: Exception) {
        }
    }

    private class SessionFailed(message: String, val cancelled: Boolean) : Exception(message)
}

========== app/src/main/java/com/lanchuan/app/ui/AppScaffold.kt ==========
package com.lanchuan.app.ui

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.List
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.lanchuan.app.transfer.Direction
import com.lanchuan.app.transfer.Phase
import com.lanchuan.app.ui.history.HistoryScreen
import com.lanchuan.app.ui.home.HomeScreen
import com.lanchuan.app.ui.send.SendScreen
import com.lanchuan.app.ui.settings.SettingsScreen

private data class Tab(val route: String, val label: String, val icon: ImageVector)

private val tabs = listOf(
    Tab("home", "首页", Icons.Filled.Home),
    Tab("send", "发送", Icons.AutoMirrored.Filled.Send),
    Tab("history", "记录", Icons.AutoMirrored.Filled.List),
    Tab("settings", "设置", Icons.Filled.Settings),
)

@Composable
fun AppScaffold(vm: LanchuanViewModel, snackbarHostState: SnackbarHostState) {
    val nav = rememberNavController()
    val backStack by nav.currentBackStackEntryAsState()
    val route = backStack?.destination?.route
    val active by vm.active.collectAsStateWithLifecycle()
    val draft by vm.draft.collectAsStateWithLifecycle()
    val pending by vm.pendingOffer.collectAsStateWithLifecycle()

    if (pending != null) {
        IncomingDialog(pending!!, onAccept = vm::acceptPending, onReject = vm::rejectPending)
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        snackbarHost = { SnackbarHost(snackbarHostState) },
        bottomBar = {
            NavigationBar {
                tabs.forEach { tab ->
                    NavigationBarItem(
                        selected = route == tab.route,
                        onClick = {
                            nav.navigate(tab.route) {
                                popUpTo(nav.graph.findStartDestination().id) { saveState = true }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        icon = { Icon(tab.icon, contentDescription = tab.label) },
                        label = { Text(tab.label) },
                    )
                }
            }
        },
    ) { padding ->
        Column(
            Modifier
                .fillMaxSize()
                .padding(padding)
                .imePadding(),
        ) {
            if (active != null) {
                val showRetry = active!!.direction == Direction.SEND &&
                    (active!!.phase == Phase.FAILED || active!!.phase == Phase.CANCELLED) &&
                    draft.files.isNotEmpty()
                TransferBanner(
                    active = active!!,
                    showRetry = showRetry,
                    onCancel = vm::cancelTransfer,
                    onDismiss = vm::dismissActive,
                    onRetry = vm::startSend,
                )
            }
            NavHost(navController = nav, startDestination = "home", modifier = Modifier.weight(1f)) {
                composable("home") { HomeScreen(vm, onSend = { nav.navigate("send") }) }
                composable("send") { SendScreen(vm) }
                composable("history") { HistoryScreen(vm) }
                composable("settings") { SettingsScreen(vm) }
            }
        }
    }
}

========== app/src/main/java/com/lanchuan/app/ui/Common.kt ==========
package com.lanchuan.app.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.DialogProperties
import com.lanchuan.app.protocol.Protocol
import com.lanchuan.app.transfer.ActiveTransfer
import com.lanchuan.app.transfer.Direction
import com.lanchuan.app.transfer.HostPort
import com.lanchuan.app.transfer.PendingOffer
import com.lanchuan.app.transfer.Phase
import com.lanchuan.app.transfer.formatBytes
import com.lanchuan.app.transfer.percentOf

@Composable
fun TransferBanner(
    active: ActiveTransfer,
    showRetry: Boolean,
    onCancel: () -> Unit,
    onDismiss: () -> Unit,
    onRetry: () -> Unit,
) {
    val container = when (active.phase) {
        Phase.FAILED -> MaterialTheme.colorScheme.errorContainer
        Phase.SUCCESS -> MaterialTheme.colorScheme.primaryContainer
        Phase.CANCELLED -> MaterialTheme.colorScheme.surfaceVariant
        else -> MaterialTheme.colorScheme.secondaryContainer
    }
    val onContainer = when (active.phase) {
        Phase.FAILED -> MaterialTheme.colorScheme.onErrorContainer
        Phase.SUCCESS -> MaterialTheme.colorScheme.onPrimaryContainer
        Phase.CANCELLED -> MaterialTheme.colorScheme.onSurfaceVariant
        else -> MaterialTheme.colorScheme.onSecondaryContainer
    }
    Surface(
        color = container,
        contentColor = onContainer,
        shape = RoundedCornerShape(16.dp),
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
    ) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            val title = when {
                active.phase == Phase.WAITING && active.direction == Direction.RECEIVE -> "等待你确认接收"
                active.phase == Phase.WAITING -> "等待对方确认"
                active.phase == Phase.TRANSFERRING && active.direction == Direction.SEND -> "正在发送"
                active.phase == Phase.TRANSFERRING -> "正在接收"
                active.phase == Phase.SUCCESS -> "传输完成"
                active.phase == Phase.CANCELLED -> "已取消"
                else -> "传输没有完成"
            }
            Text(title, style = MaterialTheme.typography.titleMedium)
            if (active.fileName.isNotBlank()) {
                Text(
                    "${active.fileIndex + 1}/${active.fileCount.coerceAtLeast(1)}  ${active.fileName}",
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
            }
            Text(active.message, style = MaterialTheme.typography.bodyMedium)
            if (active.phase == Phase.WAITING || active.phase == Phase.TRANSFERRING) {
                val fraction = percentOf(active.overallBytes, active.overallTotal) / 100f
                LinearProgressIndicator(progress = { fraction }, modifier = Modifier.fillMaxWidth())
                Text(
                    "${formatBytes(active.fileBytes)} / ${formatBytes(active.fileTotal)} · 总计 ${formatBytes(active.overallBytes)} / ${formatBytes(active.overallTotal)}",
                    style = MaterialTheme.typography.bodySmall,
                )
                TextButton(onClick = onCancel) { Text("取消传输") }
            } else {
                Row {
                    if (showRetry) {
                        TextButton(onClick = onRetry) { Text("重试 / 断点续传") }
                    }
                    TextButton(onClick = onDismiss) { Text("关闭") }
                }
            }
        }
    }
}

@Composable
fun IncomingDialog(offer: PendingOffer, onAccept: () -> Unit, onReject: () -> Unit) {
    val total = offer.files.sumOf { it.size }
    val preview = offer.files.take(6)
    val rest = offer.files.size - preview.size
    AlertDialog(
        onDismissRequest = onReject,
        properties = DialogProperties(dismissOnClickOutside = false),
        title = { Text("接收这些文件？") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text("${offer.peerName} 想发送 ${offer.files.size} 个文件，共 ${formatBytes(total)}。")
                preview.forEach { file ->
                    Text("· ${file.name}（${formatBytes(file.size)}）", maxLines = 1, overflow = TextOverflow.Ellipsis)
                }
                if (rest > 0) Text("还有 $rest 个文件")
                Text("只有点「接收」之后才会保存。", style = MaterialTheme.typography.bodySmall)
            }
        },
        confirmButton = { TextButton(onClick = onAccept) { Text("接收") } },
        dismissButton = { TextButton(onClick = onReject) { Text("拒绝") } },
    )
}

@Composable
fun ManualConnectDialog(
    initialPort: String,
    onDismiss: () -> Unit,
    onConfirm: (String, Int) -> Unit,
) {
    var host by rememberSaveable { mutableStateOf("") }
    var port by rememberSaveable { mutableStateOf(initialPort) }
    var error by rememberSaveable { mutableStateOf(null) }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("手动连接") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("如果列表里没有对方，把对方首页上的 IP 和端口填在这里。")
                OutlinedTextField(
                    value = host,
                    onValueChange = { host = it },
                    label = { Text("IP 地址") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                )
                OutlinedTextField(
                    value = port,
                    onValueChange = { port = it.filter { ch -> ch.isDigit() }.take(5) },
                    label = { Text("端口") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                )
                if (error != null) {
                    Text(error!!, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
                }
            }
        },
        confirmButton = {
            TextButton(onClick = {
                val parsed = HostPort.parse(host, port, Protocol.DEFAULT_PORT)
                parsed.onSuccess { (ip, number) -> onConfirm(ip, number) }
                parsed.onFailure { error = it.message }
            }) { Text("用这个地址发送") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("取消") } },
    )
}

@Composable
fun NameDialog(initial: String, onDismiss: () -> Unit, onSave: (String) -> Unit) {
    var name by rememberSaveable { mutableStateOf(initial) }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("本机名称") },
        text = {
            OutlinedTextField(
                value = name,
                onValueChange = { name = it.take(32) },
                label = { Text("对方会看到这个名字") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
            )
        },
        confirmButton = { TextButton(onClick = { onSave(name) }) { Text("保存") } },
        dismissButton = { TextButton(onClick = onDismiss) { Text("取消") } },
    )
}

========== app/src/main/java/com/lanchuan/app/ui/FileActions.kt ==========
package com.lanchuan.app.ui

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.core.content.FileProvider
import com.lanchuan.app.transfer.TransferRecord
import java.io.File

fun shareableUri(context: Context, saved: String?): Uri? {
    if (saved.isNullOrBlank()) return null
    if (saved.startsWith("content:")) return Uri.parse(saved)
    val file = File(saved)
    if (!file.exists()) return null
    return FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", file)
}

fun openRecord(context: Context, record: TransferRecord) {
    val uri = shareableUri(context, record.savedUri)
    if (uri == null) {
        Toast.makeText(context, "文件不在了，可能已被移动或删除", Toast.LENGTH_SHORT).show()
        return
    }
    val intent = Intent(Intent.ACTION_VIEW).apply {
        setDataAndType(uri, record.mime.ifBlank { "*/*" })
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
    }
    runCatching {
        context.startActivity(Intent.createChooser(intent, "打开文件"))
    }.onFailure {
        Toast.makeText(context, "没有可以打开此文件的应用", Toast.LENGTH_SHORT).show()
    }
}

fun shareRecord(context: Context, record: TransferRecord) {
    val uri = shareableUri(context, record.savedUri)
    if (uri == null) {
        Toast.makeText(context, "没有可分享的文件", Toast.LENGTH_SHORT).show()
        return
    }
    val intent = Intent(Intent.ACTION_SEND).apply {
        type = record.mime.ifBlank { "*/*" }
        putExtra(Intent.EXTRA_STREAM, uri)
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
    }
    runCatching {
        context.startActivity(Intent.createChooser(intent, "分享文件"))
    }.onFailure {
        Toast.makeText(context, "无法分享这个文件", Toast.LENGTH_SHORT).show()
    }
}

========== app/src/main/java/com/lanchuan/app/ui/history/HistoryScreen.kt ==========
package com.lanchuan.app.ui.history

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.lanchuan.app.transfer.TransferRecord
import com.lanchuan.app.transfer.formatBytes
import com.lanchuan.app.ui.LanchuanViewModel
import com.lanchuan.app.ui.openRecord
import com.lanchuan.app.ui.shareRecord
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter

private val timeFormat: DateTimeFormatter = DateTimeFormatter.ofPattern("MM-dd HH:mm")

@Composable
fun HistoryScreen(vm: LanchuanViewModel) {
    val history by vm.history.collectAsStateWithLifecycle()
    var selected by remember { mutableStateOf(null) }
    val context = LocalContext.current

    selected?.let { record ->
        AlertDialog(
            onDismissRequest = { selected = null },
            title = { Text(record.fileName) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("${directionLabel(record.direction)} · ${statusLabel(record.status)}")
                    Text("对方：${record.peerName}")
                    Text("大小：${formatBytes(record.size)}")
                    Text(record.message)
                    Text(formatWhen(record.timeMillis), color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            },
            confirmButton = {
                if (!record.savedUri.isNullOrBlank() && record.status == "success") {
                    TextButton(onClick = { openRecord(context, record) }) { Text("打开") }
                }
            },
            dismissButton = {
                TextButton(onClick = { selected = null }) { Text("关闭") }
            },
        )
    }

    if (history.isEmpty()) {
        Column(
            Modifier
                .fillMaxSize()
                .padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Text("传输记录", style = MaterialTheme.typography.headlineMedium)
            Text("还没有记录。发送或接收完成后，会出现在这里。", color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        return
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(horizontal = 20.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        item {
            Text("传输记录", style = MaterialTheme.typography.headlineMedium, modifier = Modifier.padding(bottom = 4.dp))
        }
        items(history, key = { it.id }) { record ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { selected = record },
            ) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(record.fileName, style = MaterialTheme.typography.titleMedium, maxLines = 1, overflow = TextOverflow.Ellipsis)
                    Text(
                        "${directionLabel(record.direction)} · ${statusLabel(record.status)} · ${formatBytes(record.size)}",
                        style = MaterialTheme.typography.bodySmall,
                        color = if (record.status == "success") MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    Text("${record.peerName} · ${formatWhen(record.timeMillis)}", style = MaterialTheme.typography.bodySmall)
                    Text(record.message, style = MaterialTheme.typography.bodySmall, maxLines = 2, overflow = TextOverflow.Ellipsis)
                    if (record.status == "success" && !record.savedUri.isNullOrBlank()) {
                        TextButton(onClick = { shareRecord(context, record) }) { Text("分享") }
                    }
                    if (record.isReceivePartial()) {
                        TextButton(onClick = { vm.discardPartial(record.fileId) }) { Text("放弃未完成的文件") }
                    }
                    TextButton(onClick = { vm.deleteRecord(record.id) }) { Text("删除这条记录") }
                }
            }
        }
    }
}

private fun directionLabel(direction: String): String = if (direction == "send") "发送" else "接收"

private fun statusLabel(status: String): String = when (status) {
    "success" -> "完成"
    "failed" -> "失败"
    "cancelled" -> "已取消"
    "rejected" -> "已拒绝"
    else -> status
}

private fun formatWhen(millis: Long): String {
    return timeFormat.format(Instant.ofEpochMilli(millis).atZone(ZoneId.systemDefault()))
}

========== app/src/main/java/com/lanchuan/app/ui/home/HomeScreen.kt ==========
package com.lanchuan.app.ui.home

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.lanchuan.app.net.describe
import com.lanchuan.app.net.needsWarning
import com.lanchuan.app.protocol.Protocol
import com.lanchuan.app.protocol.shortCode
import com.lanchuan.app.transfer.Peer
import com.lanchuan.app.ui.LanchuanViewModel
import com.lanchuan.app.web.WebShare
import com.lanchuan.app.ui.ManualConnectDialog
import com.lanchuan.app.ui.NameDialog

@Composable
fun HomeScreen(vm: LanchuanViewModel, onSend: () -> Unit) {
    val settings by vm.settings.collectAsStateWithLifecycle()
    val peers by vm.peers.collectAsStateWithLifecycle()
    val listening by vm.listening.collectAsStateWithLifecycle()
    val listenError by vm.listenError.collectAsStateWithLifecycle()
    val webOn by vm.webEnabled.collectAsStateWithLifecycle()
    val webError by vm.webError.collectAsStateWithLifecycle()
    val shareOutCount by vm.shareOutCount.collectAsStateWithLifecycle()
    val discoveryError by vm.discoveryError.collectAsStateWithLifecycle()
    val ip by vm.primaryIp.collectAsStateWithLifecycle()
    val extras by vm.extraIps.collectAsStateWithLifecycle()
    val net by vm.netKind.collectAsStateWithLifecycle()
    val nearby by vm.nearbyGranted.collectAsStateWithLifecycle()
    var editing by rememberSaveable { mutableStateOf(false) }
    var manual by rememberSaveable { mutableStateOf(false) }
    val code = shortCode(settings.deviceId)
    val sharePicker = rememberLauncherForActivityResult(ActivityResultContracts.OpenMultipleDocuments()) { uris ->
        if (!uris.isNullOrEmpty()) vm.onShareOutPicked(uris)
    }

    if (editing) {
        NameDialog(
            initial = settings.displayName,
            onDismiss = { editing = false },
            onSave = {
                vm.updateName(it)
                editing = false
            },
        )
    }
    if (manual) {
        ManualConnectDialog(
            initialPort = settings.port.toString(),
            onDismiss = { manual = false },
            onConfirm = { host, port ->
                vm.selectManual(host, port)
                manual = false
                onSend()
            },
        )
    }

    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text("局域网传", style = MaterialTheme.typography.headlineLarge)
            Text(
                "同一 Wi-Fi 下互传文件，不经过互联网。",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }

        WebCard(
            enabled = webOn,
            ip = ip,
            extras = extras,
            error = webError,
            shareOutCount = shareOutCount,
            onToggle = vm::toggleWeb,
            onCopy = vm::copyWebUrl,
            onPickForPc = { sharePicker.launch(arrayOf("*/*")) },
            onClearShareOut = vm::clearShareOut,
        )

        Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        Text("本机", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Text(
                            settings.displayName.ifBlank { "正在准备…" },
                            style = MaterialTheme.typography.titleLarge,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                        )
                    }
                    IconButton(onClick = { editing = true }) {
                        Icon(Icons.Filled.Edit, contentDescription = "修改名称")
                    }
                }
                Text(
                    ip ?: "未获取到 IP",
                    style = MaterialTheme.typography.headlineSmall,
                    fontFamily = FontFamily.Monospace,
                )
                if (extras.isNotEmpty()) {
                    Text(
                        "其他地址：${extras.joinToString("，")}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    MetaChip("手机端口 ${settings.port}")
                    MetaChip("识别码 $code")
                }
                Text(
                    net.describe(),
                    style = MaterialTheme.typography.bodySmall,
                    color = if (net.needsWarning()) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurfaceVariant,
                )
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        Text("允许接收", style = MaterialTheme.typography.titleMedium)
                        Text(
                            if (listening) "正在监听。其他手机可以发现你，也可以用上面的 IP 和手机端口手动连接。" else "未监听。打开后，其他手机才能把文件发给你。",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                    Switch(checked = listening, onCheckedChange = vm::toggleListen)
                }
                if (!listenError.isNullOrBlank()) {
                    Text(listenError!!, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
                }
                OutlinedButton(onClick = vm::copyAddress, modifier = Modifier.fillMaxWidth()) {
                    Text(if (ip.isNullOrBlank()) "复制手机地址" else "复制手机地址 $ip:${settings.port}")
                }
            }
        }

        if (!nearby) {
            Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer)) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("还没有「附近的设备」权限", style = MaterialTheme.typography.titleSmall)
                    Text("自动发现可能不可用。你仍然可以让对方输入上面的 IP。")
                    TextButtonLike { vm.requestNearbyPermission() }
                }
            }
        }

        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("附近的设备", style = MaterialTheme.typography.titleLarge, modifier = Modifier.weight(1f))
            IconButton(onClick = vm::restartDiscovery) {
                Icon(Icons.Filled.Refresh, contentDescription = "重新搜索")
            }
        }
        if (!discoveryError.isNullOrBlank()) {
            Text(discoveryError!!, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
        }
        if (peers.isEmpty()) {
            Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("还没有发现其他设备", style = MaterialTheme.typography.titleMedium)
                    Text("请让对方也打开「局域网传」，并打开「允许接收」。两台设备要在同一个 Wi-Fi，最好关掉 VPN。如果一直找不到，多半是路由器拦截了设备发现。")
                    Button(onClick = { manual = true }, modifier = Modifier.fillMaxWidth()) {
                        Text("输入 IP 手动连接")
                    }
                }
            }
        } else {
            peers.forEach { peer ->
                PeerCard(peer, onSend = {
                    vm.selectTarget(peer)
                    onSend()
                })
            }
            OutlinedButton(onClick = { manual = true }, modifier = Modifier.fillMaxWidth()) {
                Text("列表里没有？输入 IP")
            }
        }
    }
}

@Composable
private fun WebCard(
    enabled: Boolean,
    ip: String?,
    extras: List,
    error: String?,
    shareOutCount: Int,
    onToggle: (Boolean) -> Unit,
    onCopy: () -> Unit,
    onPickForPc: () -> Unit,
    onClearShareOut: () -> Unit,
) {
    val url = if (ip.isNullOrBlank()) null else "http://$ip:${WebShare.PORT}/"
    val others = extras.filter { it.isNotBlank() && it != ip }
    Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text("网页互传", style = MaterialTheme.typography.titleMedium)
                    Text(
                        "电脑浏览器打开下面的网址，就能给手机上传或从手机下载。",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onPrimaryContainer,
                    )
                }
                Switch(checked = enabled, onCheckedChange = onToggle)
            }
            if (enabled) {
                Text(
                    url ?: "正在获取本机 IP…",
                    style = MaterialTheme.typography.headlineMedium,
                    fontFamily = FontFamily.Monospace,
                )
                if (others.isNotEmpty()) {
                    Text(
                        "打不开时试试：${others.joinToString("  ") { "http:
                        style = MaterialTheme.typography.bodySmall,
                        fontFamily = FontFamily.Monospace,
                    )
                }
                Text(
                    "只在浏览器里打开这个网址。手机端口 ${Protocol.DEFAULT_PORT} 是给另一台手机手动连接用的，不要在浏览器里打开。",
                    style = MaterialTheme.typography.bodySmall,
                )
                Button(onClick = onPickForPc, modifier = Modifier.fillMaxWidth()) {
                    Text("选择文件给电脑下载")
                }
                if (shareOutCount > 0) {
                    Text(
                        "已选 $shareOutCount 个文件，电脑刷新网页后即可下载。",
                        style = MaterialTheme.typography.bodySmall,
                    )
                    OutlinedButton(onClick = onClearShareOut, modifier = Modifier.fillMaxWidth()) {
                        Text("清空待下载")
                    }
                } else {
                    Text(
                        "先点上面选文件，再在电脑网页的「从手机下载」里点下载。",
                        style = MaterialTheme.typography.bodySmall,
                    )
                }
                Button(onClick = onCopy, enabled = url != null, modifier = Modifier.fillMaxWidth()) {
                    Text("复制网址")
                }
            }
            if (!error.isNullOrBlank()) {
                Text(error, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
            }
        }
    }
}

@Composable
private fun PeerCard(peer: Peer, onSend: () -> Unit) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(peer.name, style = MaterialTheme.typography.titleMedium, maxLines = 1, overflow = TextOverflow.Ellipsis)
            val code = if (peer.deviceId.startsWith("manual:")) "手动" else shortCode(peer.deviceId)
            Text(
                "$code · ${peer.host}:${peer.port}",
                style = MaterialTheme.typography.bodySmall,
                fontFamily = FontFamily.Monospace,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Button(onClick = onSend, modifier = Modifier.fillMaxWidth()) { Text("给它发文件") }
        }
    }
}

@Composable
private fun MetaChip(text: String) {
    Surface(
        color = MaterialTheme.colorScheme.primaryContainer,
        contentColor = MaterialTheme.colorScheme.onPrimaryContainer,
        shape = MaterialTheme.shapes.small,
    ) {
        Text(text, modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp), style = MaterialTheme.typography.labelLarge)
    }
}

@Composable
private fun TextButtonLike(onClick: () -> Unit) {
    androidx.compose.material3.TextButton(onClick = onClick) { Text("重新请求权限") }
}

========== app/src/main/java/com/lanchuan/app/ui/LanchuanViewModel.kt ==========
package com.lanchuan.app.ui

import android.app.Application
import android.content.ClipData
import android.content.ClipboardManager
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import androidx.core.content.ContextCompat
import androidx.lifecycle.AndroidViewModel
import com.lanchuan.app.LanchuanApp
import com.lanchuan.app.data.TransferRepository
import com.lanchuan.app.transfer.Peer
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow

sealed interface UiEvent {
    data object RequestNotifications : UiEvent
    data object RequestNearby : UiEvent
    data object PickSaveTree : UiEvent
}

class LanchuanViewModel(app: Application) : AndroidViewModel(app) {
    private val repo: TransferRepository = (app as LanchuanApp).repository
    val settings = repo.settings
    val history = repo.history
    val peers = repo.peers
    val listening = repo.listening
    val listenError = repo.listenError
    val webEnabled = repo.webEnabled
    val webError = repo.webError
    val discoveryError = repo.discoveryError
    val primaryIp = repo.primaryIp
    val extraIps = repo.extraIps
    val netKind = repo.netKind
    val pendingOffer = repo.pendingOffer
    val active = repo.active
    val draft = repo.draft
    val toasts = repo.toasts
    val shareOutCount = repo.shareOutCount

    private val _nearbyGranted = MutableStateFlow(true)
    val nearbyGranted = _nearbyGranted.asStateFlow()
    private val _notificationGranted = MutableStateFlow(true)
    val notificationGranted = _notificationGranted.asStateFlow()
    private val _events = MutableSharedFlow(extraBufferCapacity = 8)
    val events = _events.asSharedFlow()
    private var askedNearby = false
    private var pendingListen = false
    private var pendingWeb = false

    init {
        refreshPermissions()
        repo.refreshNetwork()
        repo.startDiscovery()
    }

    override fun onCleared() {
        repo.stopDiscovery()
        super.onCleared()
    }

    fun onUiReady() {
        refreshPermissions()
        if (Build.VERSION.SDK_INT >= 33 && !_nearbyGranted.value && !askedNearby) {
            askedNearby = true
            _events.tryEmit(UiEvent.RequestNearby)
        }
    }

    fun refreshPermissions() {
        _nearbyGranted.value = granted(android.Manifest.permission.NEARBY_WIFI_DEVICES, 33)
        _notificationGranted.value = granted(android.Manifest.permission.POST_NOTIFICATIONS, 33)
    }

    fun refreshNetwork() = repo.refreshNetwork()

    fun restartDiscovery() = repo.restartDiscovery()

    fun setUiVisible(visible: Boolean) = repo.setUiVisible(visible)

    fun toggleListen(want: Boolean) {
        if (!want) {
            repo.stopListening()
            return
        }
        if (Build.VERSION.SDK_INT >= 33 && !_notificationGranted.value) {
            pendingListen = true
            _events.tryEmit(UiEvent.RequestNotifications)
            return
        }
        repo.startListening()
    }

    fun toggleWeb(want: Boolean) {
        if (!want) {
            repo.stopWeb()
            return
        }
        if (Build.VERSION.SDK_INT >= 33 && !_notificationGranted.value) {
            pendingWeb = true
            _events.tryEmit(UiEvent.RequestNotifications)
            return
        }
        repo.startWeb()
    }

    fun onNotificationResult(granted: Boolean) {
        _notificationGranted.value = granted
        val startListen = pendingListen
        val startWeb = pendingWeb
        pendingListen = false
        pendingWeb = false
        if (!granted && (startListen || startWeb)) {
            repo.postMessage("未授予通知权限。服务仍会开始，但状态栏可能看不到进度。")
        }
        if (startListen) repo.startListening()
        if (startWeb) repo.startWeb()
    }

    fun acceptPending() = repo.acceptPending()

    fun rejectPending() = repo.rejectPending()

    fun cancelTransfer() = repo.cancelTransfer()

    fun dismissActive() = repo.dismissActive()

    fun selectTarget(peer: Peer) = repo.selectTarget(peer)

    fun selectManual(host: String, port: Int) = repo.selectManual(host, port)

    fun onFilesPicked(uris: List) = repo.onFilesPicked(uris)

    fun onShareOutPicked(uris: List) = repo.onShareOutPicked(uris)

    fun clearShareOut() = repo.clearShareOut()

    fun removeFile(id: String) = repo.removeFile(id)

    fun startSend() = repo.startSend()

    fun updateName(name: String) = repo.updateName(name)

    fun updatePort(port: Int) = repo.updatePort(port)

    fun setSaveTree(uri: Uri) = repo.setSaveTree(uri)

    fun clearSaveTree() = repo.clearSaveTree()

    fun deleteRecord(id: String) = repo.deleteRecord(id)

    fun clearHistory() = repo.clearHistory()

    fun discardPartial(fileId: String) = repo.discardPartial(fileId)

    fun requestSaveTree() {
        _events.tryEmit(UiEvent.PickSaveTree)
    }

    fun requestNearbyPermission() {
        if (Build.VERSION.SDK_INT >= 33) _events.tryEmit(UiEvent.RequestNearby)
    }

    fun copyAddress() {
        val ip = repo.primaryIp.value
        if (ip.isNullOrBlank()) {
            repo.postMessage("还没有拿到本机 IP")
            return
        }
        val text = "$ip:${repo.settings.value.port}"
        copyText(text, "已复制手机地址 $text")
    }

    fun copyWebUrl() {
        val text = repo.webUrl()
        if (text.isNullOrBlank()) {
            repo.postMessage("还没有拿到本机 IP，网页地址暂时无法复制")
            return
        }
        copyText(text, "已复制 $text")
    }

    private fun copyText(text: String, toast: String) {
        val clipboard = getApplication().getSystemService(ClipboardManager::class.java)
        clipboard?.setPrimaryClip(ClipData.newPlainText("lanchuan", text))
        repo.postMessage(toast)
    }

    private fun granted(permission: String, minSdk: Int): Boolean {
        if (Build.VERSION.SDK_INT
        if (!uris.isNullOrEmpty()) vm.onFilesPicked(uris)
    }
    val busy = active?.phase == Phase.WAITING || active?.phase == Phase.TRANSFERRING
    val total = draft.files.sumOf { it.size }

    if (manual) {
        ManualConnectDialog(
            initialPort = settings.port.toString(),
            onDismiss = { manual = false },
            onConfirm = { host, port ->
                vm.selectManual(host, port)
                manual = false
            },
        )
    }

    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        Text("发送文件", style = MaterialTheme.typography.headlineMedium)
        Text(
            "先选一台设备，再选文件。对方要点「接收」之后才会开始传。",
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )

        Text("发给谁", style = MaterialTheme.typography.titleMedium)
        if (peers.isEmpty() && draft.target == null) {
            Text("附近还没有设备。可以手动输入 IP。", color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        peers.forEach { peer ->
            val selected = draft.target?.host == peer.host && draft.target?.port == peer.port &&
                !draft.target?.deviceId.orEmpty().startsWith("manual:")
            Row(
                Modifier
                    .fillMaxWidth()
                    .selectable(selected = selected, role = Role.RadioButton, onClick = { vm.selectTarget(peer) })
                    .padding(vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                RadioButton(selected = selected, onClick = { vm.selectTarget(peer) })
                Column(Modifier.padding(start = 8.dp)) {
                    Text(peer.name, maxLines = 1, overflow = TextOverflow.Ellipsis)
                    Text(
                        "${shortCode(peer.deviceId)} · ${peer.host}:${peer.port}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
        }
        val manualTarget = draft.target?.takeIf { it.deviceId.startsWith("manual:") }
        if (manualTarget != null) {
            Text("手动地址：${manualTarget.host}:${manualTarget.port}", style = MaterialTheme.typography.bodyMedium)
        }
        OutlinedButton(onClick = { manual = true }) { Text("输入 IP 和端口") }

        Text("文件", style = MaterialTheme.typography.titleMedium)
        if (draft.files.isEmpty()) {
            Text("还没有选择文件。可以一次选多个。", color = MaterialTheme.colorScheme.onSurfaceVariant)
        } else {
            Text("共 ${draft.files.size} 个，${formatBytes(total)}")
            draft.files.forEach { file ->
                Card {
                    Row(Modifier.padding(start = 16.dp), verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f).padding(vertical = 12.dp)) {
                            Text(file.name, maxLines = 1, overflow = TextOverflow.Ellipsis)
                            Text(formatBytes(file.size), style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        IconButton(onClick = { vm.removeFile(file.id) }, enabled = !busy) {
                            Icon(Icons.Filled.Close, contentDescription = "移除")
                        }
                    }
                }
            }
        }
        OutlinedButton(
            onClick = { picker.launch(arrayOf("*/*")) },
            enabled = !busy,
            modifier = Modifier.fillMaxWidth(),
        ) { Text("选择文件") }

        Button(
            onClick = vm::startSend,
            enabled = !busy && draft.target != null && draft.files.isNotEmpty(),
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text(if (busy) "传输进行中" else "开始发送")
        }
        if (active?.phase == Phase.FAILED && active?.direction == com.lanchuan.app.transfer.Direction.SEND) {
            Text(
                "如果已经传了一部分，点上方的「重试 / 断点续传」会从断开的位置继续。重新选择文件会换成新任务，不能接着传。",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}

========== app/src/main/java/com/lanchuan/app/ui/settings/SettingsScreen.kt ==========
package com.lanchuan.app.ui.settings

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.lanchuan.app.ui.LanchuanViewModel

@Composable
fun SettingsScreen(vm: LanchuanViewModel) {
    val settings by vm.settings.collectAsStateWithLifecycle()
    var name by rememberSaveable(settings.displayName) { mutableStateOf(settings.displayName) }
    var port by rememberSaveable(settings.port) { mutableStateOf(settings.port.toString()) }
    var confirmClear by rememberSaveable { mutableStateOf(false) }
    val context = LocalContext.current
    val version = rememberVersion(context)

    if (confirmClear) {
        androidx.compose.material3.AlertDialog(
            onDismissRequest = { confirmClear = false },
            title = { Text("清空记录？") },
            text = { Text("只删除列表，不会删除已经保存的文件。") },
            confirmButton = {
                TextButton(onClick = {
                    vm.clearHistory()
                    confirmClear = false
                }) { Text("清空") }
            },
            dismissButton = { TextButton(onClick = { confirmClear = false }) { Text("取消") } },
        )
    }

    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        Text("设置", style = MaterialTheme.typography.headlineMedium)
        OutlinedTextField(
            value = name,
            onValueChange = { name = it.take(32) },
            label = { Text("本机名称") },
            supportingText = { Text("附近设备看到的名字") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
        )
        OutlinedTextField(
            value = port,
            onValueChange = { port = it.filter { ch -> ch.isDigit() }.take(5) },
            label = { Text("监听端口") },
            supportingText = { Text("手机和手机之间的端口，默认 38765。电脑浏览器请用首页的网页地址（端口 38766），不要在浏览器里打开这个端口。") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
        )
        Button(
            onClick = {
                vm.updateName(name)
                val number = port.toIntOrNull()
                if (number != null) vm.updatePort(number)
            },
            modifier = Modifier.fillMaxWidth(),
        ) { Text("保存名称和端口") }

        Card {
            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("保存位置", style = MaterialTheme.typography.titleMedium)
                Text(saveLabel(settings.saveTreeUri), color = MaterialTheme.colorScheme.onSurfaceVariant)
                OutlinedButton(onClick = vm::requestSaveTree, modifier = Modifier.fillMaxWidth()) {
                    Text("选择文件夹")
                }
                if (!settings.saveTreeUri.isNullOrBlank()) {
                    TextButton(onClick = vm::clearSaveTree) { Text("恢复默认位置") }
                }
            }
        }

        Card(colors = androidx.compose.material3.CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)) {
            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("请在可信的 Wi-Fi 里使用", style = MaterialTheme.typography.titleMedium)
                Text("文件只在局域网里传输，没有加密，也没有账号。手机发来的文件，接收前会请你确认。网页互传打开后，同一 Wi-Fi 里知道网址的人可以直接上传和下载，用完请关掉。不要在咖啡馆这种不信任的网络里开着。")
            }
        }

        OutlinedButton(onClick = { confirmClear = true }, modifier = Modifier.fillMaxWidth()) {
            Text("清空传输记录")
        }
        Text("版本 $version", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

@Composable
private fun rememberVersion(context: android.content.Context): String {
    return androidx.compose.runtime.remember(context) {
        runCatching {
            context.packageManager.getPackageInfo(context.packageName, 0).versionName
        }.getOrNull() ?: "1.0.0"
    }
}

private fun saveLabel(tree: String?): String {
    return if (tree.isNullOrBlank()) {
        if (android.os.Build.VERSION.SDK_INT >= 29) {
            "默认：系统「下载 / 局域网传」"
        } else {
            "默认：应用目录。Android 8 没有公共下载接口，收完后可在记录里分享出去。"
        }
    } else {
        "已选择自定义文件夹。新收到的文件会写到那里。"
    }
}

========== app/src/main/java/com/lanchuan/app/ui/theme/Theme.kt ==========
package com.lanchuan.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

private val Pine = Color(0xFF0F6E56)
private val PineInk = Color(0xFF06281F)
private val Mist = Color(0xFFD5F3E6)
private val Clay = Color(0xFF8C4E12)
private val Paper = Color(0xFFF7F4EE)
private val Ink = Color(0xFF1C1B19)

private val LightColors = lightColorScheme(
    primary = Pine,
    onPrimary = Color.White,
    primaryContainer = Mist,
    onPrimaryContainer = PineInk,
    secondary = Clay,
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFFFE3C6),
    onSecondaryContainer = Color(0xFF2E1500),
    background = Paper,
    onBackground = Ink,
    surface = Color(0xFFFFFCF8),
    onSurface = Ink,
    surfaceVariant = Color(0xFFE7E1D6),
    onSurfaceVariant = Color(0xFF4E4942),
    error = Color(0xFFB3261E),
    onError = Color.White,
    errorContainer = Color(0xFFF9DEDC),
    onErrorContainer = Color(0xFF410E0B),
    outline = Color(0xFF7E786E),
)

private val DarkColors = darkColorScheme(
    primary = Color(0xFF8FDBB8),
    onPrimary = Color(0xFF003828),
    primaryContainer = Pine,
    onPrimaryContainer = Mist,
    secondary = Color(0xFFFFB86B),
    onSecondary = Color(0xFF4A2800),
    secondaryContainer = Color(0xFF6A3A08),
    onSecondaryContainer = Color(0xFFFFE3C6),
    background = Color(0xFF141412),
    onBackground = Color(0xFFE8E4DC),
    surface = Color(0xFF1C1C19),
    onSurface = Color(0xFFE8E4DC),
    surfaceVariant = Color(0xFF33312C),
    onSurfaceVariant = Color(0xFFD0C9BC),
    error = Color(0xFFFFB4AB),
    onError = Color(0xFF690005),
    errorContainer = Color(0xFF8C1D18),
    onErrorContainer = Color(0xFFFFDAD6),
    outline = Color(0xFF9A9488),
)

private val AppShapes = Shapes(
    small = RoundedCornerShape(10.dp),
    medium = RoundedCornerShape(16.dp),
    large = RoundedCornerShape(24.dp),
)

@Composable
fun LanchuanTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = if (isSystemInDarkTheme()) DarkColors else LightColors,
        typography = Typography(),
        shapes = AppShapes,
        content = content,
    )
}

========== app/src/main/java/com/lanchuan/app/web/LanAddress.kt ==========
package com.lanchuan.app.web

import java.net.InetAddress

object LanAddress {
    fun isAllowed(address: InetAddress): Boolean {
        if (address.isLoopbackAddress || address.isLinkLocalAddress || address.isSiteLocalAddress) return true
        val bytes = address.address
        if (bytes.size == 16) {
            val first = bytes[0].toInt() and 0xff
            if (first and 0xfe == 0xfc) return true
        }
        return false
    }
}

========== app/src/main/java/com/lanchuan/app/web/MultipartReader.kt ==========
package com.lanchuan.app.web

import java.io.ByteArrayOutputStream
import java.io.InputStream
import java.net.URLDecoder

internal class MultipartReader(
    raw: InputStream,
    boundary: String,
) {
    private val peek = PeekBuffer(raw)
    private val firstDelimiter = "--$boundary".toByteArray(Charsets.ISO_8859_1)
    private val nextDelimiter = "\r\n--$boundary".toByteArray(Charsets.ISO_8859_1)

    fun readFiles(maxFiles: Int, onFile: (name: String, mime: String, body: InputStream) -> Unit): Int {
        if (boundaryTooShort(firstDelimiter) || !peek.discardThrough(firstDelimiter)) {
            throw WebException("上传内容格式不正确")
        }
        var count = 0
        while (true) {
            val marker = peek.readAscii(2)
            if (marker == "--") break
            if (marker != "\r\n") throw WebException("上传内容格式不正确")
            val headers = peek.readHeaders(8 * 1024)
            val disposition = headerValue(headers, "content-disposition")
            val filename = contentFileName(disposition)
            val mime = headerValue(headers, "content-type").substringBefore(';').trim()
            val body = peek.openUntil(nextDelimiter)
            try {
                if (filename != null) {
                    if (count >= maxFiles) throw WebException("一次最多上传 $maxFiles 个文件")
                    onFile(filename, mime, body)
                    count++
                }
            } finally {
                body.drain()
            }
        }
        return count
    }

    private fun boundaryTooShort(delimiter: ByteArray): Boolean = delimiter.size  200) return null
    return value
}

internal fun contentFileName(disposition: String): String? {
    if (disposition.isBlank()) return null
    val star = Regex("""filename\*\s*=\s*([^;]+)""", RegexOption.IGNORE_CASE).find(disposition)
    if (star != null) {
        val raw = star.groupValues[1].trim().trim('"')
        val encoded = raw.substringAfter("''", raw)
        val decoded = runCatching { URLDecoder.decode(encoded, Charsets.UTF_8.name()) }.getOrNull()
        if (!decoded.isNullOrBlank()) return decoded
    }
    val quoted = Regex("""filename\s*=\s*"((?:\\.|[^"\\])*)"""", RegexOption.IGNORE_CASE).find(disposition)
    if (quoted != null) {
        val value = quoted.groupValues[1].replace("\\\"", "\"").replace("\\\\", "\\")
        if (value.isNotBlank()) return value
    }
    val plain = Regex("""filename\s*=\s*([^;]+)""", RegexOption.IGNORE_CASE).find(disposition)
    val bare = plain?.groupValues?.get(1)?.trim()?.trim('"')
    return bare?.takeIf { it.isNotBlank() }
}

private fun headerValue(headers: Map, name: String): String = headers[name].orEmpty()

private class PeekBuffer(private val raw: InputStream) {
    private var buf = ByteArray(256 * 1024)
    private var pos = 0
    private var limit = 0
    private var eof = false

    fun discardThrough(pattern: ByteArray): Boolean {
        while (true) {
            val index = indexOf(buf, pos, limit, pattern)
            if (index >= 0) {
                pos = index + pattern.size
                return true
            }
            val keep = (pattern.size - 1).coerceAtMost(limit - pos)
            pos = limit - keep
            if (!pull()) return false
        }
    }

    fun readAscii(count: Int): String {
        val bytes = ByteArray(count)
        var filled = 0
        while (filled = limit && !pull()) throw WebException("上传内容不完整")
            val n = minOf(count - filled, limit - pos)
            System.arraycopy(buf, pos, bytes, filled, n)
            pos += n
            filled += n
        }
        return bytes.toString(Charsets.ISO_8859_1)
    }

    fun readHeaders(maxBytes: Int): Map {
        val collected = ByteArrayOutputStream()
        while (collected.size() = limit && !pull()) throw WebException("上传内容不完整")
            val value = buf[pos].toInt() and 0xff
            pos++
            collected.write(value)
            val size = collected.size()
            if (size >= 4) {
                val raw = collected.toByteArray()
                if (raw[size - 4] == 13.toByte() && raw[size - 3] == 10.toByte() &&
                    raw[size - 2] == 13.toByte() && raw[size - 1] == 10.toByte()
                ) {
                    return parseHeaderBlock(raw.copyOf(size - 4).toString(Charsets.UTF_8))
                }
            }
        }
        throw WebException("上传的文件头过大")
    }

    fun openUntil(pattern: ByteArray): PartBody = PartBody(pattern)

    private fun pull(): Boolean {
        if (eof) return false
        compact()
        if (limit == buf.size) buf = buf.copyOf(buf.size * 2)
        val n = raw.read(buf, limit, buf.size - limit)
        if (n  {
        val headers = LinkedHashMap()
        for (line in text.split("\r\n")) {
            val colon = line.indexOf(':')
            if (colon = 0) {
                    val available = index - pos
                    if (available == 0) {
                        pos = index + pattern.size
                        done = true
                        return -1
                    }
                    val n = minOf(len, available)
                    System.arraycopy(buf, pos, b, off, n)
                    pos += n
                    return n
                }
                val safeEnd = limit - (pattern.size - 1)
                if (safeEnd > pos) {
                    val n = minOf(len, safeEnd - pos)
                    System.arraycopy(buf, pos, b, off, n)
                    pos += n
                    return n
                }
                if (!pull()) throw WebException("上传未完成，连接已中断")
            }
        }

        fun drain() {
            if (done) return
            try {
                val sink = ByteArray(16 * 1024)
                while (read(sink) >= 0) {

                }
            } catch (_: Exception) {
                done = true
            }
        }
    }
}

private fun indexOf(data: ByteArray, start: Int, end: Int, pattern: ByteArray): Int {
    if (pattern.isEmpty() || end - start
    fun open(id: String): WebBody?
    fun startUpload(name: String, mime: String): WebUpload
}

object WebShare {

    const val PORT = 38766
    const val MAX_FILES = 40
}

object WebIds {
    fun of(key: String): String {
        val digest = MessageDigest.getInstance("SHA-256").digest(key.toByteArray(Charsets.UTF_8))
        val hex = StringBuilder(16)
        for (index in 0 until 8) {
            hex.append("%02x".format(digest[index].toInt() and 0xff))
        }
        return hex.toString()
    }
}

class WebException(message: String) : java.io.IOException(message)

========== app/src/main/java/com/lanchuan/app/web/WebPage.kt ==========
package com.lanchuan.app.web

import com.lanchuan.app.transfer.formatBytes

internal fun renderPage(items: List): String {
    val rows = if (items.isEmpty()) {
        """手机上点「选择文件给电脑下载」后，文件会出现在这里。

"""
    } else {
        items.joinToString("\n") { item ->
            val name = escapeHtml(item.name)
            val size = escapeHtml(formatBytes(item.size))
            """[${name}${size}](/d/${item.id})"""
        }
    }
    return """

        局域网传

# 局域网传

          把文件传到手机，或从手机下载到这台电脑。请让手机保持「网页互传」开着，并且和电脑连同一个 Wi-Fi。

## 上传到手机

            可以选择多个文件。大文件会显示进度，传完之前不要关掉这个页面。

            开始上传

## 从手机下载

            在手机首页打开网页互传后，点「选择文件给电脑下载」，选好的文件会出现在下面。

            $rows

          这个页面只在当前局域网里有效。关掉手机上的网页互传后就打不开了。

    """.trimIndent()
}

internal fun escapeHtml(value: String): String {
    val out = StringBuilder(value.length)
    for (ch in value) {
        when (ch) {
            '&' -> out.append("&")
            ' out.append("' -> out.append(">")
            '"' -> out.append(""")
            else -> out.append(ch)
        }
    }
    return out.toString()
}

========== app/src/main/java/com/lanchuan/app/web/WebShareServer.kt ==========
package com.lanchuan.app.web

import com.lanchuan.app.protocol.sanitizeFileName
import com.lanchuan.app.protocol.sanitizeMime
import java.io.InputStream
import java.io.OutputStream
import java.net.InetSocketAddress
import java.net.ServerSocket
import java.net.Socket
import java.net.URLEncoder
import java.util.concurrent.Executors
import java.util.concurrent.RejectedExecutionException
import java.util.concurrent.Semaphore
import java.util.concurrent.atomic.AtomicInteger

class WebShareServer(
    private val catalog: WebCatalog,
    private val onBusy: (Boolean) -> Unit = {},
    private val log: (String) -> Unit = {},
) {
    private val uploadSlots = Semaphore(2)
    private val busy = AtomicInteger(0)

    @Volatile
    private var running = false

    @Volatile
    var boundPort: Int = -1
        private set

    private var serverSocket: ServerSocket? = null
    private var acceptThread: Thread? = null
    private var workers = Executors.newFixedThreadPool(4) { runnable ->
        Thread(runnable, "lanchuan-web").apply { isDaemon = true }
    }

    fun start(port: Int, host: String = "0.0.0.0"): String? {
        synchronized(this) {
            stop()
            return try {
                val socket = ServerSocket()
                socket.reuseAddress = true
                socket.bind(InetSocketAddress(host, port))
                workers = Executors.newFixedThreadPool(4) { runnable ->
                    Thread(runnable, "lanchuan-web").apply { isDaemon = true }
                }
                serverSocket = socket
                boundPort = socket.localPort
                running = true
                val thread = Thread({ acceptLoop(socket) }, "lanchuan-web-accept")
                thread.isDaemon = true
                acceptThread = thread
                thread.start()
                log("网页互传已打开 $boundPort")
                null
            } catch (error: Exception) {
                running = false
                boundPort = -1
                bindMessage(error, port)
            }
        }
    }

    fun stop() {
        synchronized(this) {
            running = false
            try {
                serverSocket?.close()
            } catch (_: Exception) {
            }
            serverSocket = null
            boundPort = -1
            try {
                acceptThread?.join(400)
            } catch (_: InterruptedException) {
                Thread.currentThread().interrupt()
            }
            acceptThread = null
            workers.shutdownNow()
        }
    }

    private fun acceptLoop(socket: ServerSocket) {
        while (running) {
            val client = try {
                socket.accept()
            } catch (error: Exception) {
                if (running) log("网页接入失败：${error.message}")
                continue
            }
            if (!running) {
                client.close()
                break
            }
            try {
                workers.execute {
                    enter()
                    try {
                        handle(client)
                    } catch (error: Exception) {
                        log("网页请求失败：${error.message}")
                    } finally {
                        try {
                            client.close()
                        } catch (_: Exception) {
                        }
                        leave()
                    }
                }
            } catch (_: RejectedExecutionException) {
                try {
                    client.close()
                } catch (_: Exception) {
                }
            }
        }
    }

    private fun enter() {
        if (busy.incrementAndGet() == 1) onBusy(true)
    }

    private fun leave() {
        if (busy.decrementAndGet() == 0) onBusy(false)
    }

    private fun handle(socket: Socket) {
        socket.tcpNoDelay = true
        socket.soTimeout = 20_000
        val remote = socket.inetAddress
        val output = socket.getOutputStream()
        if (remote == null || !LanAddress.isAllowed(remote)) {
            writeText(output, 403, "仅允许同一局域网内的设备访问。")
            return
        }
        val input = socket.getInputStream()
        val head = readHttpHead(input) ?: run {
            writeText(output, 400, "请求不完整。")
            return
        }
        val request = parseRequest(head) ?: run {
            writeText(output, 400, "无法识别这个请求。")
            return
        }
        if (request.expectContinue) {
            output.write("HTTP/1.1 100 Continue\r\n\r\n".toByteArray(Charsets.US_ASCII))
            output.flush()
        }
        socket.soTimeout = 120_000
        when {
            request.method == "GET" && (request.path == "/" || request.path == "/index.html") -> {
                val html = renderPage(catalog.list()).toByteArray(Charsets.UTF_8)
                writeBytes(output, 200, "OK", "text/html; charset=utf-8", html, noStore = true)
            }
            request.method == "GET" && request.path == "/favicon.ico" -> {
                writeBytes(output, 204, "No Content", "text/plain", ByteArray(0), noStore = true)
            }
            request.method == "GET" && request.path.startsWith("/d/") -> {
                download(output, request.path.removePrefix("/d/"))
            }
            request.method == "POST" && request.path == "/upload" -> {
                upload(input, output, request)
            }
            else -> writeText(output, 404, "页面不存在。")
        }
    }

    private fun download(output: OutputStream, id: String) {
        if (!id.matches(Regex("^[a-f0-9]{16}$"))) {
            writeText(output, 404, "找不到这个文件。")
            return
        }
        val body = catalog.open(id)
        if (body == null) {
            writeText(output, 404, "找不到这个文件，可能已经被删除。")
            return
        }
        body.stream.use { stream ->
            writeDownload(output, body.item, stream)
        }
    }

    private fun upload(input: InputStream, output: OutputStream, request: HttpRequest) {
        val length = request.contentLength
        if (length == null) {
            writeText(output, 411, "浏览器没有说明上传大小，请换 Chrome 或 Edge 再试。")
            return
        }
        if (length ()
            val count = MultipartReader(body, boundary).readFiles(WebShare.MAX_FILES) { rawName, rawMime, part ->
                val upload = catalog.startUpload(rawName, rawMime)
                var committed = false
                try {
                    val buffer = ByteArray(256 * 1024)
                    while (true) {
                        val n = part.read(buffer)
                        if (n  0) upload.write(buffer, 0, n)
                    }
                    upload.commit()
                    committed = true
                    saved += sanitizeFileName(rawName)
                } finally {
                    if (!committed) upload.abort()
                }
            }
            if (count  ch.code > 127 } || it.contains("无法") || it.contains("空间") }
                ?: "上传失败，请重试。"
            writeText(output, 500, message)
        } finally {
            uploadSlots.release()
        }
    }

    private fun writeDownload(output: OutputStream, item: WebItem, stream: InputStream) {
        val mime = sanitizeMime(item.mime)
        val name = sanitizeFileName(item.name)
        val encoded = URLEncoder.encode(name, Charsets.UTF_8.name()).replace("+", "%20")
        val ascii = name.map { ch ->
            if (ch.code in 32..126 && ch != '"' && ch != '\\') ch else '_'
        }.joinToString("").ifBlank { "download" }
        val headers = buildString {
            append("HTTP/1.1 200 OK\r\n")
            append("Content-Type: $mime\r\n")
            append("Content-Length: ${item.size.coerceAtLeast(0L)}\r\n")
            append("Content-Disposition: attachment; filename=\"$ascii\"; filename*=UTF-8''$encoded\r\n")
            append("Connection: close\r\n")
            append("X-Content-Type-Options: nosniff\r\n")
            append("Cache-Control: no-store\r\n\r\n")
        }
        output.write(headers.toByteArray(Charsets.US_ASCII))
        val buffer = ByteArray(256 * 1024)
        while (true) {
            val n = stream.read(buffer)
            if (n  0) output.write(buffer, 0, n)
        }
        output.flush()
    }
}

private data class HttpRequest(
    val method: String,
    val path: String,
    val contentType: String,
    val contentLength: Long?,
    val expectContinue: Boolean,
)

private fun parseRequest(head: String): HttpRequest? {
    val lines = head.split("\r\n")
    val request = lines.firstOrNull()?.split(" ") ?: return null
    if (request.size ()
    for (line in lines.drop(1)) {
        val colon = line.indexOf(':')
        if (colon
        if (target.startsWith("http://") || target.startsWith("https://")) {
            target.substringAfter("://").substringAfter('/', "/")
                .let { rest -> if (rest.startsWith("/")) rest else "/$rest" }
        } else {
            target
        }
    }
    if (!path.startsWith("/")) return null
    return HttpRequest(
        method = request[0].uppercase(),
        path = path,
        contentType = headers["content-type"].orEmpty(),
        contentLength = headers["content-length"]?.toLongOrNull(),
        expectContinue = headers["expect"].orEmpty().contains("100-continue", ignoreCase = true),
    )
}

private fun readHttpHead(input: InputStream): String? {
    val collected = java.io.ByteArrayOutputStream()
    while (collected.size() = 4) {
            val raw = collected.toByteArray()
            if (raw[size - 4] == 13.toByte() && raw[size - 3] == 10.toByte() &&
                raw[size - 2] == 13.toByte() && raw[size - 1] == 10.toByte()
            ) {
                return raw.toString(Charsets.ISO_8859_1)
            }
        }
    }
    throw WebException("请求头过大")
}

private fun writeText(output: OutputStream, status: Int, message: String) {
    val reason = if (status == 200) "OK" else "Error"
    writeBytes(output, status, reason, "text/plain; charset=utf-8", message.toByteArray(Charsets.UTF_8), noStore = true)
}

private fun writeBytes(
    output: OutputStream,
    status: Int,
    reason: String,
    contentType: String,
    body: ByteArray,
    noStore: Boolean,
) {
    val headers = buildString {
        append("HTTP/1.1 $status $reason\r\n")
        append("Content-Type: $contentType\r\n")
        append("Content-Length: ${body.size}\r\n")
        append("Connection: close\r\n")
        append("X-Content-Type-Options: nosniff\r\n")
        if (noStore) append("Cache-Control: no-store\r\n")
        append("\r\n")
    }
    output.write(headers.toByteArray(Charsets.US_ASCII))
    output.write(body)
    output.flush()
}

private fun bindMessage(error: Exception, port: Int): String {
    val text = error.message.orEmpty()
    if (error is java.net.BindException || text.contains("EADDRINUSE", true) || text.contains("Address already in use", true)) {
        return "端口 $port 已被占用。请关掉占用它的程序后再打开网页互传。"
    }
    return "无法打开网页端口 $port。"
}

private class LimitedInputStream(
    private val raw: InputStream,
    private var left: Long,
) : InputStream() {
    override fun read(): Int {
        if (left = 0) left--
        return value
    }

    override fun read(b: ByteArray, off: Int, len: Int): Int {
        if (left  0) left -= n
        return n
    }
}

========== app/src/main/res/drawable/ic_launcher_foreground.xml ==========

========== app/src/main/res/drawable/ic_stat_transfer.xml ==========

========== app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml ==========

========== app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml ==========

========== app/src/main/res/values/colors.xml ==========

    #F7F4EE
    #0F6E56

========== app/src/main/res/values/strings.xml ==========

    局域网传
    接收服务
    在局域网里等待手机发来文件，或让电脑打开网页互传
    传输进度
    显示正在发送或接收的进度
    接收请求
    有设备请求向你发送文件
    传输结果
    局域网传正在运行
    停止
    请求发送文件
    %1$s 想发送 %2$d 个文件，共 %3$s
    接收
    拒绝
    正在发送
    正在接收
    传输结束

========== app/src/main/res/values/themes.xml ==========

========== app/src/main/res/values-night/colors.xml ==========

    #141412

========== app/src/main/res/values-night/themes.xml ==========

========== app/src/main/res/xml/file_paths.xml ==========

========== app/src/test/java/com/lanchuan/app/TransferProtocolTest.kt ==========
package com.lanchuan.app

import com.lanchuan.app.protocol.Protocol
import com.lanchuan.app.protocol.SharedFile
import com.lanchuan.app.protocol.StreamFramer
import com.lanchuan.app.protocol.WireFile
import com.lanchuan.app.protocol.WireMessage
import com.lanchuan.app.protocol.sanitizeFileName
import com.lanchuan.app.transfer.Decision
import com.lanchuan.app.transfer.HostPort
import com.lanchuan.app.transfer.Identity
import com.lanchuan.app.transfer.OutgoingSource
import com.lanchuan.app.transfer.Peer
import com.lanchuan.app.transfer.Phase
import com.lanchuan.app.transfer.ReceiveSink
import com.lanchuan.app.transfer.ReceiveStore
import com.lanchuan.app.transfer.TransferClient
import com.lanchuan.app.transfer.TransferServer
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeout
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.OutputStream

class TransferProtocolTest {
    @Test
    fun lineFramingDoesNotConsumeFollowingBytes() {
        val raw = "你好\nXYZ".toByteArray(Charsets.UTF_8)
        val framer = StreamFramer(ByteArrayInputStream(raw), ByteArrayOutputStream())
        assertEquals("你好", framer.readLine())
        val body = ByteArrayOutputStream()
        framer.readExact(body, 3)
        assertEquals("XYZ", body.toString(Charsets.UTF_8.name()))
    }

    @Test
    fun jsonKeepsChineseNamesOnOneLine() {
        val message = WireMessage(
            op = Protocol.OP_MANIFEST,
            sessionId = "s1",
            files = listOf(WireFile(id = "file-1", name = "笔记\"a\".txt", size = 5, mime = "text/plain")),
        )
        val line = Protocol.encode(message)
        assertFalse(line.contains("\n"))
        val back = Protocol.decode(line)
        assertEquals(1, back.v)
        assertEquals("笔记\"a\".txt", back.files?.single()?.name)
        assertEquals("未命名", sanitizeFileName("../.."))
        assertEquals("a_b", sanitizeFileName("a/b"))
    }

    @Test
    fun hostPortRejectsGarbage() {
        assertTrue(HostPort.parse("192.168.1.8", "38765", 1).isSuccess)
        assertTrue(HostPort.parse("999.1.1.1", "80", 1).isFailure)
        assertTrue(HostPort.parse("", "80", 1).isFailure)
        assertTrue(HostPort.isPrivateIpv4("10.0.0.8"))
        assertFalse(HostPort.isPrivateIpv4("8.8.8.8"))
    }

    @Test
    fun twoSidesTransferChineseBytes() = runBlocking {
        withTimeout(10_000) {
            val store = MemStore()
            val server = server(store) { Decision.Accept }
            try {
                val error = server.start(0, "127.0.0.1")
                assertNull(error)
                val payload = "你好，局域网".toByteArray(Charsets.UTF_8)
                val outcome = TransferClient({ Identity("client-1", "书房手机") }).send(
                    peer(server.boundPort),
                    listOf(BytesSource("file-1", "问候.txt", "text/plain", payload)),
                )
                assertEquals(Phase.SUCCESS, outcome.phase)
                assertEquals(String(payload, Charsets.UTF_8), store.text("file-1"))
            } finally {
                server.stop()
            }
        }
    }

    @Test
    fun resumeSendsOnlyTheMissingTail() = runBlocking {
        withTimeout(10_000) {
            val store = MemStore()
            val full = "hello world".toByteArray(Charsets.UTF_8)
            store.preload(SharedFile("file-1", "a.txt", full.size.toLong(), "text/plain"), "hello".toByteArray())
            val server = server(store) { Decision.Accept }
            try {
                assertNull(server.start(0, "127.0.0.1"))
                val outcome = TransferClient({ Identity("client-1", "发送方") }).send(
                    peer(server.boundPort),
                    listOf(BytesSource("file-1", "a.txt", "text/plain", full)),
                )
                assertEquals(outcome.message, Phase.SUCCESS, outcome.phase)
                assertEquals("hello world", store.text("file-1"))
            } finally {
                server.stop()
            }
        }
    }

    @Test
    fun rejectDoesNotCreateAFile() = runBlocking {
        withTimeout(10_000) {
            val store = MemStore()
            val server = server(store) { Decision.Reject("用户拒绝接收") }
            try {
                assertNull(server.start(0, "127.0.0.1"))
                val outcome = TransferClient({ Identity("client-1", "发送方") }).send(
                    peer(server.boundPort),
                    listOf(BytesSource("file-1", "a.txt", "text/plain", "hi".toByteArray())),
                )
                assertEquals(Phase.FAILED, outcome.phase)
                assertTrue(outcome.message.contains("拒绝"))
                assertTrue(store.files.isEmpty())
            } finally {
                server.stop()
            }
        }
    }

    @Test
    fun secondSenderGetsBusy() = runBlocking {
        withTimeout(10_000) {
            val entered = CompletableDeferred()
            val release = CompletableDeferred()
            val server = server(MemStore()) {
                entered.complete(Unit)
                release.await()
                Decision.Reject("停止")
            }
            try {
                assertNull(server.start(0, "127.0.0.1"))
                val target = peer(server.boundPort)
                val files = listOf(BytesSource("file-1", "a.txt", "text/plain", "hi".toByteArray()))
                val first = async(Dispatchers.IO) { TransferClient({ Identity("c1", "甲") }).send(target, files) }
                withTimeout(5_000) { entered.await() }
                val second = withContext(Dispatchers.IO) {
                    TransferClient({ Identity("c2", "乙") }).send(target, files)
                }
                assertTrue(second.message.contains("正在接收"))
                release.complete(Unit)
                val firstOutcome = first.await()
                assertTrue(firstOutcome.message.contains("停止"))
            } finally {
                release.complete(Unit)
                server.stop()
            }
        }
    }

    @Test
    fun closedPortIsAChineseError() {
        val outcome = TransferClient({ Identity("c", "甲") }).send(
            Peer("x", "nobody", "127.0.0.1", 1),
            listOf(BytesSource("file-1", "a.txt", "text/plain", "hi".toByteArray())),
        )
        assertEquals(Phase.FAILED, outcome.phase)
        assertTrue(outcome.message.contains("无法连接") || outcome.message.contains("失败"))
    }

    private fun server(store: ReceiveStore, confirm: suspend (com.lanchuan.app.transfer.PendingOffer) -> Decision): TransferServer {
        return TransferServer(
            identity = { Identity("server-1", "接收方") },
            store = store,
            confirm = confirm,
        )
    }

    private fun peer(port: Int) = Peer("server-1", "接收方", "127.0.0.1", port)
}

private class BytesSource(
    override val id: String,
    override val name: String,
    override val mime: String,
    private val bytes: ByteArray,
) : OutgoingSource {
    override val size: Long = bytes.size.toLong()
    override fun open() = ByteArrayInputStream(bytes)
}

private class MemStore : ReceiveStore {
    val files = LinkedHashMap()

    class MemFile(val meta: SharedFile, val body: ByteArrayOutputStream, var done: Boolean)

    fun preload(file: SharedFile, bytes: ByteArray) {
        val body = ByteArrayOutputStream()
        body.write(bytes)
        files[file.id] = MemFile(file, body, false)
    }

    fun text(id: String): String = files[id]?.body?.toString(Charsets.UTF_8.name()).orEmpty()

    override fun open(file: SharedFile): ReceiveSink {
        val existing = files[file.id]
        if (existing != null && existing.meta.name == file.name && existing.meta.size == file.size) {
            if (existing.done || existing.body.size().toLong() == file.size) {
                existing.done = true
                return doneSink(file)
            }
            return liveSink(file, existing, existing.body.size().toLong())
        }
        val created = MemFile(file, ByteArrayOutputStream(), false)
        files[file.id] = created
        return liveSink(file, created, 0)
    }

    override fun discard(fileId: String) {
        files.remove(fileId)
    }

    private fun liveSink(file: SharedFile, mem: MemFile, start: Long): ReceiveSink {
        val stream = object : OutputStream() {
            override fun write(b: Int) {
                mem.body.write(b)
            }

            override fun write(buffer: ByteArray, off: Int, len: Int) {
                mem.body.write(buffer, off, len)
            }
        }
        return object : ReceiveSink {
            override val id = file.id
            override val name = file.name
            override val size = file.size
            override val mime = file.mime
            override val offset = start
            override val alreadyComplete = false
            override val output: OutputStream = stream
            override fun mark(received: Long) = Unit
            override fun finish(): String {
                mem.done = true
                return "mem://${file.id}"
            }

            override fun abort(received: Long) = Unit
        }
    }

    private fun doneSink(file: SharedFile): ReceiveSink {
        return object : ReceiveSink {
            override val id = file.id
            override val name = file.name
            override val size = file.size
            override val mime = file.mime
            override val offset = file.size
            override val alreadyComplete = true
            override val output: OutputStream? = null
            override fun mark(received: Long) = Unit
            override fun finish() = "mem://${file.id}"
            override fun abort(received: Long) = Unit
        }
    }
}

========== app/src/test/java/com/lanchuan/app/WebShareTest.kt ==========
package com.lanchuan.app

import com.lanchuan.app.web.LanAddress
import com.lanchuan.app.web.WebBody
import com.lanchuan.app.web.WebCatalog
import com.lanchuan.app.web.WebIds
import com.lanchuan.app.web.WebItem
import com.lanchuan.app.web.WebShareServer
import com.lanchuan.app.web.WebUpload
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.net.InetAddress
import java.net.Socket

class WebShareTest {
    @Test
    fun lanAddresses() {
        assertTrue(LanAddress.isAllowed(InetAddress.getByName("127.0.0.1")))
        assertTrue(LanAddress.isAllowed(InetAddress.getByName("192.168.2.206")))
        assertTrue(LanAddress.isAllowed(InetAddress.getByName("192.168.43.1")))
        assertTrue(LanAddress.isAllowed(InetAddress.getByName("10.0.0.8")))
        assertTrue(LanAddress.isAllowed(InetAddress.getByName("172.16.5.5")))
        assertTrue(LanAddress.isAllowed(InetAddress.getByName("169.254.1.1")))
        assertFalse(LanAddress.isAllowed(InetAddress.getByName("8.8.8.8")))
        assertFalse(LanAddress.isAllowed(InetAddress.getByName("172.32.0.1")))
    }

    @Test
    fun browserCanUploadAndDownloadChineseFile() {
        val catalog = MemCatalog()
        val server = WebShareServer(catalog)
        try {
            assertEquals(null, server.start(0, "127.0.0.1"))
            val port = server.boundPort
            val payload = "你好，局域网".toByteArray(Charsets.UTF_8)
            val tricky = ("行尾\r\n--不是分界").toByteArray(Charsets.UTF_8)
            val body = multipart(
                "----LanBoundary",
                listOf(
                    Triple("笔记.txt", "text/plain; charset=utf-8", payload),
                    Triple("b.bin", "application/octet-stream", tricky),
                ),
            )
            val uploaded = exchange(port, request("POST", "/upload", body, "multipart/form-data; boundary=----LanBoundary"))
            assertEquals(200, uploaded.status)
            assertTrue(uploaded.text().contains("已保存 2 个文件"))

            val page = exchange(port, request("GET", "/", ByteArray(0), null))
            assertEquals(200, page.status)
            val html = page.text()
            assertTrue(html.contains("上传到手机"))
            assertTrue(html.contains("从手机下载"))
            assertTrue(html.contains("笔记.txt"))
            assertTrue(html.contains("href=\"/d/"))
            assertTrue(html.contains("'/upload'"))
            assertFalse(html.contains("38765"))

            val id = catalog.idOf("笔记.txt")
            val downloaded = exchange(port, request("GET", "/d/$id", ByteArray(0), null))
            assertEquals(200, downloaded.status)
            assertEquals("你好，局域网", downloaded.body.toString(Charsets.UTF_8))
            val other = exchange(port, request("GET", "/d/${catalog.idOf("b.bin")}", ByteArray(0), null))
            assertEquals(String(tricky, Charsets.UTF_8), other.body.toString(Charsets.UTF_8))
        } finally {
            server.stop()
        }
    }

    @Test
    fun largeUploadIsStreamedAndNamesAreEscaped() {
        val catalog = MemCatalog()
        val server = WebShareServer(catalog)
        try {
            assertEquals(null, server.start(0, "127.0.0.1"))
            val size = 2 * 1024 * 1024
            val payload = ByteArray(size) { index -> (index % 251).toByte() }
            val body = multipart("----Big", listOf(Triple(".bin", "application/octet-stream", payload)))
            val uploaded = exchange(server.boundPort, request("POST", "/upload", body, "multipart/form-data; boundary=----Big"))
            assertEquals(uploaded.text(), 200, uploaded.status)
            assertTrue(catalog.maxChunk in 1..256 * 1024)
            assertTrue(catalog.maxChunk .bin").size)
            assertTrue(catalog.bytesOf(".bin").contentEquals(payload))
            val html = exchange(server.boundPort, request("GET", "/", ByteArray(0), null)).text()
            assertTrue(html.contains(".bin"))
            assertFalse(html.contains(""))
        } finally {
            server.stop()
        }
    }

    @Test
    fun missingFileIsChinese404() {
        val server = WebShareServer(MemCatalog())
        try {
            assertEquals(null, server.start(0, "127.0.0.1"))
            val missing = exchange(server.boundPort, request("GET", "/d/0123456789abcdef", ByteArray(0), null))
            assertEquals(404, missing.status)
            assertTrue(missing.text().contains("找不到"))
        } finally {
            server.stop()
        }
    }

    private fun request(method: String, path: String, body: ByteArray, contentType: String?): ByteArray {
        val head = buildString {
            append("$method $path HTTP/1.1\r\n")
            append("Host: 127.0.0.1\r\n")
            append("Connection: close\r\n")
            if (contentType != null) {
                append("Content-Type: $contentType\r\n")
                append("Content-Length: ${body.size}\r\n")
            }
            append("\r\n")
        }.toByteArray(Charsets.US_ASCII)
        val out = ByteArrayOutputStream()
        out.write(head)
        out.write(body)
        return out.toByteArray()
    }

    private fun multipart(boundary: String, files: List>): ByteArray {
        val out = ByteArrayOutputStream()
        for ((name, mime, bytes) in files) {
            out.write("--$boundary\r\n".toByteArray(Charsets.US_ASCII))
            out.write("Content-Disposition: form-data; name=\"file\"; filename=\"".toByteArray(Charsets.US_ASCII))
            out.write(name.toByteArray(Charsets.UTF_8))
            out.write("\"\r\n".toByteArray(Charsets.US_ASCII))
            out.write("Content-Type: $mime\r\n\r\n".toByteArray(Charsets.US_ASCII))
            out.write(bytes)
            out.write("\r\n".toByteArray(Charsets.US_ASCII))
        }
        out.write("--$boundary--\r\n".toByteArray(Charsets.US_ASCII))
        return out.toByteArray()
    }

    private fun exchange(port: Int, request: ByteArray): HttpResult {
        Socket("127.0.0.1", port).use { socket ->
            socket.soTimeout = 10_000
            socket.getOutputStream().write(request)
            socket.getOutputStream().flush()
            val raw = socket.getInputStream().readBytes()
            val marker = "\r\n\r\n".toByteArray(Charsets.US_ASCII)
            val split = indexOf(raw, marker)
            assertTrue(split > 0)
            val head = raw.copyOfRange(0, split).toString(Charsets.ISO_8859_1)
            val status = head.substringAfter(' ').substringBefore(' ').toInt()
            return HttpResult(status, raw.copyOfRange(split + marker.size, raw.size))
        }
    }

    private fun indexOf(data: ByteArray, pattern: ByteArray): Int {
        val last = data.size - pattern.size
        var index = 0
        while (index >()
        var maxChunk: Int = 0

        fun idOf(name: String): String = files.entries.first { it.value.first == name }.key

        fun bytesOf(name: String): ByteArray = files.values.first { it.first == name }.second

        override fun list(): List {
            return files.map { (id, pair) ->
                WebItem(id, pair.first, pair.second.size.toLong(), "application/octet-stream")
            }
        }

        override fun open(id: String): WebBody? {
            val pair = files[id] ?: return null
            return WebBody(
                WebItem(id, pair.first, pair.second.size.toLong(), "application/octet-stream"),
                ByteArrayInputStream(pair.second),
            )
        }

        override fun startUpload(name: String, mime: String): WebUpload {
            val id = WebIds.of("$name#${files.size}")
            val out = ByteArrayOutputStream()
            return object : WebUpload {
                override fun write(buffer: ByteArray, offset: Int, length: Int) {
                    if (length > maxChunk) maxChunk = length
                    out.write(buffer, offset, length)
                }

                override fun commit() {
                    files[id] = name to out.toByteArray()
                }

                override fun abort() {
                    files.remove(id)
                }
            }
        }
    }
}

========== build.gradle.kts ==========
plugins {
    id("com.android.application") version "8.5.2" apply false
    id("org.jetbrains.kotlin.android") version "2.0.21" apply false
    id("org.jetbrains.kotlin.plugin.compose") version "2.0.21" apply false
    id("org.jetbrains.kotlin.plugin.serialization") version "2.0.21" apply false
}

========== gradle.properties ==========
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m -Dfile.encoding=UTF-8
org.gradle.parallel=true
android.useAndroidX=true
kotlin.code.style=official
android.nonTransitiveRClass=true

========== settings.gradle.kts ==========
pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "Lanchuan"
include(":app")

---

[查看原文](https://www.52pojie.cn/thread-2134508-1-1.html)
