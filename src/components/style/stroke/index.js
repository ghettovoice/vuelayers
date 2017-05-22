/**
 * @module components/style/stroke
 */
import Stroke from './style.vue'

export default {
  ...Stroke,
  install (Vue) {
    Vue.component(Stroke.name, Stroke)
  }
}
