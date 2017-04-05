/**
 * VueLayers
 * Vue components to work with OpenLayers.
 *
 * @author Vladimir Vershinin <ghettovoice@gmail.com>
 * @license MIT
 * @copyright (c) 2017, Vladimir Vershinin <ghettovoice@gmail.com>
 */
import {
  CircleStyle,
  Feature,
  FillStyle,
  Geoloc,
  geom,
  IconStyle,
  imageStyle,
  interaction,
  layer,
  LineStringGeom,
  Map,
  MapboxSource,
  MultiLineStringGeom,
  MultiPointGeom,
  MultiPolygonGeom,
  OsmSource,
  PointGeom,
  PolygonGeom,
  RegShapeStyle,
  SelectInteraction,
  source,
  StrokeStyle,
  style,
  StyleContainer,
  StyleFunc,
  styleTarget,
  TileLayer,
  tileSource,
  VectorLayer,
  VectorSource,
  View,
  WmsSource,
  XyzSource
} from './components'

const components = {
  // common
  Map,
  View,
  Feature,
  Geoloc,
  // geoms
  geom,
  PointGeom,
  LineStringGeom,
  PolygonGeom,
  MultiPointGeom,
  MultiLineStringGeom,
  MultiPolygonGeom,
  // interactions
  interaction,
  SelectInteraction,
  // layers
  layer,
  VectorLayer,
  TileLayer,
  // sources
  source,
  tileSource,
  VectorSource,
  XyzSource,
  OsmSource,
  MapboxSource,
  WmsSource,
  // style
  style,
  imageStyle,
  styleTarget,
  StyleContainer,
  FillStyle,
  StrokeStyle,
  CircleStyle,
  IconStyle,
  RegShapeStyle,
  StyleFunc
}

function install (Vue) {
  Object.keys(components)
    .forEach(key => {
      if (typeof components[ key ].install === 'function') {
        Vue.use(components[ key ])
      }
    })
}

export default {
  ...components,
  // meta
  VERSION: process.env.PKG_VERSION,
  // install
  install
}

export {
  // common
  Map,
  View,
  Feature,
  Geoloc,
  // geoms
  geom,
  PointGeom,
  LineStringGeom,
  PolygonGeom,
  MultiPointGeom,
  MultiLineStringGeom,
  MultiPolygonGeom,
  // interactions
  interaction,
  SelectInteraction,
  // layers
  layer,
  VectorLayer,
  TileLayer,
  // sources
  source,
  tileSource,
  VectorSource,
  XyzSource,
  OsmSource,
  MapboxSource,
  WmsSource,
  // style
  style,
  imageStyle,
  styleTarget,
  StyleContainer,
  FillStyle,
  StrokeStyle,
  CircleStyle,
  IconStyle,
  RegShapeStyle,
  StyleFunc
}
