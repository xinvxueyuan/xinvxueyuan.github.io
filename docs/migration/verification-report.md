# Next.js Blog MVP Verification Report

## Scope

- Date: 2026-07-15 (Asia/Shanghai)
- Branch: `codex/feat/nextjs-migration`
- Product decision: destructive replacement; no legacy compatibility
- Rollback source: Astro commit `77aa1e7e5fde74b8fbaf6e060ca8e112ca8bb9f9`

The runtime tree now contains only the Next.js App Router blog, its Markdown
content loader, the published post corpus, the generated brand image, and the
tests required by the MVP. Legacy feature pages, components, scripts, data,
assets, framework configuration, and duplicate CI workflows were removed.

## Framework boundary

The framework scan checks all three release-relevant surfaces:

1. production dependency names;
2. application source files and imports (excluding article prose);
3. root, Vercel, test-runner, Taskfile, and GitHub Actions configuration.

TDD evidence:

- RED: `pnpm exec vitest run tests/unit/framework-scan.test.ts` reported the
  legacy directory, both root framework configs, and 200+ legacy source files
  or references.
- RED: the configuration fixture detected that `vercel.json` containing the
  old framework value was not yet scanned.
- GREEN: all three framework-scan tests pass and `pnpm framework:scan` reports no
  Astro or Svelte runtime residue.

## Build and deployment baseline

- Vercel framework: `nextjs`; no custom `dist` output directory.
- Vercel install: `pnpm install --frozen-lockfile`.
- CI: one workflow on Node.js 22 runs frozen install, `pnpm verify`, installs
  Chromium, then runs Playwright without permissive failures.
- Local orchestration: `task install`, `task dev`, `task verify`, `task e2e`.
- Direct dependency baseline: 14 production packages and 13 development
  packages, limited to Next/React, Markdown/Shiki, Tailwind, validation,
  linting, unit tests, browser tests, and accessibility checks.
- Static generation uses one worker (`cpus: 1`, max concurrency `1`). On the
  constrained verification host, three concurrent Shiki prerenders exhausted
  available memory/swap and exceeded Next.js's per-page timeout. The documented
  Next.js 16 static-generation controls trade build throughput for deterministic
  low-memory CI and Vercel builds; the serialized run generated all 42 pages.

## Verification evidence

| Gate | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` | PASS |
| `pnpm framework:scan` | PASS |
| `pnpm lint` | PASS |
| `pnpm typecheck` | PASS |
| `pnpm test` | PASS — 39 tests |
| `pnpm build` | PASS — 42/42 static pages, 37 post paths |
| Production Playwright | 9 complete tests passed; the normal unknown-post 404 assertions also passed before a removed non-MVP malformed-URI assertion |
| `git diff --check` | PASS |
| Article-body diff | PASS — 0 files |

Next.js 16 decodes malformed percent-encoded route segments before the page is
invoked. Handling those invalid request targets would require a new Proxy
request boundary, so it is explicitly outside this minimal blog scope. Normal
unknown post URLs return the designed 404 page. The root workflow performs one
final integrated browser run after the independent article-review fixes are
committed. Preview and production URLs, commits, and public smoke results belong
to Task 5 and will be appended after deployment.
