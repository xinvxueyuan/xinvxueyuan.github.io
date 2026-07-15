# xinvStar Personal Showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在当前纯 Next.js 博客中交付八个类型安全的个人展示入口和一个按需加载 PhotoSwipe 的静态相册详情体系。

**Architecture:** 个人展示数据独立于博客文章域，使用 `src/lib/showcase/types.ts` 与八个 `src/content/*.ts` 文件作为唯一事实源。页面默认是静态 Server Components，共享少量展示组件；相册 HTML 始终是普通原图链接，唯一的 Client Component 只在首次相片交互时加载 PhotoSwipe。

**Tech Stack:** Next.js 16.2.10 App Router、React 19.2.7、TypeScript 6.0.3、PhotoSwipe（安装时精确锁定）、Vitest 4.1.10、Playwright 1.61.1、axe-core。

## Global Constraints

- 只实施 Batch B：About、Projects、Timeline、Skills、Friends、Devices、Diary、Albums 与 `/albums/[slug]/`。
- 保持纯 Next.js App Router；禁止 Astro、Svelte、Vue、Swup 和第二套路由框架。
- 数据必须来自类型安全静态文件；不得新增数据库、运行时 CMS、通用页面构建器或运行时目录扫描。
- 不发布虚构教育/工作经历、模板技能、框架文档假友链或未确认日记；无真实内容时返回 200 并显示诚实空状态。
- Diary 不进入博客文章、feed、taxonomy、Pagefind 或 LLMs。
- 所有公开外链必须是 HTTPS，并渲染 `target="_blank" rel="noopener noreferrer"`。
- 所有图片必须有非空 alt 与正整数 width/height。
- 主导航只增加“关于”和“项目”；个人展示其余入口由 About 和页脚发现。
- PhotoSwipe 只允许出现在相册详情客户端边界，首次相片交互前不得下载其 JavaScript。
- 360px 无横向溢出；axe serious/critical 为零；无 JavaScript 时相册链接仍打开原图。
- 依赖精确锁定，继续使用 pnpm frozen lockfile 和单一 CI workflow。

---

### Task 1: 建立个人展示类型、可信数据与媒体清单

**Files:**
- Create: `src/lib/showcase/types.ts`
- Create: `src/lib/showcase/content.ts`
- Create: `src/content/profile.ts`
- Create: `src/content/projects.ts`
- Create: `src/content/timeline.ts`
- Create: `src/content/skills.ts`
- Create: `src/content/friends.ts`
- Create: `src/content/devices.ts`
- Create: `src/content/diary.ts`
- Create: `src/content/albums.ts`
- Create: `tests/unit/showcase-content.test.ts`
- Copy from `77aa1e7`: `public/assets/projects/xinvstar.webp`
- Copy from `77aa1e7`: `public/images/device/*.webp`
- Copy from `77aa1e7`: `public/images/albums/AcgExample/*.webp`

**Interfaces:**
- Produces: `ShowcaseImage`, `ExternalLink`, `Project`, `TimelineEntry`, `Skill`, `Friend`, `Device`, `DiaryEntry`, `Album`, `AlbumPhoto`.
- Produces: `profile`, `projects`, `timeline`, `skills`, `friends`, `devices`, `diary`, `albums`, `getAlbum(slug)`.
- `getAlbum(slug: string): Album | undefined` is consumed by Task 4.

- [ ] **Step 1: Write failing content-contract tests**

Create assertions that flatten all records and prove unique IDs/slugs, exact HTTPS links and complete image metadata:

```ts
expect(new Set(projects.map(({ slug }) => slug)).size).toBe(projects.length);
expect(allLinks.every(({ href }) => href.startsWith("https://"))).toBe(true);
expect(allImages.every(({ alt, width, height }) =>
  alt.trim().length > 0 && Number.isInteger(width) && width > 0
  && Number.isInteger(height) && height > 0,
)).toBe(true);
expect(getAlbum("missing")).toBeUndefined();
```

Also assert that timeline/friends/diary contain no `example.com`, that skills have no numeric proficiency field, and that the visible album contains at least one photo.

- [ ] **Step 2: Verify RED**

Run:

```bash
source ~/.zshrc
pnpm vitest run tests/unit/showcase-content.test.ts --maxWorkers=1
```

Expected: FAIL because the showcase modules do not exist.

- [ ] **Step 3: Define the exact domain types**

Use discriminated string unions for project status and timeline kind, readonly arrays, `https://${string}` for external URLs, and this required image contract:

```ts
export type ShowcaseImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type ExternalLink = {
  label: string;
  href: `https://${string}`;
};
```

Do not place React nodes, functions, `Date` objects or browser APIs in data modules. Dates are ISO calendar strings so output is deterministic.

- [ ] **Step 4: Migrate only approved content and assets**

Use `git show 77aa1e7:<path>` for text and `git checkout 77aa1e7 -- <asset-path>` only for the approved project, device and visible AcgExample media. Inspect every image with a metadata tool and record its real width/height in the manifest. Do not copy `folkpatch.webp`, hidden/external album examples, diary images, `info.json` or any scanner.

Content policy:

- Projects: xinvStar and Lingchu Bot only.
- Timeline: only verifiable public project milestones; otherwise `[]`.
- Skills: a short set evidenced by the two public projects; no level/years.
- Friends and Diary: `[]` with page-owned empty-state copy later.
- Devices: IQOO Neo 10 Pro+ and ZTE U25S, categorized by use rather than incorrect brand.
- Albums: one explicit manifest for the visible local album; every photo gets authored alt and dimensions.

- [ ] **Step 5: Implement deterministic lookup and verify GREEN**

`getAlbum` performs an exact slug comparison and never decodes or scans the filesystem. Run the focused test; expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/showcase src/content/profile.ts src/content/projects.ts src/content/timeline.ts src/content/skills.ts src/content/friends.ts src/content/devices.ts src/content/diary.ts src/content/albums.ts public/assets/projects public/images/device public/images/albums tests/unit/showcase-content.test.ts
git commit -s -m "feat: establish the personal showcase content domain"
```

---

### Task 2: 实现共享展示组件与 About、Projects、Timeline、Skills、Friends

**Files:**
- Create: `src/components/showcase/page-intro.tsx`
- Create: `src/components/showcase/empty-state.tsx`
- Create: `src/components/showcase/external-link.tsx`
- Create: `src/app/about/page.tsx`
- Create: `src/app/projects/page.tsx`
- Create: `src/app/timeline/page.tsx`
- Create: `src/app/skills/page.tsx`
- Create: `src/app/friends/page.tsx`
- Create: `tests/integration/showcase-routes.test.tsx`

**Interfaces:**
- Consumes all Task 1 types and data.
- Produces five static public pages and shared `PageIntro`, `EmptyState`, `ExternalLink` components.
- `ExternalLink` always emits `target="_blank" rel="noopener noreferrer"` and is reused by Task 3.

- [ ] **Step 1: Write failing route tests**

For each page import `default` and `metadata`, server-render it, and assert one H1 plus exact canonical:

```ts
expect(countHeadings(html, 1)).toBe(1);
expect(metadata.alternates?.canonical).toBe(absoluteUrl("/about/"));
expect(html).not.toContain("example.com");
```

Assert About links to all seven sibling showcase routes, Projects renders both approved projects, and empty timeline/friends data produces explicit Chinese empty-state copy rather than an empty list.

- [ ] **Step 2: Verify RED**

Run `pnpm vitest run tests/integration/showcase-routes.test.tsx --maxWorkers=1`.

Expected: FAIL because the five routes are absent.

- [ ] **Step 3: Implement shared semantic primitives**

- `PageIntro` renders page H1 and prose only.
- `EmptyState` renders a named section with a plain explanation and optional ordinary link.
- `ExternalLink` validates no URL at runtime; it trusts Task 1's typed source and applies safe attributes unconditionally.

Do not create a generic card or schema-driven page renderer.

- [ ] **Step 4: Implement five Server Component pages**

Every page exports static `Metadata` containing title, description and `alternates.canonical: absoluteUrl("/<route>/")`; every root is:

```tsx
<main className="page-shell" id="main-content" tabIndex={-1}>
```

Timeline uses `<ol>` in reverse chronological source order. Skills group into semantic sections without progress bars. Friends uses deterministic source order and the empty state when no approved entries exist.

- [ ] **Step 5: Verify GREEN and lint focused files**

Run:

```bash
pnpm vitest run tests/integration/showcase-routes.test.tsx --maxWorkers=1
pnpm eslint src/components/showcase src/app/about src/app/projects src/app/timeline src/app/skills src/app/friends tests/integration/showcase-routes.test.tsx --max-warnings 0
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/showcase src/app/about src/app/projects src/app/timeline src/app/skills src/app/friends tests/integration/showcase-routes.test.tsx
git commit -s -m "feat: add the personal profile pages"
```

---

### Task 3: 实现 Devices 与 Diary 静态页面

**Files:**
- Create: `src/app/devices/page.tsx`
- Create: `src/app/diary/page.tsx`
- Modify: `tests/integration/showcase-routes.test.tsx`

**Interfaces:**
- Consumes Task 1 `devices` and `diary` plus Task 2 shared components.
- Produces `/devices/` and `/diary/` as static Server Component pages.

- [ ] **Step 1: Add failing integration cases**

Assert Devices renders both approved device names, all `next/image` output has nonempty alt and dimensions, and no “OnePlus” category remains. Assert Diary returns a page with one H1 and the explicit empty-state text when its source array is empty.

- [ ] **Step 2: Verify RED**

Run the two named integration cases. Expected: missing route modules.

- [ ] **Step 3: Implement Devices**

Render a semantic list grouped by usage category. Each item contains its local `Image`, name, description, and `<dl>` for specs; an optional external link uses Task 2 `ExternalLink`. Do not make the entire item a link and do not add filters.

- [ ] **Step 4: Implement Diary**

Render diary entries in source order with `<time dateTime>`, body, optional mood/location/tags and images. When empty, render `EmptyState` with copy that says no public diary entries are available yet. Do not import the post parser or Markdown pipeline.

- [ ] **Step 5: Verify GREEN and commit**

Run focused integration tests and ESLint, then:

```bash
git add src/app/devices src/app/diary tests/integration/showcase-routes.test.tsx
git commit -s -m "feat: add devices and diary pages"
```

---

### Task 4: 实现静态相册与按需 PhotoSwipe

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `src/app/albums/page.tsx`
- Create: `src/app/albums/[slug]/page.tsx`
- Create: `src/components/interactive/album-lightbox.tsx`
- Create: `tests/unit/album-lightbox.test.ts`
- Create: `tests/integration/album-routes.test.tsx`
- Modify: `tests/e2e/showcase.spec.ts`

**Interfaces:**
- Consumes Task 1 `albums` and `getAlbum`.
- Produces `generateStaticParams()`, `generateMetadata()`, `/albums/`, `/albums/[slug]/` and `AlbumLightbox({ galleryId }: { galleryId: string })`.
- Gallery anchors expose `data-pswp-width` and `data-pswp-height`; the Client Component binds only inside the named gallery.

- [ ] **Step 1: Install exact PhotoSwipe version**

Run:

```bash
source ~/.zshrc
pnpm add --save-exact photoswipe
```

Expected: `package.json` and lockfile contain one exact version and no React wrapper package.

- [ ] **Step 2: Write failing route and loader tests**

Integration assertions:

```ts
expect(await generateStaticParams()).toEqual(albums.map(({ slug }) => ({ slug })));
expect(html).toContain('data-pswp-width="');
expect(html).toContain('href="/images/albums/');
```

Unit-test an exported retryable `loadPhotoSwipe()` factory with injected importers: the first rejection must clear cached loading state, a second call may resolve, and one successful resolution is reused.

- [ ] **Step 3: Verify RED**

Run album unit/integration tests. Expected: missing modules.

- [ ] **Step 4: Implement static album routes**

Albums index renders ordinary links and cover images. Detail route exact-matches `params.slug`, calls `notFound()` when absent, and emits gallery anchors whose `href` is the full local image. Each anchor remains useful before hydration. Metadata includes title, description and canonical.

- [ ] **Step 5: Implement the isolated enhancement**

The Client Component listens for gallery clicks, and only after a qualifying primary-button click dynamically imports `photoswipe/lightbox` and `photoswipe`. Loading failure must navigate to the clicked anchor URL. Reuse one initialized instance and call `destroy()` during effect cleanup. Load PhotoSwipe CSS only from the album detail boundary.

- [ ] **Step 6: Verify browser behavior**

Add E2E cases that prove:

- album HTML works with JavaScript disabled and the first anchor points to a successful image response;
- no request URL contains `photoswipe` before interaction;
- first click opens a dialog, Escape closes it, and focus returns to the clicked anchor;
- a non-album page never requests PhotoSwipe.

Run focused Vitest and Playwright cases; expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml src/app/albums src/components/interactive/album-lightbox.tsx tests/unit/album-lightbox.test.ts tests/integration/album-routes.test.tsx tests/e2e/showcase.spec.ts
git commit -s -m "feat: add progressively enhanced albums"
```

---

### Task 5: 整合导航、sitemap、视觉系统与全页验收

**Files:**
- Modify: `src/components/site-header.tsx`
- Modify: `src/components/site-footer.tsx`
- Modify: `src/app/sitemap.ts`
- Modify: `src/app/globals.css`
- Modify: `tests/integration/blog-routes.test.tsx`
- Create or Modify: `tests/e2e/showcase.spec.ts`
- Modify: `scripts/verify-mvp.mts`
- Modify: `docs/migration/verification-report.md`
- Modify: `docs/migration/pr-body.md`

**Interfaces:**
- Consumes all Batch B routes.
- Produces complete navigation, sitemap and release evidence without adding another workflow.

- [ ] **Step 1: Write failing navigation, sitemap and boundary tests**

Assert header has only About/Projects additions, footer exposes Albums/Friends, and sitemap includes the eight entry URLs plus every public album detail exactly once. Extend the framework scan fixture so `.astro`, `.svelte`, Swup imports and eager PhotoSwipe imports outside `album-lightbox.tsx` fail.

- [ ] **Step 2: Verify RED**

Run blog route and framework scan tests. Expected: new route expectations fail.

- [ ] **Step 3: Integrate navigation and sitemap**

Use ordinary links; do not create a mobile menu Client Component. Keep sitemap ordering deterministic: static site routes, showcase entry routes, album detail routes, taxonomy routes, posts.

- [ ] **Step 4: Add a restrained showcase style layer**

Extend `.section-heading` to style `:where(h1, h2)`. Add only focused families for showcase stack, project list, timeline, grouped skills, devices and album grid. Reuse existing colors, fonts, radius and focus tokens; no gradient text, glass cards, decorative grid, wide shadow or radius above 16px. Add responsive rules for 360px and `prefers-reduced-motion` where motion exists.

- [ ] **Step 5: Add the complete E2E matrix**

Test eight entry pages at 360/768/1440 widths for one H1 and no horizontal overflow. Run axe on representative text, image and empty-state pages. Verify keyboard discovery from header to About/Projects and from About to all sibling pages.

- [ ] **Step 6: Run complete local verification**

```bash
source ~/.zshrc
pnpm install --frozen-lockfile
pnpm framework:scan
pnpm lint
pnpm typecheck
pnpm test -- --maxWorkers=1
pnpm build
PLAYWRIGHT_SKIP_BUILD=1 pnpm test:e2e
git diff --check
```

Expected: all exit 0; build statically emits eight entry pages and every album detail; browser suite has zero failures.

- [ ] **Step 7: Verify performance boundaries**

Inspect browser requests: homepage, About, Projects and Albums index must not request PhotoSwipe; only first interaction on an album detail may request it. Confirm all migrated media returns 200 and no page loads an external image host.

- [ ] **Step 8: Update evidence and commit**

Record exact test counts, build output count and browser results in migration docs, then:

```bash
git add src/components/site-header.tsx src/components/site-footer.tsx src/app/sitemap.ts src/app/globals.css tests scripts/verify-mvp.mts docs/migration
git commit -s -m "chore: verify the personal showcase release"
```

## Final Review and Release Gate

1. Review the complete diff from `884acc1` to final HEAD against the approved Batch B spec.
2. Fix every Critical and Important finding and rerun its covering test.
3. Run the complete Task 5 verification after the final fix commit.
4. Push `codex/feat/personal-showcase` and create a PR against current `main`.
5. Require GitHub CI, DCO, CodeRabbit and Vercel Preview green.
6. Verify Preview About, Projects, empty states, Devices, Albums index/detail, PhotoSwipe, 404, sitemap and 360px layout.
7. Merge only after Preview is green; verify the same paths on `www.xinvstar.xyz` and retain the previous Ready production deployment as rollback.
