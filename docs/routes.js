export default [
  {
    path: '/',
    meta: {
      title: 'Home',
      group: 'General',
    },
    component: () => import('./components/home.vue'),
  },
  {
    path: '/demo',
    meta: {
      title: 'Demo',
      group: 'General',
    },
    component: () => import('./md/pages/demo.md'),
  },
  {
    path: '/components',
    meta: {
      title: 'Components',
    },
    component: () => import('./md/pages/components/index.md'),
  },
  {
    path: '/components/vl-map',
    meta: {
      title: 'vl-map',
      group: 'Components',
    },
    component: () => import('./md/pages/components/vl-map.md'),
  },
  {
    path: '/components/vl-view',
    meta: {
      title: 'vl-view',
      group: 'Components',
    },
    component: () => import('./md/pages/components/vl-view.md'),
  },
  {
    path: '*',
    meta: {
      title: '404 Not Found',
    },
    component: () => import('./md/pages/404.md'),
  },
]
