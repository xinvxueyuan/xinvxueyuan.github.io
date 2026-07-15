import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PostCard } from "@/components/post-card";
import { getPublishedPosts } from "@/lib/content/posts";
import { getTaxonomy } from "@/lib/content/taxonomy";
import { absoluteUrl } from "@/lib/site";

type CategoryRoute = { params: Promise<{ category: string }> };

function decodeTerm(value: string): string | undefined {
	try {
		return decodeURIComponent(value);
	} catch {
		return undefined;
	}
}

async function resolveCategory(value: string) {
	const posts = await getPublishedPosts();
	const slug = decodeTerm(value);
	const term = slug
		? getTaxonomy(posts).categories.find(
				(candidate) => candidate.slug === slug,
			)
		: undefined;
	return term ? { posts, term } : undefined;
}

export async function generateStaticParams() {
	return getTaxonomy(await getPublishedPosts()).categories.map((term) => ({
		category: term.slug,
	}));
}

export async function generateMetadata({
	params,
}: CategoryRoute): Promise<Metadata> {
	const { category } = await params;
	const resolved = await resolveCategory(category);
	if (!resolved) return { title: "分类不存在" };
	return {
		alternates: {
			canonical: absoluteUrl(
				`/categories/${encodeURIComponent(resolved.term.slug)}/`,
			),
		},
		description: `浏览分类“${resolved.term.name}”下的文章。`,
		title: `分类：${resolved.term.name}`,
	};
}

export default async function CategoryPage({ params }: CategoryRoute) {
	const { category } = await params;
	const resolved = await resolveCategory(category);
	if (!resolved) notFound();
	const normalizedName = resolved.term.name.toLocaleLowerCase();
	const posts = resolved.posts.filter(
		(post) => post.category?.trim().toLocaleLowerCase() === normalizedName,
	);

	return (
		<main className="page-shell" id="main-content" tabIndex={-1}>
			<header className="section-heading">
				<h1>分类：{resolved.term.name}</h1>
				<p>{posts.length} 篇文章</p>
			</header>
			<div className="post-list">
				{posts.map((post) => (
					<PostCard key={post.slug} post={post} />
				))}
			</div>
		</main>
	);
}
