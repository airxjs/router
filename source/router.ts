import { regexpToFunction, pathToRegexp, MatchFunction, MatchResult, Key as PathKey } from 'path-to-regexp'
import { AirxComponent, AirxElement, createElement, createRef, inject, provide } from 'airx'
import { Action, Location, History, createBrowserHistory, createPath } from 'history'
import { isAbsolute, joinPaths } from './path'

const routerProviderKey = Symbol('router')

interface BaseRoute {
  path: string
  name?: string
  meta?: Record<string, unknown>
}

export interface RouteComponentProps {
  data: MatchResult
  children: AirxElement<RouteComponentProps>[]
}

export interface PathRoute extends BaseRoute {
  children?: Route[]
  component: AirxComponent<RouteComponentProps>
}

export interface RedirectRoute extends BaseRoute {
  redirect: string
}

export type Route = PathRoute | RedirectRoute

export function isRedirectRoute(route: Route): route is RedirectRoute {
  return 'redirect' in route && typeof route.redirect === 'string'
}

export function isPathRoute(route: Route): route is PathRoute {
  return !!(!isRedirectRoute(route) && route.component)
}

export function useRouter(): History {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return inject<History>(routerProviderKey)!
}

interface RouterProps {
  routes: Route[]
  history?: History
}

export function Router(props: RouterProps) {
  const matcherMap = new Map<Route, MatchFunction>()
  const history = props.history ?? createBrowserHistory()
  const currentElement = createRef<AirxElement<RouteComponentProps> | null>(null)

  interface RouteMatchResult {
    route: Route
    fullPath: string
    result: MatchResult
    children: RouteMatchResult[]
  }

  function matchRoute(path: string): RouteMatchResult | null {
    // 递归的匹配路由并返回匹配到的结果和路由信息
    function match(prefix = '', path: string, route: Route): RouteMatchResult | null {
      if (matcherMap.get(route) == null) {
        const keys: PathKey[] = []

        // 是否一直匹配到默认，比如 /a 比配 /a/ 开头的任意路径， 如果有子路由，则必然向后匹配
        const isMatchToEnd = isPathRoute(route) && (route.children?.length || 0) > 0

        // 如果只有 / 而且没有子路由则特殊匹配 / 和 ''
        if (route.path === '/' && !isMatchToEnd) {
          matcherMap.set(route, path => {
            if (path === '/' || path === '') {
              return {
                index: 0,
                path: path,
                params: {}
              }
            }
            return false
          })
        } else {
          const regexp = pathToRegexp(route.path, keys, { end: !isMatchToEnd })
          const matcher = regexpToFunction(regexp, keys)
          matcherMap.set(route, matcher)
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const matcher = matcherMap.get(route)!
      const matchResult = matcher(path)
      if (matchResult === false) return null

      const routeMatchResult: RouteMatchResult = {
        route,
        children: [],
        result: matchResult,
        fullPath: joinPaths(prefix, matchResult.path)
      }

      const nextPath = path.slice(matchResult.path.length)
      if ('children' in route && route.children != null) {

        // / 开头被认为是根路由
        // 子路由不允许以 / 开头
        const normalizedPath = nextPath.startsWith('/')
          ? nextPath.slice(1)
          : nextPath

        for (let index = 0; index < route.children.length; index++) {
          const childRoute = route.children[index]
          const childMatchResult = match(routeMatchResult.fullPath, normalizedPath, childRoute)
          if (childMatchResult != null) routeMatchResult.children.push(childMatchResult)
        }
      }

      return routeMatchResult
    }

    for (const route of props.routes) {
      const matchResult = match('', path, route)
      if (matchResult != null) return matchResult
    }

    return null
  }

  function handleHistoryUpdate(action: Action, location: Location) {
    const path = createPath(location)
    const matchResult = matchRoute(path)
    if (matchResult == null) return currentElement.value = null

    function handleRedirect(matchResult: RouteMatchResult) {
      if (isRedirectRoute(matchResult.route)) {
        let targetPath = matchResult.route.redirect
        if (!isAbsolute(matchResult.route.redirect)) {
          // 不是 / 开头被认为是相对路径，需要拼接当前的 fullPath 作为目标地址
          targetPath = joinPaths(matchResult.fullPath, matchResult.route.redirect)
        }

        history.push({ pathname: targetPath })
        return true
      }
      if (Array.isArray(matchResult.children) && matchResult.children.length > 0) {
        for (let index = 0; index < matchResult.children.length; index++) {
          const childMatchResult = matchResult.children[index]
          if (handleRedirect(childMatchResult)) return true
        }
      }

      return false
    }

    function createRouteElement(matchResult: RouteMatchResult): AirxElement<RouteComponentProps> | null {
      if (isPathRoute(matchResult.route)) {
        const children: AirxElement<RouteComponentProps>[] = []
        for (let index = 0; index < matchResult.children.length; index++) {
          const childMatchResult = matchResult.children[index]
          const childElement = createRouteElement(childMatchResult)
          if (childElement != null) children.push(childElement)
        }

        return createElement(
          matchResult.route.component,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          { data: matchResult.result } as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...children as any
        )
      }

      return null
    }

    const isRedirected = handleRedirect(matchResult)
    if (!isRedirected) currentElement.value = createRouteElement(matchResult)
  }

  history.listen(data => handleHistoryUpdate(data.action, data.location))
  handleHistoryUpdate(history.action, history.location)
  provide(routerProviderKey, history)
  return () => currentElement.value
}
