import type { Metadata } from "next";

import { PageIntro } from "@/components/showcase/page-intro";
import { skills } from "@/lib/showcase/content";
import type { Skill } from "@/lib/showcase/types";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
	alternates: { canonical: absoluteUrl("/skills/") },
	description: "查看 xinvStar 在公开项目中实际使用的技术方向。",
	title: "技能",
};

const skillGroups: readonly {
	category: Skill["category"];
	label: string;
}[] = [
	{ category: "frontend", label: "前端与界面" },
	{ category: "backend", label: "后端与自动化" },
	{ category: "database", label: "数据存储" },
	{ category: "tooling", label: "工程工具" },
];

export default function SkillsPage() {
	return (
		<main className="page-shell" id="main-content" tabIndex={-1}>
			<PageIntro
				description="不标注虚构的熟练度，只列出能够由公开项目佐证的技术。"
				title="技能"
			/>
			{skillGroups.map((group) => {
				const items = skills.filter(
					(skill) => skill.category === group.category,
				);
				if (items.length === 0) return null;

				return (
					<section aria-labelledby={`skills-${group.category}`} key={group.category}>
						<h2 id={`skills-${group.category}`}>{group.label}</h2>
						<ul>
							{items.map((skill) => (
								<li key={skill.id}>
									<strong>{skill.name}</strong>
									<span> — {skill.evidence.join("、")}</span>
								</li>
							))}
						</ul>
					</section>
				);
			})}
		</main>
	);
}
