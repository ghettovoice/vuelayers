import { pick } from '../../util/minilo'
import Geom from './geom.vue'

/**
 * @alias module:polygon-geom
 */
export default {
  /**
   * @alias module:polygon-geom/geom
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
