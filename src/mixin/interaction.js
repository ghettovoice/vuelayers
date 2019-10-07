import {
  getInteractionId,
  getInteractionPriority,
  initializeInteraction,
  setInteractionId,
  setInteractionPriority,
} from '../ol-ext'
import { isEqual, pick } from '../util/minilo'
import mergeDescriptors from '../util/multi-merge-descriptors'
import cmp from './ol-cmp'
import stubVNode from './stub-vnode'
import waitForMap from './wait-for-map'

export default {
  mixins: [
    stubVNode,
    cmp,
    waitForMap,
  ],
  stubVNode: {
    empty () {
      return this.vmId
    },
  },
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
  created () {
    this::defineServices()
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
    // todo add methods
    /**
     * @return {void}
     * @protected
     */
    async mount () {
      if (this.$interactionsContainer) {
        await this.$interactionsContainer.addInteraction(this)
      }

      return this::cmp.methods.mount()
    },
    /**
     * @return {void}
     * @protected
     */
    async unmount () {
      if (this.$interactionsContainer) {
        await this.$interactionsContainer.removeInteraction(this)
      }

      return this::cmp.methods.unmount()
    },
    /**
     * @returns {Object}
     * @protected
     */
    getServices () {
      const vm = this

      return mergeDescriptors(
        this::cmp.methods.getServices(),
        {
          get interactionVm () { return vm },
        },
      )
    },
    resolveInteraction: cmp.methods.resolveOlObject,
    ...pick(cmp.methods, [
      'init',
      'deinit',
      'refresh',
      'scheduleRefresh',
      'recreate',
      'scheduleRecreate',
      'remount',
      'scheduleRemount',
      'subscribeAll',
    ]),
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
