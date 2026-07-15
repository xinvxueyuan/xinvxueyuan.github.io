import type { Metadata } from "next";

import { PostCard } from "@/components/post-card";
import { getPublishedPosts } from "@/lib/content/posts";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
	alternates: { canonical: absoluteUrl("/archive/") },
	description: "按年份浏览 xinvStar 的全部文章。",
	title: "文章归档",
};

export default async function ArchivePage() {
	const posts = await getPublishedPosts();
	const years = Map.groupBy(posts, (post) => post.published.getUTCFullYear());

	return (
		<main className="page-shell" id="main-content" tabIndex={-1}>
			<header className="section-heading">
				<h1>文章归档</h1>
				<p>按时间回看写下的技术笔记与学习记录。</p>
			</header>
			{[...years].map(([year, yearPosts]) => (
				<section aria-labelledby={`year-${year}`} key={year}>
					<h2 id={`year-${year}`}>{year}</h2>
					<div className="post-list">
						{yearPosts.map((post) => (
							<PostCard key={post.slug} post={post} />
						))}
					</div>
				</section>
			))}
		</main>
	);
}
