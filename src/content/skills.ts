import type { Skill } from "../lib/showcase/types";

const skillsData = [
	{
		id: "typescript",
		name: "TypeScript",
		group: "frontend",
		summary: "用于 xinvStar 的类型安全界面开发。",
	},
	{
		id: "nextjs",
		name: "Next.js",
		group: "frontend",
		summary: "用于构建和发布 xinvStar。",
	},
	{
		id: "python",
		name: "Python",
		group: "backend",
		summary: "用于 Lingchu Bot 的服务端能力。",
	},
	{
		id: "nonebot2",
		name: "NoneBot2",
		group: "backend",
		summary: "Lingchu Bot 的机器人框架。",
	},
	{
		id: "sqlite",
		name: "SQLite",
		group: "database",
		summary: "用于 Lingchu Bot 的本地数据存储。",
	},
] as const satisfies readonly Skill[];

export const skills: readonly Skill[] = skillsData;
