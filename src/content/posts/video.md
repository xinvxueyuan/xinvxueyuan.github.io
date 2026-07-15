---
title: 在帖子中包含视频
published: 2022-08-01
description: 这篇文章演示了如何在博客文章中包含嵌入式视频。
tags: [Example, Video]
category: Examples
draft: false
---

复制 YouTube 或 Bilibili 视频 ID，并使用允许的视频指令即可：

```yaml
---
title: 在帖子中包含视频
published: 2023-10-19
// ...
---

::video{provider="youtube" id="5gIf0_xpFPI"}
```
## YouTube

::video{provider="youtube" id="5gIf0_xpFPI"}

## Bilibili

::video{provider="bilibili" id="BV1fK4y1s7Qf"}
