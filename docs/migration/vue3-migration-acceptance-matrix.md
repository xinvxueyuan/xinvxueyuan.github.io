# 纯 Vue 3 博客迁移验收矩阵

## 1. 运行时与构建

| 检查项 | 验收标准 |
| --- | --- |
| 应用框架 | Vue 3 + Vite + Vue Router + Vite SSG；Kun UI 独立 Vue 包已注册和使用 |
| 禁止项 | 源码、依赖及构建配置不得引入 Nuxt、Next.js、React、Astro 或 Svelte 应用框架 |
| 静态输出 | 所有既有公开页面具备静态 HTML，浏览器刷新及直接访问可用 |
| 内容完整性 | 39 个 Markdown 源文件 SHA-256 与基线逐一相同（38 发布、1 草稿；原 38 篇文章哈希保持不变） |
| 发布边界 | 只做本地构建与浏览器检查；不得部署、推送、改 DNS 或触碰生产环境 |

## 2. 页面路径与内容

| 路径 | 内容和交互 |
| --- | --- |
| `/` | 品牌主视觉、最新文章、分类/标签入口、首页 SEO 与默认 OG |
| `/about/` | 个人介绍、社交链接与站内探索入口 |
| `/albums/` | 相册目录和封面 |
| `/albums/[slug]/` | 相册详情、图片替代文本、PhotoSwipe 灯箱、未知 slug 的真实 404 |
| `/archive/` | 按年份的文章归档 |
| `/categories/[category]/` | 分类过滤、计数、空分类/未知分类 404 |
| `/devices/` | 设备信息、图片尺寸与安全外链 |
| `/diary/` | 日记页面与现有空状态 |
| `/friends/` | 友链与现有空状态 |
| `/posts/[slug]/` | Markdown 正文、标题锚点、Shiki、KaTeX、Mermaid、目录高亮、代码复制/折叠、分享、上一篇/下一篇、相关文章、评论、BlogPosting JSON-LD |
| `/projects/` | 项目状态、技术栈、封面与外链 |
| `/search/` | Pagefind 搜索、加载/空结果/失败提示和归档回退 |
| `/skills/` | 技能分组和站内导航 |
| `/tags/[tag]/` | 标签过滤、计数、空标签/未知标签 404 |
| `/timeline/` | 时间线与现有空状态 |

**路径合同：** 保留当前尾斜杠、slug 归一化、canonical、页面内链接和直接访问语义。当前验收集合共 **199 项**：保留原 192 项路由基线，并为新文章及其 5 个标签页加入 6 个页面路由和 1 个 OG 图片 URL。Vue 构建逐项核对 197 个公开 URL（153 个页面路由、38 个 OG 图片 URL、6 个 XML/文本端点）；`/_global-error` 与 `/_not-found` 两项框架内部错误路由由静态宿主 `404.html` 语义接管，不暴露 Next 专属路径。

## 3. 机器可读端点与分享预览

| URL | 验收标准 |
| --- | --- |
| `/atom.xml` | Atom 结构、日期、链接与 MIME 正确 |
| `/rss.xml` | RSS 2.0、正文 HTML 转义和 MIME 正确 |
| `/llms.txt` | 精简文章索引路径和内容保持 |
| `/llms-full.txt` | 已发布文章完整索引保持 |
| `/robots.txt` | 原有爬虫规则与 sitemap 地址保持 |
| `/sitemap.xml` | 包含基线公开页面及文章 canonical |
| `/posts/[slug]/opengraph-image` | 对 38 篇发布文章生成有效图像；保持原 URL，显式检查 MIME 与 PNG 解码 |

## 4. 阅读与交互

- 主题：深浅主题可切换、持久化并支持系统偏好；无 JS 时仍有可读默认主题。
- 搜索：保持 Pagefind 分块加载、并发保护、错误说明与无结果状态。
- Markdown：文章内容首先是静态 HTML；目录、Mermaid、代码工具与 lightbox 失败不隐藏源文。
- 分享：Web Share 可用时优先使用，不可用时复制链接并展示可访问的完成状态。
- 评论：保留 Giscus 配置并在接近视口时懒加载；评论脚本失败不影响文章。
- 导航：桌面和窄屏均可键盘操作；跳过链接、当前页状态和焦点可见。
- 动效：尊重 `prefers-reduced-motion`，不使用遮挡阅读的自动动画。

## 5. 验证命令与计数

1. `pnpm lint`
2. `pnpm typecheck`
3. `pnpm test`
4. `pnpm build`
5. `pnpm test:e2e`
6. `pnpm framework:scan` 与总门禁 `pnpm verify`
7. 由脚本核验源文章总数 39、发布数 38、草稿数 1；原有 38 篇文章 SHA-256 保持不变，新文章也纳入哈希清单。静态输出逐项比对 197 个公开 URL，确认 153 个静态 HTML 页面、38 个 OG PNG、6 个端点与宿主 `404.html`。
8. Playwright 检查桌面、平板、移动首页与文章页，另测搜索、主题、404、直接 URL、目录和分享状态；视觉截图仅作为本地验收，不等于部署。
9. 检查 `git diff --check`、`git status --short` 和差异，最终明确列出尚未完成项；禁止把本地结果表述为线上已生效。
