import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
	findEagerDiscoveryImports,
	findLegacyFrameworkResidue,
} from "../../scripts/verify-mvp.mts";

describe("MVP framework boundary", () => {
	it("keeps Pages CMS aligned with the canonical post contract", async () => {
		const configuration = JSON.parse(
			await readFile(new URL("../../.pages.yml", import.meta.url), "utf8"),
		) as {
			content: Array<{
				fields: Array<{ fields?: Array<{ name: string }>; name: string }>;
				path: string;
			}>;
			media: { input: string; output: string };
		};
		const posts = configuration.content.find(
			(collection) => collection.path === "src/content/posts",
		);

		expect(configuration.media).toEqual({
			input: "public/uploads",
			output: "/uploads/",
		});
		expect(posts?.fields.map(({ name }) => name)).toEqual([
			"title",
			"description",
			"published",
			"updated",
			"draft",
			"tags",
			"category",
			"cover",
			"comment",
			"body",
		]);
		expect(
			posts?.fields.find(({ name }) => name === "cover")?.fields?.map(
				({ name }) => name,
			),
		).toEqual(["src", "alt", "width", "height"]);
	});

	it("contains no Astro or Svelte runtime residue", async () => {
		await expect(findLegacyFrameworkResidue(process.cwd())).resolves.toEqual([]);
	});

	it("keeps Mermaid and Pagefind out of eager source imports", async () => {
		await expect(findEagerDiscoveryImports(process.cwd())).resolves.toEqual([]);
	});

	it("detects legacy framework names inside deployment configuration", async () => {
		const root = await mkdtemp(path.join(os.tmpdir(), "mvp-framework-scan-"));
		try {
			await mkdir(path.join(root, "src"));
			await writeFile(
				path.join(root, "package.json"),
				JSON.stringify({ dependencies: {} }),
			);
			await writeFile(
				path.join(root, "vercel.json"),
				JSON.stringify({ framework: "astro" }),
			);

			await expect(findLegacyFrameworkResidue(root)).resolves.toContain(
				"config reference: vercel.json",
			);
		} finally {
			await rm(root, { force: true, recursive: true });
		}
	});

	it("detects legacy framework plugins in root dotfiles", async () => {
		const root = await mkdtemp(path.join(os.tmpdir(), "mvp-framework-scan-"));
		try {
			await mkdir(path.join(root, "src"));
			await writeFile(
				path.join(root, "package.json"),
				JSON.stringify({ dependencies: {} }),
			);
			await writeFile(
				path.join(root, ".prettierrc"),
				JSON.stringify({ plugins: ["prettier-plugin-astro"] }),
			);

			await expect(findLegacyFrameworkResidue(root)).resolves.toContain(
				"config reference: .prettierrc",
			);
		} finally {
			await rm(root, { force: true, recursive: true });
		}
	});

	it("serializes static generation for low-memory CI runners", async () => {
		const nextConfig = await readFile("next.config.ts", "utf8");

		expect(nextConfig).toContain("cpus: 1");
		expect(nextConfig).toContain("staticGenerationMaxConcurrency: 1");
		expect(nextConfig).toContain("staticGenerationMinPagesPerWorker: 40");
	});
});
