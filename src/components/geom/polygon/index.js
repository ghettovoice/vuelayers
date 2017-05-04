import Polygon from './geom.vue'

Polygon.install = function (Vue) {
  Vue.component(Polygon.name, Polygon)
}

export default Polygon
