# Router 功能正确性验证矩阵（TASK-0006 产出）

## 1. 目标

本文档定义 `airx-router` 核心功能的正确性验证体系，明确可用性门禁与回归策略，确保每次升级、修改或发布后行为可验证。

---

## 2. 核心功能域划分

| 功能域 | 描述 | 测试文件 |
|--------|------|---------|
| **路由匹配** | 路径与路由配置的匹配逻辑 | `source/router.test.ts` |
| **嵌套路由** | 父子路由渲染树的构建与传递 | `source/router.test.ts` |
| **重定向** | RedirectRoute 的跳转语义 | `source/router.test.ts` |
| **历史模式** | Browser History 驱动的导航 | — |
| **信号驱动** | currentElement signal 的变更传播 | — |
| **注入机制** | useRouter() provide/inject 链路 | — |

---

## 3. 验证矩阵

### 3.1 路由匹配（TC-M 系列）

| 用例ID | 场景 | 输入 | 期望输出 | 优先级 |
|--------|------|------|---------|-------|
| TC-M-001 | 精确路径匹配 | `path=/about`，路由 `/about` | 匹配成功，params={} | P0 |
| TC-M-002 | 带参数路径匹配 | `path=/users/42`，路由 `/users/:id` | params={id:"42"} | P0 |
| TC-M-003 | 根路径匹配 | `path=/`，路由 `/` | 匹配成功 | P0 |
| TC-M-004 | 根路径空字符串 | `path=''`，路由 `/` | 匹配成功 | P0 |
| TC-M-005 | 不匹配路径 | `path=/unknown`，无对应路由 | 不匹配，返回 null | P1 |
| TC-M-006 | 路径前缀匹配（有子路由） | `path=/parent/child`，路由 `/parent`（有子路由） | 父级匹配，继续匹配子路由 | P0 |

### 3.2 嵌套路由（TC-N 系列）

| 用例ID | 场景 | 输入 | 期望输出 | 优先级 |
|--------|------|------|---------|-------|
| TC-N-001 | 二级嵌套渲染 | 路由 `/parent` + `/parent/child` | 子组件作为 props.children 传入父组件 | P0 |
| TC-N-002 | 三级嵌套 | 三层路由树 | 每层 children 正确传递 | P1 |
| TC-N-003 | 父路由匹配但无子路由匹配 | `path=/parent/unknown` | 父组件渲染，children 为空 | P1 |
| TC-N-004 | 相对路径拼接 | 父路由 `/parent`，子路由 `child` | 拼接为 `/parent/child` | P0 |

### 3.3 重定向（TC-R 系列）

| 用例ID | 场景 | 输入 | 期望输出 | 优先级 |
|--------|------|------|---------|-------|
| TC-R-001 | 基本重定向 | `path=/`，路由 `{path:"/",redirect:"/home"}` | 导航至 `/home` | P0 |
| TC-R-002 | 重定向不双触发 | 重定向路由被命中 | history.replace 仅调用一次 | P0（已有双触发风险） |
| TC-R-003 | 重定向链 | `/a` → `/b` → `/c` | 最终落地 `/c` | P2 |
| TC-R-004 | 重定向至带参数路径 | `{path:"/",redirect:"/home?ref=root"}` | 参数保留 | P2 |

### 3.4 信号驱动（TC-S 系列）

| 用例ID | 场景 | 输入 | 期望输出 | 优先级 |
|--------|------|------|---------|-------|
| TC-S-001 | 导航触发 currentElement 更新 | `history.push('/b')` | `currentElement.get()` 变为新组件元素 | P0 |
| TC-S-002 | 同路径重复导航 | `history.push('/a')`（已在 `/a`） | currentElement 不重复更新 | P1 |
| TC-S-003 | 全局 Signal 单例风险 | 多个 Router 实例 | 应相互隔离，不共享 signal | P1（已知风险） |

### 3.5 注入机制（TC-I 系列）

| 用例ID | 场景 | 输入 | 期望输出 | 优先级 |
|--------|------|------|---------|-------|
| TC-I-001 | useRouter() 返回 History | 在组件中调用 `useRouter()` | 返回有效的 History 实例 | P0 |
| TC-I-002 | 未在 Router 内使用 | 在 Router 外调用 `useRouter()` | 返回 null 或抛出明确错误 | P1 |

---

## 4. 可用性门禁（Release Gate）

### 4.1 P0 门禁（阻断发布）

以下测试全部通过，才允许发布：

- [ ] TC-M-001 ~ TC-M-004, TC-M-006
- [ ] TC-N-001, TC-N-004
- [ ] TC-R-001, TC-R-002
- [ ] TC-S-001
- [ ] TC-I-001

**执行命令**：`npm run test:run`

### 4.2 P1 门禁（建议修复后发布）

- TC-M-005、TC-N-002、TC-N-003
- TC-S-002、TC-S-003
- TC-I-002

### 4.3 P2 门禁（可延后至下一版本）

- TC-R-003、TC-R-004
- TC-N-002（三级嵌套）

---

## 5. 回归策略

### 5.1 触发时机

| 触发源 | 回归范围 |
|--------|---------|
| 修改 `source/router.ts` | 全量 TC-M / TC-N / TC-R / TC-S |
| 修改 `source/signal.ts` | TC-S 系列全量 |
| 修改 `source/path.ts` | TC-M-006、TC-N-004 |
| 升级 airx 版本 | TC-S、TC-I 全量 |
| 升级 path-to-regexp 版本 | TC-M 全量 |

### 5.2 当前测试覆盖状态

| 功能域 | 已有测试 | 缺失测试 |
|--------|---------|---------|
| 路由匹配 | ✅ TC-M-001~006（部分通过 TASK-0003） | — |
| 嵌套路由 | ✅ 基本覆盖 | TC-N-002 三级嵌套 |
| 重定向 | ✅ 基本覆盖 | TC-R-002 双触发风险验证 |
| 信号驱动 | ⚠️ 未系统覆盖 | TC-S-001 ~ TC-S-003 |
| 注入机制 | ⚠️ 部分覆盖 | TC-I-002 |

---

## 6. 与 Signals 审计的关系

TASK-0007（Router Signals 审计）已识别以下风险，本矩阵对应测试用例：

| 风险点（TASK-0007 识别） | 对应测试 |
|------------------------|---------|
| 全局 Signal 单例冲突 | TC-S-003 |
| currentElement 信号双更新 | TC-S-002 |
| 重定向双触发 history.replace | TC-R-002 |

---

## 7. 验收标准

TASK-0006 完成时满足：

- [x] 验证矩阵涵盖路由匹配、嵌套、重定向、信号、注入 5 个功能域
- [x] 每个用例有明确 ID、场景、输入、期望输出
- [x] P0/P1/P2 优先级划分清晰
- [x] 回归触发策略已定义（按变更来源分类）
- [x] 与 TASK-0007 Signals 审计结论已交叉引用

---

## 8. 参考资料

- `source/router.ts` — 核心路由实现（匹配、嵌套、重定向逻辑）
- `source/router.test.ts` — 现有测试用例
- `source/signal.ts` — 信号封装层
- `.projitive/reports/TASK-0007-execution-report.md` — Signals 审计报告（已定义 TC-1 ~ TC-8）
- `.projitive/designs/router-airx-compatibility-matrix.md` — 兼容矩阵
