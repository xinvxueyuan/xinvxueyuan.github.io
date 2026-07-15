import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PostCard } from "@/components/post-card";
import { getPublishedPosts } from "@/lib/content/posts";
import { findRouteTaxonomyTerm } from "@/lib/content/route-term";
import { getTaxonomy } from "@/lib/content/taxonomy";
import { absoluteUrl } from "@/lib/site";

type TagRoute = { params: Promise<{ tag: string }> };

async function resolveTag(value: string) {
	const posts = await getPublishedPosts();
	const taxonomy = getTaxonomy(posts);
	const term = findRouteTaxonomyTerm(value, taxonomy.tags);
	return term ? { posts, taxonomy, term } : undefined;
}

export async function generateStaticParams() {
	return getTaxonomy(await getPublishedPosts()).tags.map((term) => ({
		tag: term.slug,
	}));
}

export async function generateMetadata({
	params,
}: TagRoute): Promise<Metadata> {
	const { tag } = await params;
	const resolved = await resolveTag(tag);
	if (!resolved) return { title: "标签不存在" };
	return {
		alternates: {
			canonical: absoluteUrl(
				`/tags/${encodeURIComponent(resolved.term.slug)}/`,
			),
		},
		description: `浏览标签“${resolved.term.name}”下的文章。`,
		title: `标签：${resolved.term.name}`,
	};
}

export default async function TagPage({ params }: TagRoute) {
	const { tag } = await params;
	const resolved = await resolveTag(tag);
	if (!resolved) notFound();
	const normalizedName = resolved.term.name.toLocaleLowerCase();
	const posts = resolved.posts.filter((post) =>
		post.tags.some(
			(candidate) =>
				candidate.trim().toLocaleLowerCase() === normalizedName,
		),
	);

	return (
		<main className="page-shell" id="main-content" tabIndex={-1}>
			<header className="section-heading">
				<h1>标签：{resolved.term.name}</h1>
				<p>{posts.length} 篇文章</p>
			</header>
			<div className="post-list">
				{posts.map((post) => (
					<PostCard
						key={post.slug}
						post={post}
						taxonomy={resolved.taxonomy}
					/>
				))}
			</div>
		</main>
	);
}
