import { EPSG_3857 } from '../ol-ext'
import { fromOlEvent as obsFromOlEvent } from '../rx-ext'
import { noop } from '../utils'
import { makeChangeOrRecreateWatchers } from './ol-cmp'
import source from './source'

const ImageSourceEventType = {
  IMAGELOADSTART: 'imageloadstart',
  IMAGELOADEND: 'imageloadend',
  IMAGELOADERROR: 'imageloaderror',
}

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
      ...source.props.projection,
      default: EPSG_3857,
    },
    /**
     * @type {number[]|undefined}
     */
    resolutions: Array,
  },
  computed: {
    inputResolutions () {
      return this.resolutions?.slice()
    },
  },
  watch: {
    .../*#__PURE__*/makeChangeOrRecreateWatchers([
      'inputResolutions',
    ], [
      'inputResolutions',
    ]),
  },
  methods: {
    /**
     * @protected
     */
    subscribeAll () {
      this::source.methods.subscribeAll()
      this::subscribeToSourceEvents()
    },
    attributionsCollapsibleChanged: noop,
    wrapXChanged: noop,
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
