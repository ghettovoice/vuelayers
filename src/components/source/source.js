import { VM_PROP } from '../../consts'
import mergeDescriptors from '../../utils/multi-merge-descriptors'
import rxSubs from '../rx-subs'
import stubVNode from '../stub-vnode'
import services from '../services'
import { assertHasSource } from '../../utils/assert'

const props = {
  attributions: [String, Array],
  logo: String,
  projection: String,
  wrapX: {
    type: Boolean,
    default: true
  }
}

const methods = {
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
    this._source[VM_PROP] = this
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
   * @return {ol.source.Source|undefined}
   */
  getSource () {
    return this._source
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
  },
  /**
   * @return {void}
   */
  refresh () {
    assertHasSource(this)
    this.source.changed()
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
