import type { Metadata } from "next";

import { EmptyState } from "@/components/showcase/empty-state";
import { ExternalLink } from "@/components/showcase/external-link";
import { PageIntro } from "@/components/showcase/page-intro";
import { timeline } from "@/lib/showcase/content";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
	alternates: { canonical: absoluteUrl("/timeline/") },
	description: "按时间回看 xinvStar 可公开验证的学习与项目节点。",
	title: "时间线",
};

export default function TimelinePage() {
	const entries = timeline.toReversed();

	return (
		<main className="page-shell" id="main-content" tabIndex={-1}>
			<PageIntro
				description="这里只记录有可靠公开依据的项目、学习与工作节点。"
				title="时间线"
			/>
			{entries.length === 0 ? (
				<EmptyState
					description="暂时没有可公开验证的时间线记录，确认事实后会在这里补充。"
					title="记录待补充"
				/>
			) : (
				<ol>
					{entries.map((entry) => (
						<li key={entry.id}>
							<article>
								<h2>{entry.title}</h2>
								<p>
									<time dateTime={entry.startDate}>{entry.startDate}</time>
									{entry.endDate ? ` — ${entry.endDate}` : null}
								</p>
								<p>{entry.description}</p>
								{entry.links.map((link) => (
									<ExternalLink key={link.href} link={link} />
								))}
							</article>
						</li>
					))}
				</ol>
			)}
		</main>
	);
}
