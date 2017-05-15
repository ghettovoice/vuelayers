/* global PKG_FULLNAME */
import { filter, identity, uniq } from 'lodash/fp'
import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './routes'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  base: '/vuelayers/',
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta) {
    updatePageMeta(to.meta)
  }

  next()
})

export default router

/**
 * @param {Object} meta
 */
function updatePageMeta (meta) {
  const doc = document

  const mainTitle = PKG_FULLNAME + '.js'

  doc.title = uniq(filter(identity, [ meta.title, mainTitle ])).join(' :: ')
  doc.querySelector('meta[name="keywords"]').setAttribute('content', meta.keywords || '')
  doc.querySelector('meta[name="description"]').setAttribute('content', meta.description || '')
}
