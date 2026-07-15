## Summary

- complete Batch A reading/discovery on the pure Next.js App Router blog
- add taxonomy/archive, interaction-loaded Pagefind search, RSS/Atom/llms,
  JSON-LD and article OG
- extend Markdown through a safe whitelist pipeline with TOC, code tools, math,
  Mermaid and controlled directives
- add reading metadata, sharing, optional Giscus, recommendations and Pages CMS
- keep drafts out of public projections and retain the no-compatibility boundary

## Verification

- `pnpm install --frozen-lockfile`
- `pnpm framework:scan`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm vitest run --maxWorkers=1` — 14 files / 100 tests
- `pnpm build` — 183 route outputs, including 37 posts and article OG images
- `PLAYWRIGHT_SKIP_BUILD=1 pnpm test:e2e` — 26 passed
- `git diff --check`

## Deployment and rollback

- Vercel builds the repository as Next.js with frozen pnpm install and
  `pnpm build`.
- Require GitHub CI, DCO and Vercel Preview green before merging.
- Verify Preview and production home, a Chinese post, search, taxonomy, RSS,
  Atom, llms, Mermaid, theme, 404 and 360px overflow. These remote checks are
  pending until the branch is pushed; this PR body does not claim them early.
- Keep the prior Ready Vercel deployment available as rollback until the same
  production path matrix is green.
