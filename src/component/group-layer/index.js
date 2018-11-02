import { pick } from '../../util/minilo'
import Layer from './layer.vue'

export default {
  Layer,
  install (Vue, options = {}) {
    options = pick(options, 'dataProjection')
    Object.assign(Layer, options)

    Vue.component(Layer.name, Layer)
  },
}
