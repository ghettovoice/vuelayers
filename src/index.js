/**
 * VueLayers
 * Vue components to work with OpenLayers 3.
 *
 * @author Vladimir Vershinin <ghettovoice@gmail.com>
 * @license MIT
 * @copyright (c) 2017, Vladimir Vershinin <ghettovoice@gmail.com>
 */
import * as components from './components'

export default {
  ...components,
  install (Vue) {
    Object.keys(components)
      .forEach(name => Vue.use(components[ name ]))
  }
}
