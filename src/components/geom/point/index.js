/**
 * @module components/geom/point
 */
import Point from './geom.vue'

export default {
  ...Point,
  install (Vue) {
    Vue.component(Point.name, Point)
  }
}
