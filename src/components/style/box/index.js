/**
 * @module components/style/container
 */
import Box from './style.vue'

export default {
  ...Box,
  install (Vue) {
    Vue.component(Box.name, Box)
  }
}
