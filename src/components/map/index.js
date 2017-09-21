/**
 * Map package
 * @module map
 */
import Map from './map.vue'
import View from './view.vue'

export default {
  /**
   * @memberOf module:map
   */
  Map,
  /**
   * @memberOf module:map
   */
  View,
  /**
   * Installs Map and View components.
   * @param {Vue} Vue
   * @return {void}
   * @memberOf module:map
   */
  install (Vue) {
    Vue.component(Map.name, Map)
    Vue.component(View.name, View)
  },
}
