/**
 * @module components/style/circle
 */
import Circle from './style.vue'

export default {
  ...Circle,
  install (Vue) {
    Vue.component(Circle.name, Circle)
  }
}
