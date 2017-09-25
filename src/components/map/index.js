/**
 * Map package
 * @module map
 */
import Map from './map.vue'
import View from './view.vue'

export default {
  /**
   * Map component `vl-map`.
   */
  Map,
  /**
   * Map view component `vl-view`.
   */
  View,
  /**
   * Registers Map and View components with default names.
   * @param {Vue} Vue
   * @return {void}
   */
  install (Vue) {
    Vue.component(Map.name, Map)
    Vue.component(View.name, View)
  },
}
