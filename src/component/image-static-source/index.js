import { pick } from '../../util/minilo'
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
  /**
   * @param {Vue} Vue
   * @param {VueLayersOptions} [options]
   */
  install (Vue, options = {}) {
    options = pick(options, 'dataProjection')
    Object.assign(Source, options)

    Vue.component(Source.name, Source)
  },
}
