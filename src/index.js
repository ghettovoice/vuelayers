/**
 * This file is a part of vuelayers package.
 * @package vuelayers
 * @author Vladimir Vershinin
 * @license MIT
 */
/* eslint-disable indent */
import basicInstall from './install'
import CircleStyle from './component/circle-style'
import ClusterSource from './component/cluster-source'
import DrawInteraction from './component/draw-interaction'
import Feature from './component/feature'
import FillStyle from './component/fill-style'
import Geoloc from './component/geoloc'
import IconStyle from './component/icon-style'
import ImageLayer from './component/image-layer'
import ImageStaticSource from './component/image-static-source'
import LineStringGeom from './component/line-string-geom'
import Map from './component/map'
import MapboxSource from './component/mapbox-source'
import MultiLineStringGeom from './component/multi-line-string-geom'
import MultiPointGeom from './component/multi-point-geom'
import MultiPolygonGeom from './component/multi-polygon-geom'
import OsmSource from './component/osm-source'
import Overlay from './component/overlay'
import PointGeom from './component/point-geom'
import PolygonGeom from './component/polygon-geom'
import RegShapeStyle from './component/reg-shape-style'
import SelectInteraction from './component/select-interaction'
import SputnikSource from './component/sputnik-source'
import StrokeStyle from './component/stroke-style'
import StyleBox from './component/style-box'
import StyleFunc from './component/style-func'
import TextStyle from './component/text-style'
import TileLayer from './component/tile-layer'
import VectorLayer from './component/vector-layer'
import VectorSource from './component/vector-source'
import WmsSource from './component/wms-source'
import WmtsSource from './component/wmts-source'
import XyzSource from './component/xyz-source'
// #if IS_STANDALONE
import * as mixin from './mixin'
import * as olExt from './ol-ext'
import * as rxExt from './rx-ext'
// #endif
import './sass/main.sass'

/**
 * @const {string} VueLayers version.
 */
const VERSION = 'C_PKG_VERSION'
/**
 * Registers all VueLayers components.
 * @param {Vue|VueConstructor} Vue
 * @param {VueLayersOptions} [options]
 */
function plugin (Vue, options = {}) {
  // todo move common installation to separate module and require it in each component
  if (plugin.installed) return
  plugin.installed = true

  basicInstall(Vue, options)

  // install components
  Vue.use(CircleStyle)
  Vue.use(ClusterSource)
  Vue.use(DrawInteraction)
  Vue.use(Feature)
  Vue.use(FillStyle)
  Vue.use(Geoloc)
  Vue.use(IconStyle)
  Vue.use(ImageLayer)
  Vue.use(ImageStaticSource)
  Vue.use(LineStringGeom)
  Vue.use(Map)
  Vue.use(MapboxSource)
  Vue.use(MultiLineStringGeom)
  Vue.use(MultiPointGeom)
  Vue.use(MultiPolygonGeom)
  Vue.use(OsmSource)
  Vue.use(Overlay)
  Vue.use(PointGeom)
  Vue.use(PolygonGeom)
  Vue.use(RegShapeStyle)
  Vue.use(SelectInteraction)
  Vue.use(SputnikSource)
  Vue.use(StrokeStyle)
  Vue.use(StyleBox)
  Vue.use(StyleFunc)
  Vue.use(TextStyle)
  Vue.use(TileLayer)
  Vue.use(VectorLayer)
  Vue.use(VectorSource)
  Vue.use(WmsSource)
  Vue.use(WmtsSource)
  Vue.use(XyzSource)
}

export default plugin
export {
  VERSION,
  plugin as install,
  // components
  CircleStyle,
  ClusterSource,
  DrawInteraction,
  Feature,
  FillStyle,
  Geoloc,
  IconStyle,
  ImageLayer,
  ImageStaticSource,
  LineStringGeom,
  Map,
  MapboxSource,
  MultiLineStringGeom,
  MultiPointGeom,
  MultiPolygonGeom,
  OsmSource,
  Overlay,
  PointGeom,
  PolygonGeom,
  RegShapeStyle,
  SelectInteraction,
  SputnikSource,
  StrokeStyle,
  StyleBox,
  StyleFunc,
  TextStyle,
  TileLayer,
  VectorLayer,
  VectorSource,
  WmsSource,
  WmtsSource,
  XyzSource,
// #if IS_STANDALONE
  mixin,
  olExt,
  rxExt,
// #endif
}

/**
 * @typedef {Object} VueLayersOptions
 * @property {string} [bindToProj] Bind all props to the provided projection.
 */
