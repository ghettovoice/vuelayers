import { createTileUrlFunction } from 'ol-tilecache'
import { observableFromOlEvent } from '../rx-ext'
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
import { hasSource, hasView } from '../util/assert'
import { isFunction, isString, pick, replaceTokens } from '../util/minilo'
import source from './source'
import withUrl from './with-url'

const props = {
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
  tileLoadFunction: Function,
  url: {
    type: [String, Function],
    required: true,
  },
  /**
   * Duration of the opacity transition for rendering. To disable the opacity transition, pass `0`.
   * @type {number}
   */
  transition: Number,
}

const computed = {
  /**
   * @type {string}
   */
  urlTmpl () {
    if (!isString(this.url)) {
      return ''
    }
    return replaceTokens(this.url, pick(this, this.urlTokens))
  },
}

const methods = {
  /**
   * @return {TileGrid}
   * @protected
   */
  createTileGrid () {
    hasView(this)

    return createXyzGrid({
      extent: createExtentFromProjection(this.$view.getProjection()),
      maxZoom: this.maxZoom,
      minZoom: this.minZoom,
      tileSize: this.tileSize,
    })
  },
  /**
   * @return {TileUrlFunction}
   * @protected
   */
  createUrlFunc () {
    // custom url function provided
    if (isFunction(this.url)) {
      return this.url
    }
    hasView(this)
    // or use url function from ol-tilecache
    return createTileUrlFunction(
      this.urlTmpl,
      this._tileGrid,
      createExtentFromProjection(this.$view.getProjection()),
    )
  },
  /**
   * @return {Promise}
   * @protected
   */
  init () {
    /**
     * @type {TileGrid}
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
  subscribeAll () {
    this::subscribeToSourceEvents()
  },
}

const watch = {
  url () {
    if (this.$source) {
      this.$source.setTileUrlFunction(this.createUrlFunc())
      this.scheduleRefresh()
    }
  },
}

export default {
  mixins: [source, withUrl],
  props,
  computed,
  methods,
  watch,
}

function subscribeToSourceEvents () {
  hasSource(this)

  const events = observableFromOlEvent(this.$source, [
    'tileloadstart',
    'tileloadend',
    'tileloaderror',
  ])

  this.subscribeTo(events, evt => this.$emit(evt.type, evt))
}
