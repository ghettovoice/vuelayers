/* global PKG_VERSION, PKG_FULLNAME */
/**
 * VueLayers
 * Vue components to work with OpenLayers.
 *
 * @author Vladimir Vershinin <ghettovoice@gmail.com>
 * @license MIT
 * @copyright (c) 2017, Vladimir Vershinin <ghettovoice@gmail.com>
 */
import { omit, merge, forEach } from 'vl-utils/func'
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
  ...keys.reduce((all, key) => merge(all, components[ key ]), {})
}

export default {
  PKG_NAME: PKG_FULLNAME,
  VERSION: PKG_VERSION,
  ...flatComponents,
  install (Vue) {
    forEach((component, key) => {
      if (component.install) {
        Vue.use(component)
      }
    }, flatComponents)
  }
}
