import MultiPolygon from './geom.vue'

MultiPolygon.install = function (Vue) {
  Vue.component(MultiPolygon.name, MultiPolygon)
}

export default MultiPolygon
