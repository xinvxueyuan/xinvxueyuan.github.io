import { describe, expect, it } from "vitest";

import { serializeLlmsFull, serializeLlmsIndex } from "@/lib/content/llms";
import type { Post } from "@/lib/content/posts";

const posts: Post[] = [
	{
		body: "Full published body.",
		comment: true,
		description: "A concise description.",
		draft: false,
		published: new Date("2026-07-14T00:00:00.000Z"),
		slug: "published",
		sourcePath: "published.md",
		tags: [],
		title: "Published title",
	},
	{
		body: "Secret draft body.",
		comment: true,
		draft: true,
		published: new Date("2026-07-15T00:00:00.000Z"),
		slug: "draft",
		sourcePath: "draft.md",
		tags: [],
		title: "Draft title",
	},
];

describe("llms text serializers", () => {
	it("creates a canonical published-post index", () => {
		const text = serializeLlmsIndex(posts);
		expect(text).toContain(
			"- [Published title](https://www.xinvstar.xyz/posts/published/): A concise description.",
		);
		expect(text).not.toContain("Draft title");
		expect(text).not.toContain("Full published body.");
	});

	it("includes every published title once with its full Markdown body", () => {
		const text = serializeLlmsFull(posts);
		expect(text.match(/^## Published title$/gmu)).toHaveLength(1);
		expect(text).toContain("Full published body.");
		expect(text).not.toContain("Draft title");
		expect(text).not.toContain("Secret draft body.");
	});
});
