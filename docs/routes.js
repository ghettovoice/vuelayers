export default [
  {
    path: '/',
    meta: {
      title: 'Home',
      group: 'General',
    },
    component: () => import('./pages/index.md'),
  },
  {
    path: '/components',
    meta: {
      title: 'Components',
    },
    component: () => import('./pages/components/index.md'),
  },
  {
    path: '/components/vl-map',
    meta: {
      title: 'vl-map',
      group: 'Components',
    },
    component: () => import('./pages/components/vl-map.md'),
  },
  {
    path: '/components/vl-view',
    meta: {
      title: 'vl-view',
      group: 'Components',
    },
    component: () => import('./pages/components/vl-view.md'),
  },
  {
    path: '*',
    meta: {
      title: '404 Not Found',
    },
    component: () => import('./pages/404.md'),
  },
]
