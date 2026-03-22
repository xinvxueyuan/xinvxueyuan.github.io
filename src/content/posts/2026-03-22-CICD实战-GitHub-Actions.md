---
title: CI/CD 实战：GitHub Actions 自动化工作流
published: 2026-03-22
description: 'GitHub Actions 让 CI/CD 变得简单而强大。从自动测试到自动部署，一切都可以自动化...'
tags: [CI/CD, GitHub Actions, Automation]
category: DevOps
draft: false
---

# CI/CD 实战：GitHub Actions 自动化工作流

GitHub Actions 让 CI/CD 变得简单而强大。从自动测试到自动部署，一切都可以自动化。


## 基础工作流结构

YAML 格式定义在 .github/workflows/ 目录。核心概念：on（触发条件）、jobs（任务）、steps（步骤）。每个 job 运行在独立的虚拟机上，jobs 之间默认并行执行。


## Matrix 构建

使用 strategy.matrix 在多个环境（Node 版本、OS）中并行测试。确保代码在不同环境的兼容性。可以设置 fail-fast: false 让所有组合都完成。


## 缓存依赖

使用 actions/setup-node 的 cache 选项或 actions/cache 缓存 node_modules。大幅减少安装时间——从几分钟降到几秒。


## 部署到 Vercel

使用官方 Action 或直接调用 CLI。需要配置 Secrets（VERCEL_TOKEN 等）来安全存储凭证。部署到 production 需要设置 --prod 标志。


## Docker 构建与推送

使用 docker/build-push-action 构建和推送镜像到 GitHub Container Registry。多阶段构建优化镜像大小。标签管理使用 git tag 触发版本发布。


## 安全最佳实践

使用 OIDC 代替长期 Token、设置 GITHUB_TOKEN 最小权限、定期审查 workflow 中使用的外部 Action 版本、使用 Dependabot 自动更新 Action 版本。


## 总结

CI/CD 的核心价值：自动化测试防止回归、一致的构建环境、快速反馈循环、安全的部署流程。好的 CI/CD 让团队专注于写代码，而不是手动部署。
