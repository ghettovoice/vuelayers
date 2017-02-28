/**
 * VueLayers map component
 */
import Map from './map.vue'

Map.install = function (Vue) {
  Vue.component(Map.name, Map)
}

export default Map
