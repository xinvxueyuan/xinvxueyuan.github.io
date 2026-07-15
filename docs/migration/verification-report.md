# Next.js Reading and Discovery Verification Report

## Scope

- Date: 2026-07-15 (Asia/Shanghai)
- Branch: `codex/feat/nextjs-migration`
- Product decision: destructive replacement; no legacy compatibility
- Rollback source: Astro commit `77aa1e7e5fde74b8fbaf6e060ca8e112ca8bb9f9`

This release extends the pure Next.js App Router blog with a single article
domain, safe extended Markdown, archive/taxonomy/search discovery, feeds,
structured metadata, article reading tools, recommendations, sharing, optional
Giscus comments, and Pages CMS authoring. It does not restore the legacy
multi-framework shell or compatibility behavior.

## Framework and authoring boundary

The framework scan covers production dependencies, application source, root
and deployment configuration, and eager discovery dependency imports.

TDD evidence:

- RED (original migration): the scan found the legacy directories, framework
  configurations, and 200+ legacy source files or references.
- RED (reading release): the Pages CMS contract test failed with `.pages.yml`
  `ENOENT` before authoring configuration existed.
- GREEN: six framework/boundary tests pass. `pnpm framework:scan` reports no
  Astro/Svelte runtime residue and no eager Mermaid/Pagefind source import.

Pages CMS writes `src/content/posts`, stores media in `public/uploads`, emits
`/uploads/` URLs, and exposes exactly the canonical article fields. The example
environment contains only public Giscus repository/category identifiers and no
secret value.

## Build and local evidence

- Vercel framework: `nextjs`; no custom output directory.
- Install contract: `pnpm install --frozen-lockfile`.
- CI: one Node.js 22 workflow runs the frozen install and complete verification.
- Static generation stays serialized for deterministic constrained-host builds.

| Gate | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` | PASS |
| `pnpm framework:scan` | PASS |
| `pnpm lint` | PASS |
| `pnpm typecheck` | PASS |
| `pnpm test -- --maxWorkers=1` | PASS — 13 files, 82 tests |
| `pnpm build` | PASS — 183/183 outputs; 37 post and OG paths; archive, search, taxonomy, feed and llms routes |
| `PLAYWRIGHT_SKIP_BUILD=1 pnpm test:e2e` | PASS — 22 tests |
| `git diff --check` | PASS |
| Article-body diff | PASS — 0 files |

Browser request inspection found no Pagefind or Mermaid request on the homepage,
and no Mermaid request on an ordinary article. The Mermaid fixture preserves
readable source and enhances it after hydration. Search loads Pagefind only from
its isolated interaction. Axe reported zero serious/critical violations on
home, article, archive, and search. The final browser run also passed the 390px
home and article overflow checks.

GitHub CI, DCO, Vercel Preview, and production smoke evidence are intentionally
not claimed here: those gates require a pushed branch and public deployment.
The prior Ready Vercel deployment remains the rollback target until those remote
checks and the production path matrix are green.
