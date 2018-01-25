/** @module vuelayers */
import * as core from './core'
import CircleStyle from './components/circle-style'
import ClusterSource from './components/cluster-source'
import Feature from './components/feature'
import FillStyle from './components/fill-style'
import Geoloc from './components/geoloc'
import IconStyle from './components/icon-style'
import ImageLayer from './components/image-layer'
import ImageStaticSource from './components/image-static-source'
import LineStringGeom from './components/line-string-geom'
import Map from './components/map'
import MapboxSource from './components/mapbox-source'
import MultiLineStringGeom from './components/multi-line-string-geom'
import MultiPointGeom from './components/multi-point-geom'
import MultiPolygonGeom from './components/multi-polygon-geom'
import OsmSource from './components/osm-source'
import Overlay from './components/overlay'
import PointGeom from './components/point-geom'
import PolygonGeom from './components/polygon-geom'
import RegShapeStyle from './components/reg-shape-style'
import SelectInteraction from './components/select-interaction'
import SputnikSource from './components/sputnik-source'
import StrokeStyle from './components/stroke-style'
import StyleBox from './components/style-box'
import StyleFunc from './components/style-func'
import TextStyle from './components/text-style'
import TileLayer from './components/tile-layer'
import VectorLayer from './components/vector-layer'
import VectorSource from './components/vector-source'
import WmsSource from './components/wms-source'
import WmtsSource from './components/wmts-source'
import XyzSource from './components/xyz-source'
import './styles/main.sass'

/**
 * @const {string} VueLayers version.
 */
const VERSION = 'C_PKG_VERSION'
/**
 * Registers all VueLayers components.
 * @param {Vue} Vue
 * @param {VueLayersOptions} [options]
 */
function install (Vue, options = {}) {
  if (install.installed) return
  install.installed = true

  if (options.bindToProj && !core.projHelper.get(options.bindToProj)) {
    core.log.warn('Projection "' + options.bindToProj + '" isn\'t added to the list of known projections. ' +
      'It should be added before VueLayers install with OpenLayers or VueLayers API.')
  }
  // extend Vue with VueLayers global methods and options
  Vue[core.VL_OPTIONS] = Vue.prototype[core.VL_OPTIONS] = options

  // install components
  Vue.use(CircleStyle)
  Vue.use(ClusterSource)
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

export {
  VERSION,
  install,
  core,
  // components
  CircleStyle,
  ClusterSource,
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
}

/**
 * @typedef {Object} VueLayersOptions
 * @property {string} [bindToProj] Bind all props to the provided projection.
 */
