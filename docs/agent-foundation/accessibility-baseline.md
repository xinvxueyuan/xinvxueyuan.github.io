# 可访问性基线

## 已验证

- 首页和代表页面有真实正文，`lang="zh-CN"`，图片抽样无缺失 `alt`。
- 交互按钮抽样没有空名称；主题、搜索、菜单、音乐和代码复制按钮均有可访问名称。
- 键盘首次 Tab 可聚焦站点 Logo，浏览器计算样式显示 `outline: auto 1px`，有可见焦点基础。
- reduced-motion 媒体查询仿真生效；三种视口抽样无横向溢出。
- Mermaid 6 个源块均渲染为 SVG；KaTeX 代表页渲染 2 个节点；真实不存在 URL 返回 HTTP 404。

## 已发现缺口

| 检查项 | 现状证据 | 迁移要求 |
| --- | --- | --- |
| Landmark | 首页仅检测到 `main`，没有语义 `header/nav/aside/footer` | 使用对应 landmark 或等价 ARIA role |
| Heading | DOM 顺序出现 H3 后 H1，且存在空 H3 | 每页一个可识别 H1，层级不可跳跃或为空 |
| Skip Link | 未检测到跳到主内容的链接 | 增加首个键盘可见 Skip Link |
| 表单名称 | 首页抽样有 2 个 input/select/textarea 无 label/aria 关联 | 所有表单控件必须有程序化名称 |
| Dialog | 搜索面板未检测到 `dialog`/`role=dialog` | 模态面板需焦点约束、关闭返回与 Escape |
| 交互密度 | 首页约 578 个可聚焦元素 | 标签云/播放器等避免重复焦点和隐藏控件可聚焦 |
| 对比度 | 本轮没有可靠自动对比度分数 | Preview 上以 axe/Lighthouse + 人工暗色检查验收 |
| 无 JS | 浏览器禁用脚本仿真导航超时 | Next.js 迁移须以禁 JS E2E 证明正文和导航可读 |

## 尚需后续自动化

当前 LHCI 未产出有效报告，因此 Landmark、Heading、Label、按钮名、焦点、Dialog、Reduced Motion 和深色模式结论来自 DOM/键盘/截图抽样，不等价于完整 WCAG 审计。下一阶段 Preview 必须加入 axe 或等价检查，并以 Lighthouse Accessibility >= 0.90 作为最低门槛；任何豁免必须有具体原因和人工证据。
