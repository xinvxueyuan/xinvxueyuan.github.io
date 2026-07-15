import { absoluteUrl, siteConfig } from "@/lib/site";

import type { Post } from "./posts";

export type BlogPosting = {
	"@context": "https://schema.org";
	"@type": "BlogPosting";
	dateModified: string;
	datePublished: string;
	description: string;
	headline: string;
	image: string;
	inLanguage: "zh-CN";
	keywords: string[];
	mainEntityOfPage: string;
	publisher: {
		"@type": "Organization";
		name: string;
		url: string;
	};
};

export function createBlogPosting(post: Post): BlogPosting {
	return {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		dateModified: (post.updated ?? post.published).toISOString(),
		datePublished: post.published.toISOString(),
		description: post.description ?? siteConfig.description,
		headline: post.title,
		image: absoluteUrl(post.cover?.src ?? siteConfig.defaultOgImage),
		inLanguage: "zh-CN",
		keywords: post.tags,
		mainEntityOfPage: absoluteUrl(`/posts/${post.slug}/`),
		publisher: {
			"@type": "Organization",
			name: siteConfig.title,
			url: siteConfig.url,
		},
	};
}

export function serializeStructuredData(data: BlogPosting): string {
	return JSON.stringify(data).replaceAll("<", "\\u003c");
}
