/**
 * VueLayers
 * Vue components to work with OpenLayers.
 *
 * @author Vladimir Vershinin <ghettovoice@gmail.com>
 * @license MIT
 * @copyright (c) 2017, Vladimir Vershinin <ghettovoice@gmail.com>
 */
import VueLayers from './index.def'

const {
  // common
  Map,
  View,
  Feature,
  Geoloc,
  // geoms
  PointGeom,
  LineStringGeom,
  PolygonGeom,
  MultiPointGeom,
  MultiLineStringGeom,
  MultiPolygonGeom,
  // interactions
  SelectInteraction,
  // layers
  VectorLayer,
  TileLayer,
  // sources
  VectorSource,
  XyzSource,
  OsmSource,
  MapboxSource,
  WmsSource,
  WmtsSource,
  // style
  StyleContainer,
  FillStyle,
  StrokeStyle,
  CircleStyle,
  IconStyle,
  RegShapeStyle,
  StyleFunc,

  // todo remove later, old style exports
  // geoms
  GeomPoint,
  GeomLineString,
  GeomPolygon,
  GeomMultiPoint,
  GeomMultiLineString,
  GeomMultiPolygon,
  // interactions
  InteractionSelect,
  // layers
  LayerVector,
  LayerTile,
  // sources
  SourceVector,
  SourceXyz,
  SourceOsm,
  SourceMapbox,
  SourceWms,
  SourceWmts,
  // style
  StyleFill,
  StyleStroke,
  StyleCircle,
  StyleIcon,
  StyleRegShape
} = VueLayers

export default VueLayers

export {
  // common
  Map,
  View,
  Feature,
  Geoloc,
  // geoms
  PointGeom,
  LineStringGeom,
  PolygonGeom,
  MultiPointGeom,
  MultiLineStringGeom,
  MultiPolygonGeom,
  // interactions
  SelectInteraction,
  // layers
  VectorLayer,
  TileLayer,
  // sources
  VectorSource,
  XyzSource,
  OsmSource,
  MapboxSource,
  WmsSource,
  WmtsSource,
  // style
  StyleContainer,
  FillStyle,
  StrokeStyle,
  CircleStyle,
  IconStyle,
  RegShapeStyle,
  StyleFunc,

  // todo remove later, old style exports
  // geoms
  GeomPoint,
  GeomLineString,
  GeomPolygon,
  GeomMultiPoint,
  GeomMultiLineString,
  GeomMultiPolygon,
  // interactions
  InteractionSelect,
  // layers
  LayerVector,
  LayerTile,
  // sources
  SourceVector,
  SourceXyz,
  SourceOsm,
  SourceMapbox,
  SourceWms,
  SourceWmts,
  // style
  StyleFill,
  StyleStroke,
  StyleCircle,
  StyleIcon,
  StyleRegShape
}
