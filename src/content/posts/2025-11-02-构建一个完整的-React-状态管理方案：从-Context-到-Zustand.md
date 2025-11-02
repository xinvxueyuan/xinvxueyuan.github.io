---
title: 构建一个完整的 React 状态管理方案：从 Context 到 Zustand
published: 2025-11-02
description: '这是一篇关于React的深度技术文章'
tags: [React, State, Zustand]
category: Frontend
draft: false
---

# 构建一个完整的 React 状态管理方案：从 Context 到 Zustand

React 生态中有太多的状态管理方案。本文从最基础的 Context 开始，逐步演进到 Zustand，帮助你理解每种方案的适用场景。

## 方案一：useState + Props Drilling

最简单的状态管理就是 `useState` 配合 props 传递：

```jsx
function App() {
  const [count, setCount] = useState(0);
  return <Counter count={count} onIncrement={() => setCount(c => c + 1)} />;
}

function Counter({ count, onIncrement }) {
  return (
    <div>
      <Display count={count} />
      <Button onClick={onIncrement} />
    </div>
  );
}

function Display({ count }) {
  return <span>{count}</span>;
}

function Button({ onClick }) {
  return <button onClick={onClick}>+1</button>;
}
```

**适用场景**：组件层级浅、状态简单
**缺点**：Props drilling 让中间组件传递不需要的 props

## 方案二：React Context

当状态需要被多个深层组件共享时，Context 是标准方案：

```jsx
import { createContext, useContext, useReducer } from 'react';

// 1. 定义状态和 Action
interface CounterState {
  count: number;
  loading: boolean;
}

type CounterAction =
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'SET_LOADING'; payload: boolean };

// 2. 创建 Context
const CounterContext = createContext<{
  state: CounterState;
  dispatch: React.Dispatch<CounterAction>;
} | null>(null);

// 3. Reducer
function counterReducer(state: CounterState, action: CounterAction): CounterState {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + 1 };
    case 'DECREMENT':
      return { ...state, count: state.count - 1 };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

// 4. Provider 组件
function CounterProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(counterReducer, {
    count: 0,
    loading: false,
  });

  return (
    <CounterContext.Provider value={{ state, dispatch }}>
      {children}
    </CounterContext.Provider>
  );
}

// 5. 自定义 Hook
function useCounter() {
  const ctx = useContext(CounterContext);
  if (!ctx) throw new Error('useCounter must be within CounterProvider');
  return ctx;
}
```

**Context 的缺点**：
1. Provider value 变化导致所有消费者重新渲染
2. 多个 Context 嵌套导致 "Provider Hell"
3. 不适合高频更新的状态

## 方案三：Context + 选择器优化

通过拆分 Context 减少不必要的渲染：

```typescript
// 拆分状态和 dispatch
const CounterStateContext = createContext<CounterState | null>(null);
const CounterDispatchContext = createContext<React.Dispatch<CounterAction> | null>(null);

// 只读组件只订阅 state context
function CounterDisplay() {
  const state = useContext(CounterStateContext)!;
  return <span>{state.count}</span>;
}

// 只写组件只订阅 dispatch context
function IncrementButton() {
  const dispatch = useContext(CounterDispatchContext)!;
  return <button onClick={() => dispatch({ type: 'INCREMENT' })}>+1</button>;
}
```

## 方案四：Zustand —— 轻量级状态管理

Zustand 解决了 Context 的性能问题，API 极其简洁：

```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface CounterStore {
  count: number;
  loading: boolean;
  increment: () => void;
  decrement: () => void;
  incrementAsync: () => Promise<void>;
}

const useCounterStore = create<CounterStore>()(
  devtools(
    persist(
      (set, get) => ({
        count: 0,
        loading: false,
        increment: () => set(state => ({ count: state.count + 1 })),
        decrement: () => set(state => ({ count: state.count - 1 })),
        incrementAsync: async () => {
          set({ loading: true });
          await new Promise(resolve => setTimeout(resolve, 1000));
          set(state => ({ count: state.count + 1, loading: false }));
        },
      }),
      { name: 'counter-storage' }
    )
  )
);

// 使用（组件外部也可以！）
function CounterDisplay() {
  const count = useCounterStore(state => state.count);
  return <span>{count}</span>;
}

function Controls() {
  const { increment, decrement, incrementAsync, loading } = useCounterStore();
  return (
    <div>
      <button onClick={decrement}>-1</button>
      <button onClick={increment}>+1</button>
      <button onClick={incrementAsync} disabled={loading}>
        {loading ? 'Loading...' : 'Async +1'}
      </button>
    </div>
  );
}
```

## 方案五：Jotai —— 原子化状态

Jotai 适合需要细粒度状态控制的场景：

```typescript
import { atom, useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// 定义原子
const countAtom = atomWithStorage('count', 0);
const doubledAtom = atom(get => get(countAtom) * 2);

// 异步原子
const userAtom = atom(async () => {
  const response = await fetch('/api/user');
  return response.json();
});

// 可写派生原子
const countWithLogAtom = atom(
  get => get(countAtom),
  (get, set, newValue: number) => {
    console.log(`Count changed: ${get(countAtom)} -> ${newValue}`);
    set(countAtom, newValue);
  }
);
```

## 对比总结

| 方案 | 适用场景 | 学习成本 | 性能 |
|------|----------|----------|------|
| useState | 局部状态 | 低 | 最佳 |
| Context + useReducer | 全局但低频更新 | 低 | 一般 |
| Zustand | 全局通用方案 | 低 | 优秀 |
| Jotai | 细粒度原子化 | 中 | 优秀 |
| Redux Toolkit | 大型团队 | 高 | 优秀 |

## 我的推荐

- **小型项目**：useState + Context 足矣
- **中型项目**：Zustand —— 简单、高性能
- **需要细粒度**：Jotai
- **大型团队有规范需求**：Redux Toolkit

个人最常使用的是 Zustand，它用最小的 API 解决了 90% 的状态管理需求。
