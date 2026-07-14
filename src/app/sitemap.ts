import type { MetadataRoute } from "next";

import { getPublishedPosts } from "@/lib/posts";
import { absoluteUrl, siteConfig } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const posts = await getPublishedPosts();

	return [
		{
			changeFrequency: "weekly",
			priority: 1,
			url: siteConfig.url,
		},
		...posts.map((post) => ({
			changeFrequency: "monthly" as const,
			lastModified: post.published,
			priority: 0.8,
			url: absoluteUrl(`/posts/${post.slug}/`),
		})),
	];
}
