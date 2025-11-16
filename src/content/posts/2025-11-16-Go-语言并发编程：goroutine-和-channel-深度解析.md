---
title: Go 语言并发编程：goroutine 和 channel 深度解析
published: 2025-11-16
description: '这是一篇关于Go的深度技术文章'
tags: [Go, Goroutine, Channel]
category: Technology
draft: false
---

# Go 语言并发编程：goroutine 和 channel 深度解析

Go 语言以其简洁的并发模型闻名。"不要通过共享内存来通信，而要通过通信来共享内存"——这是 Go 并发编程的核心理念。

## goroutine：轻量级线程

goroutine 是 Go 运行时管理的轻量级线程，创建成本极低：

```go
package main

import (
    "fmt"
    "time"
)

func sayHello() {
    fmt.Println("Hello from goroutine!")
}

func main() {
    go sayHello() // 启动一个 goroutine
    time.Sleep(100 * time.Millisecond) // 等待 goroutine 执行
    fmt.Println("Main done")
}
```

一个 Go 程序可以轻松运行成千上万个 goroutine：

```go
func main() {
    for i := 0; i < 100000; i++ {
        go func(id int) {
            time.Sleep(time.Second)
            fmt.Printf("Goroutine %d done\n", id)
        }(i)
    }
    time.Sleep(2 * time.Second)
}
```

## WaitGroup：等待一组 goroutine

```go
import "sync"

func main() {
    var wg sync.WaitGroup
    
    for i := 0; i < 5; i++ {
        wg.Add(1) // 计数器 +1
        go func(id int) {
            defer wg.Done() // 计数器 -1
            fmt.Printf("Worker %d\n", id)
        }(i)
    }
    
    wg.Wait() // 等待所有 goroutine 完成
    fmt.Println("All workers done")
}
```

## Channel：goroutine 之间的通信管道

Channel 是 Go 并发模型的核心：

```go
func main() {
    ch := make(chan string) // 创建无缓冲 channel
    
    go func() {
        ch <- "Hello from goroutine!" // 发送
    }()
    
    msg := <-ch // 接收（阻塞直到有数据）
    fmt.Println(msg)
}
```

### 有缓冲 Channel

```go
func main() {
    ch := make(chan int, 3) // 容量为 3 的缓冲 channel
    
    ch <- 1 // 不阻塞
    ch <- 2
    ch <- 3
    // ch <- 4 // 阻塞！缓冲区满
    
    fmt.Println(<-ch) // 1
    fmt.Println(<-ch) // 2
    fmt.Println(<-ch) // 3
}
```

### 关闭 Channel

```go
func main() {
    ch := make(chan int, 5)
    
    go func() {
        for i := 0; i < 5; i++ {
            ch <- i
        }
        close(ch) // 关闭 channel
    }()
    
    // range 会在 channel 关闭且为空时自动退出
    for val := range ch {
        fmt.Println(val)
    }
    
    // 或者手动检查
    val, ok := <-ch
    if !ok {
        fmt.Println("Channel closed")
    }
}
```

## Select：多路复用

```go
func main() {
    ch1 := make(chan string)
    ch2 := make(chan string)
    
    go func() {
        time.Sleep(1 * time.Second)
        ch1 <- "one"
    }()
    
    go func() {
        time.Sleep(2 * time.Second)
        ch2 <- "two"
    }()
    
    for i := 0; i < 2; i++ {
        select {
        case msg1 := <-ch1:
            fmt.Println("Received from ch1:", msg1)
        case msg2 := <-ch2:
            fmt.Println("Received from ch2:", msg2)
        case <-time.After(3 * time.Second):
            fmt.Println("Timeout!")
            return
        }
    }
}
```

## 并发模式

### 1. Fan-Out / Fan-In

```go
// Fan-Out: 一个输入分发到多个 worker
func fanOut(input <-chan int, workers int) []<-chan int {
    channels := make([]<-chan int, workers)
    for i := 0; i < workers; i++ {
        ch := make(chan int)
        channels[i] = ch
        go func(out chan<- int) {
            for val := range input {
                out <- val * val // worker 处理
            }
            close(out)
        }(ch)
    }
    return channels
}

// Fan-In: 多个 channel 合并为一个
func fanIn(channels ...<-chan int) <-chan int {
    out := make(chan int)
    var wg sync.WaitGroup
    
    for _, ch := range channels {
        wg.Add(1)
        go func(c <-chan int) {
            defer wg.Done()
            for val := range c {
                out <- val
            }
        }(ch)
    }
    
    go func() {
        wg.Wait()
        close(out)
    }()
    
    return out
}
```

### 2. Pipeline

```go
func generate(nums ...int) <-chan int {
    out := make(chan int)
    go func() {
        for _, n := range nums {
            out <- n
        }
        close(out)
    }()
    return out
}

func square(in <-chan int) <-chan int {
    out := make(chan int)
    go func() {
        for n := range in {
            out <- n * n
        }
        close(out)
    }()
    return out
}

func main() {
    // Pipeline: generate → square → print
    for result := range square(generate(1, 2, 3, 4, 5)) {
        fmt.Println(result) // 1, 4, 9, 16, 25
    }
}
```

### 3. Worker Pool

```go
func worker(id int, jobs <-chan int, results chan<- int) {
    for job := range jobs {
        fmt.Printf("Worker %d processing job %d\n", id, job)
        time.Sleep(time.Second) // 模拟工作
        results <- job * 2
    }
}

func main() {
    const numJobs = 10
    const numWorkers = 3
    
    jobs := make(chan int, numJobs)
    results := make(chan int, numJobs)
    
    // 启动 worker pool
    for w := 1; w <= numWorkers; w++ {
        go worker(w, jobs, results)
    }
    
    // 发送任务
    for j := 1; j <= numJobs; j++ {
        jobs <- j
    }
    close(jobs)
    
    // 收集结果
    for j := 1; j <= numJobs; j++ {
        result := <-results
        fmt.Printf("Result: %d\n", result)
    }
}
```

## 常见陷阱

### 1. goroutine 泄漏

```go
// ❌ 泄漏：goroutine 永远阻塞在 channel 发送上
func leak() {
    ch := make(chan int)
    go func() {
        ch <- 42 // 永远阻塞，因为没有接收者
    }()
}

// ✅ 使用 buffered channel 或 context 取消
func noLeak() {
    ctx, cancel := context.WithTimeout(context.Background(), time.Second)
    defer cancel()
    
    ch := make(chan int, 1)
    go func() {
        select {
        case ch <- 42:
        case <-ctx.Done():
            return
        }
    }()
}
```

### 2. 数据竞争

```go
// ❌ 数据竞争
var counter int
for i := 0; i < 1000; i++ {
    go func() { counter++ }()
}

// ✅ 使用 Mutex
var mu sync.Mutex
var counter int
for i := 0; i < 1000; i++ {
    go func() {
        mu.Lock()
        counter++
        mu.Unlock()
    }()
}

// ✅ 或使用 channel
ch := make(chan int)
go func() {
    var counter int
    for delta := range ch {
        counter += delta
    }
}()
```

## 总结

Go 的并发模型简单而强大：
- `go` 关键字启动 goroutine
- Channel 用于 goroutine 间通信
- `select` 处理多个 channel
- `sync.WaitGroup` 等待 goroutine
- `sync.Mutex` 保护共享数据

记住 Go 的并发哲学：**Don't communicate by sharing memory; share memory by communicating.**
