import mergeDescriptors from '../../utils/multi-merge-descriptors'
import cmp from '../ol-virt-cmp'
import * as assert from '../../utils/assert'

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
   * @return {ol.source.Source|Promise<ol.source.Source>}
   * @protected
   */
  createOlObject () {
    return this.createSource()
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
   * @return {Promise}
   * @protected
   */
  init () {
    return this::cmp.methods.init()
  },
  /**
   * @return {void}
   * @protected
   */
  deinit () {
    this::cmp.methods.deinit()
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
    return this.olObject
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
    assert.hasSource(this)
    this.source.changed()
  }
}

const watch = {
  attributions (value) {
    assert.hasSource(this)
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
