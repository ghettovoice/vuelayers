/**
 * @module components/source/wmts
 */
import Source from './source.vue'

export default {
  Source,
  install (Vue) {
    Vue.component(Source.name, Source)
  },
}
