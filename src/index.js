import * as BingmapsSource from './component/bingmaps-source'
import * as ClusterSource from './component/cluster-source'
import * as DrawInteraction from './component/draw-interaction'
import * as Feature from './component/feature'
import * as Geoloc from './component/geoloc'
import * as GraticuleLayer from './component/graticule-layer'
import * as GroupLayer from './component/group-layer'
import * as HeatmapLayer from './component/heatmap-layer'
import * as ImageArcgisRestSource from './component/image-arcgis-rest-source'
import * as ImageLayer from './component/image-layer'
import * as ImageStaticSource from './component/image-static-source'
import * as ImageWmsSource from './component/image-wms-source'
import * as Map from './component/map'
import * as MapboxSource from './component/mapbox-source'
import * as ModifyInteraction from './component/modify-interaction'
import * as OsmSource from './component/osm-source'
import * as Overlay from './component/overlay'
import * as SelectInteraction from './component/select-interaction'
import * as SnapInteraction from './component/snap-interaction'
import * as SputnikSource from './component/sputnik-source'
import * as StamenSource from './component/stamen-source'
import * as Style from './component/style'
import * as StyleFunc from './component/style-func'
import * as TileArcgisRestSource from './component/tile-arcgis-rest-source'
import * as TileLayer from './component/tile-layer'
import * as TileWmsSource from './component/tile-wms-source'
import * as VectorImageLayer from './component/vector-image-layer'
import * as VectorLayer from './component/vector-layer'
import * as VectorSource from './component/vector-source'
import * as VectorTileLayer from './component/vector-tile-layer'
import * as VectorTileSource from './component/vector-tile-source'
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
  Vue.use(BingmapsSource, options)
  Vue.use(ClusterSource, options)
  Vue.use(DrawInteraction, options)
  Vue.use(Feature, options)
  Vue.use(Geoloc, options)
  Vue.use(GraticuleLayer, options)
  Vue.use(GroupLayer, options)
  Vue.use(HeatmapLayer, options)
  Vue.use(ImageArcgisRestSource, options)
  Vue.use(ImageLayer, options)
  Vue.use(ImageStaticSource, options)
  Vue.use(ImageWmsSource, options)
  Vue.use(Map, options)
  Vue.use(MapboxSource, options)
  Vue.use(ModifyInteraction, options)
  Vue.use(OsmSource, options)
  Vue.use(Overlay, options)
  Vue.use(SelectInteraction, options)
  Vue.use(SnapInteraction, options)
  Vue.use(SputnikSource, options)
  Vue.use(StamenSource, options)
  Vue.use(Style, options)
  Vue.use(StyleFunc, options)
  Vue.use(TileArcgisRestSource, options)
  Vue.use(TileLayer, options)
  Vue.use(TileWmsSource, options)
  Vue.use(VectorImageLayer, options)
  Vue.use(VectorLayer, options)
  Vue.use(VectorSource, options)
  Vue.use(VectorTileLayer, options)
  Vue.use(VectorTileSource, options)
  Vue.use(WmtsSource, options)
  Vue.use(XyzSource, options)
}

export default plugin

export {
  VERSION,
  plugin as install,
  // components
  BingmapsSource,
  ClusterSource,
  DrawInteraction,
  Feature,
  Geoloc,
  GraticuleLayer,
  GroupLayer,
  HeatmapLayer,
  ImageArcgisRestSource,
  ImageLayer,
  ImageStaticSource,
  ImageWmsSource,
  Map,
  MapboxSource,
  ModifyInteraction,
  OsmSource,
  Overlay,
  SelectInteraction,
  SnapInteraction,
  SputnikSource,
  StamenSource,
  Style,
  StyleFunc,
  TileArcgisRestSource,
  TileLayer,
  TileWmsSource,
  VectorImageLayer,
  VectorLayer,
  VectorSource,
  VectorTileLayer,
  VectorTileSource,
  WmtsSource,
  XyzSource,
}

/**
 * @typedef {Object} VueLayersOptions
 * @property {string} [dataProjection] Projection for all properties, events and other plain values.
 */
