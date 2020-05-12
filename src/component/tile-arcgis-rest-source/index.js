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

  Vue.component('VlSourceArcgisRest', {
    name: 'VlSourceArcgisRest',
    extends: Source,
    created () {
      if (process.env.NODE_ENV !== 'production') {
        this.$logger.warn('VlSourceArcgisRest component is deprecated. Use VlSourceTileArcgisRest component instead.')
      }
    },
  })
}

export default plugin

export {
  plugin as install,
  Source,
}
