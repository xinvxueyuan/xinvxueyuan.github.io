import type { Project } from "../lib/showcase/types";

const projectsData = [
	{
		slug: "xinvstar",
		title: "xinvStar",
		description: "个人博客与技术内容站点。",
		status: "in-progress",
		technologies: ["Next.js", "TypeScript"],
		cover: {
			src: "/assets/projects/xinvstar.webp",
			alt: "xinvStar 博客项目界面",
			width: 1920,
			height: 918,
		},
		links: [
			{ label: "网站", href: "https://www.xinvstar.xyz/" },
			{
				label: "源代码",
				href: "https://github.com/xinvxueyuan/xinvxueyuan.github.io",
			},
		],
		featured: true,
	},
	{
		slug: "lingchu-bot",
		title: "Lingchu Bot",
		description: "基于 NoneBot2 的开源 QQ 群管理机器人。",
		status: "in-progress",
		technologies: ["Python", "NoneBot2", "SQLite", "asyncio"],
		links: [
			{
				label: "源代码",
				href: "https://github.com/xinvxueyuan/lingchu-bot",
			},
		],
		featured: true,
	},
] as const satisfies readonly Project[];

export const projects: readonly Project[] = projectsData;
