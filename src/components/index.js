import identMap from './ident-map'
import olCmp from './ol-cmp'
import olVirtCmp from './ol-virt-cmp'
import useMapCmp from './use-map-cmp'
import rxSubs from './rx-subs'
import services from './services'
import stubVNode from './stub-vnode'
import stylesContainers from './styles-container'
import featuresContainers from './features-container'
import geometryContainers from './geometry-container'
import interactionsContainers from './interactions-container'
import layersContainers from './layers-container'
import overlaysContainers from './overlays-container'
import sourceContainers from './source-container'
import geom from './geom/geom'
import interaction from './interaction/interaction'
import layer from './layer/layer'
import source from './source/source'
import tileSource from './source/tile'
import vectSource from './source/vect'
import style from './style/style'
import imageStyle from './style/image'
import withFillStrokeStyle from './style/with-fill-stroke'

export Map from './map'
export Feature from './feature'
export Geoloc from './geoloc'
export Overlay from './overlay'
// geoms
export PointGeom from './geom/point'
export LineStringGeom from './geom/line-string'
export PolygonGeom from './geom/polygon'
export MultiPointGeom from './geom/multi-point'
export MultiLineStringGeom from './geom/multi-line-string'
export MultiPolygonGeom from './geom/multi-polygon'
// interactions
export SelectInteraction from './interaction/select'
// layers
export TileLayer from './layer/tile'
export VectorLayer from './layer/vector'
// sources
export ClusterSource from './source/cluster'
export MapboxSource from './source/mapbox'
export OsmSource from './source/osm'
export SputnikSource from './source/sputnik'
export VectorSource from './source/vector'
export WmsSource from './source/wms'
export WmtsSource from './source/wmts'
export XyzSource from './source/xyz'
// styles
export CircleStyle from './style/circle'
export FillStyle from './style/fill'
export IconStyle from './style/icon'
export RegShapeStyle from './style/reg-shape'
export StrokeStyle from './style/stroke'
export StyleBox from './style/box'
export StyleContainer from './style/container'
export StyleFunc from './style/func'
export TextStyle from './style/text'

export const mixins = {
  identMap,
  olCmp,
  olVirtCmp,
  useMapCmp,
  rxSubs,
  services,
  stubVNode,
  stylesContainers,
  featuresContainers,
  geometryContainers,
  interactionsContainers,
  layersContainers,
  overlaysContainers,
  sourceContainers,
  geom,
  interaction,
  layer,
  source,
  tileSource,
  vectSource,
  style,
  imageStyle,
  withFillStrokeStyle,
}
