/**
 * VueLayers map component
 * @module components/map
 */
import Map from './map.vue'

export default {
  ...Map,
  install (Vue) {
    Vue.component(Map.name, Map)
  }
}
