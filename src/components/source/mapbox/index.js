/**
 * @module components/source/mapbox
 */
import Mapbox from './source.vue'

export default {
  ...Mapbox,
  install (Vue) {
    Vue.component(Mapbox.name, Mapbox)
  }
}
