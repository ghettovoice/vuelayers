/**
 * Entry file for non-ES environments.
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
