import { dumpStyle } from '../ol-ext'
import { clonePlainObject, isArray, isEqual, isFunction, isPlainObject, mergeDescriptors } from '../utils'
import layer from './layer'
import { makeChangeOrRecreateWatchers } from './ol-cmp'
import styleContainer from './style-container'

export default {
  mixins: [
    styleContainer,
    layer,
  ],
  props: {
    // ol/layer/BaseVector
    /**
     * @type {function|undefined}
     */
    renderOrder: Function,
    /**
     * @type {number}
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
     */
    updateWhileAnimating: Boolean,
    /**
     * When set to `true`, feature batches will be recreated during interactions.
     * @type {boolean}
     */
    updateWhileInteracting: Boolean,
  },
  computed: {
    style () {
      if (!(this.rev && this.$style)) return

      let style = this.$style
      if (isFunction(style)) return style
      if (!style) return

      isArray(style) || (style = [style])

      return style.map(style => dumpStyle(style, geom => this.writeGeometryInDataProj(geom)))
    },
  },
  watch: {
    .../*#__PURE__*/makeChangeOrRecreateWatchers([
      'renderOrder',
      'renderBuffer',
      'declutter',
      'updateWhileAnimating',
      'updateWhileInteracting',
      'style',
    ], [
      'style',
    ]),
  },
  methods: {
    /**
     * @returns {Object}
     * @protected
     */
    getServices () {
      return mergeDescriptors(
        this::layer.methods.getServices(),
        this::styleContainer.methods.getServices(),
      )
    },
    /**
     * @protected
     */
    subscribeAll () {
      this::layer.methods.subscribeAll()
      this::subscribeToLayerEvents()
    },
    /**
     * @return {StyleTarget|undefined}
     */
    getStyleTarget () {
      return this.$layer
    },
    /**
     * @param {number[]} pixel
     * @return {Promise<Array<module:ol/Feature~Feature>>}
     */
    async getFeatures (pixel) {
      return (await this.resolveLayer()).getFeatures(pixel)
    },
    /**
     * @param {Object|Function|Array|undefined} value
     * @param {Object|Function|Array|undefined} prev
     * @protected
     */
    styleChanged (value, prev) {
      if (isEqual(value, prev)) return

      if (isPlainObject(value) || isArray(value)) {
        value = clonePlainObject(value)
      }
      this.$emit('update:style', value)
    },
  },
}

async function subscribeToLayerEvents () {
}
