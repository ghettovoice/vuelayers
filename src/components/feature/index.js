/**
 * @module components/feature
 */
import Feature from './feature.vue'

export default {
  Feature,
  install (Vue) {
    Vue.component(Feature.name, Feature)
  },
}
