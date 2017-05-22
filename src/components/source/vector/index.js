/**
 * @module components/source/vector
 */
import Vector from './source.vue'

export default {
  ...Vector,
  install (Vue) {
    Vue.component(Vector.name, Vector)
  }
}
