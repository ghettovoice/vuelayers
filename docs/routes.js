export function flatRoutes (routes) {
  return routes.reduce((all, route) => {
    all.push(route)

    if (route.routes) {
      all.push(...flatRoutes(route.routes))
    }

    return all
  }, [])
}

export default [
  {
    path: '/',
    meta: {
      title: 'Home',
      menu: true,
    },
    component: () => import('./pages/index.md'),
  },
  {
    path: '/components',
    meta: {
      title: 'Components',
      menu: true,
    },
    component: () => import('./pages/components/index.md'),
    routes: [
      {
        path: '/components/vl-map',
        meta: {
          title: 'vl-map',
          menu: true,
        },
        component: () => import('./pages/components/vl-map.md'),
      },
      {
        path: '/components/vl-view',
        meta: {
          title: 'vl-view',
          menu: true,
        },
        component: () => import('./pages/components/vl-view.md'),
      },
    ],
  },
  {
    path: '*',
    meta: {
      title: '404 Not Found',
    },
    component: () => import('./pages/404.md'),
  },
]
