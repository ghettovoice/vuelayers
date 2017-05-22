/**
 * @module components/layer/vector
 */
import Vector from './layer.vue'

export default {
  ...Vector,
  install (Vue) {
    Vue.component(Vector.name, Vector)
  }
}
