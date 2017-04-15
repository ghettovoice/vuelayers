/* global PKG_VERSION */
/**
 * VueLayers
 * Vue components to work with OpenLayers.
 *
 * @author Vladimir Vershinin <ghettovoice@gmail.com>
 * @license MIT
 * @copyright (c) 2017, Vladimir Vershinin <ghettovoice@gmail.com>
 */
import install from './install'
import * as components from './components'
import { warndbg } from './utils/debug'

export default {
  ...components,
  // todo remove later, old style exports
  ...mapToOldNames(components),
  // meta
  VERSION: PKG_VERSION,
  // install
  install
}

function mapToOldNames (components) {
  const regex = /(.*)(Geom|Interaction|Layer|Source|Style)$/

  return Object.keys(components).reduce((all, name) => {
    const matches = name.match(regex)

    if (matches && matches.length) {
      const oldName = matches[ 2 ] + matches[ 1 ]
      const component = Object.assign({}, components[ name ])
      const componentInstall = component.install

      component.install = function (Vue) {
        warndbg('Import by name "' + oldName + '" is deprecated and will be removed in next releases. ' +
                'Please use the new name "' + name + '"')

        return componentInstall(Vue)
      }

      all[ oldName ] = component
    }

    return all
  }, {})
}
