import { pick } from '../../utils'
import Layer from './layer.vue'

function plugin (Vue, options = {}) {
  if (plugin.installed) {
    return
  }
  plugin.installed = true

  options = pick(options, 'dataProjection')
  Object.assign(Layer, options)

  Vue.component(Layer.name, Layer)

  // todo remove in v0.13.x
  Vue.component('VlGraticule', {
    name: 'VlGraticule',
    extends: Layer,
    created () {
      if (process.env.NODE_ENV !== 'production') {
        this.$logger.warn('VlGraticule component is deprecated. Use VlLayerGraticule component instead.')
      }
    },
  })
}

export default plugin

export {
  plugin as install,
  Layer,
}
