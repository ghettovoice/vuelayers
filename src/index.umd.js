import * as VueLayers from './index'

export default VueLayers

if (typeof window.Vue !== 'undefined') {
  window.Vue.use(VueLayers)
}
