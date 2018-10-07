import { pick } from '../../util/minilo'
/**
 * @module multi-point-geom
 */
import Geom from './geom.vue'

/**
 * @alias module:multi-point-geom
 */
export default {
  /**
   * @alias module:multi-point-geom/geom
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
