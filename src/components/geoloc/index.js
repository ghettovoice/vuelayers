import Geoloc from './geoloc.vue'

Geoloc.install = function (Vue) {
  Vue.component(Geoloc.name, Geoloc)
}

export default Geoloc
