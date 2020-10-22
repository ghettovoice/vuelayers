import { fromOlChangeEvent as obsFromOlChangeEvent } from '../rx-ext'
import { addPrefix, assert, coalesce, isNumber } from '../utils'
import layer from './layer'
import { makeChangeOrRecreateWatchers } from './ol-cmp'

/**
 * Base tile layer mixin.
 */
export default {
  mixins: [
    layer,
  ],
  props: {
    // ol/layer/BaseTile
    /**
     * @type {number}
     */
    preload: {
      type: Number,
      default: 0,
    },
    /**
     * @type {boolean}
     */
    useInterimTilesOnError: {
      type: Boolean,
      default: true,
    },
  },
  data () {
    return {
      currentPreload: this.preload,
      currentUseInterimTilesOnError: this.useInterimTilesOnError,
    }
  },
  watch: {
    rev () {
      if (!this.$layer) return

      if (this.currentPreload !== this.$layer.getPreload()) {
        this.currentPreload = this.$layer.getPreload()
      }
      if (this.currentUseInterimTilesOnError !== this.$layer.getUseInterimTilesOnError()) {
        this.currentUseInterimTilesOnError = this.$layer.getUseInterimTilesOnError()
      }
    },
    .../*#__PURE__*/makeChangeOrRecreateWatchers([
      'preload',
      'currentPreload',
      'useInterimTilesOnError',
      'currentUseInterimTilesOnError',
    ]),
  },
  methods: {
    /**
     * @protected
     */
    subscribeAll () {
      this::layer.methods.subscribeAll()
      this::subscribeToLayerEvents()
    },
    /**
     * @returns {number}
     */
    getPreload () {
      return coalesce(this.$layer?.getPreload(), this.currentPreload)
    },
    /**
     * @param {number} preload
     */
    setPreload (preload) {
      preload = Number(preload)
      assert(isNumber(preload), 'Invalid preload')

      if (preload !== this.currentPreload) {
        this.currentPreload = preload
      }
      if (this.$layer && preload !== this.$layer.getPreload()) {
        this.$layer.setPreload(preload)
      }
    },
    /**
     * @returns {boolean}
     */
    getUseInterimTilesOnError () {
      return coalesce(this.$layer?.getUseInterimTilesOnError(), this.currentUseInterimTilesOnError)
    },
    /**
     * @param {boolean} useInterimTilesOnError
     */
    setUseInterimTilesOnError (useInterimTilesOnError) {
      useInterimTilesOnError = !!useInterimTilesOnError

      if (useInterimTilesOnError !== this.currentUseInterimTilesOnError) {
        this.currentUseInterimTilesOnError = useInterimTilesOnError
      }
      if (this.$layer && useInterimTilesOnError !== this.$layer.getUseInterimTilesOnError()) {
        this.$layer.setUseInterimTilesOnError(useInterimTilesOnError)
      }
    },
    /**
     * @param {number} value
     * @protected
     */
    preloadChanged (value) {
      this.setPreload(value)
    },
    /**
     * @param {number} value
     * @protected
     */
    currentPreloadChanged (value) {
      if (value === this.preload) return

      this.$emit('update:preload', value)
    },
    /**
     * @param {boolean} value
     * @protected
     */
    useInterimTilesOnErrorChanged (value) {
      this.setUseInterimTilesOnError(value)
    },
    /**
     * @param {boolean} value
     * @protected
     */
    currentUseInterimTilesOnErrorChanged (value) {
      if (value === this.useInterimTilesOnError) return

      this.$emit('update:useInterimTilesOnError', value)
    },
  },
}

async function subscribeToLayerEvents () {
  const setterKey = addPrefix('current')
  const propChanges = obsFromOlChangeEvent(this.$layer, [
    'preload',
    'useInterimTilesOnError',
  ], true, evt => ({
    ...evt,
    setter: this[setterKey(evt.prop)],
  }))
  this.subscribeTo(propChanges, ({ setter, value }) => setter(value))
}
