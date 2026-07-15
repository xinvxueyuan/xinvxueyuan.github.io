import type { Metadata } from "next";
import Image from "next/image";

import { EmptyState } from "@/components/showcase/empty-state";
import { PageIntro } from "@/components/showcase/page-intro";
import { diary } from "@/lib/showcase/content";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
	alternates: { canonical: absoluteUrl("/diary/") },
	description: "阅读 xinvStar 选择公开的日常记录。",
	title: "日记",
};

export default function DiaryPage() {
	return (
		<main className="page-shell" id="main-content" tabIndex={-1}>
			<PageIntro
				description="这里独立保存选择公开的生活片段，不与技术文章混用内容模型。"
				title="日记"
			/>
			{diary.length === 0 ? (
				<EmptyState
					description="暂时没有可公开的日记记录，准备好分享时会按写下的顺序出现在这里。"
					title="日常仍在发生"
				/>
			) : (
				<ol>
					{diary.map((entry) => (
						<li key={entry.id}>
							<article>
								<p>
									<time dateTime={entry.publishedAt}>
										{entry.publishedAt}
									</time>
								</p>
								<p>{entry.content}</p>
								{entry.tags.length > 0 ? (
									<p aria-label="标签">
										{entry.tags.join("、")}
									</p>
								) : null}
								{entry.images.map((image) => (
									<Image
										alt={image.alt}
										height={image.height}
										key={image.src}
										src={image.src}
										width={image.width}
									/>
								))}
							</article>
						</li>
					))}
				</ol>
			)}
		</main>
	);
}
