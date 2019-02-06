import { EPSG_3857 } from '../ol-ext/consts'
import { isEqual } from '../util/minilo'
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
  },
  watch: {
    ...makeWatchers([
      'crossOrigin',
    ], () => function (value, prevValue) {
      if (isEqual(value, prevValue)) return

      this.scheduleRecreate()
    }),
  },
}
