import { pick } from '../../util/minilo'
import Geoloc from './geoloc.vue'

/**
 * @alias module:geoloc
 */
export default {
  /**
   * @alias module:geoloc/geoloc
   */
  Geoloc,
  /**
   * @param {Vue} Vue
   * @param {VueLayersOptions} [options]
   */
  install (Vue, options = {}) {
    options = pick(options, 'dataProjection')
    Object.assign(Geoloc, options)

    Vue.component(Geoloc.name, Geoloc)
  },
}
