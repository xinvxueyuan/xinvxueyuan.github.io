import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  findEagerDiscoveryImports,
  findLegacyFrameworkResidue,
} from "../../scripts/verify-vue.mts";

const packageManifest = {
  dependencies: { "@kungal/ui-vue": "2.56.2", vue: "3.5.43" },
};

async function fixture(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "vue-boundary-"));
  await mkdir(path.join(root, "src"), { recursive: true });
  await writeFile(path.join(root, "package.json"), JSON.stringify(packageManifest));
  return root;
}

describe("pure Vue framework boundary", () => {
  it("keeps Pages CMS aligned with the canonical Markdown post contract", async () => {
    const configuration = JSON.parse(await readFile(path.join(process.cwd(), ".pages.yml"), "utf8"));
    expect(configuration.content[0]).toMatchObject({
      filename: "{year}-{month}-{day}-{primary}.md",
      name: "posts",
      path: "src/content/posts",
      type: "collection",
    });
  });

  it("has no legacy framework dependencies or configuration", async () => {
    await expect(findLegacyFrameworkResidue(process.cwd())).resolves.toEqual([]);
    await expect(findEagerDiscoveryImports(process.cwd())).resolves.toEqual([]);
  });

  it("detects Next/Nuxt/React dependencies and imports", async () => {
    const root = await fixture();
    try {
      await writeFile(path.join(root, "package.json"), JSON.stringify({
        dependencies: { vue: "3", "@kungal/ui-vue": "2", nuxt: "4", next: "16", react: "19" },
      }));
      await writeFile(path.join(root, "src", "legacy.ts"), 'import React from "react";');
      const findings = await findLegacyFrameworkResidue(root);
      expect(findings).toContain("forbidden dependency: next");
      expect(findings).toContain("forbidden dependency: nuxt");
      expect(findings).toContain("forbidden dependency: react");
      expect(findings).toContain("framework import: src/legacy.ts");
    } finally {
      await rm(root, { force: true, recursive: true });
    }
  });

  it("rejects JSX/TSX components and Next configuration files", async () => {
    const root = await fixture();
    try {
      await writeFile(path.join(root, "next.config.ts"), "export default {};");
      await writeFile(path.join(root, "src", "legacy.tsx"), "export const Page = () => null;");
      const findings = await findLegacyFrameworkResidue(root);
      expect(findings).toContain("framework configuration file: next.config.ts");
      expect(findings).toContain("non-Vue component source: src/legacy.tsx");
    } finally {
      await rm(root, { force: true, recursive: true });
    }
  });

  it("rejects eager Mermaid, Pagefind and PhotoSwipe imports", async () => {
    const root = await fixture();
    try {
      await writeFile(path.join(root, "src", "eager.ts"), [
        'import "mermaid";',
        'import PhotoSwipe from "photoswipe";',
        'const pagefind = await import("/pagefind/pagefind.js");',
      ].join("\n"));
      expect(await findEagerDiscoveryImports(root)).toEqual([
        "Pagefind reference outside lazy boundary: src/eager.ts",
        "eager Mermaid import: src/eager.ts",
        "eager PhotoSwipe import: src/eager.ts",
      ]);
    } finally {
      await rm(root, { force: true, recursive: true });
    }
  });

  it("allows only the dedicated Vue components to lazy-load Pagefind and PhotoSwipe", async () => {
    const root = await fixture();
    try {
      const searchDirectory = path.join(root, "src", "components", "interactive");
      await mkdir(searchDirectory, { recursive: true });
      await writeFile(path.join(searchDirectory, "PagefindSearch.vue"), 'const pagefind = await import("/pagefind/pagefind.js");');
      await writeFile(path.join(searchDirectory, "AlbumLightbox.vue"), 'const photos = await import("photoswipe/lightbox");');
      await expect(findEagerDiscoveryImports(root)).resolves.toEqual([]);
    } finally {
      await rm(root, { force: true, recursive: true });
    }
  });
});
