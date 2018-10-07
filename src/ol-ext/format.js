import BaseGeoJSON from 'ol/format/GeoJSON'
import MVT from 'ol/format/MVT'
import TopoJSON from 'ol/format/TopoJSON'
import { isEmpty } from '../util/minilo'
import { EPSG_4326 } from './consts'
import { createCircularPolygon } from './geom'
import { transformPoint } from './proj'
import { isCircle } from './util'

/**
 * @param {Object} [options]
 * @return {GeoJSON}
 */
export function createGeoJsonFmt (options) {
  return new GeoJSON(options)
}

/**
 * @param {Object} [options]
 * @return {TopoJSON}
 */
export function createTopoJsonFmt (options) {
  return new TopoJSON(options)
}

/**
 * @param [options]
 * @return {MVT}
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
    const object = /** @type {Object} */ ({
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
