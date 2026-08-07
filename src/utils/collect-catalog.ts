import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type CollectCatalogApi = {
	name: string;
	restricted?: boolean;
	tags?: string[];
	categories?: string[];
	history?: Array<{ date: string; ok: boolean; ms?: number }>;
};

export type CollectCatalog = {
	brand?: string;
	updated?: string;
	apis: CollectCatalogApi[];
};

export type CollectApiStats = {
	total: number;
	online: number;
	offline: number;
	highAvail: number;
	fastestName: string | null;
	fastestMs: number | null;
	updated: string | null;
};

function statOf(a: CollectCatalogApi) {
	const h = Array.isArray(a.history) ? a.history : [];
	if (!h.length) {
		return { st: "fail" as const, up: 0, avg: null as number | null };
	}
	const last = h[h.length - 1] || { ok: false };
	const up = h.filter((x) => x.ok).length / h.length;
	const ms = h.filter((x) => x.ok && x.ms).map((x) => x.ms as number);
	const avg = ms.length
		? Math.round(ms.reduce((p, c) => p + c, 0) / ms.length)
		: null;
	if (!last.ok) return { st: "fail" as const, up, avg };
	return { st: "ok" as const, up, avg };
}

/** 首页展示用：排除受限 / 无常规影视标签的接口 */
function isMainstream(a: CollectCatalogApi): boolean {
	if (a.restricted) return false;
	const tags = [...(a.tags || []), ...(a.categories || [])];
	if (tags.includes("受限内容")) return false;
	return tags.some((t) =>
		/^(电影|连续剧|电视剧|综艺|动漫|国产剧|欧美剧|韩剧|日剧)$/.test(t),
	);
}

export function loadCollectCatalog(): CollectCatalog {
	// Prefer canonical docs/ path (same as automation); fall back to public mirror
	const docsPath = join(process.cwd(), "docs", "catalog.json");
	const publicPath = join(process.cwd(), "public", "collect-assets", "catalog.json");
	const path = existsSync(docsPath) ? docsPath : publicPath;
	const raw = JSON.parse(readFileSync(path, "utf8")) as CollectCatalog;
	if (!raw || !Array.isArray(raw.apis)) {
		return { apis: [] };
	}
	return raw;
}

export function getCollectApiStats(
	catalog: CollectCatalog = loadCollectCatalog(),
): CollectApiStats {
	const apis = catalog.apis.map((a) => ({ ...a, s: statOf(a) }));
	const online = apis.filter((a) => a.s.st === "ok").length;
	const offline = apis.filter((a) => a.s.st === "fail").length;
	const highAvail = apis.filter(
		(a) => a.s.st === "ok" && a.s.up >= 0.95,
	).length;
	const fastest = apis
		.filter((a) => isMainstream(a) && a.s.avg && a.s.st !== "fail")
		.sort((a, b) => (a.s.avg ?? 9e9) - (b.s.avg ?? 9e9))[0];

	return {
		total: apis.length,
		online,
		offline,
		highAvail,
		fastestName: fastest?.name ?? null,
		fastestMs: fastest?.s.avg ?? null,
		updated: catalog.updated ?? null,
	};
}
