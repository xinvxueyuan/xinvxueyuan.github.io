import type { Heading } from "@/lib/markdown";

import { TocHighlight } from "../interactive/toc-highlight";

export function ArticleToc({ headings }: { headings: Heading[] }) {
	if (headings.length === 0) return null;
	return (
		<nav aria-label="文章目录" className="article-toc">
			<p className="article-toc__title">文章目录</p>
			<ol>
				{headings.map((heading, index) => (
					<li data-depth={heading.depth} key={heading.id}>
						<a
							aria-current={index === 0 ? "location" : undefined}
							href={`#${heading.id}`}
						>
							{heading.text}
						</a>
					</li>
				))}
			</ol>
			<TocHighlight headingIds={headings.map(({ id }) => id)} />
		</nav>
	);
}
