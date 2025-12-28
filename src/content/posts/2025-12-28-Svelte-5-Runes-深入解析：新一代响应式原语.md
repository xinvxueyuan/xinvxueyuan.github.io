---
title: Svelte 5 Runes 深入解析：新一代响应式原语
published: 2025-12-28
description: '这是一篇关于Svelte的深度技术文章'
tags: [Svelte, Runes, Reactivity]
category: Frontend
draft: false
---

# Svelte 5 Runes 深入解析：新一代响应式原语

Svelte 5 引入了 Runes——一种全新的响应式声明方式，彻底改变了 Svelte 的编程模型。

## 为什么需要 Runes？

Svelte 4 的响应式依赖于编译器的魔法：

```svelte
<script>
  // Svelte 4: 赋值触发响应式
  let count = 0;
  $: doubled = count * 2;  // $: 是响应式声明
  
  // 问题：不直观的响应式边界
  function increment() {
    count += 1;  // 赋值触发更新
    // 但 array.push() 不会！
  }
</script>
```

## $state — 响应式状态

```svelte
<script>
  // Svelte 5: 明确的响应式声明
  let count = $state(0);
  let doubled = $derived(count * 2);
  
  function increment() {
    count += 1;  // 自动追踪
  }
</script>

<button onclick={increment}>
  Count: {count} (doubled: {doubled})
</button>
```

## $derived — 派生值

```svelte
<script>
  let items = $state([1, 2, 3, 4, 5]);
  
  let total = $derived(items.reduce((a, b) => a + b, 0));
  let evens = $derived(items.filter(n => n % 2 === 0));
  
  // $derived.by 用于复杂表达式
  let summary = $derived.by(() => {
    const sum = items.reduce((a, b) => a + b, 0);
    const avg = sum / items.length;
    return { sum, avg, count: items.length };
  });
</script>
```

## $effect — 副作用

```svelte
<script>
  let count = $state(0);
  
  $effect(() => {
    // 当 count 变化时自动运行
    console.log(`Count changed to ${count}`);
    
    // 可选的清理函数
    return () => {
      console.log('Cleanup before next run or unmount');
    };
  });
</script>
```

## $props — 组件 Props

```svelte
<!-- Child.svelte -->
<script>
  let { name, age = 18, onUpdate } = $props();
</script>

<p>{name} is {age} years old</p>

<!-- Parent.svelte -->
<script>
  import Child from './Child.svelte';
</script>

<Child name="Alice" age={25} />
```

## 实战：Todo 应用

```svelte
<script>
  let todos = $state([]);
  let newTodo = $state('');
  
  let completedCount = $derived(
    todos.filter(t => t.done).length
  );
  
  function addTodo() {
    if (newTodo.trim()) {
      todos.push({ id: Date.now(), text: newTodo, done: false });
      newTodo = '';
    }
  }
  
  function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) todo.done = !todo.done;
  }
</script>

<div>
  <input bind:value={newTodo} placeholder="Add todo..." />
  <button onclick={addTodo}>Add</button>
  
  <p>{completedCount}/{todos.length} completed</p>
  
  {#each todos as todo (todo.id)}
    <div>
      <input type="checkbox" checked={todo.done} 
             onchange={() => toggleTodo(todo.id)} />
      <span class:line-through={todo.done}>{todo.text}</span>
    </div>
  {/each}
</div>
```

## Runes vs Svelte 4 对比

| 特性 | Svelte 4 | Svelte 5 (Runes) |
|------|----------|------------------|
| 响应式声明 | `let count = 0` | `let count = $state(0)` |
| 派生值 | `$: doubled = count * 2` | `let doubled = $derived(count * 2)` |
| 副作用 | `$: { ... }` | `$effect(() => { ... })` |
| Props | `export let name` | `let { name } = $props()` |
| 通用性 | 仅 .svelte 文件 | .svelte 和 .svelte.js |

## 总结

Runes 让 Svelte 的响应式更加显式和可移植。关键词：
- `$state` — 响应式状态
- `$derived` — 派生值
- `$effect` — 副作用
- `$props` — 组件属性

Runes 可以在 `.svelte.js` 文件中使用，打破了 Svelte 响应式与组件的耦合。
