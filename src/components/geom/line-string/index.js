/**
 * @module components/geom/line-string
 */
import LineString from './geom.vue'

export default {
  ...LineString,
  install (Vue) {
    Vue.component(LineString.name, LineString)
  }
}
