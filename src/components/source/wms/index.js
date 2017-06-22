/**
 * @module components/source/wms
 */
import Source from './source.vue'

export default {
  Source,
  install (Vue) {
    Vue.component(Source.name, Source)
  }
}
