# 当前仓库架构

## 已验证技术栈

- Astro：^6.4.8
- Svelte：^5.56.4
- TypeScript：^6.0.3
- Tailwind CSS：^4.3.2
- 输出模式：static

## 结构计数

- 页面入口：23
- Astro 组件：112
- Svelte Islands：52
- 脚本：13
- Remark/Rehype/构建插件：12
- GitHub Actions：4

## 职责边界

- src/pages：文件系统路由、API、Feed、OG 图片和 404。
- src/layouts 与 src/components：共享页面结构、Astro 服务端模板和 Svelte 交互 Islands。
- src/content 与 src/content.config.ts：文章、独立页面内容和 Frontmatter Schema。
- src/plugins：Markdown、代码块、Mermaid、图片尺寸、Admonition 和 GitHub 卡片转换。
- scripts：内容同步、外部数据更新、字体压缩、性能基线和 IndexNow。
- public：图片、字体、脚本与搜索/验证静态资源。
- .github/workflows 与 vercel.json：CI 和部署约定；本阶段不修改生产状态。

依赖、服务和风险的逐项证据分别见 dependency-inventory.md、external-dependencies.md 与 migration-risk-register.md。
