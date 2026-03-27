---
title: Markdown Extended Features
published: 2024-05-01
updated: 2024-11-29
description: '在 xinStar 中了解更多 Markdown 功能'
image: ''
tags: [Demo, Example, Markdown, xinStar]
category: 'Examples'
draft: false 
---

## GitHub 仓库卡片
您可以添加链接到 GitHub 仓库的动态卡片，页面加载时，仓库信息会从 GitHub API 中提取。

::github{repo="matsuzaka-yuki/xinStar"}

使用代码 `::github{repo="xinvxueyuan/xinvxueyuan.github.io"}` 创建 GitHub 仓库卡片。

```markdown
::github{repo="matsuzaka-yuki/xinStar"}
```

## 提示框

支持以下类型的提示框：`note` `tip` `important` `warning` `caution`

:::note
突出显示用户应该注意的信息，即使在浏览时也应该注意。
:::

:::tip
帮助用户更成功的可选信息。
:::

:::important
用户成功所必需的关键信息。
:::

:::warning
由于潜在风险而需要立即引起用户注意的关键内容。
:::

:::caution
操作的负面潜在后果。
:::

### 基本语法

```markdown
:::note
突出显示用户应该注意的信息，即使在浏览时也应该注意。
:::

:::tip
帮助用户更成功的可选信息。
:::
```

### 自定义标题

提示框的标题可以自定义。

:::note[我的自定义标题]
这是一个带有自定义标题的注释。
:::

```markdown
:::note[MY CUSTOM TITLE]
This is a note with a custom title.
:::
```

### GitHub 语法

> [!TIP]
> 也支持 [GitHub 语法](https://github.com/orgs/community/discussions/16925)。

```
> [!NOTE]
> 也支持 GitHub 语法。

> [!TIP]
> 也支持 GitHub 语法。
```

### 剧透

您可以在文本中添加剧透。该文本也支持 **Markdown** 语法。

内容 :spoiler[是隐藏的 **呀呀呀**]！

```markdown
The content :spoiler[is hidden **ayyy**]!
```
