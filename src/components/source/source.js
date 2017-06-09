import { VM_PROP } from '../../consts'
import mergeDescriptors from '../../utils/multi-merge-descriptors'
import cmp from '../virt-cmp'
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
   * @return {void}
   * @protected
   */
  init () {
    /**
     * @type {ol.source.Source}
     * @protected
     */
    this._source = this.createSource()
    this._source[VM_PROP] = this
  },
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
  deinit () {
    this._source = undefined
  },
  /**
   * @return {void}
   * @private
   */
  defineAccessors () {
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
  },
  /**
   * @return {Object}
   * @protected
   */
  getServices () {
    return mergeDescriptors(this::cmp.methods.getServices(), {
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
  mixins: [cmp],
  props,
  methods,
  watch,
  stubVNode: {
    empty () {
      return this.$options.name
    }
  }
}
