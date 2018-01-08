import * as components from './cmps'
import { VL_OPTIONS, projHelper, log } from './core'

/**
 * Registers all VueLayers components.
 * @param {Vue} Vue
 * @param {VueLayersOptions} [options]
 */
export default function install (Vue, options = {}) {
  if (install.installed) return
  install.installed = true

  if (options.bindToProj && !projHelper.get(options.bindToProj)) {
    log.warn('Projection "' + options.bindToProj + '" isn\'t added to the list of known projections. ' +
      'It should be added before VueLayers install with OpenLayers or VueLayers API.')
  }
  // extend Vue with VueLayers global methods and options
  Vue[VL_OPTIONS] = Vue.prototype[VL_OPTIONS] = options

  // install all components
  Object.keys(components)
    .forEach(key => {
      if (typeof components[key].install === 'function') {
        Vue.use(components[key])
      }
    })
}

/**
 * @typedef {Object} VueLayersOptions
 * @property {string} [bindToProj] Bind all props to the provided projection.
 */
