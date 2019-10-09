import { createTileUrlFunction } from 'ol-tilecache'
import { createXYZ as newXYZGrid, extentFromProjection } from 'ol/tilegrid'
import { EPSG_3857 } from '../ol-ext'
import { obsFromOlEvent } from '../rx-ext'
import { hasSource } from '../util/assert'
import { isEqual, isString, pick, replaceTokens } from '../util/minilo'
import { makeWatchers } from '../util/vue-helpers'
import source from './source'

export default {
  mixins: [
    source,
  ],
  props: {
    // ol/source/Tile
    cacheSize: Number,
    opaque: Boolean,
    tilePixelRatio: {
      type: Number,
      default: 1,
    },
    projection: {
      type: String,
      default: EPSG_3857,
    },
    /**
     * Duration of the opacity transition for rendering. To disable the opacity transition, pass `0`.
     * @type {number}
     */
    transition: Number,
    tileKey: String,
    zDirection: {
      type: Number,
      default: 0,
    },
    // crossOrigin: String,
    // maxZoom: {
    //   type: Number,
    //   default: MAX_ZOOM,
    // },
    // minZoom: {
    //   type: Number,
    //   default: MIN_ZOOM,
    // },
    // reprojectionErrorThreshold: {
    //   type: Number,
    //   default: REPROJ_ERR_THRESHOLD,
    // },
    // tileSize: {
    //   type: Array,
    //   default: () => [TILE_SIZE, TILE_SIZE],
    //   validator: value => value.length === 2,
    // },
    // /**
    //  * @type {module:ol/Tile~LoadFunction}
    //  */
    // tileLoadFunction: Function,
    // /**
    //  * URL template or custom tile URL function.
    //  * @type {string|module:ol/Tile~UrlFunction}
    //  */
    // url: {
    //   type: [String, Function],
    //   required: true,
    // },
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
        const extent = extentFromProjection(this.projection)
        url = createTileUrlFunction(this.urlTmpl, this._tileGrid, extent)
      } else {
        url = this.url
      }

      return url
    },
  },
  methods: {
    /**
     * @return {Promise}
     * @protected
     */
    init () {
      /**
       * @type {module:ol/Tile~UrlFunction}
       * @protected
       */
      this._tileGrid = newXYZGrid({
        extent: extentFromProjection(this.projection),
        maxZoom: this.maxZoom,
        minZoom: this.minZoom,
        tileSize: this.tileSize,
      })

      return this::source.methods.init()
    },
    /**
     * @return {void|Promise<void>}
     * @protected
     */
    deinit () {
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
}

function subscribeToSourceEvents () {
  hasSource(this)

  const events = obsFromOlEvent(this.$source, [
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
