import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { close, createIndex } from "pagefind";

import { getPublishedPosts } from "../src/lib/content/posts.ts";
import { getSearchRecords } from "../src/lib/content/search-records.ts";

const outputDirectory = path.join(process.cwd(), "public", "pagefind");

async function buildSearchIndex(): Promise<void> {
	await rm(outputDirectory, { force: true, recursive: true });
	await mkdir(outputDirectory, { recursive: true });

	const created = await createIndex({ forceLanguage: "zh" });
	if (created.errors.length || !created.index) {
		throw new Error(created.errors.join("\n") || "Pagefind did not create an index");
	}

	for (const record of getSearchRecords(await getPublishedPosts())) {
		const result = await created.index.addCustomRecord({
			content: record.content,
			filters: { tags: record.meta.tags },
			language: "zh",
			meta: {
				category: record.meta.category,
				tags: record.meta.tags.join(", "),
				title: record.meta.title,
			},
			url: record.url,
		});
		if (result.errors.length) throw new Error(result.errors.join("\n"));
	}

	const generated = await created.index.getFiles();
	if (generated.errors.length) throw new Error(generated.errors.join("\n"));
	await Promise.all(
		generated.files.map(async (file) => {
			const target = path.join(outputDirectory, file.path);
			await mkdir(path.dirname(target), { recursive: true });
			await writeFile(target, file.content);
		}),
	);
}

try {
	await buildSearchIndex();
} catch (error) {
	console.error(error);
	process.exitCode = 1;
} finally {
	await close();
}
