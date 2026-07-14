# Next.js 迁移前置基础设施报告

## 当前状态

READY WITH RISKS

## 工作区

- 分支：`codex/chore/nextjs-migration-foundation`
- Worktree：`/home/xinvdev/xinvxueyuan-blog/.worktrees/nextjs-migration-foundation`
- 起始 Commit：`77aa1e7e5fde74b8fbaf6e060ca8e112ca8bb9f9`
- 结束 Commit：以最终验证后的 HEAD 为准
- 工作区：最终提交后要求干净

## Skills

- 已学习：Superpowers 工作流、Next.js/React/组件模式、浏览器与验证、部署门禁。
- 已固定：frontend-design、vercel-composition-patterns、web-design-guidelines-local。
- 未启用：impeccable，C 级风险（运行时下载、Hooks/全局写入等）。
- Meta Skill：项目内草案，不安装全局。

## 项目基线

- 构建：通过，57 个 HTML，Pagefind 39 页。
- 类型检查：独立 tsc 失败；Astro check 通过。
- Lint：只读 ESLint 失败；原脚本带 `--fix` 未执行。
- 测试：7 个基础设施测试通过。
- 浏览器：线上代表页与本地 Preview 通过抽样；18 张截图。
- 路由：211 条统一记录，57 条 Sitemap，98 条查询 URL。
- 内容：38 篇文章，37 发布、1 草稿。
- 外部依赖：37 个服务/主机记录（含配置注入的 Twikoo 端点）。

## 关键发现

1. 分类/标签通过 archive 查询参数实现，必须保留查询语义。
2. 线上 HTML 未发现 canonical；构建也未产出 OG PNG，SEO 需在新站显式重建。
3. 当前构建依赖网络刷新追番/壁纸；确定性与离线回退是迁移重点。
4. Markdown、Pagefind、音乐、壁纸和多种内容专页是隐性迁移范围，不能只搬文章模板。
5. Landmark、Skip Link、Heading/Label 和 CLS 是旧站可改善基线，不应照搬缺陷。

## 阻塞项与风险

- 当前无阻止“设计阶段”的硬阻塞。
- 实现前需解决内容同步验证；发布前需补齐稳定 Lighthouse/axe、全量 URL 回归和回滚演练。

## 证据入口

- 命令与构建：`baseline-command-results.md`、`build-artifact-inventory.md`。
- 内容与路由：`content-inventory.json`、`current-route-inventory.csv`、`url-compatibility-baseline.csv`。
- 视觉/性能/A11y：对应三份 baseline 报告和 `artifacts/baseline/`。
- Skills 与风险：`skills-manifest.md`、`migration-risk-register.md`。

## 下一阶段入口

可以在用户验收后进入自主设计；不能自动进入编码、Preview 或生产发布。

## 需要用户验收的唯一事项

接受本基础设施与风险边界，并批准下一阶段开始自主设计。
