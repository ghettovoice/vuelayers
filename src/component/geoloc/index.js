import { pick } from '../../util/minilo'
import Geoloc from './geoloc.vue'

function plugin (Vue, options = {}) {
  if (plugin.installed) {
    return
  }
  plugin.installed = true

  options = pick(options, 'dataProjection')
  Object.assign(Geoloc, options)

  Vue.component(Geoloc.name, Geoloc)
}

export default plugin

export {
  plugin as install,
  Geoloc,
}
