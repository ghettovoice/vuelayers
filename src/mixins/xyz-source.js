import { createTileUrlFunctionFromTemplates } from 'ol-tilecache'
import { XYZ as XYZSource } from 'ol/source'
import { createXYZ } from 'ol/tilegrid'
import { extentFromProjection } from '../ol-ext'
import { isArray, isFunction, isNumber, pick } from '../utils'
import tileImageSource from './tile-image-source'

/**
 * Base XYZ source mixin.
 */
export default {
  mixins: [
    tileImageSource,
  ],
  props: {
    // ol/source/XYZ
    maxZoom: {
      type: Number,
      default: 42,
    },
    minZoom: {
      type: Number,
      default: 0,
      validator: value => value >= 0,
    },
    maxResolution: Number,
    tileSize: {
      type: [Number, Array],
      default: () => [256, 256],
      validator: value => isNumber(value) ||
        (isArray(value) && value.length === 2 && value.every(isNumber)),
    },
  },
  computed: {
    tileSizeArr () {
      return isArray(this.tileSize) ? this.tileSize : [this.tileSize, this.tileSize]
    },
    derivedTileGridFactory () {
      if (isFunction(this.tileGridFactory)) {
        return this.tileGridFactory
      }

      const extent = extentFromProjection(this.projection)
      const maxZoom = this.maxZoom
      const minZoom = this.minZoom
      const maxResolution = this.maxResolution
      const tileSize = this.tileSizeArr

      return () => createXYZ({ extent, maxZoom, minZoom, maxResolution, tileSize })
    },
    resolvedTileUrlFunc () {
      if (isFunction(this.tileUrlFunc)) {
        return this.tileUrlFunc
      }
      if (this.expandedUrls.length === 0) return

      return createTileUrlFunctionFromTemplates(this.expandedUrls, this.tileGrid)
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
        projection: this.projection,
        wrapX: this.wrapX,
        // ol/source/Tile
        cacheSize: this.cacheSize,
        opaque: this.opaque,
        tilePixelRatio: this.tilePixelRatio,
        transition: this.transition,
        zDirection: this.zDirection,
        tileGrid: this.tileGrid,
        // ol/source/UrlTile
        tileLoadFunction: this.resolvedTileLoadFunc,
        tileUrlFunction: this.resolvedTileUrlFunc,
        // ol/source/TileImage
        crossOrigin: this.crossOrigin,
        reprojectionErrorThreshold: this.reprojectionErrorThreshold,
        tileClass: this.tileClass,
      })
    },
    .../*#__PURE__*/pick(tileImageSource.methods, [
      'beforeInit',
      'init',
      'deinit',
      'beforeMount',
      'mount',
      'unmount',
      'refresh',
      'scheduleRefresh',
      'remount',
      'scheduleRemount',
      'recreate',
      'scheduleRecreate',
      'getServices',
      'subscribeAll',
      'resolveSource',
      'resolveOlObject',
    ]),
  },
}
