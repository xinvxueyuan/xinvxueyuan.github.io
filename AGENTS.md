# xinvStar Agent Guide

这是仓库长期有效的项目说明入口。迁移细节与验收清单见 `docs/migration/vue3-migration-acceptance-matrix.md`。

## 当前项目方向

- 本项目是纯 Vue 3 博客，使用 Vite、Vue Router、`vite-ssg` 与 Kun UI standalone Vue 组件包。
- **禁止引入 Nuxt、Next.js、React 或其他应用框架。** 不以框架语法模拟 Vue 组件；页面和交互使用 Vue 3。
- 当前改造在本地隔离工作树 `.worktrees/vue3-kun-ui-migration` 中进行。用户授权的是本地重写和验证；未授权部署、Preview 发布、推送、DNS 或生产站点修改。
- 用户接受 AGPL-3.0-or-later；所用 Kun UI 2.56.2 官方包元数据声明 `AGPL-3.0-only`。不要因此擅自替整个仓库声明许可证，只按需保留第三方依赖许可信息。
- `docs/superpowers/` 与 `docs/agent-foundation/` 中描述 Next-only、旧功能移除或 Vercel 上线的文档是此前方案的历史记录；当前任务以本文件、`docs/migration/vue3-migration-acceptance-matrix.md` 和用户最新指示为准，不执行已过期路线。

## 内容与兼容要求

- 保留仓库现有 38 个 Markdown 源文件（37 篇发布文章、1 篇草稿）及全部正文和 Frontmatter；不得批量重写、重新排版或改名。
- 保留现有公开页面 URL、尾斜杠和动态 slug 语义，覆盖首页、文章、分类、标签、归档、搜索、个人介绍、相册、设备、项目、技能、日记、友链和时间线。
- 保留 RSS、Atom、robots、sitemap、llms 文本、文章 Open Graph 图片、Pagefind 搜索、Giscus 评论、Markdown 扩展和所有现有文章阅读操作。
- 页面必须渐进增强：预渲染 HTML 在 JavaScript 禁用时仍可读，交互失败不能隐藏正文或导航。
- Kun UI 使用 `@kungal/ui-vue` 与同版本 `@kungal/ui-core`、`@kungal/ui-tokens`；保持 Vue 独立接入，不依赖 `@kungal/ui-nuxt`。

## 工作方式

- 优先只读盘点并比较既有基线；内容源文件与生成资产分开管理。
- 使用 `pnpm install --frozen-lockfile`；不删除锁文件规避依赖问题。只允许仓库 `pnpm-workspace.yaml` 明确列出的依赖构建脚本。
- 不运行系统更新、不改全局 Git 配置、不调用生产通知，不部署、不创建 PR/提交/推送，除非用户另行明确授权。
- `.env*`、令牌、Cookie、分析标识符和凭据均为秘密，只能记录变量名。

## 验收与证据

- 以 `pnpm verify` 为本地质量门禁；必须覆盖 lint、Vue 类型检查、单元测试、静态构建、Playwright 端到端和纯 Vue 框架扫描。
- 构建后以脚本比较 38 个内容 SHA-256、实际静态路由与端点数量；报告命令、退出码、计数、差异和 Git 工作区状态。
- 在桌面、平板和移动视口检查真实渲染页面，遵循 `DESIGN.md` 与仓库固定版本的网页设计指南。
- 当前任务仅完成可验证的本地迁移；最终报告不得暗示已发布或已部署。
