import { get as getProj } from 'ol/proj'
import { EPSG_3857 } from '../ol-ext'
import { obsFromOlEvent } from '../rx-ext'
import { isString, pick } from '../util/minilo'
import { makeWatchers } from '../util/vue-helpers'
import source from './source'

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
    },
    /**
     * @type {number[]|undefined}
     */
    resolutions: Array,
  },
  watch: {
    ...makeWatchers([
      'resolutions',
    ], () => source.methods.scheduleRecreate),
  },
  methods: {
    /**
     * @param {number[]} extent
     * @param {number} resolution
     * @param {number} pixelRatio
     * @param {string} projection
     * @returns {Promise<module:ol/ImageBase~ImageBase>}
     */
    async getSourceImage (extent, resolution, pixelRatio, projection) {
      if (isString(projection)) {
        projection = getProj(projection)
      }

      return (await this.resolveSource()).getImage(extent, resolution, pixelRatio, projection)
    },
    /**
     * @return {Promise<void>}
     * @protected
     */
    async subscribeAll () {
      await Promise.all([
        this::source.methods.subscribeAll(),
        this::subscribeToSourceEvents(),
      ])
    },
    ...pick(source.methods, [
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
      'getServices',
    ]),
  },
}

async function subscribeToSourceEvents () {
  const source = await this.resolveSource()

  const events = obsFromOlEvent(source, [
    'imageloadend',
    'imageloaderror',
    'imageloadstart',
  ])

  this.subscribeTo(events, evt => {
    ++this.rev

    this.$nextTick(() => {
      this.$emit(evt.type, evt)
    })
  })
}
