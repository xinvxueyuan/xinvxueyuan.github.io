import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const root = process.cwd();
const dist = path.join(root, "dist");
const generatedIndex = JSON.parse(
  await readFile(path.join(root, "src/generated/site-index.json"), "utf8"),
) as {
  sourceFileCount: number;
  publishedCount: number;
  draftCount: number;
  posts: { slug: string }[];
  routePaths: string[];
};
const baselineRoutes = JSON.parse(
  await readFile(path.join(root, "docs/migration/baseline-next-prerender-routes.json"), "utf8"),
) as { routes: string[] };
const expectedHashes = JSON.parse(
  await readFile(path.join(root, "docs/migration/baseline-markdown-sha256.json"), "utf8"),
) as Record<string, string>;

const internalNextErrorRoutes = new Set(["/_global-error", "/_not-found"]);
const endpointPaths = [
  "/atom.xml",
  "/rss.xml",
  "/llms.txt",
  "/llms-full.txt",
  "/robots.txt",
  "/sitemap.xml",
];

function normalizeUrl(value: string): string {
  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    // Keep malformed percent signs as literal path content.
  }
  if (decoded.length > 1 && decoded.endsWith("/")) return decoded.slice(0, -1);
  return decoded;
}

async function listFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(fullPath) : [fullPath];
  }));
  return files.flat();
}

async function assertFile(filePath: string, label: string): Promise<void> {
  try {
    const details = await stat(filePath);
    if (!details.isFile() || details.size === 0) throw new Error("empty or not a file");
  } catch (error) {
    throw new Error(`${label} missing or invalid: ${path.relative(root, filePath)}`, { cause: error });
  }
}

const publicBaselinePaths = baselineRoutes.routes
  .filter((route) => !internalNextErrorRoutes.has(route))
  .map(normalizeUrl);
const expectedPublicSet = new Set(publicBaselinePaths);
const generatedPageSet = new Set(generatedIndex.routePaths.map(normalizeUrl));
const generatedOgPaths = generatedIndex.posts.map(
  (post) => normalizeUrl(`/posts/${post.slug}/opengraph-image`),
);
const actualPublicSet = new Set([
  ...generatedPageSet,
  ...generatedOgPaths,
  ...endpointPaths.map(normalizeUrl),
]);
const missingPublicUrls = [...expectedPublicSet].filter((url) => !actualPublicSet.has(url)).sort();
const unexpectedPublicUrls = [...actualPublicSet].filter((url) => !expectedPublicSet.has(url)).sort();

const allOutputFiles = await listFiles(dist);
const htmlFiles = allOutputFiles.filter((file) => path.basename(file) === "index.html");
const actualHtmlRoutes = new Set(htmlFiles.map((file) => {
  const directory = path.relative(dist, path.dirname(file)).split(path.sep).join("/");
  if (directory === ".") return "/";
  return normalizeUrl(`/${directory}/`);
}));
const missingHtmlRoutes = [...generatedPageSet].filter((route) => !actualHtmlRoutes.has(route)).sort();
const unexpectedHtmlRoutes = [...actualHtmlRoutes].filter((route) => !generatedPageSet.has(route)).sort();

const missingFiles: string[] = [];
for (const endpoint of endpointPaths) {
  const file = path.join(dist, endpoint.slice(1));
  try { await assertFile(file, endpoint); } catch { missingFiles.push(endpoint); }
}
for (const post of generatedIndex.posts) {
  const file = path.join(dist, "posts", post.slug, "opengraph-image");
  try {
    await assertFile(file, `/posts/${post.slug}/opengraph-image`);
    const metadata = await sharp(file).metadata();
    if (metadata.format !== "png" || metadata.width !== 1200 || metadata.height !== 630) {
      throw new Error(`Unexpected OG metadata for ${post.slug}: ${JSON.stringify(metadata)}`);
    }
  } catch {
    missingFiles.push(`/posts/${post.slug}/opengraph-image`);
  }
}
await assertFile(path.join(dist, "404.html"), "404.html");
await assertFile(path.join(dist, "pagefind", "pagefind.js"), "Pagefind runtime");

const markdownDirectory = path.join(root, "src/content/posts");
const markdownFiles = (await listFiles(markdownDirectory)).filter((file) => file.endsWith(".md"));
const actualHashes: Record<string, string> = {};
for (const file of markdownFiles) {
  const relative = path.relative(root, file).split(path.sep).join("/");
  actualHashes[relative] = createHash("sha256").update(await readFile(file)).digest("hex");
}
const missingMarkdown = Object.keys(expectedHashes).filter((file) => !(file in actualHashes));
const changedMarkdown = Object.entries(expectedHashes)
  .filter(([file, expected]) => actualHashes[file] !== expected)
  .map(([file]) => file);
const unexpectedMarkdown = Object.keys(actualHashes).filter((file) => !(file in expectedHashes));

const report = {
  baselineRouteRecords: baselineRoutes.routes.length,
  nextInternalErrorRoutesExcluded: [...internalNextErrorRoutes],
  expectedPublicUrls: expectedPublicSet.size,
  generatedPublicUrls: actualPublicSet.size,
  missingPublicUrls,
  unexpectedPublicUrls,
  generatedHtmlRoutes: generatedPageSet.size,
  actualHtmlFiles: actualHtmlRoutes.size,
  missingHtmlRoutes,
  unexpectedHtmlRoutes,
  publishedPosts: generatedIndex.publishedCount,
  draftPosts: generatedIndex.draftCount,
  contentSourceFiles: generatedIndex.sourceFileCount,
  markdownFiles: markdownFiles.length,
  expectedMarkdownHashes: Object.keys(expectedHashes).length,
  missingMarkdown,
  changedMarkdown,
  unexpectedMarkdown,
  ogImages: generatedOgPaths.length,
  staticEndpoints: endpointPaths.length,
  missingOutputFiles: missingFiles,
  static404: "dist/404.html",
};
console.info(JSON.stringify(report, null, 2));

if (
  baselineRoutes.routes.length !== 199 ||
  expectedPublicSet.size !== 197 ||
  generatedIndex.routePaths.length !== 153 ||
  actualHtmlRoutes.size !== generatedIndex.routePaths.length ||
  missingPublicUrls.length ||
  unexpectedPublicUrls.length ||
  missingHtmlRoutes.length ||
  unexpectedHtmlRoutes.length ||
  missingFiles.length ||
  generatedIndex.sourceFileCount !== 39 ||
  generatedIndex.publishedCount !== 38 ||
  generatedIndex.draftCount !== 1 ||
  markdownFiles.length !== 39 ||
  missingMarkdown.length ||
  changedMarkdown.length ||
  unexpectedMarkdown.length
) {
  process.exitCode = 1;
}
