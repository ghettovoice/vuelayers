import debounce from 'debounce-promise'
import { skipWhile } from 'rxjs/operators'
import {
  EPSG_3857,
  getInteractionId,
  getInteractionPriority,
  initializeInteraction,
  setInteractionId,
  setInteractionPriority,
} from '../ol-ext'
import { fromOlChangeEvent as obsFromOlChangeEvent } from '../rx-ext'
import { addPrefix, assert, isEqual, mergeDescriptors, pick, sequential } from '../utils'
import olCmp, { FRAME_TIME } from './ol-cmp'
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
    }
  },
  computed: {
    currentActive () {
      if (this.rev && this.$interaction) {
        return this.getActiveInternal()
      }

      return this.active
    },
    currentPriority () {
      if (this.rev && this.$interaction) {
        return this.getPriorityInternal()
      }

      return this.priority
    },
  },
  watch: {
    active: /*#__PURE__*/sequential(async function (value) {
      await this.setActive(value)
    }),
    currentActive: /*#__PURE__*/debounce(function (value) {
      if (value === this.active) return

      this.$emit('update:active', value)
    }, FRAME_TIME),
    priority: /*#__PURE__*/sequential(async function (value) {
      await this.setPriority(value)
    }),
    currentPriority: /*#__PURE__*/debounce(function (value) {
      if (value === this.priority) return

      this.$emit('update:priority', value)
    }, FRAME_TIME),
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
      const interaction = initializeInteraction(
        await this.createInteraction(),
        this.currentId,
        this.currentPriority,
      )
      interaction.setActive(this.active)

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
    .../*#__PURE__*/pick(olCmp.methods, [
      'init',
      'deinit',
      'beforeMount',
      'refresh',
      'scheduleRefresh',
      'recreate',
      'scheduleRecreate',
      'remount',
      'scheduleRemount',
      'resolveOlObject',
    ]),
    .../*#__PURE__*/pick(waitForMap.methods, [
      'beforeInit',
    ]),
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
      assert(id != null && id !== '', 'Invalid interaction id')

      if (id === this.getIdInternal()) return

      setInteractionId(this.$interaction, id)
    },
    /**
     * @returns {Promise<boolean>}
     */
    async getActive () {
      await this.resolveInteraction()

      return this.getActiveInternal()
    },
    /**
     * @return {boolean}
     * @protected
     */
    getActiveInternal () {
      return this.$interaction.getActive()
    },
    /**
     * @param {boolean} active
     * @returns {Promise<void>}
     */
    async setActive (active) {
      if (active === await this.getActive()) return

      (await this.resolveInteraction()).setActive(active)
    },
    /**
     * @returns {Promise<number>}
     */
    async getPriority () {
      await this.resolveInteraction()

      return this.getPriorityInternal()
    },
    getPriorityInternal () {
      return getInteractionPriority(this.$interaction)
    },
    /**
     * @param {number} priority
     * @returns {Promise<void>}
     */
    async setPriority (priority) {
      if (priority === await this.getPriority()) return

      setInteractionPriority(await this.resolveInteraction(), priority)
      // eslint-disable-next-line no-unused-expressions
      this.$interactionsContainer?.sortInteractions()
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
  const prefixKey = addPrefix('current')
  const propChanges = obsFromOlChangeEvent(this.$interaction, [
    'id',
    'active',
    'priority',
  ], true, evt => ({
    ...evt,
    compareWith: this[prefixKey(evt.prop)],
  })).pipe(
    skipWhile(({ compareWith, value }) => isEqual(value, compareWith)),
  )
  this.subscribeTo(propChanges, () => {
    ++this.rev
  })
}
