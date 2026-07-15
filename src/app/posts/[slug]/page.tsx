import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleMeta } from "@/components/content/article-meta";
import { ArticleRecommendations } from "@/components/content/article-recommendations";
import { ArticleToc } from "@/components/content/article-toc";
import { Comments } from "@/components/interactive/comments";
import { ShareActions } from "@/components/interactive/share-actions";
import { Markdown } from "@/components/markdown";
import { getPost, getPublishedPosts } from "@/lib/content/posts";
import {
	getAdjacentPosts,
	getRelatedPosts,
} from "@/lib/content/recommendations";
import { getReadingStats } from "@/lib/content/reading";
import {
	createBlogPosting,
	serializeStructuredData,
} from "@/lib/content/structured-data";
import { renderMarkdown } from "@/lib/markdown";
import { absoluteUrl, siteConfig } from "@/lib/site";

type PostPageProps = {
	params: Promise<{ slug: string }>;
};

function decodeSlug(slug: string): string | undefined {
	try {
		return decodeURIComponent(slug);
	} catch {
		return undefined;
	}
}

export async function generateStaticParams() {
	return (await getPublishedPosts()).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
	params,
}: PostPageProps): Promise<Metadata> {
	const { slug } = await params;
	const decodedSlug = decodeSlug(slug);
	if (!decodedSlug) notFound();
	const post = await getPost(decodedSlug);
	if (!post) notFound();

	const url = absoluteUrl(`/posts/${post.slug}/`);
	const description = post.description ?? siteConfig.description;

	return {
		alternates: { canonical: url },
		description,
		openGraph: {
			description,
			publishedTime: post.published.toISOString(),
			title: post.title,
			type: "article",
			url,
		},
		title: post.title,
	};
}

export default async function PostPage({ params }: PostPageProps) {
	const { slug } = await params;
	const decodedSlug = decodeSlug(slug);
	if (!decodedSlug) notFound();
	const post = await getPost(decodedSlug);
	if (!post) notFound();

	const { hasMermaid, headings, html } = await renderMarkdown(post.body);
	const structuredData = serializeStructuredData(createBlogPosting(post));
	const publishedPosts = await getPublishedPosts();
	const adjacent = getAdjacentPosts(publishedPosts, post.slug);
	const related = getRelatedPosts(publishedPosts, post.slug);
	const reading = getReadingStats(post.body);
	const canonicalUrl = absoluteUrl(`/posts/${post.slug}/`);

	return (
		<main
			className="page-shell page-shell--article"
			id="main-content"
			tabIndex={-1}
		>
			<script
				dangerouslySetInnerHTML={{ __html: structuredData }}
				type="application/ld+json"
			/>
			<div className="article-layout">
				<article
					className="post-page"
					data-has-mermaid={hasMermaid || undefined}
					data-headings={JSON.stringify(headings)}
				>
					<header className="post-page__header">
						<h1>{post.title}</h1>
						{post.description ? <p>{post.description}</p> : null}
						<ArticleMeta
							category={post.category}
							characters={reading.characters}
							minutes={reading.minutes}
							published={post.published}
							tags={post.tags}
							updated={post.updated}
							words={reading.words}
						/>
					</header>
					<Markdown hasMermaid={hasMermaid} html={html} />
					<footer className="article-footer">
						<p>除特别说明外，本文采用 CC BY-NC-SA 4.0 许可。</p>
						<ShareActions
							canonicalUrl={canonicalUrl}
							title={post.title}
						/>
						<ArticleRecommendations
							adjacent={adjacent}
							related={related}
						/>
						<Comments
							enabled={post.comment}
							pathname={`/posts/${post.slug}/`}
						/>
					</footer>
				</article>
				<aside className="article-layout__aside">
					<ArticleToc headings={headings} />
				</aside>
			</div>
		</main>
	);
}
