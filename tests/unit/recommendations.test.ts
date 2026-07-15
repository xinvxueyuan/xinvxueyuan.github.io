import { describe, expect, it } from "vitest";

import type { PostSummary } from "../../src/lib/content/posts";
import {
	getAdjacentPosts,
	getRelatedPosts,
} from "../../src/lib/content/recommendations";

function summary(
	slug: string,
	published: string,
	options: { category?: string; draft?: boolean; tags?: string[] } = {},
): PostSummary {
	return {
		category: options.category,
		comment: true,
		draft: options.draft ?? false,
		published: new Date(published),
		slug,
		sourcePath: `${slug}.md`,
		tags: options.tags ?? [],
		title: slug,
	};
}

describe("post recommendations", () => {
	const posts = [
		summary("newest", "2026-04-01T00:00:00.000Z", {
			category: "Engineering",
			tags: ["React"],
		}),
		summary("current", "2026-03-01T00:00:00.000Z", {
			category: "Engineering",
			tags: ["React", "Next.js"],
		}),
		summary("two-tags", "2026-01-01T00:00:00.000Z", {
			category: "Other",
			tags: ["react", "NEXT.JS"],
		}),
		summary("newer-tie", "2026-02-01T00:00:00.000Z", {
			category: "Engineering",
			tags: ["Next.js"],
		}),
		summary("older-tie", "2025-02-01T00:00:00.000Z", {
			category: "Engineering",
			tags: ["Next.js"],
		}),
		summary("unrelated", "2026-05-01T00:00:00.000Z", {
			category: "Personal",
			tags: ["Travel"],
		}),
		summary("draft-match", "2027-01-01T00:00:00.000Z", {
			category: "Engineering",
			draft: true,
			tags: ["React", "Next.js"],
		}),
	];

	it("scores tag matches before category and breaks ties by newest date", () => {
		expect(
			getRelatedPosts(posts, "current", 4).map((post) => post.slug),
		).toEqual(["two-tags", "newest", "newer-tie", "older-tie"]);
	});

	it("excludes the current post, drafts, and unrelated posts", () => {
		const slugs = getRelatedPosts(posts, "current").map(
			(post) => post.slug,
		);
		expect(slugs).not.toContain("current");
		expect(slugs).not.toContain("draft-match");
		expect(slugs).not.toContain("unrelated");
	});

	it("returns date-ordered adjacent posts with explicit boundaries", () => {
		expect(getAdjacentPosts(posts, "current")).toEqual({
			next: expect.objectContaining({ slug: "newest" }),
			previous: expect.objectContaining({ slug: "newer-tie" }),
		});
		expect(getAdjacentPosts(posts, "unrelated").next).toBeUndefined();
		expect(getAdjacentPosts(posts, "older-tie").previous).toBeUndefined();
		expect(getAdjacentPosts(posts, "missing")).toEqual({
			next: undefined,
			previous: undefined,
		});
	});
});
