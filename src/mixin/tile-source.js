import { createTileUrlFunction } from 'ol-tilecache'
import {
  CACHE_SIZE,
  EPSG_3857,
  MAX_ZOOM,
  MIN_ZOOM,
  PIXEL_RATIO,
  REPROJ_ERR_THRESHOLD,
  TILE_SIZE,
} from '../ol-ext/consts'
import { createExtentFromProjection } from '../ol-ext/extent'
import { createXyzGrid } from '../ol-ext/tile-grid'
import { isEqual, isFunction, isString, pick, replaceTokens } from '../util/minilo'
import { makeWatchers } from '../util/vue-helpers'
import source from './source'
import withUrl from './with-url'

export default {
  mixins: [source, withUrl],
  props: {
    cacheSize: {
      type: Number,
      default: CACHE_SIZE,
    },
    crossOrigin: String,
    maxZoom: {
      type: Number,
      default: MAX_ZOOM,
    },
    minZoom: {
      type: Number,
      default: MIN_ZOOM,
    },
    opaque: Boolean,
    projection: {
      type: String,
      default: EPSG_3857,
    },
    reprojectionErrorThreshold: {
      type: Number,
      default: REPROJ_ERR_THRESHOLD,
    },
    tilePixelRatio: {
      type: Number,
      default: PIXEL_RATIO,
    },
    tileSize: {
      type: Array,
      default: () => [TILE_SIZE, TILE_SIZE],
      validator: value => value.length === 2,
    },
    /**
     * @type {module:ol/Tile~LoadFunction}
     */
    tileLoadFunction: Function,
    tileKey: String,
    /**
     * URL template or custom tile URL function.
     * @type {string|module:ol/Tile~UrlFunction}
     */
    url: {
      type: [String, Function],
      required: true,
    },
    /**
     * Duration of the opacity transition for rendering. To disable the opacity transition, pass `0`.
     * @type {number}
     */
    transition: Number,
  },
  computed: {
    /**
     * @type {string}
     */
    urlTmpl () {
      if (!isString(this.url)) {
        return ''
      }

      return replaceTokens(this.url, pick(this, this.urlTokens))
    },
  },
  methods: {
    /**
     * @return {module:ol/tilegrid/TileGrid~TileGrid}
     * @protected
     */
    createTileGrid () {
      return createXyzGrid({
        extent: createExtentFromProjection(this.projection),
        maxZoom: this.maxZoom,
        minZoom: this.minZoom,
        tileSize: this.tileSize,
      })
    },
    /**
     * @return {module:ol/Tile~UrlFunction}
     * @protected
     */
    createUrlFunc () {
      // custom url function provided
      if (isFunction(this.url)) {
        return this.url
      }

      // or use url function from ol-tilecache
      return createTileUrlFunction(
        this.urlTmpl,
        this._tileGrid,
        createExtentFromProjection(this.projection),
      )
    },
    /**
     * @return {Promise}
     * @protected
     */
    init () {
      /**
       * @type {module:ol/Tile~UrlFunction}
       * @protected
       */
      this._tileGrid = this.createTileGrid()

      return this::source.methods.init()
    },
    /**
     * @return {void|Promise<void>}
     * @protected
     */
    deinit () {
      this._tileGrid = undefined

      return this::source.methods.deinit()
    },
    /**
     * @return {void}
     * @protected
     */
    mount () {
      this::source.methods.mount()
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      this::source.methods.mount()
    },
  },
  watch: {
    ...makeWatchers([
      'cacheSize',
      'crossOrigin',
      'opaque',
      'reprojectionErrorThreshold',
      'tilePixelRatio',
      'tileLoadFunction',
      'transition',
    ], () => function (value, prevValue) {
      if (isEqual(value, prevValue)) return

      this.scheduleRefresh()
    }),
    ...makeWatchers([
      'maxZoom',
      'minZoom',
      'tileSize',
    ], () => function (value, prevValue) {
      if (isEqual(value, prevValue) || !this.$source) return

      this._tileGrid = this.createTileGrid()
      this.$source.setTileGridForProjection(this.projection, this._tileGrid)
      this.$source.setTileUrlFunction(this.createUrlFunc())
      this.scheduleRefresh()
    }),
    tileLoadFunction (value, prevValue) {
      if (isEqual(value, prevValue) || !this.$source) return

      this.$source.setTileLoadFunction(value)
    },
    url () {
      if (!this.$source) return

      this.$source.setTileUrlFunction(this.createUrlFunc())
      this.scheduleRefresh()
    },
  },
}
