# xinvStar Next.js Blog MVP Design

## Status

- Approved: 2026-07-14
- Product decision: destructive rewrite; no legacy compatibility
- Production rollback point: Astro commit `77aa1e7e5fde74b8fbaf6e060ca8e112ca8bb9f9`

## Goal

Ship a clean personal blog built only with Next.js App Router. A visitor can browse published posts, read Markdown on desktop or mobile, switch theme, and access basic site metadata. Everything else is deferred.

## Included

1. `src/content/posts/**/*.md` remains the authoring source.
2. Home lists all published posts in reverse chronological order.
3. Articles use the new `/posts/[slug]/` URL scheme derived from normalized file paths.
4. Required Frontmatter: `title`, `published`; optional: `description`, `draft`, `image`, `tags`.
5. Markdown supports headings, paragraphs, links, lists, blockquotes, tables, fenced code, inline code, images and GFM.
6. Syntax highlighting is generated on the server; unknown languages remain readable.
7. Root/article metadata, canonical URLs, robots, sitemap, true 404 and basic Open Graph are included.
8. Responsive light/dark design follows `PRODUCT.md` and `DESIGN.md`.
9. One original generated hero/OG visual is stored with prompt and provenance notes.
10. GitHub CI, Vercel Preview, production deployment and public smoke checks are required.

## Explicitly Deferred or Removed

- No old URL, alias, permalink, query-string or trailing-slash compatibility.
- No redirects for removed pages.
- No archive, category, tag filter, pagination, search or Pagefind.
- No RSS, Atom, llms files, IndexNow or content APIs.
- No albums, anime, devices, diary, friends, projects, skills or timeline pages.
- No comments, encryption, Mermaid, KaTeX, GitHub cards, admonitions or custom directives.
- No music, wallpapers, calendar, share poster, Pio, Swup or analytics.
- No content-repository synchronization in the MVP.
- No preservation of the Astro/Svelte component architecture or layout.

Article bodies are not rewritten. Unsupported extended syntax may appear as plain text or a normal code block; it is not an MVP blocker.

## Architecture

```text
src/
  app/
    globals.css
    layout.tsx
    page.tsx
    not-found.tsx
    robots.ts
    sitemap.ts
    posts/[slug]/page.tsx
  components/
    site-header.tsx
    site-footer.tsx
    theme-toggle.tsx
    post-card.tsx
    markdown.tsx
  lib/
    posts.ts
    markdown.ts
    site.ts
  content/posts/
```

Pages and Markdown rendering are Server Components. `theme-toggle.tsx` is the only planned Client Component. The root layout initializes stored theme with a tiny inline script to avoid a flash.

## Content Model

```ts
export type Post = {
  slug: string;
  sourcePath: string;
  title: string;
  published: Date;
  description?: string;
  draft: boolean;
  image?: string;
  tags: string[];
  body: string;
};
```

`getAllPosts()` recursively reads Markdown, validates MVP fields, derives a GitHub-style slug from the relative path, and sorts by `published` descending. Alias, permalink, password, category and other legacy fields are ignored.

## Markdown

The pipeline is `unified → remark-parse → remark-gfm → remark-rehype → Shiki code transform → rehype-stringify`. Raw HTML is disabled. This deliberately removes the largest security and compatibility surface. Heading IDs are stable within a page but need not match the old site.

## Visual Direction

The Creative North Star remains “夜航问讯站”, applied with restraint:

- A single original amber-orbit image anchors the home hero.
- One reading column and a compact header replace all sidebars and nested card grids.
- Article cards rely on typography and spacing, not glass, wide shadows or oversized rounding.
- Article measure is 65–75ch.
- Light and dark themes meet WCAG AA and respect reduced motion.
- Mobile order is header, hero, post list, footer.

## Quality Gates

- `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` exit 0.
- Unit tests prove draft filtering, chronological sorting, slug generation and Markdown basics.
- Browser tests prove home, a normal article, a Chinese-title article, theme, mobile layout and true 404.
- axe serious/critical findings are zero on home and article pages.
- No production dependency or source import contains Astro or Svelte.
- Public production smoke tests confirm the deployed commit serves Next.js assets and new routes.

## Deployment

Use the existing GitHub repository and Vercel project. Push a feature branch, create a PR, verify CI and Preview, merge to `main`, then verify `https://www.xinvstar.xyz`. Do not change DNS. If production fails, roll back to deployment `5410325580` or revert the merge commit.

## Completion Definition

The MVP is complete when pure Next.js is on `main`, the public domain serves the new home and article routes, CI and browser checks are green, the original hero asset is present, and the Astro rollback point is recorded. Removed legacy behavior is not a defect.
