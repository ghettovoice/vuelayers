import { v4 as uuid } from 'uuid'
import TileEventType from 'ol/source/TileEventType'
import { expandUrl } from '../ol-ext'
import { fromOlEvent as obsFromOlEvent } from '../rx-ext'
import {
  and,
  assert,
  coalesce,
  isArray,
  isEmpty,
  isEqual,
  isFunction,
  isString,
  negate,
  pick,
  replaceTokens,
} from '../utils'
import { makeChangeOrRecreateWatchers } from './ol-cmp'
import tileSource from './tile-source'

const isNotEmptyString = /*#__PURE__*/and(isString, negate(isEmpty))
const isArrayOfNotEmptyStrings = /*#__PURE__*/and(isArray, value => value.every(isNotEmptyString))

export default {
  mixins: [
    tileSource,
  ],
  props: {
    // ol/source/UrlTile
    /**
     * @type {function|undefined}
     */
    tileLoadFunction: Function,
    /**
     * @type {function|undefined}
     * @deprecated
     * @todo remove in v0.13.x
     */
    tileUrlFunc: Function,
    /**
     * @type {function|undefined}
     */
    tileUrlFunction: Function,
    /**
     * @type {string|undefined}
     */
    url: {
      type: String,
      validator: isNotEmptyString,
    },
    /**
     * @type {string[]|undefined}
     */
    urls: {
      type: Array,
      validator: isArrayOfNotEmptyStrings,
    },
  },
  data () {
    return {
      currentTileLoadFunction: undefined,
      currentTileUrlFunction: undefined,
      currentUrls: [],
    }
  },
  computed: {
    urlTokens () {
      return []
    },
    inputUrl () {
      if (!this.url) return

      return replaceTokens(this.url, pick(this, this.urlTokens))
    },
    parsedUrls () {
      const urls = []

      if (this.urls && this.urls.length > 0) {
        urls.push(...this.urls)
      } else if (this.url) {
        urls.push(this.url)
      }

      const tokens = pick(this, this.urlTokens)

      return urls.map(url => replaceTokens(url, tokens))
    },
    inputUrls () {
      return this.parsedUrls.reduce((urls, url) => urls.concat(...expandUrl(url)), [])
    },
    inputTileUrlFunction () {
      return coalesce(this.tileUrlFunction, this.tileUrlFunc)
    },
    inputTileLoadFunction () {
      return this.tileLoadFunction
    },
  },
  watch: {
    rev () {
      if (!this.$source) return

      if (this.currentTileLoadFunction !== this.$source.getTileLoadFunction()) {
        this.currentTileLoadFunction = this.$source.getTileLoadFunction()
      }
      if (this.currentTileUrlFunction !== this.$source.getTileUrlFunction()) {
        this.currentTileUrlFunction = this.$source.getTileUrlFunction()
      }
      if (!isEqual(this.currentUrls, this.$source.getUrls()) && !this.inputTileUrlFunction) {
        this.currentUrls = this.$source.getUrls()
      }
    },
    .../*#__PURE__*/makeChangeOrRecreateWatchers([
      'inputUrls',
      'currentUrls',
      'inputTileUrlFunction',
      'currentTileUrlFunction',
      'inputTileLoadFunction',
      'currentTileLoadFunction',
    ], [
      'inputUrls',
      'currentUrls',
    ]),
  },
  created () {
    if (process.env.NODE_ENV !== 'production') {
      if (this.tileUrlFunc) {
        this.$logger.warn("'tileUrlFunc' prop is deprecated. Use 'tileUrlFunction' prop instead.")
      }
    }

    this.currentUrls = this.inputUrls?.slice()
    this.currentTileUrlFunction = this.inputTileUrlFunction
    this.currentTileLoadFunction = this.inputTileLoadFunction
  },
  updated () {
    if (process.env.NODE_ENV !== 'production') {
      if (this.tileUrlFunc) {
        this.$logger.warn("'tileUrlFunc' prop is deprecated. Use 'tileUrlFunction' prop instead.")
      }
    }
  },
  methods: {
    /**
     * @returns {void}
     */
    subscribeAll () {
      this::tileSource.methods.subscribeAll()
      this::subscribeToSourceEvents()
    },
    /**
     * @returns {module:ol/Tile.LoadFunction}
     */
    getTileLoadFunction () {
      return coalesce(this.$source?.getTileLoadFunction(), this.currentTileLoadFunction)
    },
    /**
     * @param {module:ol/Tile.LoadFunction} tileLoadFunction
     */
    setTileLoadFunction (tileLoadFunction) {
      assert(isFunction(tileLoadFunction), 'Invalid tile load function')

      if (tileLoadFunction !== this.currentTileLoadFunction) {
        this.currentTileLoadFunction = tileLoadFunction
      }
      if (this.$source && tileLoadFunction !== this.$source.getTileLoadFunction()) {
        this.$source.setTileLoadFunction(tileLoadFunction)
      }
    },
    /**
     * @returns {module:ol/Tile.UrlFunction}
     */
    getTileUrlFunction () {
      return coalesce(this.$source?.getTileUrlFunction(), this.currentTileUrlFunction)
    },
    /**
     * @param {module:ol/Tile.UrlFunction} tileUrlFunction
     * @param {number} [tileKey]
     */
    setTileUrlFunction (tileUrlFunction, tileKey) {
      assert(isFunction(tileUrlFunction), 'Invalid tile url function')
      tileKey || (tileKey = coalesce(this.inputUrls?.join('\n'), uuid()))

      if (tileUrlFunction !== this.currentTileUrlFunction) {
        this.currentTileUrlFunction = tileUrlFunction
      }
      if (this.$source && tileUrlFunction !== this.$source.getTileUrlFunction()) {
        this.$source.setTileUrlFunction(tileUrlFunction, tileKey)
      }
    },
    /**
     * @returns {string[]|undefined}
     */
    getUrls () {
      return coalesce(this.$source?.getUrls(), this.currentUrls)
    },
    /**
     * @param {string[]} urls
     */
    setUrls (urls) {
      assert(isArrayOfNotEmptyStrings(urls), 'Invalid urls')
      urls = urls.slice()

      if (!isEqual(urls, this.currentUrls)) {
        this.currentUrls = urls
      }
      if (this.$source) {
        if (this.inputTileUrlFunction) {
          this.$source.setTileUrlFunction(this.inputTileUrlFunction, urls.join('\n'))
        } else if (!isEqual(urls, this.$source.getUrls())) {
          this.$source.setUrls(urls)
        }
      }
    },
    /**
     * @param {string} url
     */
    setUrl (url) {
      assert(isNotEmptyString(url), 'Invalid url')

      this.setUrls(expandUrl(url))
    },
    /**
     * @param {string[]} value
     * @protected
     */
    inputUrlsChanged (value) {
      this.setUrls(value)
    },
    /**
     * @param {string[]} value
     * @protected
     */
    currentUrlsChanged (value) {
      if (isEqual(value, this.urls)) return

      this.$emit('update:urls', value?.slice())
    },
    /**
     * @param {function|undefined} value
     * @protected
     */
    inputTileUrlFunctionChanged (value) {
      this.setTileUrlFunction(value)
    },
    /**
     * @param {function|undefined} value
     * @protected
     */
    currentTileUrlFunctionChanged (value) {
      if (value === this.inputTileUrlFunction) return

      this.$emit('update:tileUrlFunction', value)
    },
    /**
     * @param {function|undefined} value
     * @protected
     */
    inputTileLoadFunctionChanged (value) {
      this.setTileLoadFunction(value)
    },
    /**
     * @param {function|undefined} value
     * @protected
     */
    currentTileLoadFunctionChanged (value) {
      if (value === this.inputTileLoadFunction) return

      this.$emit('update:tileLoadFunction', value)
    },
  },
}

async function subscribeToSourceEvents () {
  const events = obsFromOlEvent(this.$source, [
    TileEventType.TILELOADSTART,
    TileEventType.TILELOADEND,
    TileEventType.TILELOADERROR,
  ])
  this.subscribeTo(events, evt => this.$emit(evt.type, evt))
}
