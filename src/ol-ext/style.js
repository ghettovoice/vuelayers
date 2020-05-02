import { Geometry } from 'ol/geom'
import GeometryType from 'ol/geom/GeometryType'
import { Circle, Fill, Icon, Image as ImageStyle, RegularShape, Stroke, Style, Text } from 'ol/style'
import parseColor from 'parse-color'
import { v4 as uuid } from 'uuid'
import { addPrefix, filter, identity, isArray, isFunction, isNumeric, reduce } from '../util/minilo'

function isStyle (style) {
  return style instanceof Style ||
    style instanceof ImageStyle ||
    style instanceof Fill ||
    style instanceof Stroke ||
    style instanceof Text ||
    style instanceof Function
}

export function getStyleId (style) {
  if (isStyle(style)) {
    return style.id
  }

  throw new Error('Illegal style argument')
}

export function setStyleId (style, styleId) {
  if (isStyle(style)) {
    style.id = styleId

    return style
  }

  throw new Error('Illegal style argument')
}

export function initializeStyle (style, defaultStyleId) {
  if (getStyleId(style) == null) {
    setStyleId(style, defaultStyleId || uuid())
  }

  return style
}

/**
 * @return {VlStyle[]}
 */
export function defaultStyle () {
  return [
    {
      fillColor: [255, 255, 255, 0.4],
      strokeColor: '#3399cc',
      strokeWidth: 1.25,
      imageRadius: 5,
    },
  ]
}

/**
 * @return {Object<GeometryType, VlStyle[]>}
 */
export function defaultEditStyle () {
  /** @type {Object<GeometryType, VlStyle[]>} */
  const styles = {}
  const white = [255, 255, 255, 1]
  const blue = [0, 153, 255, 1]
  const width = 3

  styles[GeometryType.LINE_STRING] = [
    {
      strokeColor: white,
      strokeWidth: width + 2,
    }, {
      strokeColor: blue,
      strokeWidth: width,
    },
  ]
  styles[GeometryType.MULTI_LINE_STRING] = styles[GeometryType.LINE_STRING]

  styles[GeometryType.POLYGON] = [
    {
      fillColor: [255, 255, 255, 0.5],
    },
  ].concat(styles[GeometryType.LINE_STRING])
  styles[GeometryType.MULTI_POLYGON] = styles[GeometryType.POLYGON]

  styles[GeometryType.CIRCLE] = styles[GeometryType.POLYGON].concat(styles[GeometryType.LINE_STRING])

  styles[GeometryType.POINT] = [
    {
      imageRadius: width * 2,
      fillColor: blue,
      strokeColor: white,
      strokeWidth: width / 2,
      zIndex: Infinity,
    },
  ]
  styles[GeometryType.MULTI_POINT] = styles[GeometryType.POINT]

  styles[GeometryType.GEOMETRY_COLLECTION] = styles[GeometryType.POLYGON].concat(
    styles[GeometryType.LINE_STRING],
    styles[GeometryType.POINT],
  )

  return styles
}

const isEmpty = x => {
  if (x == null) return true
  if (typeof x === 'number') return false

  return ((typeof x === 'string' || Array.isArray(x)) && !x.length) || !Object.keys(x).length
}

/**
 * @param {VlStyle} vlStyle
 * @param {function} [geomReader=identity]
 * @return {Style|undefined}
 */
export function createStyle (vlStyle, geomReader = identity) {
  if (isEmpty(vlStyle)) return

  const olStyle = {
    text: createTextStyle(vlStyle, 'text'),
    fill: createFillStyle(vlStyle, 'fill'),
    stroke: createStrokeStyle(vlStyle, 'stroke'),
    image: createImageStyle(vlStyle, 'image'),
    geometry: createGeomStyle(vlStyle, geomReader),
    zIndex: vlStyle.zIndex,
    renderer: vlStyle.renderer,
  }

  if (!isEmpty(olStyle)) {
    return new Style(olStyle)
  }
}

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
 * @returns {Fill|undefined}
 */
export function createFillStyle (vlStyle, prefix = '') {
  const prefixKey = addPrefix(prefix)
  // check on already compiled style existence
  if (vlStyle[prefixKey()] instanceof Fill) return vlStyle[prefixKey()]

  const keys = [
    'color',
  ].reduce((keys, key) => ({
    ...keys,
    [prefixKey(key)]: key,
  }), {})
  const fillStyle = reduce(vlStyle, (style, value, name) => {
    if (!keys[name] || value == null) return style

    switch (keys[name]) {
      case 'color':
        value = normalizeColor(value)
        break
    }

    style[keys[name]] = value

    return style
  }, {})

  if (!isEmpty(fillStyle)) {
    return new Fill(fillStyle)
  }
}

/**
 * @param {VlStyle} vlStyle
 * @param {string} [prefix]
 * @returns {Stroke|undefined}
 */
export function createStrokeStyle (vlStyle, prefix = '') {
  const prefixKey = addPrefix(prefix)
  if (vlStyle[prefixKey()] instanceof Stroke) return vlStyle[prefixKey()]

  const keys = [
    'color',
    'width',
    'miterLimit',
    'lineCap',
    'lineJoin',
    'lineDash',
    'lineDashOffset',
  ].reduce((keys, key) => ({
    ...keys,
    [prefixKey(key)]: key,
  }), {})
  const strokeStyle = reduce(vlStyle, (style, value, name) => {
    if (!keys[name] || value == null) return style

    switch (keys[name]) {
      case 'color':
        value = normalizeColor(value)
        break
    }

    style[keys[name]] = value

    return style
  }, {})

  if (!isEmpty(strokeStyle)) {
    return new Stroke(strokeStyle)
  }
}

/**
 * @param {VlStyle} vlStyle
 * @param {string} [prefix]
 * @returns {Image|undefined}
 * @todo split to separate circle, regShape, Icon
 */
export function createImageStyle (vlStyle, prefix = '') {
  const prefixKey = addPrefix(prefix)

  if (
    isEmpty(vlStyle[prefixKey('src')]) &&
    isEmpty(vlStyle.image) &&
    isEmpty(vlStyle[prefixKey('points')]) &&
    !isNumeric(vlStyle[prefixKey('radius')])
  ) {
    return
  }

  if (vlStyle.image instanceof ImageStyle) return vlStyle.image

  let imageStyle, Ctor

  if (!isEmpty(vlStyle[prefixKey('src')]) || !isEmpty(vlStyle.image)) {
    // icon construction
    Ctor = Icon
    // then create Icon options
    imageStyle = {
      anchor: vlStyle[prefixKey('anchor')],
      anchorOrigin: vlStyle[prefixKey('anchorOrigin')],
      anchorXUnits: vlStyle[prefixKey('anchorXUnits')],
      anchorYUnits: vlStyle[prefixKey('anchorYUnits')],
      color: vlStyle[prefixKey('color')],
      offset: vlStyle[prefixKey('offset')],
      offsetOrigin: vlStyle[prefixKey('offsetOrigin')],
      size: vlStyle[prefixKey('size')],
      img: vlStyle.image,
      imgSize: vlStyle[prefixKey('imgSize')],
      src: vlStyle[prefixKey('src')],
      crossOrigin: vlStyle[prefixKey('crossOrigin')],
    }
  } else if (vlStyle[prefixKey('points')] != null) {
    // regular shape construction
    Ctor = RegularShape
    // create RegularShape options
    imageStyle = {
      points: vlStyle[prefixKey('points')],
      radius: vlStyle[prefixKey('radius')],
      radius1: vlStyle[prefixKey('radius1')],
      radius2: vlStyle[prefixKey('radius2')],
      angle: vlStyle[prefixKey('angle')],
    }
  } else {
    // circle construction
    Ctor = Circle
    // create Circle options
    imageStyle = {
      radius: vlStyle[prefixKey('radius')],
    }
  }

  imageStyle = {
    ...imageStyle,
    fill: createFillStyle(vlStyle, prefixKey('fill')),
    stroke: createStrokeStyle(vlStyle, prefixKey('stroke')),
    opacity: vlStyle[prefixKey('opacity')],
    scale: vlStyle[prefixKey('scale')],
    rotation: vlStyle[prefixKey('rotation')],
    rotateWithView: vlStyle[prefixKey('rotateWithView')],
    displacement: vlStyle[prefixKey('displacement')],
  }

  if (!isEmpty(imageStyle)) {
    return new Ctor(imageStyle)
  }
}

/**
 * @param {VlStyle} vlStyle
 * @param {string} [prefix]
 * @returns {Text|undefined}
 */
export function createTextStyle (vlStyle, prefix = '') {
  if (vlStyle.text == null) return
  if (vlStyle.text instanceof Text) return vlStyle.text

  const prefixKey = addPrefix(prefix)
  const textStyle = {
    text: vlStyle.text,
    textAlign: vlStyle.textAlign,
    textBaseline: vlStyle.textBaseline,
    font: vlStyle[prefixKey('font')],
    scale: vlStyle[prefixKey('scale')],
    offsetX: vlStyle[prefixKey('offsetX')],
    offsetY: vlStyle[prefixKey('offsetY')],
    rotation: vlStyle[prefixKey('rotation')],
    rotateWithView: vlStyle[prefixKey('rotateWithView')],
    padding: vlStyle[prefixKey('padding')],
    maxAngle: vlStyle[prefixKey('maxAngle')],
    overflow: vlStyle[prefixKey('overflow')],
    placement: vlStyle[prefixKey('placement')],
    fill: createFillStyle(vlStyle, prefixKey('fill')),
    stroke: createStrokeStyle(vlStyle, prefixKey('stroke')),
    backgroundFill: createFillStyle(vlStyle, prefixKey('backgroundFill')),
    backgroundStroke: createStrokeStyle(vlStyle, prefixKey('backgroundStroke')),
  }

  if (!isEmpty(textStyle)) {
    return new Text(textStyle)
  }
}

/**
 * @param {VlStyle} vlStyle
 * @param {function} [geomReader=identity]
 * @return {Geometry|Object|function|undefined}
 */
export function createGeomStyle (vlStyle, geomReader = identity) {
  if (isFunction(vlStyle.geom)) {
    return function __styleGeomFunc (feature) {
      return vlStyle.geom(feature)
    }
  }
  if (vlStyle.geom instanceof Geometry) {
    return vlStyle.geom
  }
  if (vlStyle.geom) {
    return geomReader(vlStyle.geom)
  }
  return null
}

export function dumpStyle (olStyle, geomWriter = identity) {
  if (!olStyle || isFunction(olStyle)) return

  return {
    ...dumpFillStyle(olStyle.getFill(), 'fill'),
    ...dumpStrokeStyle(olStyle.getStroke(), 'stroke'),
    ...dumpImageStyle(olStyle.getImage(), 'image'),
    ...dumpTextStyle(olStyle.getText(), 'text'),
    ...dumpGeomStyle(olStyle.getGeometry(), geomWriter),
    zIndex: olStyle.getZIndex(),
    // renderer: olStyle.getRenderer(),
  }
}

export function dumpFillStyle (fillStyle, prefix = '') {
  if (!fillStyle) return {}

  const prefixKey = addPrefix(prefix)

  return {
    [prefixKey('color')]: fillStyle.getColor(),
  }
}

export function dumpStrokeStyle (strokeStyle, prefix = '') {
  if (!strokeStyle) return {}

  const prefixKey = addPrefix(prefix)

  return {
    [prefixKey('color')]: strokeStyle.getColor(),
    [prefixKey('width')]: strokeStyle.getWidth(),
    [prefixKey('miterLimit')]: strokeStyle.getMiterLimit(),
    [prefixKey('lineCap')]: strokeStyle.getLineCap(),
    [prefixKey('lineJoin')]: strokeStyle.getLineJoin(),
    [prefixKey('lineDash')]: strokeStyle.getLineDash(),
    [prefixKey('lineDashOffset')]: strokeStyle.getLineDashOffset(),
  }
}

export function dumpImageStyle (imageStyle, prefix = '') {
  if (!imageStyle) return {}

  const prefixKey = addPrefix(prefix)
  const common = {
    [prefixKey('opacity')]: imageStyle.getOpacity(),
    [prefixKey('scale')]: imageStyle.getScale(),
    [prefixKey('rotation')]: imageStyle.getRotation(),
    [prefixKey('rotateWithView')]: imageStyle.getRotateWithView(),
    [prefixKey('displacement')]: imageStyle.getDisplacement(),
  }

  switch (true) {
    case imageStyle instanceof Icon:
      return {
        ...common,
        // fixme avoid using of internal fields, but currently Icon haven't getters for several fields
        [prefixKey('anchor')]: imageStyle.anchor_.slice(),
        [prefixKey('anchorOrigin')]: imageStyle.anchorOrigin_,
        [prefixKey('anchorXUnits')]: imageStyle.anchorXUnits_,
        [prefixKey('anchorYUnits')]: imageStyle.anchorYUnits_,
        [prefixKey('color')]: isArray(imageStyle.getColor()) ? imageStyle.getColor().slice() : imageStyle.getColor(),
        [prefixKey('offset')]: imageStyle.offset_.slice(),
        [prefixKey('offsetOrigin')]: imageStyle.offsetOrigin_,
        [prefixKey('size')]: isArray(imageStyle.getSize()) ? imageStyle.getSize().slice() : imageStyle.getSize(),
        [prefixKey('src')]: imageStyle.getSrc(),
        [prefixKey('crossOrigin')]: imageStyle.crossOrigin_,
      }
    case imageStyle instanceof Circle:
      return {
        ...common,
        ...dumpFillStyle(imageStyle.getFill(), prefixKey('fill')),
        ...dumpStrokeStyle(imageStyle.getStroke(), prefixKey('stroke')),
        [prefixKey('radius')]: imageStyle.getRadius(),
      }
    case imageStyle instanceof RegularShape:
      return {
        ...common,
        ...dumpFillStyle(imageStyle.getFill(), prefixKey('fill')),
        ...dumpStrokeStyle(imageStyle.getStroke(), prefixKey('stroke')),
        [prefixKey('points')]: imageStyle.getPoints(),
        [prefixKey('radius')]: imageStyle.getRadius(),
        [prefixKey('radius2')]: imageStyle.getRadius2(),
        [prefixKey('angle')]: imageStyle.getAngle(),
      }
    default:
      return {
        ...common,
      }
  }
}

export function dumpTextStyle (textStyle, prefix = '') {
  if (!textStyle) return {}

  const prefixKey = addPrefix(prefix)

  return filter({
    text: textStyle.getText(),
    textAlign: textStyle.getTextAlign(),
    textBaseline: textStyle.getTextBaseline(),
    [prefixKey('font')]: textStyle.getFont(),
    [prefixKey('scale')]: textStyle.getScale(),
    [prefixKey('rotation')]: textStyle.getRotation(),
    [prefixKey('offsetX')]: textStyle.getOffsetX(),
    [prefixKey('offsetY')]: textStyle.getOffsetY(),
    [prefixKey('rotateWithView')]: textStyle.getRotateWithView(),
    [prefixKey('padding')]: textStyle.getPadding(),
    [prefixKey('maxAngle')]: textStyle.getMaxAngle(),
    [prefixKey('overflow')]: textStyle.getOverflow(),
    [prefixKey('placement')]: textStyle.getPlacement(),
    ...dumpFillStyle(textStyle.getFill(), prefixKey('fill')),
    ...dumpStrokeStyle(textStyle.getStroke(), prefixKey('stroke')),
    ...dumpFillStyle(textStyle.getBackgroundFill(), prefixKey('backgroundFill')),
    ...dumpStrokeStyle(textStyle.getBackgroundStroke(), prefixKey('backgroundStroke')),
  }, value => value != null)
}

export function dumpGeomStyle (geom, geomWriter = identity) {
  if (!geom) return {}

  return {
    geom: geomWriter(geom),
  }
}

/**
 * @typedef {
 *            module:ol/style/Style~Style |
 *            module:ol/style/Image~ImageStyle |
 *            module:ol/style/Fill~Fill |
 *            module:ol/style/Stroke~Stroke |
 *            module:ol/style/Text~Text |
 *            module:ol/style/Style~StyleFunction
 *          } OlAllStyle
 */

/**
 * @typedef {Object} VlStyle
 *
 * Shared
 * @property {string|number[]|undefined} fillColor
 * @property {string|number[]|undefined} strokeColor
 * @property {number|undefined} strokeWidth
 * @property {number|undefined} strokeMiterLimit
 * @property {number[]|undefined} strokeLineDash
 * @property {number|undefined} strokeLineDashOffset
 * @property {string|undefined} strokeLineCap
 * @property {string|undefined} strokeLineJoin
 * @property {number|undefined} zIndex
 * @property {Fill|undefined} fill
 * @property {Stroke|undefined} stroke
 * @property {RenderFunction|undefined} renderer
 *
 * Text only
 * @property {string|Text|undefined} text
 * @property {string|undefined} textFont
 * @property {number|string|undefined} textFontSize
 * @property {string|undefined} textFontWeight
 * @property {string|number[]|undefined} textFillColor
 * @property {string|number[]|undefined} textStrokeColor
 * @property {number|undefined} textStrokeWidth
 * @property {number|undefined} textStrokeMiterLimit
 * @property {number[]|undefined} textStrokeLineDash
 * @property {number|undefined} textStrokeLineDashOffset
 * @property {string|undefined} textStrokeLineCap
 * @property {string|undefined} textStrokeLineJoin
 * @property {number|undefined} textScale
 * @property {string|undefined} textAlign
 * @property {number|undefined} textRotation
 * @property {number|undefined} textOffsetX
 * @property {number|undefined} textOffsetY
 * @property {Stroke|undefined} textStroke
 * @property {Fill|undefined} textFill
 * @property {boolean|undefined} textRotateWithView
 * @property {number[]|undefined} textPadding
 * @property {number|undefined} textMaxAngle
 * @property {boolean|undefined} textOverflow
 * @property {string|undefined} textPlacement
 * @property {string|undefined} textBaseline
 * @property {Fill|undefined} textBackgroundFillColor
 * @property {Stroke|undefined} textBackgroundStrokeColor
 * @property {Stroke|undefined} textBackgroundStrokeWidth
 * @property {number|undefined} textBackgroundStrokeMiterLimit
 * @property {Stroke|undefined} textBackgroundStrokeLineDash
 * @property {number|undefined} textBackgroundStrokeLineDashOffset
 * @property {Stroke|undefined} textBackgroundStrokeCap
 * @property {Stroke|undefined} textBackgroundStrokeJoin
 *
 * Image only
 * @property {Image|undefined} image
 * @property {string|undefined} imageSrc
 * @property {number[]|undefined} imageSize
 * @property {number[]|undefined} imageImgSize
 * @property {number|undefined} imageOffset
 * @property {number[]|undefined} imageAnchor
 * @property {string|undefined} imageAnchorXUnits
 * @property {string|undefined} imageAnchorYUnits
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
 * @property {number|undefined} imageStrokeMiterLimit
 * @property {number[]|undefined} imageStrokeLineDash
 * @property {number|undefined} imageStrokeLineDashOffset
 * @property {string|undefined} imageStrokeLineCap
 * @property {string|undefined} imageStrokeLineJoin
 * @property {IconOrigin|undefined} imageAnchorOrigin
 * @property {ColorLike|undefined} imageColor
 * @property {IconOrigin|undefined} imageOffsetOrigin
 * @property {Stroke|undefined} imageStroke
 * @property {Fill|undefined} imageFill
 * @property {string|undefined} imageCrossOrigin
 * @property {boolean|undefined} imageRotateWithView
 * @property {number[]|undefined} imageDisplacement
 *
 * @property {Geometry|Object|function|undefined} geom Coordinates should be in map projection
 */
