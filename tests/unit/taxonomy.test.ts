import { describe, expect, it, vi } from "vitest";

import type { PostSummary } from "../../src/lib/content/posts";
import {
	getTaxonomy,
	getTaxonomyTermSlug,
} from "../../src/lib/content/taxonomy";

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

describe("content taxonomy", () => {
	it("normalizes and deduplicates labels, orders counts, groups years, and excludes drafts", () => {
		const taxonomy = getTaxonomy([
			summary("new", "2026-07-02T00:00:00.000Z", {
				category: " 工程 ",
				tags: ["React", " react ", "Next.js"],
			}),
			summary("old", "2025-01-01T00:00:00.000Z", {
				category: "工程",
				tags: ["REACT", "TypeScript"],
			}),
			summary("draft", "2027-01-01T00:00:00.000Z", {
				category: "秘密",
				draft: true,
				tags: ["Hidden"],
			}),
		]);

		expect(taxonomy.tags).toEqual([
			{ count: 2, name: "React", slug: "react" },
			{ count: 1, name: "Next.js", slug: "next-js" },
			{ count: 1, name: "TypeScript", slug: "typescript" },
		]);
		expect(taxonomy.categories).toEqual([
			{ count: 2, name: "工程", slug: "工程" },
		]);
		expect(taxonomy.years).toEqual([
			{ count: 1, year: 2026 },
			{ count: 1, year: 2025 },
		]);
	});

	it("assigns stable unique slugs when distinct labels collide after slugification", () => {
		const first = getTaxonomy([
			summary("dots", "2026-07-02T00:00:00.000Z", {
				category: "API.Design",
				tags: ["Node.js"],
			}),
			summary("dashes", "2026-07-01T00:00:00.000Z", {
				category: "API-Design",
				tags: ["Node-js"],
			}),
		]);
		const reversed = getTaxonomy([
			summary("dashes", "2026-07-01T00:00:00.000Z", {
				category: "API-Design",
				tags: ["Node-js"],
			}),
			summary("dots", "2026-07-02T00:00:00.000Z", {
				category: "API.Design",
				tags: ["Node.js"],
			}),
		]);

		expect(new Set(first.tags.map((term) => term.slug)).size).toBe(2);
		expect(new Set(first.categories.map((term) => term.slug)).size).toBe(2);
		expect(first.tags.map(({ name, slug }) => ({ name, slug }))).toEqual(
			reversed.tags.map(({ name, slug }) => ({ name, slug })),
		);
		expect(getTaxonomyTermSlug("Node.js", first.tags)).not.toBe(
			getTaxonomyTermSlug("Node-js", first.tags),
		);
	});

	it("normalizes taxonomy keys without consulting the host locale", () => {
		const localeLowerCase = vi
			.spyOn(String.prototype, "toLocaleLowerCase")
			.mockImplementation(() => {
				throw new Error("host locale must not affect taxonomy keys");
			});

		try {
			expect(
				getTaxonomy([
					summary("one", "2026-07-02T00:00:00.000Z", {
						tags: ["I", "i"],
					}),
				]).tags,
			).toEqual([{ count: 1, name: "I", slug: "i" }]);
		} finally {
			localeLowerCase.mockRestore();
		}
	});
});
