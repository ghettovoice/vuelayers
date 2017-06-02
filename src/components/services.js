/**
 * Service container mixin
 * @module components/services
 */
import { SERVICES_KEY } from '../consts'
import mergeDescriptors from '../utils/multi-merge-descriptors'

export default {
  inject: {
    services: SERVICES_KEY
  },
  provide () {
    return {
      [SERVICES_KEY]: this.getServices()
    }
  },
  methods: {
    /**
     * @returns {Object}
     * @protected
     */
    getServices () {
      return mergeDescriptors({}, this.services || {})
    }
  }
}
