import { pick } from '../../util/minilo'
import Source from './source'

export default {
  Source,
  install (Vue, options = {}) {
    options = pick(options, 'dataProjection')
    Object.assign(Source, options)

    Vue.component(Source.name, Source)
  },
}
