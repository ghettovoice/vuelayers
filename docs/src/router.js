import Vue from 'vue'
import VueRouter from 'vue-router'
import * as pages from './pages'

Vue.use(VueRouter)

export const routes = [ {
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

export default router
