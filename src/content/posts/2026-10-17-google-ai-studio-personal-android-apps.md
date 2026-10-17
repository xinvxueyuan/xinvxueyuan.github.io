---
title: "一步步用 Google AI Studio 做出并部署自己的 Android 应用"
published: 2026-10-17
description: "从规划功能、生成 Kotlin 应用、模拟器测试，到 USB 安装和 Google Play 私密部署，手把手走一遍 Google AI Studio 的 Android 应用流程。"
category: AI
tags:
  - Google AI Studio
  - Android
  - Kotlin
  - Jetpack Compose
  - Google Play
draft: false
---

# 一步步用 Google AI Studio 做出并部署自己的 Android 应用

想做一个 Android 小工具，以前通常要先装开发环境、熟悉项目结构，再解决编译、安装和分发。Google AI Studio 现在可以从自然语言描述生成原生 Android 项目，并在浏览器里的模拟器中预览；如果要装到真实手机，可以走 USB 安装，也可以在符合条件的地区使用 Google Play 新推出的个人应用私密部署流程。

这几条路很容易混为一谈，先把边界说清楚：**USB 安装只把应用装到你连接的手机；Google Play 的个人应用流程不需要开发者账号，但目前只给创建者自己的设备使用；面向测试者或公众的常规 Play 发布仍需要开发者账号。**下面按“先做出来、再测试、最后选择安装方式”的顺序走一遍。

## 开始前：挑一个范围明确的小应用

第一次做，最好选一个核心流程简单、能在本地完成的工具，例如习惯打卡、学习小测验或活动行程单。先写清楚四件事：

1. **用户要完成什么事。**例如“每天记录一次习惯，并查看本周完成情况”。
2. **需要哪些页面。**例如记录页和历史页，不必一开始就做复杂导航。
3. **数据要存在哪里。**如果只是个人小工具，可以先要求本机保存；不要默认加入账号系统或云端同步。
4. **是否真的需要设备权限。**只有用到相机、位置或蓝牙时才要求对应权限，并明确说明用途。

范围越清楚，AI 越不容易把简单工具扩写成一套过度复杂的产品。把“做一个习惯 App”改成“首页显示今天的习惯清单，点一下记录完成，数据保存在本机，历史页按日期查看”，会更容易得到可测试的结果。

## 第一步：先让 AI 帮你写一份构建计划

打开 [Google AI Studio Playground](https://aistudio.google.com/prompts/new_chat)，先不要急着生成代码。可以把下面这段提示词里的方括号内容换成自己的想法：

```text
请先为一个原生 Android 应用写清晰的构建计划，不要直接写代码。

应用名称：[习惯记录]
要解决的问题：[我想每天记录几项习惯，并查看本周完成情况]
目标用户：[只供我自己使用]
核心功能：
1. 首页显示今天的习惯清单
2. 点选习惯后记录完成状态
3. 历史页按日期查看记录
数据要求：[先保存在本机，不需要账号和云端同步]
界面要求：[简洁、中文、适合手机竖屏]

请列出页面、每页内容、主要交互、本地数据结构、需要的 Android 权限和可能的边界情况。
如果某项功能需要服务器、账号或敏感权限，请先说明，不要擅自加入。
```

检查计划时，重点看页面和数据有没有遗漏：重复点击会不会重复记一条、跨天后怎样显示、空记录时看到什么。如果计划太大，就先删掉非核心功能。你可以继续追问，例如“把云同步删掉，只保留本机记录”，直到计划符合实际需求，再复制最终计划。

## 第二步：在 Build mode 创建 Android 项目

进入 [Google AI Studio Build mode](https://aistudio.google.com/apps)，新建应用，并在平台选择器中选 **Android**。把刚才确认的计划贴进输入框，然后运行构建。

Google AI Studio 会生成 Kotlin 和 Jetpack Compose 项目，并启动浏览器内的 Android 模拟器。生成后的项目不是网页套壳：它使用 Android 原生项目结构，但目前采用单 Activity、单模块和 Jetpack Compose 的方式。

构建时可以把“先做什么”说得更具体一些：

```text
请按下面的计划生成 Android 应用。
先实现今天的习惯清单、本机保存和历史记录三个核心功能。
不要加入登录、云同步、广告、付费或未提到的权限。
生成完成后说明主要文件分别负责什么，并列出我应该在模拟器里验证的流程。

[粘贴最终构建计划]
```

这里的关键不是堆很多技术名词，而是明确目标、页面、数据边界和暂不需要的功能。对于初次尝试，先让应用完成一条完整流程，比一次要求几十个功能更容易发现问题。

## 第三步：在浏览器模拟器里测试主流程

构建完成后，AI Studio 会自动打开浏览器版 Android 模拟器。先按真实使用顺序走一遍：

1. 第一次打开应用，页面是否能正常显示？
2. 添加或勾选一条习惯后，记录有没有立刻更新？
3. 离开页面再回来，数据是否还在？
4. 没有任何记录时，空页面是否清楚说明下一步怎么做？
5. 连续点击、旋转屏幕或重新构建后，状态有没有意外丢失？

模拟器适合验证布局、导航和普通交互，但不能替代真机。Google 官方列出的限制包括：模拟器不支持相机拍摄、NFC、蓝牙；GPS 位置是模拟的；Google Play 服务也不能完整运行。因此，依赖这些硬件或服务的功能，要在真实 Android 设备上验证。

如果构建失败，先使用聊天面板里的修复入口，查看 AI Studio 给出的错误，再让它针对问题修复。不要只说“坏了”，可以把可观察到的现象讲清楚：

```text
在历史页点“返回”后，今天的完成状态消失了。
请检查数据状态的保存与恢复，只修复这个问题，并保留现有页面布局。
修复后重新构建，并说明我应该怎样复测。
```

每次只改一个主要问题，复测同一条流程，比较容易判断修复是否有效。要理解代码，可以打开预览区的 **Code** 标签，查看 Kotlin、Gradle 配置和 Android 资源；不熟悉某个文件时，直接让 AI 解释它的作用。

## 第四步：把应用装到自己的 Android 手机上

如果只是想马上在自己的手机上体验，不一定要经过 Google Play。AI Studio 支持通过浏览器 USB 功能把 APK 安装到连接的 Android 设备上。需要一台 Android 手机、一根支持数据传输的 USB 线，以及支持 WebUSB 的 Chrome 或 Edge 浏览器。

1. 在手机设置里打开“开发者选项”。常见做法是在“关于手机”里连续点按“版本号”七次；不同品牌菜单名称可能略有差异。
2. 在“开发者选项”中启用 **USB 调试**。
3. 用 USB 线把手机连接到运行 AI Studio 的电脑，并确认线缆支持数据传输，不只是充电。
4. 在 AI Studio 的应用预览面板点击 **Install on Device**（有些界面或教程会显示 Install/Install via USB），在浏览器设备选择器里选中手机。
5. 第一次连接时，手机会弹出“允许 USB 调试”提示；核对设备后点允许。安装完成后，应用会在手机上启动。

这条路径不需要本地安装 Android Studio 或 Android SDK，但它适用于连接到电脑的实体 Android 设备，不适用于 iPhone。后续在 AI Studio 里修改应用后，可以重复安装最新构建。

## 第五步：需要自用分发时，了解 Google Play 的新个人流程

2026 年 10 月，Google Play 宣布开始推出个人应用功能：使用 Google AI Studio 创建的应用可以通过 Google Play 部署到创建者自己的设备，只需要普通 Google 账号，不要求先注册 Play 开发者账号。

这个个人流程有明确限制：应用与公开商店目录隔离，不会出现在公开搜索或应用详情页，其他人也不能通过链接下载。当前从美国等部分市场开始推出，面向 18 岁及以上用户；开放进度是分阶段的，所以如果账号暂时看不到入口，不一定是你漏了某个设置。Google 表示未来计划逐步加入向亲友小范围分享的能力，但目前不要把这个计划当成已经开放的分发功能。

**需要留意官方文档的时间差。**Google AI Studio 的 Android 指南在 2026 年 8 月更新，介绍的是传统 Play 内部测试流程：在 Settings > Publish 里发布到内部测试轨道，前提是拥有开发者账号。10 月推出的个人应用私密部署是另一条新路径。若你想把应用只装给自己用，确认页面提供的是“个人应用/自用”选项；如果页面要求 Play Console 开发者账号、内部测试者名单或测试轨道，那就是传统测试发布流程，不是免开发者账号的个人部署。

## 第六步：要给测试者或公众使用，就走常规发布

如果目标是邀请别人测试，或者公开上架，就不能把“个人私密部署”当成替代品。Google AI Studio 的常规 Play 发布流程要求 Google Play Developer Account；官方教程说明需要一次性支付 25 美元注册费，并完成开发者资料和身份验证。AI Studio 会把应用签名并发布到内部测试轨道，供最多 100 位测试者安装；正式生产发布仍要在 Play Console 管理。

这两种分发方式可以简单记成：

- **只在自己的设备使用：**符合条件时选 Google Play 个人应用私密流程；没有入口时可以用 USB 直接安装。
- **邀请测试者：**使用 Play Console 内部测试流程，需要开发者账号。
- **公开给所有人下载：**走正式开发者发布流程，准备好商店资料、审核和持续维护。

别因为页面上都出现了“Google Play”就把它们当成同一条路；判断依据是应用是否公开、可供谁安装，以及发布流程要求什么账号。

## 适合什么，不适合什么

AI Studio 的原生 Android 构建适合把一个想法迅速变成可交互的手机原型，也适合做本地记录、简单工具和个人实验。当前能力边界则要提前考虑：Android 应用采用客户端结构，不包含服务端运行环境；Firebase、Google Workspace API、密钥管理和多人协作等依赖服务器的能力不适用于这类 Android 项目。它目前面向手机和平板，不支持 Wear OS、Android TV、NDK 原生 C/C++，也不支持 Java/XML 视图体系。

如果项目需要登录、云端数据库、多人同步或必须保密的 API 密钥，就不要把密钥直接写进客户端代码。先确认功能是否属于 Android 构建的支持范围；必要时把 AI Studio 生成的项目导出为 ZIP，交给 Android Studio 或其他开发环境继续完成服务端与安全设计。Android 项目目前以 ZIP 下载为外部开发入口，GitHub 导出并非当前文档列出的 Android 方案。

## 发布前的快速检查清单

- 核心流程已在模拟器里从头到尾走通。
- 依赖硬件、定位或 Google Play 服务的部分已在真机上复测。
- 应用请求的每项权限都确实需要，并能向用户说明用途。
- 不把 API 密钥、密码或私人数据硬编码进应用。
- 个人私密部署、内部测试和公开发布没有混淆。
- 如果没有计划公开上架，就不必为了个人使用误走传统 Play 开发者发布流程。

这条新流程真正降低的是个人应用从原型走到“自己手机上能用”的门槛。把问题拆小、先做一条主流程、在模拟器和真机分别验证，再根据使用体验继续迭代，才是让 AI 生成应用变得可靠的办法。

**参考资料：**

- [Google 官方 Codelab：Build and publish your first Android app with AI Studio](https://codelabs.developers.google.com/build-with-ai/build-and-publish-android-app-with-ai-studio)
- [Google AI Studio 官方文档：Build Android apps](https://ai.google.dev/gemini-api/docs/aistudio-android)
- [Google AI Studio Build mode 文档](https://ai.google.dev/gemini-api/docs/aistudio-build-mode)
- [Google Play 2026 年 10 月官方公告](https://blog.google/products-and-platforms/platforms/google-play/google-play-updates-october-2026/)
- [Android Developers：Build native Android apps in Google AI Studio](https://developer.android.com/blog/posts/build-native-android-apps-in-google-ai-studio)
- [蓝点网原文](https://www.landian.news/archives/127348.html)
