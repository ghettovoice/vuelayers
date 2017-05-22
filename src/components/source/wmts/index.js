/**
 * @module components/source/wmts
 */
import WMTS from './source.vue'

export default {
  ...WMTS,
  install (Vue) {
    Vue.component(WMTS.name, WMTS)
  }
}
