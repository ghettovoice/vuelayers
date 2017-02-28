/**
 * VueLayers
 * Vue components to work with OpenLayers 3.
 *
 * @author Vladimir Vershinin <ghettovoice@gmail.com>
 * @license MIT
 * @copyright (c) 2017, Vladimir Vershinin <ghettovoice@gmail.com>
 */
import { omit } from 'lodash/fp'
import * as components from './components'

const flatComponents = {
  ...omit([ 'geom', 'layer', 'source' ], components),
  ...components.geom,
  ...components.layer,
  ...components.source
}

export default {
  VERSION: process.env.PKG_VERSION,
  ...flatComponents,
  install (Vue) {
    Object.keys(flatComponents)
      .forEach(name => Vue.use(flatComponents[ name ]))
  }
}
