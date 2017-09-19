/**
 * VueLayers
 * Vue components to work with OpenLayers.
 *
 * @module vuelayers
 * @author Vladimir Vershinin <ghettovoice@gmail.com>
 * @license MIT
 * @copyright (c) 2017, Vladimir Vershinin <ghettovoice@gmail.com>
 */

import * as components from './cmps'
import * as core from './core'
import install from './install'
// import lib style
import './styles/main.sass'

const VueLayers = {
  // meta & consts
  VERSION: 'C_PKG_VERSION',
  // install
  install,
  core,
  ...components,
}
export default VueLayers
