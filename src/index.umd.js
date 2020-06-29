import * as VueLayers from './index'
import * as mixins from './mixins'
import * as olExt from './ol-ext'
import * as rxExt from './rx-ext'
import * as utils from './utils'

export default {
  ...VueLayers,
  mixins,
  olExt,
  rxExt,
  utils,
}

if (typeof window.Vue !== 'undefined') {
  window.Vue.use(VueLayers)
}
