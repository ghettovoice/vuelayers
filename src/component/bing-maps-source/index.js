import { pick } from '../../util/minilo'
import BingmapsSource from '../bingmaps-source'

const Source = {
  ...BingmapsSource.Source,
  name: 'vl-source-bing-maps',
  created () {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[VueLayers] Component vl-source-bing-maps was deprecated and will be removed later. ' +
        'Please use the new vl-source-bingmaps component.'
      )
    }
  },
}

export default {
  Source,
  install (Vue, options = {}) {
    options = pick(options, 'dataProjection')
    Object.assign(Source, options)

    Vue.component(Source.name, Source)
  },
}
