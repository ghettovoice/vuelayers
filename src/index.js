import * as ArcgisRestSource from './component/arcgis-rest-source'
import * as BingmapsSource from './component/bingmaps-source'
import * as CircleGeom from './component/circle-geom'
import * as ClusterSource from './component/cluster-source'
import * as DrawInteraction from './component/draw-interaction'
import * as Feature from './component/feature'
import * as Geoloc from './component/geoloc'
import * as Graticule from './component/graticule'
import * as GroupLayer from './component/group-layer'
import * as HeatmapLayer from './component/heatmap-layer'
import * as ImageLayer from './component/image-layer'
import * as ImageStaticSource from './component/image-static-source'
import * as ImageWmsSource from './component/image-wms-source'
import * as LineStringGeom from './component/line-string-geom'
import * as Map from './component/map'
import * as MapboxSource from './component/mapbox-source'
import * as ModifyInteraction from './component/modify-interaction'
import * as MultiLineStringGeom from './component/multi-line-string-geom'
import * as MultiPointGeom from './component/multi-point-geom'
import * as MultiPolygonGeom from './component/multi-polygon-geom'
import * as OsmSource from './component/osm-source'
import * as Overlay from './component/overlay'
import * as PointGeom from './component/point-geom'
import * as PolygonGeom from './component/polygon-geom'
import * as SelectInteraction from './component/select-interaction'
import * as SnapInteraction from './component/snap-interaction'
import * as SputnikSource from './component/sputnik-source'
import * as StamenSource from './component/stamen-source'
import * as Style from './component/style'
import * as StyleFunc from './component/style-func'
import * as TileLayer from './component/tile-layer'
import * as VectorImageLayer from './component/vector-image-layer'
import * as VectorLayer from './component/vector-layer'
import * as VectorSource from './component/vector-source'
import * as VectorTileLayer from './component/vector-tile-layer'
import * as VectorTileSource from './component/vector-tile-source'
import * as WmsSource from './component/wms-source'
import * as WmtsSource from './component/wmts-source'
import * as XyzSource from './component/xyz-source'
import './styles/main.scss'

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
  if (plugin.installed) {
    return
  }
  plugin.installed = true

  // install components
  Vue.use(ArcgisRestSource, options)
  Vue.use(BingmapsSource, options)
  Vue.use(CircleGeom, options)
  Vue.use(ClusterSource, options)
  Vue.use(DrawInteraction, options)
  Vue.use(Feature, options)
  Vue.use(Geoloc, options)
  Vue.use(Graticule, options)
  Vue.use(GroupLayer, options)
  Vue.use(HeatmapLayer, options)
  Vue.use(ImageLayer, options)
  Vue.use(ImageStaticSource, options)
  Vue.use(ImageWmsSource, options)
  Vue.use(LineStringGeom, options)
  Vue.use(Map, options)
  Vue.use(MapboxSource, options)
  Vue.use(ModifyInteraction, options)
  Vue.use(MultiLineStringGeom, options)
  Vue.use(MultiPointGeom, options)
  Vue.use(MultiPolygonGeom, options)
  Vue.use(OsmSource, options)
  Vue.use(Overlay, options)
  Vue.use(PointGeom, options)
  Vue.use(PolygonGeom, options)
  Vue.use(SelectInteraction, options)
  Vue.use(SnapInteraction, options)
  Vue.use(SputnikSource, options)
  Vue.use(StamenSource, options)
  Vue.use(Style, options)
  Vue.use(StyleFunc, options)
  Vue.use(TileLayer, options)
  Vue.use(VectorImageLayer, options)
  Vue.use(VectorLayer, options)
  Vue.use(VectorSource, options)
  Vue.use(VectorTileLayer, options)
  Vue.use(VectorTileSource, options)
  Vue.use(WmsSource, options)
  Vue.use(WmtsSource, options)
  Vue.use(XyzSource, options)
}

export default plugin

export {
  VERSION,
  plugin as install,
  // components
  ArcgisRestSource,
  BingmapsSource,
  CircleGeom,
  ClusterSource,
  DrawInteraction,
  Feature,
  Geoloc,
  Graticule,
  GroupLayer,
  HeatmapLayer,
  ImageLayer,
  ImageStaticSource,
  ImageWmsSource,
  LineStringGeom,
  Map,
  MapboxSource,
  ModifyInteraction,
  MultiLineStringGeom,
  MultiPointGeom,
  MultiPolygonGeom,
  OsmSource,
  Overlay,
  PointGeom,
  PolygonGeom,
  SelectInteraction,
  SnapInteraction,
  SputnikSource,
  StamenSource,
  Style,
  StyleFunc,
  TileLayer,
  VectorImageLayer,
  VectorLayer,
  VectorSource,
  VectorTileLayer,
  VectorTileSource,
  WmsSource,
  WmtsSource,
  XyzSource,
}

/**
 * @typedef {Object} VueLayersOptions
 * @property {string} [dataProjection] Projection for all properties, events and other plain values.
 */
