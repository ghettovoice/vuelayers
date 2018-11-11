import { pick } from '../../util/minilo'
import Graticule from './graticule.vue'

function plugin (Vue, options = {}) {
  if (plugin.installed) {
    return
  }
  plugin.installed = true

  options = pick(options, 'dataProjection')
  Object.assign(Graticule, options)

  Vue.component(Graticule.name, Graticule)
}

export default plugin

export {
  Graticule,
  plugin as install,
}
