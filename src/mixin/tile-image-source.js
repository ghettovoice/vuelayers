import { pick } from '../util/minilo'
import { makeWatchers } from '../util/vue-helpers'
import urlTileSource from './url-tile-source'

export default {
  mixins: [
    urlTileSource,
  ],
  props: {
    // ol/source/TileImage
    crossOrigin: String,
    reprojectionErrorThreshold: {
      type: Number,
      default: 0.5,
    },
    tileClass: String,
  },
  watch: {
    ...makeWatchers([
      'crossOrigin',
      'reprojectionErrorThreshold',
      'tileClass',
    ], () => urlTileSource.scheduleRecreate),
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
