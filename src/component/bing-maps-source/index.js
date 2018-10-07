import { pick } from '../../util/minilo'
/** @module bing-maps-source */
import Source from './source.vue'

/**
 * @alias module:bing-maps-source
 */
export default {
  /**
   * @alias module:bing-maps-source/source
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
