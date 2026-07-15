import type { MetadataRoute } from "next";

import { getPublishedPosts } from "@/lib/content/posts";
import { getTaxonomy } from "@/lib/content/taxonomy";
import { absoluteUrl, siteConfig } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const posts = await getPublishedPosts();
	const taxonomy = getTaxonomy(posts);

	return [
		{
			changeFrequency: "weekly",
			priority: 1,
			url: siteConfig.url,
		},
		...(["/archive/", "/search/"] as const).map((pathname) => ({
			changeFrequency: "weekly" as const,
			priority: 0.6,
			url: absoluteUrl(pathname),
		})),
		...taxonomy.categories.map((category) => ({
			changeFrequency: "weekly" as const,
			priority: 0.6,
			url: absoluteUrl(`/categories/${encodeURIComponent(category.slug)}/`),
		})),
		...taxonomy.tags.map((tag) => ({
			changeFrequency: "weekly" as const,
			priority: 0.5,
			url: absoluteUrl(`/tags/${encodeURIComponent(tag.slug)}/`),
		})),
		...posts.map((post) => ({
			changeFrequency: "monthly" as const,
			lastModified: post.published,
			priority: 0.8,
			url: absoluteUrl(`/posts/${post.slug}/`),
		})),
	];
}
