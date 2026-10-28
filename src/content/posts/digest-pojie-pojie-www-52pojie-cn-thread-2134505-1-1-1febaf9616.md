---
title: "页读— 本地电子书 / 漫画阅读器（Android）"
published: 2026-10-27
description: "转载个安卓阅读APP"
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "再贱就再见"
sourceLink: "https://www.52pojie.cn/thread-2134505-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2134505-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

**转载个安卓阅读APP**

**页读**— 本地电子书 / 漫画阅读器（Android）

本地为主：多格式导入、局域网传书、书源搜书、听书跟读、无账号、不强制联网。

**特点**
书架管理，本地阅读导入：本地文件 / 书源（Legado 风格 JSON、订阅 URL）局域网传书：电脑浏览器传到手机，可收起，书架可停止听书：系统 TTS，语速最高约 5×；后台 / 锁屏可继续（需允许后台与电池优化）文字书跟读高亮；漫画 / PDF 可 OCR 后听书

**支持格式**
文字：TXT、EPUB、HTML / HTM / XHTML、UMD、PDF压缩：ZIP（内含 TXT / HTML / EPUB / 图片）漫画图：BMP、JPG / JPEG、PNG、GIF（多选可合成；GIF 首帧）暂不支持：CHM、RAR、EBK / KEB

**一句话**

本地多格式阅读 + 局域网传书 + 书源 + 听书，适合离线看书看漫画。

![](https://static.52pojie.cn/static/image/common/none.gif)

**33.jpg** *(125.57 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4OTA4NHwyYjQwYTJjY3wxNzkzMTU1MzI0fDB8MjEzNDUwNQ%3D%3D&nothumb=yes)

2026-10-27 18:51 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**1(1).jpg** *(259.13 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4OTA4MHw1MWExNDg4NXwxNzkzMTU1MzI0fDB8MjEzNDUwNQ%3D%3D&nothumb=yes)

2026-10-27 18:51 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**2.jpg** *(176.96 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4OTA4MXwxODE2NDQ2YnwxNzkzMTU1MzI0fDB8MjEzNDUwNQ%3D%3D&nothumb=yes)

2026-10-27 18:51 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**3(1).jpg** *(324.33 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4OTA4MnxiZWNjMmUxYXwxNzkzMTU1MzI0fDB8MjEzNDUwNQ%3D%3D&nothumb=yes)

2026-10-27 18:51 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**4.jpg** *(218.83 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4OTA4M3w0MzJkNzE2NXwxNzkzMTU1MzI0fDB8MjEzNDUwNQ%3D%3D&nothumb=yes)

2026-10-27 18:51 上传

https://wwbmj.lanzouu.com/iktNq4daeh4d

密码:7dp1

觉得有用的请给与支持！！！

觉得有用的请给与支持！！！

觉得有用的请给与支持！！！

![](https://static.52pojie.cn/static/image/smiley/default/lol.gif)

[Java] *纯文本查看* *复制代码*
package com.etye.reader.reader

import android.animation.Animator
import android.animation.AnimatorListenerAdapter
import android.animation.ValueAnimator
import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.ColorMatrix
import android.graphics.ColorMatrixColorFilter
import android.graphics.LinearGradient
import android.graphics.Matrix
import android.graphics.Paint
import android.graphics.Path
import android.graphics.Shader
import android.text.StaticLayout
import android.text.TextPaint
import android.util.AttributeSet
import android.view.View
import android.view.animation.PathInterpolator
import java.util.Locale
import kotlin.math.hypot

class PageCurlView @JvmOverloads constructor(
  context: Context,
  attrs: AttributeSet? = null,
) : View(context, attrs) {
  var isTurning: Boolean = false
    private set

  private var pageText: String = ""
  private var pendingText: String = ""
  private var markStart: Int = -1
  private var markEnd: Int = -1
  private var textColor: Int = 0xFF3A3228.toInt()
  private var pageColor: Int = 0xFFF6F1E3.toInt()
  private var fontPx: Float = 48f
  private var spacing: Float = 1.75f
  private var insetLeft: Int = 0
  private var insetTop: Int = 0
  private var insetRight: Int = 0
  private var insetBottom: Int = 0
  private var forward: Boolean = true
  private var fromTop: Boolean = false
  private var scripted: Boolean = false
  private var dragging: Boolean = false
  private var commitOnEnd: Boolean = true
  private var progress: Float = 0f
  private var touchX: Float = 0f
  private var touchY: Float = 0f
  private var turnToken: Int = 0
  private var currentBitmap: Bitmap? = null
  private var nextBitmap: Bitmap? = null
  private var turnCallback: (() -> Unit)? = null
  private var animator: ValueAnimator? = null
  private val bitmapPaint = Paint(Paint.ANTI_ALIAS_FLAG or Paint.FILTER_BITMAP_FLAG)
  private val backPaint = Paint(Paint.ANTI_ALIAS_FLAG or Paint.FILTER_BITMAP_FLAG).apply {
    colorFilter = ColorMatrixColorFilter(
      ColorMatrix(
        floatArrayOf(
          0.55f, 0.04f, 0.02f, 0f, 38f,
          0.02f, 0.50f, 0.02f, 0f, 32f,
          0.01f, 0.03f, 0.42f, 0f, 24f,
          0f, 0f, 0f, 1f, 0f,
        ),
      ),
    )
  }
  private val fillPaint = Paint(Paint.ANTI_ALIAS_FLAG)
  private val shadePaint = Paint(Paint.ANTI_ALIAS_FLAG)
  private val peelPath = Path()
  private val backPath = Path()
  private val mirrorMatrix = Matrix()
  private val matrixValues = FloatArray(9)

  fun show(
    text: String,
    textColor: Int,
    pageColor: Int,
    fontPx: Float,
    spacing: Float,
    markStart: Int = -1,
    markEnd: Int = -1,
  ) {
    val changed = text != pageText || textColor != this.textColor || pageColor != this.pageColor ||
      fontPx != this.fontPx || spacing != this.spacing ||
      markStart != this.markStart || markEnd != this.markEnd
    this.textColor = textColor
    this.pageColor = pageColor
    this.fontPx = fontPx
    this.spacing = spacing
    this.markStart = markStart
    this.markEnd = markEnd
    if (isTurning) return
    if (!changed && text == pageText) return
    pageText = text
    redraw()
  }

  fun contentInset(left: Int, top: Int, right: Int, bottom: Int) {
    if (left == insetLeft && top == insetTop && right == insetRight && bottom == insetBottom) return
    insetLeft = left.coerceAtLeast(0)
    insetTop = top.coerceAtLeast(0)
    insetRight = right.coerceAtLeast(0)
    insetBottom = bottom.coerceAtLeast(0)
    if (!isTurning) redraw()
  }

  private fun redraw() {
    invalidate()
    val host = parent
    if (host is View) host.invalidate()
  }

  fun turn(
    toText: String,
    forward: Boolean,
    alignEnd: Boolean = false,
    fromTop: Boolean = false,
    onEnd: () -> Unit,
  ): Boolean {
    if (!arm(toText, forward, alignEnd, onEnd)) return !isTurning
    scripted = true
    dragging = false
    commitOnEnd = true
    this.fromTop = fromTop
    progress = 0f
    animate(0f, 1f, 560L) { value ->
      progress = value
      redraw()
    }
    return true
  }

  fun grab(
    toText: String,
    forward: Boolean,
    alignEnd: Boolean,
    x: Float,
    y: Float,
    onCommit: () -> Unit,
  ): Boolean {
    if (!arm(toText, forward, alignEnd, onCommit)) return !isTurning
    scripted = false
    dragging = true
    commitOnEnd = false
    this.fromTop = y  true
      y > heightF * 0.58f -> false
      else -> fromTop
    }
    redraw()
  }

  fun release() {
    if (!dragging) return
    dragging = false
    val widthF = width.toFloat().coerceAtLeast(1f)
    val heightF = height.toFloat().coerceAtLeast(1f)
    val traveled = if (forward) (widthF - touchX) / widthF else touchX / widthF
    val finish = traveled >= 0.25f
    commitOnEnd = finish
    val startX = touchX
    val startY = touchY
    val end = if (finish) exitPoint(widthF, heightF) else restPoint(widthF, heightF)
    animate(0f, 1f, if (finish) 380L else 260L) { t ->
      touchX = startX + (end.x - startX) * t
      touchY = startY + (end.y - startY) * t
      redraw()
    }
  }

  override fun onDetachedFromWindow() {
    turnToken += 1
    animator?.cancel()
    animator = null
    dragging = false
    isTurning = false
    turnCallback = null
    recycleBitmaps()
    super.onDetachedFromWindow()
  }

  override fun onDraw(canvas: Canvas) {
    val current = currentBitmap
    val next = nextBitmap
    if (!isTurning || current == null || next == null) {
      canvas.drawColor(pageColor)
      drawText(canvas, pageText)
      return
    }
    val widthF = width.toFloat()
    val heightF = height.toFloat()
    val touch = if (scripted) {
      CurlGeometry.touch(progress, forward, widthF, heightF, fromTop)
    } else {
      CurlPoint(touchX, touchY)
    }
    val corner = CurlGeometry.corner(forward, widthF, heightF, fromTop)
    val frame = CurlGeometry.frame(touch, corner, widthF, heightF)
    val opened = if (scripted) progress > 0.92f else horizontalProgress(touch, widthF) > 0.92f
    if (frame == null || CurlGeometry.peelDistance(frame)  Unit): Boolean {
    if (isTurning) return false
    if (width  Unit) {
    val token = turnToken
    animator?.cancel()
    animator = ValueAnimator.ofFloat(from, to).apply {
      this.duration = duration
      interpolator = PathInterpolator(0.22f, 0.08f, 0.18f, 1f)
      addUpdateListener { value -> onFrame(value.animatedValue as Float) }
      addListener(object : AnimatorListenerAdapter() {
        private var cancelled = false

        override fun onAnimationCancel(animation: Animator) {
          cancelled = true
        }

        override fun onAnimationEnd(animation: Animator) {
          if (cancelled || token != turnToken || !isTurning) return
          if (commitOnEnd) completeTurn() else revertTurn()
        }
      })
      start()
    }
  }

  private fun exitPoint(widthF: Float, heightF: Float): CurlPoint {
    val x = if (forward) -widthF * 0.35f else widthF * 1.35f
    val y = if (fromTop) heightF * 0.38f else heightF * 0.62f
    return CurlPoint(x, y)
  }

  private fun restPoint(widthF: Float, heightF: Float): CurlPoint {
    val x = if (forward) widthF - 1.5f else 1.5f
    val y = if (fromTop) 1.5f else heightF - 1.5f
    return CurlPoint(x, y)
  }

  private fun horizontalProgress(touch: CurlPoint, widthF: Float): Float {
    if (widthF  width / 2f) -1f else 1f
    if (abs(corner.y - ay) = width) return touch
    val first = points(touch, corner) ?: return touch
    if (first.start1.x in 0f..width) return touch
    val reflected = if (first.start1.x  Unit)? = null
  private var onPrev: (() -> Unit)? = null
  private var onMiss: ((Boolean) -> Unit)? = null
  private val retiring = ArrayList(2)
  private var animator: ValueAnimator? = null
  private val bitmapPaint = Paint().apply { isFilterBitmap = false }
  private val decelerate = DecelerateInterpolator(1.8f)

  fun show(
    text: String,
    textColor: Int,
    pageColor: Int,
    fontPx: Float,
    spacing: Float,
    markStart: Int = -1,
    markEnd: Int = -1,
  ) {
    val changed = text != pageText || textColor != this.textColor || pageColor != this.pageColor ||
      fontPx != this.fontPx || spacing != this.spacing ||
      markStart != this.markStart || markEnd != this.markEnd
    this.textColor = textColor
    this.pageColor = pageColor
    this.fontPx = fontPx
    this.spacing = spacing
    this.markStart = markStart
    this.markEnd = markEnd
    if (isTurning) {
      if (changed) restyleAfterTurn = true
      return
    }
    if (!changed && !restyleAfterTurn) return
    restyleAfterTurn = false
    pageText = text
    sheetDirty = true
    preparedDirty = true
    schedulePaint()
    redraw()
  }

  fun contentInset(left: Int, top: Int, right: Int, bottom: Int) {
    if (left == insetLeft && top == insetTop && right == insetRight && bottom == insetBottom) return
    insetLeft = left.coerceAtLeast(0)
    insetTop = top.coerceAtLeast(0)
    insetRight = right.coerceAtLeast(0)
    insetBottom = bottom.coerceAtLeast(0)
    if (isTurning) {
      restyleAfterTurn = true
      return
    }
    sheetDirty = true
    preparedDirty = true
    schedulePaint()
    redraw()
  }

  private fun redraw() {
    invalidate()
    val host = parent
    if (host is View) host.invalidate()
  }

  fun prepare(nextText: String?, prevText: String?, prevAlignEnd: Boolean) {
    if (nextText == preparedNext && prevText == preparedPrev && prevAlignEnd == preparedPrevAlign && !preparedDirty) {
      return
    }
    preparedNext = nextText
    preparedPrev = prevText
    preparedPrevAlign = prevAlignEnd
    preparedDirty = true
    if (!isTurning) schedulePaint()
  }

  fun turn(toText: String, forward: Boolean, alignEnd: Boolean = false, onEnd: () -> Unit): Boolean {
    if (isTurning) return false
    if (width  Unit)?,
    onPrev: (() -> Unit)?,
  ): Boolean {
    if (isTurning) return false
    if (width  Unit)? = null) {
    if (!dragging) return
    dragging = false
    val distance = span()
    val towardNext = when {
      rawOffset  true
      rawOffset > 1f -> false
      else -> velocityPxPerSec = missPx()) towardNext else null
    val target = when {
      finish && towardNext -> -distance
      finish -> distance
      else -> 0f
    }
    animate(offset, target, settleDuration(offset, target, abs(velocityPxPerSec), finish))
  }

  override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
    super.onSizeChanged(w, h, oldw, oldh)
    if (w == oldw && h == oldh) return
    if (isTurning) {
      turnToken += 1
      animator?.cancel()
      animator = null
      isTurning = false
      dragging = false
      onNext = null
      onPrev = null
      onMiss = null
      offset = 0f
      rawOffset = 0f
    }
    sheetDirty = true
    preparedDirty = true
    schedulePaint()
  }

  override fun onDetachedFromWindow() {
    turnToken += 1
    animator?.cancel()
    animator = null
    dragging = false
    isTurning = false
    onNext = null
    onPrev = null
    onMiss = null
    paintPosted = false
    holdPaint = false
    retiring.forEach { bitmap ->
      if (bitmap !== sheet && bitmap !== ahead && bitmap !== behind) recycle(bitmap)
    }
    retiring.clear()
    recycle(sheet)
    recycle(ahead)
    recycle(behind)
    sheet = null
    ahead = null
    behind = null
    super.onDetachedFromWindow()
  }

  override fun onDraw(canvas: Canvas) {

    val savedFilter = canvas.drawFilter
    canvas.drawFilter = null
    canvas.drawColor(pageColor)
    if (!isTurning) {
      val cached = sheet
      if (!sheetDirty && cached != null && !cached.isRecycled) {
        canvas.drawBitmap(cached, 0f, 0f, bitmapPaint)
      } else {
        drawText(canvas, pageText)
      }
      canvas.drawFilter = savedFilter
      return
    }
    val horizontal = axis == Axis.HORIZONTAL
    val distance = if (horizontal) width else height
    val current = slideDrawOffset(offset, distance, settling = !dragging)
    if (current == 0) {
      drawSheet(canvas, sheet, 0, 0)
      canvas.drawFilter = savedFilter
      return
    }
    val neighbor = if (current  0 else current
        offset = value.animatedValue as Float
        redraw()
      }
      addListener(object : AnimatorListenerAdapter() {
        private var cancelled = false

        override fun onAnimationCancel(animation: Animator) {
          cancelled = true
        }

        override fun onAnimationEnd(animation: Animator) {
          if (cancelled || token != turnToken || !isTurning) return
          if (commitOnEnd) completeTurn() else revertTurn()
        }
      })
      start()
    }
  }

  private fun completeTurn() {
    val callback = if (settledNext) onNext else onPrev
    val revealed = if (settledNext) ahead else behind
    val unused = if (settledNext) behind else ahead
    val leftText = pageText
    val text = if (settledNext) pendingNext else pendingPrev
    onNext = null
    onPrev = null
    onMiss = null
    missForward = null
    pageText = text
    val old = sheet
    if (revealed != null && !revealed.isRecycled) {
      sheet = revealed
      sheetDirty = false
    } else {
      sheetDirty = true
    }

    if (settledNext) {
      ahead = null
      preparedNext = null
      if (old != null && old !== sheet && !old.isRecycled) {
        behind = old
        preparedPrev = leftText
        preparedPrevAlign = false
        hasPrev = true
      }
    } else {
      behind = null
      preparedPrev = null
      if (old != null && old !== sheet && !old.isRecycled) {
        ahead = old
        preparedNext = leftText
        hasNext = true
      }
    }
    if (unused != null && unused !== sheet && unused !== ahead && unused !== behind && !unused.isRecycled) {
      retiring.add(unused)
    }
    holdPaint = true
    isTurning = false
    dragging = false
    offset = 0f
    rawOffset = 0f
    animator = null
    redraw()
    callback?.invoke()
    schedulePaint()
  }

  private fun revertTurn() {
    val miss = missForward
    val missCallback = onMiss
    missForward = null
    onMiss = null
    onNext = null
    onPrev = null
    isTurning = false
    dragging = false
    offset = 0f
    rawOffset = 0f
    animator = null
    redraw()
    if (miss != null) missCallback?.invoke(miss)
  }

  private fun recycle(bitmap: Bitmap?) {
    if (bitmap != null && !bitmap.isRecycled) bitmap.recycle()
  }

  private fun paintInto(existing: Bitmap?, text: String, alignEnd: Boolean): Bitmap? {
    return try {
      val bitmap = if (
        existing != null &&
        !existing.isRecycled &&
        existing.width == width &&
        existing.height == height
      ) {
        existing
      } else {
        recycle(existing)
        PageSheet.bitmap(width, height)
      }
      val canvas = Canvas(bitmap)
      canvas.drawColor(pageColor)
      drawPageContent(canvas, text, alignEnd)
      bitmap
    } catch (_: OutOfMemoryError) {
      null
    }
  }

  private fun drawText(canvas: Canvas, text: String) {
    if (text.isEmpty() || width

---

[查看原文](https://www.52pojie.cn/thread-2134505-1-1.html)
