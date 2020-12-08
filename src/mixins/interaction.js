import {
  EPSG_3857,
  getInteractionId,
  getInteractionPriority,
  initializeInteraction,
  setInteractionId,
  setInteractionPriority,
} from '../ol-ext'
import { fromOlChangeEvent as obsFromOlChangeEvent } from '../rx-ext'
import { addPrefix, assert, coalesce, isNumber, mergeDescriptors } from '../utils'
import olCmp, { makeChangeOrRecreateWatchers } from './ol-cmp'
import projTransforms from './proj-transforms'
import stubVNode from './stub-vnode'
import waitForMap from './wait-for-map'

/**
 * Base interaction mixin.
 */
export default {
  mixins: [
    stubVNode,
    projTransforms,
    olCmp,
    waitForMap,
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
  data () {
    return {
      viewProjection: EPSG_3857,
      dataProjection: EPSG_3857,
      currentActive: this.active,
      currentPriority: this.priority,
      interacting: false,
    }
  },
  watch: {
    rev () {
      if (!this.$interaction) return

      if (this.currentActive !== this.$interaction.getActive()) {
        this.currentActive = this.$interaction.getActive()
      }
      if (this.currentPriority !== getInteractionPriority(this.$interaction)) {
        this.currentPriority = getInteractionPriority(this.$interaction)
      }
    },
    .../*#__PURE__*/makeChangeOrRecreateWatchers([
      'active',
      'currentActive',
      'priority',
      'currentPriority',
    ]),
  },
  created () {
    this::defineServices()
  },
  methods: {
    /**
     * @return {Promise<void>}
     * @protected
     */
    async beforeInit () {
      await Promise.all([
        this::olCmp.methods.beforeInit(),
        this::waitForMap.methods.beforeInit(),
      ])
    },
    /**
     * @return {Promise<module:ol/interaction/Interaction~Interaction>}
     * @protected
     */
    async createOlObject () {
      const interaction = initializeInteraction(
        await this.createInteraction(),
        this.currentId,
        this.currentPriority,
      )
      interaction.setActive(this.currentActive)
      interaction.set('interacting', this.interacting)

      return interaction
    },
    /**
     * @return {module:ol/interaction/Interaction~Interaction|Promise<module:ol/interaction/Interaction~Interaction>}
     * @protected
     * @abstract
     */
    createInteraction () {
      throw new Error(`${this.vmName} not implemented method: createInteraction()`)
    },
    /**
     * @return {Promise<void>}
     * @protected
     */
    async mount () {
      this.$interactionsContainer?.addInteraction(this)

      return this::olCmp.methods.mount()
    },
    /**
     * @return {Promise<void>}
     * @protected
     */
    async unmount () {
      this.$interactionsContainer?.removeInteraction(this)

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
     * @returns {void}
     */
    subscribeAll () {
      this::olCmp.methods.subscribeAll()
      this::subscribeToInteractionEvents()
    },
    /**
     * @return {Promise<module:ol/interaction/Interaction~Interaction>}
     */
    resolveInteraction: olCmp.methods.resolveOlObject,
    /**
     * @returns {string|number}
     */
    getIdInternal () {
      return getInteractionId(this.$interaction)
    },
    /**
     * @param {string|number} id
     * @returns {void}
     */
    setIdInternal (id) {
      if (id === this.getIdInternal()) return

      setInteractionId(this.$interaction, id)
    },
    /**
     * @returns {boolean}
     */
    getActive () {
      return coalesce(this.$interaction?.getActive(), this.currentActive)
    },
    /**
     * @param {boolean} active
     */
    setActive (active) {
      active = !!active

      if (active !== this.currentActive) {
        this.currentActive = active
      }
      if (this.$interaction && active !== this.$interaction.getActive()) {
        this.$interaction.setActive(active)
      }
    },
    /**
     * @returns {number}
     */
    getPriority () {
      return coalesce(this.$interaction && getInteractionPriority(this.$interaction), this.currentPriority)
    },
    /**
     * @param {number} priority
     */
    setPriority (priority) {
      assert(isNumber(priority), 'Invalid priority')

      if (priority !== this.currentPriority) {
        this.currentPriority = priority
      }
      if (this.$interaction && priority !== getInteractionPriority(this.$interaction)) {
        setInteractionPriority(this.$interaction, priority)
      }
      // eslint-disable-next-line no-unused-expressions
      this.$interactionsContainer?.sortInteractions()
    },
    /**
     * @return {module:ol/Map~Map|undefined}
     */
    getMap () {
      return coalesce(this.$interaction?.getMap(), this.$map)
    },
    // /**
    //  * @param {module:ol/Map~Map} map
    //  */
    // setMap (map) {
    //   this.$interaction?.setMap(map)
    // },
    setInteracting (flag) {
      flag = !!flag

      if (flag !== this.interacting) {
        this.interacting = flag
      }
      if (this.$interaction && flag !== this.$interaction.get('interacting')) {
        this.$interaction.set('interacting', flag)
      }
    },
    isInteracting () {
      return coalesce(this.$interaction?.get('interacting'), this.interacting)
    },
    /**
     * @param {boolean} value
     * @protected
     */
    activeChanged (value) {
      this.setActive(value)
    },
    /**
     * @param {boolean} value
     * @protected
     */
    currentActiveChanged (value) {
      if (value === this.active) return

      this.$emit('update:active', value)
    },
    /**
     * @param {number} value
     * @protected
     */
    priorityChanged (value) {
      this.setPriority(value)
    },
    /**
     * @param {number} value
     * @protected
     */
    currentPriorityChanged (value) {
      if (value === this.priority) return

      this.$emit('update:priority', value)
    },
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
     * @type {Object|undefined}
     */
    $viewVm: {
      enumerable: true,
      get: () => this.$services?.viewVm,
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
  const setterKey = addPrefix('current')
  const propChanges = obsFromOlChangeEvent(this.$interaction, [
    'active',
    'priority',
  ], true, evt => ({
    ...evt,
    setter: this[setterKey(evt.prop)],
  }))
  this.subscribeTo(propChanges, ({ setter, value }) => setter(value))
}
