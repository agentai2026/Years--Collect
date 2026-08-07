import { createHash } from "node:crypto";
import {
	existsSync,
	mkdirSync,
	readFileSync,
	readdirSync,
	unlinkSync,
	writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const POSTS_DIR = join(ROOT, "src", "content", "posts");
const SEEN_PATH = join(ROOT, "data", "articles-seen.json");

const PER_SOURCE = Number(process.env.ARTICLE_PER_SOURCE || 5);
const MAX_TOTAL = Number(process.env.ARTICLE_MAX_TOTAL || 15);
/** 1 = 覆盖已有摘要文，重抓全文 */
const REFRESH = process.env.ARTICLE_REFRESH === "1";

const POJIE_FEEDS = [
	{
		id: "pojie-code",
		url: "https://www.52pojie.cn/forum.php?mod=rss&fid=24",
		label: "吾爱·编程语言",
	},
	{
		id: "pojie-site",
		url: "https://www.52pojie.cn/forum.php?mod=rss",
		label: "吾爱·综合",
	},
];

const POJIE_BLOCK =
	/破解|注册机|脱壳|补丁|下载器|FreeMusic|keygen|激活码|盗版|序列号|汉化补丁|免杀|免验证|卡密|授权码|破解版|破解软件|精简版.*下载|网盘下载|提取码|小恐龙|摸鱼计时|单机版游戏/i;

const POJIE_ALLOW =
	/教程|编程|开发|Windows|源码|技术|资讯|调试|分析|安全|CVE|漏洞|语言|Python|JavaScript|Rust|Go\b|C\+\+|算法|开源|框架|API|数据库|前端|后端|运维|网络|协议/i;

function shanghaiDate(d = new Date()) {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: "Asia/Shanghai",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(d);
}

function loadSeen() {
	if (!existsSync(SEEN_PATH)) return { urls: {} };
	try {
		return JSON.parse(readFileSync(SEEN_PATH, "utf8"));
	} catch {
		return { urls: {} };
	}
}

function saveSeen(seen) {
	mkdirSync(dirname(SEEN_PATH), { recursive: true });
	writeFileSync(SEEN_PATH, `${JSON.stringify(seen, null, 2)}\n`, "utf8");
}

function decodeEntities(s = "") {
	return String(s)
		.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
		.replace(/&#(\d+);/g, (_, n) => {
			const code = Number(n);
			return Number.isFinite(code) ? String.fromCodePoint(code) : "";
		})
		.replace(/&#x([0-9a-f]+);/gi, (_, h) => {
			const code = Number.parseInt(h, 16);
			return Number.isFinite(code) ? String.fromCodePoint(code) : "";
		})
		.replace(/&nbsp;/g, " ")
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&ldquo;|&rdquo;/g, '"')
		.replace(/&#39;|&rsquo;|&lsquo;/g, "'");
}

function stripHtml(html = "") {
	return decodeEntities(String(html))
		.replace(/<script[\s\S]*?<\/script>/gi, "")
		.replace(/<style[\s\S]*?<\/style>/gi, "")
		.replace(/<[^>]+>/g, " ")
		.replace(/阅读全文.*/g, "")
		.replace(/最先出现在.*/g, "")
		.replace(/\s+/g, " ")
		.trim();
}

function yamlEscape(s = "") {
	return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function escapeReg(s) {
	return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function slugify(input) {
	const h = createHash("sha1").update(input).digest("hex").slice(0, 10);
	const base = String(input)
		.toLowerCase()
		.replace(/https?:\/\//, "")
		.replace(/[^a-z0-9\u4e00-\u9fff]+/gi, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "")
		.slice(0, 40);
	const ascii = base.replace(/[^\x00-\x7F]/g, "").replace(/^-|-$/g, "");
	return `${ascii || "item"}-${h}`;
}

/** 粗粒度 HTML → Markdown，尽量保留正文结构 */
function htmlToMarkdown(html = "") {
	let s = decodeEntities(String(html));
	s = s
		.replace(/<script[\s\S]*?<\/script>/gi, "")
		.replace(/<style[\s\S]*?<\/style>/gi, "")
		.replace(/<!--[\s\S]*?-->/g, "")
		.replace(/<br\s*\/?>/gi, "\n")
		.replace(/<\/p>/gi, "\n\n")
		.replace(/<p[^>]*>/gi, "")
		.replace(/<\/div>/gi, "\n")
		.replace(/<div[^>]*>/gi, "")
		.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n# $1\n\n")
		.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n## $1\n\n")
		.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n### $1\n\n")
		.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "\n#### $1\n\n")
		.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n")
		.replace(/<\/?ul[^>]*>/gi, "\n")
		.replace(/<\/?ol[^>]*>/gi, "\n")
		.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, "\n> $1\n\n")
		.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, "\n```\n$1\n```\n\n")
		.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, "\n```\n$1\n```\n\n")
		.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`")
		.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, "**$2**")
		.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, "*$2*")
		.replace(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi, "\n\n![]($1)\n\n")
		.replace(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)")
		.replace(/<table[\s\S]*?<\/table>/gi, "\n\n（原文含表格，请查看原文链接）\n\n")
		.replace(/<[^>]+>/g, "")
		.replace(/\r/g, "")
		.replace(/[ \t]+\n/g, "\n")
		.replace(/\n{3,}/g, "\n\n")
		.trim();
	return s;
}

async function fetchText(url, extraHeaders = {}) {
	const res = await fetch(url, {
		headers: {
			"User-Agent":
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
			Accept:
				"text/html,application/xhtml+xml,application/xml;q=0.9,application/rss+xml;q=0.9,*/*;q=0.8",
			"Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
			...extraHeaders,
		},
		redirect: "follow",
	});
	if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
	const buf = Buffer.from(await res.arrayBuffer());
	const ctype = (res.headers.get("content-type") || "").toLowerCase();
	if (ctype.includes("gbk") || ctype.includes("gb2312")) {
		try {
			return new TextDecoder("gbk").decode(buf);
		} catch {
			/* fall through */
		}
	}
	const utf8 = buf.toString("utf8");
	if (
		url.includes("52pojie") &&
		!/吾爱|编程|原创|软件|安全|论坛|postmessage|t_f/.test(utf8.slice(0, 2000))
	) {
		try {
			return new TextDecoder("gbk").decode(buf);
		} catch {
			return utf8;
		}
	}
	return utf8;
}

function parseRssItems(xml) {
	const items = [];
	const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
	for (const block of blocks) {
		const pick = (tag) => {
			const m = block.match(
				new RegExp(
					`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`,
					"i",
				),
			);
			return m ? m[1].trim() : "";
		};
		const title = stripHtml(pick("title"));
		const link = stripHtml(pick("link")).replace(/\s+/g, "");
		const rawEncoded = pick("content:encoded") || pick("content");
		const rawDesc = pick("description");
		const htmlBody = decodeEntities(rawEncoded || rawDesc || "");
		let description = stripHtml(rawDesc || rawEncoded);
		if (title) {
			description = description
				.replace(new RegExp(`${escapeReg(title)}.*$`), "")
				.trim();
		}
		description = description.slice(0, 180);
		const creator = stripHtml(pick("dc:creator") || pick("author"));
		const pubRaw = stripHtml(pick("pubDate") || pick("pubdate"));
		let published = shanghaiDate();
		if (pubRaw) {
			const d = new Date(pubRaw);
			if (!Number.isNaN(d.getTime())) published = shanghaiDate(d);
		}
		if (title && link) {
			items.push({
				title,
				link,
				description: description || title,
				htmlBody,
				author: creator,
				published,
			});
		}
	}
	return items;
}

function extractWindiscoverBody(html) {
	const m =
		html.match(
			/<div[^>]+class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<footer|<!--|<\/article)/i,
		) ||
		html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
	return m ? m[1] : "";
}

function extractPojieBody(html) {
	const m =
		html.match(/<td[^>]+class="t_f"[^>]*id="postmessage_\d+"[^>]*>([\s\S]*?)<\/td>/i) ||
		html.match(/id="postmessage_\d+"[^>]*>([\s\S]*?)<\/t/i) ||
		html.match(/<div[^>]+class="[^"]*t_f[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
	return m ? m[1] : "";
}

async function enrichFullBody(item) {
	let html = item.htmlBody || "";
	const plainLen = stripHtml(html).length;

	// RSS 正文太短时，抓原文页
	if (plainLen < 400) {
		try {
			const page = await fetchText(item.link, { Referer: item.link });
			if (item.sourceId === "windiscover") {
				html = extractWindiscoverBody(page) || html;
			} else if (item.sourceId === "pojie") {
				html = extractPojieBody(page) || html;
			}
		} catch (err) {
			console.warn(`[body] ${item.link}: ${err.message}`);
		}
	}

	let md = htmlToMarkdown(html);
	// 清理吾爱常见噪音
	md = md
		.replace(/本帖最后由[\s\S]{0,40}编辑/g, "")
		.replace(/下载链接\s*：\s*https?:\/\/\S+/gi, "（下载链接已省略，请看原文）")
		.trim();

	if (md.length < 80) {
		md = `${item.description || item.title}\n\n> 未能完整抓取正文，请阅读原文。`;
	}
	return { ...item, bodyMarkdown: md };
}

async function fetchWindiscover(limit) {
	const xml = await fetchText("https://windiscover.com/feed");
	const items = parseRssItems(xml)
		.slice(0, limit)
		.map((it) => ({
			...it,
			sourceId: "windiscover",
			sourceTag: "WinDiscover",
			author: it.author || "WinDiscover",
			category: "资讯精选",
		}));
	const out = [];
	for (const it of items) out.push(await enrichFullBody(it));
	return out;
}

async function fetchPojie(limit) {
	const out = [];
	const seenLocal = new Set();
	for (const feed of POJIE_FEEDS) {
		if (out.length >= limit) break;
		try {
			const xml = await fetchText(feed.url);
			const items = parseRssItems(xml);
			for (const it of items) {
				if (out.length >= limit) break;
				if (seenLocal.has(it.link)) continue;
				if (POJIE_BLOCK.test(it.title) || POJIE_BLOCK.test(it.description)) continue;
				if (feed.id === "pojie-site" && !POJIE_ALLOW.test(it.title)) continue;
				seenLocal.add(it.link);
				out.push(
					await enrichFullBody({
						...it,
						sourceId: "pojie",
						sourceTag: "吾爱",
						author: it.author || feed.label,
						category: "资讯精选",
						description:
							it.description || `来自吾爱破解技术向讨论：${it.title}`,
					}),
				);
			}
		} catch (err) {
			console.warn(`[pojie] skip ${feed.url}:`, err.message);
		}
	}
	return out;
}

function extractCoderNavCards(html) {
	const items = [];
	const re =
		/<a[^>]+href="(https?:\/\/[^"]+|\/[^"]+)"[^>]*class="[^"]*(?:url|card|title|name)[^"]*"[^>]*>([\s\S]*?)<\/a>/gi;
	let m;
	while ((m = re.exec(html))) {
		const href = m[1];
		const title = stripHtml(m[2]);
		if (title.length < 4 || title.length > 80) continue;
		if (/登录|注册|更多|首页|导航|关于|提交/.test(title)) continue;
		items.push({ href, title });
	}
	if (items.length) return items;

	const chunkMatch = html.match(/最新分享[\s\S]{0,12000}/);
	const chunk = chunkMatch ? chunkMatch[0] : html.slice(0, 80000);
	const re2 = /<a[^>]+href="(https?:\/\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
	while ((m = re2.exec(chunk))) {
		const href = m[1];
		if (/codernav\.com\/?#?$|javascript:/.test(href)) continue;
		const title = stripHtml(m[2]);
		if (title.length < 6 || title.length > 100) continue;
		items.push({ href, title });
		if (items.length >= 40) break;
	}
	return items;
}

async function fetchCoderNav(limit) {
	const today = shanghaiDate();
	try {
		const html = await fetchText("https://codernav.com/", {
			Referer: "https://www.google.com/",
		});
		const cards = extractCoderNavCards(html);
		const uniq = new Map();
		for (const c of cards) {
			const link = c.href.startsWith("http")
				? c.href
				: new URL(c.href, "https://codernav.com/").href;
			if (uniq.has(link)) continue;
			uniq.set(link, c.title);
			if (uniq.size >= limit) break;
		}
		return [...uniq.entries()].map(([link, title]) => ({
			title: `导航精选 · ${title}`,
			link,
			description: `来自 CoderNav 的实用站点/资源推荐：${title}`,
			author: "CoderNav",
			published: today,
			sourceId: "codernav",
			sourceTag: "CoderNav",
			category: "资讯精选",
			bodyMarkdown: `## ${title}\n\n这是导航站条目，本身不是长文。可点击下方原文打开站点。\n\n- 名称：${title}\n- 地址：${link}\n`,
		}));
	} catch (err) {
		console.warn("[CoderNav] homepage blocked:", err.message);
		return [
			{
				title: "导航精选 · CoderNav 开发者导航",
				link: "https://codernav.com/",
				description:
					"开发者导航站合集：影音视听、人工智能、办公工具、学习充电等分类资源入口。",
				author: "CoderNav",
				published: today,
				sourceId: "codernav",
				sourceTag: "CoderNav",
				category: "资讯精选",
				bodyMarkdown:
					"CoderNav 是导航聚合站，首页当前无法直接抓取卡片。请打开原文按分类浏览资源。",
			},
		];
	}
}

function writePost(item) {
	const slug = slugify(`${item.sourceId}-${item.link}`);
	const file = `digest-${item.sourceId}-${slug}.md`;
	const path = join(POSTS_DIR, file);
	if (existsSync(path) && !REFRESH) return { path, wrote: false };

	const desc = (item.description || item.title).slice(0, 160);
	const bodyMd = (item.bodyMarkdown || desc).trim();
	const body = `---
title: "${yamlEscape(item.title)}"
published: ${item.published}
description: "${yamlEscape(desc)}"
image: ""
tags: ["采集", "${yamlEscape(item.sourceTag)}"]
category: "${yamlEscape(item.category || "资讯精选")}"
draft: false
lang: ""
author: "${yamlEscape(item.author || item.sourceTag)}"
sourceLink: "${yamlEscape(item.link)}"
---

> 转载自 [${yamlEscape(item.sourceTag)}](${item.link})，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

${bodyMd}

---

[查看原文](${item.link})
`;
	writeFileSync(path, body, "utf8");
	return { path, wrote: true };
}

async function main() {
	mkdirSync(POSTS_DIR, { recursive: true });
	const seen = loadSeen();
	seen.urls ||= {};

	if (REFRESH) {
		for (const f of readdirSync(POSTS_DIR)) {
			if (f.startsWith("digest-") && f.endsWith(".md")) {
				unlinkSync(join(POSTS_DIR, f));
			}
		}
		seen.urls = {};
		console.log("[refresh] cleared old digests");
	}

	const collectors = [
		["WinDiscover", () => fetchWindiscover(PER_SOURCE)],
		["吾爱", () => fetchPojie(PER_SOURCE)],
		["CoderNav", () => fetchCoderNav(PER_SOURCE)],
	];

	const bag = [];
	for (const [name, fn] of collectors) {
		try {
			const items = await fn();
			console.log(`[ok] ${name}: ${items.length} candidates`);
			bag.push(...items);
		} catch (err) {
			console.warn(`[fail] ${name}:`, err.message);
		}
	}

	let written = 0;
	let skipped = 0;
	for (const item of bag) {
		if (written >= MAX_TOTAL) break;
		if (!REFRESH && seen.urls[item.link]) {
			skipped++;
			continue;
		}
		const { wrote, path } = writePost(item);
		if (wrote) {
			seen.urls[item.link] = {
				file: path.replace(/\\/g, "/").split("/src/content/posts/").pop(),
				title: item.title,
				source: item.sourceId,
				at: new Date().toISOString(),
				mode: "full",
			};
			written++;
			console.log(
				`+ ${item.sourceId}: ${item.title} (${(item.bodyMarkdown || "").length} chars)`,
			);
		} else {
			skipped++;
		}
	}

	saveSeen(seen);
	const postCount = readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md")).length;
	console.log(
		`done: wrote=${written} skipped=${skipped} posts_dir=${postCount} seen=${Object.keys(seen.urls).length}`,
	);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
