---
name: xinvStar
description: 把代码、学习与生活编排成一片可阅读的个人星图
colors:
  star-amber: "#F2B84B"
  star-amber-deep: "#754600"
  orbit-violet: "#69558F"
  daylight: "#F7F7F8"
  surface-light: "#FFFFFF"
  ink-light: "#24202B"
  muted-light: "#625C6B"
  night: "#17141E"
  surface-night: "#211C2B"
  ink-night: "#F7F3FF"
  muted-night: "#C4BBCD"
typography:
  display:
    fontFamily: "Zen Maru Gothic, Noto Sans SC, ui-rounded, sans-serif"
    fontSize: "clamp(2.5rem, 7vw, 5.5rem)"
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Noto Sans SC, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.8
  code:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.925rem"
    fontWeight: 400
    lineHeight: 1.65
rounded:
  sm: "6px"
  md: "12px"
  lg: "16px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.ink-light}"
    textColor: "{colors.surface-light}"
    rounded: "{rounded.md}"
    padding: "12px 18px"
  button-primary-hover:
    backgroundColor: "{colors.star-amber-deep}"
    textColor: "{colors.surface-light}"
    rounded: "{rounded.md}"
    padding: "12px 18px"
  card:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.ink-light}"
    rounded: "{rounded.lg}"
    padding: "24px"
---

# Design System: xinvStar

## 1. Overview

**Creative North Star: “夜航问讯站”**

xinvStar 像一座位于夜色与晨光交界处的个人问讯站。文章是航线；界面需要让访客先确定自己在哪里、能读什么，再通过写作感受到站长的兴趣与个性。

系统采用原创氛围图、暖色强调、深浅主题和轻巧互动，同时拒绝控件墙、玻璃卡片堆叠和无意义的装饰动画。移动端和桌面端都首先是一份舒适的阅读器。

**Key Characteristics:**

- 阅读优先、舞台集中、探索渐进。
- 日系圆润但不幼态，技术清晰但不模拟终端。
- 原创星轨与知识节点图像，不使用受版权角色。
- 亮色像清晨屏幕，暗色像夜间书桌；两者同等完整。
- 动效响应操作并尊重 reduced motion，内容默认可见。

## 2. Colors

颜色采用“有承诺的星光”策略：大面积保持中性，琥珀在关键路径集中出现，轨道紫只承担辅助识别。

### Primary

- **星芒琥珀**：用于当前状态、重要链接、焦点和少量舞台光源；不得作为小号正文颜色。
- **深琥珀**：用于亮色背景上的可读强调与主按钮悬停状态。

### Secondary

- **轨道紫**：用于图形节点、访问过的探索路径和非关键装饰；不得与琥珀争夺主行动。

### Neutral

- **日光底色 / 明亮表面**：亮色主题的页面和内容表面。
- **墨色正文 / 柔和正文**：亮色主题的主次文本。
- **夜航底色 / 夜间表面**：暗色主题的页面和浮层。
- **月白正文 / 夜间柔和正文**：暗色主题的主次文本。

**The One Star Rule.** 单个视口只有一个琥珀色视觉焦点；高饱和色不得同时占据多个组件。

**The Contrast Rule.** 正文必须达到 4.5:1，大字与非文本控件至少 3:1；接近阈值时永远提高可读性。

## 3. Typography

**Display Font:** Zen Maru Gothic（Noto Sans SC 与圆体系统回退）  
**Body Font:** Noto Sans SC（系统无衬线回退）  
**Label/Mono Font:** JetBrains Mono（系统等宽回退）

**Character:** 圆润标题提供个人感，稳定的中文无衬线保证长文效率，等宽字体只服务代码与确有技术含义的短标签。

### Hierarchy

- **Display**（500，流式 2.5–5.5rem，1.05）：仅用于首页舞台与少数专页标题。
- **Headline**（600，2–3.25rem，1.2）：文章标题与页面主标题，使用平衡换行。
- **Title**（600，1.25–1.75rem，1.35）：列表项目和内容章节。
- **Body**（400，1rem，1.8）：正文限制在 65–75ch，中文段落使用自然换行。
- **Label**（500，0.75–0.875rem，正常字距）：元数据和控件标签，不把每个标题都变成全大写眉题。

**The Reading Measure Rule.** 正文永远不以填满宽屏为目标；可读行长优先于版面利用率。

## 4. Elevation

系统以色调分层和明确边界为主，阴影只用于真正浮出文档流的搜索、菜单和对话框。普通内容卡片不得同时使用一像素边框与宽模糊阴影。

### Shadow Vocabulary

- **浮层阴影**（`0 8px 24px rgb(23 20 30 / 0.18)`）：仅用于弹出层和模态窗口。
- **交互抬升**（`0 3px 8px rgb(23 20 30 / 0.12)`）：仅在可点击特色卡片悬停时出现。

**The Flat-at-Rest Rule.** 静止内容默认平坦；阴影表达层级或状态，不表达“这是一个卡片”。

## 5. Components

### Buttons

- **Shape:** 有控制的圆角（12px），标签按钮可使用完整胶囊。
- **Primary:** 墨色底、白色文字和 12px × 18px 内边距；同一视口最多一个主要行动。
- **Hover / Focus:** 使用深琥珀或明确外轮廓；移动不超过 2px，禁止弹跳。
- **Secondary / Ghost:** 透明背景，通过文字和局部底色反馈状态。

### Chips

- **Style:** 胶囊形、紧凑间距；未选中使用中性表面，选中使用可读的深琥珀文字与浅琥珀底。
- **State:** 链接与按钮不得嵌套；筛选状态必须同时通过文本、`aria-pressed` 或当前 URL 表达。

### Cards / Containers

- **Corner Style:** 12–16px，禁止 24px 以上的大圆角内容卡。
- **Background:** 使用明亮表面或夜间表面；透明只用于横幅上的单一导航层。
- **Shadow Strategy:** 遵循 Flat-at-Rest。
- **Border:** 仅在需要分隔相邻同色表面时使用低对比完整边框。
- **Internal Padding:** 16px 起，主要内容区域 24px；嵌套卡片改用间距或分隔线。

### Inputs / Fields

- **Style:** 12px 圆角、实色表面、清晰标签和足够的触摸高度。
- **Focus:** 2px 可见轮廓，不依赖阴影或颜色变化。
- **Error / Disabled:** 错误提供文字说明；禁用状态仍保持文本对比度。

### Navigation

MVP 导航只保留站点首页入口和主题开关，不需要菜单、抽屉或额外的当前页状态。

### Theme Control

只提供明暗主题切换。设置失败或 JavaScript 禁用时，正文和导航仍然可用。

## 6. Do's and Don'ts

### Do:

- **Do** 让文章、标题、分页和主导航在无 JavaScript 时仍然可用。
- **Do** 用原创星轨、知识节点、站长作品和真实内容建立识别。
- **Do** 将正文限制为 65–75ch，并为所有图片保留稳定尺寸。
- **Do** 为每个动画提供 reduced-motion 等价行为。
- **Do** 在 390×844、768×1024 和 1440×900 三个基线视口验收。

### Don't:

- **Don't** 做无人物痕迹、套壳即可复用的 SaaS 落地页。
- **Don't** 使用同尺寸图标卡片、玻璃拟态、紫色渐变和巨大指标组成 AI 模板站。
- **Don't** 复制现站首页的控件墙、数百个可聚焦标签和层层嵌套卡片。
- **Don't** 使用未经确认授权的动漫、游戏角色作为主视觉。
- **Don't** 把个人博客伪装成杂志排版练习或终端模拟器。
- **Don't** 使用渐变文字、彩色粗侧边线、重复斜纹或装饰性网格背景。
- **Don't** 在普通内容卡片上同时使用一像素边框和 16px 以上模糊阴影。
