// Project data configuration file
// Used to manage data for the project display page

export interface Project {
	id: string;
	title: string;
	description: string;
	image: string;
	category: "web" | "mobile" | "desktop" | "other";
	techStack: string[];
	status: "completed" | "in-progress" | "planned";
	liveDemo?: string;
	sourceCode?: string;
	visitUrl?: string;
	startDate: string;
	endDate?: string;
	featured?: boolean;
	tags?: string[];
	showImage?: boolean;
}

export const projectsData: Project[] = [
	{
		id: "xinStar",
		title: "xinStar",
		description:
			"基于 Astro 构建的新一代 Material Design 3 博客主题，支持国际化、暗色模式和响应式设计。",
		image: "/assets/projects/xinvstar.webp",
		category: "web",
		techStack: ["Astro", "TypeScript", "Tailwind CSS", "Svelte"],
		status: "completed",
		sourceCode: "https://github.com/xinvxueyuan/xinvxueyuan.github.io",
		visitUrl: "https://www.xinvstar.xyz/",
		startDate: "2024-01-01",
		endDate: "2024-06-01",
		featured: true,
		tags: ["Blog", "Theme", "Open Source"],
	},
	{
		id: "lingchu-bot",
		title: "Lingchu Bot",
		description:
			"基于 NoneBot2 的 QQ 群管理机器人，以插件化方式组织功能，专注于群管理、指令处理、配置管理和异步数据访问。",
		image: "",
		category: "other",
		techStack: ["Python", "NoneBot2", "SQLite", "asyncio"],
		status: "in-progress",
		sourceCode: "https://github.com/xinvxueyuan/lingchu-bot",
		startDate: "2025-06-01",
		featured: true,
		tags: ["QQ Bot", "Group Management", "Plugin"],
		showImage: false,
	},
];

// Get project statistics
export const getProjectStats = () => {
	const total = projectsData.length;
	const completed = projectsData.filter(
		(p) => p.status === "completed",
	).length;
	const inProgress = projectsData.filter(
		(p) => p.status === "in-progress",
	).length;
	const planned = projectsData.filter((p) => p.status === "planned").length;

	return {
		total,
		byStatus: {
			completed,
			inProgress,
			planned,
		},
	};
};

// Get projects by category
export const getProjectsByCategory = (category?: string) => {
	if (!category || category === "all") {
		return projectsData;
	}
	return projectsData.filter((p) => p.category === category);
};

// Get featured projects
export const getFeaturedProjects = () => {
	return projectsData.filter((p) => p.featured);
};

// Get all tech stacks
export const getAllTechStack = () => {
	const techSet = new Set<string>();
	projectsData.forEach((project) => {
		project.techStack.forEach((tech) => {
			techSet.add(tech);
		});
	});
	return Array.from(techSet).sort();
};
