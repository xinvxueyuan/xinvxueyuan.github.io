# xinvStar 个人展示批次设计规格

**状态：** 待用户确认，禁止实施  
**批次：** Batch B / 个人展示  
**日期：** 2026-07-15  
**基线：** `origin/main@884acc1`（Batch A 已生产验收）

## 1. 目标

在现有纯 Next.js 博客中增加八个个人展示入口：About、Projects、Timeline、Skills、Friends、Devices、Diary、Albums。页面继续使用当前“夜航问讯站”视觉系统、静态 Server Components 和类型安全本地数据；不恢复旧 Astro 组件树、Swup 生命周期或通用页面构建器。

本批次的产品原则是“真实内容优先”。旧站模板、示例履历、虚假链接和无法确认的自我评价不得直接上线。缺少真实内容的页面必须显示可用、诚实的空状态，而不是制造占位数据。

## 2. 已调研的实现方案

### 方案 A：逐页翻译旧 Astro 页面

- 优点：表面上接近旧站。
- 缺点：会带回筛选状态机、MutationObserver、Iconify 动态加载、Swup 兼容脚本和大量模板数据。
- 结论：拒绝。

### 方案 B：八个静态页面 + 类型化本地内容 + 单一相册增强（采用）

- 页面默认是 Server Components，数据由项目内 TypeScript 文件提供。
- 只为相册使用一个 Client Component；PhotoSwipe 在用户点击相片后才动态加载。
- 无 JavaScript 时，相片仍是普通原图链接。
- 优点：延续 Batch A 的静态、安全、低 JavaScript 边界，维护成本最低。
- 缺点：旧站的筛选动画和复杂卡片交互不保留。

### 方案 C：MDX/CMS 驱动的通用页面系统

- 优点：编辑方式统一。
- 缺点：八类数据结构差异明显，通用 schema 会变成新的页面构建器；当前规模不需要数据库或第二套 CMS。
- 结论：拒绝。

官方资料核验结果：Next.js 16.2 App Router 可在构建期预渲染这些 Server Components，并使用 `next/image` 渲染带明确宽高的本地图片；PhotoSwipe 推荐用普通 `<a>`、`data-pswp-width`、`data-pswp-height` 建立渐进增强画廊，并通过动态 import 加载核心模块。

## 3. 旧站内容取舍

| 页面 | 旧站事实 | Batch B 决策 |
| --- | --- | --- |
| About | 旧内容是 Astro 主题功能说明，不是个人简介 | 重写为精简站点/作者介绍；只使用可由当前站点与公开仓库确认的表述 |
| Projects | 2 个真实项目：xinvStar、Lingchu Bot | 保留并规范化；允许封面、状态、技术和源码/演示链接 |
| Timeline | 9 条中多数是英文示例、虚构学校/实习和 `example.com` | 全部拒绝直接迁移；只放可验证的公开项目里程碑，否则显示空状态 |
| Skills | 55 条模板化技能及伪精度等级 | 不保留进度条、年限和虚假项目引用；仅列少量可由当前公开项目证明的技术方向 |
| Friends | 8 条实际是框架/文档网站，不是友链 | 不迁移；提供友链说明与空状态，等待真实条目 |
| Devices | 2 条本地设备资料和图片 | 保留；分类统一为用途类别，修正错误的 OnePlus 品牌归类 |
| Diary | 1 条英文樱花示例，真实性及图片来源未确认 | 不直接上线；Diary 首版提供空状态与独立数据模型 |
| Albums | 1 个可见本地相册、22 张照片；另有隐藏/外链示例 | 只迁移可见本地相册；删除外链/隐藏示例和文件时间推导，使用显式 manifest |

旧站的 Astro feature flags、右侧栏、客户端筛选、随机排序、相对时间、动态 Iconify、`innerHTML` 卡片重建、MutationObserver、重试器、Swup 事件、文件系统 mtime 推导和外部相册 provider 全部淘汰。

## 4. 信息架构

公开入口：

- `/about/`
- `/projects/`
- `/timeline/`
- `/skills/`
- `/friends/`
- `/devices/`
- `/diary/`
- `/albums/`

相册详情使用 `/albums/[slug]/`。它是 Albums 的内容详情，不算第九个顶级入口；通过 `generateStaticParams` 构建，未知 slug 返回真实 404。

主导航只增加“关于”和“项目”，避免移动端拥挤。About 页面提供其余个人页面的语义化入口；页脚补充“相册”和“友链”。所有页面进入 sitemap，相册详情也进入 sitemap。

## 5. 数据与代码边界

```text
src/lib/showcase/types.ts
src/content/profile.ts
src/content/projects.ts
src/content/timeline.ts
src/content/skills.ts
src/content/friends.ts
src/content/devices.ts
src/content/diary.ts
src/content/albums.ts
```

数据数组使用 `as const satisfies readonly Type[]`。这些模块不得依赖 React、浏览器 API 或博客文章模型；Diary 不进入文章 feed、taxonomy、Pagefind 或 `llms-full.txt`。

共享类型：

```ts
type ShowcaseImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

type ExternalLink = {
  label: string;
  href: `https://${string}`;
};
```

各领域字段：

- Project：`slug`、`title`、`description`、`status`、`technologies`、`cover?`、`links`、`featured`。
- Timeline：`id`、`title`、`description`、`kind`、`date`、`links?`；不使用随当前日期变化的“持续月数”。
- Skill：`id`、`name`、`group`、`summary?`；无百分比、星级或虚假熟练度。
- Friend：`id`、`name`、`description`、`url`、`avatar?`、`tags`。
- Device：`id`、`name`、`category`、`description`、`image`、`specs`、`url?`。
- Diary：`id`、`publishedAt`、`body`、`images`、`location?`、`mood?`、`tags`。
- Album：`slug`、`title`、`description`、`cover`、`date?`、`location?`、`tags`、`photos`。
- Photo：`src`、`alt`、`width`、`height`、`title?`、`description?`、`date?`、`location?`。

所有 ID/slug 必须唯一；所有公开外链必须是 HTTPS；所有图片必须有非空 alt 和真实宽高。

## 6. 页面与视觉设计

八页复用现有 RootLayout、`page-shell`、主题变量、focus 样式与夜航配色，不建立子 layout。每页拥有唯一 H1、简短导语、静态 metadata、canonical、空状态和返回个人展示入口的路径。

- About：作者/站点简介、公开链接和八页导航，是个人展示枢纽。
- Projects：精选项目采用有明确内容差异的项目条目，不做同尺寸图标卡片墙。
- Timeline：按日期倒序的语义化 `<ol>`；只有真实记录才渲染节点。
- Skills：按技术方向分组的文本清单，不使用进度条。
- Friends：确定性顺序的友链列表；空时显示申请/联系说明。
- Devices：图片、用途、关键规格的简洁清单；不使用整卡无提示跳转。
- Diary：独立短记录流；空状态不伪装成博客文章。
- Albums：相册列表和详情图库；图片链接本身是无 JS fallback。

视觉约束：

- 保留 `Zen Maru Gothic` / `Noto Sans SC`、琥珀与轨道紫，不重做品牌。
- 展示页以内容节奏而非重复“图标 + 标题 + 描述”卡片网格组织。
- 卡片圆角不超过现有 `--radius-lg`；不增加玻璃拟态、渐变文字、宽阴影或装饰网格。
- H1 最大值不超过 5.5rem，字距不小于 -0.04em；正文宽度维持 65–75ch。
- 360px 无横向溢出；减少动态效果偏好下不执行非必要动画。

## 7. 相册渐进增强

相册服务端首先输出：

```html
<a href="/images/albums/example/full.webp"
   data-pswp-width="1600"
   data-pswp-height="1067">
  <img alt="明确描述" width="800" height="534" />
</a>
```

`album-lightbox.tsx` 是本批次唯一新增的必要 Client Component：

1. 初始 HTML 不导入 PhotoSwipe。
2. 用户首次点击相片时阻止默认导航并动态导入 `photoswipe/lightbox` 与核心模块。
3. 初始化后打开被点击的相片；后续点击复用同一实例。
4. 组件卸载时调用 `destroy()`。
5. 动态加载失败时恢复普通原图导航，不遮挡页面。
6. Escape、关闭按钮、焦点恢复和触摸缩放由 PhotoSwipe 提供，并做浏览器验收。

PhotoSwipe CSS 只在相册详情边界加载，不进入首页初始资源。

## 8. 错误与空状态

- 任一内容数组为空时页面仍返回 200，并用具体说明替代空白网格。
- 未知相册 slug 返回 404。
- 图片清单字段缺失、尺寸非正数、重复 ID/slug、HTTP 外链在单元测试中直接失败。
- PhotoSwipe 加载失败开放为原图链接；不得影响页面其他内容。
- Friends 的网络失效检查只报告确定性的 HTTP/解析错误；临时 DNS、超时或限流不得阻断 CI。首版不在普通构建中主动请求友链。

## 9. 测试与完成条件

### 单元测试

- 八类数据的 ID/slug 唯一、日期可排序、外链 HTTPS。
- 图片均有 src、alt、正整数宽高；相册至少一张照片。
- 数据模块不包含 React 元素、函数或运行时网络调用。

### 集成测试

- 八个入口页均可服务端渲染且只有一个 H1。
- metadata 包含 title、description、canonical。
- 代表性项目/设备/相册内容可见；空页面显示明确空状态。
- 外链统一 `target="_blank" rel="noopener noreferrer"`。
- 相册静态参数、详情 metadata、未知 slug 404 正确。
- sitemap 精确包含八个入口和公开相册详情。

### 浏览器测试

- 八页返回 200；360/768/1440px 无横向溢出。
- 键盘焦点可见，axe serious/critical 为零。
- 所有图片 alt 非空；无 JavaScript 时相片链接能打开原图。
- PhotoSwipe 只在相册交互后加载；Escape 可关闭并恢复焦点。
- 首页和普通个人页不得请求 PhotoSwipe 资源。

### 发布门禁

`framework:scan`、lint、typecheck、unit/integration、build、Playwright、GitHub CI、DCO 和 Vercel Preview 全绿；预览验收八页、一个相册详情、404 和移动端后才允许合并。合并后对 `www.xinvstar.xyz` 重复关键路径验收。

## 10. 明确不实施

- 不恢复旧路由兼容、Astro/Svelte/Vue、Swup、右侧栏或通用页面构建器。
- 不恢复 Skills/Projects/Friends 的客户端筛选与搜索。
- 不发布虚构教育/工作经历、模板技能、框架文档假友链或未确认日记。
- 不恢复随机排序、相对时间、进度条熟练度、运行时文件扫描、mtime 元数据、外部相册 provider。
- 不把 Diary 混入博客文章、feed、taxonomy、搜索或 llms。
- 不在本规格确认前安装 PhotoSwipe、迁移资产或修改应用代码。

## 11. 确认后执行顺序

1. 创建逐任务实施计划。
2. 建立类型与内容清单，迁移可确认资产。
3. 实现八个静态入口和相册详情。
4. 加入 PhotoSwipe 渐进增强。
5. 完成 sitemap、导航、测试、审查、PR、预览和生产验收。

