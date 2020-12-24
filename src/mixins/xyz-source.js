import { createTileUrlFunctionFromTemplates } from 'ol-tilecache'
import { XYZ as XYZSource } from 'ol/source'
import { createXYZ } from 'ol/tilegrid'
import { EPSG_3857, extentFromProjection } from '../ol-ext'
import { and, coalesce, isArray, isFunction, isNumber, noop, or } from '../utils'
import source from './source'
import tileImageSource from './tile-image-source'

const validateMinZoom = value => value >= 0
const validateTileSize = /*#__PURE__*/or(isNumber, and(isArray, value => value.length === 2 && value.every(isNumber)))
/**
 * Base XYZ source mixin.
 */
export default {
  mixins: [
    tileImageSource,
  ],
  props: {
    /* eslint-disable vue/require-prop-types */
    // ol/source/Source
    projection: {
      ...source.props.projection,
      default: EPSG_3857,
    },
    /* eslint-enable vue/require-prop-types */
    // ol/source/XYZ
    maxZoom: {
      type: Number,
      default: 42,
    },
    minZoom: {
      type: Number,
      default: 0,
      validator: validateMinZoom,
    },
    maxResolution: Number,
    tileSize: {
      type: [Number, Array],
      default: () => [256, 256],
      validator: validateTileSize,
    },
  },
  computed: {
    inputTileSize () {
      return isArray(this.tileSize) ? this.tileSize.slice() : [this.tileSize, this.tileSize]
    },
    derivedTileGridFactory () {
      if (isFunction(this.tileGridFactory)) {
        return this.tileGridFactory
      }

      const extent = extentFromProjection(this.resolvedDataProjection)
      const maxZoom = this.maxZoom
      const minZoom = this.minZoom
      const maxResolution = this.maxResolution
      const tileSize = this.inputTileSize

      return () => createXYZ({ extent, maxZoom, minZoom, maxResolution, tileSize })
    },
    inputTileUrlFunction () {
      const urlFunc = coalesce(this.tileUrlFunction, this.tileUrlFunc)
      if (isFunction(urlFunc)) return urlFunc
      if (this.currentUrls.length === 0) return

      return createTileUrlFunctionFromTemplates(this.currentUrls, this.tileGrid)
    },
  },
  methods: {
    /**
     * @return {module:ol/source/XYZ~XYZSource}
     * @protected
     */
    createSource () {
      return new XYZSource({
        // ol/source/Source
        attributions: this.currentAttributions,
        attributionsCollapsible: this.attributionsCollapsible,
        projection: this.resolvedDataProjection,
        wrapX: this.wrapX,
        // ol/source/Tile
        cacheSize: this.cacheSize,
        opaque: this.opaque,
        tilePixelRatio: this.tilePixelRatio,
        transition: this.transition,
        zDirection: this.zDirection,
        tileGrid: this.tileGrid,
        // ol/source/UrlTile
        tileLoadFunction: this.currentTileLoadFunction,
        tileUrlFunction: this.currentTileUrlFunction,
        // ol/source/TileImage
        crossOrigin: this.crossOrigin,
        reprojectionErrorThreshold: this.reprojectionErrorThreshold,
        tileClass: this.tileClass,
        imageSmoothing: this.imageSmoothing,
      })
    },
    tileKeyChanged: noop, // input tileKey is not allowed in XYZ constructor
    stateChanged: noop, // input state is not allowed in XYZ constructor
  },
}
