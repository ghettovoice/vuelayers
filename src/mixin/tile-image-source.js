import { pick } from '../util/minilo'
import { makeWatchers } from '../util/vue-helpers'
import urlTileSource from './url-tile-source'

/**
 * Base tile image source mixin.
 */
export default {
  mixins: [
    urlTileSource,
  ],
  props: {
    // ol/source/TileImage
    /**
     * @type {string|undefined}
     */
    crossOrigin: String,
    /**
     * @type {number|undefined}
     */
    reprojectionErrorThreshold: Number,
    /**
     * @type {string|undefined}
     */
    tileClass: String,
  },
  watch: {
    ...makeWatchers([
      'crossOrigin',
      'reprojectionErrorThreshold',
      'tileClass',
    ], () => urlTileSource.methods.scheduleRecreate),
  },
  methods: {
    ...pick(urlTileSource.methods, [
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
