import * as VueLayers from './index'
import * as mixins from './mixin'
import * as olExt from './ol-ext'
import * as rxExt from './rx-ext'
import * as util from './util'

export default {
  ...VueLayers,
  mixins,
  olExt,
  rxExt,
  util,
}

if (typeof window.Vue !== 'undefined') {
  window.Vue.use(VueLayers)
}
