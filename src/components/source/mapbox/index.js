import Mapbox from './source.vue'

Mapbox.install = function (Vue) {
  Vue.component(Mapbox.name, Mapbox)
}

export default Mapbox
