/**
 * 主页文案（个人向，不展示文章列表）
 * 名字/头像/社交在侧边栏，这里不再重复
 */
export type HomePageConfig = {
	/** 手记标题 */
	journalTitle: string;
	/** 正文段落 */
	paragraphs: string[];
	/** 最近在做 */
	nowTitle: string;
	nowItems: Array<{
		name: string;
		desc: string;
		href: string;
	}>;
	/** 底部轻链接 */
	links: Array<{
		label: string;
		href: string;
	}>;
	/** 收尾 */
	closing: string;
};

export const homePageConfig: HomePageConfig = {
	journalTitle: "先随便坐坐",
	paragraphs: [
		"我是岁月。平时写点东西，更多时候在鼓捣影音相关的小工具：播放、嗅探、采集、媒体控制，能自己用顺手就开心。",
		"这个站不算作品集，更像我随手放东西的地方——文章留给以后回想，导航是自己常用的收藏，采集页挂着影视接口信号台。",
		"不赶更新，也不装很忙。你路过的话，挑感兴趣的点进去看看就行。",
	],
	nowTitle: "最近在忙",
	nowItems: [
		{
			name: "Years--Collect",
			desc: "影视接口巡检与一键配置，已接到本站采集页。",
			href: "/collect/",
		},
		{
			name: "Years-kit",
			desc: "Flutter 跨平台影音播放套件，还在继续打磨。",
			href: "/projects/",
		},
		{
			name: "更多项目",
			desc: "VideoSniffer、Media-Controller、记账本等都在 GitHub。",
			href: "/projects/",
		},
	],
	links: [
		{ label: "读文章", href: "/all/" },
		{ label: "看导航", href: "/nav/" },
		{ label: "去采集", href: "/collect/" },
		{ label: "我的项目", href: "/projects/" },
		{ label: "关于我", href: "/about/" },
	],
	closing: "有事可以通过侧边栏的 QQ / 微信 / 邮箱找我。",
};
