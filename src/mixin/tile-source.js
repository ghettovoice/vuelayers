import debounce from 'debounce-promise'
import { get as getProj } from 'ol/proj'
import { EPSG_3857 } from '../ol-ext'
import { clonePlainObject, isFunction, isString, pick, sealFactory } from '../util/minilo'
import { makeWatchers } from '../util/vue-helpers'
import { FRAME_TIME } from './ol-cmp'
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
      validator: value => getProj(value) != null,
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
  data () {
    return {
      /**
       * @type {module:ol/tilegrid/TileGrid~TileGrid|undefined}
       */
      tileGrid: undefined,
    }
  },
  computed: {
    /**
     * @type {string|undefined}
     */
    tileGridIdent () {
      if (!this.olObjIdent) return

      return this.makeIdent(this.olObjIdent, 'tile_grid')
    },
    /**
     * @returns {function|undefined}
     */
    derivedTileGridFactory () {
      return this.tileGridFactory
    },
    /**
     * @returns {function|undefined}
     */
    sealTileGridFactory () {
      if (!isFunction(this.derivedTileGridFactory)) return

      return sealFactory(::this.derivedTileGridFactory)
    },
    currentTileKey () {
      if (this.rev && this.$source) {
        return this.getTileKeySync()
      }

      return this.tileKey
    },
    /**
     * @returns {number[]|undefined}
     */
    currentResolutions () {
      if (!(this.rev && this.$source && this.$source.getTileGrid())) return

      return this.$source.getResolutions()
    },
  },
  watch: {
    async tileKey (value) {
      await this.setTileKey(value)
    },
    currentTileKey: debounce(function (value) {
      if (value === this.tileKey) return

      this.$emit('update:tileKey', value)
    }, FRAME_TIME),
    currentResolutions: debounce(function (value) {
      this.$emit('update:resolutions', clonePlainObject(value))
    }, FRAME_TIME),
    tileGridIdent (value, prevValue) {
      if (value && prevValue) {
        this.moveInstance(value, prevValue)
      } else if (value && !prevValue && this.tileGrid) {
        this.setInstance(value, this.tileGrid)
      } else if (!value && prevValue) {
        this.unsetInstance(prevValue)
      }
    },
    async sealTileGridFactory (value) {
      while (this.hasInstance(this.tileGridIdent)) {
        this.unsetInstance(this.tileGridIdent)
      }

      if (isFunction(value)) {
        this.tileGrid = this.instanceFactoryCall(this.tileGridIdent, this::value)
      } else {
        this.tileGrid = undefined
      }

      if (process.env.VUELAYERS_DEBUG) {
        this.$logger.log('sealTileGridFactory changed, scheduling recreate...')
      }

      await this.scheduleRecreate()
    },
    async opaque (value) {
      if (value === await this.getOpaque()) return

      if (process.env.VUELAYERS_DEBUG) {
        this.$logger.log('opaque changed, scheduling recreate...')
      }

      await this.scheduleRecreate()
    },
    async tilePixelRatio (value) {
      if (value === await this.getTilePixelRatio(value)) return

      if (process.env.VUELAYERS_DEBUG) {
        this.$logger.log('tilePixelRatio changed, scheduling recreate...')
      }

      await this.scheduleRecreate()
    },
    ...makeWatchers([
      'cacheSize',
      'transition',
      'zDirection',
    ], prop => async function () {
      if (process.env.VUELAYERS_DEBUG) {
        this.$logger.log(`${prop} changed, scheduling recreate...`)
      }

      await this.scheduleRecreate()
    }),
  },
  created () {
    if (isFunction(this.sealTileGridFactory)) {
      this.tileGrid = this.instanceFactoryCall(this.tileGridIdent, ::this.sealTileGridFactory)
      // this.$watch('tileGrid', async () => {
      //   if (process.env.VUELAYERS_DEBUG) {
      //     this.$logger.log(`tilegrid changed, scheduling recreate...`)
      //   }
      //
      //   await this.scheduleRecreate()
      // })
    }
  },
  methods: {
    ...pick(source.methods, [
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
      'resolveOlObject',
      'resolveSource',
    ]),
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
      await this.resolveSource()

      return this.getTileKeySync()
    },
    getTileKeySync () {
      return this.$source.getKey()
    },
    /**
     * @param {string|undefined} key
     * @returns {Promise<void>}
     */
    async setTileKey (key) {
      await this.resolveSource()

      this.setTileKeySync(key)
    },
    setTileKeySync (key) {
      if (key === this.getTileKeySync()) return

      this.$source.setKey(key)
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
