/**
 * Style helpers
 */
import ol from 'openlayers'
import Style from 'ol/style/style'
import Fill from 'ol/style/fill'
import Stroke from 'ol/style/stroke'
import Circle from 'ol/style/circle'
import Icon from 'ol/style/icon'
import RegularShape from 'ol/style/regularshape'
import Text from 'ol/style/text'
import { isEmpty, upperFirst, lowerFirst, flow, pick, isString } from 'lodash/fp'
import { isNumeric } from 'vl-utils/func'
const reduce = require('lodash/fp/reduce').convert({ cap: false })

/**
 * @typedef {Object} VlStyle
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
 * @property {IconOrigin | undefined} iconAnchorOrigin
 * @property {Color | string | undefined} iconColor
 * @property {IconOrigin | undefined} iconOffsetOrigin
 */

/**
 * @return {VlStyle[]}
 */
export function defaultStyle () {
  return [ {
    fillColor: [ 255, 255, 255, 0.4 ],
    strokeColor: '#3399CC',
    strokeWidth: 1.25,
    iconRadius: 5
  } ]
}

/**
 * @return {Object<consts.GEOMETRY_TYPE, Array<VlStyle>>}
 */
export function defaultEditStyle () {
  /** @type {Object<consts.GEOMETRY_TYPE, Array<VlStyle>>} */
  let styles = {}
  let white = [ 255, 255, 255, 1 ]
  let blue = [ 0, 153, 255, 1 ]
  let width = 3

  styles[ consts.GEOMETRY_TYPE.LINE_STRING ] = [ {
    strokeColor: white,
    strokeWidth: width + 2
  }, {
    strokeColor: blue,
    strokeWidth: width
  } ]
  styles[ consts.GEOMETRY_TYPE.MULTI_LINE_STRING ] =
    styles[ consts.GEOMETRY_TYPE.LINE_STRING ]

  styles[ consts.GEOMETRY_TYPE.POLYGON ] = [ {
    fillColor: [ 255, 255, 255, 0.5 ]
  } ].concat(styles[ consts.GEOMETRY_TYPE.LINE_STRING ])
  styles[ consts.GEOMETRY_TYPE.MULTI_POLYGON ] =
    styles[ consts.GEOMETRY_TYPE.POLYGON ]

  styles[ consts.GEOMETRY_TYPE.CIRCLE ] =
    styles[ consts.GEOMETRY_TYPE.POLYGON ].concat(
      styles[ consts.GEOMETRY_TYPE.LINE_STRING ]
    )

  styles[ consts.GEOMETRY_TYPE.POINT ] = [ {
    iconRadius: width * 2,
    fillColor: blue,
    strokeColor: white,
    strokeWidth: width / 2,
    zIndex: Infinity
  } ]
  styles[ consts.GEOMETRY_TYPE.MULTI_POINT ] =
    styles[ consts.GEOMETRY_TYPE.POINT ]

  styles[ consts.GEOMETRY_TYPE.GEOMETRY_COLLECTION ] =
    styles[ consts.GEOMETRY_TYPE.POLYGON ].concat(
      styles[ consts.GEOMETRY_TYPE.LINE_STRING ],
      styles[ consts.GEOMETRY_TYPE.POINT ]
    )

  return styles
}

/**
 * @param {VlStyle} vlStyle
 * @return {Style|undefined}
 */
export function transformStyle (vlStyle) {
  if (isEmpty(vlStyle)) return

  const olStyle = {
    text: transformTextStyle(vlStyle),
    fill: transformFillStyle(vlStyle),
    stroke: transformStrokeStyle(vlStyle),
    image: transformImageStyle(vlStyle),
    zIndex: vlStyle.zIndex
  }

  if (!isEmpty(olStyle)) {
    return new Style(olStyle)
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
 * @param {VlStyle} vlStyle
 * @param {string} [prefix]
 * @returns {Fill|undefined}
 */
export function transformFillStyle (vlStyle, prefix = '') {
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

  const fillStyle = transform(vlStyle)

  if (!isEmpty(fillStyle)) {
    return new Fill(fillStyle)
  }
}

/**
 * @param {VlStyle} vlStyle
 * @param {string} [prefix]
 * @returns {Stroke|undefined}
 */
export function transformStrokeStyle (vlStyle, prefix = '') {
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

  const strokeStyle = transform(vlStyle)

  if (!isEmpty(strokeStyle)) {
    return new Stroke(strokeStyle)
  }
}

/**
 * @param {VlStyle} vlStyle
 * @returns {Icon|Circle|RegularShape|undefined}
 */
export function transformImageStyle (vlStyle) {
  if (
    isEmpty(vlStyle.iconUrl) && isEmpty(vlStyle.iconImg) &&
    isEmpty(vlStyle.iconPoints) && !isNumeric(vlStyle.iconRadius)
  ) {
    return
  }

  let imageStyle, Ctor

  if (!isEmpty(vlStyle.iconUrl) || !isEmpty(vlStyle.iconImg)) {
    Ctor = Icon
    // then create ol.style.Icon options
    imageStyle = {
      ...vlStyle,
      anchor: vlStyle.iconAnchor,
      anchorOrigin: vlStyle.iconAnchorOrigin,
      color: vlStyle.iconColor,
      offset: vlStyle.iconOffset,
      offsetOrigin: vlStyle.iconOffsetOrigin,
      opacity: vlStyle.iconOpacity,
      scale: vlStyle.iconScale,
      rotation: vlStyle.iconRotation,
      size: vlStyle.iconSize,
      imgSize: vlStyle.iconImgSize,
      src: vlStyle.iconUrl,
      crossOrigin: 'anonymous'
    }
  } else if (vlStyle.iconPoints != null) {
    Ctor = RegularShape
    // create ol.style.RegularShape options
    imageStyle = {
      ...vlStyle,
      points: vlStyle.iconPoints,
      radius: vlStyle.iconRadius,
      radius1: vlStyle.iconRadius1,
      radius2: vlStyle.iconRadius2,
      angle: vlStyle.iconAngle,
      rotation: vlStyle.iconRotation
    }
  } else {
    Ctor = Circle
    // create ol.style.Circle options
    imageStyle = {
      ...vlStyle,
      radius: vlStyle.iconRadius
    }
  }

  imageStyle = {
    ...imageStyle,
    fill: transformFillStyle(vlStyle, 'icon') || transformFillStyle(vlStyle),
    stroke: transformStrokeStyle(vlStyle, 'icon') || transformStrokeStyle(vlStyle),
    snapToPixel: true
  }

  if (!isEmpty(imageStyle)) {
    return new Ctor(imageStyle)
  }
}

/**
 * @param {VlStyle} vlStyle
 * @returns {Text|undefined}
 */
export function transformTextStyle (vlStyle) {
  // noinspection JSValidateTypes
  if (vlStyle.text == null) {
    return
  }

  const textStyle = {
    text: vlStyle.text
  }

  let fontSize = vlStyle.textFontSize ? vlStyle.textFontSize + 'px' : undefined
  let font = [ 'normal', fontSize, vlStyle.textFont ].filter(x => !!x).join(' ')

  Object.assign(
    textStyle,
    pick([ 'textScale', 'textRotation', 'textOffsetX', 'textOffsetY', 'textAlign' ])(vlStyle),
    {
      font,
      fill: transformFillStyle(vlStyle, 'text') || transformFillStyle(vlStyle),
      stroke: transformStrokeStyle(vlStyle, 'text') || transformStrokeStyle(vlStyle)
    }
  )

  if (!isEmpty(textStyle)) {
    return new Text(textStyle)
  }
}
