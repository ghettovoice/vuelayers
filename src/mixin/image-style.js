import { pick } from '../util/minilo'
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
  },
  created () {
    this::defineServices()
  },
  methods: {
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
      const style = await this.resolveStyle()

      if (opacity === style.getOpacity()) return

      style.setOpacity(opacity)
      await this.scheduleRefresh()
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
      const style = await this.resolveStyle()

      if (rotateWithView === style.getRotateWithView()) return

      style.setRotateWithView(rotateWithView)
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
      const style = await this.resolveStyle()

      if (rotation === style.getRotation()) return

      style.setRotation(rotation)
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
      const style = await this.resolveStyle()

      if (scale === style.getScale()) return

      style.setScale(scale)
    },
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
      'init',
      'deinit',
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
