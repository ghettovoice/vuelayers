/**
 * @module components/geom/polygon
 */
import Polygon from './geom.vue'

export default {
  ...Polygon,
  install (Vue) {
    Vue.component(Polygon.name, Polygon)
  }
}
