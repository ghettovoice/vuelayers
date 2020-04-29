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
    async preload (value) {
      await this.setPreload(value)
    },
    async useInterimTilesOnError (value) {
      await this.setUseInterimTilesOnError(value)
    },
  },
  methods: {
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
      const layer = await this.resolveLayer()

      if (preload === layer.getPreload()) return

      layer.setPreload(preload)
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
      'resolveOlObject',
      'resolveLayer',
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
