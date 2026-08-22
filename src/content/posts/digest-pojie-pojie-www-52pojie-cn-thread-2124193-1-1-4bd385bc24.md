---
title: "Linux 多服务商 DDNS 同步器"
published: 2026-08-21
description: "[md]## 功能介绍 这是一个运行在 Linux 下的 DDNS 同步脚本，支持同时更新 **YDNS** 和 **dynv6** 两个服务商的域名记录。 主要特点： - 自动检测 IPv4 / 公网IPv6 地址 - 任一服务商 IP 变化时，自动同步更新所有服务商，保证多个域名指向相同 IP - 某服务商 ..."
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "qqy123"
sourceLink: "https://www.52pojie.cn/thread-2124193-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2124193-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

### 功能介绍

这是一个运行在 Linux 下的 DDNS 同步脚本，支持同时更新 **YDNS** 和 **dynv6** 两个服务商的域名记录。

主要特点：

- 自动检测 IPv4 / 公网IPv6 地址

- 任一服务商 IP 变化时，自动同步更新所有服务商，保证多个域名指向相同 IP

- 某服务商更新失败后，下次循环单独重试，不影响其他服务商

- 支持配置文件加密存储（Fernet + PBKDF2）

- 可选网络自愈功能（需 root 权限）：当检测到 IP 获取失败或 IPv6 连通性异常时，自动重启本地网络

- 可选完整设备重启（光猫 → 路由器 → 本地网络），用于极端网络故障的自动恢复（需自行适配设备接口）

### 使用环境

- Linux 系统

- Python 3.6+

- 需要安装 `cryptography` 库：`pip install cryptography`

### 快速开始

-
生成配置文件模板：`python3 ddns.py --setup`

会在脚本同目录生成 `ddns_config.txt`，根据需要填写 YDNS / dynv6 的账号信息。

-
运行一次同步：`python3 ddns.py`

-
守护模式（定时检测）：`python3 ddns.py -d`

默认每 300 秒检测一次，可在配置文件中修改 `check_interval`。

-
守护模式 + 网络自愈（需 root）：`sudo python3 ddns.py -d -r`

当 IP 获取失败或 IPv6 失效时，自动重启本地网络，并带有冷却时间和重试限制。

### 配置文件说明

配置文件默认为 `ddns_config.txt`，格式如下：

`provider=auto`

`username=你的YDNS用户名`

`password=你的YDNS密码`

`ydns_hosts=域名1.ydns.eu, 域名2.ydns.eu`

`token=你的dynv6 token`

`dynv6_hosts=域名1.dns.navy, 域名2.dns.navy`

`check_interval=300`

`ip_type=auto`

`log_file=`

`quiet=false`

支持命令行参数覆盖配置，例如（其中 `-p` 是 YDNS 密码）：

`python3 ddns.py -u 用户名 -p YDNS密码 -n 临时域名`

### 配置文件加密

- 加密配置文件：`python3 ddns.py --encrypt -j 加密密码`

- 解密配置文件：`python3 ddns.py --decrypt -j 加密密码`

- 如果存在加密文件，运行时需带 `-j` 密码，例如：`python3 ddns.py -d -j 加密密码`

注意：这里的 `-j` 是加密/解密密码，和 YDNS 的 `-p` 密码是两回事。

### 关键代码

以下为核心更新逻辑，完整代码见附件。

[Python] *纯文本查看* *复制代码*
#!/usr/bin/env python3
"""
Linux 专用多服务商 DDNS 同步器 (YDNS / dynv6 / auto)
=====================================================
v5.3.4 - 任一IP变化强制同步所有 + 失败独立重试
"""

import os
import sys
import json
import time
import logging
import argparse
import socket
import subprocess
import re
import shutil
import hashlib
import hmac
import struct
import random
from urllib.request import Request, urlopen, HTTPError, URLError
from urllib.parse import urlencode
from base64 import b64encode, urlsafe_b64encode

__version__ = "5.3.4"

try:
    from cryptography.fernet import Fernet, InvalidToken
    from cryptography.hazmat.primitives import hashes
    from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
    HAS_CRYPTO = True
except ImportError:
    HAS_CRYPTO = False

# ─── 常量 ───────────────────────────────────────────────────────────────────
YDNS_API_BASE = "https://ydns.io/api/v1"
YDNS_UPDATE_URL = f"{YDNS_API_BASE}/update/"
YDNS_IP_JSON_URL = f"{YDNS_API_BASE}/ip.json"

DYNV6_API_BASE = "https://dynv6.com/api"
DYNV6_UPDATE_URL = f"{DYNV6_API_BASE}/update"

USER_AGENT = f"DDNS-Sync/{__version__}"

DEFAULT_CONFIG = {
    "provider": "auto",
    "username": "",
    "password": "",
    "token": "",
    "ydns_hosts": [],
    "dynv6_hosts": [],
    "check_interval": 300,
    "log_file": "",
    "quiet": False,
    "ip_type": "auto",
}

# IPv6 连通性测试目标
IPV6_TEST_TARGETS = [
    "www.baidu.com",
    "im.qq.com",
    "pvp.qq.com",
]

# 重启相关常量
RESET_COOLDOWN_SECONDS = 300      # 冷却时间 5 分钟
RESET_WINDOW_SECONDS = 600        # 计数窗口 10 分钟
RESET_MAX_IN_WINDOW = 3           # 窗口内最大重启次数
RESET_NETWORK_RECOVERY_WAIT = 15  # 重启后等待网络恢复时间
RESET_POST_RESET_LOCKOUT = 30     # 重启后锁定时间，防止立即再次重启
DEFAULT_CHECK_INTERVAL = 30       # 默认最小检查间隔
FULL_REBOOT_AT_RESET = 3          # 第3次重启时执行完整重启（光猫+路由器+本地）

# 光猫配置
MODEM_HOST = "192.168.25.25"
MODEM_BASE_URL = f"http://{MODEM_HOST}"

# 华为路由器配置
ROUTER_HOST = "192.168.26.49"
ROUTER_USERNAME = "保密"
ROUTER_PASSWORD = "保密，自己适配自己家的路由器"

# ─── 权限检测 ───────────────────────────────────────────────────────────────
def is_root():
    """检查是否以 root 权限运行"""
    return os.geteuid() == 0

def check_root_privilege(logger, action="执行此操作"):
    if not is_root():
        logger.warning(f"&#9888;&#65039;  需要 root 权限才能{action}，当前以普通用户运行，跳过该操作")
        logger.warning("   请使用 'sudo python3 ddns.py ...' 或以 root 用户运行脚本")
        return False
    return True

# ─── 日志 ───────────────────────────────────────────────────────────────────
def setup_logger(log_file="", quiet=False, debug=False):
    logger = logging.getLogger("ddns_sync")
    if logger.handlers:
        return logger
    if debug:
        logger.setLevel(logging.DEBUG)
    elif quiet:
        logger.setLevel(logging.ERROR)
    else:
        logger.setLevel(logging.INFO)

    console_level = logging.ERROR if quiet else logging.INFO
    if debug:
        console_level = logging.DEBUG

    formatter = logging.Formatter(
        "%(asctime)s [%(levelname)s] %(message)s", datefmt="%Y-%m-%d %H:%M:%S"
    )
    console = logging.StreamHandler()
    console.setLevel(console_level)
    console.setFormatter(formatter)
    logger.addHandler(console)

    if log_file:
        try:
            fh = logging.FileHandler(log_file, encoding="utf-8")
            fh.setLevel(logging.DEBUG)
            fh.setFormatter(formatter)
            logger.addHandler(fh)
        except Exception as e:
            logger.error(f"无法创建日志文件 {log_file}: {e}")
    return logger

# ─── 光猫客户端 ────────────────────────────────────────────────────────────
class ModemClient:
    """光猫 HX5-9hsaLite 客户端"""

    def __init__(self, host=MODEM_HOST):
        self.base_url = f"http://{host}"
        self.cookies = {}

    def _request(self, method, path, data=None, timeout=10):
        """发送HTTP请求"""
        url = f"{self.base_url}{path}"
        headers = {
            "User-Agent": "Mozilla/5.0 (Linux; DDNS-Sync) AppleWebKit/537.36",
            "Accept": "application/json, text/plain, */*",
            "Cache-Control": "no-cache",
        }
        cookie_str = "; ".join([f"{k}={v}" for k, v in self.cookies.items()])
        if cookie_str:
            headers["Cookie"] = cookie_str
        if data:
            headers["Content-Type"] = "application/x-www-form-urlencoded"
            body = urlencode(data).encode("utf-8")
        else:
            body = None
        try:
            req = Request(url, data=body, headers=headers, method=method)
            with urlopen(req, timeout=timeout) as resp:
                for header in resp.headers.get_all("Set-Cookie") or []:
                    match = re.match(r'([^=]+)=([^;]*)', header)
                    if match:
                        self.cookies[match.group(1)] = match.group(2)
                resp_text = resp.read().decode("utf-8", errors="replace")
                try:
                    return json.loads(resp_text)
                except json.JSONDecodeError:
                    return {"raw": resp_text}
        except Exception as e:
            return {"error": str(e)}

    def get_session(self):
        """获取 session cookie"""
        result = self._request("GET", "/webcmcc/index.html")
        return "error" not in result

    def reboot(self):
        """执行光猫重启"""
        nonedata = str(random.random())
        resp = self._request("POST", "/boaform/device_reset.cgi", {
            "mode_name": "device_reset",
            "nonedata": nonedata,
            "reboot_type": "1",
        })
        if "error" in resp:
            return False
        data = resp.get("data", {})
        return data.get("result", "").upper() == "SUCCESS"

def modem_reboot(logger):
    """执行光猫 HX5-9hsaLite 重启"""
    logger.info("&#128225; 正在执行光猫 HX5-9hsaLite 重启...")
    try:
        modem = ModemClient()
        if not modem.get_session():
            logger.error("  &#10060; 获取光猫 session 失败")
            return False
        logger.info("  &#9989; 光猫 session 获取成功，发送重启指令...")
        if modem.reboot():
            logger.info("  &#9989; 光猫重启指令发送成功")
            return True
        else:
            logger.error("  &#10060; 光猫重启指令发送失败")
            return False
    except Exception as e:
        logger.error(f"  &#10060; 光猫重启异常: {e}")
        return False

# ─── 华为路由器客户端 ─────────────────────────────────────────────────────
class RouterClient:
    """华为路由器 TC7001 客户端"""

    def __init__(self, host=ROUTER_HOST, username=ROUTER_USERNAME, password=ROUTER_PASSWORD):
        self.base_url = f"http://{host}"
        self.username = username
        self.password = password
        self.csrf_param = ""
        self.csrf_token = ""
        self.cookies = {}

    def _request(self, method, path, json_data=None, timeout=10):
        """发送HTTP请求"""
        url = f"{self.base_url}{path}"
        headers = {
            "User-Agent": "Mozilla/5.0 (Linux; DDNS-Sync) AppleWebKit/537.36",
            "Accept": "application/json, text/plain, */*",
            "_ResponseFormat": "JSON",
        }
        cookie_str = "; ".join([f"{k}={v}" for k, v in self.cookies.items()])
        if cookie_str:
            headers["Cookie"] = cookie_str
        if json_data:
            headers["Content-Type"] = "application/json;charset=utf-8"
            data = json.dumps(json_data).encode("utf-8")
        else:
            data = None
        try:
            req = Request(url, data=data, headers=headers, method=method)
            with urlopen(req, timeout=timeout) as resp:
                for header in resp.headers.get_all("Set-Cookie") or []:
                    match = re.match(r'([^=]+)=([^;]*)', header)
                    if match:
                        self.cookies[match.group(1)] = match.group(2)
                body = resp.read().decode("utf-8", errors="replace")
                try:
                    return json.loads(body)
                except json.JSONDecodeError:
                    return {"raw": body}
        except Exception as e:
            return {"error": str(e)}

    def _update_csrf(self, data):
        """更新CSRF token"""
        if isinstance(data, dict):
            if "csrf_param" in data:
                self.csrf_param = data["csrf_param"]
            if "csrf_token" in data:
                self.csrf_token = data["csrf_token"]

    def get_csrf(self):
        """获取CSRF token"""
        result = self._request("GET", "/html/index.html")
        if "error" in result:
            return False
        raw = result.get("raw", "")
        param_match = re.search(r'csrf_param["\']\s+content=["\']([^"\']+)', raw)
        token_match = re.search(r'csrf_token["\']\s+content=["\']([^"\']+)', raw)
        if param_match and token_match:
            self.csrf_param = param_match.group(1)
            self.csrf_token = token_match.group(1)
            return True
        return False

    def login(self):
        """登录路由器（SCRAM认证协议）"""
        nonce = os.urandom(16).hex()
        resp = self._request("POST", "/api/system/user_login_nonce", {
            "data": {"username": self.username, "firstnonce": nonce},
            "csrf": {"csrf_param": self.csrf_param, "csrf_token": self.csrf_token}
        })
        self._update_csrf(resp)
        if resp.get("err") != 0:
            return False
        server_nonce = resp.get("servernonce", "")
        salt = bytes.fromhex(resp.get("salt", ""))
        iterations = resp.get("iterations", 0)
        salted_pwd = hashlib.pbkdf2_hmac('sha256', self.password.encode(), salt, iterations, 32)
        client_key = hmac.new(b"Client Key", salted_pwd, hashlib.sha256).digest()
        stored_key = hashlib.sha256(client_key).digest()
        auth_msg = f"{nonce},{server_nonce},{server_nonce}"
        client_sig = hmac.new(auth_msg.encode(), stored_key, hashlib.sha256).digest()
        ck = struct.unpack('>8i', client_key)
        cs = struct.unpack('>8i', client_sig)
        proof = struct.pack('>8i', *[c ^ s for c, s in zip(ck, cs)])
        resp = self._request("POST", "/api/system/user_login_proof", {
            "data": {"clientproof": proof.hex(), "finalnonce": server_nonce},
            "csrf": {"csrf_param": self.csrf_param, "csrf_token": self.csrf_token}
        })
        self._update_csrf(resp)
        return resp.get("err") == 0

    def reboot(self):
        """执行路由器重启"""
        resp = self._request("POST", "/api/service/reboot.cgi", {
            "data": "",
            "csrf": {"csrf_param": self.csrf_param, "csrf_token": self.csrf_token}
        })
        return resp.get("errcode") == 0

def router_reboot(logger):
    """执行华为路由器 TC7001 重启"""
    logger.info("&#128260; 正在执行华为路由器 TC7001 真正重启（断电重启）...")
    try:
        router = RouterClient()
        if not router.get_csrf():
            logger.error("  &#10060; 获取CSRF失败")
            return False
        if not router.login():
            logger.error("  &#10060; 路由器登录失败")
            return False
        logger.info("  &#9989; 路由器登录成功，发送重启指令...")
        if router.reboot():
            logger.info("  &#9989; 路由器重启指令发送成功")
            return True
        else:
            logger.error("  &#10060; 路由器重启指令发送失败")
            return False
    except Exception as e:
        logger.error(f"  &#10060; 路由器重启异常: {e}")
        return False

def full_device_reboot(logger):
    """执行完整设备重启：光猫 → 路由器 → 本地网络"""
    logger.warning("&#128268; 执行完整设备重启：光猫 → 路由器 → 本地网络")
    logger.warning("   &#9888;&#65039;  全部设备将断电重启，断网约60秒，请勿关闭脚本")
    all_success = True
    logger.info("=" * 50)
    logger.info("&#128225; [Step 1/3] 重启光猫...")
    modem_success = modem_reboot(logger)
    if not modem_success:
        logger.warning("  &#9888;&#65039; 光猫重启失败，继续执行后续步骤...")
        all_success = False
    logger.info("  等待1秒...")
    time.sleep(1)
    logger.info("=" * 50)
    logger.info("&#128260; [Step 2/3] 重启路由器...")
    router_success = router_reboot(logger)
    if not router_success:
        logger.warning("  &#9888;&#65039; 路由器重启失败，继续执行本地重启...")
        all_success = False
    logger.info("  等待1秒...")
    time.sleep(1)
    logger.info("=" * 50)
    logger.info("&#127760; [Step 3/3] 本地网络重启...")
    network_success = reset_network(logger)
    if not network_success:
        logger.warning("  &#9888;&#65039; 本地网络重启失败")
        all_success = False
    if all_success:
        logger.info("=" * 50)
        logger.info("&#9989; 完整设备重启全部成功！")
    else:
        logger.warning("=" * 50)
        logger.warning("&#9888;&#65039;  部分设备重启失败，请检查日志")
    return all_success

# ─── 网络工具 ───────────────────────────────────────────────────────────────
def build_auth_header(username, password):
    credentials = f"{username}:{password}"
    encoded = b64encode(credentials.encode("utf-8")).decode("ascii")
    return f"Basic {encoded}"

def http_get(url, username="", password="", timeout=20):
    req = Request(url, method="GET")
    req.add_header("User-Agent", USER_AGENT)
    if username and password:
        req.add_header("Authorization", build_auth_header(username, password))
    try:
        with urlopen(req, timeout=timeout) as resp:
            return resp.getcode(), resp.read().decode("utf-8", errors="replace").strip()
    except HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="replace").strip()
    except URLError as e:
        return 0, f"网络错误: {e.reason}"
    except Exception as e:
        return 0, str(e)

# ─── 本机 IP 检测 ──────────────────────────────────────────────────────────
def _get_ipv4_by_udp():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(1)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip if not ip.startswith('127.') else None
    except:
        return None

def _get_ipv6_by_udp():
    try:
        s = socket.socket(socket.AF_INET6, socket.SOCK_DGRAM)
        s.settimeout(1)
        s.connect(('2001:4860:4860::8888', 80))
        ip = s.getsockname()[0]
        s.close()
        ip = ip.split('%')[0]
        if ip == '::1' or ip.startswith('fe80:') or ip.startswith('fd'):
            return None
        return ip
    except:
        return None

def _get_ipv6_from_proc():
    ipv6s = set()
    if not os.path.isfile('/proc/net/if_inet6'):
        return ipv6s
    try:
        with open('/proc/net/if_inet6') as f:
            for line in f:
                parts = line.strip().split()
                if len(parts)  bool:
    """检查 IPv6 地址是否无效"""
    if not ip:
        return True
    if ip.count("0000") >= 7:
        return True
    if ip in ("::", "0:0:0:0:0:0:0:0"):
        return True
    if ip.startswith('fd'):
        return True
    try:
        packed = socket.inet_pton(socket.AF_INET6, ip)
        if packed == b'\x00' * 16:
            return True
        if packed == b'\x00' * 15 + b'\x01':
            return True
    except OSError:
        return True
    return False

def get_local_ips():
    """获取本机所有有效 IP 地址"""
    ipv4_set, ipv6_set = set(), set()
    udp_ipv4 = _get_ipv4_by_udp()
    if udp_ipv4:
        ipv4_set.add(udp_ipv4)
    udp_ipv6 = _get_ipv6_by_udp()
    if udp_ipv6:
        ipv6_set.add(udp_ipv6)
    output = ""
    try:
        result = subprocess.run(['ip', 'addr', 'show'], capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            output = result.stdout
    except:
        pass
    if not output:
        try:
            result = subprocess.run(['ifconfig'], capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                output = result.stdout
        except:
            pass
    if output:
        v4s, v6s = _parse_ips_from_ifconfig_output(output)
        ipv4_set.update(v4s)
        ipv6_set.update(v6s)
    ipv6_set.update(_get_ipv6_from_proc())
    if not ipv4_set:
        try:
            hostname = socket.gethostname()
            for addr in socket.gethostbyname_ex(hostname)[2]:
                if not addr.startswith('127.'):
                    ipv4_set.add(addr)
        except:
            pass
    if not ipv6_set:
        try:
            hostname = socket.gethostname()
            for info in socket.getaddrinfo(hostname, None, socket.AF_INET6):
                ip = info[4][0].split('%')[0]
                if ip == '::1' or ip.startswith('fe80:') or ip.startswith('ff') or ip.startswith('::ffff:') or ip.startswith('fd'):
                    continue
                ipv6_set.add(ip)
        except:
            pass
    try:
        import netifaces
        for iface in netifaces.interfaces():
            for addr_info in netifaces.ifaddresses(iface).get(netifaces.AF_INET, []):
                ip = addr_info.get('addr', '')
                if not ip.startswith('127.'):
                    ipv4_set.add(ip)
            for addr_info in netifaces.ifaddresses(iface).get(netifaces.AF_INET6, []):
                ip = addr_info.get('addr', '').split('%')[0]
                if ip == '::1' or ip.startswith('fe80:') or ip.startswith('ff') or ip.startswith('::ffff:') or ip.startswith('fd'):
                    continue
                ipv6_set.add(ip)
    except:
        pass
    ipv6_set = {ip for ip in ipv6_set if not _is_invalid_ipv6(ip)}
    ipv4_list = sorted(list(ipv4_set), key=lambda x: [int(n) for n in x.split('.')])
    ipv6_list = sorted(list(ipv6_set))
    return ipv4_list, ipv6_list

def get_public_ip(ip_type="auto"):
    """获取公网 IP 地址"""
    logger = logging.getLogger("ddns_sync")
    status, text = http_get(YDNS_IP_JSON_URL)
    if status == 200 and text:
        try:
            data = json.loads(text)
            ip = data.get("ip", "")
            addr_type = data.get("address_type", 0)
            if ip:
                if ip_type == "ipv4" and addr_type == 6:
                    pass
                elif ip_type == "ipv6" and addr_type == 4:
                    pass
                else:
                    if addr_type == 6 and _is_invalid_ipv6(ip):
                        logger.debug(f"YDNS API 返回无效 IPv6: {ip}，忽略")
                    else:
                        logger.debug(f"YDNS API 返回 IP: {ip} (IPv{addr_type})")
                        return ip, addr_type
        except json.JSONDecodeError:
            addr_type = 4 if '.' in text else 6
            if ip_type == "ipv4" and addr_type == 6:
                pass
            elif ip_type == "ipv6" and addr_type == 4:
                pass
            else:
                if addr_type == 6 and _is_invalid_ipv6(text):
                    logger.debug(f"YDNS API 返回无效 IPv6: {text}，忽略")
                else:
                    logger.debug(f"YDNS API 返回纯文本 IP: {text}")
                    return text, addr_type
    logger.info("YDNS API 无法提供所需 IP，尝试本机接口检测...")
    ipv4_list, ipv6_list = get_local_ips()
    def _pick_first_valid_ip(ip_list, ver):
        for ip in ip_list:
            if ver == 6 and _is_invalid_ipv6(ip):
                continue
            return ip
        return ""
    if ip_type == "ipv4":
        ip = _pick_first_valid_ip(ipv4_list, 4)
        if ip:
            logger.info(f"本机 IPv4: {ip}")
            return ip, 4
    elif ip_type == "ipv6":
        ip = _pick_first_valid_ip(ipv6_list, 6)
        if ip:
            logger.info(f"本机 IPv6: {ip}")
            return ip, 6
    else:
        ip = _pick_first_valid_ip(ipv6_list, 6)
        if ip:
            logger.info(f"本机 IPv6 (auto): {ip}")
            return ip, 6
        ip = _pick_first_valid_ip(ipv4_list, 4)
        if ip:
            logger.info(f"本机 IPv4 (auto): {ip}")
            return ip, 4
    logger.warning("未发现任何有效 IP 地址")
    return "", 0

def get_public_ip_json():
    """获取公网 IP 的 JSON 信息"""
    status, text = http_get(YDNS_IP_JSON_URL)
    if status == 200:
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            return {"ip": text, "address_type": 4 if '.' in text else 6}
    return None

# ─── IPv6 连通性检测 ────────────────────────────────────────────────────────
def check_ipv6_connectivity(logger):
    """检查 IPv6 连通性"""
    logger.debug("开始 IPv6 连通性检测...")
    ping_cmd = "ping6"
    if not shutil.which("ping6"):
        ping_cmd = "ping -6"
        if not shutil.which("ping"):
            logger.error("未找到 ping 命令，无法进行 IPv6 连通性检测")
            return True
    success_count = 0
    for target in IPV6_TEST_TARGETS:
        try:
            logger.debug(f"ping6 {target}...")
            if ping_cmd == "ping6":
                cmd = ["ping6", "-c", "1", "-W", "2", target]
            else:
                cmd = ["ping", "-6", "-c", "1", "-W", "2", target]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                logger.debug(f"&#10003; {target} 可达")
                success_count += 1
            else:
                logger.debug(f"&#10007; {target} 不可达")
        except subprocess.TimeoutExpired:
            logger.debug(f"&#10007; {target} 超时")
        except Exception as e:
            logger.debug(f"&#10007; {target} 错误: {e}")
    if success_count == 0:
        logger.warning(f"IPv6 连通性检测失败：所有 {len(IPV6_TEST_TARGETS)} 个目标均不可达")
        return False
    else:
        logger.debug(f"IPv6 连通性检测通过：{success_count}/{len(IPV6_TEST_TARGETS)} 个目标可达")
        return True

# ─── 更新函数 ───────────────────────────────────────────────────────────────
def update_host_ydns(host, ip, username, password, record_id=""):
    """更新 YDNS 主机记录"""
    params = {"host": host}
    if ip:
        params["ip"] = ip
    if record_id:
        params["record_id"] = record_id
    url = f"{YDNS_UPDATE_URL}?{urlencode(params)}"
    status, text = http_get(url, username, password)
    if status == 200 and text.lower() == "good":
        return True, f"&#10003; YDNS 成功更新 {host}"
    elif status == 200:
        return True, f"&#10003; YDNS 已更新 {host}: {text}"
    elif status == 400:
        return False, f"&#10007; YDNS 请求参数无效 (400): {text}"
    elif status == 401:
        return False, f"&#10007; YDNS 认证失败 (401): 请检查用户名/密码"
    elif status == 404:
        return False, f"&#10007; YDNS 主机未找到 (404): {host}"
    else:
        return False, f"&#10007; YDNS 更新失败 ({status}): {text}"

def update_host_dynv6(host, ipv4, ipv6, token):
    """更新 dynv6 主机记录"""
    if not host or not token:
        return False, "缺少主机名或 token"
    params = {"hostname": host, "token": token}
    if ipv4:
        params["ipv4"] = ipv4
    if ipv6:
        params["ipv6"] = ipv6
    url = f"{DYNV6_UPDATE_URL}?{urlencode(params)}"
    logger = logging.getLogger("ddns_sync")
    logger.debug(f"dynv6 更新 URL: {url}")
    status, text = http_get(url)
    if status == 200 and text.lower() in ["ok", "addresses updated"]:
        return True, f"&#10003; dynv6 成功更新 {host}"
    elif status == 200:
        return True, f"&#10003; dynv6 已更新 {host}: {text}"
    elif status == 400:
        return False, f"&#10007; dynv6 请求参数无效 (400): {text}"
    elif status == 403:
        return False, f"&#10007; dynv6 认证失败 (403): token 无效"
    elif status == 404:
        return False, f"&#10007; dynv6 主机未找到 (404): {host}"
    else:
        return False, f"&#10007; dynv6 更新失败 ({status}): {text}"

# ─── 加密 / 解密 ────────────────────────────────────────────────────────────
def _derive_key(password: str, salt: bytes = b"ydns-sync-salt") -> bytes:
    """派生加密密钥"""
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=480000,
    )
    return urlsafe_b64encode(kdf.derive(password.encode("utf-8")))

def encrypt_file(input_path: str, output_path: str, password: str):
    """加密配置文件"""
    if not HAS_CRYPTO:
        print("&#10060; 需要 cryptography 库，请执行: pip install cryptography")
        sys.exit(1)
    with open(input_path, "r", encoding="utf-8") as f:
        data = f.read()
    key = _derive_key(password)
    f = Fernet(key)
    encrypted = f.encrypt(data.encode("utf-8"))
    with open(output_path, "wb") as out:
        out.write(encrypted)
    os.remove(input_path)
    print(f"&#9989; 已加密配置文件 → {output_path}")
    print("   原文件已删除。")

def decrypt_file(input_path: str, password: str) -> str:
    """解密配置文件"""
    if not HAS_CRYPTO:
        print("&#10060; 需要 cryptography 库，请执行: pip install cryptography")
        sys.exit(1)
    with open(input_path, "rb") as f:
        encrypted_data = f.read()
    key = _derive_key(password)
    f = Fernet(key)
    try:
        decrypted = f.decrypt(encrypted_data)
        return decrypted.decode("utf-8")
    except InvalidToken:
        print("&#10060; 密码错误或文件已损坏，解密失败。")
        sys.exit(1)

def parse_text_config_from_string(text: str):
    """从字符串解析配置"""
    cfg = dict(DEFAULT_CONFIG)
    ydns_hosts = []
    dynv6_hosts = []
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or line.startswith(";"):
            continue
        if "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip().lower()
        value = value.strip()
        if key == "provider":
            cfg["provider"] = value.lower()
        elif key == "username":
            cfg["username"] = value
        elif key == "password":
            cfg["password"] = value
        elif key == "token":
            cfg["token"] = value
        elif key == "ydns_hosts":
            if value:
                ydns_hosts.extend([h.strip() for h in value.split(",") if h.strip()])
        elif key == "ydns_host":
            if value:
                ydns_hosts.append(value.strip())
        elif key == "dynv6_hosts":
            if value:
                dynv6_hosts.extend([h.strip() for h in value.split(",") if h.strip()])
        elif key == "dynv6_host":
            if value:
                dynv6_hosts.append(value.strip())
        elif key == "check_interval":
            try:
                cfg["check_interval"] = int(value)
            except:
                pass
        elif key == "log_file":
            cfg["log_file"] = value
        elif key == "quiet":
            cfg["quiet"] = value.lower() in ("true", "yes", "1")
        elif key == "ip_type":
            if value.lower() in ("auto", "ipv4", "ipv6"):
                cfg["ip_type"] = value.lower()
    cfg["ydns_hosts"] = ydns_hosts
    cfg["dynv6_hosts"] = dynv6_hosts
    return cfg

def parse_text_config(file_path):
    """从文件解析配置"""
    if not os.path.exists(file_path):
        return dict(DEFAULT_CONFIG)
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()
    return parse_text_config_from_string(text)

def generate_config_template(file_path):
    """生成配置模板"""
    template = """\
# =============================================
# 多服务商 DDNS 同步器配置文件 (Linux 版)
# =============================================

# 选择服务商：ydns、dynv6 或 auto（自动同时更新两个）
provider=auto

# ---------- YDNS 设置 ----------
username=请填写YDNS用户名
password=请填写YDNS密码
ydns_hosts=你的域名1.ydns.eu, 你的域名2.ydns.eu

# ---------- dynv6 设置 ----------
token=请填写dynv6的token
dynv6_hosts=你的域名1.dns.navy, 你的域名2.dns.navy

# 检查间隔（秒），守护模式（-d）下有效
check_interval=300

# IP 类型：auto（自动）、ipv4（仅IPv4）、ipv6（仅IPv6）
ip_type=auto

# 日志文件路径（留空则不写入文件）
log_file=

# 静默模式（true 或 false）
quiet=false
"""
    try:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(template)
        print(f"&#9989; 配置模板已生成: {file_path}")
        return True
    except Exception as e:
        print(f"&#10060; 无法生成配置文件: {e}")
        return False

def show_config(config):
    """显示当前配置（隐藏敏感信息）"""
    masked = dict(config)
    if masked.get("password"):
        pwd = masked["password"]
        masked["password"] = "****" + pwd[-4:] if len(pwd) > 4 else "****"
    if masked.get("token"):
        tok = masked["token"]
        masked["token"] = tok[:4] + "****" + tok[-4:] if len(tok) > 8 else "****"
    print("=" * 50)
    print("当前配置")
    print("=" * 50)
    for k, v in masked.items():
        print(f"  {k}: {v}")
    print("=" * 50)

# ─── 同步逻辑 ───────────────────────────────────────────────────────────────
def _sync_ydns(config, logger, force_ip=""):
    """同步 YDNS 主机"""
    username = config.get("username", "")
    password = config.get("password", "")
    hosts = config.get("ydns_hosts", [])
    ip_type = config.get("ip_type", "auto")
    if not username or not password:
        logger.warning("YDNS 未配置用户名/密码，跳过")
        return False
    if not hosts:
        logger.warning("未配置 ydns_hosts，跳过 YDNS")
        return False
    ip_to_use = force_ip
    if not ip_to_use:
        ip_to_use, addr_type = get_public_ip(ip_type)
        if not ip_to_use:
            logger.warning("&#9888;&#65039; YDNS 无法获取 IP，跳过本次更新")
            return False
        logger.info(f"[YDNS] 将使用 IP: {ip_to_use} (IPv{addr_type})")
    else:
        logger.info(f"[YDNS] 使用指定 IP: {ip_to_use}")
    all_ok = True
    for host in hosts:
        success, msg = update_host_ydns(host, ip_to_use, username, password)
        if success:
            logger.info(msg)
        else:
            logger.error(msg)
            all_ok = False
    return all_ok

def _sync_dynv6(config, logger, force_ip=""):
    """同步 dynv6 主机"""
    token = config.get("token", "")
    hosts = config.get("dynv6_hosts", [])
    ip_type = config.get("ip_type", "auto")
    if not token:
        logger.warning("dynv6 未配置 token，跳过")
        return False
    if not hosts:
        logger.warning("未配置 dynv6_hosts，跳过 dynv6")
        return False
    logger.info(f"[dynv6] 开始检测 IP...")
    ipv4, ipv6 = "", ""
    if force_ip:
        if ':' in force_ip:
            ipv6 = force_ip
        else:
            ipv4 = force_ip
        logger.info(f"[dynv6] 使用指定 IP: IPv4={ipv4 or '无'}, IPv6={ipv6 or '无'}")
    else:
        if ip_type in ("auto", "ipv4"):
            ip, at = get_public_ip("ipv4")
            if ip and at == 4:
                ipv4 = ip
                logger.info(f"[dynv6] 检测到 IPv4: {ipv4}")
        if ip_type in ("auto", "ipv6"):
            ip, at = get_public_ip("ipv6")
            if ip and at == 6:
                ipv6 = ip
                logger.info(f"[dynv6] 检测到 IPv6: {ipv6}")
    if not ipv4 and not ipv6:
        logger.warning("&#9888;&#65039; dynv6 无法获取任何 IP，跳过本次更新")
        return False
    logger.info(f"[dynv6] 将使用 IP: IPv4={ipv4 or '无'}, IPv6={ipv6 or '无'}")
    all_ok = True
    for host in hosts:
        success, msg = update_host_dynv6(host, ipv4, ipv6, token)
        if success:
            logger.info(msg)
        else:
            logger.error(msg)
            all_ok = False
    return all_ok

def sync_once(config, logger, force_ip=""):
    """执行一次同步"""
    provider = config.get("provider", "auto")
    if provider in ("ydns", "dynv6"):
        if provider == "ydns":
            return _sync_ydns(config, logger, force_ip)
        else:
            return _sync_dynv6(config, logger, force_ip)
    elif provider == "auto":
        logger.info("═══════════════════════════════════════════════════")
        logger.info("自动模式：同时更新 YDNS 和 dynv6")
        logger.info("═══════════════════════════════════════════════════")
        logger.info(">>> [1/2] 更新 YDNS...")
        ok_ydns = _sync_ydns(config, logger, force_ip)
        logger.info(f">>> YDNS 结果: {'&#9989; 成功' if ok_ydns else '&#10060; 失败'}")
        logger.info(">>> [2/2] 更新 dynv6...")
        ok_dynv6 = _sync_dynv6(config, logger, force_ip)
        logger.info(f">>> dynv6 结果: {'&#9989; 成功' if ok_dynv6 else '&#10060; 失败'}")
        logger.info("═══════════════════════════════════════════════════")
        if ok_ydns and ok_dynv6:
            logger.info("&#9989; 两个服务商均已更新")
        elif ok_ydns or ok_dynv6:
            logger.warning("&#9888;&#65039;  部分服务商更新成功")
        else:
            logger.error("&#10060; 所有服务商更新失败")
        logger.info("═══════════════════════════════════════════════════")
        return ok_ydns or ok_dynv6
    else:
        logger.error(f"未知的服务商: {provider}")
        return False

# ─── 网络重启 ───────────────────────────────────────────────────────────────
def reset_network(logger):
    """重启网络接口，需要 root 权限"""
    if not check_root_privilege(logger, "重启网络"):
        return False
    logger.info("&#128260; 正在重启网络（使用systemd-networkd，重新请求DHCP/IPv6）...")
    def run_cmd(cmd_list, action_desc, ignore_errors=False):
        logger.info(f"  {action_desc}: {' '.join(cmd_list)}")
        try:
            result = subprocess.run(
                cmd_list, check=False, timeout=15,
                capture_output=True, text=True
            )
            if result.returncode != 0 and not ignore_errors:
                logger.warning(f"  {action_desc}可能失败 (返回码 {result.returncode})")
                if result.stderr:
                    logger.debug(f"  错误详情: {result.stderr.strip()}")
                return False
            else:
                logger.debug(f"  {action_desc}完成")
                return True
        except subprocess.TimeoutExpired:
            logger.error(f"  {action_desc}超时 (15秒)")
            return False
        except FileNotFoundError:
            logger.error(f"  命令不存在: {cmd_list[0]}")
            return False
        except Exception as e:
            logger.error(f"  {action_desc}异常: {e}")
            return False
    if shutil.which('systemctl'):
        logger.info("  使用systemd-networkd进行网络管理")
        if shutil.which('networkctl'):
            logger.info("  使用networkctl工具关闭物理接口...")
            try:
                result = subprocess.run(
                    ["networkctl", "--no-pager", "list", "--no-legend"],
                    capture_output=True, text=True, timeout=5
                )
                if result.returncode == 0:
                    interfaces = []
                    for line in result.stdout.splitlines():
                        parts = line.split()
                        if len(parts) >= 2:
                            iface = parts[1]
                            if (iface != "lo" and
                                not iface.startswith(("tun", "tap", "veth", "docker", "br-", "virbr")) and
                                "docker" not in iface and
                                "br-" not in iface):
                                interfaces.append(iface)
                    if interfaces:
                        logger.info(f"  检测到物理接口: {interfaces}")
                        run_cmd(["networkctl", "down"] + interfaces, "关闭物理接口", ignore_errors=True)
                        logger.info("  等待3秒（确保IPv6地址释放）...")
                        time.sleep(3)
                    else:
                        logger.warning("  networkctl未检测到物理接口，尝试备用方案")
            except Exception as e:
                logger.debug(f"  networkctl命令失败: {e}")
        if not shutil.which('networkctl'):
            logger.info("  networkctl不可用，使用ip命令方案...")
            interfaces = []
            try:
                sys_net = "/sys/class/net"
                if os.path.exists(sys_net):
                    for iface in os.listdir(sys_net):
                        if (iface != "lo" and
                            not iface.startswith(("tun", "tap", "veth", "docker", "br-", "virbr")) and
                            os.path.isdir(f"{sys_net}/{iface}") and
                            iface != "virbr0"):
                            interfaces.append(iface)
            except Exception as e:
                logger.debug(f"  读取/sys/class/net失败: {e}")
            if not interfaces:
                logger.warning("  无法检测物理接口，尝试常见接口名")
                common_interfaces = ["enp4s0", "eth0", "ens33", "enp3s0", "enp0s3"]
                for iface in common_interfaces:
                    if os.path.exists(f"/sys/class/net/{iface}"):
                        interfaces.append(iface)
                if not interfaces:
                    interfaces = ["enp4s0"]
            logger.info(f"  检测到物理接口: {interfaces}")
            for iface in interfaces:
                run_cmd(["ip", "link", "set", iface, "down"], f"关闭接口 {iface}")
            logger.info("  等待3秒（确保IPv6地址释放）...")
            time.sleep(3)
        run_cmd(["systemctl", "stop", "systemd-networkd.socket", "systemd-networkd.service"], "停止网络服务")
        logger.info("  等待2秒...")
        time.sleep(2)
        run_cmd(["systemctl", "start", "systemd-networkd.socket", "systemd-networkd.service"], "启动网络服务")
        if not shutil.which('networkctl'):
            for iface in interfaces:
                run_cmd(["ip", "link", "set", iface, "up"], f"启动接口 {iface}")
        logger.info("&#9989; 网络服务已重启，systemd-networkd将自动重新配置所有接口")
        logger.info("   系统会重新请求DHCP/IPv6地址")
        return True
    if shutil.which('nmcli'):
        logger.info("  使用NetworkManager进行网络管理")
        run_cmd(["nmcli", "networking", "off"], "关闭网络")
        logger.info("  等待5秒...")
        time.sleep(5)
        success = run_cmd(["nmcli", "networking", "on"], "开启网络")
        if success:
            logger.info("&#9989; NetworkManager网络已重启，将重新请求DHCP/IPv6")
        return success
    logger.error("&#10060; 无法找到支持的网络管理工具 (systemctl 或 nmcli)")
    return False

class NetworkResetManager:
    """网络重启管理器"""

    def __init__(self, logger, enable_full_reboot=True):
        self.logger = logger
        self.reset_count = 0
        self.window_start = time.time()
        self.cooldown_active = False
        self.cooldown_end = 0
        self.post_reset_lockout_until = 0
        self.last_reset_reason = ""
        self.last_reset_time = 0
        self.enable_full_reboot = enable_full_reboot
        self.full_reboot_executed = False

    def can_reset(self):
        """检查是否允许重启"""
        now = time.time()
        if self.cooldown_active:
            if now  RESET_WINDOW_SECONDS:
            if self.reset_count > 0:
                self.logger.info(f"&#128260; 重启计数窗口已过期，重置计数 ({self.reset_count} -> 0)")
            self.reset_count = 0
            self.window_start = now
            self.full_reboot_executed = False
        if self.reset_count >= RESET_MAX_IN_WINDOW:
            self.cooldown_active = True
            self.cooldown_end = now + RESET_COOLDOWN_SECONDS
            self.logger.warning(f"&#9940; 已达到 {RESET_MAX_IN_WINDOW} 次重启限制，进入冷却期 {RESET_COOLDOWN_SECONDS} 秒")
            return False, f"达到限制，冷却 {RESET_COOLDOWN_SECONDS} 秒"
        return True, "允许重启"

    def execute_reset(self, reason):
        """执行网络重启"""
        can, why = self.can_reset()
        if not can:
            self.logger.info(f"&#9203; 网络重启被阻止: {why}")
            return False
        next_reset_count = self.reset_count + 1
        if (self.enable_full_reboot and
            next_reset_count == FULL_REBOOT_AT_RESET and
            not self.full_reboot_executed):
            self.logger.warning(f"&#128268; 第 {next_reset_count} 次重启触发完整设备重启条件！")
            self.logger.info(f"   将执行: 光猫重启 → 路由器重启 → 本地网络重启 → 冷却期")
            full_device_reboot(self.logger)
            self.full_reboot_executed = True
            self.reset_count += 1
            self.last_reset_reason = reason
            self.last_reset_time = time.time()
            self.cooldown_active = True
            self.cooldown_end = time.time() + RESET_COOLDOWN_SECONDS
            self.logger.info(f"&#9989; 完整设备重启完成，进入 {RESET_COOLDOWN_SECONDS} 秒冷却期")
            return True
        self.reset_count += 1
        self.last_reset_reason = reason
        self.last_reset_time = time.time()
        self.logger.warning(f"&#128260; 第 {self.reset_count}/{RESET_MAX_IN_WINDOW} 次本地网络重启（原因：{reason}）")
        success = reset_network(self.logger)
        if success:
            self.post_reset_lockout_until = time.time() + RESET_POST_RESET_LOCKOUT
            self.logger.info(f"&#9989; 网络重启成功，进入 {RESET_POST_RESET_LOCKOUT} 秒观察期")
            time.sleep(RESET_NETWORK_RECOVERY_WAIT)
            return True
        else:
            self.logger.error("&#10060; 网络重启执行失败")
            return False

    def get_status(self):
        """获取完整状态信息"""
        now = time.time()
        return {
            "reset_count": self.reset_count,
            "max_in_window": RESET_MAX_IN_WINDOW,
            "window_remaining": max(0, RESET_WINDOW_SECONDS - (now - self.window_start)),
            "cooldown_active": self.cooldown_active,
            "cooldown_remaining": max(0, self.cooldown_end - now) if self.cooldown_active else 0,
            "lockout_remaining": max(0, self.post_reset_lockout_until - now),
            "last_reset_reason": self.last_reset_reason,
            "last_reset_time": self.last_reset_time,
            "full_reboot_executed": self.full_reboot_executed,
            "full_reboot_at_reset": FULL_REBOOT_AT_RESET,
        }

# ─── 守护模式 ──────────────────────────────────────────────────────────────
def daemon_mode(config, logger, reset_on_failure=False, enable_full_reboot=True):
    """
    守护模式主循环

    更新策略：
    1. 任一服务商 IP 变化 → 强制同步更新所有服务商（保证两个域名指向相同 IP）
    2. 某服务商更新失败 → 下次循环单独重试该服务商（不影响其他服务商）
    3. 仅当全部服务商都成功且 IP 无变化时才跳过更新
    """
    provider = config.get("provider", "auto")
    interval = config.get("check_interval", 300)
    ip_type = config.get("ip_type", "auto")

    if reset_on_failure and not is_root():
        logger.warning("&#9888;&#65039;  网络重启功能需要 root 权限，当前以普通用户运行")
        logger.warning("   网络重启功能将被禁用，请使用 'sudo python3 ddns.py -d -r' 运行")
        reset_on_failure = False

    track_ydns = provider in ("ydns", "auto") and config.get("ydns_hosts")
    track_dynv6 = provider in ("dynv6", "auto") and config.get("dynv6_hosts")

    logger.info(f"&#128640; 进入守护模式，每 {interval} 秒检查一次")
    logger.info(f"跟踪服务商: {', '.join(filter(None, [track_ydns and 'YDNS', track_dynv6 and 'dynv6']))}")

    if reset_on_failure:
        logger.info("网络重启功能已启用")
        logger.info(f"  - 冷却时间: {RESET_COOLDOWN_SECONDS}秒")
        logger.info(f"  - 重启后观察期: {RESET_POST_RESET_LOCKOUT}秒")
        logger.info(f"  - 窗口内最大重启: {RESET_MAX_IN_WINDOW}次/{RESET_WINDOW_SECONDS}秒")
        logger.info("IPv6 连通性检测已启用，每 30 秒检测一次")
        if enable_full_reboot:
            logger.info(f"  - 完整设备重启: 第{FULL_REBOOT_AT_RESET}次重启时执行（光猫→路由器→本地）")
        else:
            logger.info("  - 完整设备重启: 已禁用")
    else:
        logger.info("网络重启功能已禁用")
        logger.info("IPv6 连通性检测已跳过（无需检测）")

    logger.info("按 Ctrl+C 停止")

    # 上次记录的 IP（用于检测变化）
    last_ydns_ip = ""
    last_dynv6_ipv4, last_dynv6_ipv6 = "", ""
    last_ipv6_check_time = 0
    IPV6_CHECK_INTERVAL = 30

    # 失败重试标志：哪个服务商上次更新失败了，下次单独重试
    ydns_need_retry = False
    dynv6_need_retry = False
    # 重试时使用的 IP（保存上次更新用的 IP，重试时复用）
    last_ip_for_retry = ""

    reset_manager = NetworkResetManager(logger, enable_full_reboot)

    while True:
        try:
            current_time = time.time()
            ydns_changed = False
            dynv6_changed = False
            ydns_failed = False
            dynv6_failed = False
            network_issue_detected = False
            issue_reason = ""

            # 本轮检测到的 IP
            current_ip_for_update = ""

            # IPv6 连通性检测
            if reset_on_failure and (current_time - last_ipv6_check_time >= IPV6_CHECK_INTERVAL):
                last_ipv6_check_time = current_time
                if not check_ipv6_connectivity(logger):
                    logger.warning("&#9888;&#65039; IPv6 连通性检测失败")
                    network_issue_detected = True
                    issue_reason = "IPv6 连通性失效"

            # YDNS IP 检测
            if track_ydns:
                logger.debug("[YDNS] 开始检测 IP...")
                current_ip, addr_type = get_public_ip(ip_type)
                if current_ip:
                    current_ip_for_update = current_ip
                if current_ip and addr_type == 6 and _is_invalid_ipv6(current_ip):
                    current_ip = ""
                    current_ip_for_update = ""
                if not current_ip:
                    logger.warning("&#9888;&#65039; YDNS 无法获取有效 IP")
                    ydns_failed = True
                    if reset_on_failure and not network_issue_detected:
                        network_issue_detected = True
                        issue_reason = "YDNS IP 获取失败"
                else:
                    if current_ip != last_ydns_ip:
                        logger.info(
                            f"[YDNS] IP 变更: {last_ydns_ip} → {current_ip}"
                            if last_ydns_ip else f"[YDNS] 当前 IP: {current_ip}"
                        )
                        ydns_changed = True
                        last_ydns_ip = current_ip
                    else:
                        logger.debug(f"[YDNS] IP 未变化 ({current_ip})")

            # dynv6 IP 检测
            if track_dynv6:
                logger.debug("[dynv6] 开始检测 IP...")
                ipv4, ipv6 = "", ""
                if ip_type in ("auto", "ipv4"):
                    ip, at = get_public_ip("ipv4")
                    if ip and at == 4:
                        ipv4 = ip
                        logger.debug(f"[dynv6] 检测到 IPv4: {ipv4}")
                if ip_type in ("auto", "ipv6"):
                    ip, at = get_public_ip("ipv6")
                    if ip and at == 6:
                        ipv6 = ip
                        logger.debug(f"[dynv6] 检测到 IPv6: {ipv6}")
                if not current_ip_for_update and (ipv4 or ipv6):
                    current_ip_for_update = ipv6 if ipv6 else ipv4
                if not ipv4 and not ipv6:
                    logger.warning("&#9888;&#65039; dynv6 无法获取有效 IP")
                    dynv6_failed = True
                    if reset_on_failure and not network_issue_detected:
                        network_issue_detected = True
                        issue_reason = "dynv6 IP 获取失败"
                else:
                    if ipv4 != last_dynv6_ipv4:
                        logger.info(
                            f"[dynv6] IPv4 变更: {last_dynv6_ipv4} → {ipv4}"
                            if last_dynv6_ipv4 else f"[dynv6] 当前 IPv4: {ipv4}"
                        )
                        dynv6_changed = True
                        last_dynv6_ipv4 = ipv4
                    if ipv6 != last_dynv6_ipv6:
                        logger.info(
                            f"[dynv6] IPv6 变更: {last_dynv6_ipv6} → {ipv6}"
                            if last_dynv6_ipv6 else f"[dynv6] 当前 IPv6: {ipv6}"
                        )
                        dynv6_changed = True
                        last_dynv6_ipv6 = ipv6
                    if not dynv6_changed:
                        logger.debug(f"[dynv6] IP 未变化 (IPv4={ipv4}, IPv6={ipv6})")

            # 判断是否需要重启网络
            need_reset = False
            if reset_on_failure and network_issue_detected:
                all_failed = ydns_failed and dynv6_failed
                single_provider_only_failed = (
                    (ydns_failed and not track_dynv6) or
                    (dynv6_failed and not track_ydns)
                )
                if all_failed:
                    need_reset = True
                    issue_reason = "所有服务商 IP 获取失败"
                elif issue_reason == "IPv6 连通性失效":
                    need_reset = True
                elif single_provider_only_failed:
                    need_reset = True

            # 执行网络重启
            if need_reset:
                logger.warning(f"检测到网络问题: {issue_reason}")
                reset_executed = reset_manager.execute_reset(issue_reason)
                if reset_executed:
                    logger.info("网络重启完成，等待系统稳定后重新检测...")
                else:
                    status = reset_manager.get_status()
                    logger.debug(f"重启状态: {status}")
                time.sleep(DEFAULT_CHECK_INTERVAL)
                continue

            # ═══════════════════════════════════════════════════════════
            # 核心更新逻辑
            # ═══════════════════════════════════════════════════════════
            #
            # 策略：
            #   A) 任一 IP 变化 → 强制同步更新【所有】服务商
            #      （保证 yun123.ydns.eu 和 yun123.dns.navy 始终指向相同 IP）
            #
            #   B) 上次某服务商失败 → 仅单独重试该服务商
            #      （不浪费请求去更新已成功的服务商）
            #
            #   C) 无变化且无重试 → 跳过
            # ═══════════════════════════════════════════════════════════

            any_ip_changed = ydns_changed or dynv6_changed
            any_need_retry = ydns_need_retry or dynv6_need_retry

            # 场景 C：无变化且无需重试 → 跳过
            if not (any_ip_changed or any_need_retry):
                logger.debug("所有服务商 IP 均未变化，无需重试，跳过更新")
                time.sleep(interval)
                continue

            # 确定使用的 IP
            ip_for_update = current_ip_for_update
            if not ip_for_update:
                ip_for_update = last_ip_for_retry
            if not ip_for_update:
                logger.warning("未能获取到最新 IP，尝试重新获取...")
                ip_temp, _ = get_public_ip(ip_type)
                if ip_temp:
                    ip_for_update = ip_temp
            # 保存当前 IP 供重试使用
            if ip_for_update:
                last_ip_for_retry = ip_for_update

            # 输出更新原因
            update_reasons = []
            if ydns_changed:
                update_reasons.append("YDNS IP 变化")
            if dynv6_changed:
                update_reasons.append("dynv6 IP 变化")
            if ydns_need_retry:
                update_reasons.append("YDNS 上次失败→重试")
            if dynv6_need_retry:
                update_reasons.append("dynv6 上次失败→重试")

            logger.info("═══════════════════════════════════════════════════")
            logger.info(f"触发更新: {', '.join(update_reasons)}")
            logger.info(f"使用 IP: {ip_for_update or '自动获取'}")
            logger.info("═══════════════════════════════════════════════════")

            # ─── 场景 A：IP 变化 → 同步更新所有服务商 ─────────────
            if any_ip_changed:
                # 更新 YDNS
                logger.info(">>> [同步] 更新 YDNS...")
                ok_ydns = _sync_ydns(config, logger, force_ip=ip_for_update)
                if ok_ydns:
                    ydns_need_retry = False
                    logger.info(">>> YDNS 结果: &#9989; 成功")
                else:
                    ydns_need_retry = True
                    logger.warning(">>> YDNS 结果: &#10060; 失败（下次单独重试）")

                # 更新 dynv6
                logger.info(">>> [同步] 更新 dynv6...")
                ok_dynv6 = _sync_dynv6(config, logger, force_ip=ip_for_update)
                if ok_dynv6:
                    dynv6_need_retry = False
                    logger.info(">>> dynv6 结果: &#9989; 成功")
                else:
                    dynv6_need_retry = True
                    logger.warning(">>> dynv6 结果: &#10060; 失败（下次单独重试）")

            # ─── 场景 B：仅重试失败的服务商 ───────────────────────
            else:
                # 只有 need_retry 为 True 的才会走到这里
                if ydns_need_retry:
                    logger.info(">>> [重试] 更新 YDNS (上次失败)...")
                    ok_ydns = _sync_ydns(config, logger, force_ip=ip_for_update)
                    if ok_ydns:
                        ydns_need_retry = False
                        logger.info(">>> YDNS 重试结果: &#9989; 成功")
                    else:
                        logger.warning(">>> YDNS 重试结果: &#10060; 再次失败（下次继续重试）")

                if dynv6_need_retry:
                    logger.info(">>> [重试] 更新 dynv6 (上次失败)...")
                    ok_dynv6 = _sync_dynv6(config, logger, force_ip=ip_for_update)
                    if ok_dynv6:
                        dynv6_need_retry = False
                        logger.info(">>> dynv6 重试结果: &#9989; 成功")
                    else:
                        logger.warning(">>> dynv6 重试结果: &#10060; 再次失败（下次继续重试）")

            logger.info("═══════════════════════════════════════════════════")

            time.sleep(interval)
        except KeyboardInterrupt:
            logger.info("\n&#128721; 已停止")
            break
        except Exception as e:
            logger.error(f"守护循环异常: {e}")
            import traceback
            logger.debug(traceback.format_exc())
            time.sleep(interval)

# ─── 主入口 ─────────────────────────────────────────────────────────────────
def main():
    script_dir = os.path.dirname(os.path.realpath(sys.argv[0]))

    parser = argparse.ArgumentParser(
        description="Linux 专用 DDNS 同步器 v%s" % __version__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
使用示例：
  生成配置模板：              python3 ddns.py --setup
  编辑配置文件后运行：        python3 ddns.py
  守护模式 + 网络自愈：       sudo python3 ddns.py -d -r
  守护模式 + 网络自愈 + 完整重启：  sudo python3 ddns.py -d -r --full-reboot
  查看当前配置：             python3 ddns.py --show-config
  手动指定 IP 更新：         python3 ddns.py -i 1.2.3.4
  测试 IPv6 连通性：         python3 ddns.py --test-ipv6
  测试完整重启流程：         python3 ddns.py --test-reboot

注意：网络重启功能 (-r) 需要 root 权限运行
      完整设备重启功能会在第3次重启时自动执行（光猫→路由器→本地，断网约60秒）
        """,
    )
    parser.add_argument("-c", "--config", default="ddns_config.txt",
                        help="配置文件路径（默认基于脚本所在目录）")
    parser.add_argument("--encrypt", action="store_true", help="手动加密配置文件（需 -j）")
    parser.add_argument("--decrypt", action="store_true", help="解密配置文件回明文（需 -j）")
    parser.add_argument("-j", "--key", help="加密/解密的密码")
    parser.add_argument("--setup", action="store_true", help="生成配置模板")
    parser.add_argument("-u", "--username", help="YDNS 用户名（覆盖配置文件）")
    parser.add_argument("-p", "--password", help="YDNS 密码（覆盖配置文件）")
    parser.add_argument("--token", help="dynv6 token（覆盖配置文件）")
    parser.add_argument("-n", "--host", action="append", dest="hosts",
                        help="临时添加域名（会同时添加到 YDNS 和 dynv6 列表，用于测试）")
    parser.add_argument("-i", "--ip", help="手动指定 IP（自动识别 v4/v6）")
    parser.add_argument("-4", "--ipv4", action="store_true", help="仅 IPv4")
    parser.add_argument("-6", "--ipv6", action="store_true", help="仅 IPv6")
    parser.add_argument("-d", "--daemon", action="store_true", help="守护模式")
    parser.add_argument("-r", "--reset-network", action="store_true",
                        help="获取 IP 失败或 IPv6 失效时自动重启网络（仅守护模式，需要 root 权限）")
    parser.add_argument("--full-reboot", action="store_true", default=True,
                        help="第3次重启时执行完整设备重启（光猫→路由器→本地，默认启用，配合 -r 使用）")
    parser.add_argument("--no-full-reboot", action="store_true",
                        help="禁用完整设备重启功能（仅本地重启）")
    parser.add_argument("-t", "--interval", type=int, default=0, help="守护间隔（秒）")
    parser.add_argument("-l", "--log", help="日志文件")
    parser.add_argument("-q", "--quiet", action="store_true", help="静默（只显示错误）")
    parser.add_argument("--debug", action="store_true", help="DEBUG 全开（显示详细调试信息）")
    parser.add_argument("--get-ip", action="store_true", help="仅获取公网 IP")
    parser.add_argument("--show-config", action="store_true", help="显示当前配置")
    parser.add_argument("--test-ipv6", action="store_true", help="测试 IPv6 连通性")
    parser.add_argument("--test-reboot", action="store_true", help="测试完整重启流程（光猫+路由器+本地）")
    parser.add_argument("--check-root", action="store_true", help="检查当前是否有 root 权限")
    parser.add_argument("-v", "--version", action="version", version=f"%(prog)s {__version__}")

    args = parser.parse_args()

    config_path = args.config
    if not os.path.isabs(config_path):
        config_path = os.path.join(script_dir, config_path)
    enc_path = config_path + ".enc"

    global logger
    logger = setup_logger(log_file="", quiet=args.quiet, debug=args.debug)

    if args.check_root:
        if is_root():
            print("&#9989; 当前以 root 权限运行")
        else:
            print("&#9888;&#65039;  当前以普通用户运行，部分功能可能受限")
        return

    if args.test_ipv6:
        logger.setLevel(logging.DEBUG)
        success = check_ipv6_connectivity(logger)
        if success:
            print("&#9989; IPv6 连通性正常")
        else:
            print("&#10060; IPv6 连通性失败，所有目标均不可达")
            sys.exit(1)
        return

    if args.test_reboot:
        logger.setLevel(logging.DEBUG)
        print("&#9888;&#65039;  即将测试完整重启流程（光猫→路由器→本地）")
        print("   全部设备将断电重启，断网约60秒")
        print("   按 Ctrl+C 取消，5秒后开始...")
        try:
            time.sleep(5)
        except KeyboardInterrupt:
            print("\n已取消")
            return
        success = full_device_reboot(logger)
        if success:
            print("\n&#9989; 完整重启测试成功（所有指令已发送）")
        else:
            print("\n&#9888;&#65039;  部分设备重启失败，请检查日志")
        return

    if args.encrypt or args.decrypt:
        if not args.key:
            print("&#10060; 加密/解密必须提供 -j 密码参数")
            sys.exit(1)
        if not HAS_CRYPTO:
            print("&#10060; 需要 cryptography 库，请执行: pip install cryptography")
            sys.exit(1)
        if args.encrypt:
            if not os.path.exists(config_path):
                print(f"&#10060; 明文配置文件不存在: {config_path}")
                sys.exit(1)
            encrypt_file(config_path, enc_path, args.key)
        elif args.decrypt:
            if not os.path.exists(enc_path):
                print(f"&#10060; 加密文件不存在: {enc_path}")
                sys.exit(1)
            plain_text = decrypt_file(enc_path, args.key)
            with open(config_path, "w", encoding="utf-8") as f:
                f.write(plain_text)
            print(f"&#9989; 已解密到 {config_path}")
        return

    if args.get_ip:
        ip_type = "ipv4" if args.ipv4 else ("ipv6" if args.ipv6 else "auto")
        ip, atype = get_public_ip(ip_type)
        if ip:
            label = f"IPv{atype}" if atype else "IP"
            print(f"公网 {label}: {ip}")
            jdata = get_public_ip_json()
            if jdata:
                print(f"JSON: {json.dumps(jdata)}")
        else:
            print("无法获取公网 IP")
            sys.exit(1)
        return

    if args.setup:
        generate_config_template(config_path)
        return

    config = None
    if os.path.exists(enc_path):
        if not args.key:
            print("&#10060; 发现加密配置文件，请使用 -j 提供密码")
            sys.exit(1)
        plain_text = decrypt_file(enc_path, args.key)
        config = parse_text_config_from_string(plain_text)
    elif os.path.exists(config_path):
        if args.key:
            print("&#128272; 检测到明文配置文件，正在自动加密...")
            encrypt_file(config_path, enc_path, args.key)
            plain_text = decrypt_file(enc_path, args.key)
            config = parse_text_config_from_string(plain_text)
        else:
            config = parse_text_config(config_path)
    else:
        print("&#128295; 未找到配置文件，正在生成模板...")
        generate_config_template(config_path)
        print("&#128221; 请编辑该文件后，带 -j 密码运行以自动加密。")
        sys.exit(0)

    if args.username:
        config["username"] = args.username
    if args.password:
        config["password"] = args.password
    if args.token:
        config["token"] = args.token
    if args.hosts:
        config["ydns_hosts"].extend(args.hosts)
        config["dynv6_hosts"].extend(args.hosts)
    if args.interval > 0:
        config["check_interval"] = args.interval
    if args.log:
        config["log_file"] = args.log
    if args.quiet:
        config["quiet"] = True
    if args.ipv4:
        config["ip_type"] = "ipv4"
    elif args.ipv6:
        config["ip_type"] = "ipv6"

    logger = setup_logger(config.get("log_file", ""), quiet=config.get("quiet", False), debug=args.debug)

    if args.show_config:
        show_config(config)
        return

    if args.reset_network and not args.daemon:
        logger.warning("&#9888;&#65039;  -r/--reset-network 参数仅在守护模式 (-d) 下生效，已忽略")

    enable_full_reboot = True
    if args.no_full_reboot:
        enable_full_reboot = False

    if args.daemon:
        daemon_mode(config, logger,
                   reset_on_failure=args.reset_network,
                   enable_full_reboot=enable_full_reboot and args.reset_network)
        return

    sync_once(config, logger, force_ip=args.ip or "")

if __name__ == "__main__":
    main()

### 完整代码下载

- 下载地址：[https://wwamp.lanzouu.com/ix4GJ43w3xne](https://wwamp.lanzouu.com/ix4GJ43w3xne)

### 注意事项

- 网络自愈功能（-r）需要 root 权限，并且仅适用于使用 `systemd-networkd` 或 `NetworkManager` 的 Linux 发行版。

- 完整设备重启功能中的光猫/路由器接口为个人环境适配，普通用户请勿使用 `--full-reboot` 或 `--test-reboot`，除非你了解并修改了对应的设备地址和认证方式。

- 关于 YDNS 服务商：自 2026 年 7 月 20 日起，YDNS 已不再为 `ydns.eu` 域名提供新主机注册。新用户如需使用 YDNS，必须自行添加自己的域名。目前 dynv6 仍可正常注册新域名，建议新用户优先选择 dynv6。

---

[查看原文](https://www.52pojie.cn/thread-2124193-1-1.html)
