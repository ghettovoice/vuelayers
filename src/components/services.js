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
  },
  beforeCreate () {
    // bloody patch to suppress Vue warning about not provided
    // $services key for the root ol-cmp instance
    let source = this

    while (source) {
      if (source._provided && SERVICES_PROP in source._provided) {
        break
      }
      source = source.$parent
    }

    if (!source) {
      if (!this._provided) {
        this._provided = {}
      }

      this._provided[SERVICES_PROP] = undefined
    }
  }
}
