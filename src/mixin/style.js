import { map as mapObs } from 'rxjs/operators'
import { getStyleId, initializeStyle, setStyleId } from '../ol-ext'
import { fromVueEvent as obsFromVueEvent } from '../rx-ext'
import { assert } from '../util/assert'
import { hasProp, pick } from '../util/minilo'
import mergeDescriptors from '../util/multi-merge-descriptors'
import waitFor from '../util/wait-for'
import olCmp, { OlObjectEvent } from './ol-cmp'
import stubVNode from './stub-vnode'

/**
 * Basic style mixin.
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
  created () {
    this::defineServices()
  },
  methods: {
    /**
     * @returns {Promise<void>}
     * @protected
     */
    async beforeInit () {
      try {
        await waitFor(
          () => this.$mapVm != null,
          obsFromVueEvent(this.$eventBus, [
            OlObjectEvent.CREATE_ERROR,
          ]).pipe(
            mapObs(([vm]) => hasProp(vm, '$map') && this.$vq.closest(vm)),
          ),
          1000,
        )

        return this::olCmp.methods.beforeInit()
      } catch (err) {
        err.message = 'Wait for $mapVm injection: ' + err.message
        throw err
      }
    },
    /**
     * @return {OlStyle|Promise<OlStyle>}
     * @protected
     */
    async createOlObject () {
      return initializeStyle(await this.createStyle(), this.currentId)
    },
    /**
     * @return {OlStyle|Promise<OlStyle>}
     * @protected
     * @abstract
     */
    createStyle () {
      throw new Error('Not implemented method: createStyle')
    },
    /**
     * @return {Promise<void>}
     */
    async remount () {
      await this.refresh()
      await this::olCmp.methods.remount()

      if (this.$mapVm) {
        await this.$mapVm.render()
      }
    },
    /**
     * @return {Object}
     * @protected
     */
    getServices () {
      const vm = this

      return mergeDescriptors(
        this::olCmp.methods.getServices(),
        {
          get styleVm () { return vm },
        },
      )
    },
    /**
     * @return {Promise<OlStyle>}
     */
    resolveStyle: olCmp.methods.resolveOlObject,
    ...pick(olCmp.methods, [
      'init',
      'deinit',
      'beforeMount',
      'mount',
      'unmount',
      'refresh',
      'scheduleRefresh',
      'scheduleRemount',
      'recreate',
      'scheduleRecreate',
      'subscribeAll',
      'resolveOlObject',
    ]),
    /**
     * @returns {string|number}
     */
    getIdSync () {
      return getStyleId(this.$style)
    },
    /**
     * @param {string|number} id
     * @returns {void}
     */
    setIdSync (id) {
      assert(id != null && id !== '', 'Invalid style id')

      if (id === this.getIdSync()) return

      setStyleId(this.$style, id)
    },
  },
}

function defineServices () {
  Object.defineProperties(this, {
    /**
     * @type {OlStyle|undefined}
     */
    $style: {
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
    $styleContainer: {
      enumerable: true,
      get: () => this.$services?.styleContainer,
    },
  })
}
