import mergeDescriptors from '../util/multi-merge-descriptors'
import layer from './layer'
import stylesContainer from './styles-container'

export default {
  mixins: [layer, stylesContainer],
  props: {
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
     * @return {Promise<void>}
     * @protected
     */
    init () {
      return this::layer.methods.init()
    },
    /**
     * @return {void|Promise<void>}
     * @protected
     */
    deinit () {
      return this::layer.methods.deinit()
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
    /**
     * @return {Promise<module:ol/layer/Vector~Vector|undefined>}
     * @protected
     */
    getStyleTarget () {
      return this.resolveLayer()
    },
    /**
     * @return {Promise<void>}
     * @protected
     */
    mount () {
      return this::layer.methods.mount()
    },
    /**
     * @return {Promise<void>}
     * @protected
     */
    unmount () {
      return this::layer.methods.unmount()
    },
    /**
     * Updates layer state
     * @return {Promise<void>}
     */
    refresh () {
      return this::layer.methods.refresh()
    },
    /**
     * Internal usage only in components that doesn't support refreshing.
     * @return {Promise<void>}
     * @protected
     */
    remount () {
      return this::layer.methods.remount()
    },
    /**
     * Internal usage only in components that doesn't support refreshing.
     * @return {Promise<void>}
     * @protected
     */
    recreate () {
      return this::layer.methods.recreate()
    },
    /**
     * @return {Promise<void>}
     * @protected
     */
    subscribeAll () {
      return this::layer.methods.subscribeAll()
    },
  },
}
