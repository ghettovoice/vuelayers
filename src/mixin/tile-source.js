import { get as getProj } from 'ol/proj'
import { EPSG_3857 } from '../ol-ext'
import { isFunction, isString, pick } from '../util/minilo'
import { makeWatchers } from '../util/vue-helpers'
import source from './source'

export default {
  mixins: [
    source,
  ],
  props: {
    // ol/source/Tile
    /**
     * @type {number|undefined}
     */
    cacheSize: Number,
    /**
     * @type {boolean|undefined}
     */
    opaque: Boolean,
    /**
     * @type {number}
     */
    tilePixelRatio: {
      type: Number,
      default: 1,
    },
    /**
     * @type {string}
     */
    projection: {
      type: String,
      default: EPSG_3857,
    },
    /**
     * @type {function|undefined}
     */
    tileGridFactory: Function,
    /**
     * @type {number}
     */
    transition: Number,
    /**
     * @type {string|undefined}
     */
    tileKey: String,
    /**
     * @type {number}
     */
    zDirection: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    /**
     * @returns {module:ol/tilegrid/TileGrid|undefined}
     */
    tileGrid () {
      if (!isFunction(this.tileGridFactory)) return

      return Object.seal(this.tileGridFactory())
    },
  },
  watch: {
    async opaque (value) {
      if (value === await this.getSourceOpaque()) return

      this.scheduleRecreate()
    },
    async tilePixelRatio (value) {
      if (value === await this.getSourceTilePixelRatio(value)) return

      this.scheduleRecreate()
    },
    async tileKey (value) {
      this.setSourceTileKey(value)
    },
    ...makeWatchers([
      'cacheSize',
      'transition',
      'zDirection',
    ], () => source.methods.scheduleRecreate),
  },
  methods: {
    /**
     * @param {module:ol/proj.ProjectionLike} projection
     * @param {number} z
     * @param {module:ol/TileRange~TileRange} tileRange
     * @param {function} callback
     * @returns {Promise<boolean>}
     */
    async forEachLoadedSourceTile (projection, z, tileRange, callback) {
      if (isString(projection)) {
        projection = getProj(projection)
      }

      return (await this.resolveSource()).forEachLoadedTile(projection, z, tileRange, callback)
    },
    /**
     * @param {module:ol/proj.ProjectionLike} projection
     * @returns {Promise<number>}
     */
    async getSourceGutterForProjection (projection) {
      if (isString(projection)) {
        projection = getProj(projection)
      }

      return (await this.resolveSource()).getGutterForProjection(projection)
    },
    /**
     * @returns {Promise<string|undefined>}
     */
    async getSourceTileKey () {
      return (await this.resolveSource()).getKey()
    },
    /**
     * @param {string|undefined} key
     * @returns {Promise<void>}
     */
    async setSourceTileKey (key) {
      const source = await this.resolveSource()

      if (key === source.getKey(key)) return

      source.setKey(key)
    },
    /**
     * @returns {Promise<boolean>}
     */
    async getSourceOpaque () {
      return (await this.resolveSource()).getOpaque()
    },
    /**
     * @param {number} z
     * @param {number} x
     * @param {number} y
     * @param {number} pixelRatio
     * @param {module:ol/proj.ProjectionLike} projection
     * @returns {Promise<module:ol/Tile~Tile>}
     */
    async getSourceTile (z, x, y, pixelRatio, projection) {
      if (isString(projection)) {
        projection = getProj(projection)
      }

      return (await this.resolveSource()).getTile(z, x, y, pixelRatio, projection)
    },
    /**
     * @returns {Promise<module:ol/tilegrid/TileGrid~TileGrid>}
     */
    async getSourceTileGrid () {
      return (await this.resolveSource()).getTileGrid()
    },
    /**
     * @param {module:ol/proj.ProjectionLike} projection
     * @returns {Promise<module:ol/tilegrid/TileGrid~TileGrid>}
     */
    async getSourceTileGridForProjection (projection) {
      if (isString(projection)) {
        projection = getProj(projection)
      }

      return (await this.resolveSource()).getTileGridForProjection(projection)
    },
    /**
     * @param {module:ol/proj.ProjectionLike} projection
     * @returns {Promise<module:ol/TileCache~TileCache>}
     */
    async getSourceTileCacheForProjection (projection) {
      if (isString(projection)) {
        projection = getProj(projection)
      }

      return (await this.resolveSource()).getTileCacheForProjection(projection)
    },
    /**
     * @param {number} pixelRatio
     * @returns {Promise<number>}
     */
    async getSourceTilePixelRatio (pixelRatio) {
      return (await this.resolveSource()).getTilePixelRatio(pixelRatio)
    },
    /**
     * @param {number} z
     * @param {number} pixelRatio
     * @param {module:ol/proj.ProjectionLike} projection
     * @returns {Promise<number[]>}
     */
    async getSourceTilePixelSize (z, pixelRatio, projection) {
      if (isString(projection)) {
        projection = getProj(projection)
      }

      return (await this.resolveSource()).getTilePixelSize(z, pixelRatio, projection)
    },
    /**
     * @param {number[]} tileCoord
     * @param {module:ol/proj.ProjectionLike} projection
     * @returns {Promise<number[]>}
     */
    async getSourceTileCoordForTileUrlFunction (tileCoord, projection) {
      if (isString(projection)) {
        projection = getProj(projection)
      }

      return (await this.resolveSource()).getTileCoordForTileUrlFunction(tileCoord, projection)
    },
    ...pick(source.methods, [
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
