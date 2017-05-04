import MultiLineString from './geom.vue'

MultiLineString.install = function (Vue) {
  Vue.component(MultiLineString.name, MultiLineString)
}

export default MultiLineString
