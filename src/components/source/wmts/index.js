import WMTS from './source.vue'

WMTS.install = function (Vue) {
  Vue.component(WMTS.name, WMTS)
}

export default WMTS
