# 迁移风险登记册

| ID | 风险 | 证据 | 影响 | 当前处理 |
| --- | --- | --- | --- | --- |
| R-001 | ESLint 10 无法加载现有 Astro parser default import | environment-report.md | 无可用 lint 基线 | 保留失败证据，后续迁移重建 lint |
| R-002 | standalone tsc 与 TypeScript 6/Astro 类型不兼容 | environment-report.md | 无可用独立 tsc 基线 | 以 astro check 为旧站有效基线 |
| R-003 | 内容同步会克隆、备份并替换目录 | scripts/sync-content.js | 误运行可改变内容工作树 | 未确认内容仓库前禁止初始化 |
| R-004 | 构建包含外部数据更新和 fail-open 前置脚本 | package.json | 构建结果受网络与凭据影响 | 基线明确环境并保留日志 |
| R-005 | 可能未使用或动态引用的依赖共 12 个 | dependency-inventory.md | 删除判断可能误报 | 后续逐项复核：@astrojs/check, @lhci/cli, @types/hast, @types/markdown-it, @types/mdast, @types/qrcode, @types/sanitize-html, eslint, pagefind, prettier, prettier-plugin-astro, prettier-plugin-svelte |
| R-006 | 现有 CI 存在重复 Astro check/build 工作流 | .github/workflows | 维护与结果可能漂移 | 本阶段不重写，后续基础设施设计合并 |
| R-007 | 线上 HTML 未发现 canonical | current-route-inventory.csv | 搜索引擎可能自行选择规范 URL | Next.js 迁移显式生成并逐路由验收 canonical |
| R-008 | 标签/分类是 archive 查询 URL，共发现 98 个查询组合 | url-compatibility-baseline.csv | 只迁移路径会丢失筛选入口 | 保留查询语义并加入路由回归 |
| R-009 | LHCI 本地 runner 挂起且 PSI runner 需要 API key | performance-baseline.md | 缺少可信 Lighthouse 分类分数 | Preview 阶段固定 Chrome/Lighthouse 环境后补齐 |
| R-010 | 构建未生成动态 OG PNG，尽管存在 OG 路由源码 | build-artifact-inventory.md | 分享卡片能力可能依赖未验证运行时 | 迁移设计前确认部署端实际 OG 行为 |
| R-011 | 可访问性语义 Landmark、Heading、Label、Skip Link 存在缺口 | accessibility-baseline.md | 键盘与辅助技术体验受限 | 将旧站缺口作为改进目标，不作为新站等价要求 |
