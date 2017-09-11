import Page from './pages/page.vue'

const routerViewProxy = contentCmp => ({
  render (h) {
    return h(Page, {}, [contentCmp])
  },
})

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
    component: () => import('./pages/demo.vue'),
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
    },
    component: () => import('./pages/components/vl-map.md'),
  },
  {
    path: '/components/vl-view',
    meta: {
      title: 'vl-view',
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
