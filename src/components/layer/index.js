import layer from './layer'
import layerTileBase from './tile-base'
import layerVectorBase from './vector-base'

export LayerVector from './vector'
export LayerTile from './tile'

export const mixins = {
  layer,
  layerTile: layerTileBase,
  layerVector: layerVectorBase
}
