---
title: Webpack 到 Vite：前端构建工具演进之路
published: 2026-01-04
description: '这是一篇关于Vite的深度技术文章'
tags: [Vite, Webpack, Build]
category: Frontend
draft: false
---

# Webpack 到 Vite：前端构建工具演进之路

前端构建工具经历了从 Grunt/Gulp 到 Webpack，再到 Vite 的演进。本文深入对比这些工具的差异和适用场景。

## 为什么 Webpack 慢？

Webpack 的构建流程：从入口文件开始，解析依赖图，对每个模块进行 loader 转换，打包所有模块，最后输出。在大型项目中，这个过程可能需要几十秒甚至几分钟。

## Vite 如何做到极速？

Vite 利用了两个关键特性：
1. **ES Modules 原生支持**：开发时无需打包，浏览器直接加载
2. **esbuild 预构建**：用 Go 写的极速打包器处理依赖

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  }
});
```

## 开发模式对比

| 步骤 | Webpack | Vite |
|------|---------|------|
| 冷启动 | 打包整个应用 | 按需编译（ESM） |
| HMR | 随模块数增加变慢 | O(1) 复杂度 |
| 构建 | JavaScript | esbuild (Go) |

## 从 Webpack 迁移到 Vite

```bash
npm uninstall webpack webpack-cli webpack-dev-server
npm install -D vite @vitejs/plugin-react
```

将 `index.html` 移到根目录，添加 `<script type="module" src="/src/main.jsx">`。

## 总结

Vite 不是 Webpack 的替代品——生产构建仍然使用 Rollup。但在开发体验上，Vite 带来了质的飞跃。对于新项目，Vite 是明智的默认选择。
