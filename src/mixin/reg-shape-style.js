import { pick } from '../util/minilo'
import mergeDescriptors from '../util/multi-merge-descriptors'
import { makeWatchers } from '../util/vue-helpers'
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
    ...makeWatchers([
      'points',
      'radius',
      'radius1',
      'radius2',
      'angle',
    ], prop => async function () {
      if (process.env.VUELAYERS_DEBUG) {
        this.$logger.log(`${prop} changed, scheduling recreate...`)
      }

      await this.scheduleRecreate()
    }),
  },
  methods: {
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
    async getFillStyleTarget () {
      const style = await this.resolveStyle()

      return {
        getFill: ::style.getFill,
        setFill: async () => {
          if (process.env.VUELAYERS_DEBUG) {
            this.$logger.log('fill changed, scheduling recreate...')
          }

          await this.scheduleRecreate()
        },
      }
    },
    async getStrokeStyleTarget () {
      const style = await this.resolveStyle()

      return {
        getStroke: ::style.getStroke,
        setStroke: async () => {
          if (process.env.VUELAYERS_DEBUG) {
            this.$logger.log('stroke changed, scheduling recreate...')
          }

          await this.scheduleRecreate()
        },
      }
    },
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
    ...pick(imageStyle.methods, [
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
  },
}
