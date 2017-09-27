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
    component: () => import('./pages/start.vue'),
  },
  {
    path: '/demo',
    meta: {
      title: 'Live Demo',
    },
    props: {
      title: 'VueLayers demo app',
      subtitle: 'An example app built with VueLayers.js',
      color: 'is-primary',
    },
    component: () => import('./pages/demo.vue'),
  },
  {
    path: '/modules',
    redirect: '/modules/map',
  },
  // todo make through single component with 'moduleName' prop, load JSDoc by module name and render common doc template.
  {
    path: '/modules/map',
    meta: {
      title: 'Map',
    },
    props: {
      title: 'Map',
      subtitle: 'The core module of VueLayers',
      color: 'is-info',
    },
    component: () => import('./pages/modules/map.vue'),
  },
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
