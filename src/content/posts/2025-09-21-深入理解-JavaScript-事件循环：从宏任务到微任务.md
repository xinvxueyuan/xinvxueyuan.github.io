---
title: 深入理解 JavaScript 事件循环：从宏任务到微任务
published: 2025-09-21
description: '这是一篇关于JavaScript的深度技术文章'
tags: [JavaScript, Async, Event Loop]
category: Frontend
draft: false
---

# 深入理解 JavaScript 事件循环：从宏任务到微任务

JavaScript 是一门单线程语言，但它的异步能力却异常强大。这一切的背后，都离不开**事件循环（Event Loop）** 这一核心机制。

## 为什么需要事件循环？

JavaScript 最初被设计为在浏览器中运行的脚本语言，用于处理用户交互、操作 DOM。如果 JavaScript 是多线程的，多个线程同时操作 DOM 将导致不可预测的结果。因此，JavaScript 选择了单线程模型。

但单线程意味着如果遇到耗时操作（如网络请求、文件读写），整个页面就会卡住。为了解决这个问题，JavaScript 引入了**异步编程**和**事件循环**。

## 调用栈（Call Stack）

JavaScript 引擎有一个调用栈，用于追踪函数执行：

```javascript
function foo() {
  console.log('foo');
  bar();
}

function bar() {
  console.log('bar');
}

foo();
// 输出：foo → bar
```

调用栈遵循 LIFO（后进先出）原则。当函数执行完毕，它就会被弹出栈。

## 任务队列（Task Queue）

当遇到异步操作时（如 `setTimeout`、`setInterval`、I/O），回调函数不会立即执行，而是被放入**任务队列**中等待。

```javascript
console.log('1');

setTimeout(() => {
  console.log('2');
}, 0);

console.log('3');

// 输出：1 → 3 → 2
```

即使 `setTimeout` 的延迟设置为 0，回调也会被放入任务队列，等待调用栈清空后才执行。

## 微任务（Microtask）

ES6 引入了 **Promise** 和**微任务**的概念。微任务的优先级**高于**宏任务（普通任务）。

微任务包括：
- `Promise.then()` / `Promise.catch()` / `Promise.finally()`
- `MutationObserver`
- `queueMicrotask()`
- `process.nextTick()`（Node.js）

```javascript
console.log('start');

setTimeout(() => {
  console.log('timeout');
}, 0);

Promise.resolve().then(() => {
  console.log('promise');
});

console.log('end');

// 输出：start → end → promise → timeout
```

## 事件循环的执行顺序

每一轮事件循环（tick）的执行顺序如下：

1. 执行一个宏任务（从宏任务队列中取出最老的一个）
2. 执行所有微任务（清空微任务队列）
3. 如果需要，渲染更新
4. 重复以上步骤

这解释了为什么 `Promise.then()` 的回调比 `setTimeout` 先执行——因为微任务在每轮事件循环结束时就会被清空，而宏任务需要等待下一轮。

## Node.js 中的事件循环

Node.js 的事件循环基于 **libuv** 库，比浏览器中的事件循环更复杂，分为以下几个阶段：

1. **timers**：执行 `setTimeout` 和 `setInterval` 的回调
2. **pending callbacks**：执行延迟到下一轮的 I/O 回调
3. **idle, prepare**：内部使用
4. **poll**：获取新的 I/O 事件
5. **check**：执行 `setImmediate` 的回调
6. **close callbacks**：执行关闭事件的回调

每个阶段之间，Node.js 会检查并清空微任务队列。

```javascript
const fs = require('fs');

fs.readFile(__filename, () => {
  setTimeout(() => console.log('timeout'), 0);
  setImmediate(() => console.log('immediate'));
  Promise.resolve().then(() => console.log('promise'));
  process.nextTick(() => console.log('nextTick'));
});

// 输出顺序：nextTick → promise → immediate → timeout
// （在 I/O 回调中，setImmediate 优先于 setTimeout）
```

## 实际应用

理解事件循环对于编写高性能 JavaScript 应用至关重要：

### 1. 避免阻塞主线程

```javascript
// ❌ 错误：阻塞主线程
function heavyComputation() {
  let result = 0;
  for (let i = 0; i < 1e9; i++) {
    result += i;
  }
  return result;
}

// ✅ 正确：使用 setTimeout 分批处理
function heavyComputationAsync() {
  return new Promise(resolve => {
    let result = 0;
    let i = 0;
    function chunk() {
      const end = Math.min(i + 1e6, 1e9);
      for (; i < end; i++) result += i;
      if (i < 1e9) setTimeout(chunk, 0);
      else resolve(result);
    }
    chunk();
  });
}
```

### 2. 理解 async/await

`async/await` 本质上是 Promise + Generator 的语法糖：

```javascript
async function fetchData() {
  console.log('1');
  const data = await fetch('/api/data'); // await 之后的代码相当于 .then()
  console.log('2');
  return data;
}

// 等价于：
function fetchData() {
  console.log('1');
  return fetch('/api/data').then(data => {
    console.log('2');
    return data;
  });
}
```

## 总结

| 类型 | 示例 | 优先级 |
|------|------|--------|
| 同步代码 | 普通函数调用 | 最高 |
| 微任务 | Promise.then, queueMicrotask | 中 |
| 宏任务 | setTimeout, setInterval, I/O | 最低 |

深入理解事件循环不仅能帮助你写出正确的异步代码，还能让你在面试中脱颖而出。

> **关键记住**：微任务在每轮事件循环结束前全部执行，宏任务每次只执行一个。这就是为什么 Promise 比 setTimeout 快的原因。
