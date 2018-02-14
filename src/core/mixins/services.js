import { SERVICES_PROP } from '../consts'
import mergeDescriptors from '../utils/multi-merge-descriptors'

/**
 * Service container mixin
 */
export default {
  inject: {
    $services: SERVICES_PROP,
    // todo works only in Vue 2.5.x
    // $services: {from: SERVICES_PROP, default: Object.create(null)},
  },
  provide () {
    return {
      [SERVICES_PROP]: this.getServices(),
    }
  },
  methods: {
    /**
     * @returns {Object}
     * @protected
     */
    getServices () {
      return mergeDescriptors({}, this.$services || {})
    },
  },
  beforeCreate () {
    let source = this.$parent
    while (source) {
      if (source._provided && SERVICES_PROP in source._provided) {
        break
      }
      source = source.$parent
    }
    if (!source || !(SERVICES_PROP in source._provided)) {
      delete this.$options.inject.$services
    }
  },
}
