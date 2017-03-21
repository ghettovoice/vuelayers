import ol from 'openlayers'
import { flow, pick, upperFirst, lowerFirst, isEmpty, merge, reduce, isNumeric, isString } from 'vl-utils/func'
import * as consts from './consts'

// Style helpers (get from geo-1.1)
// todo change to ol default
/**
 * @typedef {Object} GeoStyle
 *
 * Shared
 * @property {string|number[]|undefined} fillColor
 * @property {string|number[]|undefined} strokeColor
 * @property {number|undefined} strokeWidth
 * @property {number[]|undefined} strokeDash
 * @property {string|undefined} strokeCap
 * @property {string|undefined} strokeJoin
 * @property {number|undefined} zIndex
 *
 * Text only
 * @property {string|undefined} text
 * @property {string|undefined} textFont
 * @property {number|undefined} textFontSize
 * @property {number|undefined} textFillColor
 * @property {number|undefined} textStrokeColor
 * @property {number|undefined} textScale
 * @property {string|undefined} textAlign
 * @property {number|undefined} textRotation
 * @property {number|undefined} textOffsetX
 * @property {number|undefined} textOffsetY
 *
 * Icon only
 * @property {string|undefined} iconUrl
 * @property {Image|undefined} iconImg
 * @property {number[]|undefined} iconSize
 * @property {number[]|undefined} iconImgSize
 * @property {number|undefined} iconOffset
 * @property {number[]|undefined} iconAnchor
 * @property {number|undefined} iconScale
 * @property {number|undefined} iconRotation
 * @property {number|undefined} iconRadius
 * @property {number|undefined} iconRadius1
 * @property {number|undefined} iconRadius2
 * @property {number|undefined} iconPoints
 * @property {number|undefined} iconAngle
 * @property {number|undefined} iconOpacity
 * @property {ol.style.IconOrigin | undefined} iconAnchorOrigin
 * @property {ol.Color | string | undefined} iconColor
 * @property {ol.style.IconOrigin | undefined} iconOffsetOrigin
 */
export function defaultStyleHash () {
  const default_ = {
    fillColor: [ 255, 255, 255, 0.7 ],
    strokeColor: [ 30, 54, 133, 1 ],
    strokeWidth: 2,
    strokeCap: 'round',
    strokeJoin: 'round',
    iconRadius: 7,
    textStrokeColor: [ 30, 54, 133, 1 ],
    textFillColor: [ 30, 54, 133, 1 ],
    textFont: 'sans-serif',
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
    text: '<%= item.clusterSize %>',
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
export function transformStyleHash (styleHash) {
  const transformer = reduce((olStyleHash, geoStyles, styleName) => {
    if (geoStyles && geoStyles.length) {
      const olStyle = geoStyles.map(transformStyle)

      if (!isEmpty(olStyle)) {
        olStyleHash[ styleName ] = olStyle
      }
    }

    return olStyleHash
  }, Object.create(null))

  return transformer(styleHash)
}

/**
 * Returns style function for `styleHash` or default style function.
 *
 * @param {Object} [styleHash]
 * @return {ol.StyleFunction}
 */
export function createStyleFunc (styleHash) {
  styleHash = merge(defaultStyleHash(), styleHash)

  // Static pre-compilation
  const olStyleHash = transformStyleHash(styleHash)

  return (
    /**
     * @param {ol.Feature} feature
     * @return {ol.style.Style[]}
     */
    function __styleFunc (feature) {
      const styleName = feature.get('styleName') || 'default'

      return olStyleHash[ styleName ]
    }
  )
}

/**
 * @param {GeoStyle} geoStyle
 * @return {ol.style.Style|undefined}
 */
export function transformStyle (geoStyle) {
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

export function normalizeColorValue (color) {
  if (isString(color) && !/^rgb.*/.test(color) && color[ 0 ] !== '#') {
    color = '#' + color
  }

  return color
}

/**
 * @param {GeoStyle} geoStyle
 * @param {string} [prefix]
 * @returns {ol.style.Fill|undefined}
 */
export function transformFillStyle (geoStyle, prefix = '') {
  const prefixKey = addPrefix(prefix)
  const keys = [ 'fillColor' ].map(prefixKey)

  const transform = flow(
    pick(keys),
    reduce(
      (result, value, name) => {
        name = lowerFirst(name.replace(new RegExp(prefixKey('fill')), ''))

        if (name === 'color') {
          value = normalizeColorValue(value)
        }

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
export function transformStrokeStyle (geoStyle, prefix = '') {
  const prefixKey = addPrefix(prefix)
  const keys = [ 'strokeColor', 'strokeWidth', 'strokeDash', 'strokeCap', 'strokeJoin' ].map(prefixKey)

  const transform = flow(
    pick(keys),
    reduce(
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

        if (name === 'color') {
          value = normalizeColorValue(value)
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
export function transformImageStyle (geoStyle) {
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
export function transformTextStyle (geoStyle) {
  // noinspection JSValidateTypes
  if (geoStyle.text == null) {
    return
  }

  const textStyle = {
    text: geoStyle.text
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

/**
 * Default OpenLayers styles
 *
 * @return {ol.style.Style[]}
 * @see {@link https://github.com/openlayers/openlayers/blob/master/src/ol/style/style.js#L290}
 */
export function defaultStyle () {
  // We don't use an immediately-invoked function
  // and a closure so we don't get an error at script evaluation time in
  // browsers that do not support Canvas. (ol.style.Circle does
  // canvas.getContext('2d') at construction time, which will cause an.error
  // in such browsers.)
  const fill = new ol.style.Fill({
    color: 'rgba(255,255,255,0.4)'
  })
  const stroke = new ol.style.Stroke({
    color: '#3399CC',
    width: 1.25
  })
  return [
    new ol.style.Style({
      image: new ol.style.Circle({
        fill: fill,
        stroke: stroke,
        radius: 5
      }),
      fill: fill,
      stroke: stroke
    })
  ]
}

/**
 * Default OpenLayers edit style.
 *
 * @return {Object.<consts.GEOMETRY_TYPE, Array.<ol.style.Style>>}
 * @see {@link https://github.com/openlayers/openlayers/blob/master/src/ol/style/style.js#L324}
 */
export function defaultEditStyle () {
  /** @type {Object.<consts.GEOMETRY_TYPE, Array.<ol.style.Style>>} */
  let styles = {}
  let white = [ 255, 255, 255, 1 ]
  let blue = [ 0, 153, 255, 1 ]
  let width = 3

  styles[ consts.GEOMETRY_TYPE.LINE_STRING ] = [
    new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: white,
        width: width + 2
      })
    }),
    new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: blue,
        width: width
      })
    })
  ]
  styles[ consts.GEOMETRY_TYPE.MULTI_LINE_STRING ] =
    styles[ consts.GEOMETRY_TYPE.LINE_STRING ]

  styles[ consts.GEOMETRY_TYPE.POLYGON ] = [
    new ol.style.Style({
      fill: new ol.style.Fill({
        color: [ 255, 255, 255, 0.5 ]
      })
    })
  ].concat(styles[ consts.GEOMETRY_TYPE.LINE_STRING ])
  styles[ consts.GEOMETRY_TYPE.MULTI_POLYGON ] =
    styles[ consts.GEOMETRY_TYPE.POLYGON ]

  styles[ consts.GEOMETRY_TYPE.CIRCLE ] =
    styles[ consts.GEOMETRY_TYPE.POLYGON ].concat(
      styles[ consts.GEOMETRY_TYPE.LINE_STRING ]
    )

  styles[ consts.GEOMETRY_TYPE.POINT ] = [
    new ol.style.Style({
      image: new ol.style.Circle({
        radius: width * 2,
        fill: new ol.style.Fill({
          color: blue
        }),
        stroke: new ol.style.Stroke({
          color: white,
          width: width / 2
        })
      }),
      zIndex: Infinity
    })
  ]
  styles[ consts.GEOMETRY_TYPE.MULTI_POINT ] =
    styles[ consts.GEOMETRY_TYPE.POINT ]

  styles[ consts.GEOMETRY_TYPE.GEOMETRY_COLLECTION ] =
    styles[ consts.GEOMETRY_TYPE.POLYGON ].concat(
      styles[ consts.GEOMETRY_TYPE.LINE_STRING ],
      styles[ consts.GEOMETRY_TYPE.POINT ]
    )

  return styles
}
