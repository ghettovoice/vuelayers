/**
 * VueLayers
 * Vue components to work with OpenLayers.
 *
 * @module vuelayers
 * @author Vladimir Vershinin <ghettovoice@gmail.com>
 * @license MIT
 * @copyright (c) 2017, Vladimir Vershinin <ghettovoice@gmail.com>
 */
import VueLayers from './index.cjs'

export default VueLayers
export const {
  install,
  mixins,
  // common
  Map,
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
  TileLayer,
  VectorLayer,
  // sources
  ClusterSource,
  MapboxSource,
  OsmSource,
  SputnikSource,
  VectorSource,
  WmsSource,
  WmtsSource,
  XyzSource,
  // style
  CircleStyle,
  FillStyle,
  IconStyle,
  RegShapeStyle,
  StrokeStyle,
  StyleBox,
  StyleContainer,
  StyleFunc
} = VueLayers
