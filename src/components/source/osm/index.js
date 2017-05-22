/**
 * @module components/source/osm
 */
import OSM from './source.vue'

export default {
  ...OSM,
  install (Vue) {
    Vue.component(OSM.name, OSM)
  }
}
