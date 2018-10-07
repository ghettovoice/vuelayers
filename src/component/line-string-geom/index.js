import { pick } from '../../util/minilo'
/**
 * @module line-string-geom
 */
import Geom from './geom.vue'

/**
 * @alias module:line-string-geom
 */
export default {
  /**
   * @alias module:line-string-geom/geom
   */
  Geom,
  /**
   * @param {Vue} Vue
   * @param {VueLayersOptions} [options]
   */
  install (Vue, options = {}) {
    options = pick(options, 'dataProjection')
    Object.assign(Geom, options)

    Vue.component(Geom.name, Geom)
  },
}
