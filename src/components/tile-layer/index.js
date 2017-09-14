/**
 * @module components/layer/tile
 */
import Layer from './layer.vue'

export default {
  Layer,
  install (Vue) {
    Vue.component(Layer.name, Layer)
  },
}
