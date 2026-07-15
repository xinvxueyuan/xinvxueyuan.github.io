import type { Metadata } from "next";
import Image from "next/image";

import { ExternalLink } from "@/components/showcase/external-link";
import { PageIntro } from "@/components/showcase/page-intro";
import { projects } from "@/lib/showcase/content";
import type { ProjectStatus } from "@/lib/showcase/types";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
	alternates: { canonical: absoluteUrl("/projects/") },
	description: "浏览 xinvStar 正在维护的公开项目。",
	title: "项目",
};

const statusLabels: Record<ProjectStatus, string> = {
	completed: "已完成",
	"in-progress": "持续维护",
	planned: "计划中",
};

export default function ProjectsPage() {
	return (
		<main
			className="page-shell showcase-page showcase-page--projects"
			id="main-content"
			tabIndex={-1}
		>
			<PageIntro
				description="这些项目连接着技术写作、开源协作与日常实践。"
				title="项目"
			/>
			<div>
				{projects.map((project) => (
					<article key={project.slug}>
						{project.image ? (
							<Image
								alt={project.image.alt}
								height={project.image.height}
								src={project.image.src}
								width={project.image.width}
							/>
						) : null}
						<h2>{project.title}</h2>
						<p>{project.description}</p>
						<p>状态：{statusLabels[project.status]}</p>
						<ul aria-label={`${project.title} 技术`}>
							{project.technologies.map((technology) => (
								<li key={technology}>{technology}</li>
							))}
						</ul>
						<p>
							{project.links.map((link, index) => (
								<span key={link.href}>
									{index > 0 ? " · " : null}
									<ExternalLink link={link} />
								</span>
							))}
						</p>
					</article>
				))}
			</div>
		</main>
	);
}
