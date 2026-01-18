---
title: Kubernetes 入门到实战：部署你的第一个微服务
published: 2026-01-18
description: '这是一篇关于Kubernetes的深度技术文章'
tags: [Kubernetes, Docker, Microservices]
category: DevOps
draft: false
---

# Kubernetes 入门到实战：部署你的第一个微服务

Kubernetes（K8s）是容器编排的事实标准。本文带你从零部署你的第一个应用。

## 核心概念

| 概念 | 说明 | 类比 |
|------|------|------|
| Pod | 最小部署单元 | 一个容器组 |
| Service | 网络抽象 | 负载均衡器 |
| Deployment | 声明式更新 | 应用版本管理 |
| ConfigMap | 配置管理 | 环境变量文件 |
| Ingress | 外部访问入口 | Nginx 反向代理 |

## Deployment 配置

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: app
        image: my-app:latest
        ports:
        - containerPort: 3000
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "500m"
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
```

## 常用操作

```bash
kubectl apply -f deployment.yaml
kubectl get pods
kubectl logs -f pod-name
kubectl scale deployment my-app --replicas=5
kubectl rollout undo deployment my-app
kubectl port-forward pod-name 3000:3000
```

## 总结

Kubernetes 学习曲线陡峭，但掌握基础概念后，它能极大简化应用部署和管理。从小规模开始，逐步增加复杂度。
