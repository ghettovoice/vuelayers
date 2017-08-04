/**
 * Basic style mixin.
 */
import mergeDescriptors from '../../utils/multi-merge-descriptors'
import cmp from '../ol-virt-cmp'

const methods = {
  /**
   * @return {OlStyle|Promise<OlStyle>}
   * @protected
   */
  createOlObject () {
    return this.createStyle()
  },
  /**
   * @return {OlStyle|Promise<OlStyle>}
   * @protected
   * @abstract
   */
  createStyle () {
    throw new Error('Not implemented method')
  },
  /**
   * @return {Promise}
   * @protected
   */
  init () {
    return this::cmp.methods.init()
  },
  /**
   * @return {void|Promise<void>}
   * @protected
   */
  deinit () {
    return this::cmp.methods.deinit()
  },
  /**
   * @return {void}
   * @protected
   */
  defineAccessors () {
    Object.defineProperties(this, {
      $style: {
        enumerable: true,
        get: this.getStyle
      },
      $map: {
        enumerable: true,
        get: () => this.$services && this.$services.map
      },
      $view: {
        enumerable: true,
        get: () => this.$services && this.$services.view
      }
    })
  },
  /**
   * Inner ol style instance getter
   * @return {OlStyle|undefined}
   */
  getStyle () {
    return this.$olObject
  },
  /**
   * @return {Object}
   * @protected
   */
  getServices () {
    const vm = this

    return mergeDescriptors(this::cmp.methods.getServices(), {
      get style () { return vm.$style }
    })
  },
  /**
   * @return {Promise}
   */
  refresh () {
    return Promise.resolve(this.unmount())
      .then(this.mount)
  }
}

export default {
  mixins: [cmp],
  methods,
  stubVNode: {
    empty () {
      return this.$options.name
    }
  }
}
