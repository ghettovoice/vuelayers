export const GeometryType = {
  POINT: 'Point',
  LINE_STRING: 'LineString',
  LINEAR_RING: 'LinearRing',
  POLYGON: 'Polygon',
  MULTI_POINT: 'MultiPoint',
  MULTI_LINE_STRING: 'MultiLineString',
  MULTI_POLYGON: 'MultiPolygon',
  GEOMETRY_COLLECTION: 'GeometryCollection',
  CIRCLE: 'Circle',
}

export const ExtentCorner = {
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_RIGHT: 'bottom-right',
  TOP_LEFT: 'top-left',
  TOP_RIGHT: 'top-right',
}

export const OverlayPositioning = {
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_CENTER: 'bottom-center',
  BOTTOM_RIGHT: 'bottom-right',
  CENTER_LEFT: 'center-left',
  CENTER_CENTER: 'center-center',
  CENTER_RIGHT: 'center-right',
  TOP_LEFT: 'top-left',
  TOP_CENTER: 'top-center',
  TOP_RIGHT: 'top-right',
}

export const SourceState = {
  UNDEFINED: 'undefined',
  LOADING: 'loading',
  READY: 'ready',
  ERROR: 'error',
}

export const WMSServerType = {
  /**
   * HiDPI support for [Carmenta Server](https://www.carmenta.com/en/products/carmenta-server)
   * @api
   */
  CARMENTA_SERVER: 'carmentaserver',
  /**
   * HiDPI support for [GeoServer](https://geoserver.org/)
   * @api
   */
  GEOSERVER: 'geoserver',
  /**
   * HiDPI support for [MapServer](https://mapserver.org/)
   * @api
   */
  MAPSERVER: 'mapserver',
  /**
   * HiDPI support for [QGIS](https://qgis.org/)
   * @api
   */
  QGIS: 'qgis',
}
