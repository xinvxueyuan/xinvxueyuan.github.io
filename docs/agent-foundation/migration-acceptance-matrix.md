# Next.js 迁移验收矩阵

每项都必须同时满足自动与人工标准。`旧站基线` 是迁移起点，不代表缺陷必须复制；明确列出的可访问性/SEO缺口应改进。

## 内容完整性

| 验收项 | 旧站基线 | 目标 | 自动检查方式 | 人工检查方式 | 通过标准 | 证据文件 |
| --- | --- | --- | --- | --- | --- | --- |
| 已发布文章 | 37 发布、1 草稿 | 数量与发布状态不丢失 | 内容清单 JSON diff | 抽查最新/最旧/草稿 | 数量、slug、draft 全等 | content-inventory.json |
| 标题/日期/正文/Frontmatter | 17 类字段，0 缺失必填 | 字段和值保持 | 内容哈希和 schema test | 抽查复杂文章 | 无未批准差异 | content-schema-report.md |
| 图片/附件 | 60 个内容图片文件，0 已知失效引用 | 全部可加载 | 构建链接与 HTTP 检查 | 查看图文文章/相册 | 0 失效资源 | content-link-check.json |
| 内部链接 | 扫描无已知失效内容内链 | 全部可达 | 全站 link crawler | 抽查中文 URL/锚点 | 0 未解释 4xx/断锚 | url-compatibility-baseline.csv |
| 内容仓库同步 | 脚本可克隆并替换目录，当前未验证私库权限 | 等价且非破坏同步 | 隔离 fixture 集成测试 | Preview 更新一篇测试内容 | 不备份/覆盖错误目录，可回滚 | external-dependencies.md |

## URL 与 SEO 兼容性

| 验收项 | 旧站基线 | 目标 | 自动检查方式 | 人工检查方式 | 通过标准 | 证据文件 |
| --- | --- | --- | --- | --- | --- | --- |
| 路由集合 | 211 条统一记录，57 条 Sitemap，98 条查询 URL | 重要 URL 原样保留 | 路由 CSV diff + HTTP probe | 抽查导航和历史链接 | 原样 200；例外有 308 | current-route-inventory.csv |
| 标签/分类 | `/archive/?tag=`、`?category=` | 查询语义保持 | 参数化 E2E | 点选标签/分类 | 筛选结果与数量一致 | url-compatibility-baseline.csv |
| 分页/Trailing slash | `/2/` 至 `/5/` 等目录 URL | 策略一致 | URL matrix | 地址栏/刷新检查 | 无重定向环或重复内容 | current-route-inventory.csv |
| 中文 Slug/编码 | 多个中文文章路径 | 编码前后同一资源 | encoded/decoded probe | 分享链接抽查 | 200 且正文相同 | current-route-inventory.csv |
| Canonical | 线上 HTML 未发现 | 每个可索引页有唯一规范 URL | DOM/HTML audit | 查看代表页源码 | 与最终 URL 一致 | migration-risk-register.md |
| Open Graph/Twitter/JSON-LD | 配置/源码存在，构建无 OG PNG | 显式等价实现 | 元数据快照 | 社交预览抽查 | 页面类型字段完整 | build-artifact-inventory.md |
| RSS/Atom/Sitemap/robots | 构建均存在 | 地址和内容语义保持 | XML/schema/snapshot | 浏览器打开 | 200、合法、条目正确 | build-artifact-inventory.md |
| llms 文件 | llms、llms-full、llms-small 存在 | 至少保留现有公开地址 | 内容/路由检查 | 抽查正文索引 | 200 且覆盖文章 | build-artifact-inventory.md |
| 404 | 不存在 URL 返回 HTTP 404 | 保持真实 404 | HTTP E2E | 查看页面 | 状态 404 且有导航 | browser-observations.json |
| IndexNow/验证文件 | 有 IndexNow 脚本和静态验证入口 | 独立发布步骤、禁止构建隐式提交 | dry-run/fixture | Preview 核查文件 | 无生产副作用 | external-dependencies.md |

## Markdown 能力

| 验收项 | 旧站基线 | 目标 | 自动检查方式 | 人工检查方式 | 通过标准 | 证据文件 |
| --- | --- | --- | --- | --- | --- | --- |
| Mermaid | 内容扫描 7 次；代表页 6 SVG | 服务端安全产出或最小客户端增强 | fixture + DOM SVG count | 查看复杂图 | 无错误占位，移动端不溢出 | content-inventory.json |
| KaTeX | 内容扫描 3 次；代表页 2 节点 | 数学语义/样式等价 | fixture + DOM count | 查看行内/块级公式 | 可读、无溢出 | browser-observations.json |
| Admonition/Directive/GitHub 卡片 | 1/7/1 | 全量支持 | Markdown fixture tests | 抽查原文章 | 类型、链接、样式保留 | content-schema-report.md |
| 代码高亮/语言 | 19 种 fence 语言 | 语法与回退一致 | 逐语言 snapshot | 抽查明暗主题 | 无丢失/错色影响阅读 | content-inventory.json |
| 行号/折叠/复制 | 教程 49 代码块、49 复制按钮 | 功能等价且键盘可用 | DOM/clipboard E2E | 复制长代码 | 内容完全一致 | browser-observations.json |
| 标题锚点/表格/图片尺寸/外链 | Remark/Rehype 插件链提供 | 保持语义与 URL | HTML snapshot/link policy tests | 抽查复杂教程 | 锚点有效、表格可读、外链策略一致 | repository-architecture.md |

## 页面功能

| 验收项 | 旧站基线 | 目标 | 自动检查方式 | 人工检查方式 | 通过标准 | 证据文件 |
| --- | --- | --- | --- | --- | --- | --- |
| 首页/文章/归档 | 均构建并线上可用 | 功能、内容和路由等价 | E2E + screenshot diff | 三视口浏览 | 无关键功能缺失 | current-visual-baseline.md |
| 搜索 | Pagefind 索引 39 页/4480 词 | 可搜索已发布内容 | 已知词查询 fixture | 搜索中英文词 | 结果包含目标文章 | production-build.log |
| 相册/日记/追番/项目 | 线上专页均加载 | 等价页面与数据降级 | 路由/DOM E2E | 查看空/失败态 | 内容存在，API 失败可降级 | browser-observations.json |
| 主题切换 | github-light/github-dark | 切换且持久化 | storage + screenshot E2E | 检查对比度 | 刷新后保持、无闪烁阻断 | current-visual-baseline.md |
| 移动导航 | 390×844 有菜单入口 | 键盘/触摸可用 | viewport E2E | 真机/模拟点击 | 可达全部一级入口 | mobile-nav--390x844--light.png |
| 音乐/壁纸/日历 | 客户端增强和外部数据 | 最小 Client Component，失败不挡正文 | 网络阻断 E2E | 操作控件 | 核心内容 fail-open | external-dependencies.md |

## 工程质量、性能与可访问性

| 验收项 | 旧站基线 | 目标 | 自动检查方式 | 人工检查方式 | 通过标准 | 证据文件 |
| --- | --- | --- | --- | --- | --- | --- |
| 框架边界 | Astro 6 + Svelte 5 | 纯 Next.js App Router | dependency/import scan | 架构评审 | 无 Astro/Svelte 页面运行依赖 | dependency-inventory.md |
| RSC/Client 边界 | 52 个 Svelte Islands | Server Components 优先 | client directive budget | 组件评审 | 客户端仅最小交互岛 | repository-architecture.md |
| TypeScript/Lint/Build/Test | Astro check/build 绿；tsc/eslint 旧站失败；7 个基础测试绿 | 严格检查全部绿 | CI 必需检查 | 评审豁免 | 0 未解释错误 | baseline-command-results.md |
| Hydration/Console | 抽样无 page error | 无未解释错误/警告 | browser console E2E | 交互浏览 | 0 error，无明显闪烁 | browser-observations.json |
| 可重复构建 | 当前构建受外部数据和壁纸影响 | 锁定输入、可离线回退 | 双构建 hash/diff | 审查日志 | 内容产物确定性 | production-build.log |
| 性能 | JS 1.79 MB；单次 CLS 0.16-0.24 | 无解释不得显著回退，CLS <=0.1 | 固定 LHCI 多次采样 | 低端移动体验 | 阈值通过或有批准解释 | performance-baseline.md |
| 图片/字体 | 36.2 MB 图片、15.7 MB 字体产物 | 按需优化与加载 | bundle/resource budget | 视觉质量抽查 | 体积有界、无模糊回退 | build-artifact-inventory.md |
| A11y | 缺 Landmark/Skip Link，存在 heading/label 缺口 | Lighthouse A11y >=0.90 且关键缺口清零 | axe + LHCI + keyboard E2E | 屏幕阅读/暗色抽查 | 0 serious/critical | accessibility-baseline.md |
| 无 JavaScript | 构建 HTML 含正文；浏览器仿真未完成 | 正文、导航、链接可读 | 禁 JS E2E | 浏览器禁 JS | 核心内容完整 | accessibility-baseline.md |

## 发布与回滚

| 验收项 | 旧站基线 | 目标 | 自动检查方式 | 人工检查方式 | 通过标准 | 证据文件 |
| --- | --- | --- | --- | --- | --- | --- |
| Preview 优先 | 当前生产不变 | 每个阶段先 Preview | CI deployment policy test | 用户打开 Preview | Preview URL 可回归 | next-phase-entry-criteria.md |
| 用户验收 | 本阶段只验收基础设施 | 设计方向 + 最终 Preview 两次 | 验收记录存在性 | 用户明确批准 | 无批准不 Promote | xinvstar-nextjs-autopilot/SKILL.md |
| Promote | 本阶段禁止 | 仅用户单独明确指令 | 权限/环境 gate | 用户确认 | 不可自动触发 | AGENTS.md |
| 回滚 | Git Worktree/Commit 可恢复 | 部署与内容均有回滚 | rollback rehearsal | 审查 runbook | 可恢复旧生产 Commit | environment-report.md |
