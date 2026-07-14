import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import GithubSlugger, { slug as githubSlug } from "github-slugger";
import matter from "gray-matter";
import { z } from "zod";

export type Post = {
	slug: string;
	sourcePath: string;
	title: string;
	published: Date;
	description?: string;
	draft: boolean;
	image?: string;
	tags: string[];
	body: string;
};

export type GetAllPostsOptions = {
	/** Test seam for exercising the repository against an isolated corpus. */
	directory?: string;
	includeDrafts?: boolean;
};

const DEFAULT_POSTS_DIRECTORY = path.join(
	process.cwd(),
	"src",
	"content",
	"posts",
);

const dateStringSchema = z
	.string()
	.min(1)
	.transform((value, context) => {
		const match = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(value);
		if (!match) {
			context.addIssue({
				code: "custom",
				message: "Expected an exact YYYY-MM-DD calendar date",
			});
			return z.NEVER;
		}

		const [, yearText, monthText, dayText] = match;
		const year = Number(yearText);
		const month = Number(monthText);
		const day = Number(dayText);
		const date = new Date(0);
		date.setUTCHours(0, 0, 0, 0);
		date.setUTCFullYear(year, month - 1, day);

		if (
			date.getUTCFullYear() !== year ||
			date.getUTCMonth() !== month - 1 ||
			date.getUTCDate() !== day
		) {
			context.addIssue({
				code: "custom",
				message: "Invalid calendar date",
			});
			return z.NEVER;
		}
		return date;
	});

const frontmatterSchema = z.object({
	title: z.string().min(1),
	description: z.string().optional(),
	draft: z.boolean().optional().default(false),
	image: z.string().optional(),
	tags: z.array(z.string()).optional().default([]),
});

function parsePublishedFromRawFrontmatter(frontmatter: string): Date {
	const match = /^published:[ \t]*(.*)$/mu.exec(frontmatter);
	if (!match) {
		throw new Error("published: Required");
	}

	let value = match[1].trimEnd();
	if (
		(value.startsWith('"') && value.endsWith('"')) ||
		(value.startsWith("'") && value.endsWith("'"))
	) {
		value = value.slice(1, -1);
	}

	const result = dateStringSchema.safeParse(value);
	if (!result.success) {
		throw new Error(`published: ${result.error.message}`, {
			cause: result.error,
		});
	}
	return result.data;
}

async function listMarkdownFiles(directory: string): Promise<string[]> {
	const files: string[] = [];

	async function visit(currentDirectory: string): Promise<void> {
		const entries = await readdir(currentDirectory, {
			withFileTypes: true,
		});
		for (const entry of entries.sort((left, right) =>
			left.name.localeCompare(right.name),
		)) {
			const target = path.join(currentDirectory, entry.name);
			if (entry.isDirectory()) await visit(target);
			else if (entry.isFile() && entry.name.endsWith(".md"))
				files.push(target);
		}
	}

	await visit(directory);
	return files;
}

function sourcePathFor(file: string, directory: string): string {
	return path.relative(directory, file).split(path.sep).join("/");
}

function slugSourceFor(sourcePath: string): string {
	return sourcePath.replace(/\.md$/u, "").replaceAll("/", "-");
}

function uniqueSlugFor(sourcePath: string, slugger: GithubSlugger): string {
	const normalized = githubSlug(slugSourceFor(sourcePath)) || "post";
	return slugger.slug(normalized);
}

export async function getAllPosts(
	options: GetAllPostsOptions = {},
): Promise<Post[]> {
	const directory = options.directory ?? DEFAULT_POSTS_DIRECTORY;
	const slugger = new GithubSlugger();
	const parsedPosts = await Promise.all(
		(await listMarkdownFiles(directory)).map(async (file) => {
			const sourcePath = sourcePathFor(file, directory);
			try {
				// Passing options disables gray-matter's lossy object cache, which
				// omits the non-enumerable raw `matter` field on cache hits.
				const parsed = matter(await readFile(file, "utf8"), {});
				const data = frontmatterSchema.parse(parsed.data);
				const published = parsePublishedFromRawFrontmatter(parsed.matter);

				return {
					body: parsed.content,
					data,
					published,
					sourcePath,
				};
			} catch (error) {
				const cause =
					error instanceof Error ? error : new Error(String(error));
				throw new Error(
					`Failed to load post ${sourcePath}: ${cause.message}`,
					{
						cause,
					},
				);
			}
		}),
	);
	const posts = parsedPosts.map(({ body, data, published, sourcePath }): Post => ({
		body,
		description: data.description,
		draft: data.draft,
		image: data.image,
		published,
		slug: uniqueSlugFor(sourcePath, slugger),
		sourcePath,
		tags: data.tags,
		title: data.title,
	}));

	return posts
		.filter((post) => options.includeDrafts || !post.draft)
		.sort(
			(left, right) =>
				right.published.getTime() - left.published.getTime() ||
				left.slug.localeCompare(right.slug),
		);
}

export async function getPublishedPosts(): Promise<Post[]> {
	return getAllPosts();
}

export async function getPost(
	slug: string,
	options: Pick<GetAllPostsOptions, "directory"> = {},
): Promise<Post | undefined> {
	return (await getAllPosts(options)).find((post) => post.slug === slug);
}
