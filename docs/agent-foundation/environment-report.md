# 环境报告

## 采集信息

- 采集日期：2026-07-14（Asia/Shanghai）
- 操作系统：WSL2 Linux，内核 `6.18.33.2-microsoft-standard-WSL2`
- Shell：`/usr/bin/zsh`
- 当前 Worktree：`/home/xinvdev/xinvxueyuan-blog/.worktrees/nextjs-migration-foundation`
- Git 根目录：同上
- 当前分支：`codex/chore/nextjs-migration-foundation`
- 起始 Commit：`77aa1e7e5fde74b8fbaf6e060ca8e112ca8bb9f9`
- 远程：`origin` 指向 `https://github.com/xinvxueyuan/xinvxueyuan.github.io.git`
- Git：2.47.3
- Node.js：24.18.0（加载项目用户 Shell 环境后）
- pnpm：10.22.0
- npm：12.0.0
- 包管理声明：`pnpm@10.22.0`
- 项目引擎下限：Node.js >=22.12.0，pnpm >=10.0.0

## 隔离与恢复

- 原始检出：`/home/xinvdev/xinvxueyuan-blog`，`main`，创建前工作区干净。
- 隔离方式：Git linked Worktree。
- 项目本地 Worktree 目录：`.worktrees/nextjs-migration-foundation`。
- `.worktrees/` 已加入分支内 `.gitignore`；创建前通过 `.git/info/exclude` 做本机引导忽略，避免污染 `main`。
- 专用分支：`codex/chore/nextjs-migration-foundation`。
- 第一个恢复点：`50156fe chore: isolate Next.js migration worktree`。
- 未检测到 Git Submodule 或上级 Superproject。

## 非敏感配置存在性

- `.env*`：存在 `.env.example`；没有读取或输出任何真实凭据值。
- Vercel：存在 `vercel.json` 和 `.vercel` 忽略规则。
- GitHub Actions：存在 `.github/workflows/CI.yml`、`build.yml`、`lint.yml`。
- 内容仓库：当前没有根目录 `content/` 独立检出或 Submodule；`scripts/sync-content.js` 支持通过 `CONTENT_REPO_URL` 克隆到忽略的 `content/`，再把 posts/spec/data/images 链接或复制到站点目录。
- 私有仓库权限：尚未验证；当前跟踪的 `src/content/` 足以建立代码与本地内容基线。
- Symlink/Junction：项目源码三层内未发现；依赖目录中存在 pnpm 正常符号链接。
- 环境变量名：已发现内容同步、IndexNow 和 Bilibili 等配置入口；只记录名称，值未读取。

## 可用自动化能力

- 浏览器：Codex Chrome 控制、Windows computer-use、Vercel agent-browser、agent-browser-verify、verification，以及网络读取工具。具体采用哪一个由基线阶段按登录态、截图和网络日志需求选择。
- 子代理：运行环境支持多代理机制；本任务未授权把实现拆给子代理，因此当前按单代理执行。
- Skill 管理：内置 `skill-installer` 和 `skill-creator` 可用；第三方 Skill 必须先审计再决定项目内固定或拒绝。

## 初始安装与检查证据

### 依赖安装

- 命令：`source ~/.zshrc >/dev/null 2>&1; pnpm install --frozen-lockfile`
- 结果：退出码 0，锁文件无需解析更新，安装/链接 1525 个包。
- 工作区影响：只生成被忽略的 `node_modules/`，`pnpm-lock.yaml` 未修改。

### Astro 检查

- 命令：`pnpm check`
- 结果：退出码 0；295 个文件，0 error、0 warning、1 hint。
- 提示：`ProjectCard.astro` 中 `getCategoryText` 未使用。
- 额外基线：Astro Markdown 插件配置有弃用提示；`dockerignore` 代码语言回退为 txt；KaTeX 对数学模式中的中文字符给出严格模式提示。
- 处理：本阶段只记录，不修改旧站源码。

## 当前风险

1. 非交互 Shell 初始暴露 Node.js 20.19.2；加载 `~/.zshrc` 后为 24.18.0。所有自动化必须显式选择满足项目引擎约束的 Node 环境。
2. `pnpm lint` 实际执行 `eslint ./src --fix`，不是只读基线命令。等价只读命令稳定失败：ESLint 10.7.0 加载 `eslint.config.js` 时发现 `astro-eslint-parser@2.1.0` 没有 default export。配置导入从 2025 年初始脚手架起未变，依赖已升级；本阶段不修改旧站 lint 架构。
3. `pnpm type-check` 稳定失败。第一层是 TypeScript 6.0 将 `baseUrl` 视为 TS5101 弃用错误；使用只读 CLI 覆盖 `--ignoreDeprecations 6.0` 后仍暴露 Astro 生成类型冲突、可选驱动类型、组件模块声明和第三方声明错误。`astro check` 仍为 0 error。
4. `predev` 与 `prebuild` 默认尝试内容同步，且 `prebuild` 使用的 shell 条件组合可能在同步失败后仍继续；基线必须明确记录 `ENABLE_CONTENT_SYNC` 和外部数据输入。
5. 内容同步脚本通过字符串拼接调用 `git clone`，且会备份/替换站点内容目录；在确认来源与权限前不得运行独立内容初始化。
