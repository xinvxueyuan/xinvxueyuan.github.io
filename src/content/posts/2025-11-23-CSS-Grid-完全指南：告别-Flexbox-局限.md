---
title: CSS Grid 完全指南：告别 Flexbox 局限
published: 2025-11-23
description: '这是一篇关于CSS的深度技术文章'
tags: [CSS, Grid, Layout]
category: Frontend
draft: false
---

# CSS Grid 完全指南：告别 Flexbox 局限

CSS Grid 是二维布局的终极方案。虽然 Flexbox 在一维布局上表现出色，但当需要同时控制行和列时，Grid 才是正确的选择。

## Grid vs Flexbox

| 特性 | Flexbox | Grid |
|------|---------|------|
| 维度 | 一维（行或列） | 二维（行和列） |
| 方向 | 内容驱动 | 布局驱动 |
| 对齐 | 主轴和交叉轴 | 行轴和列轴 |
| 适用 | 组件级布局 | 页面级布局 |

## 基础概念

```css
.container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr; /* 三列等宽 */
  grid-template-rows: auto;           /* 行高自适应 */
  gap: 20px;                          /* 行列间距 */
}
```

### fr 单位详解

`fr`（fraction）是 Grid 独有的弹性单位：

```css
/* 1:2:1 的比例 */
grid-template-columns: 1fr 2fr 1fr;

/* 与固定值混合 */
grid-template-columns: 200px 1fr 1fr;
/* 左侧固定 200px，剩余空间 1:1 分配 */

/* 最小值和最大值 */
grid-template-columns: minmax(200px, 1fr) 1fr;
/* 第一列最小 200px，最大 1fr */
```

## 隐式与显式网格

```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: minmax(100px, auto); /* 隐式行的高度 */
}
```

超出显式定义的项目会自动创建隐式轨道：

```html
<div class="container">
  <div>1</div> <div>2</div> <div>3</div>
  <div>4</div> <div>5</div> <div>6</div>
  <div>7</div> <!-- 隐式行 -->
</div>
```

## Grid 区域命名

```css
.container {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header header"
    "sidebar main aside"
    "footer footer footer";
  min-height: 100vh;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.aside   { grid-area: aside; }
.footer  { grid-area: footer; }
```

## 对齐方式

```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 150px);
  grid-template-rows: repeat(2, 150px);
  
  /* 项目在单元格内的对齐 */
  justify-items: center;  /* 水平：start | end | center | stretch */
  align-items: center;    /* 垂直：start | end | center | stretch */
  
  /* 网格在容器内的对齐（当网格总尺寸小于容器时） */
  justify-content: center; /* 水平 */
  align-content: center;   /* 垂直 */
}

/* 单个项目的对齐 */
.special {
  justify-self: end;
  align-self: start;
}
```

## auto-fit vs auto-fill

```css
/* auto-fill：尽可能多地创建轨道（保留空轨道） */
grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));

/* auto-fit：拉伸现有项目填满空间（折叠空轨道） */
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
```

## 实战：响应式卡片布局

```html
<div class="card-grid">
  <article class="card">
    <img src="image.jpg" alt="">
    <div class="card-content">
      <h3>Card Title</h3>
      <p>Card description text...</p>
    </div>
  </article>
  <!-- more cards... -->
</div>
```

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  padding: 24px;
}

.card {
  display: grid;
  grid-template-rows: 200px auto;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-content {
  padding: 16px;
}

/* 特色卡片：跨两列 */
.card.featured {
  grid-column: span 2;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto;
}

.card.featured img {
  grid-row: auto;
}
```

## Dashboard 布局示例

```css
.dashboard {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: auto;
  gap: 16px;
  padding: 16px;
}

.stat-card {
  padding: 24px;
  background: white;
  border-radius: 8px;
}

/* 大卡片跨两列两行 */
.stat-card.large {
  grid-column: span 2;
  grid-row: span 2;
}

/* 宽卡片跨两列 */
.stat-card.wide {
  grid-column: span 3;
}

/* 响应式 */
@media (max-width: 768px) {
  .dashboard {
    grid-template-columns: 1fr;
  }
  
  .stat-card.large,
  .stat-card.wide {
    grid-column: span 1;
    grid-row: span 1;
  }
}
```

## 实际应用：Holy Grail 布局

```css
body {
  display: grid;
  grid-template-columns: 250px 1fr 250px;
  grid-template-rows: 60px 1fr 60px;
  grid-template-areas:
    "header header header"
    "nav    main   aside"
    "footer footer footer";
  min-height: 100vh;
}

header { grid-area: header; }
nav    { grid-area: nav; }
main   { grid-area: main; }
aside  { grid-area: aside; }
footer { grid-area: footer; }

@media (max-width: 768px) {
  body {
    grid-template-columns: 1fr;
    grid-template-rows: 60px auto 1fr auto 60px;
    grid-template-areas:
      "header"
      "nav"
      "main"
      "aside"
      "footer";
  }
}
```

## 总结

CSS Grid 是现代 Web 布局的基石。核心要点：

- 使用 `grid-template-columns/rows` 定义轨道
- `fr` 单位实现弹性布局
- `grid-template-areas` 提供可视化布局方式
- `auto-fit`/`auto-fill` 实现响应式无需媒体查询
- `gap` 替代传统的 margin 间距

Grid 加上 Flexbox，构成了完整的现代 CSS 布局体系。
