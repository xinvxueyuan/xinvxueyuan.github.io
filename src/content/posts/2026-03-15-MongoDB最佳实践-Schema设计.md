---
title: MongoDB 最佳实践：Schema 设计、索引与聚合管道
published: 2026-03-15
description: 'MongoDB 的灵活性是一把双刃剑。不当的 Schema 设计会导致严重的性能问题。...'
tags: [MongoDB, Database, NoSQL]
category: Technology
draft: false
---

# MongoDB 最佳实践：Schema 设计、索引与聚合管道

MongoDB 的灵活性是一把双刃剑。不当的 Schema 设计会导致严重的性能问题。


## 嵌入 vs 引用

嵌入：将相关数据放在同一个文档中，适合「一起读取」的数据如订单中的商品项。引用：存储关联文档的 ID，适合独立实体如用户资料。MongoDB 单个文档最大 16MB，避免嵌入无限增长的数据。


## 索引策略

每个查询都必须有对应的索引。使用 explain() 分析查询计划（目标是 IXSCAN 而非 COLLSCAN）。复合索引的列顺序遵循 ESR 规则（Equality → Sort → Range）。创建部分索引节省空间。


## 聚合管道实战

聚合管道是 MongoDB 的杀手级特性。$match（过滤）、$group（分组聚合）、$lookup（关联查询，类似 SQL JOIN）、$unwind（展开数组）、$project（重塑文档）。管道顺序对性能影响很大。


## 性能监控

db.currentOp() 查看当前操作、db.setProfilingLevel() 开启慢查询日志、mongostat/mongotop 监控实时性能。Atlas 用户可以使用 Performance Advisor 获取自动索引建议。


## 总结

MongoDB 的核心优势在于灵活性和水平扩展能力。关键原则：根据访问模式设计 Schema、每个查询都要有索引、用聚合管道替代多次查询、监控慢查询并持续优化。
