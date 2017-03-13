import source from './source'
import sourceVectorBase from './vector-base'
import sourceTileBase from './tile-base'
import sourceXyzBase from './xyz-base'
import sourceWmsBase from './wms-base'

export SourceVector from './vector'
export SourceXyz from './xyz'
export SourceOsm from './osm'
export SourceMapbox from './mapbox'
export SourceWms from './wms'

export const mixins = {
  source,
  sourceVectorBase,
  sourceTileBase,
  sourceXyzBase,
  sourceWmsBase
}
