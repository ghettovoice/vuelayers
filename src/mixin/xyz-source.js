import { XYZ as XYZSource } from 'ol/source'
import { createXYZ, extentFromProjection } from 'ol/tilegrid'
import { isArray, isFunction, isNumber, pick } from '../util/minilo'
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
      default: 18,
    },
    minZoom: {
      type: Number,
      default: 0,
    },
    tileSize: {
      type: [Number, Array],
      default: () => [256, 256],
      validator: value => isNumber(value) ||
        (isArray(value) && value.length === 2 && value.every(isNumber)),
    },
  },
  computed: {
    derivedTileGridFactory () {
      if (isFunction(this.tileGridFactory)) {
        return this.tileGridFactory
      }

      const projection = this.projection
      const maxZoom = this.maxZoom
      const minZoom = this.minZoom
      const tileSize = this.tileSize

      return () => createXYZ({
        extent: extentFromProjection(projection),
        maxZoom: maxZoom,
        minZoom: minZoom,
        tileSize: tileSize,
      })
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
        attributions: this.attributions,
        attributionsCollapsible: this.attributionsCollapsible,
        projection: this.projection,
        wrapX: this.wrapX,
        // ol/source/Tile
        cacheSize: this.cacheSize,
        opaque: this.opaque,
        tilePixelRatio: this.tilePixelRatio,
        tileKey: this.tileKey,
        transition: this.transition,
        zDirection: this.zDirection,
        tileGrid: this.tileGrid,
        // ol/source/UrlTile
        tileLoadFunction: this.tileLoadFunction,
        tileUrlFunction: this.urlFunc,
        // ol/source/TileImage
        crossOrigin: this.crossOrigin,
        reprojectionErrorThreshold: this.reprojectionErrorThreshold,
        tileClass: this.tileClass,
      })
    },
    ...pick(tileImageSource.methods, [
      'init',
      'deinit',
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
