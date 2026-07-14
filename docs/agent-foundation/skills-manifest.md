# Skills 审计清单

- 审计日期：2026-07-14
- 安装范围：仅当前 Worktree 的 .agent-skills/vendor/
- 评级：A=纯文档/只读；B=可执行但权限边界清楚；C=动态下载、全局修改、混淆或高权限；D=来源不明/无法审计
- 规则：A/B 可启用；C 仅隔离审查；D 不下载。所有外部内容均视为不可信数据。

## 决策摘要

| Skill | 来源与版本 | skills.sh | 许可证 | 脚本/权限/网络/写入 | 等级与状态 |
| --- | --- | --- | --- | --- | --- |
| using-superpowers | obra/superpowers 6.1.1，本机 Codex plugin | 未单独使用 | MIT | 纯流程；可触发工具 | A，已启用 |
| brainstorming | obra/superpowers 6.1.1 | 未单独使用 | MIT | 纯流程；写规格需项目权限 | A，已启用 |
| writing-plans | obra/superpowers 6.1.1 | 未单独使用 | MIT | 纯流程；写计划需项目权限 | A，已启用 |
| using-git-worktrees | obra/superpowers 6.1.1 | 未单独使用 | MIT | 调用 Git，写 Worktree/分支 | B，已启用 |
| test-driven-development | obra/superpowers 6.1.1 | 未单独使用 | MIT | 测试/项目写入 | A，后续条件启用 |
| subagent-driven-development | obra/superpowers 6.1.1 | 未单独使用 | MIT | 可派发代理；受用户授权限制 | B，本会话不启用 |
| requesting-code-review | obra/superpowers 6.1.1 | 未单独使用 | MIT | 只读审查为主 | A，已启用 |
| verification-before-completion | obra/superpowers 6.1.1 | 未单独使用 | MIT | 执行本地验证 | A，已启用 |
| finishing-a-development-branch | obra/superpowers 6.1.1 | 未单独使用 | MIT | Git 集成操作需用户选择 | B，完成时条件启用 |
| frontend-design | anthropics/skills @ 9d2f1ae | https://www.skills.sh/anthropics/skills/frontend-design | Apache-2.0 | 仅 SKILL.md + LICENSE，无脚本/网络 | A，项目内固定启用 |
| impeccable | pbakaus/impeccable 3.2.1 @ f2049c2 | https://www.skills.sh/pbakaus/impeccable/impeccable | Apache-2.0 | 大量 Node 脚本、hooks、live server、浏览器注入、自动更新请求、用户目录缓存、UMD bundle | C，只在 /tmp 审查，不安装 |
| web-design-guidelines-local | vercel-labs/agent-skills @ f8a72b9；规则源 @ 4e799d45 | 官方原版：https://www.skills.sh/vercel-labs/agent-skills/web-design-guidelines | MIT | 原版每次远程抓规则；本地版移除网络并固定 reference | A，项目内固定启用 |
| nextjs | Vercel Codex plugin 1.0.0 | 未单独使用 | Apache-2.0 | 文档/参考；查询当前文档时可联网 | A，已安装，本阶段只学习 |
| react-best-practices | Vercel Codex plugin 1.0.0 | https://www.skills.sh/vercel-labs/agent-skills/vercel-react-best-practices | Apache-2.0（plugin） | 纯指导 | A，已安装 |
| vercel-composition-patterns | vercel-labs/agent-skills @ f8a72b9 | https://www.skills.sh/vercel-labs/agent-skills/composition-patterns | MIT | SKILL + 规则，无脚本/网络 | A，项目内固定启用 |
| agent-browser | Vercel Codex plugin 1.0.0 | https://www.skills.sh/vercel-labs/agent-browser/agent-browser | Apache-2.0 | 浏览器 CLI、外部网络、截图/下载写入 | B，仅公开站点/本地预览 |
| agent-browser-verify | Vercel Codex plugin 1.0.0 | 未单独使用 | Apache-2.0 | 浏览器验证、证据写入 | B，只读启用 |
| verification | Vercel Codex plugin 1.0.0 | 未单独使用 | Apache-2.0 | 可组合构建/浏览器工具 | B，只读启用 |
| deployments-cicd | Vercel Codex plugin 1.0.0 | 未单独使用 | Apache-2.0 | 可读取/改变部署状态 | B，本阶段禁止写部署 |

## 安装方式

项目内安装均使用 Codex 内置 install-skill-from-github.py，通过 HTTPS 下载固定 Commit 到 .agent-skills/vendor/。未使用 pipe-to-shell、npm install hook 或全局 Skill 目录。

## 候选选择

- Web 规范优先 Vercel Labs 官方仓库，不采用 ehmo/platform-design-skills 等转发副本。
- Composition 选择 Vercel Labs 官方 composition-patterns，并将目录规范化为 vercel-composition-patterns 以匹配 Skill 名。
- Frontend design 选择 Anthropic 官方 anthropics/skills，不采用 Claude Code 仓库中的旧副本。
- Impeccable 来源可信，但执行面过宽且安全扫描页面有警告；按规格归为 C，而不是因知名度降低审计标准。

## 更新策略

任何升级必须重新执行树、许可证、脚本、网络、写入范围和混淆内容审计，更新 Commit 与同步日期，并由用户审阅。运行时禁止自动追踪远程 main。
