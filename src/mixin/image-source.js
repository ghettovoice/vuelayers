import { observableFromOlEvent } from '../rx-ext'
import { EPSG_3857 } from '../ol-ext/consts'
import { hasSource } from '../util/assert'
import source from './source'

/**
 * @vueProps
 */
const props = {
  crossOrigin: String,
  projection: {
    type: String,
    default: EPSG_3857,
  },
}

/**
 * @vueMethods
 */
const methods = {
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
    this::subscribeToSourceEvents()
  },
}

/**
 * @vueProto
 * @alias module:mixin/image-source
 */
export default {
  mixins: [source],
  props,
  methods,
}

function subscribeToSourceEvents () {
  hasSource(this)

  const events = observableFromOlEvent(this.$source, [
    'imageloadend',
    'imageloaderror',
    'imageloadstart',
  ])

  this.subscribeTo(events, evt => this.$emit(evt.type, evt))
}
