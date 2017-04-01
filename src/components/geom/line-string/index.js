import LineString from './geom.vue'

LineString.install = function (Vue) {
  Vue.component(LineString.name, LineString)
}

export default LineString
