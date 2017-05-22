/**
 * @module components/geom/multi-point
 */
import MultiPoint from './geom.vue'

export default {
  ...MultiPoint,
  install (Vue) {
    Vue.component(MultiPoint.name, MultiPoint)
  }
}
