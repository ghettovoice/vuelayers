/**
 * @module components/style/container
 */
import Style from './style.vue'

export default {
  Style,
  install (Vue) {
    Vue.component(Style.name, Style)
  }
}
