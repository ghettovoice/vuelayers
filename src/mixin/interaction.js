import uuid from 'uuid/v4'
import { initializeInteraction, setInteractionId, setInteractionPriority } from '../ol-ext'
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
   * @return {Promise<module:ol/interaction/Interaction~Interaction>}
   * @protected
   */
  async createOlObject () {
    const interaction = await this.createInteraction()

    initializeInteraction(interaction, this.id, this.priority)
    interaction.setActive(this.active)

    return interaction
  },
  /**
   * @return {module:ol/interaction/Interaction~Interaction|Promise<module:ol/interaction/Interaction~Interaction>}
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
  id (value) {
    if (!this.$interaction) return

    setInteractionId(this.$interaction, value)
  },
  active (value) {
    if (this.$interaction && value !== this.$interaction.getActive()) {
      this.$interaction.setActive(value)
    }
  },
  priority (value) {
    if (!this.$interactionsContainer) return

    setInteractionPriority(this.$interaction, value)
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
       * @type {module:ol/interaction/Interaction~Interaction|undefined}
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
