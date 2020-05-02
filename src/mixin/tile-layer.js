import debounce from 'debounce-promise'
import { skipWhile } from 'rxjs/operators'
import { fromOlChangeEvent as obsFromOlChangeEvent } from '../rx-ext'
import { addPrefix, isEqual, pick } from '../util/minilo'
import layer from './layer'
import { FRAME_TIME } from './ol-cmp'

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
  computed: {
    currentPreload () {
      if (this.rev && this.$layer) {
        return this.$layer.getPreload()
      }

      return this.preload
    },
    currentUseInterimTilesOnError () {
      if (this.rev && this.$layer) {
        return this.$layer.getUseInterimTilesOnError()
      }

      return this.useInterimTilesOnError
    },
  },
  watch: {
    async preload (value) {
      await this.setPreload(value)
    },
    currentPreload: debounce(function (value) {
      if (value === this.preload) return

      this.$emit('update:preload', value)
    }, FRAME_TIME),
    async useInterimTilesOnError (value) {
      await this.setUseInterimTilesOnError(value)
    },
    currentUseInterimTilesOnError: debounce(function (value) {
      if (value === this.useInterimTilesOnError) return

      this.$emit('update:useInterimTilesOnError', value)
    }, FRAME_TIME),
  },
  methods: {
    /**
     * @returns {void}
     */
    subscribeAll () {
      this::layer.methods.subscribeAll()
      this::subscribeToLayerEvents()
    },
    ...pick(layer.methods, [
      'beforeInit',
      'init',
      'deinit',
      'beforeMount',
      'mount',
      'unmount',
      'refresh',
      'scheduleRefresh',
      'recreate',
      'scheduleRecreate',
      'remount',
      'scheduleRemount',
      'getServices',
      'resolveOlObject',
      'resolveLayer',
    ]),
    /**
     * @returns {Promise<number>}
     */
    async getPreload () {
      return (await this.resolveLayer()).getPreload()
    },
    /**
     * @param {number} preload
     * @returns {Promise<void>}
     */
    async setPreload (preload) {
      if (preload === await this.getPreload()) return

      (await this.resolveLayer()).setPreload(preload)
    },
    /**
     * @returns {Promise<boolean>}
     */
    async getUseInterimTilesOnError () {
      return (await this.resolveLayer()).getUseInterimTilesOnError()
    },
    /**
     * @param {boolean} useInterimTilesOnError
     * @returns {Promise<void>}
     */
    async setUseInterimTilesOnError (useInterimTilesOnError) {
      if (useInterimTilesOnError === await this.getUseInterimTilesOnError()) return

      (await this.resolveLayer()).setUseInterimTilesOnError(useInterimTilesOnError)
    },
  },
}

async function subscribeToLayerEvents () {
  const prefixKey = addPrefix('current')
  const propChanges = obsFromOlChangeEvent(this.$layer, [
    'preload',
    'useInterimTilesOnError',
  ], true, evt => ({
    ...evt,
    compareWith: this[prefixKey(evt.prop)],
  })).pipe(
    skipWhile(({ value, compareWith }) => isEqual(value, compareWith)),
  )
  this.subscribeTo(propChanges, () => {
    ++this.rev
  })
}
