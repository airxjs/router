# Router 与 Airx 兼容矩阵

## 1. 目标

本文档用于明确 `airx-router` 对 `airx` 的依赖边界、当前实现耦合点以及后续升级时的验证重点，避免主站或生态项目在升级时仅依据 `peerDependencies` 做出错误判断。

## 2. 当前包状态

- 包名: `airx-router`
- 当前版本: `0.2.1`
- peer dependency: `airx@^0.2.0`
- 代码入口: `source/index.ts`
- 核心实现: `source/router.ts`

## 3. 当前与 Airx 的实际耦合点

根据源码，Router 当前直接依赖以下 Airx 能力：

### 3.1 组件与元素模型

- `AirxComponent`
- `AirxElement`
- `createElement`

### 3.2 状态与上下文模型

- `createSignal`
- `inject`
- `provide`

### 3.3 运行模式假设

Router 假设 Airx 提供：

1. 以 JSX 组件元素为基础的渲染模型
2. 可由 `provide/inject` 传递路由实例
3. 可由 `createSignal` 驱动当前匹配元素切换

这说明 Router 并非只依赖表层类型，而是和 Airx 当前代的运行时模型深度绑定。

## 4. 兼容结论

| 依赖维度 | 要求 | 结论 |
| --- | --- | --- |
| JSX 组件模型 | `AirxComponent`, `AirxElement`, `createElement` | 强依赖 |
| 响应式状态 | `createSignal` | 强依赖 |
| 上下文机制 | `provide`, `inject` | 强依赖 |
| 路由渲染模式 | 返回 AirxElement 渲染树 | 强依赖 |

结论：

- Router 与 Airx 的兼容关系必须以“行为验证”而不是“类型能编译”来判断。
- 一旦 Airx 的 `createSignal`、上下文传递或 JSX 元素表示发生变化，Router 需要同步验证。

## 5. 版本矩阵

### 5.1 当前生态观察

| 项目 | 当前版本 | 与 Router 的关系 | 判断 |
| --- | --- | --- | --- |
| airx | `0.3.1` | 运行时基础 | Router 需要重点验证兼容 |
| airx-router | `0.2.1` | 当前项目 | 基线版本 |
| 主站 yinxulai.github.io | `airx-router@^0.1.0` | 旧代使用方 | 与当前 Router 不同代 |

### 5.2 兼容判断

| Router 版本 | 目标 Airx 版本 | 状态 |
| --- | --- | --- |
| `0.2.1` | `airx@0.3.x` | 需验证 |
| `0.2.1` | `airx@0.1.x` | 不建议假定兼容 |
| 主站当前 `0.1.x` 路由模型 | `airx@0.3.x` | 不兼容路线，不应直接升级 |

## 6. 当前治理结论

### 6.1 对主站的意义

主站当前依赖：

- `airx@^0.1.6`
- `airx-router@^0.1.0`

因此：

- 主站不能直接尝试升级到 `airx-router@0.2.x`
- 必须先完成主站运行时模型从 `0.1.x` 到 `0.3.x` 的迁移评估

### 6.2 对 Router 仓库的要求

后续 Router 版本发布前，至少需要验证以下行为：

1. 嵌套路由渲染
2. 重定向处理
3. 相对路径拼接
4. `useRouter()` 注入行为
5. `history` 变更驱动的重渲染

## 7. 下一步建议

- 建立 Router 行为测试用例，覆盖嵌套、重定向、history 监听
- 补充 `airx 0.3.x` 下的示例应用
- 在 README 或 reports 中记录已验证的 Airx 版本范围
