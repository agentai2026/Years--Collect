---
title: "中文语义匹配分计算器（BGE模型）"
published: 2026-08-25
description: "代码作用： 利用BGE模型，进行中文语义的内容匹配，通过匹配阈值控制数据映射。 使用说明： 请自行安装以下模型，放在代码路径下的子文件src/model的对应文件夹中： bge-small-zh-v1.5-onnx-int8 bge-small-zh-v1. ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "agooo"
sourceLink: "https://www.52pojie.cn/thread-2124751-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2124751-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

代码作用：

利用BGE模型，进行中文语义的内容匹配，通过匹配阈值控制数据映射。

使用说明：

请自行安装以下模型，放在代码路径下的子文件src/model的对应文件夹中：

bge-small-zh-v1.5-onnx-int8

bge-small-zh-v1.5-onnx

bge-small-zh-v1.5

软件界面：

![](https://static.52pojie.cn/static/image/common/none.gif)

**image.png** *(68.73 KB, 下载次数: 0)*

[下载附件](forum.php?mod=attachment&aid=Mjg3NDY1MXw2YWQ0YzFjNHwxNzg3NzA3MTY1fDB8MjEyNDc1MQ%3D%3D&nothumb=yes)

2026-8-25 23:24 上传

代码：

[Python] *纯文本查看* *复制代码*
import sysimport os
import glob
import threading
import csv
import numpy as np
import onnxruntime as ort
from tokenizers import Tokenizer

from PyQt5.QtWidgets import (
QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
QGroupBox, QLabel, QPushButton, QStatusBar, QMessageBox,
QComboBox, QFileDialog, QTableWidget, QTableWidgetItem, QHeaderView,
QSpinBox
)
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QFont, QColor

MODEL_OPTIONS = [
"bge-small-zh-v1.5-onnx-int8",
"bge-small-zh-v1.5-onnx",
"bge-small-zh-v1.5",
]
DEFAULT_MODEL = "bge-small-zh-v1.5-onnx-int8"

ONNX_FILENAME_CANDIDATES = [
"model_quantized.onnx",
"model_qint8.onnx",
"model_int8.onnx",
"model.onnx",
]

class BgeMatcher:
_instances = {}
_registry_lock = threading.Lock()

def __init__(self, model_dir_name):
self.model_dir_name = model_dir_name
self.MAX_LEN = 48
self._session = None
self._tokenizer = None
self._torch_model = None
self._torch_tokenizer = None
self._backend = None
self._load_lock = threading.Lock()

@classmethod
def instance(cls, model_dir_name):
with cls._registry_lock:
inst = cls._instances.get(model_dir_name)
if inst is None:
inst = cls(model_dir_name)
cls._instances[model_dir_name] = inst
return inst

def _resolve_model_dir(self):
base = sys._MEIPASS if hasattr(sys, "_MEIPASS") else os.path.dirname(os.path.abspath(__file__))
return os.path.join(base, "src", "model", self.model_dir_name)

def _resolve_onnx_path(self, model_dir):
for name in ONNX_FILENAME_CANDIDATES:
p = os.path.join(model_dir, name)
if os.path.exists(p):
return p
found = glob.glob(os.path.join(model_dir, "*.onnx"))
if found:
return found[0]
return None

def is_loaded(self):
return self._backend is not None

def set_max_len(self, max_len: int):
self.MAX_LEN = max_len
if self._backend == "onnx" and self._tokenizer is not None:
self._tokenizer.enable_truncation(max_length=max_len)
self._tokenizer.enable_padding(length=max_len, pad_id=0)

def ensure_loaded(self):
if self._backend is not None:
return
with self._load_lock:
if self._backend is not None:
return
model_dir = self._resolve_model_dir()
if not os.path.isdir(model_dir):
raise FileNotFoundError(f"找不到模型文件夹: {model_dir}")

onnx_path = self._resolve_onnx_path(model_dir)
if onnx_path:
tok_path = os.path.join(model_dir, "tokenizer.json")
if not os.path.exists(tok_path):
raise FileNotFoundError(
f"ONNX 模型存在但缺少 tokenizer.json: {tok_path}")
so = ort.SessionOptions()
so.intra_op_num_threads = max(1, os.cpu_count() // 2)
so.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
self._session = ort.InferenceSession(
onnx_path, sess_options=so, providers=["CPUExecutionProvider"])
self._tokenizer = Tokenizer.from_file(tok_path)
self._tokenizer.enable_truncation(max_length=self.MAX_LEN)
self._tokenizer.enable_padding(length=self.MAX_LEN, pad_id=0)
self._backend = "onnx"
else:
try:
from transformers import AutoTokenizer, AutoModel
self._torch_tokenizer = AutoTokenizer.from_pretrained(model_dir)
self._torch_model = AutoModel.from_pretrained(model_dir)
self._torch_model.eval()
self._torch_model.to('cpu')
self._backend = "transformers"
except Exception as e:
raise RuntimeError(
f"在 {model_dir} 下未找到 ONNX 模型，且尝试用 transformers 加载失败。\n"
f"请确认该文件夹包含有效的 PyTorch 模型文件或 ONNX 模型，并已安装 transformers 和 torch。\n"
f"错误详情: {e}")

def _encode(self, texts):
self.ensure_loaded()
if self._backend == "onnx":
encodings = self._tokenizer.encode_batch(texts)
input_ids = np.array([e.ids for e in encodings], dtype=np.int64)
attn_mask = np.array([e.attention_mask for e in encodings], dtype=np.int64)
type_ids = np.zeros_like(input_ids)

outputs = self._session.run(
None,
{"input_ids": input_ids, "attention_mask": attn_mask, "token_type_ids": type_ids})
last_hidden = outputs[0]

mask = attn_mask[:, :, None].astype(np.float32)
summed = (last_hidden * mask).sum(axis=1)
counts = np.clip(mask.sum(axis=1), 1e-9, None)
pooled = summed / counts

norms = np.linalg.norm(pooled, axis=1, keepdims=True)
norms = np.clip(norms, 1e-9, None)
return pooled / norms

elif self._backend == "transformers":
import torch
encodings = self._torch_tokenizer(
texts,
padding=True,
truncation=True,
max_length=self.MAX_LEN,
return_tensors='pt'
)
with torch.no_grad():
outputs = self._torch_model(**encodings)
last_hidden = getattr(outputs, "last_hidden_state", outputs[0])
attention_mask = encodings['attention_mask'].unsqueeze(-1).float()
summed = (last_hidden * attention_mask).sum(dim=1)
counts = attention_mask.sum(dim=1).clamp(min=1e-9)
pooled = summed / counts
pooled = torch.nn.functional.normalize(pooled, p=2, dim=1)
return pooled.cpu().numpy()

else:
raise RuntimeError("模型未正确加载")

def similarity_one(self, a, b):
vecs = self._encode([a, b])
return float(np.dot(vecs[0], vecs[1]))

def text_similarity_score(a: str, b: str, model_dir_name: str) -> float:
return BgeMatcher.instance(model_dir_name).similarity_one(a, b) * 100.0

class MatchScoreApp(QMainWindow):
def __init__(self):
super().__init__()
self.setFont(QFont("Microsoft YaHei", 11))
self.setWindowTitle("语义匹配分计算器 - BGE模型")
self.setGeometry(200, 200, 800, 500)
self.setMinimumSize(800, 500)

self._build_ui()
self._ensure_bge_ready(self.model_combo.currentText())

def _build_ui(self):
central = QWidget()
self.setCentralWidget(central)
main_layout = QVBoxLayout(central)

model_group = QGroupBox("模型选择")
model_layout = QHBoxLayout(model_group)
model_layout.addWidget(QLabel("使用模型:"))
self.model_combo = QComboBox()
self.model_combo.addItems(MODEL_OPTIONS)
if DEFAULT_MODEL in MODEL_OPTIONS:
self.model_combo.setCurrentText(DEFAULT_MODEL)
self.model_combo.currentTextChanged.connect(self._on_model_changed)
model_layout.addWidget(self.model_combo)

self.btn_csv = QPushButton("浏览样本数据集")
self.btn_csv.setMinimumHeight(30)
self.btn_csv.setMinimumWidth(160)
self.btn_csv.clicked.connect(self._load_csv)
model_layout.addWidget(self.btn_csv)

self.btn_add_row = QPushButton("添加行")
self.btn_add_row.setMinimumHeight(30)
self.btn_add_row.setMinimumWidth(100)
self.btn_add_row.clicked.connect(self._add_row)
model_layout.addWidget(self.btn_add_row)

model_layout.addStretch()
main_layout.addWidget(model_group)

self.table = QTableWidget(1, 3)
self.table.setHorizontalHeaderLabels(["样本词条一", "样本词条二", "匹配分"])
self.table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
self.table.verticalHeader().setVisible(False)
self.table.setSelectionBehavior(QTableWidget.SelectItems)
main_layout.addWidget(self.table)

btn_layout = QHBoxLayout()

btn_layout.addWidget(QLabel("最大Token取样长度:"))
self.max_len_spin = QSpinBox()
self.max_len_spin.setRange(1, 512)
self.max_len_spin.setValue(48)
self.max_len_spin.setFixedWidth(80)
btn_layout.addWidget(self.max_len_spin)

btn_layout.addStretch()

self.btn_calc = QPushButton("计算匹配分")
self.btn_calc.setMinimumHeight(40)
self.btn_calc.setMinimumWidth(120)
self.btn_calc.clicked.connect(self._calc_all)
btn_layout.addWidget(self.btn_calc)

self.btn_clear = QPushButton("清空表格")
self.btn_clear.setMinimumHeight(40)
self.btn_clear.setMinimumWidth(100)
self.btn_clear.clicked.connect(self._clear_table)
btn_layout.addWidget(self.btn_clear)

self.btn_export = QPushButton("导出结果")
self.btn_export.setMinimumHeight(40)
self.btn_export.setMinimumWidth(100)
self.btn_export.clicked.connect(self._export_results)
btn_layout.addWidget(self.btn_export)

main_layout.addLayout(btn_layout)

# 状态栏
self.status_bar = QStatusBar()
self.status_bar.showMessage("就绪")
self.setStatusBar(self.status_bar)

def _ensure_bge_ready(self, model_dir_name):
try:
self.status_bar.showMessage(f"正在加载模型: {model_dir_name} …")
QApplication.processEvents()
BgeMatcher.instance(model_dir_name).ensure_loaded()
self.status_bar.showMessage(f"模型已加载: {model_dir_name}")
except Exception as e:
QMessageBox.critical(self, "模型加载失败",
f"模型 \"{model_dir_name}\" 加载失败，程序无法进行匹配：\n{e}")
self.status_bar.showMessage(f"模型 {model_dir_name} 加载失败")

def _on_model_changed(self, model_dir_name):
self._ensure_bge_ready(model_dir_name)

def _add_row(self):
row = self.table.rowCount()
self.table.insertRow(row)

def _load_csv(self):
file_path, _ = QFileDialog.getOpenFileName(
self, "选择 CSV 文件", "", "CSV 文件 (*.csv);;所有文件 (*)")
if not file_path:
return

try:
rows = self._read_csv(file_path)
except Exception as e:
QMessageBox.critical(self, "读取失败", f"无法读取 CSV 文件:\n{e}")
return

if not rows:
QMessageBox.information(self, "提示", "CSV 文件中没有有效数据行")
return

self.table.setRowCount(0)
for text1, text2 in rows:
row = self.table.rowCount()
self.table.insertRow(row)
self.table.setItem(row, 0, QTableWidgetItem(text1))
self.table.setItem(row, 1, QTableWidgetItem(text2))
self.table.setItem(row, 2, QTableWidgetItem(""))

self.status_bar.showMessage(f"已加载 {len(rows)} 条数据，请点击“计算匹配分”")

def _calc_all(self):
model_dir_name = self.model_combo.currentText()
max_len = self.max_len_spin.value()

try:
matcher = BgeMatcher.instance(model_dir_name)
matcher.set_max_len(max_len)
self._ensure_bge_ready(model_dir_name)
except Exception:
return

row_count = self.table.rowCount()
if row_count == 0:
QMessageBox.warning(self, "提示", "表格中没有数据，请先添加行或导入CSV")
return

for row in range(row_count):
item1 = self.table.item(row, 0)
item2 = self.table.item(row, 1)
text1 = item1.text().strip() if item1 else ""
text2 = item2.text().strip() if item2 else ""
if not text1 or not text2:
QMessageBox.warning(self, "提示", f"第 {row+1} 行存在空字段，请先填写完整")
return

try:
for row in range(row_count):
text1 = self.table.item(row, 0).text().strip()
text2 = self.table.item(row, 1).text().strip()
self.status_bar.showMessage(f"正在计算第 {row+1}/{row_count} 行…")
QApplication.processEvents()
score = text_similarity_score(text1, text2, model_dir_name)

score_item = QTableWidgetItem(f"{score:.2f}")
score_item.setTextAlignment(Qt.AlignCenter)

if score

---

[查看原文](https://www.52pojie.cn/thread-2124751-1-1.html)
