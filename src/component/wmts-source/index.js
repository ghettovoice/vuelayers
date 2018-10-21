import { pick } from '../../util/minilo'
import Source from './source.vue'

/**
 * @alias module:wmts-source
 */
export default {
  /**
   * @alias module:wmts-source/source
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
