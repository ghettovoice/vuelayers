import { Feature } from 'ol'
import { GeoJSON as BaseGeoJSON, MVT } from 'ol/format'
import { Circle, LineString } from 'ol/geom'
import GeometryType from 'ol/geom/GeometryType'
import { isEmpty } from 'ol/obj'
import { getLength } from 'ol/sphere'
import { clonePlainObject, isArray, isFunction, isPlainObject, map, noop, omit } from '../utils'
import { COORD_PRECISION } from './coord'
import { createCircularPolygon, isCircleGeom } from './geom'
import { EPSG_3857, EPSG_4326, transformDistance, transformPoint } from './proj'
import { createStyle, dumpStyle } from './style'

/**
 * @param {Object} [options]
 * @return {GeoJSON}
 */
export function createGeoJsonFmt (options) {
  return new GeoJSON(options)
}

/**
 * @param [options]
 * @return {MVT}
 */
export function createMvtFmt (options) {
  return new MVT(options)
}

export const CIRCLE_SERIALIZE_PROP = 'vl_circle'
export const STYLE_SERIALIZE_PROP = 'vl_style'

class GeoJSON extends BaseGeoJSON {
  constructor (options = {}) {
    super(options)

    this.defaultDecimals = options.decimals != null && options.decimals > -1 ? options.decimals : undefined
    this.defaultStyleReader = options.styleReader || noop
    this.defaultStyleWriter = options.styleWriter || noop
  }

  adaptOptions (options = {}) {
    if (options.decimals != null && options.decimals < 0) {
      options.decimals = undefined
    }

    return super.adaptOptions({
      decimals: this.defaultDecimals,
      styleReader: this.defaultStyleReader,
      styleWriter: this.defaultStyleWriter,
      ...options,
    })
  }

  writeGeometryObject (geometry, options) {
    options = this.adaptOptions(options)

    if (isCircleGeom(geometry)) {
      let center = geometry.getCenter().slice()
      const end = [center[0] + geometry.getRadius(), center[1]]
      const radius = getLength(new LineString([center, end]), options.featureProjection)
      center = transformPoint(center, options.featureProjection, EPSG_4326)
      geometry = createCircularPolygon(center, radius)
      options.featureProjection = EPSG_4326
    }

    return super.writeGeometryObject(geometry, options)
  }

  writeFeatureObject (feature, options) {
    options = this.adaptOptions(options)

    /** @type {GeoJSONFeature} */
    const object = {
      type: 'Feature',
      geometry: null,
      properties: null,
    }

    const id = feature.getId()
    if (id !== undefined) {
      object.id = id
    }

    /* eslint-disable quote-props */

    const geometry = feature.getGeometry()
    if (geometry) {
      object.geometry = this.writeGeometryObject(geometry, options)
      if (isCircleGeom(geometry)) {
        object.properties = {
          ...object.properties || {},
          [CIRCLE_SERIALIZE_PROP]: {
            center: transformPoint(
              geometry.getCenter(),
              options.featureProjection,
              options.dataProjection,
            ),
            radius: transformDistance(
              geometry.getRadius(),
              options.featureProjection,
              options.dataProjection,
            ),
          },
        }
      }
    }

    const properties = feature.getProperties()
    delete properties[feature.getGeometryName()]
    if (!isEmpty(properties)) {
      object.properties = {
        ...object.properties || {},
        ...clonePlainObject(omit(properties, 'features')),
      }

      if (isArray(properties.features)) {
        object.properties.features = map(properties.features, feature => {
          if (feature instanceof Feature) {
            return this.writeFeatureObject(feature, options)
          }
          return feature
        })
      }
    }

    let style = feature.getStyle()
    if (style && !isFunction(style)) {
      isArray(style) || (style = [style])
      object.properties = {
        ...object.properties || {},
        [STYLE_SERIALIZE_PROP]: style.map(style => options.styleWriter(
          style,
          geometry => this.writeGeometryObject(geometry, options),
        )),
      }
    }

    /* eslint-enable quote-props */

    return object
  }

  readFeatureFromObject (object, options) {
    options = this.adaptOptions(options)
    /**
     * @type {GeoJSONFeature}
     */
    let geoJSONFeature
    if (object.type === 'Feature') {
      geoJSONFeature = clonePlainObject(object)
    } else {
      geoJSONFeature = {
        type: 'Feature',
        geometry: clonePlainObject(object),
        properties: null,
      }
    }

    const feature = new Feature()

    /* eslint-disable dot-notation */

    if (geoJSONFeature.properties && geoJSONFeature.properties[CIRCLE_SERIALIZE_PROP]) {
      options.circle = geoJSONFeature.properties[CIRCLE_SERIALIZE_PROP]
      delete geoJSONFeature.properties[CIRCLE_SERIALIZE_PROP]
    }
    const geometry = this.readGeometryFromObject(geoJSONFeature.geometry, options)
    if (this.geometryName_) {
      feature.setGeometryName(this.geometryName_)
    } else if (this.extractGeometryName_ && 'geometry_name' in geoJSONFeature !== undefined) {
      feature.setGeometryName(geoJSONFeature.geometry_name)
    }
    feature.setGeometry(geometry)

    if ('id' in geoJSONFeature) {
      feature.setId(geoJSONFeature.id)
    }

    if (geoJSONFeature.properties) {
      if (geoJSONFeature.properties[STYLE_SERIALIZE_PROP]) {
        let style = geoJSONFeature.properties[STYLE_SERIALIZE_PROP]
        isArray(style) || (style = [style])
        feature.setStyle(
          style.map(style => options.styleReader(
            style,
            geometry => this.readGeometryFromObject(geometry, omit(options, ['circle'])),
          )),
        )
        delete geoJSONFeature.properties[STYLE_SERIALIZE_PROP]
      }

      if (isArray(geoJSONFeature.properties.features)) {
        geoJSONFeature.properties.features = map(geoJSONFeature.properties.features, feature => {
          if (isGeoJSONFeature(feature)) {
            return this.readFeatureFromObject(feature, options)
          }
          return feature
        })
      }

      feature.setProperties(geoJSONFeature.properties, true)
    }

    /* eslint-enable dot-notation */

    return feature
  }

  readGeometryFromObject (object, options) {
    options = this.adaptOptions(options)

    if (options.circle?.center && options.circle?.radius) {
      return new Circle(
        transformPoint(
          options.circle.center,
          options.dataProjection,
          options.featureProjection,
        ),
        transformDistance(
          options.circle.radius,
          options.dataProjection,
          options.featureProjection,
        ),
      )
    }

    return super.readGeometryFromObject(clonePlainObject(object), options)
  }
}

let geoJsonFmt

export function getGeoJsonFmt () {
  if (geoJsonFmt) {
    return geoJsonFmt
  }
  return createGeoJsonFmt({
    decimals: COORD_PRECISION,
    styleReader: createStyle,
    styleWriter: dumpStyle,
  })
}

/**
 * @param {Feature} feature
 * @param {ProjectionLike|undefined} [featureProjection=EPSG:3857]
 * @param {ProjectionLike|undefined} [dataProjection=EPSG:4326]
 * @param {number} [decimals=COORD_PRECISION]
 * @return {Object}
 */
export function writeGeoJsonFeature (
  feature,
  featureProjection = EPSG_3857,
  dataProjection = EPSG_4326,
  decimals = COORD_PRECISION,
) {
  if (!feature) return

  return getGeoJsonFmt().writeFeatureObject(feature, {
    featureProjection,
    dataProjection,
    decimals,
  })
}

/**
 * @param {Object} geoJsonFeature
 * @param {ProjectionLike|undefined} [featureProjection=EPSG:3857]
 * @param {ProjectionLike|undefined} [dataProjection=EPSG:4326]
 * @param {number} [decimals=COORD_PRECISION]
 * @return {Feature}
 */
export function readGeoJsonFeature (
  geoJsonFeature,
  featureProjection = EPSG_3857,
  dataProjection = EPSG_4326,
  decimals = COORD_PRECISION,
) {
  if (!geoJsonFeature) return

  return getGeoJsonFmt().readFeature(geoJsonFeature, {
    featureProjection,
    dataProjection,
    decimals,
  })
}

/**
 * @param {Geometry} geometry
 * @param {ProjectionLike|undefined} [geometryProjection=EPSG:3857]
 * @param {ProjectionLike|undefined} [dataProjection=EPSG:4326]
 * @param {number} [decimals=COORD_PRECISION]
 * @return {Object}
 */
export function writeGeoJsonGeometry (
  geometry,
  geometryProjection = EPSG_3857,
  dataProjection = EPSG_4326,
  decimals = COORD_PRECISION,
) {
  if (!geometry) return

  return getGeoJsonFmt().writeGeometryObject(geometry, {
    featureProjection: geometryProjection,
    dataProjection,
    decimals,
  })
}

/**
 * @param {Object|Object} geoJsonGeometry
 * @param {ProjectionLike|undefined} [geometryProjection=EPSG:3857]
 * @param {ProjectionLike|undefined} [dataProjection=EPSG:4326]
 * @param {number} [decimals=COORD_PRECISION]
 * @return {Geometry}
 */
export function readGeoJsonGeometry (
  geoJsonGeometry,
  geometryProjection = EPSG_3857,
  dataProjection = EPSG_4326,
  decimals = COORD_PRECISION,
) {
  if (!geoJsonGeometry) return

  dataProjection = readProjection(geoJsonGeometry, dataProjection)

  return getGeoJsonFmt().readGeometry(geoJsonGeometry, {
    featureProjection: geometryProjection,
    dataProjection,
    decimals,
  })
}

export function readProjection (geoJsonObj, defaultProjection) {
  return getGeoJsonFmt().readProjection(geoJsonObj) || defaultProjection
}

/**
 * @param {Object} feature
 * @returns {boolean}
 */
export function isGeoJSONFeature (feature) {
  return isPlainObject(feature) && feature.type === 'Feature' &&
    isGeoJSONGeometry(feature.geometry)
}

export function isGeoJSONGeometry (geometry) {
  return isPlainObject(geometry) &&
    Object.values(GeometryType).includes(geometry.type) &&
    isArray(geometry.coordinates)
}
