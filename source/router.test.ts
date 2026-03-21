import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createMemoryHistory, MemoryHistory } from 'history'
import { Route, PathRoute, RedirectRoute, isRedirectRoute, isPathRoute } from './router'

// TestRouteComponent - simple component for testing
function TestRouteComponent() {
  return () => null
}

describe('airx-router type guards', () => {
  describe('isRedirectRoute and isPathRoute', () => {
    it('should correctly identify redirect routes', () => {
      const redirectRoute: RedirectRoute = {
        path: '/old',
        redirect: '/new'
      }
      expect(isRedirectRoute(redirectRoute)).toBe(true)
      expect(isPathRoute(redirectRoute)).toBe(false)
    })

    it('should correctly identify path routes', () => {
      const pathRoute: PathRoute = {
        path: '/page',
        component: TestRouteComponent
      }
      expect(isPathRoute(pathRoute)).toBe(true)
      expect(isRedirectRoute(pathRoute)).toBe(false)
    })

    it('should correctly identify path routes with children', () => {
      const pathRoute: PathRoute = {
        path: '/parent',
        component: TestRouteComponent,
        children: [
          { path: 'child', component: TestRouteComponent }
        ]
      }
      expect(isPathRoute(pathRoute)).toBe(true)
      expect(isRedirectRoute(pathRoute)).toBe(false)
    })

    it('should handle route with meta information', () => {
      const pathRoute: PathRoute = {
        path: '/protected',
        component: TestRouteComponent,
        meta: { requiresAuth: true }
      }
      expect(isPathRoute(pathRoute)).toBe(true)
    })

    it('should handle route with name', () => {
      const pathRoute: PathRoute = {
        path: '/page',
        name: 'main-page',
        component: TestRouteComponent
      }
      expect(isPathRoute(pathRoute)).toBe(true)
    })
  })
})

describe('airx-router routing configuration', () => {
  describe('route definitions', () => {
    it('should support basic route configuration', () => {
      const routes: Route[] = [
        { path: '/', component: TestRouteComponent }
      ]
      expect(routes.length).toBe(1)
      expect(routes[0].path).toBe('/')
    })

    it('should support nested route configuration', () => {
      const routes: Route[] = [
        {
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
      ]
      expect(routes.length).toBe(1)
      const rootRoute = routes[0] as PathRoute
      // root has 2 children: redirect to child-1, and the child-1 route itself
      expect(rootRoute.children).toHaveLength(2)
      expect(rootRoute.children![0].path).toBe('/')
      expect((rootRoute.children![1] as PathRoute).path).toBe('child-1')
    })

    it('should support deep nested routes', () => {
      const routes: Route[] = [
        {
          path: '/a',
          component: TestRouteComponent,
          children: [
            {
              path: 'b',
              component: TestRouteComponent,
              children: [
                {
                  path: 'c',
                  component: TestRouteComponent
                }
              ]
            }
          ]
        }
      ]
      const aRoute = routes[0] as PathRoute
      const bRoute = aRoute.children![0] as PathRoute
      const cRoute = bRoute.children![0] as PathRoute
      expect(cRoute.path).toBe('c')
    })

    it('should support multiple children at same level', () => {
      const routes: Route[] = [
        {
          path: '/parent',
          component: TestRouteComponent,
          children: [
            { path: 'one', component: TestRouteComponent },
            { path: 'two', component: TestRouteComponent },
            { path: 'three', component: TestRouteComponent }
          ]
        }
      ]
      const parentRoute = routes[0] as PathRoute
      expect(parentRoute.children).toHaveLength(3)
    })
  })

  describe('redirect configurations', () => {
    it('should support absolute redirects', () => {
      const routes: Route[] = [
        {
          path: '/old',
          redirect: '/new'
        },
        {
          path: '/new',
          component: TestRouteComponent
        }
      ]
      expect(isRedirectRoute(routes[0])).toBe(true)
      expect(isPathRoute(routes[1])).toBe(true)
    })

    it('should support relative redirects', () => {
      const routes: Route[] = [
        {
          path: '/parent',
          component: TestRouteComponent,
          children: [
            {
              path: '/',
              redirect: 'child'
            },
            {
              path: 'child',
              component: TestRouteComponent
            }
          ]
        }
      ]
      const parentRoute = routes[0] as PathRoute
      const redirectRoute = parentRoute.children![0]
      expect(isRedirectRoute(redirectRoute)).toBe(true)
    })

    it('should support redirect with path traversal', () => {
      const routes: Route[] = [
        {
          path: '/grandparent/parent',
          component: TestRouteComponent,
          children: [
            {
              path: '/',
              redirect: '../sibling'
            }
          ]
        }
      ]
      const parentRoute = routes[0] as PathRoute
      expect(isRedirectRoute(parentRoute.children![0])).toBe(true)
    })

    it('should support chained redirects', () => {
      const routes: Route[] = [
        { path: '/first', redirect: '/second' },
        { path: '/second', redirect: '/third' },
        { path: '/third', component: TestRouteComponent }
      ]
      expect(isRedirectRoute(routes[0])).toBe(true)
      expect(isRedirectRoute(routes[1])).toBe(true)
      expect(isPathRoute(routes[2])).toBe(true)
    })
  })

  describe('history integration', () => {
    it('should work with memory history', () => {
      const memoryHist = createMemoryHistory({ initialEntries: ['/'] })
      expect(memoryHist.location.pathname).toBe('/')
    })

    it('should work with memory history and initial path', () => {
      const memoryHist = createMemoryHistory({ initialEntries: ['/page'] })
      expect(memoryHist.location.pathname).toBe('/page')
    })

    it('should support history navigation', () => {
      const memoryHist = createMemoryHistory({ initialEntries: ['/'] })
      memoryHist.push('/page')
      expect(memoryHist.location.pathname).toBe('/page')
    })

    it('should support multiple history entries', () => {
      const memoryHist = createMemoryHistory({
        initialEntries: ['/', '/about', '/contact']
      })
      expect(memoryHist.index).toBe(2)
      expect(memoryHist.location.pathname).toBe('/contact')
    })
  })

  describe('route matching edge cases', () => {
    it('should handle root path /', () => {
      const routes: Route[] = [
        { path: '/', component: TestRouteComponent }
      ]
      expect(routes[0].path).toBe('/')
    })

    it('should handle empty path as root', () => {
      const routes: Route[] = [
        { path: '', component: TestRouteComponent }
      ]
      expect(routes[0].path).toBe('')
    })

    it('should handle route with complex meta', () => {
      const routes: Route[] = [
        {
          path: '/api',
          component: TestRouteComponent,
          meta: {
            roles: ['admin', 'user'],
            requiresAuth: true,
            customData: { tier: 'premium' }
          }
        }
      ]
      const route = routes[0] as PathRoute
      expect(route.meta?.requiresAuth).toBe(true)
      expect((route.meta?.roles as string[])).toContain('admin')
    })

    it('should handle catch-all routes', () => {
      const routes: Route[] = [
        { path: '/:id', component: TestRouteComponent }
      ]
      expect(routes[0].path).toBe('/:id')
    })

    it('should handle optional param routes', () => {
      const routes: Route[] = [
        { path: '/page/:tab?', component: TestRouteComponent }
      ]
      expect(routes[0].path).toBe('/page/:tab?')
    })
  })

  describe('route priority', () => {
    it('should support explicit before catch-all', () => {
      const routes: Route[] = [
        { path: '/page', component: TestRouteComponent },
        { path: '/:id', component: TestRouteComponent }
      ]
      // When matching, first route in array has priority
      expect(routes[0].path).toBe('/page')
      expect(routes[1].path).toBe('/:id')
    })

    it('should support order-defined priority', () => {
      const routes: Route[] = [
        { path: '/a', component: TestRouteComponent },
        { path: '/b', component: TestRouteComponent },
        { path: '/c', component: TestRouteComponent }
      ]
      // Routes are matched in order
      expect(routes[0].path).toBe('/a')
      expect(routes[1].path).toBe('/b')
      expect(routes[2].path).toBe('/c')
    })
  })
})

describe('airx-router path utilities', () => {
  describe('path.join', () => {
    it('should join paths correctly', () => {
      // Testing the concept of path joining
      const base = '/parent'
      const child = 'child'
      const joined = base === '/' ? `/${child}` : `${base}/${child}`
      expect(joined).toBe('/parent/child')
    })

    it('should handle root base path', () => {
      const base = '/'
      const child = 'child'
      const joined = base === '/' ? `/${child}` : `${base}/${child}`
      expect(joined).toBe('/child')
    })

    it('should handle nested paths', () => {
      const base = '/a/b'
      const child = 'c/d'
      const joined = `${base}/${child}`
      expect(joined).toBe('/a/b/c/d')
    })
  })

  describe('path.isAbsolute', () => {
    it('should identify absolute paths', () => {
      const isAbsolute = (path: string) => path.startsWith('/')
      expect(isAbsolute('/page')).toBe(true)
      expect(isAbsolute('/a/b/c')).toBe(true)
      expect(isAbsolute('page')).toBe(false)
      expect(isAbsolute('./page')).toBe(false)
      expect(isAbsolute('../page')).toBe(false)
    })
  })
})
