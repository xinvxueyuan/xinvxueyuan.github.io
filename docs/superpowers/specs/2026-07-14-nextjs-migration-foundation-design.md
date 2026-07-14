# Next.js 迁移前置基础设施设计

## 状态

- 设计日期：2026-07-14
- 用户批准：已批准并行迁移
- 当前阶段：迁移前置准备
- 目标站点：https://www.xinvstar.xyz
- 目标仓库：https://github.com/xinvxueyuan/xinvxueyuan.github.io

## 目标

在不重写现有 Astro/Svelte 站点、不改变生产环境、不修改文章正文和 URL 的前提下，建立一套隔离、可恢复、可审计的迁移基础设施。该基础设施必须准确描述旧站，并为后续纯 Next.js App Router 重构提供可重复执行的基线、风险清单、验收矩阵和自主工作流入口。

## 迁移策略

采用并行迁移。现有 Astro 站点在整个准备阶段保持可构建、可运行，并作为功能、内容、视觉、SEO 和性能参照。Next.js 实现将在后续阶段独立开展；只有 Preview 通过自动验收和用户验收后，才允许讨论生产切换。

## 范围

本阶段交付：

1. 验证环境、仓库、内容来源、部署配置和工具版本。
2. 创建专用 Worktree 和分支，保留可恢复提交历史。
3. 审计迁移所需 Skills，对安全等级 A/B 的能力启用或项目内固定，对 C/D 级能力只记录风险。
4. 建立项目级代理规则和基础工程入口。
5. 盘点代码结构、依赖、内容、路由、构建产物和外部服务。
6. 运行旧站检查、构建、浏览器、SEO、性能、可访问性与视觉基线。
7. 建立迁移风险登记册、验收矩阵、下一阶段入口条件和 Meta Skill 草案。
8. 提交结构化前置准备报告并停止，等待用户验收。

本阶段禁止：

- 创建 Next.js 页面或开始业务迁移。
- 删除或替换 Astro、Svelte 和现有依赖。
- 修改生产部署、DNS、正式域名或 Vercel Production。
- 自动 Promote、自动发布或自动提交外部系统变更。
- 修改文章正文、Frontmatter 或 URL 来消除扫描问题。
- 修复与基线建设无关的现有缺陷。

## 基础设施来源与边界

从 `~/lingchu-bot` 只迁移与项目无关且已验证有效的工程模式：

- 根目录 `.editorconfig` 的跨语言编辑规范。
- `Taskfile.yml` 统一的人类/CI 命令入口和只读检查约定。
- GitHub Actions 的最小权限、并发取消、固定 Action SHA 和按变更范围触发的思路。
- `AGENTS.md` 的 CREATE 式稳定约束、证据优先和工具所有权边界。
- lint、typecheck、build、browser verification 分层和完成前验证。

不得搬运：Python/NoneBot 配置、机器人运行时、数据库矩阵、Fumadocs 业务结构、PyPI/GHCR 发布、项目特定许可策略，以及任何与博客无关的命令或路径。

## 产物架构

### 项目治理层

- `AGENTS.md`：跨代理稳定规则和阶段边界。
- `.editorconfig`：编辑器基线。
- `Taskfile.yml`：准备阶段命令入口，不隐藏失败。
- `.github/actions/detect-foundation-changes/action.yml`：只识别本项目相关文件类别。
- `.github/workflows/migration-foundation.yml`：只读验证，不部署。

### 自动采集层

- `scripts/migration-foundation/`：内容、路由、构建产物和链接采集脚本。
- 脚本只读取源码、构建产物和公开网页；输出到 `docs/agent-foundation/` 或 `artifacts/baseline/`。
- 所有 JSON/CSV 输出应稳定排序、UTF-8 编码并可重复生成。

### 证据层

- `docs/agent-foundation/`：人类可审阅的事实、风险和验收文档。
- `artifacts/baseline/`：日志、截图、Lighthouse 与路由探测原始证据。
- 报告必须区分“代码推断”“本地运行验证”“线上验证”和“未验证”。

### 编排层

- `.agent-skills/xinvstar-nextjs-autopilot/SKILL.md`：项目内、暂不启用的 Meta Skill 草案。
- 只编排已审计能力，禁止复制大段第三方 Skill 内容或执行远程可变指令。

## 数据流

源码、构建产物和公开线上站点分别采集，生成独立原始证据；归一化脚本将三类证据合并为内容、路由和依赖清单；人工可读报告引用原始证据路径；迁移验收矩阵再以这些事实作为旧站基线。任何来源冲突都保留并标记，不静默选择其中一个。

## 错误与安全策略

- 缺少凭据时不输出或猜测秘密，只记录受影响的基线项目。
- 外部 API、网络或浏览器失败时保存日志和响应，不把环境失败等同于功能失败。
- lint 脚本若默认修复，改用底层只读命令；不得为完成基线而格式化源码。
- Skills 必须记录来源、Commit、许可证、脚本、网络与写入范围；C 级只下载审计，D 级不安装。
- 不执行 `curl | sh`、`wget | bash`、`sudo` 或来源不明的压缩/混淆脚本。

## 验证策略

验证分为环境、静态检查、构建、产物、内容、路由、浏览器、性能、可访问性和 Git 十层。每层记录命令、起止时间、退出码、结果摘要、日志路径和工作区变更。最终必须运行生成器重复性检查、`git diff --check`、工作区状态检查，并确认没有 Next.js 实现、生产配置变更或文章内容变更。

## 完成定义

只有附件规格列出的全部文档、原始证据目录、验收矩阵和 Meta Skill 草案均已生成，安全可用的 Skills 已完成审计，基线命令与浏览器采样已有新鲜证据，所有变更已按主题提交，且 `next-phase-entry-criteria.md` 给出明确状态后，本阶段才可结束。结束后不得自动进入 Next.js 设计或编码。
