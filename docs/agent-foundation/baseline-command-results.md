# 基线命令结果

采集约束：Node 版本由项目 Shell 环境提供；构建显式设置 `ENABLE_CONTENT_SYNC=false`，避免内容同步脚本备份或替换文章目录。失败是旧站现状证据，不会被隐藏为成功。

| 命令 | 开始时间 | 耗时 | 退出码 | 结果 | 工作区变化 | 摘要 | 日志 |
| --- | --- | ---: | ---: | --- | --- | --- | --- |
| `pnpm install --frozen-lockfile` | 2026-07-14T12:25:14.041Z | 2805 ms | 0 | PASS | 否 | 详见完整日志 | artifacts/baseline/logs/install.log |
| `pnpm check` | 2026-07-14T12:25:16.887Z | 29851 ms | 0 | PASS | 否 | 20:25:25 [types] Generated 947ms | artifacts/baseline/logs/astro-check.log |
| `pnpm type-check` | 2026-07-14T12:25:46.804Z | 5876 ms | 2 | FAIL | 否 | tsconfig.json(8,3): error TS5101: Option 'baseUrl' is deprecated and will stop functioning in TypeScript 7.0. Specify compilerOption '"ignoreDeprecations": "6.0"' to silence this error. | artifacts/baseline/logs/type-check.log |
| `pnpm exec eslint ./src` | 2026-07-14T12:25:52.794Z | 9524 ms | 2 | FAIL | 否 | SyntaxError: The requested module 'astro-eslint-parser' does not provide an export named 'default' | artifacts/baseline/logs/eslint-read-only.log |
| `node --test tests/migration-foundation/*.test.mts` | 2026-07-14T12:26:02.398Z | 1318 ms | 0 | PASS | 否 | 详见完整日志 | artifacts/baseline/logs/foundation-tests.log |
| `ENABLE_CONTENT_SYNC=false pnpm build` | 2026-07-14T12:26:03.758Z | 78443 ms | 0 | PASS | 是 | ✓ Completed planned list processing | artifacts/baseline/logs/production-build.log |
| `timeout ... pnpm exec lhci collect ...` | 2026-07-14T21:01:49+08:00 | 30000 ms | 124 | FAIL | 否 | 本地 LHCI 首页采集超时终止 | artifacts/baseline/logs/lighthouse-attempts.log |
| `pnpm exec lhci collect --method=psi ...` | 2026-07-14T21:02:25+08:00 | 2000 ms | 1 | FAIL | 否 | PSI runner 要求 API key | artifacts/baseline/logs/lighthouse-attempts.log |
| `agent-browser ... vitals`（3 页） | 2026-07-14T21:02:55+08:00 | 20000 ms | 0 | PASS | 否 | 两轮方向性数据已保存，不等价于 Lighthouse 分类分数 | artifacts/baseline/logs/lighthouse-attempts.log |

## 解释

- `pnpm check` 是当前可用的 Astro/Svelte 综合检查基线。
- `pnpm type-check` 的 TypeScript 6 `baseUrl` 弃用错误和后续类型问题属于既有状态。
- 原 `pnpm lint` 带 `--fix`，因此改用等价只读命令；Astro parser 的 ESM default import 不兼容属于既有状态。
- `pnpm build` 保留真实生命周期：pnpm 会执行 `prebuild`。内容同步已关闭，但壁纸与追番外部数据脚本仍可能访问网络并生成文件；实际影响见日志和 Git 状态。
