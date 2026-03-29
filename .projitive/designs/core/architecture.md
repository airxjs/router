# Project Architecture

## Mission and Scope

**Mission**: `airx-router` is a lightweight, reactive front-end routing library for the `airx` component framework. It provides declarative route configuration, nested routing, path matching with parameters, redirects, and history management.

**Scope**:
- Route configuration and matching (path-to-regexp based)
- History management integration (browser, memory, hash modes)
- Nested/ hierarchical route rendering
- Redirect handling (absolute and relative)
- Route metadata propagation via props
- Global router access via `useRouter()` hook

**Out of Scope**:
- Server-side rendering (though memory history supports it)
- Authentication/authorization guards (handled at component level)
- Code splitting / lazy loading (delegate to airx build tools)
- Multiple router instances per app (current limitation)

---

## System Boundaries

### Inputs

| Input | Source | Description |
|-------|--------|-------------|
| `routes` prop | Developer | Route configuration array or single route |
| `history` prop | Developer (optional) | Custom history instance; defaults to `createBrowserHistory()` |
| History events | Browser / History lib | URL changes via `history.listen()` |
| Signal runtime | Environment | Native `Signal` or `signal-polyfill` |

### Outputs

| Output | Destination | Description |
|--------|-------------|-------------|
| Rendered route element | airx render tree | `AirxElement<RouteComponentProps>` or `null` |
| `useRouter()` hook | Any component in tree | Returns `History` instance for navigation |

### External Integrations

| Integration | Protocol | Role |
|-------------|----------|------|
| `airx` | peer dependency | Component framework; provide/inject context |
| `history@^5.3.0` | npm dependency | History API abstraction (browser/memory/hash) |
| `path-to-regexp@^6.2.1` | npm dependency | Path pattern compilation and matching |
| `signal-polyfill` | peer dependency | Reactive state (if native Signals unavailable) |

### Ownership Boundaries

- **airx-router owns**: Route matching logic, component rendering, history integration, route type definitions
- **airx owns**: Component lifecycle, rendering, provide/inject mechanism
- **Developer owns**: Route configuration, component implementation, navigation logic

---

## Modules and Responsibilities

### `source/index.ts` — Public API Surface

Re-exports all public symbols. Acts as the stable API boundary.

```
Exports: Router, useRouter, Route, RouteComponentProps,
         RedirectRoute, PathRoute, isRedirectRoute, isPathRoute,
         createBrowserHistory, createMemoryHistory, createHashHistory
```

### `source/router.ts` — Core Router Logic (~270 lines)

The heart of the library. Contains:

**Types & Guards**:
- `BaseRoute`, `PathRoute`, `RedirectRoute`, `Route` — Route configuration types
- `RouteComponentProps` — Props passed to route components
- `isRedirectRoute()`, `isPathRoute()` — Type guard functions

**Router Component** (`Router`):
- Receives `routes` and optional `history` as props
- Maintains a `matcherMap` cache: `Map<Route, MatchFunction>` for compiled path matchers
- `matchRoute()`: Recursive function that matches a path against the route tree, returns `RouteMatchResult`
- `handleHistoryUpdate()`: Called on every history change; handles redirects, computes matched routes, builds render tree
- `createRouteElement()`: Converts `RouteMatchResult` into `AirxElement<RouteComponentProps>` tree
- Provides `History` instance via `provide(routerProviderKey, history)`

**Path Utilities**:
- `isAbsolute(path)` — Checks if path starts with `/`
- `joinPaths(...paths)` — Joins path segments, normalizes slashes

### `source/signal.ts` — Reactive State Utilities (~80 lines)

Wraps global `Signal` constructor with version checking and lazy loading.

- `getSignal()` — Retrieves global `Signal`, enforces single-instance policy
- `createWatch(notify)` — Creates a `Watcher` for reactive notifications
- `createState<T>(initial)` — Creates a reactive `State<T>`
- `createComputed<T>(computation)` — Creates a computed value
- `isState<T>(target)` — Type guard for State instances

> **Note**: These utilities are currently exported from `router.ts` but are primarily internal. The public API surface is defined in `index.ts`.

### `source/path.ts` — Path Normalization Utilities

Referenced by `router.ts` for path manipulation (`isAbsolute`, `joinPaths`). Content not yet reviewed in detail.

### `source/router.test.ts` — Test Suite

Unit tests for route matching, redirects, nested routes, history modes.

---

## Key Flows

### Route Matching Flow

```
1. URL changes (history.push / browser navigation)
   ↓
2. history.listen() triggers handleHistoryUpdate(action, location)
   ↓
3. matchRoute(path) invoked
   ├── For each top-level route, call match(prefix='', path, route)
   ├── match() checks matcherMap cache
   │   ├── If not cached: pathToRegexp(route.path, keys) → regexpToFunction → stored
   │   └── If cached: use existing matcher
   ├── matcher(path) → MatchResult | false
   ├── If MatchResult:
   │   ├── If route has children: recurse into each child
   │   │   └── normalize nextPath (remove matched prefix)
   │   └── Return RouteMatchResult { route, result, children, fullPath }
   └── Return first non-null match or null
   ↓
4. handleRedirect(matchResult) — process any redirect routes
   ├── If redirect: resolve relative path, history.push(), stop
   └── If path route: check children for redirects recursively
   ↓
5. createRouteElement(matchResult) — build component tree
   ├── If PathRoute: createElement(route.component, { data }, ...childElements)
   └── If RedirectRoute: return null (already redirected)
   ↓
6. currentElement.set(element) — trigger reactive update
```

### History Management Flow

```
Router mounted
  ↓
props.history ?? createBrowserHistory()
  ↓
history.listen(data => handleHistoryUpdate(data.action, data.location))
  ↓
handleHistoryUpdate called with current location
  ↓
Router renders → useRouter() available in subtree
```

### Redirect Resolution Flow

```
Redirect route matched
  ↓
Get redirect target: route.redirect
  ↓
isAbsolute(target)?
  ├── YES: use as-is
  └── NO: joinPaths(currentFullPath, target) — relative resolution
  ↓
history.push({ pathname: targetPath })
  ↓
New history event triggers matchRoute() again
```

---

## Change Triggers

Update this document when any of the following occur:

1. **New external dependency** added or removed (e.g., switching path-to-regexp version)
2. **Breaking change** to public API surface (exports added/removed/signature changed)
3. **New routing mode** supported (e.g., hash routing implementation)
4. **Significant refactor** to matching algorithm or history integration
5. **New feature** that changes system boundaries (e.g., multi-router support)
6. **Scope change** — items moved in/out of scope
7. **Ownership change** — integration responsibilities shift

When updating, preserve section structure and add a "Changelog" entry at the bottom with date and summary of changes.
