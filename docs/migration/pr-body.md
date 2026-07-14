## Summary

- replace the legacy Astro/Svelte site with a pure Next.js App Router blog MVP
- keep the existing Markdown article bodies while reducing publishing metadata to the MVP schema
- provide the home feed, static article routes, safe GFM rendering, syntax highlighting, SEO, sitemap, robots, a real 404, and responsive light/dark themes
- remove legacy routes, integrations, assets, dependencies, and compatibility behavior

## Verification

- `pnpm framework:scan`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test -- --maxWorkers=1` — 41 passed
- `pnpm build` — 42 static pages generated
- `PLAYWRIGHT_SKIP_BUILD=1 pnpm test:e2e` — 10 passed

## Deployment and rollback

- Vercel builds the repository as Next.js with `pnpm install --frozen-lockfile` and `pnpm build`.
- Verify the Preview deployment before merging, then verify the production home page, representative posts, sitemap, robots, theme behavior, and unknown-route 404.
- The pre-migration rollback source is commit `77aa1e7`; the prior production deployment must remain available until post-deploy verification completes.
