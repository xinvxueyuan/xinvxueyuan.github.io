import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Markdown } from "@/components/markdown";
import { getPost, getPublishedPosts } from "@/lib/content/posts";
import {
	createBlogPosting,
	serializeStructuredData,
} from "@/lib/content/structured-data";
import { renderMarkdown } from "@/lib/markdown";
import { absoluteUrl, siteConfig } from "@/lib/site";

type PostPageProps = {
	params: Promise<{ slug: string }>;
};

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
	dateStyle: "long",
	timeZone: "UTC",
});

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
			<article
				className="post-page"
				data-has-mermaid={hasMermaid || undefined}
				data-headings={JSON.stringify(headings)}
			>
				<header className="post-page__header">
					<p className="post-page__date">
						<time dateTime={post.published.toISOString()}>
							{dateFormatter.format(post.published)}
						</time>
					</p>
					<h1>{post.title}</h1>
					{post.description ? <p>{post.description}</p> : null}
				</header>
				<Markdown html={html} />
			</article>
		</main>
	);
}
