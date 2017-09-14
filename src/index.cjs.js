/**
 * VueLayers
 * Vue components to work with OpenLayers.
 *
 * @module vuelayers
 * @author Vladimir Vershinin <ghettovoice@gmail.com>
 * @license MIT
 * @copyright (c) 2017, Vladimir Vershinin <ghettovoice@gmail.com>
 */

import * as components from './components'
import * as core from './core'
import install from './install'

const VueLayers = {
  // meta & consts
  VERSION: 'C_PKG_VERSION',
  // install
  install,
  ...core,
  ...components,
}
export default VueLayers
// auto install for Browser env
/* istanbul ignore if */
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(VueLayers)
}
