import { obsFromOlChangeEvent } from '../rx-ext'
import { pick } from '../util/minilo'
import layer from './layer'

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
  watch: {
    preload (value) {
      this.setLayerPreload(value)
    },
    useInterimTilesOnError (value) {
      this.setLayerUseInterimTilesOnError(value)
    },
  },
  methods: {
    /**
     * @returns {Promise<number>}
     */
    async getLayerPreload () {
      return (await this.resolveLayer()).getPreload()
    },
    /**
     * @param {number} preload
     * @returns {Promise<void>}
     */
    async setLayerPreload (preload) {
      const layer = await this.resolveLayer()

      if (preload === layer.getPreload()) return

      layer.setPreload(preload)
    },
    /**
     * @returns {Promise<boolean>}
     */
    async getLayerUseInterimTilesOnError () {
      return (await this.resolveLayer()).getUseInterimTilesOnError()
    },
    /**
     * @param {boolean} useInterimTilesOnError
     * @returns {Promise<void>}
     */
    async setLayerUseInterimTilesOnError (useInterimTilesOnError) {
      const layer = await this.resolveLayer()

      if (useInterimTilesOnError === layer.getUseInterimTilesOnError()) return

      layer.setUseInterimTilesOnError(useInterimTilesOnError)
    },
    /**
     * @returns {Promise<void>}
     */
    subscribeAll () {
      return Promise.all([
        this::layer.methods.subscribeAll(),
        this::subscribeToLayerEvents(),
      ])
    },
    ...pick(layer.methods, [
      'init',
      'deinit',
      'mount',
      'unmount',
      'refresh',
      'scheduleRefresh',
      'recreate',
      'scheduleRecreate',
      'remount',
      'scheduleRecreate',
      'getServices',
    ]),
  },
}

async function subscribeToLayerEvents () {
  const layer = await this.resolveLayer()

  const t = 1000 / 60
  const changes = obsFromOlChangeEvent(layer, [
    'preload',
    'useInterimTilesOnError',
  ], true, t)

  this.subscribeTo(changes, ({ prop, value }) => {
    ++this.rev

    this.$nextTick(() => {
      this.$emit(`update:${prop}`, value)
    })
  })
}
