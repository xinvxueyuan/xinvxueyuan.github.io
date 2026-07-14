# xinvStar 迁移前置基础设施

本目录保存 `www.xinvstar.xyz` 从 Astro/Svelte 并行迁移到纯 Next.js 前的事实基线、风险和验收条件。

当前阶段只描述和验证旧站，不实现 Next.js，不修改文章、URL、生产环境或部署状态。原始日志、截图、路由响应和 Lighthouse 结果位于 `artifacts/baseline/`。

## 阅读顺序

1. `environment-report.md`：执行环境和隔离状态。
2. `repository-architecture.md`：旧站结构与职责。
3. `content-schema-report.md` 与 `current-route-inventory.csv`：内容和 URL 事实。
4. `migration-risk-register.md`：阻塞项与非阻塞风险。
5. `migration-acceptance-matrix.md`：后续迁移通过标准。
6. `next-phase-entry-criteria.md`：是否允许进入自主设计阶段。
7. `nextjs-migration-foundation-report.md`：本阶段最终报告。

所有规定文档已生成；完成状态仍以 `next-phase-entry-criteria.md`、命令日志、Git 提交和最终干净工作区为准。批准下一阶段不等于批准编码或生产发布。
