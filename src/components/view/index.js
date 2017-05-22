/**
 * @module components/view
 */
import View from './view.vue'

export default {
  ...View,
  install (Vue) {
    Vue.component(View.name, View)
  }
}
