---
title: PostgreSQL 性能优化实战：索引、查询与配置调优
published: 2025-12-21
description: '这是一篇关于PostgreSQL的深度技术文章'
tags: [PostgreSQL, Database, Performance]
category: Technology
draft: false
---

# PostgreSQL 性能优化实战：索引、查询与配置调优

PostgreSQL 是世界上功能最丰富的开源数据库。但要充分发挥它的性能，需要掌握一些优化技巧。

## 1. 索引优化

### B-Tree 索引（默认）

```sql
-- 单列索引
CREATE INDEX idx_users_email ON users(email);

-- 复合索引（注意列顺序！）
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at);

-- 部分索引
CREATE INDEX idx_active_users ON users(email) WHERE active = true;

-- 覆盖索引（包含额外列避免回表）
CREATE INDEX idx_users_email_name ON users(email) INCLUDE (name);
```

### GIN 索引（全文搜索、数组、JSON）

```sql
-- 全文搜索
CREATE INDEX idx_articles_search ON articles USING GIN(to_tsvector('english', content));

-- JSONB
CREATE INDEX idx_events_data ON events USING GIN(data jsonb_path_ops);

-- 数组
CREATE INDEX idx_posts_tags ON posts USING GIN(tags);
```

## 2. 查询优化

### EXPLAIN ANALYZE

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT u.name, COUNT(o.id)
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id, u.name;
```

### 常见查询反模式

```sql
-- ❌ 避免在索引列上使用函数
SELECT * FROM users WHERE LOWER(email) = 'test@example.com';

-- ✅ 使用表达式索引
CREATE INDEX idx_users_email_lower ON users(LOWER(email));

-- ❌ 避免 SELECT *
SELECT * FROM users WHERE id = 1;

-- ✅ 只选择需要的列
SELECT id, name, email FROM users WHERE id = 1;
```

## 3. 连接优化

```sql
-- ❌ 相关子查询可能很慢
SELECT u.*, 
  (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as order_count
FROM users u;

-- ✅ 使用 LATERAL JOIN
SELECT u.*, o.order_count
FROM users u
LEFT JOIN LATERAL (
  SELECT COUNT(*) as order_count FROM orders WHERE user_id = u.id
) o ON true;

-- ✅ 或者使用窗口函数
SELECT DISTINCT ON (u.id) u.*, COUNT(o.id) OVER (PARTITION BY u.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;
```

## 4. 配置调优

```ini
# postgresql.conf

# 内存配置（根据服务器内存调整）
shared_buffers = 4GB              # 25% of RAM
effective_cache_size = 12GB       # 75% of RAM  
work_mem = 64MB                   # 排序/哈希操作内存
maintenance_work_mem = 1GB        # VACUUM/CREATE INDEX 内存

# WAL 配置
wal_level = replica
max_wal_size = 4GB
min_wal_size = 1GB

# 查询规划器
random_page_cost = 1.1            # SSD 使用
effective_io_concurrency = 200    # SSD 使用

# 连接
max_connections = 200
```

## 5. 表分区

```sql
-- 按日期范围分区
CREATE TABLE orders (
  id SERIAL,
  user_id INTEGER,
  amount DECIMAL,
  created_at TIMESTAMP
) PARTITION BY RANGE (created_at);

CREATE TABLE orders_2025_q1 PARTITION OF orders
  FOR VALUES FROM ('2025-01-01') TO ('2025-04-01');

CREATE TABLE orders_2025_q2 PARTITION OF orders
  FOR VALUES FROM ('2025-04-01') TO ('2025-07-01');
```

## 总结

PostgreSQL 优化的三个层次：
1. **索引** — 正确的索引是 90% 的性能问题解决方案
2. **查询** — 好的 SQL 比差的快 1000 倍
3. **配置** — 根据硬件调整 PG 配置

工具推荐：`pg_stat_statements`、`pgBadger`、`auto_explain`
