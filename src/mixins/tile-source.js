import { coalesce, isFunction, sealFactory } from '../utils'
import { makeChangeOrRecreateWatchers } from './ol-cmp'
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
    inputTileGridFactory () {
      if (!isFunction(this.derivedTileGridFactory)) return

      return sealFactory(::this.derivedTileGridFactory)
    },
    /**
     * @returns {string}
     */
    resolvedDataProjection () {
      return coalesce(
        this.projection,
        this.resolvedViewProjection,
      )
    },
  },
  watch: {
    rev () {
      if (!this.$source) return

      if (this.tileGrid !== this.$source.getTileGrid()) {
        this.tileGrid = this.$source.getTileGrid()
      }
    },
    .../*#__PURE__*/makeChangeOrRecreateWatchers([
      'tileGridIdent',
      'inputTileGridFactory',
      'tileGrid',
      'tileKey',
      'opaque',
      'tilePixelRatio',
      'cacheSize',
      'transition',
      'zDirection',
    ]),
  },
  created () {
    if (isFunction(this.inputTileGridFactory)) {
      this.tileGrid = this.instanceFactoryCall(this.tileGridIdent, ::this.inputTileGridFactory)
    }
  },
  methods: {
    /**
     * @protected
     */
    subscribeAll () {
      this::source.methods.subscribeAll()
    },
    /**
     * @returns {module:ol/tilegrid/TileGrid~TileGrid|undefined}
     */
    getTileGrid () {
      return coalesce(this.$source?.getTileGrid(), this.tileGrid)
    },
    /**
     * @param {string|undefined} value
     * @param {string|undefined} prevValue
     * @protected
     */
    tileGridIdentChanged (value, prevValue) {
      if (value && prevValue) {
        this.moveInstance(value, prevValue)
      } else if (value && !prevValue && this.tileGrid) {
        this.setInstance(value, this.tileGrid)
      } else if (!value && prevValue) {
        this.unsetInstance(prevValue)
      }
    },
    /**
     * @param {function|undefined} value
     * @return {Promise<void>}
     * @protected
     */
    inputTileGridFactoryChanged (value) {
      while (this.hasInstance(this.tileGridIdent)) {
        this.unsetInstance(this.tileGridIdent)
      }

      if (isFunction(value)) {
        this.tileGrid = this.instanceFactoryCall(this.tileGridIdent, this::value)
      } else {
        this.tileGrid = null
      }
    },
  },
}
