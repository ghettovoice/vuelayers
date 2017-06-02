import { VM_PROP } from '../../consts'
import mergeDescriptors from '../../utils/multi-merge-descriptors'
import rxSubs from '../rx-subs'
import stubVNode from '../stub-vnode'
import services from '../services'
import { assertHasSource } from '../../utils/assert'

// todo extract attributions into separate component
const props = {
  attributions: [String, Array],
  logo: String,
  projection: String,
  wrapX: Boolean
}

const methods = {
  /**
   * @return {ol.source.Source}
   */
  getSource () {
    return this._source
  },
  /**
   * @return {void}
   */
  refresh () {
    assertHasSource(this)
    this.source.changed()
  },
  // protected & private
  /**
   * @return {ol.source.Source}
   * @protected
   * @abstract
   */
  createSource () {
    throw new Error('Not implemented method')
  },
  /**
   * @return {void}
   * @protected
   */
  initialize () {
    /**
     * @type {ol.source.Source}
     * @protected
     */
    this._source = this.createSource()
    this._source.set(VM_PROP, this)
    this::defineAccessors()
  },
  /**
   * @return {Object}
   * @protected
   */
  getServices () {
    return mergeDescriptors(this::services.methods.getServices(), {
      source: this
    })
  },
  /**
   * @return {void}
   * @protected
   */
  mount () {
    this.$parent.setSource(this)
    this.subscribeAll()
  },
  /**
   * @return {void}
   * @protected
   */
  unmount () {
    this.unsubscribeAll()
    this.$parent.setSource(undefined)
  }
}

const watch = {
  attributions (value) {
    assertHasSource(this)
    this.source.setAttributions(value)
  }
}

export default {
  mixins: [rxSubs, stubVNode, services],
  props,
  methods,
  watch,
  stubVNode: {
    empty () {
      return this.$options.name
    }
  },
  created () {
    this.initialize()
  },
  mounted () {
    this.mount()
  },
  destroyed () {
    this.unmount()
    this._source = undefined
  }
}

/**
 * @return {void}
 * @private
 */
function defineAccessors () {
  Object.defineProperties(this, {
    source: {
      enumerable: true,
      get: this.getSource
    },
    map: {
      enumerable: true,
      get: () => this.services && this.services.map
    }
  })
}
