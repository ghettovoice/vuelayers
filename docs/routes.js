export default [
  // general
  {
    path: '/',
    meta: {
      title: 'Home',
    },
    component: () => import('./pages/home.vue'),
  },
  {
    path: '/start',
    meta: {
      title: 'Quick Start',
    },
    component: () => import('./pages/start.vue'),
  },
  {
    path: '/demo',
    meta: {
      title: 'Live Demo',
    },
    component: () => import('./pages/demo.vue'),
  },
  // modules
  {
    path: '/modules',
    redirect: '/modules/map',
  },
  {
    path: '/modules/feature',
    meta: {
      title: 'Feature',
    },
    component: () => import('./pages/modules/feature.vue'),
  },
  {
    path: '/modules/map',
    meta: {
      title: 'Map',
    },
    component: () => import('./pages/modules/map.vue'),
  },
  {
    path: '/modules/tile-layer',
    meta: {
      title: 'Tile layer',
    },
    component: () => import('./pages/modules/tile-layer.vue'),
  },
  // {
  //   path: '/modules/vector-layer',
  //   meta: {
  //     title: 'Vector layer',
  //   },
  //   component: () => import('./pages/modules/vector-layer.vue'),
  // },
  // redirects
  // todo remove later
  {
    path: '/packages',
    redirect: '/modules/map',
  },
  {
    path: '/packages/map',
    redirect: '/modules/map',
  },
  // 404
  {
    path: '*',
    meta: {
      title: '404 Not Found',
    },
    component: () => import('./pages/not-found.vue'),
  },
]
