import rxSubs from '../rx-subs'
import stubVNode from '../stub-vnode'
import { assertHasInteraction, assertHasMap } from '../../utils/assert'
import { SERVICE_CONTAINER_KEY } from '../../consts'

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
    this._interaction.set('vm', this)
    this::defineAccessors()
  },
  /**
   * @return {void}
   * @protected
   */
  mount () {
    assertHasMap(this)
    assertHasInteraction(this)

    this.map.addInteraction(this.interaction)
    this.subscribeAll()
  },
  /**
   * @return {void}
   * @protected
   */
  unmount () {
    assertHasMap(this)
    assertHasInteraction(this)

    this.unsubscribeAll()
    this.map.removeInteraction(this.interaction)
  }
}

export default {
  mixins: [rxSubs, stubVNode],
  props,
  methods,
  stubVNode: {
    empty () {
      return this.$options.name
    }
  },
  inject: {
    serviceContainer: SERVICE_CONTAINER_KEY
  },
  provide () {
    const vm = this

    return {
      [SERVICE_CONTAINER_KEY]: {
        get interaction () { return vm.interaction },
        get view () { return vm.view },
        get map () { return vm.map }
      }
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
      get: () => this.serviceContainer.map
    },
    view: {
      enumerable: true,
      get: () => this.serviceContainer.view
    }
  })
}
