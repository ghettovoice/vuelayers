import { isEqual, pick } from '../util/minilo'
import style from './style'

export default {
  mixins: [
    style,
  ],
  stubVNode: {
    empty: false,
    attrs () {
      return {
        id: this.vmId,
        class: this.vmClass,
      }
    },
  },
  props: {
    // ol/style/Image
    /**
     * @type {number}
     */
    opacity: {
      type: Number,
      default: 1,
    },
    /**
     * @type {boolean}
     */
    rotateWithView: Boolean,
    /**
     * @type {number}
     */
    rotation: {
      type: Number,
      default: 0,
    },
    /**
     * @type {number}
     */
    scale: {
      type: Number,
      default: 1,
    },
    displacement: {
      type: Array,
      default: () => [0, 0],
    },
  },
  watch: {
    async opacity (value) {
      await this.setOpacity(value)
    },
    async rotateWithView (value) {
      await this.setRotateWithView(value)
    },
    async rotation (value) {
      await this.setRotation(value)
    },
    async scale (value) {
      await this.setScale(value)
    },
    async displacement (value) {
      if (isEqual(value, await this.getDisplacement())) return

      if (process.env.VUELAYERS_DEBUG) {
        this.$logger.log('displacement changed, scheduling recreate...')
      }

      await this.scheduleRecreate()
    },
  },
  created () {
    this::defineServices()
  },
  methods: {
    /**
     * @return {Promise<void>}
     * @protected
     */
    async mount () {
      if (this.$imageStyleContainer) {
        await this.$imageStyleContainer.setImage(this)
      }

      return this::style.methods.mount()
    },
    /**
     * @return {Promise<void>}
     * @protected
     */
    async unmount () {
      if (this.$imageStyleContainer) {
        await this.$imageStyleContainer.setImage(null)
      }

      return this::style.methods.unmount()
    },
    ...pick(style.methods, [
      'beforeInit',
      'init',
      'deinit',
      'beforeMount',
      'refresh',
      'scheduleRefresh',
      'remount',
      'scheduleRemount',
      'recreate',
      'scheduleRecreate',
      'getServices',
      'subscribeAll',
      'resolveOlObject',
      'resolveStyle',
    ]),
    /**
     * @returns {Promise<number>}
     */
    async getOpacity () {
      return (await this.resolveStyle()).getOpacity()
    },
    /**
     * @param {number} opacity
     * @returns {Promise<void>}
     */
    async setOpacity (opacity) {
      if (opacity === await this.getOpacity()) return

      (await this.resolveStyle()).setOpacity(opacity)

      await this.scheduleRemount()
    },
    /**
     * @returns {Promise<boolean>}
     */
    async getRotateWithView () {
      return (await this.resolveStyle()).getRotateWithView()
    },
    /**
     * @param {boolean} rotateWithView
     * @returns {Promise<void>}
     */
    async setRotateWithView (rotateWithView) {
      if (rotateWithView === await this.getRotateWithView()) return

      (await this.resolveStyle()).setRotateWithView(rotateWithView)

      await this.scheduleRemount()
    },
    /**
     * @returns {Promise<number>}
     */
    async getRotation () {
      return (await this.resolveStyle()).getRotation()
    },
    /**
     * @param {number} rotation
     * @returns {Promise<void>}
     */
    async setRotation (rotation) {
      if (rotation === await this.getRotation()) return

      (await this.resolveStyle()).setRotation(rotation)

      await this.scheduleRemount()
    },
    /**
     * @returns {Promise<number>}
     */
    async getScale () {
      return (await this.resolveStyle()).getScale()
    },
    /**
     * @param {number} scale
     * @returns {Promise<void>}
     */
    async setScale (scale) {
      if (scale === await this.getScale()) return

      (await this.resolveStyle()).setScale(scale)

      await this.scheduleRemount()
    },
    async getDisplacement () {
      return (await this.resolveStyle()).getDisplacement()
    },
  },
}

function defineServices () {
  Object.defineProperties(this, {
    /**
     * @type {Object|undefined}
     */
    $imageStyleContainer: {
      enumerable: true,
      get: () => this.$services?.imageStyleContainer,
    },
  })
}
