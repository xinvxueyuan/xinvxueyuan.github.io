import { describe, expect, it } from "vitest";

import type { Post } from "../../src/lib/content/posts";
import { getSearchRecords } from "../../src/lib/content/search-records";

function post(overrides: Partial<Post> = {}): Post {
	return {
		body: "plain **searchable** body [链接](https://example.com)",
		category: "工程",
		comment: true,
		draft: false,
		published: new Date("2026-07-14T00:00:00.000Z"),
		slug: "example",
		sourcePath: "example.md",
		tags: ["Next.js"],
		title: "Example",
		...overrides,
	};
}

describe("getSearchRecords", () => {
	it("creates deterministic plain-text records and excludes drafts", () => {
		expect(
			getSearchRecords([
				post({ slug: "older", published: new Date("2025-01-01"), title: "Older" }),
				post({ draft: true, slug: "draft", title: "Draft" }),
				post(),
			]),
		).toEqual([
			{
				content: "plain searchable body 链接",
				meta: {
					category: "工程",
					tags: ["Next.js"],
					title: "Example",
				},
				url: "/posts/example/",
			},
			{
				content: "plain searchable body 链接",
				meta: {
					category: "工程",
					tags: ["Next.js"],
					title: "Older",
				},
				url: "/posts/older/",
			},
		]);
	});
});
