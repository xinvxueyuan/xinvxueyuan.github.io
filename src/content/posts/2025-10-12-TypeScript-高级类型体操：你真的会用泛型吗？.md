---
title: TypeScript 高级类型体操：你真的会用泛型吗？
published: 2025-10-12
description: '这是一篇关于TypeScript的深度技术文章'
tags: [TypeScript, Generics, Types]
category: Frontend
draft: false
---

# TypeScript 高级类型体操：你真的会用泛型吗？

TypeScript 的类型系统是图灵完备的——这意味着你可以在类型层面进行编程。掌握高级类型技巧，能让你的代码类型安全性提升一个档次。

## 泛型基础回顾

泛型允许我们编写可复用的类型安全代码：

```typescript
// 没有泛型：重复代码
function getFirstNumber(arr: number[]): number | undefined {
  return arr[0];
}
function getFirstString(arr: string[]): string | undefined {
  return arr[0];
}

// 使用泛型：一次定义，多处使用
function getFirst<T>(arr: T[]): T | undefined {
  return arr[0];
}

const num = getFirst([1, 2, 3]); // number | undefined
const str = getFirst(["a", "b"]); // string | undefined
```

## 泛型约束（Constraints）

使用 `extends` 关键字约束泛型参数：

```typescript
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(item: T): T {
  console.log(item.length);
  return item;
}

logLength("hello");   // ✅ string 有 length
logLength([1, 2, 3]); // ✅ array 有 length
// logLength(123);    // ❌ number 没有 length
```

## 条件类型（Conditional Types）

```typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<"hello">; // true
type B = IsString<42>;      // false

// 实用例子：提取 Promise 的返回值类型
type Awaited<T> = T extends Promise<infer U> ? U : T;

type Result = Awaited<Promise<string>>; // string
type Plain = Awaited<number>;          // number
```

## `infer` 关键字

`infer` 用于在条件类型中推断类型：

```typescript
// 提取数组元素类型
type ArrayItem<T> = T extends (infer U)[] ? U : never;
type Item = ArrayItem<string[]>; // string

// 提取函数返回值类型
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type Fn = (x: number) => string;
type Ret = ReturnType<Fn>; // string

// 提取函数第一个参数类型
type FirstParam<T> = T extends (first: infer F, ...rest: any[]) => any ? F : never;
type Param = FirstParam<(a: string, b: number) => void>; // string
```

## 映射类型（Mapped Types）

```typescript
// 将所有属性变为只读
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};

// 将所有属性变为可选
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

// 挑选特定属性
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

interface User {
  name: string;
  age: number;
  email: string;
}

type ReadonlyUser = MyReadonly<User>;
type OptionalUser = MyPartial<User>;
type UserPreview = MyPick<User, "name" | "email">;
```

## 模板字面量类型（Template Literal Types）

TypeScript 4.1 引入了模板字面量类型，可以进行字符串级别的类型运算：

```typescript
type EventName<T extends string> = `on${Capitalize<T>}`;
type Click = EventName<"click">; // "onClick"

// 实用例子：类型安全的事件系统
type Events = {
  click: { x: number; y: number };
  focus: { target: string };
  blur: void;
};

type EventHandlerMap = {
  [K in keyof Events as `on${Capitalize<K & string>}`]: (e: Events[K]) => void;
};

// EventHandlerMap = {
//   onClick: (e: { x: number; y: number }) => void;
//   onFocus: (e: { target: string }) => void;
//   onBlur: (e: void) => void;
// }
```

## 递归类型

```typescript
// 深度 Partial
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

// 深度 Readonly
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

interface Config {
  server: {
    host: string;
    port: number;
    ssl: {
      enabled: boolean;
      cert: string;
    };
  };
}

type PartialConfig = DeepPartial<Config>;
// 所有层级都变为可选
```

## 实用工具类型实现

```typescript
// 排除 null 和 undefined
type NonNullable<T> = T extends null | undefined ? never : T;

// 从联合类型中排除特定类型
type MyExclude<T, U> = T extends U ? never : T;
type OnlyString = MyExclude<string | number | boolean, number | boolean>; // string

// 提取联合类型中的特定类型
type MyExtract<T, U> = T extends U ? T : never;
type OnlyNum = MyExtract<string | number | boolean, number>; // number

// 函数参数类型
type Parameters<T extends (...args: any) => any> = 
  T extends (...args: infer P) => any ? P : never;

// 构造函数参数类型
type ConstructorParameters<T extends abstract new (...args: any) => any> = 
  T extends abstract new (...args: infer P) => any ? P : never;
```

## 实战：类型安全的 API 客户端

```typescript
// 定义 API 路由
interface ApiRoutes {
  "/users": {
    get: { response: User[] };
    post: { body: CreateUserDto; response: User };
  };
  "/users/:id": {
    get: { params: { id: string }; response: User };
    put: { params: { id: string }; body: UpdateUserDto; response: User };
    delete: { params: { id: string }; response: void };
  };
}

// 类型安全的请求函数
type RequestConfig<Method extends string, Config> = 
  Config extends { body: infer B } 
    ? { method: Method; body: B } & Omit<Config, "body" | "response">
    : { method: Method } & Omit<Config, "response">;

function request<
  Path extends keyof ApiRoutes,
  Method extends keyof ApiRoutes[Path]
>(
  path: Path,
  config: RequestConfig<Method & string, ApiRoutes[Path][Method]>
): Promise<ApiRoutes[Path][Method] extends { response: infer R } ? R : never> {
  // 实现省略...
  return fetch(path, config as any).then(r => r.json());
}

// 使用时有完整的类型提示：
const users = await request("/users", { method: "get" });
// users: User[]

const newUser = await request("/users", {
  method: "post",
  body: { name: "Alice", email: "alice@example.com" }
});
// newUser: User
```

## 总结

TypeScript 的高级类型工具让你能在编译时捕获更多错误。关键技巧包括：

- **泛型约束**限制类型参数的范围
- **条件类型**实现类型的条件分支
- **`infer`** 提取类型信息
- **映射类型**对对象类型进行变换
- **模板字面量类型**实现字符串级别的类型安全

掌握这些技巧，你写出的 TypeScript 代码将更加健壮和自文档化。
