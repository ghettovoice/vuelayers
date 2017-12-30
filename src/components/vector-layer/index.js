/** @module vector-layer */
import Layer from './layer.vue'

/**
 * @alias module:vector-layer
 *
 * @example Install
 * import Vue from 'vue'
 * // import module and styles
 * import { VectorLayer } from 'vuelayers'
 * // or
 * import VectorLayer from 'vuelayers/lib/vector-layer'
 * // import VueLayers styles
 * import 'vuelayers/lib/style.css'
 * // register components
 * Vue.use(VectorLayer)
 */
export default {
  /**
   * Layer for data that is rendered client-side.
   * @alias module:vector-layer/layer
   */
  Layer,
  install (Vue) {
    Vue.component(Layer.name, Layer)
  },
}
