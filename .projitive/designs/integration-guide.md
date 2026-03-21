# Airx Router 集成指南

## 1. 概述

`airx-router` 是 Airx 生态的前端路由库，提供基于路径的路由匹配和嵌套路由支持。

**版本**: `0.2.1`
**peer dependency**: `airx@^0.2.0`

## 2. 安装

```bash
npm install airx-router
```

## 3. 核心概念

### 3.1 路由定义

Router 支持两种路由类型：

**PathRoute（页面路由）**:
```typescript
import { Route, PathRoute } from 'airx-router'

const route: PathRoute = {
  path: '/users',
  component: UserComponent,
  children: [] // 可选的嵌套路由
}
```

**RedirectRoute（重定向路由）**:
```typescript
import { RedirectRoute } from 'airx-router'

const redirect: RedirectRoute = {
  path: '/',
  redirect: '/home'
}
```

### 3.2 嵌套路由

嵌套路由允许父路由组件渲染子路由：

```tsx
import * as airx from 'airx'
import { Router, RouteComponentProps } from 'airx-router'

// 父组件 - 必须渲染 props.children
function ParentComponent(props: RouteComponentProps) {
  return () => (
    <div>
      <h1>Parent</h1>
      {props.children}  {/* 子路由在这里渲染 */}
    </div>
  )
}

// 子路由
function ChildComponent() {
  return () => <div>Child Page</div>
}

const routes = [
  {
    path: '/parent',
    component: ParentComponent,
    children: [
      { path: '/child', component: ChildComponent }
    ]
  }
]

airx.createApp(
  <Router routes={routes} />
).mount(document.getElementById('app'))
```

### 3.3 重定向

```typescript
const routes = [
  {
    path: '/',
    redirect: '/home'  // 访问 / 时重定向到 /home
  },
  {
    path: '/home',
    component: HomeComponent
  }
]
```

**相对路径重定向**:
```typescript
const routes = [
  {
    path: '/users',
    component: UsersComponent,
    children: [
      { path: '/', redirect: 'profile' },  // /users/profile
      { path: '/profile', component: ProfileComponent }
    ]
  }
]
```

### 3.4 useRouter

获取 history 实例进行编程式导航：

```tsx
import { useRouter } from 'airx-router'

function NavigateButton() {
  const history = useRouter()
  
  return () => (
    <button onClick={() => history.push('/new-path')}>
      Go to New Path
    </button>
  )
}
```

## 4. 路由匹配规则

### 4.1 路径参数

路由支持命名路径参数：

```typescript
const route = {
  path: '/users/:id',
  component: UserDetailComponent
}
```

访问 `/users/123` 时，`props.data.params.id` 将为 `"123"`。

### 4.2 通配符匹配

带有子路由的路径会自动向后匹配：

```typescript
const route = {
  path: '/users',
  component: UsersComponent,
  children: [
    { path: '/:id', component: UserDetailComponent }
  ]
}
```

访问 `/users/123` 会匹配到 `UsersComponent`（父），然后子路由匹配到 `UserDetailComponent`。

## 5. 与 airx 的关系

### 5.1 依赖的 Airx API

Router 依赖以下 Airx 核心能力：

| API | 用途 |
| --- | --- |
| `createElement` | JSX 渲染 |
| `AirxComponent` | 组件类型定义 |
| `provide/inject` | 路由实例注入 |
| `createSignal` | 响应式状态（注意：见下方说明）|

### 5.2 ⚠️ 重要：API 兼容性

**Router 0.2.x 依赖 `airx` 的 `createSignal` 方法，但 `airx@0.3.x` 当前未导出此方法。**

这是已知的兼容性问题，需要：
1. 在 `airx` 中补充 `createSignal` 导出，或
2. 修改 router 使用 `createState` 替代

当前状态：**需验证**

## 6. 限制与约束

1. **子路由渲染**: 父组件必须在自己的渲染树中包含 `props.children`
2. **history 类型**: 默认使用 `createBrowserHistory`，可通过 `history` prop 传入自定义 history
3. **无 404 处理**: 当前版本不提供默认的 404 路由处理
4. **无路由动画**: 需要自行实现路由切换动画

## 7. 常见问题

### Q: 访问 `/` 为什么显示空白？

检查是否正确配置了根路由，以及是否有路由的 `path` 设置为 `/`。

### Q: 子路由为什么不显示？

确保父组件渲染了 `props.children`。

### Q: 重定向为什么不生效？

确保重定向路由的 `path` 能被匹配到。

## 8. 相关文档

- [Router 与 Airx 兼容矩阵](./router-airx-compatibility-matrix.md)
- [Airx API 兼容矩阵](../../airx/.projitive/designs/api-compatibility-matrix.md)
- [Vite 插件集成](../vite-plugin/.projitive/designs/vite-support-policy.md)
