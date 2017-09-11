const routerViewProxy = (PageCmp, ContentCmp) => ({
  name: 'vld-router-view-proxy',
  functional: true,
  render (h, { props }) {
    return h(PageCmp, { props }, [h(ContentCmp, { props })])
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
      color: 'is-info',
    },
    component: () => Promise.all([
      import('./pages/common.vue'),
      import('./pages/components/index.md'),
    ]).then(([PageCmp, ContentCmp]) => routerViewProxy(PageCmp.default, ContentCmp.default)),
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
