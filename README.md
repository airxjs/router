# router [![npm](https://img.shields.io/npm/v/airx-router.svg)](https://www.npmjs.com/package/airx-router) [![build status](https://github.com/airxjs/router/actions/workflows/check.yml/badge.svg?branch=main)](https://github.com/airxjs/router/actions/workflows/check.yml)

Front-end routing for airx

## Install

```bash
npm install airx-router
```

Requires `airx` as a peer dependency:

```bash
npm install airx
```

## Use

```tsx
import * as airx from 'airx'
import { RouteComponentProps, Router } from 'airx-router'

function TestRouteComponent(props: RouteComponentProps) {
  // Matching child routes will be rendered here
  return () => props.children
}

const route = {
  path: '/root',
  component: TestRouteComponent,
  children: [
    {
      path: '/',
      redirect: 'child-1'
    },
    {
      path: 'child-1',
      component: TestRouteComponent,
      children: [
        {
          path: '/',
          redirect: 'child-2'
        },
        {
          path: 'child-2',
          component: TestRouteComponent
        }
      ]
    }
  ]
}

airx
  .createApp(<Router routes={[route]} />)
  .mount(document.getElementById('app'))
```

## API

### `<Router>`

The main router component that manages routing state and renders matched routes.

#### Props

- `routes: Route[] | Route` - Route configuration, can be a single route or array
- `history?: History` - Optional history instance (defaults to `createBrowserHistory()`)

#### Returns

A render function that returns the current matched route element.

### `Route` Types

```ts
// Path route - renders a component
interface PathRoute {
  path: string
  name?: string
  meta?: Record<string, unknown>
  component: AirxComponent<RouteComponentProps>
  children?: Route[]
}

// Redirect route - redirects to another path
interface RedirectRoute {
  path: string
  name?: string
  meta?: Record<string, unknown>
  redirect: string
}
```

### `RouteComponentProps`

```ts
interface RouteComponentProps {
  data: MatchResult      // Path matching results with params
  children: AirxElement<RouteComponentProps>[]  // Nested child route elements
}
```

### `useRouter()`

Hook to access the history instance from anywhere in the component tree:

```tsx
import { useRouter } from 'airx-router'

function MyComponent() {
  const history = useRouter()
  
  const handleClick = () => {
    history.push('/new-path')
  }
  
  return <button onClick={handleClick}>Navigate</button>
}
```

## Path Matching

### Static Paths

```tsx
{ path: '/page', component: PageComponent }
```

Matches exactly `/page`.

### Root Path

```tsx
{ path: '/', component: HomeComponent }
```

Matches the root path `/`.

### Dynamic Segments

```tsx
{ path: '/user/:id', component: UserComponent }
// Matches: /user/1, /user/abc, etc.
// data.params.id will contain the matched value
```

### Optional Segments

```tsx
{ path: '/page/:tab?', component: PageComponent }
// Matches: /page, /page/settings, etc.
```

### Catch-all

```tsx
{ path: '/:**', component: NotFoundComponent }
// Matches any unmatched path
```

### Nested Paths

Child paths are matched relative to their parent:

```tsx
{
  path: '/parent',
  component: ParentComponent,
  children: [
    { path: 'child', component: ChildComponent }  // Matches /parent/child
  ]
}
```

## Redirects

### Absolute Redirect

```tsx
{ path: '/old', redirect: '/new' }
```

### Relative Redirect

```tsx
{
  path: '/parent',
  component: ParentComponent,
  children: [
    { path: '/', redirect: 'child' }  // Redirects to /parent/child
  ]
}
```

### Path Traversal

```tsx
{ path: '/a/b', redirect: '../c' }  // Redirects to /a/c
```

## History Modes

### Browser History (default)

Uses HTML5 History API:

```tsx
<Router routes={routes} />
```

### Memory History

Useful for testing or server-side rendering:

```tsx
import { createMemoryHistory } from 'history'

const history = createMemoryHistory({ initialEntries: ['/'] })
<Router routes={routes} history={history} />
```

### Hash History

For environments without server configuration:

```tsx
// Use hash-based paths
const history = createMemoryHistory({ initialEntries: ['#/page'] })
<Router routes={routes} history={history} />
```

## Route Meta

Routes can include metadata for guards, permissions, etc:

```tsx
{
  path: '/admin',
  component: AdminComponent,
  meta: {
    requiresAuth: true,
    roles: ['admin'],
    title: 'Admin Panel'
  }
}
```

## Type Guards

```ts
import { isRedirectRoute, isPathRoute } from 'airx-router'

if (isRedirectRoute(route)) {
  // route.redirect is available
} else if (isPathRoute(route)) {
  // route.component and route.children are available
}
```

## Limitations

### Context Requirement

The Router must be used within an `airx` component context. It uses `provide`/`inject` for history distribution.

### Single Router Instance

Currently, only one Router instance per app is supported.

### No Built-in Guards

This library focuses on routing; authentication/authorization guards should be implemented at the component level or via a wrapper.

### Path Format

- Paths must start with `/` for root-relative matching
- Child paths should not start with `/` (they're relative to parent)
- Empty path `''` is treated as equivalent to `/`

### Signal Dependency

Requires `signal-polyfill` or native Signal support in the runtime environment.

## Testing

Run tests with:

```bash
npm test        # Watch mode
npm run test:run # Single run
npm run test:ui  # UI mode
```

## License

MIT
