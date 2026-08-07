export type ProjectItem = {
	/** 项目名称 */
	name: string;
	/** 一句话介绍 */
	desc: string;
	/** 状态 */
	status: "进行中" | "已完成" | "维护中" | "想法中";
	/** 标签 */
	tags?: string[];
	/** 项目主页 / 演示 */
	url?: string;
	/** 源码地址 */
	repo?: string;
	/** 图标 */
	icon?: string;
};

export type ProjectsPageConfig = {
	title: string;
	description: string;
	projects: ProjectItem[];
};

/**
 * 我的项目 —— 来自 https://github.com/agentai2026
 */
export const projectsPageConfig: ProjectsPageConfig = {
	title: "我的项目",
	description:
		"GitHub @agentai2026 上的公开仓库，多为影音工具与桌面端相关。",
	projects: [
		{
			name: "Years--Collect",
			desc: "影视采集站信号台：接口巡检、在线率与一键配置。本站「采集」页即由此接入。",
			status: "进行中",
			tags: ["JavaScript", "采集", "影视"],
			url: "/collect/",
			repo: "https://github.com/agentai2026/Years--Collect",
			icon: "material-symbols:radar",
		},
		{
			name: "Years-kit",
			desc: "跨平台影音播放套件，面向 Flutter / Dart 的视频与音频播放能力。",
			status: "进行中",
			tags: ["Dart", "Flutter", "播放器"],
			repo: "https://github.com/agentai2026/Years-kit",
			icon: "material-symbols:play-circle-outline",
		},
		{
			name: "Years---VideoSniffer",
			desc: "基于 webview_windows 的分支，补充 getCookie 与 m3u8 嗅探能力。",
			status: "维护中",
			tags: ["C++", "WebView", "m3u8"],
			repo: "https://github.com/agentai2026/Years---VideoSniffer",
			icon: "material-symbols:videocam-outline",
		},
		{
			name: "Years----Media-Controller",
			desc: "Windows 端媒体控制插件，对接 Flutter audio_service。",
			status: "维护中",
			tags: ["C++", "Flutter", "Windows"],
			repo: "https://github.com/agentai2026/Years----Media-Controller",
			icon: "material-symbols:tune",
		},
		{
			name: "Accounting-book-Windows",
			desc: "Windows 记账本应用，基于 Dart 开发。",
			status: "进行中",
			tags: ["Dart", "Windows", "记账"],
			repo: "https://github.com/agentai2026/Accounting-book-Windows",
			icon: "material-symbols:account-balance-wallet-outline",
		},
		{
			name: "openclaw-zh",
			desc: "OpenClaw 定时汉化包，便于中文环境下使用与维护。",
			status: "维护中",
			tags: ["JavaScript", "汉化"],
			url: "https://agentai2026.github.io/my-website/",
			repo: "https://github.com/agentai2026/openclaw-zh",
			icon: "material-symbols:translate",
		},
	],
};
