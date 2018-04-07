import { pick } from '../../util/minilo'

/**
 * @module point-geom
 */
import Geom from './geom.vue'

/**
 * @alias module:point-geom
 */
export default {
  /**
   * @alias module:point-geom/geom
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
