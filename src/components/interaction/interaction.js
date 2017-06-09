import { VM_PROP } from '../../consts'
import mergeDescriptors from '../../utils/multi-merge-descriptors'
import cmp from '../virt-cmp'
import { assertHasInteraction } from '../../utils/assert'

const props = {}

const methods = {
  /**
   * @return {void}
   * @protected
   */
  init () {
    /**
     * @type {ol.interaction.Interaction}
     * @protected
     */
    this._interaction = this.createInteraction()
    this._interaction[VM_PROP] = this
  },
  /**
   * @return {ol.interaction.Interaction}
   * @protected
   * @abstract
   */
  createInteraction () {
    throw new Error('Not implemented method')
  },
  /**
   * @return {void}
   * @protected
   */
  deinit () {
    this._interaction = undefined
  },
  /**
   * @return {void}
   * @protected
   */
  defineAccessors () {
    Object.defineProperties(this, {
      interaction: {
        enumerable: true,
        get: this.getInteraction
      },
      map: {
        enumerable: true,
        get: () => this.services && this.services.map
      }
    })
  },
  /**
   * @return {ol.interaction.Interaction|undefined}
   */
  getInteraction () {
    return this._interaction
  },
  /**
   * @returns {Object}
   * @protected
   */
  getServices () {
    return mergeDescriptors(this::cmp.methods.getServices(), {
      interaction: this
    })
  },
  /**
   * @return {void}
   * @protected
   */
  mount () {
    this.$parent.addInteraction(this)
    this.subscribeAll()
  },
  /**
   * @return {void}
   * @protected
   */
  unmount () {
    this.unsubscribeAll()
    this.$parent.removeInteraction(this)
  },
  /**
   * @return {void}
   */
  refresh () {
    assertHasInteraction(this)
    this.interaction.changed()
  }
}

export default {
  mixins: [cmp],
  props,
  methods,
  stubVNode: {
    empty () {
      return this.$options.name
    }
  }
}
