import * as VueLayers from './index'
import * as olExt from './ol-ext'
import * as rxExt from './rx-ext'

export default { ...VueLayers, olExt, rxExt }

if (typeof window.Vue !== 'undefined') {
  window.Vue.use(VueLayers)
}
