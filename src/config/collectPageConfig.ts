export type CollectSource = {
	/** 源名称 */
	title: string;
	/** 简短说明 / 副标题 */
	desc?: string;
	/** 导入 / 订阅地址（点击复制）；筹备中可留空 */
	endpoint?: string;
	/** 角标 */
	badge?: string;
	pending?: boolean;
};

export type CollectPanel = {
	id: string;
	/** 分类名，如 影视源 */
	name: string;
	/** 卡片主标题 */
	headline: string;
	/** 背景大字：壹贰叁… */
	numeral: string;
	/** 卡片底色 */
	color: string;
	/** 浅色底用深色字 */
	darkText?: boolean;
	/** 卡片底部日期文案 */
	dateLabel?: string;
	/** 筹备中：仅展示说明，不跳转监控台 */
	comingSoon?: boolean;
	/** 可点击进入的地址；默认用全局 deskUrl */
	href?: string;
	sources: CollectSource[];
};

export type CollectPageConfig = {
	title: string;
	description: string;
	/** 报头英文小标 */
	eyebrow: string;
	/** 期数 */
	issue: number;
	/** 更新日期 YYYY-MM-DD，留空则用构建当天 */
	updatedAt?: string;
	/** 更新说明 */
	updateNote: string;
	githubUrl?: string;
	/** 底栏最快源名称 */
	fastestLabel?: string;
	/** 接口监控台（Years--Collect）入口 */
	deskUrl?: string;
	extraPendingCount?: number;
	panels: CollectPanel[];
};

export function countPublishedSources(panels: CollectPanel[]): number {
	return panels.reduce(
		(sum, panel) =>
			sum +
			panel.sources.filter((s) => !s.pending && !panel.comingSoon && s.endpoint)
				.length,
		0,
	);
}

export function countPendingSources(
	panels: CollectPanel[],
	extraPendingCount = 0,
): number {
	const marked = panels.reduce(
		(sum, panel) => sum + panel.sources.filter((s) => s.pending).length,
		0,
	);
	const soon = panels.filter((p) => p.comingSoon).length;
	return marked + soon + extraPendingCount;
}

/**
 * 自动采集六宫格：目前仅影视源已接入监控台，其余分类筹备中
 */
export const collectPageConfig: CollectPageConfig = {
	title: "影视采集站信号台",
	description: "影视源已上线 · 电视 / 音乐 / 小说 / 漫画 / 听书 筹备中",
	eyebrow: "LIVE · SIGNAL DESK",
	issue: 218,
	updatedAt: "2026-08-07",
	updateNote: "每日 06:00 更新",
	githubUrl: "https://github.com/agentai2026/Years--Collect",
	deskUrl: "/collect/desk/",
	fastestLabel: "影视源",
	extraPendingCount: 0,
	panels: [
		{
			id: "movie",
			name: "影视源",
			headline: "今日影视线路",
			numeral: "壹",
			color: "#e53935",
			dateLabel: "08 / 07",
			sources: [
				{
					title: "接口总数",
					desc: "catalog 现有影视采集接口",
					endpoint: "desk",
					badge: "已上线",
				},
				{
					title: "当前在线",
					desc: "最近一轮巡检通过",
					endpoint: "desk",
				},
				{
					title: "高可用 ≥95%",
					desc: "可进监控台一键配置下载",
					endpoint: "desk",
				},
			],
		},
		{
			id: "tv",
			name: "电视源",
			headline: "直播信号 · 筹备中",
			numeral: "贰",
			color: "#f0c418",
			darkText: true,
			dateLabel: "待定",
			comingSoon: true,
			sources: [
				{
					title: "尚未开放",
					desc: "电视直播 / IPTV 自动化采集还在规划",
					badge: "筹备中",
				},
				{
					title: "计划能力",
					desc: "M3U / TXT 订阅与 EPG 节目单",
				},
				{
					title: "说明",
					desc: "目前只做了影视源，本分类稍后接入",
				},
			],
		},
		{
			id: "music",
			name: "音乐源",
			headline: "音乐订阅 · 筹备中",
			numeral: "叁",
			color: "#1e5bb8",
			dateLabel: "待定",
			comingSoon: true,
			sources: [
				{
					title: "尚未开放",
					desc: "音乐与播客自动采集尚未接入",
					badge: "筹备中",
				},
				{
					title: "计划能力",
					desc: "歌单合集、播客 RSS、曲库备用",
				},
				{
					title: "说明",
					desc: "目前只做了影视源，本分类稍后接入",
				},
			],
		},
		{
			id: "novel",
			name: "小说源",
			headline: "书源导入 · 筹备中",
			numeral: "肆",
			color: "#1b8a5a",
			dateLabel: "待定",
			comingSoon: true,
			sources: [
				{
					title: "尚未开放",
					desc: "小说书源自动化采集尚未接入",
					badge: "筹备中",
				},
				{
					title: "计划能力",
					desc: "阅读书源、备用书源、轻小说源",
				},
				{
					title: "说明",
					desc: "目前只做了影视源，本分类稍后接入",
				},
			],
		},
		{
			id: "comic",
			name: "漫画源",
			headline: "漫画线路 · 筹备中",
			numeral: "伍",
			color: "#e84a7f",
			dateLabel: "待定",
			comingSoon: true,
			sources: [
				{
					title: "尚未开放",
					desc: "漫画源自动化采集尚未接入",
					badge: "筹备中",
				},
				{
					title: "计划能力",
					desc: "漫画主源、备用合集、条漫专线",
				},
				{
					title: "说明",
					desc: "目前只做了影视源，本分类稍后接入",
				},
			],
		},
		{
			id: "audio",
			name: "听书源",
			headline: "有声读物 · 筹备中",
			numeral: "陆",
			color: "#e6e2d8",
			darkText: true,
			dateLabel: "待定",
			comingSoon: true,
			sources: [
				{
					title: "尚未开放",
					desc: "听书 / 有声自动化采集尚未接入",
					badge: "筹备中",
				},
				{
					title: "计划能力",
					desc: "听书主源、备用线路、播客合集",
				},
				{
					title: "说明",
					desc: "目前只做了影视源，本分类稍后接入",
				},
			],
		},
	],
};
