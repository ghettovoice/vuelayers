import { EPSG_3857 } from '../ol-ext'
import { observableFromOlEvent } from '../rx-ext'
import { hasSource } from '../util/assert'
import { makeWatchers } from '../util/vue-helpers'
import source from './source'

export default {
  mixins: [source],
  props: {
    crossOrigin: String,
    projection: {
      type: String,
      default: EPSG_3857,
    },
  },
  methods: {
    /**
     * @return {Promise}
     * @protected
     */
    init () {
      return this::source.methods.init()
    },
    /**
     * @return {void|Promise<void>}
     * @protected
     */
    deinit () {
      return this::source.methods.deinit()
    },
    /**
     * @return {void}
     * @protected
     */
    mount () {
      this::source.methods.mount()
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      this::source.methods.unmount()
    },
    subscribeAll () {
      this::source.methods.subscribeAll()
      this::subscribeToSourceEvents()
    },
  },
  watch: {
    ...makeWatchers([
      'crossOrigin',
    ], () => function () {
      this.scheduleRecreate()
    }),
  },
}

function subscribeToSourceEvents () {
  hasSource(this)

  const events = observableFromOlEvent(this.$source, [
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
