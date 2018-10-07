import { pick } from '../../util/minilo'
/**
 * @module sputnik-source
 */
import Source from './source.vue'

/**
 * @alias module:sputnik-source
 */
export default {
  /**
   * @alias module:sputnik-source/source
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
