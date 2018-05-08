import BaseGeoJSON from 'ol/format/geojson'
import TopoJSON from 'ol/format/topojson'
import MVT from 'ol/format/mvt'
import { isEmpty } from '../util/minilo'
import { EPSG_4326 } from './consts'
import { createCircularPolygon } from './geom'
import { transformPoint } from './proj'
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

/**
 * @param [options]
 * @return {ol.format.MVT}
 */
export function createMvtFmt (options) {
  return new MVT(options)
}

class GeoJSON extends BaseGeoJSON {
  writeGeometryObject (geometry, options) {
    if (isCircle(geometry)) {
      geometry = createCircularPolygon(
        transformPoint(
          geometry.getCenter(),
          options.featureProjection || this.defaultFeatureProjection,
          EPSG_4326,
        ),
        geometry.getRadius(),
      )
      options.featureProjection = EPSG_4326
    }
    return super.writeGeometryObject(geometry, options)
  }

  writeFeatureObject (feature, options) {
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
