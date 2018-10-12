import { pick } from '../../util/minilo'
import Source from './source.vue'

function plugin (Vue, options = {}) {
  if (plugin.installed) {
    return
  }
  plugin.installed = true

  options = pick(options, 'dataProjection')
  Object.assign(Source, options)

  Vue.component(Source.name, Source)
}

export default plugin

export {
  Source,
  plugin as install,
}
