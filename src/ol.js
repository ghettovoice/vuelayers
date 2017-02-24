/**
 * OpenLayers 3 helpers and constants
 */
import ol from 'openlayers'
import {
  flow,
  pick,
  upperFirst,
  lowerFirst,
  isEmpty,
  isEqual,
  merge,
  reduce
} from 'lodash/fp'
import { isNumeric } from 'vuelayers/src/utils/func'

const reduceWithKey = reduce.convert({ cap: false })

/**
 * @type {string} Default map projection.
 */
export const MAP_PROJECTION = 'EPSG:3857'
/**
 * @type {string} Default data source projection.
 */
export const DATA_PROJECTION = 'EPSG:4326'
/**
 * @type {number} Default map max zoom
 */
export const MAX_ZOOM = 28
/**
 * @type {number} Default map min zoom
 */
export const MIN_ZOOM = 0
/**
 * @type {number} Default tile size
 */

export const TILE_SIZE = 256
/**
 * @type {number} Earth radius in meters
 */
export const EARTH_RADIUS = 6378137
export const WGS84_SPHERE = new ol.Sphere(EARTH_RADIUS)

/**
 * @param {number} zoom
 * @param {number} [latitude=0.0]
 * @param {number} [tileSize=256]
 * @return {number}
 */
export function zoomToResolution (zoom, latitude = 0.0, tileSize = TILE_SIZE) {
  // meters per pixel at zoom = 0
  const mpp = 2 * Math.PI * EARTH_RADIUS / tileSize

  return mpp * Math.cos(latitude) / Math.pow(2, zoom)
}
/**
 * @param {number} resolution
 * @param {number} [latitude=0.0]
 * @param {number} [tileSize=256]
 * @return {number}
 */
export function resolutionToZoom (resolution, latitude = 0.0, tileSize = TILE_SIZE) {
  // meters per pixel at zoom = 0
  const mpp = 2 * Math.PI * EARTH_RADIUS / tileSize

  return Math.round(Math.log(mpp * Math.cos(latitude) / resolution) / Math.log(2))
}

/**
 * @param {string[]} attributions
 * @return {ol.Attribution[]}
 */
export function createAttributions (attributions) {
  return (attributions || []).map(html => new ol.Attribution({ html }))
}

/**
 * @param {number[]} p1 First point in EPSG:4326
 * @param {number[]} p2 Second point in EPSG:4326
 * @return {number} Distance in meters.
 */
export function haversineDistance (p1, p2) {
  return WGS84_SPHERE.haversineDistance(p1, p2)
}

/**
 * @param {ol.View} view
 * @param {number[]} coordinate Coordinate in EPSG:4326
 * @param {number} zoom
 * @return {Promise}
 */
export function flyTo (view, coordinate, zoom) {
  const currentZoom = Math.ceil(view.getZoom())
  const currentCenter = ol.proj.toLonLat(view.getCenter(), view.getProjection())
  const distance = haversineDistance(currentCenter, coordinate)
  const duration = Math.log10(distance / 1000) * 1000

  const centerPromise = new Promise(
    resolve => view.animate({
      center: coordinate,
      duration
    }, resolve)
  )

  let zoomPromise
  if (
    currentZoom >= 10 &&
    distance >= 10000 && !isEqual(coordinate, currentCenter)
  ) {
    zoomPromise = new Promise(
      resolve => view.animate({
        zoom: Math.ceil(currentZoom / 2),
        duration: duration / 2
      }, {
        zoom,
        duration: duration / 2
      }, resolve)
    )
  } else {
    zoomPromise = new Promise(
      resolve => view.animate({
        zoom,
        duration
      })
    )
  }

  return Promise.all([ centerPromise, zoomPromise ])
}

// Style helpers (get from geo-1.1)
/**
 * @typedef {Object} GeoStyle
 *
 * Shared
 * @property {string} title
 * @property {string|number[]} fillColor
 * @property {string|number[]} strokeColor
 * @property {number} strokeWidth
 * @property {number[]} strokeDash
 * @property {string} strokeCap
 * @property {string} strokeJoin
 * @property {number} zIndex
 *
 * Text only
 * @property {string} textFont
 * @property {number} textFontSize
 * @property {number} textScale
 * @property {string} textAlign
 * @property {number} textRotation
 * @property {number} textOffsetX
 * @property {number} textOffsetY
 *
 * Icon only
 * @property {string} iconUrl
 * @property {Image} iconImg
 * @property {number[]} iconSize
 * @property {number[]} iconImgSize
 * @property {number} iconOffset
 * @property {number[]} iconAnchor
 * @property {number} iconScale
 * @property {number} iconRotation
 * @property {number} iconRadius
 * @property {number} iconRadius1
 * @property {number} iconRadius2
 * @property {number} iconPoints
 * @property {number} iconAngle
 * @property {number} iconOpacity
 * @property {ol.style.IconOrigin | undefined} iconAnchorOrigin
 * @property {ol.Color | string | undefined} iconColor
 * @property {ol.style.IconOrigin | undefined} iconOffsetOrigin
 */
function getDefaultStyleHash () {
  const default_ = {
    fillColor: [ 255, 255, 255, 0.7 ],
    strokeColor: [ 30, 54, 133, 1 ],
    strokeWidth: 3,
    strokeCap: 'round',
    strokeJoin: 'round',
    iconRadius: 7,
    textStrokeColor: [ 30, 54, 133, 1 ],
    textFillColor: [ 30, 54, 133, 1 ],
    textFont: 'Arial, Helvetica, Verdana, sans-serif',
    textFontSize: 12,
    textStrokeWidth: 1
  }

  const select = {
    ...default_,
    fillColor: [ 255, 255, 255, 0.8 ],
    strokeColor: [ 255, 121, 1, 1 ],
    textFillColor: [ 255, 121, 1, 1 ],
    textStrokeColor: [ 255, 121, 1, 1 ],
    zIndex: 1
  }

  const cluster = {
    ...default_,
    title: '<%= item.clusterSize %>',
    iconUrl: null,
    iconImg: null,
    iconPoints: null,
    iconRadius: 20,
    textFontSize: 14,
    zIndex: 1
  }

  const modify = {
    ...default_,
    fillColor: [ 255, 255, 255, 0.8 ],
    strokeColor: '#FF1E23',
    zIndex: 1
  }

  const current = {
    ...default_,
    fillColor: [ 27, 226, 23, 0.8 ],
    strokeColor: [ 14, 118, 11, 1 ],
    strokeWidth: 4,
    zIndex: 1
  }

  return {
    default: [ { ...default_ } ],
    select: [ { ...select } ],
    cluster: [ { ...cluster } ],
    remove: null,
    modify: [ { ...modify } ],
    current: [ { ...current } ]
  }
}

/**
 * @param {Object<string, GeoStyle[]>} styleHash
 * @return {Object<string, ol.style.Style[]>}
 * @function
 */
const transformStyleHash = reduceWithKey((olStyleHash, geoStyles, styleName) => {
  if (geoStyles && geoStyles.length) {
    const olStyle = geoStyles.map(transformStyle)

    if (!isEmpty(olStyle)) {
      olStyleHash[ styleName ] = olStyle
    }
  }

  return olStyleHash
})

/**
 * Returns style function for `styleHash` or default style function.
 *
 * @param {Object} [styleHash]
 * @return {ol.StyleFunction}
 */
export function createStyleFunc (styleHash) {
  styleHash = merge(getDefaultStyleHash(), styleHash)

  const olStyleHash = transformStyleHash({}, styleHash)

  return (
    /**
     * @param {ol.Feature} feature
     * @return {ol.style.Style[]}
     */
    function styleFunc (feature) {
      const styleName = feature.get('styleName') || 'default'

      return olStyleHash[ styleName ]
    }
  )
}

/**
 * @param {GeoStyle} geoStyle
 * @return {ol.style.Style|undefined}
 */
function transformStyle (geoStyle) {
  if (isEmpty(geoStyle)) return

  const olStyle = {
    text: transformTextStyle(geoStyle),
    fill: transformFillStyle(geoStyle),
    stroke: transformStrokeStyle(geoStyle),
    image: transformImageStyle(geoStyle),
    zIndex: geoStyle.zIndex
  }

  if (!isEmpty(olStyle)) {
    return new ol.style.Style(olStyle)
  }
}

const addPrefix = prefix => str => prefix + (prefix ? upperFirst(str) : str)

/**
 * @param {GeoStyle} geoStyle
 * @param {string} [prefix]
 * @returns {ol.style.Fill|undefined}
 */
function transformFillStyle (geoStyle, prefix = '') {
  const prefixKey = addPrefix(prefix)
  const keys = [ 'fillColor' ].map(prefixKey)

  const transform = flow(
    pick(keys),
    reduceWithKey(
      (result, value, name) => {
        name = lowerFirst(name.replace(new RegExp(prefixKey('fill')), ''))
        result[ name ] = value

        return result
      },
      {}
    )
  )

  const fillStyle = transform(geoStyle)

  if (!isEmpty(fillStyle)) {
    return new ol.style.Fill(fillStyle)
  }
}

/**
 * @param {GeoStyle} geoStyle
 * @param {string} [prefix]
 * @returns {ol.style.Stroke|undefined}
 */
function transformStrokeStyle (geoStyle, prefix = '') {
  const prefixKey = addPrefix(prefix)
  const keys = [ 'strokeColor', 'strokeWidth', 'strokeDash', 'strokeCap', 'strokeJoin' ].map(prefixKey)

  const transform = flow(
    pick(keys),
    reduceWithKey(
      (result, value, name) => {
        switch (name) {
          case prefixKey('strokeColor'):
          case prefixKey('strokeWidth'):
            name = lowerFirst(name.replace(new RegExp(prefixKey('stroke')), ''))
            break
          case prefixKey('strokeDash'):
          case prefixKey('strokeCap'):
          case prefixKey('strokeJoin'):
            name = 'line' + name.replace(new RegExp(prefixKey('stroke')), '')
            break

        }

        result[ name ] = value

        return result
      },
      {}
    )
  )
  const strokeStyle = transform(geoStyle)

  if (!isEmpty(strokeStyle)) {
    return new ol.style.Stroke(strokeStyle)
  }
}

/**
 * @param {GeoStyle} geoStyle
 * @returns {ol.style.Icon|ol.style.Circle|ol.style.RegularShape|undefined}
 */
function transformImageStyle (geoStyle) {
  if (
    isEmpty(geoStyle.iconUrl) && isEmpty(geoStyle.iconImg) &&
    isEmpty(geoStyle.iconPoints) && !isNumeric(geoStyle.iconRadius)
  ) {
    return
  }

  let imageStyle

  if (!isEmpty(geoStyle.iconUrl) || !isEmpty(geoStyle.iconImg)) {
    // then create ol.style.Icon options
    imageStyle = {
      ...geoStyle,
      ...{
        type: 'icon',
        anchor: geoStyle.iconAnchor,
        anchorOrigin: geoStyle.iconAnchorOrigin,
        color: geoStyle.iconColor,
        offset: geoStyle.iconOffset,
        offsetOrigin: geoStyle.iconOffsetOrigin,
        opacity: geoStyle.iconOpacity,
        scale: geoStyle.iconScale,
        rotation: geoStyle.iconRotation,
        size: geoStyle.iconSize,
        imgSize: geoStyle.iconImgSize,
        src: geoStyle.iconUrl,
        crossOrigin: 'anonymous'
      }
    }
  } else if (geoStyle.iconPoints != null) {
    // create ol.style.RegularShape options
    imageStyle = {
      ...geoStyle,
      ...{
        type: 'shape',
        points: geoStyle.iconPoints,
        radius: geoStyle.iconRadius,
        radius1: geoStyle.iconRadius1,
        radius2: geoStyle.iconRadius2,
        angle: geoStyle.iconAngle,
        rotation: geoStyle.iconRotation
      }
    }
  } else {
    // create ol.style.Circle options
    imageStyle = {
      ...geoStyle,
      ...{
        type: 'circle',
        radius: geoStyle.iconRadius
      }
    }
  }

  imageStyle = {
    ...imageStyle,
    fill: transformFillStyle(geoStyle, 'icon') || transformFillStyle(geoStyle),
    stroke: transformStrokeStyle(geoStyle, 'icon') || transformStrokeStyle(geoStyle),
    snapToPixel: true
  }

  if (!isEmpty(imageStyle)) {
    return new ol.style[ upperFirst(imageStyle.type) ](imageStyle)
  }
}

/**
 * @param {GeoStyle} geoStyle
 * @returns {ol.style.Text|undefined}
 */
function transformTextStyle (geoStyle) {
  if (geoStyle.title == null) {
    return
  }

  const textStyle = {
    text: geoStyle.title
  }

  let fontSize = geoStyle.textFontSize ? geoStyle.textFontSize + 'px' : undefined
  let font = [ 'normal', fontSize, geoStyle.textFont ].filter(x => !!x).join(' ')

  Object.assign(
    textStyle,
    pick([ 'textScale', 'textRotation', 'textOffsetX', 'textOffsetY', 'textAlign' ])(geoStyle),
    {
      font,
      fill: transformFillStyle(geoStyle, 'text') || transformFillStyle(geoStyle),
      stroke: transformStrokeStyle(geoStyle, 'text') || transformStrokeStyle(geoStyle)
    }
  )

  if (!isEmpty(textStyle)) {
    return new ol.style.Text(textStyle)
  }
}
