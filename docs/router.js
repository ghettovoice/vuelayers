/* global BASE_URL */
import Vue from 'vue'
import VueRouter from 'vue-router'
import routes, { flatRoutes } from './routes'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  base: BASE_URL,
  linkExactActiveClass: 'router-link-exact-active is-active',
  routes: flatRoutes(routes),
})
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || document.title

  const metaKeywords = document.head.querySelector('meta[name="keywords"]')
  metaKeywords.setAttribute('content', to.meta.keywords || metaKeywords.getAttribute('content'))

  const metaDescription = document.head.querySelector('meta[name="description"]')
  metaDescription.setAttribute('content', to.meta.description || metaDescription.getAttribute('content'))

  next()
})

export default router
