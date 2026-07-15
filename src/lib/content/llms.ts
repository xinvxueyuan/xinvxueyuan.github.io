import { absoluteUrl, siteConfig } from "@/lib/site";

import type { Post } from "./posts";

function publishedInDateOrder(posts: Post[]): Post[] {
	return posts
		.filter((post) => !post.draft)
		.toSorted(
			(left, right) =>
				right.published.getTime() - left.published.getTime() ||
				left.slug.localeCompare(right.slug),
		);
}

function canonicalPostUrl(post: Post): string {
	return absoluteUrl(`/posts/${post.slug}/`);
}

export function serializeLlmsIndex(posts: Post[]): string {
	const entries = publishedInDateOrder(posts)
		.map((post) => {
			const description = post.description
				? `: ${post.description.replaceAll("\n", " ").trim()}`
				: "";
			return `- [${post.title}](${canonicalPostUrl(post)})${description}`;
		})
		.join("\n");

	return `# ${siteConfig.title}

> ${siteConfig.description}

## Posts

${entries}
`;
}

export function serializeLlmsFull(posts: Post[]): string {
	const sections = publishedInDateOrder(posts)
		.map(
			(post) => `## ${post.title}

- Canonical: ${canonicalPostUrl(post)}
- Published: ${post.published.toISOString()}
${post.updated ? `- Updated: ${post.updated.toISOString()}\n` : ""}
${post.body.trim()}`,
		)
		.join("\n\n---\n\n");

	return `# ${siteConfig.title}: full articles

> ${siteConfig.description}

${sections}
`;
}
