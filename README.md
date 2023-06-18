# router [![npm](https://img.shields.io/npm/v/airx-router.svg)](https://www.npmjs.com/package/airx-router) [![build status](https://github.com/airxjs/router/actions/workflows/check.yml/badge.svg?branch=main)](https://github.com/airxjs/router/actions/workflows/check.yml)

Front-end routing for airx

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
