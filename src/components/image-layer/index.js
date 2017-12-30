/** @module image-layer */
import Layer from './layer.vue'

/**
 * @alias module:image-layer
 *
 * @example Install
 * import Vue from 'vue'
 * // import module and styles
 * import { ImageLayer } from 'vuelayers'
 * // or
 * import ImageLayer from 'vuelayers/lib/image-layer'
 * // import VueLayers styles
 * import 'vuelayers/lib/style.css'
 * // register components
 * Vue.use(ImageLayer)
 */
export default {
  /**
   * Layer for server-rendered images that are available for arbitrary extents and resolutions.
   * @alias module:image-layer/layer
   */
  Layer,
  install (Vue) {
    Vue.component(Layer.name, Layer)
  },
}
