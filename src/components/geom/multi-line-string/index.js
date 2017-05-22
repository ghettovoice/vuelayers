/**
 * @module components/geom/multi-line-string
 */
import MultiLineString from './geom.vue'

export default {
  ...MultiLineString,
  install (Vue) {
    Vue.component(MultiLineString.name, MultiLineString)
  }
}
