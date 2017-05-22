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

export default {
  // meta & consts
  VERSION: PKG_VERSION,
  // install
  install,
  ...components
}
