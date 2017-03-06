import source from './source'
import sourceTileBase from './tile-base'
import sourceXyzBase from './xyz-base'
import sourceVectorBase from './vector-base'

export SourceXyz from './xyz'
export SourceOsm from './osm'
export SourceMapbox from './mapbox'
export SourceVector from './vector'

export const mixins = {
  source,
  sourceTileBase,
  sourceXyzBase,
  sourceVectorBase
}
