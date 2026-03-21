# Router Architecture

## 1. Overview

`airx-router` is a front-end routing library for the `airx` framework. It matches URL paths against registered routes and renders the corresponding React-like component tree.

## 2. Module Structure

```
source/
├── index.ts      # Public exports
├── path.ts       # Path utilities (isAbsolute, joinPaths)
├── router.ts     # Core Router component and routing logic
└── signal.ts     # Signal polyfill wrapper (TC39 signals)
```

## 3. Core Components

### 3.1 Router Component (`source/router.ts`)

**Purpose**: Root component that manages routing state and rendering.

**Key responsibilities**:
- Register routes and create matchers via `path-to-regexp`
- Listen to `history` changes and update rendered element
- Provide router instance via Airx's `provide/inject`
- Handle nested routes and redirects

**Signal usage** (`source/router.ts#L50`):
```typescript
const currentElement = createState<AirxElement<RouteComponentProps> | null>(null)
```
- `currentElement` holds the current rendered element as a Signal state
- Updated via `currentElement.set(...)` when history changes
- Returned as the component's render output

### 3.2 Route Matching (`source/router.ts#L56-97`)

**`matchRoute(path)`**: Recursively matches a path against registered routes.

- Uses `path-to-regexp` to create `MatchFunction` per route
- Handles nested routes by recursively matching child routes
- Returns `RouteMatchResult` with full path, params, and children

**`isMatchToEnd` logic** (`source/router.ts#L68-70`):
- If a route has children, it matches greedily (`end: false`)
- Leaf routes match exactly (`end: true`)

### 3.3 Redirect Handling (`source/router.ts#L105-121`)

**`handleRedirect`**: Processes redirect routes before rendering.

- Resolves relative redirect paths via `joinPaths`
- Calls `history.push()` for redirects
- Recursively handles chained redirects

### 3.4 Element Creation (`source/router.ts#L123-142`)

**`createRouteElement`**: Builds the Airx element tree from match results.

- Recursively creates elements for nested routes
- Passes `MatchResult` as `data` prop to components
- Returns `null` for redirect routes (redirects don't render)

## 4. Signal Integration

### 4.1 Signal Dependency (`source/signal.ts`)

Router uses the TC39 signals proposal via `signal-polyfill`:

```typescript
// source/signal.ts - Lazy-loaded global Signal
const globalSignal = globalNS['Signal']
export function createState<T>(initial: T): Polyfill.State<T>
export function createWatch(notify: WatcherNotify): Polyfill.subtle.Watcher
```

### 4.2 State Flow

```
history.listen() → handleHistoryUpdate() → matchRoute()
  → handleRedirect() (if redirect)
  → createRouteElement() (if normal route)
  → currentElement.set(element) → re-render
```

### 4.3 Critical Interaction Points

| Interaction | Location | Risk |
|---|---|---|
| State creation | `source/router.ts#L50` | Signal instance must be globally unique |
| State update | `source/router.ts#L103` `source/router.ts#L143` | Set during history callback — synchronous |
| State read | Return value `source/router.ts#L146` | Consumer reads via signal |

## 5. API Boundaries

### 5.1 Public API (`source/index.ts`)

Expected exports:
- `Router` — root routing component
- `Route`, `PathRoute`, `RedirectRoute` — route type definitions
- `RouteComponentProps` — props passed to route components
- `useRouter` — hook to access history instance
- `isRedirectRoute`, `isPathRoute` — type guards

### 5.2 Provider Key

```typescript
const routerProviderKey = Symbol('router')  // source/router.ts#L9
```

Used with Airx's `provide(routerProviderKey, history)` to make history available via `useRouter()`.

## 6. Dependencies

| Dependency | Version | Purpose |
|---|---|---|
| `airx` | `^0.3.0-alpha.1` | Framework (peerDependency) |
| `history` | `^5.3.0` | Browser history management |
| `path-to-regexp` | `^6.2.1` | Path matching |
| `signal-polyfill` | `^0.1.1` | TC39 signals polyfill (devDependency) |

## 7. Build Output

| Output | Path |
|---|---|
| UMD | `output/umd/index.js` |
| ESM | `output/esm/index.js` |
| Types | `output/esm/index.d.ts` |

## 8. Design Constraints

1. **No internal state beyond Signals**: Router is stateless beyond `currentElement` signal
2. **Synchronous redirect handling**: Redirects call `history.push()` synchronously during history callback
3. **Global Signal singleton**: `signal.ts` enforces single Signal instance via global lookup
4. **Lazy matcher creation**: Matchers are created on first match and cached in `matcherMap`
