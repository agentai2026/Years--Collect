/**
 * 各页面横幅文案（主标题可覆盖页面 title；副标题支持打字机轮播）
 * key 由 pathname 解析，见 resolvePageBannerKey
 */
export type PageBannerCopy = {
	/** 横幅大字，不填则沿用页面 title */
	title?: string;
	/** 打字机副标题，每页应不同 */
	subtitle: string[];
};

export const pageBannerConfig: Record<string, PageBannerCopy> = {
	all: {
		title: "全部文章",
		subtitle: [
			"读过的，采来的，都在这儿。",
			"点开就能看全文，出处会写清楚。",
			"不赶更新，慢慢翻就好。",
		],
	},
	archive: {
		title: "归档",
		subtitle: [
			"按时间把足迹摊开。",
			"哪一年写过什么，一眼能找回来。",
			"岁月沉淀下来的目录。",
		],
	},
	categories: {
		title: "分类",
		subtitle: [
			"先按主题归个类。",
			"资讯、随笔、工具，各走各的。",
			"想找同类，从这里进。",
		],
	},
	tags: {
		title: "标签",
		subtitle: [
			"细一点的入口。",
			"一个标签，一串相关阅读。",
			"随手点开，说不定刚好用得上。",
		],
	},
	about: {
		title: "关于",
		subtitle: [
			"我是岁月，路过打个招呼。",
			"写一点，收一点，鼓捣影音工具。",
			"这个站，更像随手放东西的地方。",
		],
	},
	nav: {
		title: "导航",
		subtitle: [
			"自己常用的站，收在一起。",
			"少记网址，多留一条捷径。",
			"目录站，随手翻翻就行。",
		],
	},
	collect: {
		title: "采集",
		subtitle: [
			"影视接口的信号台。",
			"绿的在岗，黄的告病，红的失联。",
			"能用的留下，跑路的记一笔。",
		],
	},
	"collect-desk": {
		title: "信号台",
		subtitle: [
			"活着的接口，才有信号。",
			"巡检、留档、一键带走配置。",
			"接口会跑路，记录不会。",
		],
	},
	projects: {
		title: "我的项目",
		subtitle: [
			"顺手做的影音小工具。",
			"能自己用顺手，就够开心。",
			"还在打磨的，也会写在这里。",
		],
	},
	search: {
		title: "搜索",
		subtitle: [
			"想找的字，丢进来试试。",
			"文章、标题、片段都能搜。",
			"记不清名字时最有用。",
		],
	},
	rss: {
		title: "RSS",
		subtitle: [
			"用订阅跟住更新。",
			"不刷站也能收到新文章。",
			"老派一点，但很稳。",
		],
	},
	sponsor: {
		title: "支持",
		subtitle: [
			"如果觉得还不错。",
			"请杯奶茶也开心。",
			"不勉强，路过看看就好。",
		],
	},
	"not-found": {
		title: "迷路了",
		subtitle: [
			"这页好像不在了。",
			"回首页坐坐，或者搜一下。",
			"路走错了也没关系。",
		],
	},
};

/** 去掉 GitHub Pages 等 base 前缀，得到站点内路径 */
function stripBasePath(pathname: string): string {
	const rawBase = import.meta.env.BASE_URL || "/";
	const base = rawBase.replace(/\/+$/, "") || "";
	let path = pathname || "/";
	if (base && base !== "/" && path.startsWith(base)) {
		path = path.slice(base.length) || "/";
	}
	if (!path.startsWith("/")) path = `/${path}`;
	return path.replace(/\/+$/, "") || "/";
}

/**
 * 根据当前路径解析横幅文案 key；首页与文章详情返回 null（走各自专用逻辑）
 */
export function resolvePageBannerKey(pathname: string): string | null {
	const path = stripBasePath(pathname);

	if (path === "/") return null;
	if (path.startsWith("/posts/")) return null;

	if (path === "/all" || path.startsWith("/all/")) return "all";
	if (path.startsWith("/collect/desk")) return "collect-desk";
	if (path === "/collect" || path.startsWith("/collect/")) return "collect";
	if (path === "/archive") return "archive";
	if (path === "/categories" || path.startsWith("/categories/"))
		return "categories";
	if (path === "/tags" || path.startsWith("/tags/")) return "tags";
	if (path === "/about") return "about";
	if (path === "/nav") return "nav";
	if (path === "/projects") return "projects";
	if (path === "/search") return "search";
	if (path === "/rss") return "rss";
	if (path === "/sponsor") return "sponsor";
	if (path === "/404") return "not-found";

	return null;
}

export function getPageBannerCopy(
	pathname: string,
): PageBannerCopy | undefined {
	const key = resolvePageBannerKey(pathname);
	if (!key) return undefined;
	return pageBannerConfig[key];
}
