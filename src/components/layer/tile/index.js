/**
 * @module components/layer/tile
 */
import Tile from './layer.vue'

export default {
  ...Tile,
  install (Vue) {
    Vue.component(Tile.name, Tile)
  }
}
