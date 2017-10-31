import Vue from 'vue'
import VueRouter from 'vue-router'
import Velocity from 'velocity-animate'
import routes from './routes'

Vue.use(VueRouter)

const router = new VueRouter({
  base: location.pathname,
  routes: routes,
  scrollBehavior: (to, from, saved) => {
    if (saved) return saved
    else return { x: 0, y: 0 }
  },
})
router.beforeEach((to, from, next) => {
  document.title = [to.meta.title || document.title, 'VueLayers'].join(' :: ')

  const metaKeywords = document.head.querySelector('meta[name="keywords"]')
  metaKeywords.setAttribute('content', to.meta.keywords || metaKeywords.getAttribute('content'))

  const metaDescription = document.head.querySelector('meta[name="description"]')
  metaDescription.setAttribute('content', to.meta.description || metaDescription.getAttribute('content'))

  next()
})

router.afterEach((to, from) => {
  // first load exclude
  if (from.matched.length) {
    Velocity(document.body, 'scroll', {
      offset: 0,
      delay: 300,
      duration: 750,
      easing: 'easeOutCube',
    })
  }
})

export default router
