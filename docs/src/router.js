import Vue from 'vue'
import VueRouter from 'vue-router'
import * as pages from './pages'

Vue.use(VueRouter)

const routes = [ {
  path: '/',
  component: pages.Home,
  meta: pages.Home.meta
}, {
  path: '*',
  name: 'not-found',
  component: pages.NotFound,
  meta: pages.NotFound.meta
} ]

const router = new VueRouter({
  mode: 'history',
  base: location.pathname,
  routes
})
router.beforeEach((to, from, next) => {
  next()
})
