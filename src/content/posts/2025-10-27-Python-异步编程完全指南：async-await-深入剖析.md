---
title: Python 异步编程完全指南：async/await 深入剖析
published: 2025-10-27
description: '这是一篇关于Python的深度技术文章'
tags: [Python, Async, asyncio]
category: Technology
draft: false
---

# Python 异步编程完全指南：async/await 深入剖析

Python 的异步编程经历了从回调地狱到 `async/await` 的演进。本文带你深入理解 Python 的异步模型。

## 为什么需要异步？

传统的同步 I/O 会阻塞线程：

```python
import time

def fetch_url(url):
    time.sleep(1)  # 模拟网络请求
    return f"Data from {url}"

def main():
    urls = ["url1", "url2", "url3"]
    results = [fetch_url(url) for url in urls]
    # 需要 3 秒！
```

异步版本可以在等待 I/O 时切换到其他任务：

```python
import asyncio

async def fetch_url(url):
    await asyncio.sleep(1)
    return f"Data from {url}"

async def main():
    urls = ["url1", "url2", "url3"]
    tasks = [fetch_url(url) for url in urls]
    results = await asyncio.gather(*tasks)
    # 只需要约 1 秒！
```

## 协程（Coroutine）

`async def` 定义的是协程函数，调用它返回一个协程对象：

```python
async def hello():
    return "Hello"

coro = hello()
print(type(coro))  # <class 'coroutine'>

# 协程需要通过 await 或 asyncio.run() 来执行
result = asyncio.run(coro)
print(result)  # Hello
```

## 事件循环（Event Loop）

事件循环是异步编程的核心——它负责调度和执行协程：

```python
import asyncio

async def task(name, delay):
    await asyncio.sleep(delay)
    print(f"Task {name} done")
    return name

async def main():
    # 同时启动三个任务
    results = await asyncio.gather(
        task("A", 2),
        task("B", 1),
        task("C", 0.5),
    )
    print(f"Results: {results}")

asyncio.run(main())
# 输出顺序：C → B → A → Results: ['A', 'B', 'C']
```

## Task 与 Future

- **Task**：对协程的封装，调度其在事件循环中执行
- **Future**：表示一个尚未完成的结果

```python
async def main():
    # create_task 立即调度协程
    task1 = asyncio.create_task(fetch_url("url1"))
    task2 = asyncio.create_task(fetch_url("url2"))
    
    # 可以取消任务
    task2.cancel()
    
    try:
        await task2
    except asyncio.CancelledError:
        print("Task 2 was cancelled")
    
    result = await task1
    print(result)
```

## 异步上下文管理器

```python
import asyncio

class AsyncConnection:
    async def __aenter__(self):
        print("Opening connection...")
        await asyncio.sleep(0.1)
        return self
    
    async def __aexit__(self, *args):
        print("Closing connection...")
        await asyncio.sleep(0.1)
    
    async def query(self, sql):
        await asyncio.sleep(0.1)
        return f"Result of: {sql}"

async def main():
    async with AsyncConnection() as conn:
        result = await conn.query("SELECT * FROM users")
        print(result)
```

## 异步迭代器

```python
class AsyncRange:
    def __init__(self, start, end):
        self.current = start
        self.end = end
    
    def __aiter__(self):
        return self
    
    async def __anext__(self):
        if self.current >= self.end:
            raise StopAsyncIteration
        await asyncio.sleep(0.1)  # 模拟异步操作
        self.current += 1
        return self.current - 1

async def main():
    async for num in AsyncRange(0, 5):
        print(num)
```

## 异步生成器

```python
async def async_range(start, end):
    for i in range(start, end):
        await asyncio.sleep(0.1)
        yield i

async def main():
    async for num in async_range(0, 5):
        print(num)
    
    # 异步列表推导（Python 3.11+）
    results = [num async for num in async_range(0, 5)]
    print(results)  # [0, 1, 2, 3, 4]
```

## 实战：异步 HTTP 客户端

```python
import asyncio
import aiohttp
from typing import List, Dict

class AsyncHttpClient:
    def __init__(self, concurrency: int = 10):
        self.semaphore = asyncio.Semaphore(concurrency)
        self.session: aiohttp.ClientSession | None = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, *args):
        if self.session:
            await self.session.close()
    
    async def fetch(self, url: str) -> Dict:
        async with self.semaphore:
            async with self.session.get(url) as response:
                return {
                    "url": url,
                    "status": response.status,
                    "body": await response.text()[:200]
                }
    
    async def fetch_many(self, urls: List[str]) -> List[Dict]:
        tasks = [self.fetch(url) for url in urls]
        return await asyncio.gather(*tasks, return_exceptions=True)

async def main():
    urls = [
        "https://httpbin.org/delay/1",
        "https://httpbin.org/delay/2",
        "https://httpbin.org/get",
    ] * 5  # 15 个请求
    
    async with AsyncHttpClient(concurrency=5) as client:
        results = await client.fetch_many(urls)
        for r in results:
            if isinstance(r, Exception):
                print(f"Error: {r}")
            else:
                print(f"{r['url']}: {r['status']}")

asyncio.run(main())
```

## 常见陷阱

### 1. 在协程中调用阻塞函数

```python
# ❌ 错误：阻塞事件循环
async def bad():
    time.sleep(5)  # 阻塞整个事件循环！

# ✅ 正确：使用线程池
async def good():
    await asyncio.to_thread(time.sleep, 5)
```

### 2. 忘记 await

```python
async def fetch_data():
    await asyncio.sleep(1)
    return "data"

async def main():
    # ❌ coroutine was never awaited
    result = fetch_data()
    
    # ✅
    result = await fetch_data()
```

### 3. 在同步代码中使用 asyncio.run()

```python
# ❌ 在已有事件循环的环境中使用 asyncio.run()
# asyncio.run(fetch_data())

# ✅ 在 Jupyter 等环境中使用
await fetch_data()
```

## 总结

Python 的异步编程模型相对直观，但需要注意：

- 使用 `async/await` 编写协程
- 用 `asyncio.gather()` 并发执行多个任务
- 避免在协程中调用阻塞函数
- 使用 `aiohttp`、`asyncpg` 等异步库获得真正的性能提升
- 理解事件循环的工作方式帮助调试问题
