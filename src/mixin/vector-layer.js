import mergeDescriptors from '../util/multi-merge-descriptors'
import layer from './layer'
import stylesContainer from './styles-container'

const props = {
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
  /**
   * @type {RenderOrderFunction|undefined}
   */
  renderOrder: Function,
  /**
   * @type {boolean}
   */
  declutter: Boolean,
}

const methods = {
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
   * @return {void}
   * @protected
   */
  mount () {
    this::layer.methods.mount()
  },
  /**
   * @return {void}
   * @protected
   */
  unmount () {
    this::layer.methods.unmount()
  },
  subscribeAll () {
    this::layer.methods.subscribeAll()
  },
}

export default {
  mixins: [layer, stylesContainer],
  props,
  methods,
}
