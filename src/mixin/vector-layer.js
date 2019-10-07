import { pick } from '../util/minilo'
import mergeDescriptors from '../util/multi-merge-descriptors'
import layer from './layer'
import stylesContainer from './styles-container'

export default {
  mixins: [
    stylesContainer,
    layer,
  ],
  props: {
    // ol/layer/BaseVector
    renderOrder: Function,
    /**
     * @type {number|undefined}
     */
    renderBuffer: {
      type: Number,
      default: 100,
    },
    /**
     * @type {boolean}
     */
    declutter: Boolean,
    /**
     * When set to `true`, feature batches will be recreated during animations.
     * @type {boolean}
     * @default false
     */
    updateWhileAnimating: Boolean,
    /**
     * When set to `true`, feature batches will be recreated during interactions.
     * @type {boolean}
     * @default false
     */
    updateWhileInteracting: Boolean,
  },
  watch: {
    renderOrder (value) {
      this.setRenderOrder(value)
    },
    async renderBuffer (value) {
      if (value === await this.getRenderBuffer()) return

      this.scheduleRecreate()
    },
    async declutter (value) {
      if (value === await this.getDeclutter()) return

      this.scheduleRecreate()
    },
    async updateWhileAnimating (value) {
      if (value === await this.getUpdateWhileAnimating()) return

      this.scheduleRecreate()
    },
    async updateWhileInteracting (value) {
      if (value === await this.getUpdateWhileInteracting()) return

      this.scheduleRecreate()
    },
  },
  methods: {
    /**
     * @returns {Promise<boolean>}
     */
    async getDeclutter () {
      return (await this.resolveLayer()).getDeclutter()
    },
    /**
     * @returns {Promise<number>}
     */
    async getRenderBuffer () {
      return (await this.resolveLayer()).getRenderBuffer()
    },
    /**
     * @returns {Promise<function>}
     */
    async getRenderOrder () {
      return (await this.resolveLayer()).getRenderOrder()
    },
    /**
     * @param {function} renderOrder
     * @returns {Promise<void>}
     */
    async setRenderOrder (renderOrder) {
      const layer = await this.resolveLayer()

      if (renderOrder === layer.getRenderOrder()) return

      layer.setRenderOrder(renderOrder)
    },
    /**
     * @returns {Promise<boolean>}
     */
    async getUpdateWhileAnimating () {
      return (await this.resolveLayer()).getUpdateWhileAnimating()
    },
    /**
     * @returns {Promise<boolean>}
     */
    async getUpdateWhileInteracting () {
      return (await this.resolveLayer()).getUpdateWhileInteracting()
    },
    /**
     * @returns {Object}
     * @protected
     */
    getServices () {
      return mergeDescriptors(
        this::layer.methods.getServices(),
        this::stylesContainer.methods.getServices(),
      )
    },
    getStyleTarget: layer.methods.resolveLayer,
    ...pick(layer.methods, [
      'init',
      'deinit',
      'mount',
      'unmount',
      'refresh',
      'scheduleRefresh',
      'remount',
      'scheduleRemount',
      'recreate',
      'scheduleRecreate',
      'subscribeAll',
    ]),
  },
}
