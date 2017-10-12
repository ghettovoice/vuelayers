/* eslint-disable import/no-webpack-loader-syntax */
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
  // modules
  {
    path: '/modules',
    redirect: '/modules/map',
  },
  {
    path: '/modules/map',
    meta: {
      title: 'Map',
    },
    props: {
      title: 'Map',
      subtitle: 'Start point of every VueLayers based application',
      color: 'is-info',
      docs: [
        () => import('!vue-jsdoc-loader?tpl=./docs/jsdoc/module.ejs&helper=./docs/jsdoc/helper.js!../src/components/map/index'),
        () => import('!vue-jsdoc-loader?tpl=./docs/jsdoc/cmp.ejs&helper=./docs/jsdoc/helper.js!../src/components/map/map.vue'),
        () => import('!vue-jsdoc-loader?tpl=./docs/jsdoc/cmp.ejs&helper=./docs/jsdoc/helper.js!../src/components/map/view.vue'),
      ],
    },
    component: () => import('./pages/doc.vue'),
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
