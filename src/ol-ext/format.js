import BaseGeoJSON from 'ol/format/geojson'
import TopoJSON from 'ol/format/topojson'
import { isEmpty } from '../util/minilo'
import { createCircularPolygon } from './geom'
import { isCircle } from './util'

/**
 * @param {olx.format.GeoJSONOptions} [options]
 * @return {ol.format.GeoJSON}
 */
export function createGeoJsonFmt (options) {
  return new GeoJSON(options)
}

/**
 * @param {olx.format.TopoJSONOptions} [options]
 * @return {ol.format.TopoJSON}
 */
export function createTopoJsonFmt (options) {
  return new TopoJSON(options)
}

class GeoJSON extends BaseGeoJSON {
  adaptOptions (options) {
    return {
      dataProjection: this.defaultDataProjection,
      featureProjection: this.defaultFeatureProjection,
      ...options,
    }
  }

  writeGeometryObject (geometry, options) {
    if (isCircle(geometry)) {
      geometry = createCircularPolygon(geometry.getCenter(), geometry.getRadius())
    }
    return super.writeGeometryObject(geometry, options)
  }

  writeFeatureObject (feature, options) {
    options = this.adaptOptions(options)
    const object = /** @type {GeoJSONFeature} */ ({
      'type': 'Feature',
    })
    const id = feature.getId()
    if (id !== undefined) {
      object.id = id
    }
    const geometry = feature.getGeometry()
    if (geometry) {
      object.geometry = this.writeGeometryObject(geometry, options)
    } else {
      object.geometry = null
    }
    const properties = feature.getProperties()
    delete properties[feature.getGeometryName()]
    if (!isEmpty(properties)) {
      object.properties = properties
    } else {
      object.properties = null
    }
    return object
  }
}
