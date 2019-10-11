import { get as getProj } from 'ol/proj'
import { EPSG_3857 } from '../ol-ext'
import { isEqual, isString } from '../util/minilo'
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
  watch: {
    opaque (value) {
      if (!this.$source || value === this.$source.getOpaque()) {
        return
      }

      this.scheduleRecreate()
    },
    tilePixelRatio (value) {
      if (!this.$source || value === this.$source.getOpaque()) {
        return
      }

      this.scheduleRecreate()
    },
    tileKey (value) {
      if (!this.$source || value === this.$source.getKey()) {
        return
      }

      this.$source.setKey(value)
    },
    tileLoadFunction (value, prevValue) {
      if (!this.$source || isEqual(value, prevValue)) return

      this.$source.setTileLoadFunction(value)
    },
    url () {
      if (!this.$source) return

      this.$source.setTileUrlFunction(this.createUrlFunc())
      this.scheduleRefresh()
    },
    ...makeWatchers([
      'cacheSize',
      'crossOrigin',
      'reprojectionErrorThreshold',
      'transition',
      'maxZoom',
      'minZoom',
      'tileSize',
    ], () => function () {
      this.scheduleRecreate()
    }),
  },
  methods: {
    /**
     * @returns {Promise<boolean>}
     */
    async canExpireCache () {
      return (await this.resolveSource()).canExpireCache()
    },
    /**
     * @param {module:ol/proj.ProjectionLike} projection
     * @param {module:ol/TileRange~TileRange} usedTiles
     * @returns {Promise<*|void>}
     */
    async expireCache (projection, usedTiles) {
      if (isString(projection)) {
        projection = getProj(projection)
      }

      (await this.resolveSource()).expireCache(projection, usedTiles)
    },
    /**
     * @param {module:ol/proj.ProjectionLike} projection
     * @param {number} z
     * @param {module:ol/TileRange~TileRange} tileRange
     * @param {function} callback
     * @returns {Promise<boolean>}
     */
    async forEachLoadedTile (projection, z, tileRange, callback) {
      if (isString(projection)) {
        projection = getProj(projection)
      }

      return (await this.resolveSource()).forEachLoadedTile(projection, z, tileRange, callback)
    },
    /**
     * @param {module:ol/proj.ProjectionLike} projection
     * @returns {Promise<number>}
     */
    async getGutterForProjection (projection) {
      if (isString(projection)) {
        projection = getProj(projection)
      }

      return (await this.resolveSource()).getGutterForProjection(projection)
    },
    /**
     * @returns {Promise<string|undefined>}
     */
    async getTileKey () {
      return (await this.resolveSource()).getKey()
    },
    /**
     * @param {string|undefined} key
     * @returns {Promise<void>}
     */
    async setTileKey (key) {
      const source = await this.resolveSource()

      if (key === source.getKey(key)) return

      source.setKey(key)
    },
    /**
     * @returns {Promise<boolean>}
     */
    async getOpaque () {
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
    async getTile (z, x, y, pixelRatio, projection) {
      if (isString(projection)) {
        projection = getProj(projection)
      }

      return (await this.resolveSource()).getTile(z, x, y, pixelRatio, projection)
    },
    /**
     * @returns {Promise<module:ol/tilegrid/TileGrid~TileGrid>}
     */
    async getTileGrid () {
      return (await this.resolveSource()).getTileGrid()
    },
    /**
     * @param {module:ol/proj.ProjectionLike} projection
     * @returns {Promise<module:ol/tilegrid/TileGrid~TileGrid>}
     */
    async getTileGridForProjection (projection) {
      if (isString(projection)) {
        projection = getProj(projection)
      }

      return (await this.resolveSource()).getTileGridForProjection(projection)
    },
    /**
     * @param {module:ol/proj.ProjectionLike} projection
     * @returns {Promise<module:ol/TileCache~TileCache>}
     */
    async getTileCacheForProjection (projection) {
      if (isString(projection)) {
        projection = getProj(projection)
      }

      return (await this.resolveSource()).getTileCacheForProjection(projection)
    },
    /**
     * @param {number} pixelRatio
     * @returns {Promise<number>}
     */
    async getTilePixelRatio (pixelRatio) {
      return (await this.resolveSource()).getTilePixelRatio(pixelRatio)
    },
    /**
     * @param {number} z
     * @param {number} pixelRatio
     * @param {module:ol/proj.ProjectionLike} projection
     * @returns {Promise<number[]>}
     */
    async getTilePixelSize (z, pixelRatio, projection) {
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
    async getTileCoordForTileUrlFunction (tileCoord, projection) {
      if (isString(projection)) {
        projection = getProj(projection)
      }

      return (await this.resolveSource()).getTileCoordForTileUrlFunction(tileCoord, projection)
    },
  },
}
