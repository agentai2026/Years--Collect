---
title: "安卓阅读APP,啥广告都没,新出生的毛孩子一样"
published: 2026-10-19
description: "https://wwbmj.lanzouu.com/ixkJX4co59fa 密码:ctqb yedu-1.4.13更新了局域网传书 yedu-1.4.19更新了导入源,听书,图片也可以识别. 支持 [*]TXT [*]EPUB [*]HTML / HTM / XHTML [*]ZIP（内含 TXT、HT ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "再贱就再见"
sourceLink: "https://www.52pojie.cn/thread-2133266-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2133266-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

*  *

https://wwbmj.lanzouu.com/ixkJX4co59fa

密码:ctqb

yedu-1.4.13更新了局域网传书

yedu-1.4.19更新了导入源,听书,图片也可以识别.

**支持**
TXTEPUBHTML / HTM / XHTMLZIP（内含 TXT、HTML、单个 EPUB，或纯图片当漫画）图片漫画：BMP、JPG / JPEG、PNG、GIF（多选可合成一本；GIF 只显示第一帧）PDFUMD（文字 / 图片漫画）

**暂不支持**
CHMRAR（请先解成 ZIP 再导入）EBK / KEB

导入方式：本地选文件，或局域网传书（上述支持格式都可传）。

![](https://static.52pojie.cn/static/image/common/none.gif)

**1.jpg** *(124.99 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4NzI3MHwyMGUyMjMyMnwxNzkyNTQ4MDkyfDB8MjEzMzI2Ng%3D%3D&nothumb=yes)

2026-10-19 22:20 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**2.jpg** *(218.04 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4NzI3MXxjN2YzNzQxMHwxNzkyNTQ4MDkyfDB8MjEzMzI2Ng%3D%3D&nothumb=yes)

2026-10-19 22:20 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**3.jpg** *(354.71 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4NzI3MnxhZmRhNTIxNnwxNzkyNTQ4MDkyfDB8MjEzMzI2Ng%3D%3D&nothumb=yes)

2026-10-19 22:20 上传

![](https://static.52pojie.cn/static/image/common/none.gif)

**11111111111.jpg** *(236.24 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg4NzM0N3w0NzgxNjRhOHwxNzkyNTQ4MDkyfDB8MjEzMzI2Ng%3D%3D&nothumb=yes)

2026-10-20 09:40 上传

[Java] *纯文本查看* *复制代码*

package com.etye.reader.reader
  val background = MaterialTheme.colorScheme.background
  val onBackground = MaterialTheme.colorScheme.onBackground
  when (val state = load) {
    ReaderLoad.Loading -> CenterMessage(text = "正在打开…", loading = true, onBack = onBack)
    is ReaderLoad.Failed -> CenterMessage(text = state.message, loading = false, onBack = onBack)
    is ReaderLoad.Ready -> {
      val catalog = state.catalog
      val warm by viewModel.warm.collectAsStateWithLifecycle()
      val chapterIndex = position.chapterIndex.coerceIn(0, (catalog.size - 1).coerceAtLeast(0))
      val chapter = catalog.chapter(chapterIndex)
      val previousChapter = if (chapterIndex > 0) catalog.chapter(chapterIndex - 1) else null
      val nextChapter = if (chapterIndex + 1 = 28) {
          window.attributes.layoutInDisplayCutoutMode
        } else {
          0
        }
        if (Build.VERSION.SDK_INT >= 28) {
          val params = window.attributes
          params.layoutInDisplayCutoutMode = if (Build.VERSION.SDK_INT >= 30) {
            WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_ALWAYS
          } else {
            WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
          }
          window.attributes = params
        }
        onDispose {
          if (Build.VERSION.SDK_INT >= 28) {
            val params = window.attributes
            params.layoutInDisplayCutoutMode = previousCutout
            window.attributes = params
          }
        }
      }
      DisposableEffect(settings.fullscreen, pageArgb, lightStatus) {
        val window = activity.window
        val controller = WindowCompat.getInsetsController(window, view)
        applyReaderBars(window, controller, settings.fullscreen, pageArgb, lightStatus)
        onDispose { restoreReaderBars(window, controller, lightStatus) }
      }
      fun jumpChapter(delta: Int) {
        val target = chapterIndex + delta
        if (target !in 0 until catalog.size) {
          edgeHint = if (delta > 0) "已经是最后一章" else "已经是第一章"
          return
        }
        viewModel.jumpTo(target, 0)
      }
      Box(Modifier.fillMaxSize().background(background)) {
        Column(
          Modifier
            .fillMaxSize()
            .windowInsetsPadding(safeTop)
            .navigationBarsPadding(),
        ) {
          Box(Modifier.weight(1f).fillMaxWidth()) {
            if (settings.mode == ReadMode.SCROLL) {
              ScrollPane(
                catalog = catalog,
                position = position,
                jump = viewModel.jump.collectAsStateWithLifecycle().value,
                settings = settings,
                onCommit = viewModel::commit,
                onToggleChrome = { chrome = !chrome },
              )
            } else {
              PagePane(
                mode = settings.mode,
                chapter = chapter,
                previousChapter = previousChapter,
                nextChapter = nextChapter,
                chapterIndex = chapterIndex,
                chapterCount = catalog.size,
                offset = position.charOffset,
                settings = settings,
                textColor = onBackground,
                pageColor = background,
                onCommit = viewModel::commit,
                onJump = viewModel::jumpTo,
                onToggleChrome = { chrome = !chrome },
                onEdge = { edgeHint = it },
              )
            }
            edgeHint?.let { hint ->
              Surface(
                modifier = Modifier.align(Alignment.Center),
                shape = RoundedCornerShape(20.dp),
                color = MaterialTheme.colorScheme.inverseSurface,
              ) {
                Text(
                  hint,
                  modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                  color = MaterialTheme.colorScheme.inverseOnSurface,
                )
              }
            }
          }
          ReaderFooter(chapterPercent = chapterPercent, chapterTitle = chapter.title)
        }
        AnimatedVisibility(
          visible = chrome,
          modifier = Modifier.align(Alignment.TopCenter),
          enter = fadeIn() + slideInVertically { -it },
          exit = fadeOut() + slideOutVertically { -it },
        ) {
          Surface(
            modifier = Modifier.fillMaxWidth(),
            color = MaterialTheme.colorScheme.surface.copy(alpha = 0.97f),
            shadowElevation = 3.dp,
          ) {
            Row(
              Modifier.windowInsetsPadding(safeTop).height(52.dp).padding(end = 12.dp),
              verticalAlignment = Alignment.CenterVertically,
            ) {
              IconButton(onClick = onBack) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "返回")
              }
              Column(Modifier.weight(1f)) {
                Text(
                  chapter.title,
                  style = MaterialTheme.typography.titleMedium,
                  maxLines = 1,
                  overflow = TextOverflow.Ellipsis,
                )
                Text(
                  state.book.title,
                  style = MaterialTheme.typography.bodySmall,
                  color = MaterialTheme.colorScheme.onSurfaceVariant,
                  maxLines = 1,
                  overflow = TextOverflow.Ellipsis,
                )
              }
            }
          }
        }
        AnimatedVisibility(
          visible = chrome,
          modifier = Modifier.align(Alignment.BottomCenter),
          enter = fadeIn() + slideInVertically { it },
          exit = fadeOut() + slideOutVertically { it },
        ) {
          Surface(
            modifier = Modifier.fillMaxWidth(),
            color = MaterialTheme.colorScheme.surface.copy(alpha = 0.97f),
            shadowElevation = 6.dp,
          ) {
            Row(
              Modifier.navigationBarsPadding().height(64.dp).padding(horizontal = 4.dp),
              horizontalArrangement = Arrangement.SpaceEvenly,
              verticalAlignment = Alignment.CenterVertically,
            ) {
              ReaderBarButton("上一章", Icons.AutoMirrored.Filled.KeyboardArrowLeft) { jumpChapter(-1) }
              ReaderBarButton("目录", Icons.Filled.Menu) { showChapters = true }
              ProgressBarButton(progress) { showProgress = true }
              ReaderBarButton("设置", Icons.Filled.Settings) { showSettings = true }
              ReaderBarButton("下一章", Icons.AutoMirrored.Filled.KeyboardArrowRight) { jumpChapter(1) }
            }
          }
        }
      }
      if (showSettings) {
        SettingsSheet(settings = settings, viewModel = viewModel, onDismiss = { showSettings = false })
      }
      if (showChapters) {
        ChapterSheet(
          titles = catalog.titles,
          current = chapterIndex,
          onPick = { index ->
            viewModel.jumpTo(index, 0)
            showChapters = false
          },
          onDismiss = { showChapters = false },
        )
      }
      if (showProgress) {
        ProgressSheet(
          progress = progress,
          chapterTitle = chapter.title,
          onSeek = { fraction ->
            val (index, offset) = catalog.targetFor(fraction)
            viewModel.jumpTo(index, offset)
          },
          onDismiss = { showProgress = false },
        )
      }
    }
  }
}

@Composable
private fun ReaderBarButton(label: String, icon: ImageVector, onClick: () -> Unit) {
  Column(
    modifier = Modifier
      .widthIn(min = 56.dp)
      .clip(RoundedCornerShape(8.dp))
      .clickable(onClick = onClick)
      .padding(horizontal = 4.dp, vertical = 4.dp),
    horizontalAlignment = Alignment.CenterHorizontally,
  ) {
    Icon(icon, contentDescription = label, modifier = Modifier.size(22.dp))
    Text(label, style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
  }
}

@Composable
private fun ProgressBarButton(progress: Float, onClick: () -> Unit) {
  Column(
    modifier = Modifier
      .widthIn(min = 56.dp)
      .clip(RoundedCornerShape(8.dp))
      .clickable(onClick = onClick)
      .padding(horizontal = 4.dp, vertical = 4.dp),
    horizontalAlignment = Alignment.CenterHorizontally,
  ) {
    Text(
      "${(progress * 100).roundToInt()}%",
      style = MaterialTheme.typography.labelLarge,
      textAlign = TextAlign.Center,
    )
    Text("进度", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
  }
}

@Composable
private fun CenterMessage(text: String, loading: Boolean, onBack: () -> Unit) {
  Column(
    Modifier.fillMaxSize().statusBarsPadding().padding(24.dp),
    verticalArrangement = Arrangement.Center,

---

[查看原文](https://www.52pojie.cn/thread-2133266-1-1.html)
