import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

type PackageManifest = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

const forbiddenDependency = /^(?:next|nuxt|react|react-dom|@vitejs\/plugin-react|@next\/|@nuxt\/|eslint-config-next|eslint-plugin-react)/iu;
const frameworkImport = /(?:from\s*|import\s*\(\s*|require\s*\(\s*)["'](?:next(?:\/|["'])|nuxt(?:\/|["'])|react(?:-dom)?(?:\/|["']))/iu;
const sourceExtensions = new Set([".js", ".jsx", ".mjs", ".mts", ".ts", ".tsx", ".vue"]);
const forbiddenExtensions = new Set([".jsx", ".tsx", ".astro", ".svelte"]);
const staticMermaidImport = /^\s*import\s+(?!type\b)(?:(?:[^"']+?\s+from\s+)?["'])mermaid["']/mu;
const staticPhotoSwipeImport = /^\s*import\s+(?!type\b)(?:(?:[^"']+?\s+from\s+)?["'])photoswipe(?:\/lightbox)?["']/mu;
const configurationFiles = [
  "package.json",
  "pnpm-workspace.yaml",
  "vercel.json",
  "vite.config.ts",
  "eslint.config.mjs",
  "vitest.config.ts",
  "playwright.config.ts",
  "tsconfig.json",
  "Taskfile.yml",
];

async function walk(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true }).catch(() => []);
  const files: string[] = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(target)));
    else if (entry.isFile()) files.push(target);
  }
  return files;
}

function relativePath(root: string, file: string): string {
  return path.relative(root, file).split(path.sep).join("/");
}

export async function findLegacyFrameworkResidue(root: string): Promise<string[]> {
  const findings: string[] = [];
  const manifest = JSON.parse(await readFile(path.join(root, "package.json"), "utf8")) as PackageManifest;
  const dependencies = {
    ...manifest.dependencies,
    ...manifest.devDependencies,
  };

  for (const name of Object.keys(dependencies)) {
    if (forbiddenDependency.test(name)) findings.push(`forbidden dependency: ${name}`);
  }
  if (!("vue" in dependencies)) findings.push("missing Vue 3 runtime dependency");
  if (!("@kungal/ui-vue" in dependencies)) findings.push("missing Kun UI standalone Vue package");

  for (const file of await walk(path.join(root, "src"))) {
    const extension = path.extname(file);
    if (!sourceExtensions.has(extension)) continue;
    const relative = relativePath(root, file);
    if (forbiddenExtensions.has(extension)) {
      findings.push(`non-Vue component source: ${relative}`);
      continue;
    }
    const contents = await readFile(file, "utf8");
    if (frameworkImport.test(contents)) findings.push(`framework import: ${relative}`);
  }

  const rootEntries = await readdir(root, { withFileTypes: true });
  for (const entry of rootEntries) {
    if (entry.isFile() && /^(?:next\.config\.|next-env\.d\.ts$|nuxt\.config\.)/iu.test(entry.name)) {
      findings.push(`framework configuration file: ${entry.name}`);
    }
  }

  const files = [
    ...configurationFiles.map((file) => path.join(root, file)),
    ...(await walk(path.join(root, ".github", "workflows"))),
  ];
  for (const file of files) {
    const contents = await readFile(file, "utf8").catch(() => undefined);
    if (contents && /(?:next\.js|next\/|nuxt|react-dom|eslint-config-next|@vitejs\/plugin-react)/iu.test(contents)) {
      findings.push(`configuration reference: ${relativePath(root, file)}`);
    }
  }

  return findings.sort();
}

export async function findEagerDiscoveryImports(root: string): Promise<string[]> {
  const findings: string[] = [];
  for (const file of await walk(path.join(root, "src"))) {
    if (!sourceExtensions.has(path.extname(file))) continue;
    const relative = relativePath(root, file);
    const contents = await readFile(file, "utf8");
    if (staticMermaidImport.test(contents)) findings.push(`eager Mermaid import: ${relative}`);
    if (
      relative !== "src/components/interactive/PagefindSearch.vue" &&
      contents.includes("/pagefind/pagefind.js")
    ) findings.push(`Pagefind reference outside lazy boundary: ${relative}`);
    if (
      relative !== "src/components/interactive/AlbumLightbox.vue" &&
      staticPhotoSwipeImport.test(contents)
    ) findings.push(`eager PhotoSwipe import: ${relative}`);
  }
  return findings.sort();
}

async function main(): Promise<void> {
  const root = process.cwd();
  const findings = [
    ...(await findLegacyFrameworkResidue(root)),
    ...(await findEagerDiscoveryImports(root)),
  ];
  if (findings.length) {
    console.error("Pure Vue framework boundary violations detected:\n");
    console.error(findings.map((finding) => `- ${finding}`).join("\n"));
    process.exitCode = 1;
    return;
  }
  const sources = await walk(path.join(root, "src"));
  const vueFiles = sources.filter((file) => file.endsWith(".vue")).length;
  console.info(`Pure Vue boundary passed: ${vueFiles} Vue SFC files; no Nuxt, Next.js, React or eager discovery imports.`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) await main();
