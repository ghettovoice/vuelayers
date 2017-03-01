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

const keys = [
  'geom',
  'layer',
  'source',
  'style',
  'interaction'
]

const flatComponents = {
  ...omit(keys, components),
  ...keys.reduce((all, key) => ({ ...all, ...components[key] }), {})
}

export default {
  VERSION: PKG_VERSION,
  ...flatComponents,
  install (Vue) {
    Object.keys(flatComponents)
      .forEach(name => Vue.use(flatComponents[ name ]))
  }
}
