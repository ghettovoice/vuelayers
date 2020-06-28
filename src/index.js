import * as BingmapsSource from './components/bingmaps-source'
import * as ClusterSource from './components/cluster-source'
import * as DrawInteraction from './components/draw-interaction'
import * as Feature from './components/feature'
import * as Geoloc from './components/geoloc'
import * as GraticuleLayer from './components/graticule-layer'
import * as GroupLayer from './components/group-layer'
import * as HeatmapLayer from './components/heatmap-layer'
import * as ImageArcgisRestSource from './components/image-arcgis-rest-source'
import * as ImageLayer from './components/image-layer'
import * as ImageStaticSource from './components/image-static-source'
import * as ImageWmsSource from './components/image-wms-source'
import * as Map from './components/map'
import * as MapboxSource from './components/mapbox-source'
import * as ModifyInteraction from './components/modify-interaction'
import * as OsmSource from './components/osm-source'
import * as Overlay from './components/overlay'
import * as SelectInteraction from './components/select-interaction'
import * as SnapInteraction from './components/snap-interaction'
import * as SputnikSource from './components/sputnik-source'
import * as StamenSource from './components/stamen-source'
import * as Style from './components/style'
import * as StyleFunc from './components/style-func'
import * as TileArcgisRestSource from './components/tile-arcgis-rest-source'
import * as TileLayer from './components/tile-layer'
import * as TileWmsSource from './components/tile-wms-source'
import * as TranslateInteraction from './components/translate-interaction'
import * as VectorImageLayer from './components/vector-image-layer'
import * as VectorLayer from './components/vector-layer'
import * as VectorSource from './components/vector-source'
import * as VectorTileLayer from './components/vector-tile-layer'
import * as VectorTileSource from './components/vector-tile-source'
import * as WmtsSource from './components/wmts-source'
import * as XyzSource from './components/xyz-source'
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
  Vue.use(TranslateInteraction, options)
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
  TranslateInteraction,
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
