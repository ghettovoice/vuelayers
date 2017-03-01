/* global PKG_VERSION */
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
  ...omit([ 'geom', 'layer', 'source', 'style' ], components),
  ...components.geom,
  ...components.layer,
  ...components.source,
  ...components.style
}

export default {
  VERSION: PKG_VERSION,
  ...flatComponents,
  install (Vue) {
    Object.keys(flatComponents)
      .forEach(name => Vue.use(flatComponents[ name ]))
  }
}
