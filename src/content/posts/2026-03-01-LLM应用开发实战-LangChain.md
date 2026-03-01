---
title: LLM 应用开发实战：用 LangChain 构建 AI 助手
published: 2026-03-01
description: '大语言模型（LLM）正在改变软件开发的方式。本文通过实例展示如何用 LangChain 构建实用的 ...'
tags: [LLM, LangChain, AI]
category: AI
draft: false
---

# LLM 应用开发实战：用 LangChain 构建 AI 助手

大语言模型（LLM）正在改变软件开发的方式。本文通过实例展示如何用 LangChain 构建实用的 AI 应用。


## 基础 LLM 调用

使用 ChatOpenAI 进行简单的问答和补全。temperature 参数控制随机性（0=确定性，1=创造性）。可以传递 system prompt 来定义 AI 的角色和行为。


## Prompt Template 工程

使用 ChatPromptTemplate 创建可复用的提示模板。支持变量插值和条件逻辑。好的 prompt 模板是 LLM 应用的核心——它决定了输出质量和一致性。


## RAG（检索增强生成）

RAG 让 LLM 能够基于私有知识库回答问题。流程：文档分割 → Embedding 向量化 → 存入向量数据库（Chroma/Pinecone）→ 查询时检索相关 chunks → 注入 prompt 交给 LLM 回答。


## Agent 与工具调用

Agent 让 LLM 能够使用外部工具。定义一个工具函数并标注其用途，LLM 会自动决定何时调用哪个工具。例如：计算器、天气查询、数据库查询等。AgentExecutor 负责协调交互。


## 链式操作 (Chains)

LangChain 的核心抽象——将多个操作连接成管道。支持顺序链、并行链、条件链。LangChain Expression Language (LCEL) 提供了声明式的链式定义方式。


## 总结

LLM 应用开发的三个层次：直接调用（简单问答）、RAG（基于私有知识的问答）、Agent（具备工具使用能力的自主助手）。选择哪个层次取决于你的应用需求——不需要为了 Agent 而 Agent。
