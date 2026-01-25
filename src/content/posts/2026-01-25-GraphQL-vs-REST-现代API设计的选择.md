---
title: GraphQL vs REST：现代 API 设计的选择
published: 2026-01-25
description: '这是一篇关于GraphQL的深度技术文章'
tags: [GraphQL, REST, API]
category: Technology
draft: false
---

# GraphQL vs REST：现代 API 设计的选择

REST 已经统治 API 设计二十年，但 GraphQL 正在改变游戏规则。

## REST 的核心问题

### Over-fetching（过度获取）

请求 `/api/users/123` 返回了所有字段，但你可能只需要 name 和 email。

### Under-fetching（获取不足）

需要多个请求才能获取关联数据：先获取用户，再获取用户的文章，再获取文章的评论。

## GraphQL 的解决方案

```graphql
query {
  user(id: "123") {
    name
    email
    posts(first: 5) {
      title
      comments {
        author { name }
        content
      }
    }
  }
}
```

一次请求，精确获取所需数据。

## 性能对比

| 场景 | REST | GraphQL |
|------|------|---------|
| 简单查询 | 更快 | 稍慢 |
| 复杂关联 | N+1 问题 | DataLoader 解决 |
| 缓存 | HTTP 缓存开箱即用 | 需要额外配置 |
| 带宽 | 容易 over-fetching | 按需获取 |

## 选择建议

- **用 REST**：简单 CRUD API、文件上传下载、第三方公开 API
- **用 GraphQL**：复杂数据关系、多端共享 API、快速迭代产品

## 总结

两者不是非此即彼。许多公司采用混合方案：GraphQL 用于 BFF 层，REST 用于内部微服务通信。
