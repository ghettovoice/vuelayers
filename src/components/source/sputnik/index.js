/**
 * @module components/source/sputnik
 */
import Sputnik from './source.vue'

export default {
  ...Sputnik,
  install (Vue) {
    Vue.component(Sputnik.name, Sputnik)
  }
}
