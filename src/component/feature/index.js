/**
 * @module feature
 */
import Feature from './feature.vue'

/**
 * @alias module:feature
 *
 * @example Install
 * import Vue from 'vue'
 * // import module and styles
 * import { Feature } from 'vuelayers'
 * // or
 * import Feature from 'vuelayers/lib/feature'
 * // import VueLayers styles
 * import 'vuelayers/lib/style.css'
 * // register components
 * Vue.use(Feature)
 */
export default {
  /**
   * A vector object for geographic features with a geometry and other attribute properties,
   * similar to the features in vector file formats like **GeoJSON**.
   * @alias module:feature/feature
   */
  Feature,
  install (Vue) {
    Vue.component(Feature.name, Feature)
  },
}
