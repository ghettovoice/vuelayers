/**
 * @module components/geom/line-string
 */
import Geom from './geom.vue'

export default {
  Geom,
  install (Vue) {
    Vue.component(Geom.name, Geom)
  },
}
