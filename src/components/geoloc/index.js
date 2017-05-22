/**
 * @module components/geoloc
 */
import Geoloc from './geoloc.vue'

export default {
  ...Geoloc,
  install (Vue) {
    Vue.component(Geoloc.name, Geoloc)
  }
}
