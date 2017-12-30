/** @module image-static-source */
import Source from './source.vue'

/**
 * @alias module:image-static-source
 */
export default {
  /**
   * A layer source for displaying a single, static image.
   * @alias module:image-static-source/source
   */
  Source,
  install (Vue) {
    Vue.component(Source.name, Source)
  },
}
