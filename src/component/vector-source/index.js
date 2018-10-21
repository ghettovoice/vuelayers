import { pick } from '../../util/minilo'
import Source from './source.vue'

/**
 * @alias module:vector-source
 */
export default {
  /**
   * @alias module:vector-source/source
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
