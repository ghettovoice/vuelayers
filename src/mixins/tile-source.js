import debounce from 'debounce-promise'
import { get as getProj } from 'ol/proj'
import { EPSG_3857 } from '../ol-ext'
import { clonePlainObject, isFunction, pick, sealFactory, makeWatchers, isEqual } from '../utils'
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
    /**
     * @return {string|undefined}
     */
    currentTileKey () {
      if (this.rev && this.$source) {
        return this.getTileKeyInternal()
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
    currentTileKey: /*#__PURE__*/debounce(function (value) {
      if (value === this.tileKey) return

      this.$emit('update:tileKey', value)
    }, FRAME_TIME),
    currentResolutions: /*#__PURE__*/debounce(function (value) {
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
    .../*#__PURE__*/makeWatchers([
      'cacheSize',
      'transition',
      'zDirection',
    ], prop => async function (val, prev) {
      if (isEqual(val, prev)) return

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
    .../*#__PURE__*/pick(source.methods, [
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
     * @returns {Promise<string|undefined>}
     */
    async getTileKey () {
      await this.resolveSource()

      return this.getTileKeyInternal()
    },
    /**
     * @return {string|undefined}
     * @protected
     */
    getTileKeyInternal () {
      return this.$source.getKey()
    },
    /**
     * @param {string|undefined} key
     * @returns {Promise<void>}
     */
    async setTileKey (key) {
      if (key === await this.getTileKey()) return

      (await this.resolveSource()).setKey(key)
    },
    /**
     * @returns {Promise<boolean>}
     */
    async getOpaque () {
      return (await this.resolveSource()).getOpaque()
    },
    /**
     * @returns {module:ol/tilegrid/TileGrid~TileGrid|undefined}
     */
    getTileGrid () {
      return this.tileGrid
    },
  },
}
