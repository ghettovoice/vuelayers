import LayerTile from './layer.vue'

LayerTile.install = function (Vue) {
  Vue.component(LayerTile.name, LayerTile)
}

export default LayerTile
