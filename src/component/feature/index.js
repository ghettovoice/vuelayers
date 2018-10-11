import { pick } from '../../util/minilo'
import Feature from './feature.vue'

function plugin (Vue, options = {}) {
  if (plugin.installed) {
    return
  }
  plugin.installed = true

  options = pick(options, 'dataProjection')
  Object.assign(Feature, options)

  Vue.component(Feature.name, Feature)
}

export default plugin

export {
  Feature,
  plugin as install,
}
