import { dumpFillStyle, dumpStrokeStyle } from '../ol-ext'
import { clonePlainObject, coalesce, isEqual, mergeDescriptors } from '../utils'
import fillStyleContainer from './fill-style-container'
import imageStyle from './image-style'
import { makeChangeOrRecreateWatchers } from './ol-cmp'
import strokeStyleContainer from './stroke-style-container'
import style from './style'

export default {
  mixins: [
    fillStyleContainer,
    strokeStyleContainer,
    imageStyle,
  ],
  props: {
    // ol/style/RegularShape
    points: Number,
    radius: Number,
    radius1: Number,
    radius2: Number,
    angle: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    stroke () {
      if (!(this.rev && this.$stroke)) return

      return dumpStrokeStyle(this.$stroke)
    },
    fill () {
      if (!(this.rev && this.$fill)) return

      return dumpFillStyle(this.$fill)
    },
  },
  watch: {
    .../*#__PURE__*/makeChangeOrRecreateWatchers([
      'points',
      'radius',
      'radius1',
      'radius2',
      'angle',
      'stroke',
      'fill',
    ], [
      'stroke',
      'fill',
    ]),
  },
  methods: {
    /**
     * @returns {Object}
     * @protected
     */
    getServices () {
      return mergeDescriptors(
        this::style.methods.getServices(),
        this::fillStyleContainer.methods.getServices(),
        this::strokeStyleContainer.methods.getServices(),
      )
    },
    /**
     * @protected
     */
    syncNonObservable () {
      this::imageStyle.methods.syncNonObservable()
    },
    /**
     * @return {FillStyleTarget}
     * @protected
     */
    getFillStyleTarget () {
      return {
        getFill: () => this.$style?.getFill(),
        setFill: () => {
          if (process.env.VUELAYERS_DEBUG) {
            this.$logger.log('fill changed, scheduling recreate...')
          }

          this.scheduleRecreate()
        },
      }
    },
    /**
     * @return {StrokeStyleTarget}
     * @protected
     */
    getStrokeStyleTarget () {
      return {
        getStroke: () => this.$style?.getStroke(),
        setStroke: () => {
          if (process.env.VUELAYERS_DEBUG) {
            this.$logger.log('stroke changed, scheduling recreate...')
          }

          this.scheduleRecreate()
        },
      }
    },
    getAnchor () {
      return this.$style?.getAnchor()
    },
    getAngle () {
      return coalesce(this.$style?.getAngle(), this.angle)
    },
    getImage () {
      return this.$style?.getImage()
    },
    getOrigin () {
      return this.$style?.getOrigin()
    },
    getPoints () {
      return coalesce(this.$style?.getPoints(), this.points)
    },
    getRadius () {
      return coalesce(this.$style?.getRadius(), this.radius)
    },
    getRadius2 () {
      return coalesce(this.$style?.getRadius2(), this.radius2)
    },
    getSize () {
      return this.$style?.getSize()
    },
    /**
     * @param {Object|undefined} value
     * @param {Object|undefined} prev
     * @protected
     */
    strokeChanged (value, prev) {
      if (isEqual(value, prev)) return

      this.$emit('update:stroke', value && clonePlainObject(value))
    },
    /**
     * @param {Object|undefined} value
     * @param {Object|undefined} prev
     * @protected
     */
    fillChanged (value, prev) {
      if (isEqual(value, prev)) return

      this.$emit('update:fill', value && clonePlainObject(value))
    },
  },
}
