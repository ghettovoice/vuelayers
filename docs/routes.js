export default [
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
    props: {
      title: 'Quick Start',
      subtitle: 'Installation and usage guide',
      color: 'is-primary',
    },
    component: () => import('./pages/start/page.vue'),
  },
  {
    path: '/demo',
    meta: {
      title: 'Live Demo',
    },
    props: {
      title: 'C_PKG_FULLNAME demo app',
      subtitle: 'An example app built with C_PKG_FULLNAME.js',
      color: 'is-primary',
    },
    component: () => import('./pages/demo.vue'),
  },
  // {
  //   path: '/packages',
  //   redirect: '/packages/map',
  // },
  // {
  //   path: '/packages/map',
  //   meta: {
  //     title: 'Map',
  //   },
  //   props: {
  //     title: 'Map',
  //     subtitle: 'The Core component of C_PKG_FULLNAME',
  //     color: 'is-info',
  //   },
  //   component: () => Promise.all([
  //     import('./pages/common.vue'),
  //     import('./md/packages/map.md'),
  //   ]).then(routerViewProxyFromArray),
  // },
  {
    path: '*',
    meta: {
      title: '404 Not Found',
    },
    props: {
      title: '404 Not Found',
      subtitle: 'There is nothing to do here',
      color: 'is-warning',
    },
    component: () => import('./pages/not-found.vue'),
  },
]
