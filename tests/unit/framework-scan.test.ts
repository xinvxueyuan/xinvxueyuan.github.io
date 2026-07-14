import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { findLegacyFrameworkResidue } from "../../scripts/verify-mvp.mts";

describe("MVP framework boundary", () => {
	it("contains no Astro or Svelte runtime residue", async () => {
		await expect(findLegacyFrameworkResidue(process.cwd())).resolves.toEqual([]);
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
