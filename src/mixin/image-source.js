import { get as getProj } from 'ol/proj'
import { EPSG_3857 } from '../ol-ext'
import { fromOlEvent as obsFromOlEvent } from '../rx-ext'
import { isString, pick } from '../util/minilo'
import { makeWatchers } from '../util/vue-helpers'
import source from './source'
import { ImageSourceEventType } from 'ol/source/Image'

/**
 * Base image source mixin.
 */
export default {
  mixins: [
    source,
  ],
  props: {
    // ol/source/Image
    /**
     * @type {string}
     */
    projection: {
      type: String,
      default: EPSG_3857,
      validator: value => getProj(value) != null,
    },
    /**
     * @type {number[]|undefined}
     */
    resolutions: Array,
  },
  watch: {
    ...makeWatchers([
      'resolutions',
    ], prop => async function () {
      if (process.env.VUELAYERS_DEBUG) {
        this.$logger.log(`${prop} changed, scheduling recreate...`)
      }

      await this.scheduleRecreate()
    }),
  },
  methods: {
    /**
     * @return {void}
     * @protected
     */
    subscribeAll () {
      this::source.methods.subscribeAll()
      this::subscribeToSourceEvents()
    },
    ...pick(source.methods, [
      'beforeInit',
      'init',
      'deinit',
      'beforeMount',
      'mount',
      'unmount',
      'refresh',
      'scheduleRefresh',
      'remount',
      'scheduleRemount',
      'recreate',
      'scheduleRecreate',
      'getServices',
      'resolveOlObject',
      'resolveSource',
    ]),
    /**
     * @param {number[]} extent
     * @param {number} resolution
     * @param {number} pixelRatio
     * @param {module:ol/proj~ProjectionLike} projection
     * @returns {Promise<module:ol/ImageBase~ImageBase>}
     */
    async getImage (extent, resolution, pixelRatio, projection) {
      if (isString(projection)) {
        projection = getProj(projection)
      }

      return (await this.resolveSource()).getImage(extent, resolution, pixelRatio, projection)
    },
  },
}

async function subscribeToSourceEvents () {
  const events = obsFromOlEvent(this.$source, [
    ImageSourceEventType.IMAGELOADSTART,
    ImageSourceEventType.IMAGELOADEND,
    ImageSourceEventType.IMAGELOADERROR,
  ])

  this.subscribeTo(events, evt => this.$emit(evt.type, evt))
}
