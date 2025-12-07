---
title: Git 工作流最佳实践：从 Feature Branch 到 GitFlow
published: 2025-12-07
description: '这是一篇关于Git的深度技术文章'
tags: [Git, Workflow, CI/CD]
category: DevOps
draft: false
---

# Git 工作流最佳实践：从 Feature Branch 到 GitFlow

版本控制是团队协作的基石。选择合适的 Git 工作流能大幅提升开发效率。

## Feature Branch Workflow

最简单的协作工作流——每个功能在独立分支开发：

```bash
# 从 main 创建功能分支
git checkout -b feature/user-auth main

# 开发...
git add .
git commit -m "feat: add user authentication"

# 推送并创建 PR
git push origin feature/user-auth
```

### 优点
- 简单易懂，适合小团队
- 每个功能独立，互不干扰
- PR review 自然融入流程

## GitFlow

适合有明确发布周期的项目：

```
main ─────●────────────●────────────●────
           \          / \          /
develop ────●──●──●──●───●──●──●──●────
             \  /     \  /
feature/A ────●──●      │
                        │
release/1.0 ────────────●──●
```

### 分支类型

| 分支 | 用途 | 来源 | 合并到 |
|------|------|------|--------|
| `main` | 生产环境 | - | - |
| `develop` | 开发集成 | main | - |
| `feature/*` | 功能开发 | develop | develop |
| `release/*` | 发布准备 | develop | main + develop |
| `hotfix/*` | 紧急修复 | main | main + develop |

## 提交信息规范 (Conventional Commits)

```bash
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Type 类型

| Type | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档变更 |
| `style` | 代码格式 |
| `refactor` | 重构 |
| `perf` | 性能优化 |
| `test` | 测试 |
| `chore` | 构建/工具 |

### 示例

```bash
git commit -m "feat(auth): add JWT token refresh

Implement automatic token refresh 5 minutes before expiry.
Add TokenRefreshInterceptor to handle 401 responses.

Closes #123"
```

## 总结

选择工作流的原则：
- 小团队（2-5人）：Feature Branch + Trunk Based
- 中型团队（5-20人）：简化版 GitFlow
- 大型项目需要多版本维护：完整 GitFlow
- 不管哪种，保持提交信息的规范性和一致性是最重要的
