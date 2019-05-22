import { isEqual } from '../util/minilo'
import mergeDescriptors from '../util/multi-merge-descriptors'
import layer from './layer'
import stylesContainer from './styles-container'

export default {
  mixins: [layer, stylesContainer],
  props: {
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
    /**
     * @type {number|undefined}
     */
    renderBuffer: {
      type: Number,
      default: 100,
    },
    renderOrder: Function,
    renderMode: {
      type: String,
      default: 'vector',
      validator: value => ['vector', 'image'].includes(value),
    },
    /**
     * @type {boolean}
     */
    declutter: Boolean,
  },
  methods: {
    /**
     * @return {Promise<Vue<Layer>>}
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
     * @return {Vector|undefined}
     * @protected
     */
    getStyleTarget () {
      return this.$layer
    },
    /**
     * @return {Promise|void}
     * @protected
     */
    mount () {
      return this::layer.methods.mount()
    },
    /**
     * @return {Promise|void}
     * @protected
     */
    unmount () {
      return this::layer.methods.unmount()
    },
    /**
     * Updates layer state
     * @return {Promise}
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
      return this::layer.methods.remount()
    },
    /**
     * @protected
     */
    subscribeAll () {
      this::layer.methods.subscribeAll()
    },
  },
  watch: {
    updateWhileAnimating (value) {
      if (!this.$layer || value === this.$layer.getUpdateWhileAnimating()) {
        return
      }

      this.scheduleRecreate()
    },
    updateWhileInteracting (value) {
      if (!this.$layer || value === this.$layer.getUpdateWhileInteracting()) {
        return
      }

      this.scheduleRecreate()
    },
    renderBuffer (value) {
      if (!this.$layer || value === this.$layer.getRenderBuffer()) {
        return
      }

      this.scheduleRecreate()
    },
    renderOrder (value) {
      if (!this.$layer || isEqual(value, this.$layer.getRenderOrder())) {
        return
      }

      this.$layer.setRenderOrder(value)
    },
    declutter (value) {
      if (!this.$layer || value === this.$layer.getDeclutter()) {
        return
      }

      this.$layer.setDeclutter(value)
    },
  },
}
