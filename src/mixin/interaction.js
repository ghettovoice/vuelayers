import {
  getInteractionId,
  getInteractionPriority,
  initializeInteraction,
  setInteractionId,
  setInteractionPriority,
} from '../ol-ext'
import { obsFromOlChangeEvent } from '../rx-ext'
import { pick, waitFor } from '../util/minilo'
import mergeDescriptors from '../util/multi-merge-descriptors'
import olCmp from './ol-cmp'
import stubVNode from './stub-vnode'

/**
 * Base interaction mixin.
 */
export default {
  mixins: [
    stubVNode,
    olCmp,
  ],
  stubVNode: {
    empty () {
      return this.vmId
    },
  },
  props: {
    /**
     * @type {boolean}
     */
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
    async id (value) {
      await this.setId(value)
    },
    async active (value) {
      await this.setActive(value)
    },
    async priority (value) {
      await this.setPriority(value)
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
      const interaction = initializeInteraction(await this.createInteraction(), this.id, this.priority)
      interaction.setActive(this.active)

      return interaction
    },
    /**
     * @return {module:ol/interaction/Interaction~Interaction|Promise<module:ol/interaction/Interaction~Interaction>}
     * @protected
     * @abstract
     */
    createInteraction () {
      throw new Error('Not implemented method: createInteraction')
    },
    /**
     * @returns {Promise<string|number>}
     */
    async getId () {
      return getInteractionId(await this.resolveInteraction())
    },
    /**
     * @param {string|number} id
     * @returns {Promise<void>}
     */
    async setId (id) {
      const interaction = await this.resolveInteraction()

      if (id === getInteractionId(interaction)) return

      setInteractionId(interaction, id)
    },
    /**
     * @returns {Promise<boolean>}
     */
    async getActive () {
      return (await this.resolveInteraction()).getActive()
    },
    /**
     * @param {boolean} active
     * @returns {Promise<void>}
     */
    async setActive (active) {
      const interaction = await this.resolveInteraction()

      if (active === interaction.getActive()) return

      interaction.setActive(active)
    },
    /**
     * @returns {Promise<number>}
     */
    async getPriority () {
      return getInteractionPriority(await this.resolveInteraction())
    },
    /**
     * @param {number} priority
     * @returns {Promise<void>}
     */
    async setPriority (priority) {
      const interaction = await this.resolveInteraction()

      if (priority === getInteractionPriority(interaction)) return

      setInteractionPriority(interaction, priority)
      // eslint-disable-next-line no-unused-expressions
      this.$interactionsContainer?.sortInteractions()
    },
    /**
     * @returns {Promise<void>}
     * @protected
     */
    async init () {
      await waitFor(() => this.$mapVm != null)

      return this::olCmp.methods.init()
    },
    /**
     * @return {void}
     * @protected
     */
    async mount () {
      if (this.$interactionsContainer) {
        await this.$interactionsContainer.addInteraction(this)
      }

      return this::olCmp.methods.mount()
    },
    /**
     * @return {void}
     * @protected
     */
    async unmount () {
      if (this.$interactionsContainer) {
        await this.$interactionsContainer.removeInteraction(this)
      }

      return this::olCmp.methods.unmount()
    },
    /**
     * @returns {Object}
     * @protected
     */
    getServices () {
      const vm = this

      return mergeDescriptors(
        this::olCmp.methods.getServices(),
        {
          get interactionVm () { return vm },
        },
      )
    },
    /**
     * @returns {Promise<void>}
     */
    async subscribeAll () {
      await Promise.all([
        this::olCmp.methods.subscribeAll(),
        this::subscribeToInteractionEvents(),
      ])
    },
    /**
     * @return {Promise<module:ol/interaction/Interaction~Interaction>}
     */
    resolveInteraction: olCmp.methods.resolveOlObject,
    ...pick(olCmp.methods, [
      'deinit',
      'refresh',
      'scheduleRefresh',
      'recreate',
      'scheduleRecreate',
      'remount',
      'scheduleRemount',
      'resolveOlObject',
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
    /**
     * @type {Object|undefined}
     */
    $mapVm: {
      enumerable: true,
      get: () => this.$services?.mapVm,
    },
    /**
     * @type {module:ol/View~View|undefined}
     */
    $view: {
      enumerable: true,
      get: () => this.$mapVm?.$view,
    },
    /**
     * @type {Object|undefined}
     */
    $interactionsContainer: {
      enumerable: true,
      get: () => this.$services?.interactionsContainer,
    },
  })
}

async function subscribeToInteractionEvents () {
  const interaction = await this.resolveInteraction()

  const changes = obsFromOlChangeEvent(interaction, [
    'id',
    'active',
    'priority',
  ], true, 1000 / 60)

  this.subscribeTo(changes, ({ prop, value }) => {
    ++this.rev

    this.$nextTick(() => {
      this.$emit(`update:${prop}`, value)
    })
  })
}
