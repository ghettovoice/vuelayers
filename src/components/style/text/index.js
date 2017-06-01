/**
 * @module components/style/text
 */
import Text from './style.vue'

export default {
  ...Text,
  install (Vue) {
    Vue.component(Text.name, Text)
  }
}
