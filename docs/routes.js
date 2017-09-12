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
    path: '/demo',
    meta: {
      title: 'Demo',
    },
    props: {
      title: 'C_PKG_FULLNAME demo app',
      subtitle: 'An example app with C_PKG_FULLNAME.js',
      color: 'is-primary',
    },
    component: () => import('./pages/demo.vue'),
  },
  {
    path: '/components',
    meta: {
      title: 'Components',
    },
    props: {
      title: 'Components index',
      subtitle: 'Learn how to build app with C_PKG_FULLNAME.js',
      color: 'is-light',
    },
    component: () => Promise.all([
      import('./pages/common.vue'),
      import('./md/components/index.md'),
    ]).then(routerViewProxyFromArray),
  },
  {
    path: '/components/vl-map',
    meta: {
      title: 'vl-map',
    },
    props: {
      title: 'vl-map',
      subtitle: 'Map component',
      color: 'is-light',
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
      color: 'is-light',
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
      title: '4040 Not Found',
      subtitle: 'There is nothing to do here',
      color: 'is-info',
    },
    component: () => Promise.all([
      import('./pages/common.vue'),
      import('./md/404.md'),
    ]).then(routerViewProxyFromArray),
  },
]
