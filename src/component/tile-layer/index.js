import { pick } from '../../util/minilo'
import Layer from './layer.vue'

function plugin (Vue, options = {}) {
  if (plugin.installed) {
    return
  }
  plugin.installed = true

  options = pick(options, 'dataProjection')
  Object.assign(Layer, options)

  Vue.component(Layer.name, Layer)
}

export default plugin

export {
  Layer,
  plugin as install,
}
