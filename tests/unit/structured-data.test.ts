import { describe, expect, it } from "vitest";

import {
	createBlogPosting,
	serializeStructuredData,
} from "@/lib/content/structured-data";
import type { Post } from "@/lib/content/posts";

describe("article structured data", () => {
	it("uses canonical schema.org BlogPosting fields and ISO dates", () => {
		const post: Post = {
			body: "Body",
			comment: true,
			description: "Description <unsafe>",
			draft: false,
			published: new Date("2026-07-14T00:00:00.000Z"),
			slug: "example",
			sourcePath: "example.md",
			tags: ["Next.js"],
			title: "Example",
			updated: new Date("2026-07-15T00:00:00.000Z"),
		};
		const data = createBlogPosting(post);

		expect(data).toMatchObject({
			"@context": "https://schema.org",
			"@type": "BlogPosting",
			dateModified: "2026-07-15T00:00:00.000Z",
			datePublished: "2026-07-14T00:00:00.000Z",
			headline: "Example",
			mainEntityOfPage: "https://www.xinvstar.xyz/posts/example/",
		});
		expect(serializeStructuredData(data)).toContain("\\u003cunsafe>");
		expect(serializeStructuredData(data)).not.toContain("<unsafe>");
	});
});
