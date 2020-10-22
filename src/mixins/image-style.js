import { coalesce } from '../utils'
import { makeChangeOrRecreateWatchers } from './ol-cmp'
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
  data () {
    return {
      currentOpacity: this.opacity,
      currentRotateWithView: this.rotateWithView,
      currentRotation: this.rotation,
      currentScale: this.scale,
    }
  },
  computed: {
    inputDisplacement () {
      return this.displacement?.slice()
    },
  },
  watch: {
    rev () {
      if (!this.$style) return

      this.setOpacity(this.getOpacity())
      this.setRotateWithView(this.getRotateWithView())
      this.setRotation(this.getRotation())
      this.setScale(this.getScale())
    },
    .../*#__PURE__*/makeChangeOrRecreateWatchers([
      'opacity',
      'currentOpacity',
      'rotateWithView',
      'currentRotateWithView',
      'rotation',
      'currentRotation',
      'scale',
      'currentScale',
      'inputDisplacement',
    ], [
      'inputDisplacement',
    ]),
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
      this.$imageStyleContainer?.setImage(this)

      return this::style.methods.mount()
    },
    /**
     * @return {Promise<void>}
     * @protected
     */
    async unmount () {
      if (this.$imageStyleContainer?.getImageVm() === this) {
        await this.$imageStyleContainer.setImage(null)
      }

      return this::style.methods.unmount()
    },
    /**
     * @return {Promise<void>}
     */
    async refresh () {
      await Promise.all([
        this::style.methods.refresh(),
        this.$imageStyleContainer?.refresh(),
      ])
    },
    /**
     * @protected
     */
    syncNonObservable () {
      this::style.methods.syncNonObservable()

      this.setOpacity(this.getOpacity())
      this.setRotateWithView(this.getRotateWithView())
      this.setRotation(this.getRotation())
      this.setScale(this.getScale())
    },
    /**
     * @returns {number}
     */
    getOpacity () {
      return coalesce(this.$style?.getOpacity(), this.currentOpacity)
    },
    /**
     * @param {number} opacity
     */
    setOpacity (opacity) {
      if (opacity !== this.currentOpacity) {
        this.currentOpacity = opacity
        this.scheduleRefresh()
      }
      if (this.$style && opacity !== this.$style.getOpacity()) {
        this.$style.setOpacity(opacity)
        this.scheduleRefresh()
      }
    },
    /**
     * @returns {boolean}
     */
    getRotateWithView () {
      return coalesce(this.$style?.getRotateWithView(), this.currentRotateWithView)
    },
    /**
     * @param {boolean} rotateWithView
     */
    setRotateWithView (rotateWithView) {
      if (rotateWithView !== this.currentRotateWithView) {
        this.currentRotateWithView = rotateWithView
        this.scheduleRefresh()
      }
      if (this.$style && rotateWithView !== this.$style.getRotateWithView()) {
        this.$style.setRotateWithView(rotateWithView)
        this.scheduleRefresh()
      }
    },
    /**
     * @returns {number}
     */
    getRotation () {
      return coalesce(this.$style?.getRotation(), this.currentRotation)
    },
    /**
     * @param {number} rotation
     */
    setRotation (rotation) {
      if (rotation !== this.currentRotation) {
        this.currentRotation = rotation
        this.scheduleRefresh()
      }
      if (this.$style && rotation !== this.$style.getRotation()) {
        this.$style.setRotation(rotation)
        this.scheduleRefresh()
      }
    },
    /**
     * @returns {number}
     */
    getScale () {
      return coalesce(this.$style?.getScale(), this.currentScale)
    },
    /**
     * @param {number} scale
     */
    setScale (scale) {
      if (scale !== this.currentScale) {
        this.currentScale = scale
        this.scheduleRefresh()
      }
      if (this.$style && scale !== this.$style.getScale()) {
        this.$style.setScale(scale)
        this.scheduleRefresh()
      }
    },
    /**
     * @return {number[]}
     */
    getDisplacement () {
      return coalesce(this.$style?.getDisplacement(), this.inputDisplacement)
    },
    /**
     * @param {number} value
     * @protected
     */
    opacityChanged (value) {
      this.setOpacity(value)
    },
    /**
     * @param {number} value
     * @protected
     */
    currentOpacityChanged (value) {
      if (value === this.opacity) return

      this.$emit('update:opacity', value)
    },
    /**
     * @param {boolean} value
     * @protected
     */
    rotateWithViewChanged (value) {
      this.setRotateWithView(value)
    },
    /**
     * @param {boolean} value
     * @protected
     */
    currentRotateWithViewChanged (value) {
      if (value === this.rotateWithView) return

      this.$emit('update:rotateWithView', value)
    },
    /**
     * @param {number} value
     * @protected
     */
    rotationChanged (value) {
      this.setRotation(value)
    },
    /**
     * @param {number} value
     * @protected
     */
    currentRotationChanged (value) {
      if (value === this.rotation) return

      this.$emit('update:rotation', value)
    },
    /**
     * @param {number} value
     * @protected
     */
    scaleChanged (value) {
      this.setScale(value)
    },
    /**
     * @param {number} value
     * @protected
     */
    currentScaleChanged (value) {
      if (value === this.scale) return

      this.$emit('update:scale', value)
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
