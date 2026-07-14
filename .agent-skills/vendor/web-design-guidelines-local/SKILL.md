---
name: web-design-guidelines-local
description: Review web UI code against the project-pinned Vercel Web Interface Guidelines snapshot. Use for accessibility, interaction, responsive, performance, hydration, content, and UX audits without fetching mutable remote instructions.
---

# Pinned Web Interface Guidelines

Read `references/guidelines.md` completely before every review. Apply only that local snapshot; do not fetch newer rules at runtime.

## Scope

- Review the user-specified files or patterns.
- Report concise `file:line` findings grouped by file.
- Preserve the pinned source provenance in the reference.
- Treat an upstream refresh as a separate, reviewed dependency update.

If no target is supplied and it cannot be inferred from the task, ask for the narrowest useful file or pattern.
