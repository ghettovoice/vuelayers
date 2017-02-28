import MapView from '../map/view.vue'

MapView.install = function (Vue) {
  Vue.component(MapView.name, MapView)
}

export default MapView
