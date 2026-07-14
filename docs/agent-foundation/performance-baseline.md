# 性能基线

## 测试环境与结论边界

- 环境：WSL2、Headless Chrome 150、线上生产源、单次暖浏览器采样。
- 本地 `@lhci/cli 0.15.1` Node runner 在首个页面长时间无输出后人工停止；PSI runner 又要求未提供的 API key。
- 因此不伪造 Lighthouse Performance/Accessibility/Best Practices/SEO 分数。以下数据来自 `agent-browser vitals`，只能作为方向性基线。

| URL | TTFB 范围 | FCP 范围 | LCP 范围 | CLS 范围 | INP |
| --- | ---: | ---: | ---: | ---: | ---: |
| 首页 | 209.1–252.4 ms | 1392–3592 ms | 1392–3592 ms | 0.14–0.16 | 无交互样本 |
| Markdown 教程 | 224.3–538.4 ms | 600–1436 ms | 892–1436 ms | 0.24–0.25 | 无交互样本 |
| 归档 | 158.5–304.9 ms | 844–1028 ms | 844–1028 ms | 0.00–0.24 | 无交互样本 |

两轮采样中 LCP 元素均是桌面横幅 `/assets/desktop-banner/1.webp`。结果波动明显，首页和教程 CLS 超过现有配置阈值 0.1；迁移后必须用固定环境的重复 Lighthouse/真实用户数据复核，不能以这些实验直接判定回归。

## 构建侧体积

- `dist/`：421 文件，98,750,403 bytes。
- HTML：57 个，21,634,111 bytes；最大页面约 529 KB。
- JavaScript：86 个，1,786,086 bytes。
- CSS：20 个，449,165 bytes。
- 图片：126 个，36,232,140 bytes。
- 字体：66 个，15,745,028 bytes。

迁移目标应优先减少全站客户端脚本、横幅布局偏移和字体/图片传输，同时保持内容功能。方向性数据见 `artifacts/baseline/lighthouse/agent-browser-vitals.json`，命令、时间和失败退出码见 `artifacts/baseline/logs/lighthouse-attempts.log`。
