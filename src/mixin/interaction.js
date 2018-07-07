import uuid from 'uuid/v4'
import mergeDescriptors from '../util/multi-merge-descriptors'
import cmp from './ol-virt-cmp'
import useMapCmp from './use-map-cmp'

const props = {
  id: {
    type: [String, Number],
    default: () => uuid(),
  },
  active: {
    type: Boolean,
    default: true,
  },
  /**
   * Priority of interactions in the event handling stream.
   * The higher the value, the sooner it will handle map event.
   * @type {number}
   */
  priority: {
    type: Number,
    default: 0,
  },
}

const methods = {
  /**
   * @return {Promise<Interaction>}
   * @protected
   */
  async createOlObject () {
    const interaction = await this.createInteraction()
    interaction.setActive(this.active)
    interaction.setProperties({
      id: this.id,
      priority: this.priority,
    })

    return interaction
  },
  /**
   * @return {Interaction|Promise<Interaction>}
   * @protected
   * @abstract
   */
  createInteraction () {
    throw new Error('Not implemented method')
  },
  /**
   * @returns {Object}
   * @protected
   */
  getServices () {
    const vm = this

    return mergeDescriptors(this::cmp.methods.getServices(), {
      get interaction () { return vm.$interaction },
    })
  },
  /**
   * @return {Promise} Resolves when initialization completes
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
  mount () {
    this.$interactionsContainer && this.$interactionsContainer.addInteraction(this)
    this.subscribeAll()
  },
  /**
   * @return {void}
   * @protected
   */
  unmount () {
    this.unsubscribeAll()
    this.$interactionsContainer && this.$interactionsContainer.removeInteraction(this)
  },
  /**
   * @return {Promise}
   */
  refresh () {
    return this::cmp.methods.refresh()
  },
}

const watch = {
  active (value) {
    if (this.$interaction && value !== this.$interaction.getActive()) {
      this.$interaction.setActive(value)
    }
  },
  priority (value) {
    if (!this.$interactionsContainer) return

    this.$interaction.set('priority', value)
    this.$interactionsContainer.sortInteractions()
  },
}

export default {
  mixins: [cmp, useMapCmp],
  props,
  methods,
  watch,
  stubVNode: {
    empty () {
      return this.$options.name
    },
  },
  created () {
    Object.defineProperties(this, {
      /**
       * @type {Interaction|undefined}
       */
      $interaction: {
        enumerable: true,
        get: () => this.$olObject,
      },
      $map: {
        enumerable: true,
        get: () => this.$services && this.$services.map,
      },
      $view: {
        enumerable: true,
        get: () => this.$services && this.$services.view,
      },
      $interactionsContainer: {
        enumerable: true,
        get: () => this.$services && this.$services.interactionsContainer,
      },
    })
  },
}
