import { get as getProj } from 'ol/proj'
import { ImageSourceEventType } from 'ol/source/Image'
import { EPSG_3857 } from '../ol-ext'
import { fromOlEvent as obsFromOlEvent } from '../rx-ext'
import { pick, makeWatchers } from '../util'
import source from './source'

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
    .../*#__PURE__*/makeWatchers([
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
    .../*#__PURE__*/pick(source.methods, [
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
