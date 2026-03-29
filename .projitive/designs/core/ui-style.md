# UI Style

> **Important**: `airx-router` is a **pure logic library**. It has no visual language, no UI components, no CSS, and no design tokens. This document defines the interaction model through its API — the only way users interact with this library.

---

## Visual Language

**产品定位**：React 路由逻辑库（airx-router）

**设计风格**：
- 无 UI 组件，纯逻辑库
- 专注于 API 设计、类型安全和路由匹配正确性
- 不引入任何视觉样式依赖（无 CSS-in-JS、无样式工具）

**为什么没有 UI**：
- 作为 `airx` 组件框架的底层路由，视觉层由应用程序自行实现
- 保持极小包体积（tree-shakable，minimal dependencies）
- 路由库的职责是**路由逻辑**，不是 UI 组件

---

## Components and Patterns

本库不提供 UI 组件。公开 API 全部为**逻辑接口**。

### 公开 API 概览

| API | 类型 | 说明 |
|-----|------|------|
| `Router` | Component | 路由根组件，接收 `routes` 和可选 `history` |
| `useRouter` | Hook | 在 Router 子树中调用，返回 `History` 实例 |
| `Route` | Type | 路由配置联合类型（`PathRoute \| RedirectRoute`） |
| `PathRoute` | Type | 带组件的路径路由 |
| `RedirectRoute` | Type | 重定向路由 |
| `RouteComponentProps` | Type | 路由组件接收的标准 props |

### 路由组件 Props

```typescript
interface RouteComponentProps {
  /** path-to-regexp 的匹配结果，包含 params 和 path 信息 */
  data: MatchResult
  /** 嵌套子路由的渲染元素数组 */
  children: AirxElement<RouteComponentProps>[]
}
```

**children 语义**：子路由的渲染结果通过 `children` 传入父组件，供父组件决定如何渲染（类似 React Router 的嵌套路由模式）。

### 导航模式

所有导航通过 `History` API 纯程序化实现：

```typescript
const router = useRouter()
router.push('/path')          // 导航
router.replace('/path')        // 替换当前记录
router.back()                 // 后退
router.forward()              // 前进
```

---

## Accessibility

**本库不涉及无障碍特性**。作为底层路由库，它：

- 没有 UI 组件，因此没有键盘导航、焦点管理或 ARIA 语义
- 没有交互式元素（按钮、链接、表单控件）
- 不处理屏幕阅读器相关逻辑

**使用本库的应用负责自身 accessibility 合规**，包括：
- 确保路由切换后焦点正确管理
- 为导航元素（如 `<a>` 标签）添加适当的 ARIA 属性
- 处理 skip-to-content 等无障碍导航模式

---

## Design Tokens

**无**（纯逻辑库，无视觉样式）。

airx-router 不定义或使用任何设计 token：
- 无颜色变量
- 无字体规范
- 无间距系统
- 无断点定义

如果应用程序需要统一的视觉语言，应在**应用程序层**（而非路由库）定义 tokens。

---

## Interaction Patterns

### 路由匹配与渲染流程

```
URL 变化（history.push / 浏览器导航）
  ↓
Router.matchRoute(path) — 递归匹配路由树
  ↓
handleRedirect — 处理 RedirectRoute
  ↓
createRouteElement — 构建组件树
  ↓
currentElement.set(element) — 触发响应式更新
  ↓
子组件通过 props.children 接收嵌套路由渲染结果
```

### 嵌套路由的渲染传递

父路由组件通过 `props.children` 接收子路由元素：

```typescript
function Parent(props: RouteComponentProps) {
  return () => (
    <div>
      <h1>Parent</h1>
      {/* 子路由在此渲染 */}
      {props.children}
    </div>
  )
}
```

### 导航的调用模式

```typescript
// 在 Router 子树内的组件中使用 useRouter
function Nav() {
  const router = useRouter()
  return () => (
    <div onClick={() => router.push('/home')}>Home</div>
  )
}
```

---

## Change Triggers

当以下情况发生时，需更新本文档：

1. **添加新的 React 组件** — 本库目前无 UI 组件；如果未来添加（如 `<Link>`），需新增视觉语言和 tokens 章节
2. **修改 `RouteComponentProps` 结构** — 改变 children 传递语义或 data 属性
3. **添加新的交互 API** — 如 `useParams`、`useLocation` 等 hook
4. **改变无障碍边界** — 如添加任何交互式元素，需同步定义 a11y 规则

---

## 与 architecture.md 和 code-style.md 的一致性

- **architecture.md** 定义了系统边界：airx-router 只负责路由逻辑，UI 层由应用程序实现
- **code-style.md** 定义了代码规范：类型安全、最小依赖、tree-shakable
- **本文档** 确认并记录了：无 UI = 无视觉语言、无 design tokens、无 accessibility 特性

三份文档共同构成 airx-router 的完整设计约定，互相引用、互相印证。

---

*最后更新：2026-03-29（初始化文档）*
