import { VM_PROP } from '../../consts'
import mergeDescriptors from '../../utils/multi-merge-descriptors'
import rxSubs from '../rx-subs'
import stubVNode from '../stub-vnode'
import services from '../services'
import { assertHasInteraction } from '../../utils/assert'

const props = {}

const methods = {
  /**
   * @return {ol.interaction.Interaction|undefined}
   */
  getInteraction () {
    return this._interaction
  },
  /**
   * @return {void}
   */
  refresh () {
    assertHasInteraction(this)
    this.interaction.changed()
  },
  // protected & private
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
  initialize () {
    /**
     * @type {ol.interaction.Interaction}
     * @protected
     */
    this._interaction = this.createInteraction()
    this._interaction.set(VM_PROP, this)
    this::defineAccessors()
  },
  /**
   * @returns {Object}
   * @protected
   */
  getServices () {
    return mergeDescriptors(this::services.methods.getServices(), {
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
  }
}

export default {
  mixins: [rxSubs, stubVNode, services],
  props,
  methods,
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
    this._interaction = undefined
  }
}

/**
 * @return {void}
 * @private
 */
function defineAccessors () {
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
}
