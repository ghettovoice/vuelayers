/**
 * @module components/source/wms
 */
import WMS from './source.vue'

export default {
  ...WMS,
  install (Vue) {
    Vue.component(WMS.name, WMS)
  }
}
