/* global PKG_VERSION */
/**
 * VueLayers
 * Vue components to work with OpenLayers.
 *
 * @module vuelayers
 * @author Vladimir Vershinin <ghettovoice@gmail.com>
 * @license MIT
 * @copyright (c) 2017, Vladimir Vershinin <ghettovoice@gmail.com>
 */
import install from './install'
import * as components from './components'

const VueLayers = {
  // meta & consts
  VERSION: PKG_VERSION,
  // install
  install,
  ...components
}
export default VueLayers
// auto install for Browser env
/* istanbul ignore if */
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(VueLayers)
}
