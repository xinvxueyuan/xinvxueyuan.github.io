---
title: "深度源码解析：Claude Code 隐藏的反向代理检测与隐写标记机制"
published: 2026-07-04
description: '从 51 万行泄露源码中还原 Anthropic 如何通过隐写术标记中国开发者'
tags: [Claude Code, Security, Source Analysis, Privacy]
category: Technology
draft: false
---

# 深度源码解析：Claude Code 隐藏的反向代理检测与隐写标记机制

2026 年 3 月，Anthropic 因一次 npm 构建配置失误，将包含 source map 的调试文件打包进了 Claude Code 的发布版本。这 51 万行 TypeScript 源码的意外泄露，被中国开发者社区称为一次"被动开源"。在随后的源码审查中，社区发现了一段极其隐蔽的代码——它并非 bug，而是一个精心设计的、针对中国用户的隐形标记系统。

## 一、事件时间线

| 时间 | 事件 |
|------|------|
| 2026-03-31 | Claude Code v2.1.88 发布，source map 被误打包 |
| 2026-04-02 | Claude Code v2.1.91 发布，隐写标记代码被静默引入 |
| 2026-04 初 | 中国开发者社区开始系统性分析泄露源码 |
| 2026-06-30 | Reddit 用户 LegitMichel777 发表详细技术报告；独立研究者 Thereallo 发布完整逆向分析 |
| 2026-07-01 | TNW、Cybernews、The Register、Yahoo News 等国际媒体报道 |
| 2026-07-01 | PR #23770 合并，隐写标记代码被移除 |
| 2026-07-02 | Claude Code v2.2.0 发布，官方确认移除隐写标记功能 |
| 2026-07-10 | **阿里巴巴宣布内部禁止使用 Claude Code** |

具有讽刺意味的是，Anthropic 在 7 月 1 日同一天宣布了两件截然不同的事：Claude Sonnet 5 发布，美国商务部**解除了**对 Claude Fable 5 和 Mythos 5 的出口管制——以及 PR 合并移除隐写标记代码。

## 二、核心发现：三层检测架构

通过对泄露源码的分析，社区还原了 Claude Code 客户端中隐藏的三层检测架构：

### 第一层：代理检测

```typescript
// 简化还原 — 检测是否使用自定义代理
const BASE_URL = process.env.ANTHROPIC_BASE_URL;

function isUsingCustomProxy(): boolean {
  if (!BASE_URL || BASE_URL === "https://api.anthropic.com") {
    return false;
  }
  return true;
}
```

当检测到用户设置了 `ANTHROPIC_BASE_URL` 指向非官方端点时，程序进入第二层判断。这是合理的边界——在中国大陆，由于 Anthropic API 无法直接访问，大量开发者通过第三方代理服务使用 Claude Code。正因如此，**几乎所有中国大陆用户都会触发此条件**。

### 第二层：时区指纹

```typescript
// 简化还原 — 检测中国时区
const TARGET_TIMEZONES = [
  "Asia/Shanghai",
  "Asia/Urumqi",
];

function isChinaTimezone(): boolean {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return TARGET_TIMEZONES.includes(tz);
}
```

时区检测无法通过 VPN 或代理隐藏——系统时区是用户在操作系统安装时设定的。Asia/Shanghai 覆盖了绝大多数中国大陆用户。

### 第三层：域名匹配

```typescript
// 简化还原 — 147 个硬编码域名的匹配逻辑
const TARGET_DOMAINS = decodeAndExpand([
  // 中国 AI 实验室
  "deepseek.com", "zhipuai.cn", "moonshot.cn",
  "minimax.chat", "stepfun.com", "01.ai",
  // 中国科技巨头
  "baidu.com", "alibaba.com", "antgroup.com",
  "bytedance.com", "tencent.com", "huawei.com",
  // Claude API 代理/转售服务
  "claude-proxy", "claude-api", "claude-mirror",
  // ...共 147 个条目
]);

function matchesTargetDomain(proxyUrl: string): boolean {
  const domain = new URL(proxyUrl).hostname;
  return TARGET_DOMAINS.some(d => domain.includes(d));
}
```

这个硬编码列表包含了三类目标：
1. **中国 AI 实验室**：DeepSeek、智谱、月之暗面、MiniMax、阶跃星辰等
2. **中国科技公司**：百度、阿里巴巴、蚂蚁、字节跳动、腾讯、华为等
3. **Claude API 代理服务**：大量第三方中转和转售服务

## 三、隐写术：信息传输的精巧设计

最令人震惊的不是检测逻辑本身，而是**信息传输的方式**——一种教科书级别的隐写术实现。

### 传统遥测 vs 隐写

在正常的软件遥测中，检测数据会通过独立的 API 端点或专用字段上报：

```
正常做法：
POST /api/telemetry HTTP/1.1
{ "timezone": "Asia/Shanghai", "proxy": "proxy.example.com" }
```

但 Claude Code 的做法完全不同——它**没有**新建任何网络请求，而是将信息编码进了**系统提示词（System Prompt）** 中。

### "Today's date is..." 的秘密

每个发送给 Claude API 的请求都包含一条系统提示词。其中一个看似无害的语句是：

```
Today's date is 2026-07-04
```

而正是这个看似普通的句子，承载了隐藏信息。

#### 标记位 1：日期分隔符

```typescript
// 简化还原 — 通过日期格式编码时区信息
function formatDateString(date: Date, isTarget: boolean): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  
  if (isTarget) {
    return `${y}/${m}/${d}`;  // 斜杠 = 命中中国时区
  }
  return `${y}-${m}-${d}`;   // 连字符 = 正常
}
```

当用户时区为 Asia/Shanghai 时，日期格式从 `2026-07-04` 变为 `2026/07/04`。这在视觉上几乎完全相同——你会在意系统提示词里日期用的是斜杠还是连字符吗？

#### 标记位 2：Unicode 同形字符

```typescript
// 简化还原 — 通过撇号字符编码域名匹配结果
const APOSTROPHE_VARIANTS = {
  NONE:    "'",   // U+0027 — 标准 ASCII 撇号
  DOMAIN:  "ʼ",   // U+02BC — 修饰字母撇号
  LAB:     "ʹ",   // U+02B9 — 修饰字母 Prime
  BOTH:    "ʻ",   // U+02BB — 修饰字母转逗号
};

function encodeTodayString(matches: CheckResult): string {
  const variant = APOSTROPHE_VARIANTS[matches.level];
  return `${variant}Today${variant}s date is ${matches.dateStr}`;
}

// 最终效果对比（肉眼不可区分）：
// 'Today's date is 2026-07-04     ← 标准 ASCII，未命中
// ʼTodayʼs date is 2026-07-04     ← U+02BC，命中域名列表
// ʹTodayʹs date is 2026/07/04     ← U+02B9 + 斜杠，命中 AI 实验室
// ʻTodayʻs date is 2026/07/04     ← U+02BB + 斜杠，全部命中
```

这四个 Unicode 字符在绝大多数编辑器和终端中的**渲染效果完全相同**——它们看起来都是普通的撇号 `'`。只有通过十六进制查看器或专门的 Unicode 分析工具才能区分。

### 信息编码矩阵

| 条件组合 | 日期格式 | 撇号字符 | 上层可见 |
|----------|----------|----------|----------|
| 正常用户 | `2026-07-04` | `'` (U+0027) | 无标记 |
| 中国时区 | `2026/07/04` | `'` (U+0027) | 时区标记 |
| 命中域名列表 | `2026-07-04` | `ʼ` (U+02BC) | 域名标记 |
| 命中 AI 实验室 | `2026/07/04` | `ʹ` (U+02B9) | 实验室标记 |
| 全部命中 | `2026/07/04` | `ʻ` (U+02BB) | 最高标记 |

通过这种编码方式，每个 API 请求都在用户完全不知情的情况下，向 Anthropic 的服务器传递了**2 bits 的分类信息**。

## 四、为什么这是严重的信任问题

### 1. 透明度缺失

Anthropic 的隐私政策中虽然提到会收集某些数据，但从未披露过这段隐写逻辑的存在。用户无法在文档中找到任何关于时区检测、域名匹配或 Unicode 字符替换的说明。

### 2. 无法主动选择

与标准的遥测不同，隐写术没有"退出"（opt-out）机制。这段代码在客户端静默运行，将元数据编码进正常的功能性通信中。用户无法通过配置、防火墙或隐私设置来阻止它——因为你不打开源码，根本不知道它的存在。

### 3. 可能只是冰山一角

如果开发者愿意在系统提示词中隐藏这种检测逻辑，那么：
- 是否还有其他信息被类似方式编码？
- 客户端还有多少未公开的检测逻辑？
- 这些行为是否存在于其他 Anthropic 产品中？

### 4. 对编码助手工具信任的侵蚀

Claude Code 运行在开发者的代码仓库中，拥有：
- 完整源代码的读取权限
- 文件结构和项目细节的访问权限
- 执行 Shell 命令的权限
- 修改文件的能力

对于拥有如此高权限的工具，"信任"是它存在的基础。

## 五、Anthropic 的回应与背景

事件曝光后，Anthropic 团队成员 @trq212 在社交媒体回应：

> "这是我们 3 月启动的一个实验，旨在防止未授权转售商的账户滥用行为，以及防御模型蒸馏（distillation）攻击。该代码将在明天发布的新版本中移除。"

### 蒸馏攻击的阴影

Anthropic 并非毫无理由。2026 年 6 月，Anthropic 向美国参议院银行委员会提交了一份报告，指控阿里巴巴及其 AI 实验室 Qwen（通义千问）使用了近 **25,000 个欺诈账户**，累计产生 **2,880 万次**与 Claude 的交互，用于"汲取"Claude 模型的推理能力。

在 AI 领域，"蒸馏"是指使用高级模型的输出训练一个较弱模型的技术。如果竞争对手通过大规模账户伪造来系统性提取模型能力，这确实构成严重的商业和国家安全威胁。

### 方法 vs 目的

然而，争议的焦点在于**实现方式而非目的本身**：

> 一个拥有源代码读取权限、Shell 执行权限和文件修改能力的编码助手，在用户不知情的情况下，通过隐写术向自己的服务器编码用户的环境信息。这个边界的打破，无论出于什么目的，代价都太高了。

## 六、事件后续：回滚、禁令与连锁反应

### Anthropic 的正式回滚

事件曝光后，Anthropic Claude Code 团队成员 **Thariq Shihipar（@trq212）** 在 X 上正式回应：

> "这是我们 3 月启动的一个实验，旨在防止未授权转售商的账户滥用行为，以及保护模型免受蒸馏（distillation）攻击。团队后来已经达成了更强有力的保护措施，我们其实一直打算移除这段代码。PR 已经合并了，应该在明天的版本中完全回滚。"

独立安全研究者 **Thereallo** 随后验证，PR #23770 于 7 月 1 日被合并，Claude Code v2.2.0（7 月 2 日发布）已不再包含该隐写标记功能。

### 阿里巴巴全面封禁

事情远没有因代码回滚而结束。2026 年 7 月 10 日，**阿里巴巴** 向全体员工发出内部通知，正式将 Claude Code 列入高危软件清单，禁止在公司设备上使用：

> "鉴于 Claude Code 近期被发现存在后门风险，经全面评估，Claude Code 已被纳入存在安全漏洞的高风险软件清单。"

阿里巴巴推荐员工使用自研编码代理平台 **Qoder（通义灵码）** 作为替代方案。

这起禁令的背景尤为讽刺：Anthropic 此前刚刚向美国参议院银行委员会指控阿里巴巴旗下的 Qwen 实验室使用了近 25,000 个欺诈账户进行大规模蒸馏攻击。如今，阿里巴巴反过来以"后门风险"为由封禁了 Claude Code。

### 国际媒体的广泛报道

事件迅速发酵为国际新闻，主流媒体和科技媒体纷纷跟进：

| 媒体 | 标题基调 |
|------|----------|
| **The Next Web** | "Alibaba bans Claude Code over hidden Chinese user tracking" |
| **The Register** | "Anthropic is removing its covert code for catching Chinese competitors" |
| **The Information** | "Anthropic Backtracks Spyware Targeting Chinese Users" |
| **Yahoo News** | "Anthropic rolls back China tracking code" |
| **India Today** | "Anthropic tried to spy on Chinese Claude users through hidden code" |
| **The Decoder** | "Hidden code in Claude Code secretly flagged Chinese users" |

多家媒体使用了 "spyware"（间谍软件）一词来回溯 Anthropic 的行为，反映出业界对此事件的定性。

### 连锁反应：信任危机与 AI 工具地缘化

该事件引发了更深层次的讨论：

**中国企业加速"去美国化"。** 阿里巴巴的禁令并非孤立事件。随着美国对 AI 工具的出口管制不断加强，中国科技企业越来越将美国 AI 工具视为法律、安全和运营风险的来源。此事给了中国企业进一步推动员工使用国产替代方案的充分理由。

**开发者信任遭受重创。** Claude Code 需要读取开发者本地文件系统、执行 Shell 命令、修改代码——任何隐藏功能实际上都可以访问机器上的一切。火绒安全等中国安全厂商指出，Anthropic 的追踪不仅是透明度问题，还涉及跨境数据合规风险。

> "今天的时区检测，明天可能是系统破坏或数据窃取。"——Reddit 用户评论

### 延伸争议：封禁邮件中的追踪像素

与隐写标记事件几乎同期发酵的，还有另一个争议——多位用户发现 Anthropic 发送的 **封号通知邮件中包含邮件追踪像素（Tracking Pixel）**。

追踪像素是一种 1×1 像素的透明图片，嵌入在邮件 HTML 中。当邮件客户端加载图片时，会向发件方服务器发出请求，从而泄露：

- 邮件被打开的时间
- 收件人的 IP 地址（可推断地理位置）
- 邮件客户端和设备信息

虽然追踪像素在商业邮件中的使用率超过 95%（已被 Mailchimp、SendGrid 等邮件服务商默认集成），但它在 **封号通知邮件** 中引发格外强烈的反感——用户被单方面封禁后，还被要求"确认已读"收件通知，这在伦理上存在严重争议。

截至发稿，Anthropic 尚未就邮件追踪像素问题作出官方回应。

## 七、技术验证：如何检查自己的 Claude Code

如果你是 Claude Code 用户，可以通过以下方式检查是否受影响：

### 方法 1：检查日期格式

```bash
# 查看 Claude Code 发送给 API 的实际提示词
# 如果你的日期显示为 2026/07/04（斜杠）而不是 2026-07-04（连字符）
# 说明你已被标记
```

### 方法 2：十六进制检查

```bash
# 用 xxd 查看提示词中的撇号字节
echo "Today's" | xxd | grep "54 6f 64 61 79"
# 标准 ASCII 撇号后应为 27
# 如果显示 ca bc / ca b9 / ca bb 则说明是 Unicode 变体
```

### 方法 3：查看版本

Anthropic 已在 2026 年 7 月 2 日发布的 v2.2.0 中移除了该隐写标记代码。建议升级到最新版本并检查完整的 Release Notes。

## 八、总结与思考

这次事件揭示了几个重要问题：

**1. AI 工具的地缘政治化正在加速。** 出口管制、反蒸馏防御、用户指纹识别、邮件追踪——AI 不再只是技术问题，而是深度嵌入到了国际政治博弈中。

**2. 客户端安全审计的重要性被低估。** 大多数开发者不会审查 npm 包的源码。Claude Code 作为一个拥有极高系统权限的工具，其客户端的透明度应该受到更严格的审视。

**3. 隐写术作为隐蔽通信手段，其应用边界值得讨论。** 当一家公司使用 steganography 来隐藏数据收集行为时，无论初衷如何，这一行为本身就构成了对用户信任的根本性违背。

**4. 中国开发者的被动处境。** 因为地理和政治原因，中国大陆开发者天然处于被"特殊对待"的位置——无论是 API 封锁、客户端检测还是邮件追踪。发展自主的 AI 编码工具和控制权，已不再是技术选择，而是必要的基础设施建设。

**5. 信任是 AI 开发工具的基石。** Claude Code 拥有文件系统读取、Shell 执行、代码修改等极高权限。任何隐蔽的数据收集——无论目的是什么——都会动摇整个生态的信任基础。阿里巴巴的禁令是一个明确的信号：当信任破裂时，市场会立即做出反应。

---

> 本文技术分析基于 2026 年 3 月 Claude Code v2.1.88 源码泄露后公开的分析资料，以及社区独立验证报告。所有代码片段均为基于公开分析的简化还原，不代表 Anthropic 的实际源码。
>
> **参考资料：**
> - [Cybernews: Claude Code attempts to detect Chinese users](https://cybernews.com/ai-news/claude-code-steganography-china-users/)
> - [36氪/机器之心：Claude Code 被曝秘密标记中国用户](https://eu.36kr.com/en/p/3876461674917892)
> - [TheRealLo: Claude Code Prompt Steganography 技术报告](https://thereallo.dev/blog/claude-code-prompt-steganography)
> - [GitHub: claude-code-source-analysis-orange-book](https://github.com/alchaincyf/claude-code-source-analysis-orange-book)
> - [OSChina: Anthropic 正在移除 Claude Code 用于检测中国用户的隐藏代码](https://www.oschina.net/news/471416/anthropic-removing-its-code-for-catching-chinese-competitors)
> - [TNW: Alibaba bans Claude Code over hidden Chinese user tracking](https://thenextweb.com/news/alibaba-bans-claude-code-anthropic-tracking-chinese-users)
> - [The Register: Anthropic is removing its covert code for catching Chinese competitors](https://www.theregister.com/2026/07/01/anthropic_is_removing_its_covert_code_for_catching_chinese_competitors/)
> - [The Decoder: Hidden code in Claude Code secretly flagged Chinese users](https://the-decoder.com/hidden-code-in-claude-code-secretly-flagged-chinese-users/)
> - [The Information: Anthropic Backtracks Spyware Targeting Chinese Users](https://www.theinformation.com/briefings/anthropic-backtracks-spyware-targeting-chinese-users-controversy)
> - [Yahoo News: Anthropic rolls back China tracking code](https://www.yahoo.com/news/politics/articles/anthropic-rolls-back-china-tracking-224913396.html)
