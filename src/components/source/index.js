import source from './source'
import sourceTileBase from './tile-base'
import sourceXyzBase from './xyz-base'
import sourceVectorBase from './vector-base'

export VlSourceXyz from './xyz'
export VlSourceOsm from './osm'
export VlSourceMapbox from './mapbox'
export VlSourceVector from './vector'

export const mixins = {
  source,
  sourceTileBase,
  sourceXyzBase,
  sourceVectorBase
}
