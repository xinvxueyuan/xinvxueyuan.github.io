# xinvStar 原站能力选择性复刻规格

**状态：** 待用户确认，禁止实施  
**日期：** 2026-07-15  
**事实基线：** 原站提交 `77aa1e7`；新站 Next.js MVP 提交 `29433689`  
**目标：** 在保持纯 Next.js、Markdown 文件发布和当前轻量视觉基线的前提下，选择性恢复原站真正有价值的阅读、发现和个人展示能力；不恢复原站的多框架结构和高耦合桌面外壳。

## 1. 决策摘要

本规格推荐“分层选择性复刻”，不做像素级、路由级或实现级兼容。

1. 第一批恢复阅读闭环：分类/标签/归档、全文搜索、RSS/Atom、目录、扩展 Markdown、代码交互、分享、评论、相关文章和文章 OG 图。
2. 第二批恢复个人展示：关于、项目、时间线、技能、友链、设备、日记和相册；数据改为项目内类型安全文件，不复制旧组件树。
3. 第三批才考虑外部数据：Bangumi 追番页；必须构建期缓存、失败开放，不让外部 API 阻断博客发布。
4. Pages CMS 作为 Markdown 的可选编辑器恢复，不引入数据库 CMS。
5. 永久淘汰 Swup、全屏壁纸状态机、随机壁纸 API、Live2D、音乐播放器、樱花特效、页面缩放、双侧栏编排和客户端文章“加密”等高维护能力。

## 2. 原站叠加的特化实现清单

### 2.1 博客信息架构与发现

| 原站能力 | 原实现特征 | 本规格决策 |
|---|---|---|
| 首页分页 | 37 篇发布文章，每页 8 篇，生成 `/2/` 至 `/5/` | 不复刻分页 URL；首页保留轻量列表，文章增多后再加游标或分页 |
| 分类栏 | 首页按分类导航 | 复刻，改为标准链接和静态分类页 |
| 标签、分类、年份归档 | `/archive/` 客户端多条件筛选，支持重复 query 参数 | 复刻核心，不兼容旧 query 语义；使用 `/tags/[tag]/`、`/categories/[category]/`、`/archive/` |
| Pagefind 全文搜索 | 构建后索引、弹层搜索、中文内容 | 复刻，保留 Pagefind，但改用 Node API 从文章记录生成静态索引 |
| 相关文章、随机文章、前后篇 | 独立文章推荐组件 | 恢复相关文章和前后篇；随机文章不恢复 |
| 阅读统计信息 | 字数、阅读时间、发布日期、最后修改时间 | 恢复发布日期、最后修改时间、中文字数和预计阅读时间 |
| 内容日历、站点统计 | 侧栏日历和运行天数/文章数 | 仅恢复简洁站点统计；交互日历不恢复 |

### 2.2 Markdown 与文章阅读

| 原站能力 | 原实现特征 | 本规格决策 |
|---|---|---|
| GFM 与标题锚点 | 表格、任务列表、脚注式内容、标题 `#` 锚点 | 保留并补齐可访问锚点 |
| Shiki/Expressive Code | 语言徽标、行号、折叠、复制按钮 | 保留 Shiki；新增复制和可选折叠，不恢复 Expressive Code 插件体系 |
| KaTeX | `remark-math` + `rehype-katex` | 复刻，服务端渲染，错误不阻断全文 |
| Mermaid | fence 转客户端图表、主题重绘、全屏/缩放 | 复刻图表和主题；最小 Client Component 懒加载，默认严格安全级别；不做全屏编辑器 |
| Admonition | GitHub Alert 与 `:::note/tip/...` directive | 复刻为统一 directive AST，不接受任意 HTML |
| GitHub 卡片 | `::github{repo="owner/repo"}`，浏览器请求 GitHub API | 复刻静态链接卡；构建期可选拉取元数据，失败退化为普通链接 |
| 图片宽度与表格 wrapper | alt 中宽度语法、横向滚动表格 | 表格 wrapper 复刻；废弃 alt 宽度暗语，改显式 directive |
| 视频 iframe | Markdown 内直接写 YouTube/Bilibili iframe | 不开放任意 raw HTML；改为受控 `::video` directive |
| 文章封面 | 文章页展示 cover | 恢复可选 cover，并要求尺寸/替代文本 |
| TOC | 桌面侧栏、移动弹层、悬浮按钮、滚动高亮 | 复刻为一个响应式目录；服务端提取标题，客户端仅处理滚动高亮 |
| 文章许可证 | CC BY-NC-SA 卡片 | 恢复为文章尾部静态许可说明 |
| 密码文章 | 构建期 AES、浏览器输入密码解密 | 永久淘汰；它不等价于访问控制，也会扩大内容泄漏和索引风险 |

### 2.3 社区、传播与 SEO

| 原站能力 | 原实现特征 | 本规格决策 |
|---|---|---|
| Giscus/Twikoo 评论 | 两套可切换，线上配置为 Giscus | 只恢复 Giscus，按 pathname 严格映射 |
| 分享与海报 | 原生分享、复制链接、Canvas 海报 | 恢复原生分享 + 复制链接；Canvas 海报不恢复 |
| RSS 与 Atom | 两个 XML feed，排除草稿和加密文章 | 恢复；页面正文与 feed 共用同一 Markdown 安全策略 |
| JSON 内容 API | 全部文章元数据、日历数据 | 不恢复公共 JSON API；没有当前消费者 |
| Sitemap/robots/canonical | Astro sitemap、手写 robots、canonical | 当前 Next.js 原生能力保留并扩展到新增页面 |
| 动态 OG 图 | Astro OG route，可配置关闭 | 使用 Next.js `opengraph-image.tsx` 为文章静态生成 1200×630 图 |
| JSON-LD | 文章结构化数据 | 恢复 `BlogPosting`，字段来自同一文章模型 |
| `llms*.txt` | 三种文本导出，覆盖范围不一致 | 只恢复 `/llms.txt` 和 `/llms-full.txt`，由同一文章集合生成 |
| IndexNow | 独立提交脚本 | 暂不恢复；sitemap 足够，后续有收录证据再加 |
| 分析 | Umami 或自定义第三方脚本入口 | 使用 Vercel Web Analytics；不同时装第二套分析 |

### 2.4 个人内容页

| 原站页面 | 原实现特征 | 本规格决策 |
|---|---|---|
| About | Markdown spec + 个人资料/技术栈/统计 | 恢复精简页面 |
| Projects | 项目分类、精选项目卡片 | 恢复，项目数据放 `src/content/projects.ts` |
| Timeline | 时间线卡片 | 恢复，使用静态类型数据 |
| Skills | 技能分类和筛选 | 恢复展示，首版不做客户端筛选 |
| Friends | 友链卡片与脚本 | 恢复，外链安全属性和失效链接测试 |
| Devices | 设备卡片 | 恢复为简单清单 |
| Diary | 瞬间/日记卡片 | 延后到个人展示批次末尾；不与博客文章混用模型 |
| Albums | 文件系统扫描、标签筛选、相册详情、灯箱 | 恢复；显式 manifest + PhotoSwipe 渐进增强 |
| Anime | Bangumi/Bilibili/local 三模式、筛选排序 | 仅保留 Bangumi 构建期快照；删除 Bilibili 凭据流和多 provider 抽象 |

### 2.5 视觉外壳与全局交互

| 原站能力 | 原实现特征 | 本规格决策 |
|---|---|---|
| 多图 Banner | 桌面/移动各 6 张、1.5 秒轮播、水波纹、打字机文案 | 不复刻；保留当前原创夜航主视觉，允许低频静态替换 |
| 三种壁纸模式 | banner/fullscreen/none，随机图与 Bing 数据源 | 永久淘汰 |
| 页面自动缩放 | 以 2000px 为目标整体 scale | 永久淘汰，使用正常响应式布局 |
| 列表/网格切换 | localStorage 布局状态 | 不恢复；由断点决定布局 |
| 多侧栏组件编排 | 左右侧栏、响应式隐藏、widget manager | 永久淘汰；页面只保留必要 aside |
| 音乐播放器 | 本地/Meting、浮动面板、侧栏播放器、快捷键 | 永久淘汰 |
| Live2D Pio | 可拖拽模型、动作和对话 | 永久淘汰 |
| 樱花特效 | 21 粒子、速度/透明度配置 | 永久淘汰 |
| Swup 页面过渡 | head、scripts、preload、progress、a11y 插件与大量重初始化钩子 | 永久淘汰；使用 Next.js 原生导航 |
| 顶部进度、返回顶部 | 全局滚动脚本 | 仅保留无 JS 可用的返回顶部链接；不恢复页面进度条 |
| 主题色调节 | 可变 hue 与显示设置面板 | 不恢复；保留当前明暗主题 |
| 国际化字典 | 中/英/日/繁中大量 UI 文案 | 不恢复多语言 UI；站点固定 `zh-CN`，文章可写任意语言 |

### 2.6 发布、构建与维护

| 原站能力 | 原实现特征 | 本规格决策 |
|---|---|---|
| Pages CMS | `.pages.yml` 直接编辑 GitHub Markdown | 恢复并适配当前最小 frontmatter |
| 独立内容同步 | `init-content-repo`、`sync-content` | 不恢复双仓同步；当前仓库是唯一内容源 |
| 外部数据更新 | Bangumi、Bilibili、壁纸脚本 | 只保留 Bangumi 快照任务，带超时和旧缓存回退 |
| 字体压缩、图片转换 | 项目脚本批处理 | 不恢复自建字体压缩；图片仅提供一条显式优化命令 |
| Lighthouse 基线 | 独立配置和性能脚本 | 用 Playwright + axe + Lighthouse CI 的小型预算替代旧脚本集合 |
| 三套 GitHub Actions | CI/build/lint 重叠 | 保持当前单一 CI，不拆回多 workflow |

## 3. 网络调研与方案对比

### 3.1 总体架构候选

#### 方案 A：原站功能逐项移植

- 做法：把旧 Astro/Svelte 组件逐个翻译成 React。
- 优点：表面功能最接近原站。
- 缺点：会复制旧状态机、重复组件和维护成本；与“纯 Next.js 重写、无需兼容”冲突。
- 结论：拒绝。

#### 方案 B：选择性复刻 + 成熟模块替换（推荐）

- 做法：保留当前文章域模型和 Server Component 页面；为搜索、评论、相册采用成熟方案；每种交互只有一个最小 Client Component。
- 优点：保留用户可感知价值，同时继续维持低依赖、低 JavaScript 和可测试边界。
- 缺点：不会与旧站像素一致，旧 URL 和细碎交互不保留。
- 结论：采用。

#### 方案 C：引入完整博客/CMS 框架

- 做法：改用 Fumadocs、Nextra、Sanity 等一体化内容系统。
- 优点：功能多、后台成熟。
- 缺点：再次迁移内容模型，引入新约束，当前 37 篇 Markdown 规模明显用不到。
- 结论：拒绝。

### 3.2 推荐组件与依据

| 需求 | 推荐方案 | 不选方案及原因 |
|---|---|---|
| 路由、SEO、OG | Next.js App Router 的 `generateStaticParams`、`generateMetadata`、metadata files、`ImageResponse` | 不自建 head 管理或独立 OG 服务；Next.js 16.2 已提供静态优化与缓存约定 |
| RSS/Atom/llms | App Router Route Handlers，项目内确定性 XML/text serializer | 不引入运行时 CMS API；这些响应可由构建时文章集合生成 |
| 搜索 | Pagefind Node API `addCustomRecord`，在 `next build` 前写入 `public/pagefind`；自建无样式 React 搜索框 | 不直接扫描 `.next` 内部目录；不选服务端搜索或数据库；Pagefind 对中文/日文有 extended 支持且索引分块 |
| Markdown 数学 | `remark-math` + `rehype-katex`，服务端生成 HTML，`throwOnError: false` 等价降级 | 不在浏览器重复渲染数学公式 |
| Mermaid | `mermaid` 动态导入，`securityLevel: "strict"`，`startOnLoad: false`，主题变化后重绘 | 不使用 `loose`；不接受图内脚本或点击回调 |
| Admonition/视频/GitHub 卡 | `remark-directive` + 项目自有白名单转换器 | 不启用通用 `rehype-raw`，避免任意 HTML 扩大 XSS 面 |
| 评论 | `@giscus/react`，GitHub Discussions，pathname 严格映射 | 删除 Twikoo：它需要额外后端且形成双评论系统 |
| 相册 | PhotoSwipe Lightbox 动态导入；manifest 记录宽高；普通图片链接作为无 JS fallback | 不自建缩放、手势和灯箱；不在运行时扫描文件系统 |
| 内容编辑 | Pages CMS 托管应用 + 根目录 `.pages.yml` | 不引入数据库 CMS；Pages CMS 直接修改 GitHub 文件并保留 Git 历史 |
| 分享 | `navigator.share()`，不支持时复制 canonical URL | 不恢复 Canvas 海报；Web Share 并非所有浏览器可用，因此必须有复制回退 |
| 分析 | `@vercel/analytics/next`，只记录匿名页面数据 | 不同时恢复 Umami；避免重复统计、脚本和隐私配置 |
| 追番 | Bangumi API 构建期拉取到已提交或缓存的 JSON 快照 | 不在页面请求时依赖 API；不恢复需要用户凭据的 Bilibili SESSDATA 流程 |

调研依据：

- [Next.js 16.2 metadata 与 OG 文件约定](https://nextjs.org/docs/app/api-reference/file-conventions/metadata)
- [Next.js Route Handlers 可输出 RSS/XML/text](https://nextjs.org/docs/app/guides/backend-for-frontend)
- [Pagefind Node API](https://pagefind.app/docs/node-api/) 与 [CJK extended 安装说明](https://pagefind.app/docs/installation/)
- [Giscus 的 GitHub Discussions 映射模型](https://giscus.app/)
- [Mermaid securityLevel 配置](https://mermaid.js.org/config/usage.html)
- [KaTeX 服务端 renderToString](https://katex.org/docs/api)
- [PhotoSwipe 渐进增强与动态加载](https://photoswipe.com/getting-started/)
- [Pages CMS 的 Git 文件编辑模型](https://pagescms.org/docs/)
- [Bangumi API](https://bangumi.github.io/api/)
- [Vercel Web Analytics](https://vercel.com/docs/analytics)
- [Web Share API 与兼容性限制](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API)

## 4. 目标架构

### 4.1 边界

- `src/lib/content/`：文章解析、schema、派生 taxonomy、feed、搜索记录和相关文章；不得依赖 React。
- `src/lib/markdown/`：统一 Markdown AST 管线和白名单扩展；页面、feed、搜索共享同一来源。
- `src/app/`：仅负责路由、metadata 和 Server Component 组合。
- `src/components/content/`：纯展示组件；默认 Server Component。
- `src/components/interactive/`：搜索、主题、TOC 高亮、分享、Giscus、Mermaid、PhotoSwipe；每个文件必须显式 `use client`，互不共享全局状态。
- `src/content/`：文章及个人页面数据的唯一事实源。
- `scripts/`：只容纳构建前生成搜索索引、外部数据快照和验收脚本。

### 4.2 数据流

```text
Markdown/frontmatter
        |
        v
严格 schema 与规范化文章模型
        |
        +--> Server Components --> HTML 页面 / metadata / JSON-LD / OG
        +--> taxonomy -----------> archive / tags / categories
        +--> feed serializer ----> RSS / Atom / llms
        +--> search records -----> Pagefind 静态索引
        +--> recommendation -----> 相关文章 / 前后篇
```

任何分支不得重新读取并自行解释 frontmatter。新增 frontmatter 字段必须先进入统一 schema。

### 4.3 建议文章字段

```ts
type Post = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  draft: boolean;
  tags: string[];
  category?: string;
  cover?: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  comment: boolean;
  body: string;
};
```

不恢复 `password`、`encrypted`、`alias`、`permalink`、`priority` 和运行时布局字段。旧文章若含这些字段，解析器忽略而不是提供兼容行为。

## 5. 发布批次

### 批次 A：阅读与发现闭环

交付：taxonomy、归档、搜索、RSS/Atom/llms、TOC、数学、Mermaid、Admonition、受控视频/GitHub 卡、代码复制与折叠、文章元信息、分享、Giscus、相关文章、JSON-LD、文章 OG、Pages CMS。

完成条件：一个新访客可以发现文章、搜索、阅读复杂内容、分享、订阅和评论；关闭 JavaScript 时正文、分类链接、feed 和基本导航仍可用。

### 批次 B：个人展示

交付：About、Projects、Timeline、Skills、Friends、Devices、Diary、Albums + PhotoSwipe。

完成条件：所有数据来自类型安全静态文件；每个页面有 metadata、空状态、移动布局和无 JS fallback；不新增通用页面构建器。

### 批次 C：外部数据

交付：Bangumi 追番快照页、手动刷新任务和缓存回退。

完成条件：无凭据也能构建；API 超时或失败仍使用最后一份有效快照；博客文章发布不依赖该任务成功。

批次必须按 A → B → C 独立规格、计划、PR 和生产验收，不允许一次性重新堆回所有功能。

## 6. 非功能要求

- 保持 Next.js App Router、React 和 TypeScript；禁止 Astro、Svelte、Vue 或第二套路由框架。
- Server Components 优先；新增 Client Component 每个 gzip 后目标小于 20 KiB，Mermaid/PhotoSwipe 必须动态加载且不计入首页初始包。
- 不兼容旧 URL、旧 query 参数、旧 DOM 选择器、旧 localStorage key 或旧 CSS class。
- 文章正文不因功能复刻被批量改写；扩展语法只改实际使用对应能力的少数文章。
- 所有外部请求必须有 8 秒超时、明确 User-Agent、失败开放和可测试 fixture。
- Markdown 不允许任意 raw HTML；URL 协议继续使用当前 sanitizer。
- 首页无搜索操作时不得下载 Pagefind 索引；文章无 Mermaid 时不得下载 Mermaid。
- 新页面必须满足键盘导航、可见焦点、减少动态效果、360px 无横向溢出和 axe serious/critical 为零。
- CI 保持一个 workflow；每批至少运行 framework scan、lint、typecheck、unit/integration、build 和 Playwright。

## 7. 验收矩阵

### 批次 A

- 37 篇发布文章均生成唯一 canonical、一个 H1、有效 `BlogPosting` 和文章 OG 图。
- taxonomy 派生结果与 frontmatter 一致；草稿不出现在页面、搜索、feed、sitemap 或 llms。
- 已知中文关键词能在 Pagefind 命中目标文章；索引不含导航、评论和代码复制按钮文本。
- RSS 与 Atom XML 可解析、顺序稳定、URL 为绝对地址；`llms-full.txt` 覆盖全部发布文章。
- 数学、Mermaid、五种 Admonition、受控视频、GitHub 卡、表格、代码复制/折叠均有 fixture 测试。
- Mermaid 保持 strict，加载失败显示可复制源码；Giscus 加载失败不影响正文。
- 无 JS 时文章、目录链接、分类标签、RSS/Atom 地址和代码内容可读。

### 批次 B

- 8 个个人页面均有 200、metadata、空状态和移动端验收。
- PhotoSwipe 仅在相册交互后加载；所有相片有宽高和 alt；无 JS 时链接打开原图。
- Friends 外链使用 `noopener noreferrer`，失效 URL 在 CI 报告但不阻断临时网络失败。

### 批次 C

- Bangumi fixture 可确定性生成页面；真实 API 失败时构建使用最后有效快照并发出 warning。
- 快照中不包含 token、cookie 或私有用户数据。

## 8. 明确不实施的内容

- 不恢复原站视觉像素、旧路由兼容和旧 CSS。
- 不恢复 Swup、壁纸/轮播/水波纹、Live2D、音乐、樱花、主题 hue、双侧栏、布局切换、页面缩放、文章客户端加密、Canvas 分享海报、Twikoo、Bilibili 私有凭据同步、IndexNow、双仓内容同步。
- 不在本规格确认前创建实现计划、安装依赖、修改应用代码、创建 PR 或部署。

## 9. 确认后的下一步

用户确认本规格后，只为“批次 A：阅读与发现闭环”创建逐步实施计划。批次 B 和 C 保持未启动；它们必须在前一批生产验收后再次确认。
