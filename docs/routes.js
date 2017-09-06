import Vue from 'vue'

function wrapCmpRender (cmp) {
  const cmp_ = cmp.default ? cmp.default : cmp
  const options = cmp_._Ctor[Vue.cid].options
  const render = options.render
  options.render = function (h) {
    return h('div', { class: 'section' }, [this::render(h)])
  }

  return cmp
}

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
    component: () => import('./pages/demo.md').then(wrapCmpRender),
  },
  {
    path: '/components',
    meta: {
      title: 'Components',
    },
    component: () => import('./pages/components/index.md').then(wrapCmpRender),
  },
  {
    path: '/components/vl-map',
    meta: {
      title: 'vl-map',
      group: 'Components',
    },
    component: () => import('./pages/components/vl-map.md').then(wrapCmpRender),
  },
  {
    path: '/components/vl-view',
    meta: {
      title: 'vl-view',
      group: 'Components',
    },
    component: () => import('./pages/components/vl-view.md').then(wrapCmpRender),
  },
  {
    path: '*',
    meta: {
      title: '404 Not Found',
    },
    component: () => import('./pages/404.md').then(wrapCmpRender),
  },
]
