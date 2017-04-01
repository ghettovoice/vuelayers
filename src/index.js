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
  OSMSource,
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
  tileBaseLayer,
  tileBaseSource,
  TileLayer,
  vectorBaseLayer,
  vectorBaseSource,
  VectorLayer,
  VectorSource,
  View,
  wmsBaseSource,
  WMSSource,
  xyzBaseSource,
  XYZSource
} from './components'

export {
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
  tileBaseLayer,
  vectorBaseLayer,
  VectorLayer,
  TileLayer,
  // sources
  source,
  vectorBaseSource,
  tileBaseSource,
  xyzBaseSource,
  wmsBaseSource,
  VectorSource,
  XYZSource,
  OSMSource,
  MapboxSource,
  WMSSource,
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
  tileBaseLayer,
  vectorBaseLayer,
  VectorLayer,
  TileLayer,
  // sources
  source,
  vectorBaseSource,
  tileBaseSource,
  xyzBaseSource,
  wmsBaseSource,
  VectorSource,
  XYZSource,
  OSMSource,
  MapboxSource,
  WMSSource,
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
