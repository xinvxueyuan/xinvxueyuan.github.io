# xinvStar 纯 Next.js 迁移设计（已废弃）

> 2026-07-14 用户明确改为破坏性最小博客重写，不做旧站兼容。本文件只保留历史决策记录，不得继续作为实施要求。当前规格见 `2026-07-14-nextjs-blog-mvp-design.md`。

## 状态与授权

- 日期：2026-07-14
- 状态：已批准
- 授权依据：用户批准并行迁移、底层依赖重选、Impeccable 使用，以及 `@vercel @github @superpowers 全部批准，自行迭代上线，善用生图能力`
- 目标站点：https://www.xinvstar.xyz
- 目标仓库：https://github.com/xinvxueyuan/xinvxueyuan.github.io
- 实施分支：`codex/feat/nextjs-migration`
- 实施 Worktree：`/home/xinvdev/xinvxueyuan-blog/.worktrees/nextjs-migration`
- 生产回滚点：Astro 提交 `77aa1e7e5fde74b8fbaf6e060ca8e112ca8bb9f9`，GitHub deployment `5410325580`

## 目标

把现有 Astro 6 + Svelte 5 静态博客替换为纯 Next.js App Router 应用，在不丢文章、不改正文、不破坏历史 URL、Feed、搜索和特色页面的前提下，显著降低客户端 JavaScript、构建期网络耦合和首页交互密度，并完成 GitHub PR、Vercel Preview、生产切换与线上回归。

## 方案比较

### 方案 A：完全静态导出

所有页面和端点写入 `out/`，Pagefind 在构建后索引。优点是托管简单、离线产物清晰；缺点是任意归档查询参数无法服务端渲染，默认图片优化器、请求相关 Route Handler、动态 OG 与部分 Vercel 能力受限。它适合作为应急降级模式，不作为主架构。

### 方案 B：Vercel 混合 App Router

文章、分页、专页和相册通过 `generateStaticParams` 与静态 Server Components 预渲染；RSS、Atom、JSON、llms 和 OG 使用只读 Route Handlers；归档查询使用服务端 `searchParams`；搜索索引在构建期生成并由客户端按需加载。它保留静态博客的稳定性，同时解决动态元数据、查询和部署验证问题。

### 方案 C：CMS / 内容框架重建

引入 Contentlayer、Fumadocs 或外部 Headless CMS，统一内容模型和后台。它会改变独立内容仓库工作方式、增加供应链与迁移面，且当前 38 篇 Markdown 不需要数据库编辑体验。

### 决策

采用方案 B。方案 A 保留为未来可选的灾备导出方向；不采用方案 C。

## 不可破坏的基线

### 内容

- 38 篇文章：37 篇发布、1 篇草稿。
- 2 个 spec 页面、91 个标签、7 个分类、5 个年份、60 个内容图片文件。
- 标题、日期、正文、Frontmatter 和源文件 SHA-256 与 `docs/agent-foundation/content-inventory.json` 一致。
- schema 保留 21 个作者字段和 4 个内部导航字段，包括当前少用的 `comment`、`priority`、`licenseUrl` 与 `permalink`。
- 排序保持：置顶优先；置顶内 priority 数值小者优先；其余按发布日期倒序。
- 生产环境不公开草稿；加密文章明文不得进入 HTML、Feed、搜索、llms 或客户端 bundle。

### URL

- `current-route-inventory.csv` 的 211 条证据记录和 180 个唯一 URL 全部纳入测试。
- 首页分页保持 `/`、`/2/`、`/3/`、`/4/`、`/5/`，每页 8 篇。
- 98 个归档查询 URL 保持：91 个 tag、7 个 category。
- 查询语义保持：同类重复参数 OR；tag 与 category 之间 AND；支持 `uncategorized=true`。
- URL 解析优先级保持：文章 `permalink` > 全局 permalink > alias > 文件 slug。
- 加密文章同时响应 `/posts/encrypted-post/` 与 `/posts/encrypted-example/`，后者为首选 canonical。
- 保持 trailing slash、中文 slug 编码、标题锚点和内部资源相对路径。
- 不可避免的差异必须登记在显式 redirect manifest，使用 308 且验证无环。

### 页面与端点

- 页面：主页、分页、文章、根 permalink、About、Albums 与详情、Anime、Archive、Devices、Diary、Friends、Projects、Skills、Timeline、Feed 说明页、404。
- 端点：RSS、Atom、sitemap、robots、三个 llms 文件、文章元数据 JSON、日历 JSON、OG 图。
- RSS 与 Atom 保持 36 条并排除草稿和加密文章；相对图片转换为绝对地址。
- 两个公开 JSON 各包含 37 条元数据；password 只暴露布尔值。
- 旧 robots 策略由快照保存为基线；新站明确改为允许抓取公开页面、禁止 `/api/`，并指向唯一 sitemap。该 SEO 修正必须出现在迁移差异报告中。

## 目标架构

```text
src/
  app/
    (site)/
      layout.tsx
      page.tsx
      [segment]/page.tsx             # 同时解析 /2/…/5/ 与根 permalink
      posts/[...slug]/page.tsx
      archive/page.tsx
      albums/[id]/page.tsx
      about|albums|anime|devices|diary|friends|projects|skills|timeline/page.tsx
    api/allPostMeta.json/route.ts
    api/calendar-data.json/route.ts
    rss.xml/route.ts
    atom.xml/route.ts
    llms.txt|llms-full.txt|llms-small.txt/route.ts
    og/[...slug]/route.tsx
    robots.ts
    sitemap.ts
    layout.tsx
    not-found.tsx
    globals.css
  components/
    shell/
    content/
    features/
    interactive/
  content/
    posts/
    spec/
  lib/
    content/
    markdown/
    metadata/
    search/
    external/
  config/
tests/
  unit/
  integration/
  e2e/
scripts/
  migration/
```

根布局、导航链接、Footer、Profile、文章正文、文章卡片、元数据、相关推荐、归档结果和静态特色页使用 Server Components。只有需要浏览器状态或 API 的交互成为 Client Component。

## Client Component 预算

允许的顶层交互边界：

1. `ThemeController`：系统主题、持久化和无闪烁初始化。
2. `SearchDialog`：按需载入索引、焦点圈定、Escape 和焦点返回。
3. `MobileNavigation`：移动菜单语义与键盘行为。
4. `PersonalizationCenter`：壁纸、布局、色相与偏好设置。
5. `MusicProvider` 与控制器：全站唯一 audio 状态，永不自动播放。
6. `TableOfContentsObserver`：当前标题、滚动与移动目录。
7. `CodeActions`：复制和长代码折叠。
8. `ImageLightbox`：图片浏览与键盘关闭。
9. `MermaidDiagram`：可见时懒加载本地 Mermaid，主题变化重绘。
10. `CommentLoader`：接近视口后载入 Twikoo/Giscus，失败不影响正文。
11. `ArchiveControls`：仅在需要不导航即时筛选时存在；首屏由服务器过滤。
12. `AnimeExplorer`：筛选、排序和增量显示。
13. `CalendarExplorer`：月份与日期交互，首屏数据由服务器传入。
14. `EncryptedArticle`：客户端解锁，但密文和密钥处理必须通过专门安全测试。
15. `ShareActions`：复制链接、生成海报和下载。

禁止把整个站点壳、导航、文章页、归档页或特色页标记为 `use client`。CI 统计 `use client` 文件和客户端入口体积；新增边界必须有具体浏览器能力理由。

## 内容与 Markdown 管线

保留 `src/content/posts` 和 `src/content/spec` 原目录，独立内容仓库同步只替换这两个受控目录。加载器执行以下步骤：

1. `gray-matter` 读取 Frontmatter。
2. `zod` 验证完整 schema 并保留未知字段报告。
3. 统一 slug、alias、permalink、发布日期、草稿和排序。
4. Unified 管线解析纯 `.md`，不批量转换 MDX。
5. 支持 GFM、数学、directive、GitHub Alert、`::github`、`:spoiler`、Mermaid、受控 iframe、图片宽度语法、中文标题锚点和 `<!-- more -->`。
6. Shiki 或框架无关 Expressive Code 适配器在服务端高亮 19 种已知语言；未知语言保持可读纯文本。
7. 页面和 Feed 共用同一 Markdown 编译核心；Feed 额外 sanitize 并绝对化资源 URL。
8. Mermaid 和 GitHub 卡片使用内容哈希或稳定序号作为 ID，禁止 `Math.random()`。

Raw HTML 只允许安全标签和属性；iframe host 允许列表至少覆盖现存 YouTube/Bilibili 引用。脚本、事件属性和任意 style 注入被移除。GitHub 元数据、Mermaid、评论和外部图片全部 fail-open。

## 搜索

构建期生成只包含已发布、未加密正文的版本化搜索 JSON。客户端首次打开搜索框时动态载入索引与 MiniSearch；结果包含标题、描述、标签、日期、URL 与短摘要。基线验收至少覆盖 Pagefind 旧索引的 39 个页面和中英文已知词，不要求继续使用 Pagefind 实现。

## 外部数据与确定性

- Bangumi、Bilibili、壁纸和 GitHub 卡片更新从 `next build` 主路径移出，改为显式维护任务或带超时的缓存刷新。
- 仓库跟踪上一次成功生成的 JSON，网络失败继续构建并展示缓存。
- 评论、音乐、统计、壁纸和图片代理失败时只降级对应增强，不阻塞 HTML。
- 连续两次洁净构建在规范化构建 ID 和时间戳后，路由、HTML、XML、JSON 与搜索索引保持一致。
- `INDEXNOW` 只能作为发布后显式任务，Preview 和普通 build 永不提交。

## 依赖决策

### 新核心

- `next`、`react`、`react-dom`：纯 App Router 运行时。
- `zod`、`gray-matter`：内容 schema 与 Frontmatter。
- `unified`、`remark-parse`、`remark-rehype`、`rehype-stringify`、`remark-gfm`、`rehype-raw`：Markdown 核心。
- `remark-math`、`remark-directive`、`remark-sectionize`、`rehype-katex`、`rehype-slug`、`rehype-autolink-headings`、`rehype-external-links`、`unist-util-visit`：现有内容所需能力。
- `shiki`：构建期代码高亮；若 Expressive Code 的纯 rehype 适配在 TDD fixture 中更完整，则保留 `@expressive-code/core` 与行号/折叠插件。
- `mermaid`：本地按需客户端渲染，移除 CDN。
- `minisearch`：小型构建索引与客户端查询。
- `sanitize-html`：Feed 与受控 HTML净化。
- `next-themes` 不引入；主题逻辑足够小，由项目实现以避免额外 provider 水合。

### 工程依赖

- Tailwind CSS 4 与官方 PostCSS 集成。
- ESLint、typescript-eslint、Prettier。
- Vitest、Testing Library、Playwright、`@axe-core/playwright`、Lighthouse CI。
- `sharp` 仅用于构建脚本和图片资产处理；运行时优先 `next/image`。

### 删除

完成迁移后删除 Astro、全部 `@astrojs/*`、Svelte、`@iconify/svelte`、`@swup/astro`、Astro/Svelte parser 与 Prettier 插件、Stylus、Pagefind，以及只服务旧组件的运行依赖。删除前由 dependency scan 证明没有 import、script 或构建引用。

## 视觉设计

`PRODUCT.md` 与 `DESIGN.md` 是规范来源。Creative North Star 为“夜航问讯站”：

- 首页首屏使用一张原创、无角色版权风险的星轨/知识节点横幅，内容默认可见，图像只承担氛围。
- 使用星芒琥珀、轨道紫、日光与夜航中性色；正文对比度达到 WCAG AA。
- 首页先展示舞台、精选/最新文章和清晰探索入口；Profile、标签、音乐、日历等不再全部展开为侧栏控件。
- 桌面允许更丰富的探索布局，移动端按“导航 → 内容 → 探索”排序。
- 卡片最大圆角 16px，静止状态默认无阴影；禁止渐变文字、玻璃拟态、粗侧边线、重复图标卡片和装饰网格。
- 使用生图能力生成原创主横幅和 OG 背景；生成资产必须保存 prompt、尺寸、用途和许可说明。
- 本地 `ZenMaruGothic-Medium.ttf` 只在许可证验证后使用；否则使用可确认授权的自托管字体或系统回退。

## SEO 与元数据

- `metadataBase` 使用 `https://www.xinvstar.xyz`，根域继续 307 到 www。
- 每个可索引页面生成唯一 canonical；query 页 canonical 指向能表达筛选语义的稳定 URL。
- 文章输出 Open Graph、Twitter、Article JSON-LD、作者、发布时间和修改时间。
- `robots.ts` 与 `sitemap.ts` 使用 Next.js Metadata API；Feed、llms 与 OG 使用 Route Handlers。
- 404 必须返回真实 404，同时保留导航和搜索入口。
- 动态 OG 使用 `next/og` 与项目内字体/原创背景；生成失败时回退到静态默认图。

## 可访问性与性能

- WCAG 2.2 AA；axe serious/critical 为零；Lighthouse Accessibility ≥ 0.90。
- 全站具备 `header`、`nav`、`main`、`aside`、`footer`、Skip Link、单一 H1 和清晰 label。
- Dialog/Popover 支持 Escape、焦点圈定、关闭后焦点返回和背景不可交互。
- 每个动画支持 `prefers-reduced-motion`；内容不能依赖进入动画才可见。
- 图片声明宽高和 `sizes`，主横幅预载策略明确；CLS ≤ 0.1。
- 客户端 JS 不得超过旧站 1.79 MB；目标是代表文章页初始第一方 JS ≤ 180 KB gzip，首页 ≤ 250 KB gzip，不含按需搜索、Mermaid、评论和音乐。
- 第三方脚本在同意或用户操作后按需载入，不进入关键渲染路径。

## 测试与证据

### 单元与集成

- 内容计数、schema、排序、URL resolver、taxonomy、Feed、安全净化、搜索索引、加密泄漏和 Markdown fixture。
- fixture 覆盖 7 个 Mermaid、3 个数学用例、五类 Admonition、GitHub 卡片、spoiler、iframe、表格、图片宽度、20 种 fence 语言和中文重复标题。
- 路由 manifest 断言 211 条证据、180 个唯一 URL、98 个查询 URL。

### 构建与静态验证

- `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build` 全绿。
- 连续两次构建确定性比较。
- crawler 验证本地资源、内部链接、中文 URL 与锚点零未解释错误。
- 依赖/import scan 证明生产代码无 Astro、Svelte 或其他页面框架。

### 浏览器

- Playwright 覆盖 390×844、768×1024、1440×900，亮/暗/reduced-motion。
- 覆盖首页、分页、普通文章、中文文章、加密 alias、归档查询、搜索、移动导航、相册、Anime、项目、404。
- 覆盖主题持久化、键盘菜单、搜索命中、代码复制、TOC、Mermaid、KaTeX、灯箱、音乐用户手势、第三方阻断和无 JavaScript。
- 保存截图、trace、console、网络失败与 Lighthouse/axe 报告到 `artifacts/migration/`。

## GitHub、Vercel 与发布

1. 在迁移分支按可测试单元提交并推送。
2. 更新 CI 为 Next.js lint/typecheck/test/build/E2E；移除 Astro 重复工作流和容错 lint。
3. 创建到 `main` 的 PR；要求所有新检查成功并完成代码审查。
4. 利用现有 Vercel Git 集成生成 Preview，确认项目 `xinvxueyuans-projects/xinvxueyuan-github-io` 的设置、环境变量名、Production Branch 与回滚权限。
5. 对 Preview 执行完整 URL、视觉、SEO、无障碍和性能验收。
6. 合并 PR 或 promote 已验证的同一制品到生产；不新建 Vercel 项目，不改 DNS。
7. 生产后验证 `www`、根域跳转、TLS、`/_next/*`、关键路由、Feed、日志和部署 commit SHA。
8. 失败时优先 Vercel rollback 到 Astro deployment `5410325580`，其次 revert 合并提交。

Vercel CLI 当前未安装且本机未链接项目。实现阶段可安装官方 CLI，并只在确认账号、团队与项目 ID 后写入本地 `.vercel/`；不得提交认证文件。Preview 受 Deployment Protection 保护时，自动化使用官方保护绕过机制或公开验收别名，不泄漏 bypass secret。

## 完成定义

只有以下条件同时成立才可宣布迁移完成：

1. 纯 Next.js App Router 生产依赖与源码中不存在 Astro/Svelte 页面运行时。
2. 内容指纹、211/180 URL、98 查询语义、Feed/API/SEO/搜索和 Markdown fixture 全部通过。
3. CI、Preview、浏览器、axe、Lighthouse、链接与确定性构建证据齐全。
4. GitHub PR 已合并，Vercel 生产部署指向对应 main commit。
5. `https://www.xinvstar.xyz` 线上返回 Next.js 站点，关键路由、端点和交互实测通过。
6. Astro 回滚点仍可用，回滚步骤与部署 ID 已记录。
7. 生产监测窗口内无未解释错误，交付报告包含命令、退出码、测试数量、截图和部署 URL。
