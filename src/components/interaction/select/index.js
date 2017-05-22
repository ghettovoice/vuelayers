/**
 * @module components/interaction/select
 */
import Select from './interaction.vue'

export default {
  ...Select,
  install (Vue) {
    Vue.component(Select.name, Select)
  }
}
