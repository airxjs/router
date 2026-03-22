/**
 * 重新导出 history 构造函数。
 *
 * @example
 * import { createMemoryHistory } from 'airx-router'
 *
 * const history = createMemoryHistory({ initialEntries: ['/'] })
 */
export { createBrowserHistory, createHashHistory, createMemoryHistory } from 'history'

/**
 * 路由核心 API。
 *
 * @example
 * import { Router, type Route } from 'airx-router'
 *
 * const routes: Route[] = [
 *   { path: '/', component: () => () => 'home' }
 * ]
 *
 * const App = () => () => <Router routes={routes} />
 */
export { Router, useRouter, Route, RouteComponentProps, RedirectRoute, PathRoute } from './router'
