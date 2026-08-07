import type { ProfileConfig } from "../types/profileConfig";

export const profileConfig: ProfileConfig = {
	// 头像
	// 图片路径支持三种格式：
	// 1. public 目录（以 "/" 开头，不优化）："/assets/images/avatar.webp"
	// 2. src 目录（不以 "/" 开头，自动优化但会增加构建时间，推荐）："assets/images/avatar.webp"
	// 3. 远程 URL："https://example.com/avatar.jpg"
	avatar: "assets/images/avatar.avif",

	// 名字
	name: "岁月",

	// 个人签名
	bio: "写一点，收一点，慢慢过。",

	// 链接配置
	// 已经预装的图标集：fa7-brands，fa7-regular，fa7-solid，material-symbols，simple-icons
	// 访问https://icones.js.org/ 获取图标代码，
	// 如果想使用尚未包含相应的图标集，则需要安装它
	// `pnpm add @iconify-json/<icon-set-name>`
	// showName: true 时显示图标和名称，false 时只显示图标
	links: [
		{
			name: "GitHub",
			icon: "fa7-brands:github",
			url: "https://github.com/agentai2026",
			showName: false,
		},
		{
			name: "QQ",
			icon: "fa7-brands:qq",
			// 改成你的 QQ 号；点击会复制
			url: "copy:请填写QQ号",
			showName: false,
		},
		{
			name: "微信",
			icon: "fa7-brands:weixin",
			// 改成你的微信号；点击会复制
			url: "copy:请填写微信号",
			showName: false,
		},
		{
			name: "邮箱",
			icon: "fa7-solid:envelope",
			// 改成你的邮箱
			url: "mailto:please-set@example.com",
			showName: false,
		},
		{
			name: "RSS",
			icon: "fa7-solid:rss",
			url: "/rss/",
			showName: false,
		},
	],
};
