## Summary

- complete Batch A reading/discovery on the pure Next.js App Router blog
- add taxonomy/archive, interaction-loaded Pagefind search, RSS/Atom/llms,
  JSON-LD and article OG
- extend Markdown through a safe whitelist pipeline with TOC, code tools, math,
  Mermaid and controlled directives
- add reading metadata, sharing, optional Giscus, recommendations and Pages CMS
- keep drafts out of public projections and retain the no-compatibility boundary
- add eight typed, static personal showcase entries and one manifest-backed album
- expose only About/Projects in the header and Albums/Friends in the footer
- keep empty personal pages honest and PhotoSwipe isolated behind first album interaction

## Verification

- `pnpm install --frozen-lockfile`
- `pnpm framework:scan`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm vitest run --maxWorkers=1` — 18 files / 125 tests
- `pnpm build` — 192/192 static outputs, including eight showcase entries and one album detail
- Playwright against the manually started production build — 36 passed, including real Tab order and taxonomy post-card isolation
- `git diff --check`

## Deployment and rollback

- Vercel builds the repository as Next.js with frozen pnpm install and
  `pnpm build`.
- Require GitHub CI, DCO and Vercel Preview green before merging.
- Verify Preview and production home, About, Projects, empty states, Devices,
  Albums index/detail, PhotoSwipe, sitemap, a Chinese post, search, taxonomy,
  feeds, 404 and 360px overflow. These remote checks are
  pending until the branch is pushed; this PR body does not claim them early.
- Keep the prior Ready Vercel deployment available as rollback until the same
  production path matrix is green.
