import {
	type NavBarConfig,
	type NavBarLink,
	type NavBarSearchConfig,
	NavBarSearchMethod,
} from "../types/navBarConfig";
import { navPageConfig } from "./navPageConfig";

// ============================================================================
// 导航栏配置 - 根据顺序动态生成导航栏链接
// ============================================================================
const getDynamicNavBarConfig = (): NavBarConfig => {
	const links: NavBarLink[] = [];

	// 主页
	links.push(LinkPresets.Home);

	// 导航及其分类子菜单（点击「导航」进入页面，悬停展开分类）
	links.push({
		name: "导航",
		url: "/nav/",
		icon: "material-symbols:explore",
		pageKey: "nav",
		children: navPageConfig.groups.map((group) => ({
			name: group.name,
			url: `/nav/#${group.id}`,
			icon: group.icon,
		})),
	});

	// 文章及其子菜单（点击「文章」进入归档页，悬停展开子项）
	links.push({
		name: "文章",
		url: "/archive/",
		icon: "material-symbols:article",
		children: [
			{
				name: "全部",
				url: "/all/",
				icon: "material-symbols:select-all",
			},
			LinkPresets.Archive,
			LinkPresets.Categories,
			LinkPresets.Tags,
		],
	});

	// 采集（六宫格入口，无下拉）
	links.push(LinkPresets.Collect);

	// 关于及其子菜单
	links.push({
		name: "关于",
		url: "#",
		icon: "material-symbols:info",
		children: [LinkPresets.Projects, LinkPresets.Sponsor, LinkPresets.About],
	});

	return { links } as NavBarConfig;
};

export const navBarSearchConfig: NavBarSearchConfig = {
	method: NavBarSearchMethod.PageFind,
};

export const LinkPresets: Record<string, NavBarLink> = {
	Home: {
		name: "主页",
		url: "/",
		icon: "material-symbols:home",
	},
	Nav: {
		name: "导航",
		url: "/nav/",
		icon: "material-symbols:explore",
		pageKey: "nav",
	},
	Archive: {
		name: "归档",
		url: "/archive/",
		icon: "material-symbols:archive",
	},
	Categories: {
		name: "分类",
		url: "/categories/",
		icon: "material-symbols:folder-open-rounded",
	},
	Tags: {
		name: "标签",
		url: "/tags/",
		icon: "material-symbols:tag-rounded",
	},
	Collect: {
		name: "采集",
		url: "/collect/",
		icon: "material-symbols:collections-bookmark",
		pageKey: "collect",
	},
	Projects: {
		name: "我的项目",
		url: "/projects/",
		icon: "material-symbols:folder-code-outline",
		pageKey: "projects",
	},
	Sponsor: {
		name: "打赏",
		url: "/sponsor/",
		icon: "material-symbols:favorite",
		pageKey: "sponsor",
	},
	About: {
		name: "关于我",
		url: "/about/",
		icon: "material-symbols:person",
	},
};

export const navBarConfig: NavBarConfig = getDynamicNavBarConfig();
