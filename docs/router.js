import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: resolve => require(['./pages/index.md'], resolve),
  },
]

const router = new VueRouter({
  routes,
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
