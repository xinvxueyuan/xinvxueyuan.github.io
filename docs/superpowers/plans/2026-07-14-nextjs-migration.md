# xinvStar Pure Next.js Migration Implementation Plan（已废弃）

> 2026-07-14 用户明确改为破坏性最小博客重写。本计划停止执行；当前计划见 `2026-07-14-nextjs-blog-mvp.md`。

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the production Astro/Svelte blog with a verified pure Next.js App Router implementation while preserving content, historical URLs, feeds, search, specialty pages, and a safe Vercel rollback.

**Architecture:** Next.js 16 statically renders articles and content pages with Server Components, while build-time Route Handlers emit feeds and machine-readable resources. A project-owned Markdown/content layer supplies every route, and a small set of Client Components provides theme, search, navigation, media, and document enhancements.

**Tech Stack:** Next.js 16.2.10, React 19.2.7, TypeScript 6.0.3, Tailwind CSS 4.3.2, Unified/Remark/Rehype, Shiki 4.3.1, Mermaid 11.16.0, MiniSearch 7.2.0, Vitest 4.1.10, Playwright 1.61.1, Vercel, GitHub Actions.

## Global Constraints

- Preserve 38 source posts, 37 published posts, 1 draft, 2 spec pages, 91 tags, 7 categories, 5 years, and 60 content images.
- Preserve the 211 route evidence records, 180 unique URLs, and 98 archive query URLs; any exception requires an explicit 308 manifest entry.
- Preserve article bodies and Frontmatter values; do not convert `.md` files to `.mdx`.
- Use App Router and Server Components by default; every `use client` boundary needs a browser capability reason.
- Keep the representative article-page initial first-party JavaScript at or below 180 KB gzip and the home page at or below 250 KB gzip, excluding lazy search, Mermaid, comments, and music chunks.
- Meet WCAG 2.2 AA, axe serious/critical zero, Lighthouse Accessibility at least 0.90, and CLS at most 0.1.
- Use `https://www.xinvstar.xyz` as `metadataBase`; keep the root-domain redirect and trailing slash behavior.
- Never run IndexNow during build, test, or Preview.
- Keep Astro commit `77aa1e7e5fde74b8fbaf6e060ca8e112ca8bb9f9` and deployment `5410325580` as rollback evidence.

---

### Task 1: Establish the Next.js Runtime and Green Toolchain

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `eslint.config.mjs`
- Modify: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Create: `tests/unit/runtime-boundary.test.ts`

**Interfaces:**
- Produces: Next.js `dev`, `build`, `start`, `lint`, `typecheck`, `test`, and `test:e2e` scripts.
- Produces: `RootLayout({ children }: Readonly<{ children: React.ReactNode }>)`.
- Consumes: `DESIGN.md` color, type, radius, and spacing tokens.

- [ ] **Step 1: Write the failing runtime-boundary test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));

describe("pure Next.js runtime", () => {
  it("uses Next.js commands and no Astro or Svelte runtime", () => {
    expect(pkg.scripts.dev).toBe("next dev");
    expect(pkg.scripts.build).toBe("next build");
    expect(pkg.dependencies.next).toBe("16.2.10");
    expect(pkg.dependencies.react).toBe("19.2.7");
    expect(pkg.dependencies.astro).toBeUndefined();
    expect(pkg.dependencies.svelte).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run the test and record the expected failure**

Run: `pnpm exec vitest run tests/unit/runtime-boundary.test.ts`  
Expected: FAIL because `scripts.dev` is `astro dev` and Next.js is absent.

- [ ] **Step 3: Replace the framework/tooling dependencies and create the minimal App Router shell**

Use exact versions from the plan header. Configure Tailwind v4 through `@tailwindcss/postcss` and `@import "tailwindcss"`; move design primitives into an `@theme` block. Limit TypeScript includes to Next.js, scripts, and tests while old source remains during parallel migration.

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: { formats: ["image/avif", "image/webp"] },
  poweredByHeader: false,
};

export default nextConfig;
```

- [ ] **Step 4: Run the complete initial toolchain**

Run: `pnpm install && pnpm lint && pnpm typecheck && pnpm test && pnpm build`  
Expected: all commands exit 0; `next build` lists `/` as a prerendered route.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml next.config.ts postcss.config.mjs eslint.config.mjs tsconfig.json vitest.config.ts src/app tests/unit/runtime-boundary.test.ts
git commit -m "chore: establish pure Next.js runtime"
```

### Task 2: Build the Content Contract and URL Resolver

**Files:**
- Create: `src/lib/content/schema.ts`
- Create: `src/lib/content/types.ts`
- Create: `src/lib/content/load-posts.ts`
- Create: `src/lib/content/url-resolver.ts`
- Create: `src/lib/content/taxonomy.ts`
- Create: `src/lib/content/inventory.ts`
- Create: `tests/unit/content-loader.test.ts`
- Create: `tests/unit/url-resolver.test.ts`

**Interfaces:**
- Produces: `getAllPosts(options?: { includeDrafts?: boolean }): Promise<Post[]>`.
- Produces: `getPublishedPosts(): Promise<Post[]>`.
- Produces: `resolvePostUrl(post: Post): string` and `getPostRouteAliases(post: Post): string[]`.
- Produces: `filterPosts(posts: Post[], query: ArchiveQuery): Post[]`.
- Consumes: unchanged files under `src/content/posts` and `src/content/spec`.

- [ ] **Step 1: Write failing count, sort, schema, and URL tests**

```ts
it("preserves the authoritative content counts", async () => {
  const all = await getAllPosts({ includeDrafts: true });
  expect(all).toHaveLength(38);
  expect(all.filter((post) => post.data.draft)).toHaveLength(1);
  expect((await getPublishedPosts())).toHaveLength(37);
});

it("keeps alias and default routes for the encrypted fixture", async () => {
  const post = (await getAllPosts({ includeDrafts: true })).find(
    ({ sourceSlug }) => sourceSlug === "encrypted-post",
  )!;
  expect(resolvePostUrl(post)).toBe("/posts/encrypted-example/");
  expect(getPostRouteAliases(post)).toEqual([
    "/posts/encrypted-example/",
    "/posts/encrypted-post/",
  ]);
});
```

- [ ] **Step 2: Run the focused tests**

Run: `pnpm vitest run tests/unit/content-loader.test.ts tests/unit/url-resolver.test.ts`  
Expected: FAIL because the content library does not exist.

- [ ] **Step 3: Implement schema validation, stable sorting, URL precedence, and taxonomy filtering**

Use `gray-matter` and `zod`. Preserve raw Frontmatter and body separately, compute SHA-256, normalize dates without changing source values, and expose both canonical and compatibility routes. Implement repeated tag/category OR semantics and cross-group AND semantics.

```ts
export type ArchiveQuery = {
  tags: string[];
  categories: string[];
  uncategorized: boolean;
};

export function filterPosts(posts: Post[], query: ArchiveQuery): Post[] {
  return posts.filter((post) => {
    const tagMatch = !query.tags.length || query.tags.some((tag) => post.data.tags.includes(tag));
    const categoryMatch =
      !query.categories.length || query.categories.some((category) => post.data.category === category);
    const uncategorizedMatch = !query.uncategorized || !post.data.category;
    return tagMatch && categoryMatch && uncategorizedMatch;
  });
}
```

- [ ] **Step 4: Verify inventory parity**

Run: `pnpm vitest run tests/unit/content-loader.test.ts tests/unit/url-resolver.test.ts`  
Expected: PASS with 38/37/1 counts and the encrypted alias assertions.

- [ ] **Step 5: Commit**

```bash
git add src/lib/content tests/unit/content-loader.test.ts tests/unit/url-resolver.test.ts
git commit -m "feat: preserve content and URL contracts"
```

### Task 3: Implement the Markdown, Code, and Encryption Pipeline

**Files:**
- Create: `src/lib/markdown/compile.ts`
- Create: `src/lib/markdown/plugins/admonition.ts`
- Create: `src/lib/markdown/plugins/directives.ts`
- Create: `src/lib/markdown/plugins/github-card.ts`
- Create: `src/lib/markdown/plugins/image-size.ts`
- Create: `src/lib/markdown/plugins/code.ts`
- Create: `src/lib/markdown/sanitize.ts`
- Create: `src/lib/content/encryption.ts`
- Create: `src/components/content/markdown-content.tsx`
- Create: `tests/fixtures/markdown/all-features.md`
- Create: `tests/unit/markdown.test.ts`
- Create: `tests/unit/encryption.test.ts`

**Interfaces:**
- Produces: `compileMarkdown(source: string, options: MarkdownOptions): Promise<CompiledMarkdown>`.
- Produces: `CompiledMarkdown = { html: string; headings: Heading[]; excerpt: string; diagrams: Diagram[] }`.
- Produces: `encryptArticle(plainText: string, password: string): Promise<EncryptedPayload>`.
- Consumes: `Post` from Task 2.

- [ ] **Step 1: Write failing feature and leak tests**

```ts
it("renders every legacy Markdown feature with stable ids", async () => {
  const result = await compileMarkdown(fixture, { origin: "https://www.xinvstar.xyz" });
  expect(result.html).toContain("class=\"admonition admonition-tip\"");
  expect(result.html).toContain("data-mermaid-source");
  expect(result.html).toContain("class=\"katex\"");
  expect(result.html).toContain("rel=\"noopener noreferrer\"");
  expect(result.headings.map(({ id }) => id)).toEqual(["中文标题", "中文标题-1"]);
});

it("ships ciphertext without password or plaintext", async () => {
  const payload = await encryptArticle("secret body sentinel", "correct horse");
  expect(JSON.stringify(payload)).not.toContain("correct horse");
  expect(JSON.stringify(payload)).not.toContain("secret body sentinel");
});
```

- [ ] **Step 2: Verify RED**

Run: `pnpm vitest run tests/unit/markdown.test.ts tests/unit/encryption.test.ts`  
Expected: FAIL because compiler and encryption modules are missing.

- [ ] **Step 3: Implement the Unified pipeline and AES-GCM build encryption**

Use stable content-hash IDs, a strict raw-HTML allowlist, host validation for iframes, server-side Shiki output, and one shared compiler for page and feed modes. Encrypt protected body HTML with PBKDF2-derived AES-GCM; ship salt, IV, ciphertext, and iteration count but never the source password.

- [ ] **Step 4: Verify feature fixtures and run a plaintext scan**

Run: `pnpm vitest run tests/unit/markdown.test.ts tests/unit/encryption.test.ts && rg -n "secret body sentinel|correct horse" .next src/app || true`  
Expected: tests PASS; ripgrep returns no generated/runtime matches.

- [ ] **Step 5: Commit**

```bash
git add src/lib/markdown src/lib/content/encryption.ts src/components/content tests/fixtures tests/unit/markdown.test.ts tests/unit/encryption.test.ts
git commit -m "feat: compile legacy Markdown safely"
```

### Task 4: Build the Accessible Shell and Design System

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Create: `src/components/shell/site-header.tsx`
- Create: `src/components/shell/site-footer.tsx`
- Create: `src/components/shell/site-navigation.tsx`
- Create: `src/components/shell/page-frame.tsx`
- Create: `src/components/shell/hero.tsx`
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/chip.tsx`
- Create: `src/components/ui/dialog.tsx`
- Create: `src/config/site.ts`
- Create: `tests/unit/shell.test.tsx`

**Interfaces:**
- Produces: `PageFrame`, `SiteHeader`, `SiteFooter`, `Hero`, `Button`, `Chip`, and dialog primitives.
- Produces: semantic landmarks, Skip Link, one-H1 convention, theme tokens, and mobile-first layout.
- Consumes: `PRODUCT.md`, `DESIGN.md`, and site identity values from the old `src/config.ts`.

- [ ] **Step 1: Write failing semantic shell tests**

```tsx
it("renders a landmark-complete shell", () => {
  render(<RootLayout><main><h1>Test</h1></main></RootLayout>);
  expect(screen.getByRole("banner")).toBeInTheDocument();
  expect(screen.getByRole("navigation", { name: "主导航" })).toBeInTheDocument();
  expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "跳到正文" })).toHaveAttribute("href", "#main-content");
});
```

- [ ] **Step 2: Run the shell test**

Run: `pnpm vitest run tests/unit/shell.test.tsx`  
Expected: FAIL because shell primitives do not exist.

- [ ] **Step 3: Implement tokens and shell components**

Translate `DESIGN.md` to CSS-first Tailwind v4 tokens. Keep body content visible without JavaScript, use stable aspect ratios for imagery, cap article measure at 72ch, and implement reduced-motion overrides globally.

- [ ] **Step 4: Verify shell, lint, and typecheck**

Run: `pnpm vitest run tests/unit/shell.test.tsx && pnpm lint && pnpm typecheck`  
Expected: all commands exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/app src/components/shell src/components/ui src/config/site.ts tests/unit/shell.test.tsx
git commit -m "feat: build accessible xinvStar shell"
```

### Task 5: Render Home, Pagination, Articles, Permalinks, and Archive

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/app/[segment]/page.tsx`
- Create: `src/app/posts/[...slug]/page.tsx`
- Create: `src/app/archive/page.tsx`
- Create: `src/app/not-found.tsx`
- Create: `src/components/features/posts/post-list.tsx`
- Create: `src/components/features/posts/post-card.tsx`
- Create: `src/components/features/posts/post-layout.tsx`
- Create: `src/components/features/archive/archive-list.tsx`
- Create: `src/lib/metadata/page-metadata.ts`
- Create: `tests/integration/content-routes.test.ts`

**Interfaces:**
- Produces: static params for 37 published article routes, compatibility aliases, pages 2–5, and root permalinks.
- Produces: server-filtered archive results from `searchParams: Promise<Record<string, string | string[] | undefined>>`.
- Consumes: content, URL, Markdown, shell, and metadata APIs from Tasks 2–4.

- [ ] **Step 1: Write failing route-manifest tests**

```ts
it("generates all primary and compatibility content routes", async () => {
  const manifest = await buildExpectedRouteManifest();
  expect(manifest.publishedPosts).toHaveLength(37);
  expect(manifest.pagination).toEqual(["/", "/2/", "/3/", "/4/", "/5/"]);
  expect(manifest.urls).toContain("/posts/encrypted-example/");
  expect(manifest.urls).toContain("/posts/encrypted-post/");
});
```

- [ ] **Step 2: Verify RED**

Run: `pnpm vitest run tests/integration/content-routes.test.ts`  
Expected: FAIL because routes and manifest builder do not exist.

- [ ] **Step 3: Implement routes with Server Components and strict resolution**

The root `[segment]` resolver accepts only numeric pages 2–5 or registered root permalinks; every other segment calls `notFound()`. Article aliases render the same content but canonicalize to the preferred URL. Archive reads repeated `tag` and `category` values on the server.

- [ ] **Step 4: Build and probe representative routes**

Run: `pnpm vitest run tests/integration/content-routes.test.ts && pnpm build`  
Expected: PASS; Next build lists home, `[segment]`, `posts/[...slug]`, archive, and not-found routes without dynamic errors.

- [ ] **Step 5: Commit**

```bash
git add src/app src/components/features/posts src/components/features/archive src/lib/metadata tests/integration/content-routes.test.ts
git commit -m "feat: migrate core content routes"
```

### Task 6: Generate Feeds, APIs, Search, Sitemap, Robots, and OG

**Files:**
- Create: `src/lib/feeds/generate-feed.ts`
- Create: `src/lib/search/build-index.ts`
- Create: `src/lib/metadata/structured-data.ts`
- Create: `src/app/rss.xml/route.ts`
- Create: `src/app/atom.xml/route.ts`
- Create: `src/app/api/allPostMeta.json/route.ts`
- Create: `src/app/api/calendar-data.json/route.ts`
- Create: `src/app/llms.txt/route.ts`
- Create: `src/app/llms-full.txt/route.ts`
- Create: `src/app/llms-small.txt/route.ts`
- Create: `src/app/robots.ts`
- Create: `src/app/sitemap.ts`
- Create: `src/app/sitemap-index.xml/route.ts`
- Create: `src/app/sitemap-0.xml/route.ts`
- Create: `src/app/og/[...slug]/route.tsx`
- Create: `src/app/opengraph-image.tsx`
- Create: `tests/integration/machine-routes.test.ts`

**Interfaces:**
- Produces: XML, JSON, plain-text, sitemap metadata, and PNG responses.
- Produces: `createSearchIndex(posts: Post[], specPages: SpecPage[]): SerializedSearchIndex` excluding drafts and encrypted bodies while preserving encrypted article metadata.
- Consumes: content and Markdown APIs from Tasks 2–3 and site metadata from Task 4.

- [ ] **Step 1: Write failing machine-route contract tests**

```ts
it("keeps feed and API privacy contracts", async () => {
  const rss = await getRssEntries();
  const api = await getPublicPostMeta();
  expect(rss).toHaveLength(36);
  expect(api).toHaveLength(37);
  expect(JSON.stringify(api)).not.toMatch(/password\s*[:=]\s*["'][^"']+/i);
});

it("indexes published unencrypted content only", async () => {
  const index = await createSearchIndex(await getPublishedPosts(), await getSpecPages());
  expect(index.documents).toHaveLength(39);
  expect(JSON.stringify(index)).not.toContain("encrypted body sentinel");
});
```

- [ ] **Step 2: Verify RED**

Run: `pnpm vitest run tests/integration/machine-routes.test.ts`  
Expected: FAIL because feed/search/metadata modules do not exist.

- [ ] **Step 3: Implement deterministic responses and native metadata files**

Sort every response deterministically, normalize XML dates, use absolute content URLs, return explicit MIME types, allow public crawling except `/api/`, and generate OG images from local fonts and the original brand background with a static fallback.

- [ ] **Step 4: Verify response contracts and production build**

Run: `pnpm vitest run tests/integration/machine-routes.test.ts && pnpm build`  
Expected: PASS; RSS and Atom each contain 36 entries, API contains 37 records, and no secret plaintext appears in `.next`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/feeds src/lib/search src/lib/metadata src/app tests/integration/machine-routes.test.ts
git commit -m "feat: rebuild feeds search and SEO endpoints"
```

### Task 7: Migrate Specialty Pages and Cached External Data

**Files:**
- Create: `src/app/about/page.tsx`
- Create: `src/app/albums/page.tsx`
- Create: `src/app/albums/[id]/page.tsx`
- Create: `src/app/anime/page.tsx`
- Create: `src/app/devices/page.tsx`
- Create: `src/app/diary/page.tsx`
- Create: `src/app/friends/page.tsx`
- Create: `src/app/projects/page.tsx`
- Create: `src/app/skills/page.tsx`
- Create: `src/app/timeline/page.tsx`
- Create: `src/app/rss/page.tsx`
- Create: `src/app/atom/page.tsx`
- Create: `src/components/features/albums/album-grid.tsx`
- Create: `src/components/features/anime/anime-grid.tsx`
- Create: `src/components/features/devices/device-list.tsx`
- Create: `src/components/features/diary/moment-list.tsx`
- Create: `src/components/features/friends/friend-list.tsx`
- Create: `src/components/features/projects/project-list.tsx`
- Create: `src/components/features/skills/skill-list.tsx`
- Create: `src/components/features/timeline/timeline-list.tsx`
- Create: `src/lib/external/cached-data.ts`
- Modify: `scripts/update-anime.mjs`
- Modify: `scripts/update-bangumi.mjs`
- Modify: `scripts/update-bilibili.mjs`
- Create: `tests/integration/specialty-pages.test.tsx`

**Interfaces:**
- Produces: one Server Component page per legacy specialty route.
- Produces: `loadCachedData<T>(path: string, schema: ZodType<T>): Promise<T>`.
- Consumes: existing tracked data under `src/data` and `public/data`; build never requires live APIs.

- [ ] **Step 1: Write failing specialty-page and offline tests**

```tsx
it.each(["about", "albums", "anime", "devices", "diary", "friends", "projects", "skills", "timeline"])(
  "renders %s from tracked data without network access",
  async (page) => {
    const html = await renderSpecialtyPage(page, { network: "blocked" });
    expect(html).toContain("<main");
    expect(html).not.toContain("加载失败，请刷新");
  },
);
```

- [ ] **Step 2: Verify RED**

Run: `pnpm vitest run tests/integration/specialty-pages.test.tsx`  
Expected: FAIL because the new pages do not exist.

- [ ] **Step 3: Port data views as Server Components and separate maintenance fetches**

Reuse source data, image paths, labels, and link targets. Move remote refreshes to explicit `pnpm data:update:*` scripts with timeout and atomic file replacement; on failure preserve the last tracked snapshot and exit non-zero only for the maintenance task.

- [ ] **Step 4: Verify offline rendering and all routes**

Run: `pnpm vitest run tests/integration/specialty-pages.test.tsx && pnpm build`  
Expected: PASS with network blocked; all named routes appear in the build manifest.

- [ ] **Step 5: Commit**

```bash
git add src/app src/components/features src/lib/external scripts tests/integration/specialty-pages.test.tsx
git commit -m "feat: migrate specialty content pages"
```

### Task 8: Add Minimal Interactive Boundaries

**Files:**
- Create: `src/components/interactive/theme-controller.tsx`
- Create: `src/components/interactive/mobile-navigation.tsx`
- Create: `src/components/interactive/search-dialog.tsx`
- Create: `src/components/interactive/personalization-center.tsx`
- Create: `src/components/interactive/table-of-contents.tsx`
- Create: `src/components/interactive/code-actions.tsx`
- Create: `src/components/interactive/image-lightbox.tsx`
- Create: `src/components/interactive/anime-explorer.tsx`
- Create: `src/components/interactive/calendar-explorer.tsx`
- Create: `src/components/interactive/encrypted-article.tsx`
- Create: `src/components/interactive/share-actions.tsx`
- Create: `tests/unit/client-boundaries.test.ts`
- Create: `tests/e2e/core-interactions.spec.ts`

**Interfaces:**
- Produces: the approved client-boundary modules without clientifying parent pages.
- Consumes: serialized server data only; no Client Component imports `node:fs`, server-only content loaders, or secrets.

- [ ] **Step 1: Write failing client-boundary and keyboard tests**

```ts
it("keeps client directives inside the approved module", async () => {
  const files = await findUseClientFiles("src");
  expect(files.every((file) => file.includes("/components/interactive/"))).toBe(true);
  expect(files.length).toBeLessThanOrEqual(15);
});
```

```ts
test("search dialog traps and restores focus", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "搜索" }).click();
  await expect(page.getByRole("searchbox", { name: "搜索文章" })).toBeFocused({ timeout: 1000 });
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "搜索" })).toBeFocused();
});
```

- [ ] **Step 2: Verify RED**

Run: `pnpm vitest run tests/unit/client-boundaries.test.ts && pnpm playwright test tests/e2e/core-interactions.spec.ts`  
Expected: FAIL because interactive modules and Playwright configuration are absent.

- [ ] **Step 3: Implement accessible interactions with progressive enhancement**

Use native `dialog` or accessible popover patterns, one global audio owner, localStorage only after hydration, inline theme bootstrap for flash prevention, lazy MiniSearch/Mermaid/comment imports, and buttons with names and visible focus. Search, music, comments, and wallpaper failures return stable messages without throwing page-level errors.

- [ ] **Step 4: Verify unit and browser interactions**

Run: `pnpm vitest run tests/unit/client-boundaries.test.ts && pnpm playwright test tests/e2e/core-interactions.spec.ts`  
Expected: PASS for theme persistence, keyboard navigation, search, archive, code copy, TOC, and encrypted article flows.

- [ ] **Step 5: Commit**

```bash
git add src/components/interactive tests/unit/client-boundaries.test.ts tests/e2e/core-interactions.spec.ts playwright.config.ts
git commit -m "feat: add minimal interactive islands"
```

### Task 9: Add Mermaid, Music, Comments, and Third-Party Fail-Open Behavior

**Files:**
- Create: `src/components/interactive/mermaid-diagram.tsx`
- Create: `src/components/interactive/music-provider.tsx`
- Create: `src/components/interactive/music-controls.tsx`
- Create: `src/components/interactive/comment-loader.tsx`
- Create: `src/lib/external/timeout.ts`
- Create: `tests/e2e/rich-content.spec.ts`
- Create: `tests/e2e/third-party-failure.spec.ts`

**Interfaces:**
- Produces: lazy browser-only enhancement for diagram, audio, and comments.
- Produces: `withTimeout<T>(promise: Promise<T>, milliseconds: number): Promise<T>`.
- Consumes: Mermaid sources and server-provided music/comment configuration without credentials.

- [ ] **Step 1: Write failing rich-content and network-failure E2E tests**

```ts
test("third-party failure never hides article content", async ({ page }) => {
  await page.route(/(bgm\.tv|bilibili\.com|twikoo|giscus|meting)/, (route) => route.abort());
  await page.goto("/posts/markdown-tutorial/");
  await expect(page.getByRole("article")).toBeVisible();
  await expect(page.locator("body")).not.toContainText("Application error");
});
```

- [ ] **Step 2: Verify RED**

Run: `pnpm playwright test tests/e2e/rich-content.spec.ts tests/e2e/third-party-failure.spec.ts`  
Expected: FAIL because the enhancements are absent.

- [ ] **Step 3: Implement lazy enhancements and fallbacks**

Render Mermaid only when intersecting, re-render on theme change, and show escaped source in `<pre>` on failure. Require a user gesture before audio playback. Load comments near the viewport and show a stable retry button on failure. Never load runtime scripts from CDN.

- [ ] **Step 4: Verify with blocked network and reduced motion**

Run: `pnpm playwright test tests/e2e/rich-content.spec.ts tests/e2e/third-party-failure.spec.ts`  
Expected: PASS with zero uncaught page errors and readable article content.

- [ ] **Step 5: Commit**

```bash
git add src/components/interactive src/lib/external/timeout.ts tests/e2e/rich-content.spec.ts tests/e2e/third-party-failure.spec.ts
git commit -m "feat: restore rich content enhancements"
```

### Task 10: Produce Original Brand Imagery and Polish the Rendered UI

**Files:**
- Create: `public/assets/brand/xinvstar-night-orbit.webp`
- Create: `public/assets/brand/xinvstar-dawn-orbit.webp`
- Create: `public/assets/brand/xinvstar-og-background.webp`
- Create: `docs/design/generated-assets.md`
- Modify: `src/components/shell/hero.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/components/shell/page-frame.tsx`
- Modify: `src/components/features/posts/post-card.tsx`
- Modify: `src/components/interactive/personalization-center.tsx`
- Create: `tests/e2e/visual-regression.spec.ts`

**Interfaces:**
- Produces: original copyright-safe hero and OG assets with prompt/provenance notes.
- Consumes: the image-generation tool, `PRODUCT.md`, `DESIGN.md`, and representative rendered pages.

- [ ] **Step 1: Add visual assertions before generating assets**

```ts
test("home hero is stable and decorative", async ({ page }) => {
  await page.goto("/");
  const hero = page.getByRole("region", { name: "新v问讯站" });
  await expect(hero).toBeVisible();
  await expect(hero.locator("img")).toHaveAttribute("alt", "");
  await expect(hero).toHaveScreenshot("home-hero.png", { animations: "disabled" });
});
```

- [ ] **Step 2: Verify RED**

Run: `pnpm playwright test tests/e2e/visual-regression.spec.ts --update-snapshots=false`  
Expected: FAIL because original brand assets and approved composition are absent.

- [ ] **Step 3: Generate and integrate three original raster assets**

Prompt direction: an abstract star observatory made from warm amber orbit lines, small knowledge nodes, a deep ink-violet night field, subtle paper/pixel texture, no people, no characters, no logos, no text, no decorative grid, wide editorial-safe negative space for a Chinese heading. Generate separate night, dawn, and OG crops; convert to WebP with bounded dimensions and quality. Record the exact prompt, generation date, dimensions, SHA-256, and use in `docs/design/generated-assets.md`.

- [ ] **Step 4: Run Impeccable audit/polish and browser visual matrix**

Run the local Impeccable detector on changed HTML/CSS sources, then Playwright at 390×844, 768×1024, and 1440×900 in light/dark/reduced-motion modes. Fix contrast, overflow, focus, heading wrap, excessive cards, shadow/radius bans, and layout instability.

Run: `pnpm playwright test tests/e2e/visual-regression.spec.ts --update-snapshots` followed by `pnpm playwright test tests/e2e/visual-regression.spec.ts`  
Expected: baseline creation and immediate replay both exit 0.

- [ ] **Step 5: Commit**

```bash
git add public/assets/brand docs/design/generated-assets.md src/components src/app/globals.css tests/e2e/visual-regression.spec.ts tests/e2e/visual-regression.spec.ts-snapshots
git commit -m "feat: establish original xinvStar visual identity"
```

### Task 11: Remove Legacy Framework Code and Enforce Full Migration Parity

**Files:**
- Delete: `src/pages/`
- Delete: `src/layouts/`
- Delete: `src/components/**/*.astro`
- Delete: `src/components/**/*.svelte`
- Delete: `src/stores/`
- Delete: `src/scripts/`
- Delete: `astro.config.mjs`
- Delete: `tailwind.config.cjs`
- Delete: `src/styles/`
- Delete: `src/plugins/`
- Modify: `.github/workflows/ci.yml`
- Delete or consolidate: obsolete Astro GitHub workflows
- Modify: `Taskfile.yml`
- Create: `scripts/migration/verify-content.mts`
- Create: `scripts/migration/verify-routes.mts`
- Create: `scripts/migration/verify-determinism.mts`
- Create: `scripts/migration/verify-framework-boundary.mts`
- Create: `tests/e2e/accessibility.spec.ts`
- Create: `tests/e2e/no-javascript.spec.ts`

**Interfaces:**
- Produces: `pnpm verify` that runs lint, typecheck, unit/integration, build, framework scan, content parity, route parity, and E2E.
- Consumes: all implementation tasks and foundation inventories.

- [ ] **Step 1: Write failing parity/framework checks**

```ts
const forbidden = ["astro", "@astrojs/", "svelte", ".astro", ".svelte"];
for (const token of forbidden) {
  expect(scanProductionSourcesAndDependencies()).not.toContain(token);
}
expect(currentInventory.counts).toEqual({ all: 38, published: 37, drafts: 1 });
expect(routeReport).toMatchObject({ evidenceRecords: 211, uniqueUrls: 180, queryUrls: 98 });
```

- [ ] **Step 2: Run checks before cleanup**

Run: `pnpm exec tsx scripts/migration/verify-framework-boundary.mts`  
Expected: FAIL and enumerate remaining Astro/Svelte files and dependencies.

- [ ] **Step 3: Delete only proven legacy files and consolidate CI**

Use import/dependency scans before each removal. CI must run `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and Playwright. Remove `continue-on-error` from lint and disable the unused GitHub Pages deployment workflow.

- [ ] **Step 4: Run the full local verification matrix twice**

Run: `pnpm verify && pnpm verify:determinism && git diff --check`  
Expected: all commands exit 0; framework scan finds zero Astro/Svelte production references; route and content counts match; deterministic build comparison reports no unexplained differences.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: complete pure Next.js cutover"
```

### Task 12: Review, Preview, Production Rollout, and Rollback Evidence

**Files:**
- Create: `docs/migration/verification-report.md`
- Create: `docs/migration/deployment-runbook.md`
- Create: `artifacts/migration/route-report.json`
- Create: `artifacts/migration/browser-summary.json`
- Create: `artifacts/migration/performance-summary.json`
- Modify: `docs/agent-foundation/migration-acceptance-matrix.md`

**Interfaces:**
- Produces: GitHub PR, Vercel Preview, production deployment, public-domain checks, and rollback runbook.
- Consumes: `pnpm verify`, GitHub CLI authentication, existing Vercel Git integration, and production baseline identifiers.

- [ ] **Step 1: Run pre-publication verification and independent review**

Run: `pnpm verify && git status --short && git log --oneline origin/main..HEAD`  
Expected: verification exits 0; worktree is clean; commits are focused. Dispatch specification-compliance and code-quality reviewers and resolve every blocking finding.

- [ ] **Step 2: Push branch and create the PR**

```bash
git push -u origin codex/feat/nextjs-migration
gh pr create --base main --head codex/feat/nextjs-migration --title "feat: migrate xinvStar to pure Next.js" --body-file docs/migration/pr-body.md
```

Expected: a PR URL and Vercel Preview deployment linked to the branch commit.

- [ ] **Step 3: Verify GitHub CI and Vercel Preview**

Use `gh pr checks --watch`, inspect the newest workflow run SHAs, identify the Vercel Preview URL, and run the full public URL/SEO/browser matrix against it. Confirm Vercel team `xinvxueyuans-projects`, project `xinvxueyuan-github-io`, Production Branch `main`, required environment variable names, domain binding, and rollback permission without printing values.

Expected: all required checks succeed for the current HEAD; Preview evidence proves 211/180 route compatibility and the visual/accessibility/performance thresholds.

- [ ] **Step 4: Merge and verify production**

Merge only the reviewed green commit. Wait for the production deployment and prove `https://www.xinvstar.xyz` serves `/_next/` assets and the merged commit. Probe home, pagination, Chinese article, encrypted alias, archive query, search, RSS, Atom, sitemap, robots, llms, OG, specialty pages, and true 404.

Expected: all probes pass; root domain redirects to www; TLS and DNS remain unchanged; no new error logs appear during the observation window.

- [ ] **Step 5: Prove rollback readiness and finalize evidence**

Record the new production deployment ID and the exact Vercel rollback command/UI path to deployment `5410325580`. Do not perform a destructive rollback while production is healthy; verify the old deployment remains addressable and that the rollback permission is available.

- [ ] **Step 6: Publish final evidence through a follow-up documentation PR**

```bash
git fetch origin main
git switch -c codex/docs/nextjs-production-verification origin/main
git add docs/migration docs/agent-foundation/migration-acceptance-matrix.md artifacts/migration
git commit -m "docs: record Next.js production verification"
git push -u origin codex/docs/nextjs-production-verification
gh pr create --base main --head codex/docs/nextjs-production-verification --title "docs: record Next.js production verification" --body "Records the verified production deployment and rollback evidence."
```

Expected: deployment report links the PR, merge SHA, Preview, production deployment, commands, exit codes, test counts, screenshots, performance data, and rollback point.
