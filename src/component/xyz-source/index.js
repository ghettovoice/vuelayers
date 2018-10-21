import { pick } from '../../util/minilo'
import Source from './source.vue'

/**
 * @alias module:xyz-source
 */
export default {
  /**
   * @alias module:xyz-source/source
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
