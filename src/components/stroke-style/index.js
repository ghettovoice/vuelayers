/**
 * @module components/style/stroke
 */
import Style from './style.vue'

export default {
  Style,
  install (Vue) {
    Vue.component(Style.name, Style)
  },
}
