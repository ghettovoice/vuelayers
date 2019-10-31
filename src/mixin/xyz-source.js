import { XYZ as XYZSource } from 'ol/source'
import { pick } from '../util/minilo'
import tileImageSource from './tile-image-source'

/**
 * Base XYZ source mixin.
 */
export default {
  mixins: [
    tileImageSource,
  ],
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
    ]),
  },
}
