import { pick } from '../../util/minilo'
import Geom from './geom.vue'

function plugin (Vue, options = {}) {
  if (plugin.installed) {
    return
  }
  plugin.installed = true

  options = pick(options, 'dataProjection')
  Object.assign(Geom, options)

  Vue.component(Geom.name, Geom)
}

export default plugin

export {
  Geom,
  plugin as install,
}
