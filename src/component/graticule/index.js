import { pick } from '../../util/minilo'
import Graticule from './graticule.vue'

export default {
  Graticule,
  install (Vue, options = {}) {
    options = pick(options, 'dataProjection')
    Object.assign(Graticule, options)

    Vue.component(Graticule.name, Graticule)
  },
}
