import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

import sharp from "sharp";

import { serializeAtom, serializeRss } from "../src/lib/content/feed.ts";
import { getAllPosts } from "../src/lib/content/posts.ts";
import { serializeLlmsFull, serializeLlmsIndex } from "../src/lib/content/llms.ts";
import { getTaxonomy } from "../src/lib/content/taxonomy.ts";
import { renderMarkdown } from "../src/lib/markdown/index.ts";
import { albums } from "../src/lib/showcase/content.ts";
import { absoluteUrl, siteConfig } from "../src/lib/site.ts";

const root = process.cwd();
const generatedRoot = path.join(root, "src", "generated");
const postPagesRoot = path.join(generatedRoot, "post-pages");
const publicRoot = path.join(root, "public");
const backgroundPath = path.join(
  publicRoot,
  "assets",
  "brand",
  "xinvstar-night-orbit-og.png",
);

const baseRoutes = [
  "/",
  "/about/",
  "/albums/",
  "/archive/",
  "/devices/",
  "/diary/",
  "/friends/",
  "/projects/",
  "/search/",
  "/skills/",
  "/timeline/",
] as const;

type SitemapEntry = {
  changeFrequency: "weekly" | "monthly";
  lastModified?: string;
  priority: number;
  url: string;
};

function xmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function encodeSegment(value: string): string {
  return encodeURIComponent(value);
}

function textLines(value: string, width: number, maxLines: number): string[] {
  const characters = Array.from(value.trim());
  const lines: string[] = [];
  while (characters.length && lines.length < maxLines) {
    const part = characters.splice(0, width).join("");
    lines.push(part);
  }
  if (characters.length && lines.length) {
    const finalLine = Array.from(lines.at(-1) ?? "");
    finalLine[finalLine.length - 1] = "…";
    lines[lines.length - 1] = finalLine.join("");
  }
  return lines.length ? lines : [""];
}

function createOgSvg(
  title: string,
  published: string,
  backgroundData: string,
): string {
  const lines = textLines(title, 18, 2);
  const titleSpans = lines
    .map((line, index) =>
      `<tspan x="84" dy="${index === 0 ? 0 : 78}">${xmlEscape(line)}</tspan>`,
    )
    .join("");
  const titleSize = Array.from(title).length > 23 ? 56 : 64;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="shade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#080b18" stop-opacity=".97" />
      <stop offset=".72" stop-color="#080b18" stop-opacity=".70" />
      <stop offset="1" stop-color="#080b18" stop-opacity=".28" />
    </linearGradient>
  </defs>
  <image href="${backgroundData}" x="0" y="0" width="1200" height="630" preserveAspectRatio="xMidYMid slice" />
  <rect x="0" y="0" width="1200" height="630" fill="#080b18" fill-opacity=".18" />
  <rect x="0" y="0" width="1200" height="630" fill="url(#shade)" />
  <ellipse cx="1030" cy="320" rx="172" ry="55" fill="none" stroke="#78adff" stroke-opacity=".52" stroke-width="2" transform="rotate(-22 1030 320)" />
  <circle cx="1117" cy="254" r="8" fill="#f2bd71" />
  <text x="84" y="118" fill="#f2bd71" font-family="Noto Sans CJK SC, Noto Sans, Arial, sans-serif" font-size="30" font-weight="700" letter-spacing="2">${xmlEscape(siteConfig.title)}</text>
  <text x="84" y="272" fill="#fff8e8" font-family="Noto Sans CJK SC, Noto Sans, Arial, sans-serif" font-size="${titleSize}" font-weight="700">${titleSpans}</text>
  <text x="84" y="532" fill="#d4d7e4" font-family="Noto Sans CJK SC, Noto Sans, Arial, sans-serif" font-size="27">${xmlEscape(published.slice(0, 10))} · 夜航问讯站</text>
</svg>`;
}

async function writeSitemap(entries: SitemapEntry[]): Promise<void> {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries
    .map((entry) => {
      const lastModified = entry.lastModified
        ? `\n    <lastmod>${xmlEscape(entry.lastModified)}</lastmod>`
        : "";
      return `  <url>\n    <loc>${xmlEscape(entry.url)}</loc>${lastModified}\n    <changefreq>${entry.changeFrequency}</changefreq>\n    <priority>${entry.priority.toFixed(1)}</priority>\n  </url>`;
    })
    .join("\n")}\n</urlset>\n`;
  await writeFile(path.join(publicRoot, "sitemap.xml"), xml);
}

async function generate(): Promise<void> {
  const allPosts = await getAllPosts({ includeDrafts: true });
  const posts = allPosts.filter((post) => !post.draft);
  const taxonomy = getTaxonomy(posts);
  const background = await readFile(backgroundPath);
  const backgroundData = `data:image/png;base64,${background.toString("base64")}`;
  const renderedHtmlBySlug = new Map<string, string>();

  await rm(postPagesRoot, { recursive: true, force: true });
  await mkdir(postPagesRoot, { recursive: true });
  await mkdir(publicRoot, { recursive: true });

  const summaries = [];
  for (const post of posts) {
    const dataFile = `${createHash("sha256").update(post.slug).digest("hex").slice(0, 16)}.json`;
    const rendered = await renderMarkdown(post.body);
    renderedHtmlBySlug.set(post.slug, rendered.html);
    const generatedPost = {
      ...post,
      published: post.published.toISOString(),
      updated: post.updated?.toISOString(),
      html: rendered.html,
      headings: rendered.headings,
      hasMermaid: rendered.hasMermaid,
    };
    await writeFile(
      path.join(postPagesRoot, dataFile),
      `${JSON.stringify(generatedPost)}\n`,
      "utf8",
    );
    summaries.push({
      ...post,
      published: post.published.toISOString(),
      updated: post.updated?.toISOString(),
      dataFile,
    });

    const ogDirectory = path.join(publicRoot, "posts", post.slug);
    await mkdir(ogDirectory, { recursive: true });
    const ogPng = await sharp(Buffer.from(createOgSvg(
      post.title,
      post.published.toISOString(),
      backgroundData,
    )))
      .png()
      .toBuffer();
    await writeFile(path.join(ogDirectory, "opengraph-image"), ogPng);
  }

  const routePaths = [
    ...baseRoutes,
    ...albums.map((album) => `/albums/${encodeSegment(album.slug)}/`),
    ...taxonomy.categories.map(
      (category) => `/categories/${encodeSegment(category.slug)}/`,
    ),
    ...taxonomy.tags.map((tag) => `/tags/${encodeSegment(tag.slug)}/`),
    ...posts.map((post) => `/posts/${encodeSegment(post.slug)}/`),
  ].filter((route, index, routes) => routes.indexOf(route) === index);

  await writeFile(
    path.join(generatedRoot, "site-index.json"),
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        sourceFileCount: allPosts.length,
        publishedCount: posts.length,
        draftCount: allPosts.length - posts.length,
        posts: summaries,
        taxonomy,
        routePaths,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  const staticSitemapEntries: SitemapEntry[] = [
    { changeFrequency: "weekly", priority: 1, url: siteConfig.url },
    ...(["/archive/", "/search/"] as const).map((pathname) => ({
      changeFrequency: "weekly" as const,
      priority: 0.6,
      url: absoluteUrl(pathname),
    })),
    ...(
      [
        "/about/",
        "/projects/",
        "/timeline/",
        "/skills/",
        "/friends/",
        "/devices/",
        "/diary/",
        "/albums/",
      ] as const
    ).map((pathname) => ({
      changeFrequency: "monthly" as const,
      priority: 0.5,
      url: absoluteUrl(pathname),
    })),
    ...albums.map((album) => ({
      changeFrequency: "monthly" as const,
      priority: 0.4,
      url: absoluteUrl(`/albums/${encodeSegment(album.slug)}/`),
    })),
    ...taxonomy.categories.map((category) => ({
      changeFrequency: "weekly" as const,
      priority: 0.6,
      url: absoluteUrl(`/categories/${encodeSegment(category.slug)}/`),
    })),
    ...taxonomy.tags.map((tag) => ({
      changeFrequency: "weekly" as const,
      priority: 0.5,
      url: absoluteUrl(`/tags/${encodeSegment(tag.slug)}/`),
    })),
    ...posts.map((post) => ({
      changeFrequency: "monthly" as const,
      lastModified: post.published.toISOString(),
      priority: 0.8,
      url: absoluteUrl(`/posts/${encodeSegment(post.slug)}/`),
    })),
  ];

  await Promise.all([
    writeFile(path.join(publicRoot, "rss.xml"), await serializeRss(posts, renderedHtmlBySlug), "utf8"),
    writeFile(path.join(publicRoot, "atom.xml"), await serializeAtom(posts, renderedHtmlBySlug), "utf8"),
    writeFile(path.join(publicRoot, "llms.txt"), serializeLlmsIndex(posts), "utf8"),
    writeFile(path.join(publicRoot, "llms-full.txt"), serializeLlmsFull(posts), "utf8"),
    writeFile(
      path.join(publicRoot, "robots.txt"),
      `User-agent: *\nAllow: /\nSitemap: ${absoluteUrl("/sitemap.xml")}\n`,
      "utf8",
    ),
    writeSitemap(staticSitemapEntries),
  ]);

  console.info(
    JSON.stringify({
      contentSourceFiles: allPosts.length,
      publishedPosts: posts.length,
      drafts: allPosts.length - posts.length,
      categories: taxonomy.categories.length,
      tags: taxonomy.tags.length,
      albums: albums.length,
      prerenderRoutes: routePaths.length,
      ogImages: posts.length,
      staticEndpoints: 6,
    }),
  );
}

try {
  await generate();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
