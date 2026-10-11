# xinvStar 博客

xinvStar 是一座把代码、学习与生活编排成可阅读星图的个人博客。本仓库使用 **纯 Vue 3 + Vite + Vue Router + ViteSSG** 构建静态站点，UI 使用 Kun UI 的独立 Vue 包；**不使用 Nuxt、Next.js 或 React**。

## 技术栈与运行环境

- Node.js `>=22.12.0`
- pnpm `>=10.0.0`
- Vue 3、Vue Router、Vite、ViteSSG 与 `@kungal/ui-vue`
- Kun UI 采用独立 Vue 插件包 `@kungal/ui-vue`，不是 Nuxt layer。

## 本地开发

```bash
pnpm install --frozen-lockfile
pnpm dev
```

`pnpm dev` 会先生成文章页面数据和 Pagefind 中文索引，再启动 Vite 开发服务器。

## 构建与预览

```bash
pnpm build
pnpm preview
```

构建会预渲染首页、归档、搜索、分类、标签、专题页、相册详情与公开文章；同时生成 RSS、Atom、robots、sitemap、LLM 文本索引及逐文章 Open Graph 图片。构建结束时会核对公开 URL、静态 HTML、图片/端点数量以及 Markdown 内容哈希。`pnpm preview` 使用静态文件预览服务器，可验证嵌套路径、图片 MIME 和真实 404。

## 质量验证

```bash
pnpm verify
```

验证流程包括纯 Vue 框架边界扫描、ESLint、Vue/工具 TypeScript 检查、Vitest、静态构建和 Playwright 浏览器端到端测试。

## 目录约定

- `src/content/posts/`：文章 Markdown 与 Frontmatter；不要把生成文件写入此目录。
- `src/content/`：相册、项目、设备、友链、日记等站点资料。
- `src/views/`：Vue Router 路由页面。
- `src/components/`：Vue 3 单文件组件。
- `scripts/generate-content.mts`：构建期 Markdown 渲染、静态端点和 OG 图片生成。
- `docs/migration/`：迁移验收矩阵与静态回归基线。

站点保留原有公开 URL 和尾斜杠语义；主题、搜索、文章目录、代码工具、Mermaid、评论和相册灯箱均按需渐进增强，文章正文始终预渲染。

## 评论配置

复制 `.env.example` 并填写 `VITE_GISCUS_REPO`、`VITE_GISCUS_REPO_ID`、`VITE_GISCUS_CATEGORY` 和 `VITE_GISCUS_CATEGORY_ID`。这些是公开的 Giscus Discussions 配置字段，不要提交其他私密令牌。

## 第三方许可提示

Kun UI 的独立 Vue 包 `@kungal/ui-vue`、核心包与 tokens 当前固定为 `2.56.2`；上游 npm 元数据标示 `AGPL-3.0-only`。该依赖许可不自动改变本仓库自身的许可状态。分发或部署前请依据依赖所附完整许可文本落实相应义务。
