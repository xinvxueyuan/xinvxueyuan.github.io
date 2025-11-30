---
title: Tailwind CSS 实战技巧：构建现代化 UI 的 20 个模式
published: 2025-11-30
description: '这是一篇关于Tailwind的深度技术文章'
tags: [Tailwind, CSS, UI]
category: Frontend
draft: false
---

# Tailwind CSS 实战技巧：构建现代化 UI 的 20 个模式

Tailwind CSS 彻底改变了前端样式编写的方式。本文整理了 20 个实用的 Tailwind 模式。

## 1. 响应式卡片网格

```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
  <div class="bg-white rounded-xl shadow-md overflow-hidden">
    <img class="w-full h-48 object-cover" src="card.jpg" alt="">
    <div class="p-4">
      <h3 class="text-lg font-semibold text-gray-900">Card Title</h3>
      <p class="mt-2 text-gray-600">Card description goes here</p>
    </div>
  </div>
</div>
```

## 2. 渐变按钮

```html
<button class="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
  Get Started
</button>
```

## 3. 骨架屏加载

```html
<div class="animate-pulse space-y-4">
  <div class="h-4 bg-gray-200 rounded w-3/4"></div>
  <div class="h-4 bg-gray-200 rounded"></div>
  <div class="h-4 bg-gray-200 rounded w-5/6"></div>
</div>
```

## 4. 粘性导航栏

```html
<nav class="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16 items-center">
      <div class="text-xl font-bold">Logo</div>
      <div class="hidden md:flex space-x-8">
        <a href="#" class="text-gray-700 hover:text-gray-900">Home</a>
        <a href="#" class="text-gray-700 hover:text-gray-900">About</a>
      </div>
    </div>
  </div>
</nav>
```

## 5. 模态框

```html
<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
  <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
    <h2 class="text-xl font-bold">Modal Title</h2>
    <p class="mt-2 text-gray-600">Modal content here...</p>
    <div class="mt-6 flex justify-end space-x-3">
      <button class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
      <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Confirm</button>
    </div>
  </div>
</div>
```

## 总结

Tailwind 的核心优势在于：
- 设计系统内建（间距、颜色、阴影一致性）
- 响应式前缀 (`sm:`, `md:`, `lg:`)
- 暗色模式支持 (`dark:`)
- JIT 编译器保证只生成使用的 CSS
