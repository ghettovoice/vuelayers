/**
 * Style helpers
 */
import Circle from 'ol/style/circle'
import Fill from 'ol/style/fill'
import Icon from 'ol/style/icon'
import ImageStyle from 'ol/style/image'
import RegularShape from 'ol/style/regularshape'
import Stroke from 'ol/style/stroke'
import Style from 'ol/style/style'
import Text from 'ol/style/text'
import parseColor from 'parse-color'
import { isFunction, isNumeric, lowerFirst, pick, reduce, upperFirst } from '../util/minilo'
import { GEOMETRY_TYPE } from './consts'
import * as geomHelper from './geom'

/**
 * @return {VlStyle[]}
 */
export function defaultStyle () {
  return [
    {
      fillColor: [255, 255, 255, 0.4],
      strokeColor: '#3399CC',
      strokeWidth: 1.25,
      imageRadius: 5,
    },
  ]
}

/**
 * @return {Object<GEOMETRY_TYPE, VlStyle[]>}
 */
export function defaultEditStyle () {
  /** @type {Object<GEOMETRY_TYPE, VlStyle[]>} */
  let styles = {}
  let white = [255, 255, 255, 1]
  let blue = [0, 153, 255, 1]
  let width = 3

  styles[GEOMETRY_TYPE.LINE_STRING] = [
    {
      strokeColor: white,
      strokeWidth: width + 2,
    }, {
      strokeColor: blue,
      strokeWidth: width,
    },
  ]
  styles[GEOMETRY_TYPE.MULTI_LINE_STRING] =
    styles[GEOMETRY_TYPE.LINE_STRING]

  styles[GEOMETRY_TYPE.POLYGON] = [
    {
      fillColor: [255, 255, 255, 0.5],
    },
  ].concat(styles[GEOMETRY_TYPE.LINE_STRING])
  styles[GEOMETRY_TYPE.MULTI_POLYGON] =
    styles[GEOMETRY_TYPE.POLYGON]

  styles[GEOMETRY_TYPE.CIRCLE] =
    styles[GEOMETRY_TYPE.POLYGON].concat(
      styles[GEOMETRY_TYPE.LINE_STRING]
    )

  styles[GEOMETRY_TYPE.POINT] = [
    {
      imageRadius: width * 2,
      fillColor: blue,
      strokeColor: white,
      strokeWidth: width / 2,
      zIndex: Infinity,
    },
  ]
  styles[GEOMETRY_TYPE.MULTI_POINT] =
    styles[GEOMETRY_TYPE.POINT]

  styles[GEOMETRY_TYPE.GEOMETRY_COLLECTION] =
    styles[GEOMETRY_TYPE.POLYGON].concat(
      styles[GEOMETRY_TYPE.LINE_STRING],
      styles[GEOMETRY_TYPE.POINT]
    )

  return styles
}

const isEmpty = x => {
  if (x == null) return true
  if (typeof x === 'number') return false

  return ((typeof x === 'string' || Array.isArray(x)) && !x.length) ||
    !Object.keys(x).length
}

/**
 * @param {VlStyle} vlStyle
 * @return {ol.style.Style|undefined}
 */
export function createStyle (vlStyle) {
  if (isEmpty(vlStyle)) return

  const olStyle = {
    text: createTextStyle(vlStyle),
    fill: createFillStyle(vlStyle),
    stroke: createStrokeStyle(vlStyle),
    image: createImageStyle(vlStyle),
    geometry: createGeomStyle(vlStyle),
    zIndex: vlStyle.zIndex,
  }

  if (!isEmpty(olStyle)) {
    return new Style(olStyle)
  }
}

const addPrefix = prefix => str => prefix + (prefix ? upperFirst(str) : str)

/**
 * @param {*} color
 * @returns {*}
 */
export function normalizeColor (color) {
  let c = color

  if (typeof color === 'string') {
    c = parseColor(color).rgba
  }

  return c
}

/**
 * @param {VlStyle} vlStyle
 * @param {string} [prefix]
 * @returns {ol.style.Fill|undefined}
 */
export function createFillStyle (vlStyle, prefix = '') {
  const prefixKey = addPrefix(prefix)
  const keys = ['fillColor'].map(prefixKey)
  const compiledKey = prefixKey('fill')

  // check on already compiled style existence
  if (vlStyle[compiledKey] instanceof Fill) return vlStyle[compiledKey]

  const fillStyle = reduce(vlStyle, (style, value, name) => {
    if (keys.includes(name) === false) {
      return style
    }
    name = lowerFirst(name.replace(new RegExp(prefixKey('fill')), ''))
    if (name === 'color') {
      value = normalizeColor(value)
    }
    style[name] = value
    return style
  }, {})

  if (!isEmpty(fillStyle)) {
    return new Fill(fillStyle)
  }
}

/**
 * @param {VlStyle} vlStyle
 * @param {string} [prefix]
 * @returns {ol.style.Stroke|undefined}
 */
export function createStrokeStyle (vlStyle, prefix = '') {
  const prefixKey = addPrefix(prefix)
  const keys = ['strokeColor', 'strokeWidth', 'strokeDash', 'strokeCap', 'strokeJoin'].map(prefixKey)
  const compiledKey = prefixKey('stroke')

  if (vlStyle[compiledKey] instanceof Stroke) return vlStyle[compiledKey]

  const strokeStyle = reduce(vlStyle, (style, value, name) => {
    if (keys.includes(name) === false) {
      return style
    }
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
      value = normalizeColor(value)
    }
    style[name] = value
    return style
  }, {})

  if (!isEmpty(strokeStyle)) {
    return new Stroke(strokeStyle)
  }
}

/**
 * @param {VlStyle} vlStyle
 * @returns {ol.style.Image|undefined}
 * @todo split to separate circle, regShape, Icon
 */
export function createImageStyle (vlStyle) {
  if (
    isEmpty(vlStyle.imageSrc) &&
    isEmpty(vlStyle.image) &&
    isEmpty(vlStyle.imagePoints) &&
    !isNumeric(vlStyle.imageRadius)
  ) {
    return
  }

  if (vlStyle.image instanceof ImageStyle) return vlStyle.image

  let imageStyle, Ctor

  if (!isEmpty(vlStyle.imageSrc) || !isEmpty(vlStyle.image)) {
    // icon construction
    Ctor = Icon
    // then create Icon options
    imageStyle = {
      ...vlStyle,
      anchor: vlStyle.imageAnchor,
      anchorOrigin: vlStyle.imageAnchorOrigin,
      color: vlStyle.imageColor,
      offset: vlStyle.imageOffset,
      offsetOrigin: vlStyle.imageOffsetOrigin,
      opacity: vlStyle.imageOpacity,
      scale: vlStyle.imageScale,
      rotation: vlStyle.imageRotation,
      size: vlStyle.imageSize,
      img: vlStyle.image,
      imgSize: vlStyle.imageImgSize,
      src: vlStyle.imageSrc,
      crossOrigin: vlStyle.imageCrossOrigin,
    }
  } else if (vlStyle.imagePoints != null) {
    // regular shape construction
    Ctor = RegularShape
    // create RegularShape options
    imageStyle = {
      ...vlStyle,
      points: vlStyle.imagePoints,
      radius: vlStyle.imageRadius,
      radius1: vlStyle.imageRadius1,
      radius2: vlStyle.imageRadius2,
      angle: vlStyle.imageAngle,
      rotation: vlStyle.imageRotation,
    }
  } else {
    // circle construction
    Ctor = Circle
    // create Circle options
    imageStyle = {
      ...vlStyle,
      radius: vlStyle.imageRadius,
    }
  }

  imageStyle = {
    ...imageStyle,
    fill: createFillStyle(vlStyle, 'image') || createFillStyle(vlStyle),
    stroke: createStrokeStyle(vlStyle, 'image') || createStrokeStyle(vlStyle),
    snapToPixel: true,
  }

  if (!isEmpty(imageStyle)) {
    return new Ctor(imageStyle)
  }
}

/**
 * @param {VlStyle} vlStyle
 * @returns {ol.style.Text|undefined}
 */
export function createTextStyle (vlStyle) {
  // noinspection JSValidateTypes
  if (vlStyle.text == null) return
  if (vlStyle.text instanceof Text) return vlStyle.text

  const textStyle = {
    text: vlStyle.text,
  }

  let fontSize = vlStyle.textFontSize ? vlStyle.textFontSize + 'px' : undefined
  let font = ['normal', fontSize, vlStyle.textFont].filter(x => !!x).join(' ')

  Object.assign(
    textStyle,
    pick(['textAlign', 'textBaseline'], vlStyle),
    {
      font,
      fill: createFillStyle(vlStyle, 'text') || createFillStyle(vlStyle),
      stroke: createStrokeStyle(vlStyle, 'text') || createStrokeStyle(vlStyle),
      scale: vlStyle.textScale,
      rotation: vlStyle.textRotation,
      offsetX: vlStyle.textOffsetX,
      offsetY: vlStyle.textOffsetY,
      rotateWithView: vlStyle.textRotateWithView,
      padding: vlStyle.textPadding,
      maxAngle: vlStyle.textMaxAngle,
      overflow: vlStyle.textOverflow,
      placement: vlStyle.textPlacement,
      backgroundFill: createFillStyle(vlStyle, 'textBackground'),
      backgroundStroke: createStrokeStyle(vlStyle, 'textBackground'),
    }
  )

  if (!isEmpty(textStyle)) {
    return new Text(textStyle)
  }
}

/**
 * @param {VlStyle} vlStyle
 * @return {ol.geom.Geometry|ol.StyleGeometryFunction|undefined}
 */
export function createGeomStyle (vlStyle) {
  if (isFunction(vlStyle.geom)) {
    return function __styleGeomFunc (feature) {
      return vlStyle.geom(feature, geomHelper)
    }
  }

  return vlStyle.geom
}

/**
 * @typedef {ol.style.Style|ol.style.Image|ol.style.Fill|ol.style.Stroke|ol.style.Text|ol.StyleFunction} OlStyle
 */

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
 * @property {ol.style.Fill|undefined} fill
 * @property {ol.style.Stroke|undefined} stroke
 *
 * Text only
 * @property {string|ol.style.Text|undefined} text
 * @property {string|undefined} textFont
 * @property {number|undefined} textFontSize
 * @property {string|number[]|undefined} textFillColor
 * @property {string|number[]|undefined} textStrokeColor
 * @property {number|undefined} textStrokeWidth
 * @property {number[]|undefined} textStrokeDash
 * @property {string|undefined} textStrokeCap
 * @property {string|undefined} textStrokeJoin
 * @property {number|undefined} textScale
 * @property {string|undefined} textAlign
 * @property {number|undefined} textRotation
 * @property {number|undefined} textOffsetX
 * @property {number|undefined} textOffsetY
 * @property {ol.style.Stroke|undefined} textStroke
 * @property {ol.style.Fill|undefined} textFill
 * @property {boolean|undefined} textRotateWithView
 * @property {number[]|undefined} textPadding
 * @property {number|undefined} textMaxAngle
 * @property {boolean|undefined} textOverflow
 * @property {string|undefined} textPlacement
 * @property {string|undefined} textBaseline
 * @property {ol.style.Fill|undefined} textBackgroundFillColor
 * @property {ol.style.Stroke|undefined} textBackgroundStrokeColor
 * @property {ol.style.Stroke|undefined} textBackgroundStrokeWidth
 * @property {ol.style.Stroke|undefined} textBackgroundStrokeDash
 * @property {ol.style.Stroke|undefined} textBackgroundStrokeCap
 * @property {ol.style.Stroke|undefined} textBackgroundStrokeJoin
 *
 * Image only
 * @property {ol.style.Image|undefined} image
 * @property {string|undefined} imageSrc
 * @property {number[]|undefined} imageSize
 * @property {number[]|undefined} imageImgSize
 * @property {number|undefined} imageOffset
 * @property {number[]|undefined} imageAnchor
 * @property {number|undefined} imageScale
 * @property {number|undefined} imageRotation
 * @property {number|undefined} imageRadius
 * @property {number|undefined} imageRadius1
 * @property {number|undefined} imageRadius2
 * @property {number|undefined} imagePoints
 * @property {number|undefined} imageAngle
 * @property {number|undefined} imageOpacity
 * @property {string|number[]|undefined} imageFillColor
 * @property {string|number[]|undefined} imageStrokeColor
 * @property {number|undefined} imageStrokeWidth
 * @property {number[]|undefined} imageStrokeDash
 * @property {string|undefined} imageStrokeCap
 * @property {string|undefined} imageStrokeJoin
 * @property {IconOrigin|undefined} imageAnchorOrigin
 * @property {ColorLike|undefined} imageColor
 * @property {IconOrigin|undefined} imageOffsetOrigin
 * @property {ol.style.Stroke|undefined} imageStroke
 * @property {ol.style.Fill|undefined} imageFill
 * @property {string|undefined} imageCrossOrigin
 *
 * @property {ol.geom.Geometry|ol.StyleGeometryFunction|undefined} geom Coordinates should be in map projection
 */
