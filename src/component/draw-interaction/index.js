import { pick } from '../../util/minilo'
import Interaction from './interaction.vue'

function plugin (Vue, options = {}) {
  if (plugin.installed) {
    return
  }
  plugin.installed = true

  options = pick(options, 'dataProjection')
  Object.assign(Interaction, options)

  Vue.component(Interaction.name, Interaction)
}

export default plugin

export {
  Interaction,
  plugin as install,
}
