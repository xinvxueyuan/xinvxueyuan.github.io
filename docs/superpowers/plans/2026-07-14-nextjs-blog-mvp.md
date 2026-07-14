# xinvStar Next.js Blog MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Follow RED → GREEN → review for each task.

**Goal:** Ship a pure Next.js personal blog with Markdown publishing, a responsive post list, article pages, theme switching, original imagery and production deployment.

**Architecture:** Server Components load and render local Markdown. One small Client Component owns theme switching. The MVP intentionally removes all legacy compatibility and non-blog features.

**Tech Stack:** Next.js 16.2.10, React 19.2.7, TypeScript 6.0.3, Tailwind CSS 4.3.2, gray-matter, zod, Unified, Remark GFM, Shiki, Vitest, Playwright.

## Global Constraints

- Do not implement legacy routes, redirects, aliases, permalink formats, queries or old feature pages.
- Keep article body files unchanged; support only MVP Frontmatter fields.
- Only `theme-toggle.tsx` may use `use client` unless a reviewer approves another essential browser boundary.
- Raw HTML and legacy Markdown extensions are unsupported.
- Article pages use the new `/posts/[slug]/` scheme.
- Remove Astro and Svelte from production dependencies and source before Preview.
- Use the existing Vercel project and do not modify DNS.

---

### Task 1: Replace Compatibility Content with the MVP Post API

**Files:**
- Replace: `src/lib/content/` with `src/lib/posts.ts`
- Replace: `tests/unit/content-loader.test.ts` with `tests/unit/posts.test.ts`
- Delete: `tests/unit/url-resolver.test.ts`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**
- `getAllPosts({ includeDrafts?: boolean }): Promise<Post[]>`
- `getPost(slug: string): Promise<Post | undefined>`
- `getPublishedPosts(): Promise<Post[]>`

- [ ] Write tests for required fields, draft filtering, date-descending sorting, recursive loading, unique GitHub-style slugs and unknown slug behavior.
- [ ] Run focused tests and confirm RED because the simplified API does not exist.
- [ ] Implement the minimal `Post` model and ignore non-MVP Frontmatter.
- [ ] Delete compatibility resolver, taxonomy and inventory APIs.
- [ ] Run focused/full tests, lint and typecheck.
- [ ] Commit `refactor: simplify content model for blog MVP`.

### Task 2: Render Markdown, Home and Articles

**Files:**
- Create: `src/lib/markdown.ts`
- Create: `src/lib/site.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`
- Create: `src/app/posts/[slug]/page.tsx`
- Create: `src/app/not-found.tsx`
- Create: `src/app/robots.ts`
- Create: `src/app/sitemap.ts`
- Create: `src/components/post-card.tsx`
- Create: `src/components/markdown.tsx`
- Create: `tests/unit/markdown.test.ts`
- Create: `tests/integration/blog-routes.test.tsx`

**Interfaces:**
- `renderMarkdown(body: string): Promise<string>`
- Consumes the Task 1 Post API.

- [ ] Write failing tests for GFM tables, links, headings, fenced code, unknown languages, home ordering, article metadata and 404.
- [ ] Implement a safe Unified pipeline without raw HTML or legacy extensions.
- [ ] Render published posts on `/` and statically generate `/posts/[slug]/`.
- [ ] Add canonical metadata, basic Open Graph, robots and sitemap.
- [ ] Run tests, lint, typecheck and production build.
- [ ] Commit `feat: render the Next.js blog MVP`.

### Task 3: Add Design, Theme and Original Hero

**Files:**
- Modify: `src/app/globals.css`
- Create: `src/components/site-header.tsx`
- Create: `src/components/site-footer.tsx`
- Create: `src/components/theme-toggle.tsx`
- Create: `public/assets/brand/xinvstar-night-orbit.webp`
- Create: `docs/design/generated-assets.md`
- Create: `tests/e2e/blog.spec.ts`

- [ ] Write failing browser assertions for landmarks, skip link, theme persistence, mobile overflow, article readability and true 404.
- [ ] Generate an original abstract amber-orbit night-sky hero with no characters, logos or text; save it in the repository and record the exact prompt.
- [ ] Implement the “夜航问讯站” shell using DESIGN.md tokens and one client boundary.
- [ ] Run Impeccable audit/polish, axe and Playwright at mobile and desktop sizes.
- [ ] Commit `feat: add the xinvStar MVP visual identity`.

### Task 4: Delete Legacy Framework and Verify

**Files:**
- Delete: `legacy/astro/`
- Delete: all `.astro` and `.svelte` files under `src/`
- Delete: `src/plugins/`, `src/styles/`, `src/stores/`, `src/scripts/`
- Delete: legacy data and public assets unused by the MVP
- Delete: obsolete Astro/Vercel/GitHub workflow configuration
- Modify: `.github/workflows/ci.yml`
- Modify: `Taskfile.yml`
- Modify: `vercel.json`
- Create: `scripts/verify-mvp.mts`
- Create: `docs/migration/verification-report.md`

- [ ] Add a failing scan proving Astro/Svelte files and dependencies still exist.
- [ ] Remove only files/assets with no MVP import.
- [ ] Configure CI and Vercel for Next.js; remove permissive lint and obsolete deployment workflows.
- [ ] Add `pnpm verify` for lint, typecheck, test, build and framework scan.
- [ ] Run verify, Playwright and `git diff --check`.
- [ ] Commit `refactor: remove the legacy blog framework`.

### Task 5: Publish through GitHub and Vercel

**Files:**
- Create: `docs/migration/pr-body.md`
- Update: `docs/migration/verification-report.md`

- [ ] Run final whole-branch review and resolve blocking findings.
- [ ] Push `codex/feat/nextjs-migration` and create a PR to `main`.
- [ ] Verify current-head GitHub checks and Vercel Preview with Playwright smoke tests.
- [ ] Merge the green PR and wait for production deployment.
- [ ] Verify home, a normal post, a Chinese-title post, sitemap, robots, 404, theme and `/_next/` assets on `www.xinvstar.xyz`.
- [ ] Record production commit/deployment and verify rollback access to deployment `5410325580`.
