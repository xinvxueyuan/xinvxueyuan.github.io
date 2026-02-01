---
title: 深入 React Server Components：新一代 React 架构
published: 2026-02-01
description: 'React Server Components (RSC) 是 React 18 引入的范式转换，从...'
tags: [React, RSC, Next.js]
category: Frontend
draft: false
---

# 深入 React Server Components：新一代 React 架构

React Server Components (RSC) 是 React 18 引入的范式转换，从根本上改变了 React 应用的架构。


## 传统 React 的问题

所有代码都在浏览器中执行，包括依赖库。导致 JS bundle 体积过大，首屏加载缓慢。数据获取需要 useEffect 配合 API 路由，增加了一层间接性。


## Server Components 的优势

Server Component 在服务端运行，可以直接访问数据库和文件系统。不需要 useEffect 和 API 层。依赖库留在服务端，不发送给客户端——零客户端 JS 开销。


## 'use client' 边界

只有在需要交互（事件处理、useState、useEffect、浏览器 API）时，才标记为客户端组件。Server Component 可以渲染 Client Component，但不能反过来。数据通过 props 从 Server Component 流向 Client Component。


## 数据流模式

Server Component → 获取数据 → 通过 props 传递给 Client Component → 交互 UI。这种单向数据流让代码更容易理解和测试。


## 与 Next.js App Router 的关系

Next.js 13+ 的 App Router 默认所有组件都是 Server Component。page.js、layout.js 都是 Server Component。Server Actions 让你可以在 Server Component 中定义数据处理函数，直接在 form action 中调用，无需创建 API 路由。


## 总结

RSC 的核心价值：零客户端 JS（服务端组件不发送 JS 到浏览器）、直接数据访问（无需 API 层）、自动代码分割（客户端边界即分割点）、更好的 SEO。RSC 不是要取代客户端组件，而是给了我们选择——把该放在服务端的逻辑留在服务端。
