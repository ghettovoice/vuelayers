/**
 * Service container mixin
 * @module components/services
 */
import { SERVICES_PROP } from '../consts'
import mergeDescriptors from '../utils/multi-merge-descriptors'

export default {
  inject: {
    $services: SERVICES_PROP
  },
  provide () {
    return {
      [SERVICES_PROP]: this.getServices()
    }
  },
  methods: {
    /**
     * @returns {Object}
     * @protected
     */
    getServices () {
      return mergeDescriptors({}, this.$services || {})
    }
  }
}
