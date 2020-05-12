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

  // todo remove in v0.13.x
  Vue.component('VlSourceWms', {
    name: 'VlSourceWms',
    extends: Source,
    created () {
      if (process.env.NODE_ENV !== 'production') {
        this.$logger.warn('VlSourceWms component is deprecated. Use VlSourceTileWms component instead.')
      }
    },
  })
}

export default plugin

export {
  plugin as install,
  Source,
}
