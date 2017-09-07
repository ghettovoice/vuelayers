export default [
  {
    path: '/',
    meta: {
      title: 'Home',
      desktopMenuGroup: 'General',
    },
    component: () => import('./components/home.vue'),
  },
  {
    path: '/demo',
    meta: {
      title: 'Demo',
      desktopMenuGroup: 'General',
    },
    component: () => import('./md/pages/demo.md'),
  },
  {
    path: '/components',
    meta: {
      title: 'Components',
      mobileMenuGroup: 'Components',
      mobileMenuIndex: true,
    },
    component: () => import('./md/pages/components/index.md'),
  },
  {
    path: '/components/vl-map',
    meta: {
      title: 'vl-map',
      mobileMenuGroup: 'Components',
    },
    component: () => import('./md/pages/components/vl-map.md'),
  },
  {
    path: '/components/vl-view',
    meta: {
      title: 'vl-view',
      mobileMenuGroup: 'Components',
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
