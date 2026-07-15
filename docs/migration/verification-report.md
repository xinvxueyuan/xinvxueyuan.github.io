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
| `pnpm vitest run --maxWorkers=1` | PASS — 14 files, 100 tests |
| `pnpm build` | PASS — 183/183 outputs; 37 post and OG paths; archive, search, taxonomy, feed and llms routes |
| `PLAYWRIGHT_SKIP_BUILD=1 pnpm test:e2e` | PASS — 26 tests |
| `git diff --check` | PASS |
| Article-body diff | PASS — 0 files |

Browser request inspection found no Pagefind or Mermaid request on the homepage,
and no Mermaid request on an ordinary article. The Mermaid fixture preserves
readable source and enhances it after hydration. Search loads Pagefind only from
its isolated interaction. Axe reported zero serious/critical violations on
home, article, archive, and search. The final browser run also passed the 360px
home and article overflow checks.

GitHub CI, DCO, Vercel Preview, and production smoke evidence are intentionally
not claimed here: those gates require a pushed branch and public deployment.
The prior Ready Vercel deployment remains the rollback target until those remote
checks and the production path matrix are green.

## Batch B personal showcase evidence

Batch B adds eight static personal showcase entries plus one public album detail:
About, Projects, Timeline, Skills, Friends, Devices, Diary, and Albums. Content
comes from typed local manifests; empty Timeline, Friends, and Diary pages remain
honest usable pages. The album is an ordinary image-link gallery before its only
client enhancement dynamically loads PhotoSwipe on first interaction.

| Gate | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` | PASS — lockfile unchanged |
| `pnpm framework:scan` | PASS — Astro/Svelte/Swup residue absent; no eager PhotoSwipe runtime import outside the isolated lightbox |
| `pnpm lint` | PASS — zero warnings |
| `pnpm typecheck` | PASS |
| `pnpm vitest run --maxWorkers=1` | PASS — 18 files, 127 tests |
| `pnpm build` | PASS — 192/192 static outputs; eight showcase entries and `/albums/acg-example/` emitted |
| Playwright against a manually started production build | PASS — 36 tests |
| `git diff --check` | PASS |

The WSL Playwright `webServer` empty-port probe is unreliable in this workspace,
so browser verification used the allowed equivalent: start the already-built
application on `127.0.0.1:3100`, then run the unchanged E2E directory through a
temporary ignored configuration with no `webServer`. The temporary file was
deleted after the run and is not part of the release diff.

Browser evidence covers all eight entry pages at 360, 768, and 1440 pixels with
exactly one H1 and no horizontal overflow. Axe found zero serious or critical
violations on representative text, image, and empty-state pages. Real Tab-key
traversal followed document order from the skip link through the header to About
and Projects, then traversed About through the theme control and GitHub link to
all seven sibling paths. A computed-style regression confirmed category and tag
post-card dates retain automatic first-column placement outside the showcase
boundary. Every discovered showcase image and album original returned HTTP 200,
and every rendered image used the local production origin.

Resource inspection found no PhotoSwipe implementation in homepage, About,
Projects, or Albums-index JavaScript. The album detail also omitted the
implementation before interaction; its first photo activation fetched the
deferred PhotoSwipe chunk, opened an accessible dialog, and Escape restored focus.
The no-JavaScript album test opened the ordinary original-image link successfully.
Browser stylesheet inspection also found PhotoSwipe CSS only on album detail.
The Albums index disables Next link prefetch for the detail route so it does not
fetch the detail-only stylesheet before navigation.

The final content-domain review aligned the implementation with the approved
field contract, retained `as const satisfies` source checks behind readonly
consumer views, and added strict ISO calendar/order plus non-empty image-source
gates. The user-approved AcgExample publication-rights record is retained in
`docs/migration/media-provenance.md`.
