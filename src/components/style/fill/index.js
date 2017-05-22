/**
 * @module components/style/fill
 */
import Fill from './style.vue'

export default {
  ...Fill,
  install (Vue) {
    Vue.component(Fill.name, Fill)
  }
}
