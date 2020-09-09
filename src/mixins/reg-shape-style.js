import { pick, upperFirst, isFunction, mergeDescriptors, makeWatchers, isEqual } from '../utils'
import fillStyleContainer from './fill-style-container'
import imageStyle from './image-style'
import strokeStyleContainer from './stroke-style-container'

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
  watch: {
    .../*#__PURE__*/makeWatchers([
      'points',
      'radius',
      'radius1',
      'radius2',
      'angle',
    ], prop => async function (val, prev) {
      const handler = this[`on${upperFirst(prop)}Changed`]
      if (isFunction(handler)) {
        return handler(val, prev)
      }

      if (isEqual(val, prev)) return

      if (process.env.VUELAYERS_DEBUG) {
        this.$logger.log(`${prop} changed, scheduling recreate...`)
      }

      await this.scheduleRecreate()
    }),
  },
  methods: {
    /**
     * @returns {Object}
     * @protected
     */
    getServices () {
      return mergeDescriptors(
        this::imageStyle.methods.getServices(),
        this::fillStyleContainer.methods.getServices(),
        this::strokeStyleContainer.methods.getServices(),
      )
    },
    .../*#__PURE__*/pick(imageStyle.methods, [
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
      'resolveOlObject',
      'resolveStyle',
    ]),
    async getFillStyleTarget () {
      return {
        setFill: async () => {
          ++this.rev

          if (process.env.VUELAYERS_DEBUG) {
            this.$logger.log('fill changed, scheduling recreate...')
          }

          await this.scheduleRecreate()
        },
      }
    },
    async getStrokeStyleTarget () {
      return {
        setStroke: async () => {
          ++this.rev

          if (process.env.VUELAYERS_DEBUG) {
            this.$logger.log('stroke changed, scheduling recreate...')
          }

          await this.scheduleRecreate()
        },
      }
    },
    async getAnchor () {
      return (await this.resolveStyle()).getAnchor()
    },
    async getAngle () {
      return (await this.resolveStyle()).getAngle()
    },
    async getImage () {
      return (await this.resolveStyle()).getImage()
    },
    async getOrigin () {
      return (await this.resolveStyle()).getOrigin()
    },
    async getPoints () {
      return (await this.resolveStyle()).getPoints()
    },
    async getRadius () {
      return (await this.resolveStyle()).getRadius()
    },
    async getRadius2 () {
      return (await this.resolveStyle()).getRadius2()
    },
    async getSize () {
      return (await this.resolveStyle()).getSize()
    },
  },
}
