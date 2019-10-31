import { createTileUrlFunction } from 'ol-tilecache'
import {
  CACHE_SIZE,
  createExtentFromProjection,
  createXyzGrid,
  EPSG_3857,
  MAX_ZOOM,
  MIN_ZOOM,
  PIXEL_RATIO,
  REPROJ_ERR_THRESHOLD,
  TILE_SIZE,
} from '../ol-ext'
import { observableFromOlEvent } from '../rx-ext'
import { hasSource } from '../util/assert'
import { isEqual, isString, pick, replaceTokens } from '../util/minilo'
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
     * @type {string|undefined}
     */
    urlTmpl () {
      if (!isString(this.url)) {
        return
      }

      return replaceTokens(this.url, pick(this, this.urlTokens))
    },
    /**
     * @returns {function}
     */
    urlFunc () {
      if (!this.url) {
        return
      }

      let url
      if (this.urlTmpl != null) {
        const extent = createExtentFromProjection(this.projection)
        url = createTileUrlFunction(this.urlTmpl, this._tileGrid, extent)
      } else {
        url = this.url
      }

      return url
    },
    tileGridIdent () {
      if (!this.olObjIdent) return

      return this.makeIdent(this.olObjIdent, 'tile_grid')
    },
  },
  methods: {
    createTileGrid () {
      return createXyzGrid({
        extent: createExtentFromProjection(this.projection),
        maxZoom: this.maxZoom,
        minZoom: this.minZoom,
        tileSize: this.tileSize,
      })
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
      this._tileGrid = this.instanceFactoryCall(this.tileGridIdent, ::this.createTileGrid)

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
      this::source.methods.unmount()
    },
    subscribeAll () {
      this::source.methods.subscribeAll()
      this::subscribeToSourceEvents()
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
    urlFunc (value) {
      if (!this.$source) return

      this.$source.setTileUrlFunction(value)
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
}

function subscribeToSourceEvents () {
  hasSource(this)

  const events = observableFromOlEvent(this.$source, [
    'tileloadstart',
    'tileloadend',
    'tileloaderror',
  ])

  this.subscribeTo(events, evt => {
    ++this.rev

    this.$nextTick(() => {
      this.$emit(evt.type, evt)
    })
  })
}
