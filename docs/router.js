/* global ga */
import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './routes'

Vue.use(VueRouter)

const router = new VueRouter({
  base: 'C_BASE_URL',
  routes: routes,
  scrollBehavior: (to, from, saved) => {
    if (saved) return saved
    else return { x: 0, y: 0 }
  },
})
router.beforeEach((to, from, next) => {
  document.title = [to.meta.title || document.title, 'C_PKG_FULLNAME.js Docs'].join(' :: ')

  const metaKeywords = document.head.querySelector('meta[name="keywords"]')
  metaKeywords.setAttribute('content', to.meta.keywords || metaKeywords.getAttribute('content'))

  const metaDescription = document.head.querySelector('meta[name="description"]')
  metaDescription.setAttribute('content', to.meta.description || metaDescription.getAttribute('content'))

  next()
})
router.afterEach((to, from) => {
  if (window.ga != null) {
    ga('set', {
      page: to.path,
      title: to.meta.title,
    })
    ga('send', 'pageview')
  }
})

export default router
