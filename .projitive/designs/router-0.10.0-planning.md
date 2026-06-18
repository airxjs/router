# Router 0.10.0 规划文档

## 目标

确定 airx-router 0.10.0 的核心改进方向，确保与 airx 0.10.0 的兼容性和功能对齐。

---

## 1. 当前版本状态

| 包 | 版本 | peerDependencies |
|---|---|---|
| airx | 0.9.0 | — |
| airx-router | 0.9.0 | airx@^0.9.0 |

---

## 2. 与 Airx 0.10.0 的潜在兼容性分析

### 2.1 当前 Router 对 Airx 的依赖点

根据源码分析，Router 直接依赖以下 Airx API：

```typescript
// source/router.ts
import { AirxComponent, AirxElement, createElement, inject, provide } from 'airx'
import { createState } from './signal.js'  // Router 自己的 signal 封装
```

**关键依赖：**
- `AirxComponent<RouteComponentProps>` — 组件类型
- `AirxElement<RouteComponentProps>` — 元素类型
- `createElement()` — JSX 运行时
- `provide/inject` — 上下文机制
- `createState` — Router 自己封装的 Signal 状态管理

### 2.2 需要验证的兼容点

| 类别 | API | 潜在风险 | 优先级 |
|---|---|---|---|
| 组件类型 | `AirxComponent` | 0.10.0 是否有签名变化 | P0 |
| 元素类型 | `AirxElement` | 返回类型是否改变 | P0 |
| createElement | 参数签名 | 是否向后兼容 | P0 |
| provide/inject | 机制 | 是否改变 | P1 |
| Signal | TC39 Signal 兼容性 | 0.10.0 是否升级 Signal 版本 | P1 |

---

## 3. Router 0.10.0 核心改进方向

### 3.1 高优先级（必须）

#### 3.1.1 完善信号驱动测试覆盖

当前 router-correctness-matrix.md 定义的 TC-S 系列（信号驱动）测试缺失：

```
TC-S-001: 导航触发 currentElement 更新
TC-S-002: 同路径重复导航
TC-S-003: 全局 Signal 单例风险
```

**建议：** 为 TC-S 系列添加完整的 vitest 测试用例

#### 3.1.2 嵌套路由增强

当前嵌套路由实现使用 `children` props 传递，但文档中提到三级嵌套 TC-N-002 缺失测试。

**建议：** 补充三级嵌套路由测试用例

### 3.2 中优先级（建议）

#### 3.2.1 相对路径拼接优化

当前相对路径拼接逻辑在 `handleRedirect` 中：

```typescript
targetPath = joinPaths(matchResult.fullPath, matchResult.route.redirect)
```

需要验证边界情况：重定向到绝对路径时的行为

#### 3.2.2 类型安全改进

当前代码中存在多处 `as any` 类型断言：

```typescript
{ data: matchResult.result } as any,
...children as any
```

**建议：** 评估是否可以用更严格的类型替代

### 3.3 低优先级（可选）

#### 3.3.1 路由元数据（meta）支持增强

当前 `BaseRoute` 定义了 `meta` 字段但未在 `RouteComponentProps` 中暴露

#### 3.3.2 404 路由支持

当前不匹配路径时返回 null，建议提供默认 404 组件配置

---

## 4. 升级验证计划

### 4.1 发布前必须验证

1. **编译验证**：`npm run build` 无错误
2. **类型检查**：`npm run lint` 无警告
3. **测试覆盖**：`npm run test:run` 全量通过
4. **与 airx 0.10.0 联调**：peerDependencies 更新后功能正常

### 4.2 兼容性回归清单

| 测试编号 | 场景 | 验证方式 |
|---|---|---|
| TC-M 系列 | 路由匹配 | 单元测试 |
| TC-N 系列 | 嵌套路由 | 单元测试 |
| TC-R 系列 | 重定向 | 单元测试 |
| TC-S 系列 | 信号驱动 | **需补充** |
| TC-I 系列 | 注入机制 | 单元测试 |

---

## 5. 下一步行动

1. **立即执行**：补充 TC-S 系列测试用例
2. **规划中**：与 airx 0.10.0 同步发布
3. **待确认**：Router 是否需要独立发版或与 airx 同步

---

*生成时间: 2026-06-18*
*TASK-0006 产出物*