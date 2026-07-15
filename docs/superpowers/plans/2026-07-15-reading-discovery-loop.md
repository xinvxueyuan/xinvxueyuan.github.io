# xinvStar 阅读与发现闭环 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为当前纯 Next.js 博客恢复分类/标签/归档、全文搜索、feed、扩展 Markdown、文章目录与交互、Giscus、相关文章、JSON-LD 和文章 OG，并维持低 JavaScript 与安全边界。

**Architecture:** `src/lib/content` 负责唯一文章模型及派生数据，`src/lib/markdown` 负责唯一安全 AST 管线；页面保持 Server Components，搜索、TOC、分享、评论、Mermaid 和代码复制分别下沉为独立 Client Components。Pagefind 在 `prebuild` 阶段从文章记录生成 `public/pagefind`，feed、llms、metadata 和页面全部消费相同的发布文章集合。

**Tech Stack:** Next.js 16.2.x App Router、React 19、TypeScript 6、Unified/Remark/Rehype、Shiki、KaTeX、Mermaid、Pagefind 1.5.x、Giscus、Vitest、Playwright、axe。

## Global Constraints

- 只实施规格的“批次 A：阅读与发现闭环”；不得添加 About、Projects、Timeline、Skills、Friends、Devices、Diary、Albums 或 Anime。
- 保持纯 Next.js App Router；禁止 Astro、Svelte、Vue 或第二套路由框架。
- 不兼容旧 URL、旧 query 参数、旧 DOM selector、旧 localStorage key 或旧 CSS class。
- Server Components 优先；每种交互独立为最小 Client Component，Mermaid 和 Pagefind 必须动态加载。
- Markdown 不允许任意 raw HTML；视频、Admonition 和 GitHub 卡必须通过白名单 directive 转换；现有 URL sanitizer 保持生效。
- 文章正文不得批量改写；只有实际需要扩展语法的 fixture 文章可做最小调整。
- 草稿不得进入页面、taxonomy、搜索、feed、sitemap、llms、JSON-LD 或 OG 静态参数。
- 无 JavaScript 时正文、分类链接、feed、代码和目录锚点仍可读。
- 外部系统失败必须开放：Giscus、Mermaid 或 GitHub 元数据失败不得阻断正文；本批次不在构建时调用 GitHub API。
- 360px 宽度不得横向溢出；axe serious/critical 必须为零。
- 依赖必须精确锁定到安装时解析版本，继续使用 pnpm frozen lockfile。

---

### Task 1: 统一文章模型、派生数据与依赖基线

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `src/lib/content/posts.ts`
- Create: `src/lib/content/taxonomy.ts`
- Create: `src/lib/content/reading.ts`
- Create: `src/lib/content/recommendations.ts`
- Modify: `src/lib/posts.ts`
- Modify: `tests/unit/posts.test.ts`
- Create: `tests/unit/taxonomy.test.ts`
- Create: `tests/unit/reading.test.ts`
- Create: `tests/unit/recommendations.test.ts`

**Interfaces:**
- Produces: `Post`, `PostSummary`, `getAllPosts()`, `getPublishedPosts()`, `getPost()`, `getTaxonomy()`, `getReadingStats()`, `getAdjacentPosts()`, `getRelatedPosts()`.
- `Post` adds `updated?: Date`, `category?: string`, `comment: boolean`, and structured `cover`; existing `published`, `tags`, `body`, stable slug and source diagnostics remain.
- `PostSummary` excludes `body` and is the only record consumed by taxonomy and recommendation UI.

- [ ] **Step 1: Install the approved dependency set**

Run:

```bash
pnpm add --save-exact @giscus/react mermaid rehype-katex remark-directive remark-math
pnpm add --save-dev --save-exact pagefind@1.5.2
```

Expected: lockfile changes; no Astro/Svelte dependency appears.

- [ ] **Step 2: Write failing model and derivation tests**

Add fixtures that assert this public shape:

```ts
expect(post).toMatchObject({
  category: "工程",
  comment: true,
  tags: ["Next.js", "React"],
  updated: new Date("2026-07-14T00:00:00.000Z"),
});

expect(getReadingStats("中文正文 English words")).toEqual({
  characters: 4,
  words: 2,
  minutes: 1,
});
```

Taxonomy tests must prove normalized deduplication, count order, year grouping and draft exclusion. Recommendation tests must prove deterministic tag/category scoring, date tie-breakers, adjacent boundaries and self exclusion.

- [ ] **Step 3: Verify RED**

Run:

```bash
pnpm vitest run tests/unit/posts.test.ts tests/unit/taxonomy.test.ts tests/unit/reading.test.ts tests/unit/recommendations.test.ts --maxWorkers=1
```

Expected: FAIL because the new modules and fields do not exist.

- [ ] **Step 4: Implement the minimal content domain**

Move implementation ownership into `src/lib/content/*`; leave `src/lib/posts.ts` as a temporary re-export so unchanged consumers remain source-compatible during this task only.

Use these types verbatim:

```ts
export type Cover = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type Post = {
  slug: string;
  sourcePath: string;
  title: string;
  description?: string;
  published: Date;
  updated?: Date;
  draft: boolean;
  tags: string[];
  category?: string;
  cover?: Cover;
  comment: boolean;
  body: string;
};

export type PostSummary = Omit<Post, "body">;
```

Retain exact calendar-date parsing for `published` and apply it to `updated`. Reject partial cover objects with source-path diagnostics. Ignore legacy keys not in the schema.

- [ ] **Step 5: Verify GREEN and corpus invariants**

Run the Step 3 command. Expected: all focused tests pass, including current corpus smoke checks.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml src/lib/posts.ts src/lib/content tests/unit
git commit -m "feat: establish the blog discovery domain"
```

---

### Task 2: 统一扩展 Markdown 管线

**Files:**
- Create: `src/lib/markdown/types.ts`
- Create: `src/lib/markdown/directives.ts`
- Create: `src/lib/markdown/headings.ts`
- Create: `src/lib/markdown/code-blocks.ts`
- Create: `src/lib/markdown/index.ts`
- Modify: `src/lib/markdown.ts`
- Modify: `src/components/markdown.tsx`
- Modify: `src/app/posts/[slug]/page.tsx`
- Modify: `tests/unit/markdown.test.ts`
- Create: `tests/fixtures/markdown/extended.md`

**Interfaces:**
- Produces: `renderMarkdown(body): Promise<RenderedMarkdown>`.
- `RenderedMarkdown` is `{ html: string; headings: Heading[]; hasMermaid: boolean }`.
- `Heading` is `{ depth: 2 | 3 | 4; id: string; text: string }`.
- Generated markup uses `data-code-block`, `data-mermaid-source`, `.admonition`, `.video-embed`, and `.github-card` as stable new selectors.

- [ ] **Step 1: Write failing Markdown fixture tests**

Assert:

```ts
const result = await renderMarkdown(fixture);
expect(result.headings).toEqual([
  { depth: 2, id: "section", text: "Section" },
]);
expect(result.html).toContain('class="katex"');
expect(result.html).toContain('data-mermaid-source="');
expect(result.html).toContain('class="admonition admonition--tip"');
expect(result.html).toContain('class="video-embed"');
expect(result.html).not.toContain("<iframe");
expect(result.html).not.toContain("<script");
```

Test five admonition kinds, YouTube/Bilibili ID allowlists, GitHub `owner/repo` validation, math error fallback, code metadata, dangerous directive attributes and existing dangerous URL cases.

- [ ] **Step 2: Verify RED**

Run `pnpm vitest run tests/unit/markdown.test.ts --maxWorkers=1`.

Expected: FAIL because `RenderedMarkdown` and extensions do not exist.

- [ ] **Step 3: Implement the AST pipeline**

Required plugin order:

```ts
unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkDirective)
  .use(remarkDirectiveWhitelist)
  .use(remarkRehype)
  .use(rehypeReservePageTitle)
  .use(rehypeSlug)
  .use(rehypeKatex, { throwOnError: false })
  .use(rehypeCodeMetadata)
  .use(rehypeShiki, shikiOptions)
  .use(rehypeSanitizeMarkdownUrls)
  .use(rehypeStringify);
```

Mermaid remains escaped source in deterministic data attributes; no Mermaid package import is allowed in server modules. Videos render safe link/preview markup for Task 5 to enhance, never author-provided iframe HTML.

- [ ] **Step 4: Update the article consumer**

`PostPage` awaits `{ html, headings, hasMermaid }`, passes only HTML to `Markdown`, and retains exactly one page H1. Store headings and Mermaid presence in semantic data props for later enhancement without adding a Client Component yet.

- [ ] **Step 5: Verify GREEN**

Run focused Markdown and route tests. Expected: all pass and raw HTML security tests remain green.

- [ ] **Step 6: Commit**

```bash
git add src/lib/markdown src/lib/markdown.ts src/components/markdown.tsx src/app/posts tests/unit/markdown.test.ts tests/fixtures/markdown
git commit -m "feat: extend the safe Markdown pipeline"
```

---

### Task 3: Taxonomy、归档与 Pagefind 搜索

**Files:**
- Create: `src/app/archive/page.tsx`
- Create: `src/app/tags/[tag]/page.tsx`
- Create: `src/app/categories/[category]/page.tsx`
- Create: `src/app/search/page.tsx`
- Create: `src/components/interactive/search.tsx`
- Create: `src/lib/content/search-records.ts`
- Create: `scripts/build-search-index.mts`
- Modify: `package.json`
- Modify: `.gitignore`
- Modify: `src/components/site-header.tsx`
- Modify: `src/components/post-card.tsx`
- Create: `tests/unit/search-records.test.ts`
- Create: `tests/integration/discovery-routes.test.tsx`

**Interfaces:**
- Consumes Task 1 content interfaces.
- Produces `getSearchRecords(posts): SearchRecord[]` and four public route families.
- Search client imports `/pagefind/pagefind.js` only after focus or non-empty input.

- [ ] **Step 1: Write failing route and search-record tests**

Prove decoded params, canonical metadata, static params, deterministic ordering, draft exclusion, tag/category links on cards, and a search record shaped as:

```ts
{
  url: "/posts/example/",
  content: "plain searchable body",
  meta: { title: "Example", category: "工程", tags: ["Next.js"] },
}
```

- [ ] **Step 2: Verify RED**

Run discovery integration and search-record unit tests. Expected: missing-module/route failures.

- [ ] **Step 3: Implement routes and static index generation**

Add `prebuild: "node scripts/build-search-index.mts"`; the script uses Pagefind `createIndex()`, `addCustomRecord()` and `getFiles()`, empties only `public/pagefind`, and writes returned files there. It must return nonzero on Pagefind errors and never index drafts. Add `public/pagefind/` to `.gitignore`; the generated platform-specific index is a build artifact, not repository source.

- [ ] **Step 4: Implement the minimal search Client Component**

Use an accessible `<dialog>`-free page UI: labeled search input, status live region, keyboard reachable result links, empty and error states. Dynamic import failure renders “搜索暂时不可用，请使用归档页”。

- [ ] **Step 5: Verify GREEN**

Run focused tests, `pnpm prebuild`, and assert `public/pagefind/pagefind.js` exists while no Pagefind bundle is imported into server source.

- [ ] **Step 6: Commit**

```bash
git add .gitignore package.json scripts/build-search-index.mts src/app/archive src/app/tags src/app/categories src/app/search src/components src/lib/content/search-records.ts tests
git commit -m "feat: add taxonomy and static search"
```

---

### Task 4: Feed、llms、JSON-LD 与文章 OG

**Files:**
- Create: `src/lib/content/feed.ts`
- Create: `src/lib/content/llms.ts`
- Create: `src/lib/content/structured-data.ts`
- Create: `src/app/rss.xml/route.ts`
- Create: `src/app/atom.xml/route.ts`
- Create: `src/app/llms.txt/route.ts`
- Create: `src/app/llms-full.txt/route.ts`
- Create: `src/app/posts/[slug]/opengraph-image.tsx`
- Modify: `src/app/posts/[slug]/page.tsx`
- Modify: `src/app/sitemap.ts`
- Create: `tests/unit/feed.test.ts`
- Create: `tests/unit/llms.test.ts`
- Create: `tests/unit/structured-data.test.ts`
- Modify: `tests/integration/blog-routes.test.tsx`

**Interfaces:**
- Consumes Task 1 content and Task 2 Markdown interfaces.
- Produces deterministic RSS 2.0, Atom 1.0, `llms.txt`, `llms-full.txt`, `BlogPosting` JSON-LD and static article OG images.

- [ ] **Step 1: Write failing serialization and metadata tests**

Parse XML in tests and assert content type, absolute canonical URLs, XML escaping, date order and draft exclusion. Assert `llms-full` contains every published title once. Assert JSON-LD uses `https://schema.org`, `BlogPosting`, ISO dates and canonical URL.

- [ ] **Step 2: Verify RED**

Run feed/llms/structured-data/route tests. Expected: missing implementations.

- [ ] **Step 3: Implement deterministic serializers and routes**

Route response headers must be exact:

```ts
{ "Content-Type": "application/rss+xml; charset=utf-8" }
{ "Content-Type": "application/atom+xml; charset=utf-8" }
{ "Content-Type": "text/plain; charset=utf-8" }
```

Feed HTML comes from Task 2 and excludes interactive placeholders. `llms.txt` is an index; `llms-full.txt` concatenates full Markdown bodies with canonical headings.

- [ ] **Step 4: Add JSON-LD and OG**

Render JSON-LD with `<` escaped as `\u003c`. `opengraph-image.tsx` exports 1200×630 PNG metadata and uses the current night-orbit asset, title, date and site mark; `generateStaticParams` covers only published posts.

- [ ] **Step 5: Extend sitemap and verify GREEN**

Sitemap includes home, archive, search, taxonomy routes and posts, but not feed or llms endpoints. Run focused tests and build.

- [ ] **Step 6: Commit**

```bash
git add src/lib/content src/app/rss.xml src/app/atom.xml src/app/llms.txt src/app/llms-full.txt src/app/posts src/app/sitemap.ts tests
git commit -m "feat: publish feeds and article metadata"
```

---

### Task 5: 文章目录、代码交互、Mermaid、分享、评论与推荐

**Files:**
- Create: `src/components/content/article-toc.tsx`
- Create: `src/components/content/article-meta.tsx`
- Create: `src/components/content/article-recommendations.tsx`
- Create: `src/components/interactive/toc-highlight.tsx`
- Create: `src/components/interactive/code-tools.tsx`
- Create: `src/components/interactive/mermaid-diagrams.tsx`
- Create: `src/components/interactive/share-actions.tsx`
- Create: `src/components/interactive/comments.tsx`
- Modify: `src/components/markdown.tsx`
- Modify: `src/app/posts/[slug]/page.tsx`
- Modify: `src/app/globals.css`
- Create: `tests/integration/article-features.test.tsx`
- Modify: `tests/e2e/blog.spec.ts`

**Interfaces:**
- Consumes Task 1 recommendations/reading stats and Task 2 `RenderedMarkdown`.
- Interactive components accept serializable props only; no global context or shared state store.

- [ ] **Step 1: Write failing component and E2E tests**

Cover semantic TOC links, current-heading state, copy feedback, code collapse preserving source, Mermaid failure fallback, native-share fallback, disabled comments, Giscus theme messaging, related/adjacent links and no-JS readable markup.

- [ ] **Step 2: Verify RED**

Run article integration tests. Expected: missing components.

- [ ] **Step 3: Implement server-rendered article furniture**

TOC is an ordered `<nav aria-label="文章目录">`; metadata displays dates, category, tags, word count and minutes; related/adjacent links are ordinary anchors. Article remains understandable without hydration.

- [ ] **Step 4: Implement isolated enhancements**

- `toc-highlight.tsx`: one `IntersectionObserver`, cleans up on unmount.
- `code-tools.tsx`: event delegation under the article root; clipboard errors show nonblocking feedback.
- `mermaid-diagrams.tsx`: `import("mermaid")` only when markers exist; initialize with `startOnLoad: false` and `securityLevel: "strict"`; preserve source on error.
- `share-actions.tsx`: call `navigator.share` only from click; otherwise clipboard; final fallback selects the canonical URL input.
- `comments.tsx`: lazy render `@giscus/react` near viewport; pathname strict mapping; required repo/category IDs come from public environment variables and missing config renders no iframe.

- [ ] **Step 5: Verify GREEN**

Run integration tests and Playwright article scenarios at 390/768/1440 widths. Expected: one H1, no overflow, no serious/critical axe findings, and no console error in fail-open scenarios.

- [ ] **Step 6: Commit**

```bash
git add src/components/content src/components/interactive src/components/markdown.tsx src/app/posts src/app/globals.css tests
git commit -m "feat: complete the article reading experience"
```

---

### Task 6: Pages CMS、全链路门禁与发布说明

**Files:**
- Create: `.pages.yml`
- Modify: `.env.example`
- Modify: `src/components/site-footer.tsx`
- Modify: `tests/e2e/blog.spec.ts`
- Create: `tests/e2e/discovery.spec.ts`
- Modify: `scripts/verify-mvp.mts`
- Modify: `docs/migration/verification-report.md`
- Modify: `docs/migration/pr-body.md`

**Interfaces:**
- Consumes all prior tasks; produces authoring configuration and final release evidence.

- [ ] **Step 1: Write failing authoring and boundary tests**

Add a framework/boundary test that parses `.pages.yml` and asserts the post collection path, media path and exact supported fields. Add E2E tests for archive → taxonomy → post, search known Chinese keyword, RSS/Atom/llms responses, TOC navigation, copy, share fallback, comments-disabled behavior, 404 and accessibility.

- [ ] **Step 2: Verify RED**

Run focused framework and E2E tests. Expected: `.pages.yml` assertions fail before config exists.

- [ ] **Step 3: Implement Pages CMS config and environment contract**

Fields must match Task 1 exactly: `title`, `description`, `published`, `updated`, `draft`, `tags`, `category`, `cover`, `comment`, `body`. Media input is `public/uploads`; output URLs begin `/uploads/`. `.env.example` documents only public Giscus repo/category IDs and contains no real secret.

- [ ] **Step 4: Run complete local verification**

Run:

```bash
pnpm install --frozen-lockfile
pnpm framework:scan
pnpm lint
pnpm typecheck
pnpm test -- --maxWorkers=1
pnpm build
PLAYWRIGHT_SKIP_BUILD=1 pnpm test:e2e
git diff --check
```

Expected: all exit 0; build includes all published posts, taxonomy routes, feed/text endpoints and OG routes; browser suite has zero failures.

- [ ] **Step 5: Verify performance and dependency boundaries**

Inspect build output and browser requests. Homepage must not request Mermaid or Pagefind index before interaction; ordinary article without Mermaid must not request Mermaid; Mermaid article may load it after hydration. Run `pnpm framework:scan` again after generated artifacts.

- [ ] **Step 6: Update evidence and commit**

```bash
git add .pages.yml .env.example src/components/site-footer.tsx tests scripts/verify-mvp.mts docs/migration
git commit -m "chore: verify the reading and discovery release"
```

## Final Review and Release Gate

1. Generate a review package from `7c0ab48` to final HEAD.
2. Request a whole-branch spec and code-quality review; fix every Critical and Important finding and re-run covering tests.
3. Re-run the complete Task 6 verification after the final fix commit.
4. Create a PR against current `main`; require GitHub CI, DCO and Vercel Preview green.
5. Verify Preview home, Chinese post, search, taxonomy, RSS, Atom, llms, Mermaid fixture, theme, 404 and mobile overflow.
6. Merge only after Preview evidence is green; verify the same paths on `www.xinvstar.xyz` and retain the prior Ready Vercel deployment as rollback.
