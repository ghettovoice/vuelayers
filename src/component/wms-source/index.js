import { pick } from '../../util/minilo'

/**
 * @module wms-source
 */
import Source from './source.vue'

/**
 * @alias module:wms-source
 */
export default {
  /**
   * @alias module:wms-source/source
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
