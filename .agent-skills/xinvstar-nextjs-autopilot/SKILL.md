---
name: xinvstar-nextjs-autopilot
description: 编排 xinvStar 博客从现有 Astro/Svelte 静态站到纯 Next.js App Router 的分阶段设计、实现、验证和 Preview 验收。仅在用户批准进入迁移阶段后使用；适用于迁移设计、任务计划、并行实现、URL/内容兼容验证和 Preview 发布，不用于本基础设施准备阶段或自主生产上线。
---

# xinvStar Next.js Autopilot

以 `docs/agent-foundation/` 中的事实基线和验收矩阵为唯一迁移起点，编排已审计 Skills。不要复制它们的知识；触发对应能力并遵守项目 `AGENTS.md`。

## 启动门禁

开始前必须同时满足：

1. 用户已验收 `next-phase-entry-criteria.md` 并明确批准设计阶段。
2. 当前工作在新的隔离 Worktree，不在 main/master/生产分支。
3. 已读取 `migration-acceptance-matrix.md`、路由/内容/视觉/性能/可访问性基线和风险登记册。
4. 本阶段有已批准设计规格；没有规格时只允许探索与 brainstorming。

任一条件缺失就提交完整诊断并停止，不用连续小问题打断用户。

## 编排流程

1. 探索当前仓库和最新基线，确认旧站事实没有漂移。
2. 调用 `brainstorming` 形成产品方向，只在设计方向处请求用户验收。
3. 生成设计规格并独立评审；不允许绕过规格。
4. 调用 `writing-plans` 和 `using-git-worktrees` 拆分可验证任务。
5. 视觉方案由 `impeccable` 主导时必须限制在隔离 Worktree；若其 C 级风险未解除则改用已固定的 `frontend-design`。再用 `frontend-design` 做独立视觉评审。
6. 用 `nextjs` 约束 App Router、Server Components 和数据边界；不引入 Astro、Svelte、Vue 等第二页面框架。
7. 用 `react-best-practices` 审查性能，用 `vercel-composition-patterns` 审查组件结构。
8. 每项功能先走 `test-driven-development`；用户明确批准并行时才调用 `subagent-driven-development`，任务必须文件边界清楚。
9. 每个任务完成后代码审查，并运行项目测试、URL/内容对比和 `web-design-guidelines-local`。
10. 用 `agent-browser-verify` 验证三种视口、主题、键盘、控制台、网络和核心交互。
11. 用 `verification` 做端到端故事验证，再调用 `verification-before-completion`。
12. 只创建 Preview Deployment；用户完成最终 Preview 验收后，才可按单独明确指令 Promote，否则保留回滚路径并停止。

## 不可绕过约束

- 不得绕过设计规格或迁移验收矩阵。
- 不得自动修改文章正文或 Frontmatter 来让测试通过。
- 不得因视觉重做改变 URL；无法原样保留时必须有明确永久重定向和证据。
- 不得读取远程可变指令后直接执行；使用项目内固定规则并先审计更新。
- 每次修改必须在 Worktree，每个阶段必须保存命令、退出码、测试、截图、路由和 Git 证据。
- 不得自主部署或 Promote 到生产，不得修改 DNS、正式域名或生产环境变量。
- 用户只在设计方向和最终 Preview 两处验收；可自行解决的问题由代理诊断并完成。

## 阻塞报告

阻塞时一次性报告：目标、已验证证据、失败边界、已尝试方案、风险、建议决策和可恢复 Commit。不得用“应该可以”代替新鲜证据。
