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
	group: Skill["group"];
	label: string;
}[] = [
	{ group: "frontend", label: "前端与界面" },
	{ group: "backend", label: "后端与自动化" },
	{ group: "database", label: "数据存储" },
	{ group: "tooling", label: "工程工具" },
];

export default function SkillsPage() {
	return (
		<main
			className="page-shell showcase-page showcase-page--skills"
			id="main-content"
			tabIndex={-1}
		>
			<PageIntro
				description="不标注虚构的熟练度，只列出能够由公开项目佐证的技术。"
				title="技能"
			/>
			{skillGroups.map((group) => {
				const items = skills.filter(
					(skill) => skill.group === group.group,
				);
				if (items.length === 0) return null;

				return (
					<section
						aria-labelledby={`skills-${group.group}`}
						key={group.group}
					>
						<h2 id={`skills-${group.group}`}>{group.label}</h2>
						<ul>
							{items.map((skill) => (
								<li key={skill.id}>
									<strong>{skill.name}</strong>
									{skill.summary ? (
										<span> — {skill.summary}</span>
									) : null}
								</li>
							))}
						</ul>
					</section>
				);
			})}
		</main>
	);
}
