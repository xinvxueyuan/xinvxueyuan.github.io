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
		);

		expect(configuration).toEqual({
			content: [
				{
					fields: [
						{ label: "标题", name: "title", required: true, type: "string" },
						{ label: "摘要", name: "description", type: "text" },
						{ label: "发布日期", name: "published", required: true, type: "date" },
						{ label: "更新日期", name: "updated", type: "date" },
						{ default: true, label: "草稿", name: "draft", type: "boolean" },
						{ label: "标签", list: true, name: "tags", type: "string" },
						{ label: "分类", name: "category", type: "string" },
						{
							fields: [
								{ label: "图片", name: "src", required: true, type: "image" },
								{ label: "替代文本", name: "alt", required: true, type: "string" },
								{ label: "宽度", name: "width", required: true, type: "number" },
								{ label: "高度", name: "height", required: true, type: "number" },
							],
							label: "封面",
							name: "cover",
							type: "object",
						},
						{ default: true, label: "开放评论", name: "comment", type: "boolean" },
						{ label: "正文", name: "body", type: "rich-text" },
					],
					filename: "{year}-{month}-{day}-{primary}.md",
					label: "文章",
					name: "posts",
					path: "src/content/posts",
					type: "collection",
					view: { fields: ["title", "published", "category", "draft"] },
				},
			],
			media: { input: "public/uploads", output: "/uploads/" },
		});
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
