import {
  getInteractionId,
  getInteractionPriority,
  initializeInteraction,
  setInteractionId,
  setInteractionPriority,
} from '../ol-ext'
import { isEqual } from '../util/minilo'
import mergeDescriptors from '../util/multi-merge-descriptors'
import cmp from './ol-virt-cmp'
import useMapCmp from './use-map-cmp'

export default {
  mixins: [cmp, useMapCmp],
  props: {
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
  },
  methods: {
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
    /**
     * @return {Promise}
     */
    recreate () {
      return this::cmp.methods.recreate()
    },
    /**
     * @return {Promise}
     */
    remount () {
      return this::cmp.methods.remount()
    },
    /**
     * @protected
     */
    subscribeAll () {
    },
  },
  watch: {
    id (value) {
      if (!this.$interaction || isEqual(value, getInteractionId(this.$interaction))) {
        return
      }

      setInteractionId(this.$interaction, value)
    },
    active (value) {
      if (!this.$interaction || value === this.$interaction.getActive()) {
        return
      }

      this.$interaction.setActive(value)
    },
    priority (value) {
      if (
        !this.$interaction ||
        !this.$interactionsContainer ||
        value === getInteractionPriority(this.$interaction)
      ) {
        return
      }

      setInteractionPriority(this.$interaction, value)
      // todo replace with event
      this.$interactionsContainer.sortInteractions()
    },
  },
  stubVNode: {
    empty () {
      return this.vmId
    },
  },
  created () {
    this::defineServices()
  },
}

function defineServices () {
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
}
