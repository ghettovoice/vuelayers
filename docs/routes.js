import { spread } from 'lodash/fp'
import { routerViewProxy } from './utils'

const routerViewProxyFromArray = spread(({ default: PageCmp }, { default: ContentCmp }) => routerViewProxy(PageCmp, ContentCmp))

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
    component: () => Promise.all([
      import('./pages/common.vue'),
      import('./md/start.md'),
    ]).then(routerViewProxyFromArray),
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
  {
    path: '/components',
    redirect: '/components/vl-map',
  },
  {
    path: '/components/vl-map',
    meta: {
      title: 'vl-map',
    },
    props: {
      title: 'vl-map',
      subtitle: 'Map component',
      color: 'is-info',
    },
    component: () => Promise.all([
      import('./pages/common.vue'),
      import('./md/components/vl-map.md'),
    ]).then(routerViewProxyFromArray),
  },
  {
    path: '/components/vl-view',
    meta: {
      title: 'vl-view',
    },
    props: {
      title: 'vl-view',
      subtitle: 'Map view component',
      color: 'is-info',
    },
    component: () => Promise.all([
      import('./pages/common.vue'),
      import('./md/components/vl-view.md'),
    ]).then(routerViewProxyFromArray),
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
    component: () => Promise.all([
      import('./pages/common.vue'),
      import('./md/404.md'),
    ]).then(routerViewProxyFromArray),
  },
]
