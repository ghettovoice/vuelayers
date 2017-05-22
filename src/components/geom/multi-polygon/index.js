/**
 * @module components/geom/multi-polygon
 */
import MultiPolygon from './geom.vue'

export default {
  ...MultiPolygon,
  install (Vue) {
    Vue.component(MultiPolygon.name, MultiPolygon)
  }
}
