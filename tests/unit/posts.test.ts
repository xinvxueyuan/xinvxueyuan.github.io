import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { getAllPosts, getPost, getPublishedPosts } from "../../src/lib/posts";

const fixtureDirectories: string[] = [];

async function createFixture(files: Record<string, string>): Promise<string> {
	const directory = await mkdtemp(path.join(os.tmpdir(), "xinvstar-posts-"));
	fixtureDirectories.push(directory);

	for (const [relativePath, source] of Object.entries(files)) {
		const file = path.join(directory, relativePath);
		await mkdir(path.dirname(file), { recursive: true });
		await writeFile(file, source, "utf8");
	}

	return directory;
}

function postSource(
	title: string,
	published: string,
	options: { draft?: boolean; extra?: string } = {},
): string {
	return `---\ntitle: ${title}\npublished: ${published}\ndraft: ${options.draft ?? false}\n${options.extra ?? ""}---\n\nBody for ${title}.\n`;
}

afterEach(async () => {
	await Promise.all(
		fixtureDirectories
			.splice(0)
			.map((directory) =>
				rm(directory, { force: true, recursive: true }),
			),
	);
});

describe("MVP post API", () => {
	it("recursively loads Markdown into the discovery post model", async () => {
		const directory = await createFixture({
			"notes/Hello World.md": postSource("Hello", "2026-01-02", {
				extra: "description: A short note\nupdated: 2026-07-14\nimage: /legacy.webp\ntags:\n  - Next.js\n  - React\ncategory: 工程\ncomment: true\ncover:\n  src: /cover.webp\n  alt: Night sky\n  width: 1200\n  height: 630\npinned: true\n",
			}),
			"ignored.txt": "not a post",
		});

		const [post] = await getAllPosts({ directory, includeDrafts: true });

		expect(post).toEqual({
			body: "\nBody for Hello.\n",
			category: "工程",
			comment: true,
			cover: {
				alt: "Night sky",
				height: 630,
				src: "/cover.webp",
				width: 1200,
			},
			description: "A short note",
			draft: false,
			published: new Date("2026-01-02T00:00:00.000Z"),
			slug: "notes-hello-world",
			sourcePath: "notes/Hello World.md",
			tags: ["Next.js", "React"],
			title: "Hello",
			updated: new Date("2026-07-14T00:00:00.000Z"),
		});
	});

	it("defaults comments on while ignoring legacy frontmatter keys", async () => {
		const directory = await createFixture({
			"legacy.md": postSource("Legacy", "2026-01-02", {
				extra: "image: /legacy.webp\npinned: true\npassword: secret\n",
			}),
		});

		const [post] = await getAllPosts({ directory, includeDrafts: true });

		expect(post.comment).toBe(true);
		expect(post).not.toHaveProperty("image");
		expect(post).not.toHaveProperty("pinned");
		expect(post).not.toHaveProperty("password");
	});

	it("keeps the temporary legacy module type-compatible without restoring image parsing", async () => {
		const directory = await createFixture({
			"legacy.md": postSource("Legacy", "2026-01-02", {
				extra: "image: /legacy.webp\n",
			}),
		});
		const [post] = await getAllPosts({ directory, includeDrafts: true });
		const readLegacyImage = (
			legacyPost: Awaited<ReturnType<typeof getAllPosts>>[number],
		) => legacyPost.image;

		expect(readLegacyImage(post)).toBeUndefined();
		expect(post).not.toHaveProperty("image");
	});

	it("filters drafts by default and includes them only when requested", async () => {
		const directory = await createFixture({
			"draft.md": postSource("Draft", "2026-01-03", { draft: true }),
			"published.md": postSource("Published", "2026-01-02"),
		});

		expect(
			(await getAllPosts({ directory })).map((post) => post.title),
		).toEqual(["Published"]);
		expect(
			(await getAllPosts({ directory, includeDrafts: true })).map(
				(post) => post.title,
			),
		).toEqual(["Draft", "Published"]);
	});

	it("sorts posts by publication date descending with a stable slug tie-breaker", async () => {
		const directory = await createFixture({
			"z-last.md": postSource("Z", "2026-01-02"),
			"a-first.md": postSource("A", "2026-01-02"),
			"old.md": postSource("Old", "2025-12-31"),
		});

		expect(
			(await getAllPosts({ directory })).map((post) => post.slug),
		).toEqual(["a-first", "z-last", "old"]);
	});

	it("creates unique GitHub-style slugs without preserving legacy index routes", async () => {
		const directory = await createFixture({
			"Hello!.md": postSource("First", "2026-01-01"),
			"hello.md": postSource("Second", "2026-01-02"),
			"Guide/index.md": postSource("Guide", "2026-01-03"),
		});

		const posts = await getAllPosts({ directory });

		expect(posts.map((post) => post.slug)).toEqual([
			"guide-index",
			"hello-1",
			"hello",
		]);
		expect(new Set(posts.map((post) => post.slug)).size).toBe(posts.length);
	});

	it("assigns duplicate slug suffixes in source-path order, not I/O completion order", async () => {
		const slowFirstSource = `${postSource("Slow first", "2026-01-01")}\n${"x".repeat(8_000_000)}`;
		const directory = await createFixture({
			"Hello!.md": slowFirstSource,
			"hello.md": postSource("Fast second", "2026-01-02"),
		});

		const posts = await getAllPosts({ directory });
		const slugsBySource = Object.fromEntries(
			posts.map((post) => [post.sourcePath, post.slug]),
		);

		expect(slugsBySource).toEqual({
			"Hello!.md": "hello",
			"hello.md": "hello-1",
		});
	});

	it("keeps fallback slugs unique when filenames contain only punctuation", async () => {
		const directory = await createFixture({
			"!!!.md": postSource("First", "2026-01-01"),
			"???.md": postSource("Second", "2026-01-02"),
		});

		expect(
			(await getAllPosts({ directory })).map((post) => post.slug),
		).toEqual(["post-1", "post"]);
	});

	it.each([
		["null", "null"],
		["boolean", "true"],
		["number", "123"],
		["invalid date", '"not-a-date"'],
		["overflow date", '"2026-02-31"'],
		["unquoted overflow date", "2026-02-31"],
		["datetime", "2026-01-02T03:04:05Z"],
		["numeric date string", '"123"'],
		["ambiguous date", '"01/02/03"'],
		["padded date", '" 2026-01-02 "'],
	])("rejects published values with %s input", async (label, published) => {
		const sourcePath = `invalid-${label.replaceAll(" ", "-")}.md`;
		const directory = await createFixture({
			[sourcePath]: `---\ntitle: Invalid date\npublished: ${published}\n---\n\nBody\n`,
		});

		await expect(
			getAllPosts({ directory, includeDrafts: true }),
		).rejects.toThrow(new RegExp(`${sourcePath}[\\s\\S]*published`, "u"));
	});

	it.each(["2026-02-31", "2026-01-02T03:04:05Z", '" 2026-01-02 "'])(
		"rejects non-calendar updated value %s with source diagnostics",
		async (updated) => {
			const directory = await createFixture({
				"invalid-updated.md": postSource(
					"Invalid updated",
					"2026-01-02",
					{
						extra: `updated: ${updated}\n`,
					},
				),
			});

			await expect(
				getAllPosts({ directory, includeDrafts: true }),
			).rejects.toThrow(/invalid-updated\.md[\s\S]*updated/iu);
		},
	);

	it("rejects partial structured covers with source diagnostics", async () => {
		const directory = await createFixture({
			"partial-cover.md": postSource("Partial cover", "2026-01-02", {
				extra: "cover:\n  src: /cover.webp\n  alt: Missing dimensions\n",
			}),
		});

		await expect(
			getAllPosts({ directory, includeDrafts: true }),
		).rejects.toThrow(/partial-cover\.md[\s\S]*cover/iu);
	});

	it("accepts exact unquoted and quoted calendar dates", async () => {
		const directory = await createFixture({
			"yaml-date.md": postSource("YAML Date", "2026-01-02"),
			"date-string.md": postSource("Date string", '"2024-02-29"'),
		});

		const posts = await getAllPosts({ directory });

		expect(posts.map((post) => post.published)).toEqual([
			new Date("2026-01-02T00:00:00.000Z"),
			new Date("2024-02-29T00:00:00.000Z"),
		]);
	});

	it("rejects posts missing required frontmatter", async () => {
		const directory = await createFixture({
			"nested/invalid.md":
				"---\ndescription: Missing title and date\n---\n\nBody\n",
		});

		await expect(
			getAllPosts({ directory, includeDrafts: true }),
		).rejects.toThrow(/nested\/invalid\.md[\s\S]*(?:title|published)/u);
	});

	it("includes the source path when YAML parsing fails", async () => {
		const directory = await createFixture({
			"nested/broken-yaml.md":
				"---\ntitle: Broken\npublished: [unterminated\n---\n\nBody\n",
		});

		await expect(
			getAllPosts({ directory, includeDrafts: true }),
		).rejects.toThrow(
			/nested\/broken-yaml\.md[\s\S]*(?:unexpected|flow collection)/iu,
		);
	});

	it("generates stable slugs for Chinese and mixed-language paths", async () => {
		const directory = await createFixture({
			"中文目录/你好 Next.js 指南.md": postSource(
				"Mixed language",
				"2026-01-02",
			),
			"纯中文文章.md": postSource("Chinese", "2026-01-01"),
		});

		expect(
			(await getAllPosts({ directory })).map((post) => post.slug),
		).toEqual(["中文目录-你好-nextjs-指南", "纯中文文章"]);
	});

	it("looks up only published posts and returns undefined for unknown slugs", async () => {
		const directory = await createFixture({
			"draft.md": postSource("Draft", "2026-01-03", { draft: true }),
			"visible.md": postSource("Visible", "2026-01-02"),
		});

		expect((await getPost("visible", { directory }))?.title).toBe(
			"Visible",
		);
		expect(await getPost("draft", { directory })).toBeUndefined();
		expect(await getPost("missing", { directory })).toBeUndefined();
	});

	it("loads the current article corpus as a smoke check", async () => {
		const posts = await getPublishedPosts();
		const slugs = posts.map((post) => post.slug);

		expect(posts.length).toBeGreaterThan(0);
		expect(new Set(slugs).size).toBe(slugs.length);
		expect(slugs.every((slug) => slug.length > 0)).toBe(true);
		expect(
			posts.every(
				(post) =>
					post.title.length > 0 &&
					!Number.isNaN(post.published.getTime()) &&
					post.sourcePath.endsWith(".md"),
			),
		).toBe(true);
	});
});
