import { makeChangeOrRecreateWatchers } from './ol-cmp'
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
    /**
     * @type {boolean}
     */
    imageSmoothing: {
      type: Boolean,
      default: true,
    },
  },
  watch: {
    .../*#__PURE__*/makeChangeOrRecreateWatchers([
      'crossOrigin',
      'reprojectionErrorThreshold',
      'tileClass',
      'imageSmoothing',
    ]),
  },
  methods: {
    async setRenderReprojectionEdges (render) {
      (await this.resolveSource()).setRenderReprojectionEdges(render)
    },
  },
}
