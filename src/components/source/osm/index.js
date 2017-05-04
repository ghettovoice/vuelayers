import OSM from './source.vue'

OSM.install = function (Vue) {
  Vue.component(OSM.name, OSM)
}

export default OSM
