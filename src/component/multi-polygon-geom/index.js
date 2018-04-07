import { pick } from '../../util/minilo'

/**
 * @module multi-polygon-geom
 */
import Geom from './geom.vue'

/**
 * @alias module:multi-polygon-geom
 */
export default {
  /**
   * @alias module:multi-polygon-geom/geom
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
