---
title: Simple Guides for xinStar
published: 2024-04-01
description: "如何使用这个博客模板。"
image: "./cover.webp"
tags: ["xinStar", "Blogging", "Customization"]
category: Guides
draft: false
---



这个博客模板是用 [Astro](https://astro.build/) 构建的。对于本指南中未涉及的内容，您可以在 [Astro 文档](https://docs.astro.build/) 中找到答案。

## 文章前置数据

```yaml
---
title: My First Blog Post
published: 2023-09-09
description: This is the first post of my new Astro blog.
image: ./cover.jpg
tags: [Foo, Bar]
category: Front-end
draft: false
---
```




| 属性          | 描述                                                                                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `title`       | 文章的标题。                                                                                                                                                 |
| `published`   | 文章发布的日期。                                                                                                                                             |
| `pinned`      | 这篇文章是否固定在文章列表的顶部。                                                                                                                           |
| `priority`    | 固定文章的优先级。数值越小优先级越高（0, 1, 2...）。                                                                                                         |
| `description` | 文章的简短描述。在首页显示。                                                                                                                                 |
| `image`       | 文章的封面图片路径。<br/>1. 以 `http://` 或 `https://` 开头：使用网络图片<br/>2. 以 `/` 开头：用于 `public` 目录中的图片<br/>3. 无前缀：相对于 Markdown 文件 |
| `tags`        | 文章的标签。                                                                                                                                                 |
| `category`    | 文章的分类。                                                                                                                                                 |
| `licenseName` | 文章内容的许可证名称。                                                                                                                                       |
| `author`      | 文章的作者。                                                                                                                                                 |
| `sourceLink`  | 文章内容的源链接或参考。                                                                                                                                     |
| `draft`       | 这篇文章是否仍在草稿中，不会被显示。                                                                                                                         |

## 文章文件放置位置



您的文章文件应放在 `src/content/posts/` 目录中。您也可以创建子目录来更好地组织您的文章和资材。

```
src/content/posts/
├── post-1.md
└── post-2/
    ├── cover.webp
    └── index.md
```