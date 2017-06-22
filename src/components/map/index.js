/**
 * VueLayers map component
 * @module components/map
 */
import Map from './map.vue'
import View from './view.vue'

export default {
  Map,
  View,
  install (Vue) {
    Vue.component(Map.name, Map)
    Vue.component(View.name, View)
  }
}
