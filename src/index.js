/* global PKG_VERSION */
/**
 * VueLayers
 * Vue components to work with OpenLayers.
 *
 * @author Vladimir Vershinin <ghettovoice@gmail.com>
 * @license MIT
 * @copyright (c) 2017, Vladimir Vershinin <ghettovoice@gmail.com>
 */
import {
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
} from './components'

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

export default {
  ...components,
  // meta
  VERSION: PKG_VERSION,
  // install
  install (Vue) {
    Object.keys(components)
      .forEach(key => {
        if (typeof components[ key ].install === 'function') {
          Vue.use(components[ key ])
        }
      })
  }
}
