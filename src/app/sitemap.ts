import type { MetadataRoute } from "next";

import { getPublishedPosts } from "@/lib/content/posts";
import { getTaxonomy } from "@/lib/content/taxonomy";
import { albums } from "@/lib/showcase/content";
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
		...(
			[
				"/about/",
				"/projects/",
				"/timeline/",
				"/skills/",
				"/friends/",
				"/devices/",
				"/diary/",
				"/albums/",
			] as const
		).map((pathname) => ({
			changeFrequency: "monthly" as const,
			priority: 0.5,
			url: absoluteUrl(pathname),
		})),
		...albums.map((album) => ({
			changeFrequency: "monthly" as const,
			priority: 0.4,
			url: absoluteUrl(`/albums/${album.slug}/`),
		})),
		...taxonomy.categories.map((category) => ({
			changeFrequency: "weekly" as const,
			priority: 0.6,
			url: absoluteUrl(
				`/categories/${encodeURIComponent(category.slug)}/`,
			),
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
