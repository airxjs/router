# Router Style Guide

## 1. TypeScript

### 1.1 Strict Mode

TypeScript strict mode is enabled (`tsconfig.json`). Avoid `any` casts except where marked with eslint-disable.

### 1.2 Naming Conventions

| Kind | Convention | Example |
|---|---|---|
| Interfaces | PascalCase, no `I` prefix | `RouteComponentProps` |
| Types | PascalCase | `RouteMatchResult` |
| Functions | camelCase | `matchRoute`, `createRouteElement` |
| Constants | camelCase | `routerProviderKey` |
| Files | kebab-case | `router.ts`, `path.ts` |

### 1.3 eslint-disable Policy

Use `eslint-disable-next-line @typescript-eslint/no-explicit-any` only for:
- `createElement` props spreading (`source/router.ts`)
- JSX interop type casts

Do NOT use blanket `eslint-disable` at file level.

## 2. Code Style

### 2.1 Braces

Use 1TBS style (opening brace on same line). Always use braces for control structures.

### 2.2 Semicolons

Required.

### 2.3 Indentation

2 spaces.

### 2.4 Quotes

Use single quotes for strings.

### 2.5 Trailing Commas

Trailing commas for multiline array/object literals.

## 3. Component Design

### 3.1 Router Component

The `Router` component:
- Returns a render function `() => currentElement.get()` (signal-driven)
- Does NOT call `createElement` for itself — it manages `currentElement` state
- Provides history via `provide(routerProviderKey, history)`

### 3.2 Route Components

Route components receive:
```typescript
interface RouteComponentProps {
  data: MatchResult      // path match params and info
  children: AirxElement[] // matched child routes
}
```

## 4. Signal Usage

### 4.1 State Management

- `createState` for mutable reactive state (`currentElement`)
- `createComputed` is available but not currently used
- `createWatch` is available for side-effect monitoring

### 4.2 Global Signal Policy

`source/signal.ts` enforces a single global Signal instance:
- Lazy initialization via `getSignal()`
- Throws if multiple Signal instances detected
- Do NOT create local Signal instances in router logic

### 4.3 Signal Access

```typescript
// Reading
currentElement.get()

// Writing
currentElement.set(newValue)
```

## 5. Testing Principles

Tests should cover:
- Route matching (exact path, nested, params)
- Redirect behavior (absolute, relative, chained)
- History mode switching (browser, hash — if supported)
- `useRouter()` injection
- Signal-driven re-render on history change

## 6. File Organization

```
designs/
├── core/
│   ├── architecture.md    # Module structure and design decisions
│   └── style-guide.md      # This file
├── integration-guide.md    # Router + airx integration
├── research/               # Task-specific research briefs
└── templates/              # Governance templates
```

## 7. Commit Style

Follow conventional commits:

```
feat: add nested route support
fix: correct relative redirect path resolution
docs: update README with new example
chore: add build to CI
refactor: extract path utilities
```

Task references in footer: `Refs: TASK-XXXX, ROADMAP-XXXX`
