import { pick } from '../../util/minilo'

/**
 * @module tile-layer
 */
import Layer from './layer.vue'

/**
 * @alias module:tile-layer
 *
 * @example Install
 * import Vue from 'vue'
 * // import module and styles
 * import { TileLayer } from 'vuelayers'
 * // or
 * import TileLayer from 'vuelayers/lib/tile-layer'
 * // import VueLayers styles
 * import 'vuelayers/lib/style.css'
 * // register components
 * Vue.use(TileLayer)
 */
export default {
  /**
   * Layer that provide pre-rendered, tiled images in grid that are organized by zoom levels for
   * specific resolutions.
   * @alias module:tile-layer/layer
   */
  Layer,
  /**
   * @param {Vue} Vue
   * @param {VueLayersOptions} [options]
   */
  install (Vue, options = {}) {
    options = pick(options, 'dataProjection')
    Object.assign(Layer, options)

    Vue.component(Layer.name, Layer)
  },
}
