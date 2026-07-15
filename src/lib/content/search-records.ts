import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";

import type { Post } from "./posts";

export type SearchRecord = {
	url: string;
	content: string;
	meta: {
		title: string;
		category: string;
		tags: string[];
	};
};

function markdownText(markdown: string): string {
	const tree = unified().use(remarkParse).parse(markdown);
	const fragments: string[] = [];
	visit(tree, "text", (node) => {
		fragments.push(node.value);
	});
	return fragments.join(" ").replace(/\s+/gu, " ").trim();
}

export function getSearchRecords(posts: readonly Post[]): SearchRecord[] {
	return posts
		.filter((post) => !post.draft)
		.toSorted(
			(left, right) =>
				right.published.getTime() - left.published.getTime() ||
				left.slug.localeCompare(right.slug),
		)
		.map((post) => ({
			content: markdownText(post.body),
			meta: {
				category: post.category ?? "",
				tags: post.tags,
				title: post.title,
			},
			url: `/posts/${post.slug}/`,
		}));
}
